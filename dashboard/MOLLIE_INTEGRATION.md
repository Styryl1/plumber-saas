# Mollie Integration Patterns - Dutch Payment Processing

## 🎯 Overview
Complete Mollie payment integration for Dutch plumbing SaaS with iDEAL, credit cards, BTW compliance, and emergency payment flows.

## 💳 Payment Method Configuration

### **Mollie Client Setup**
```typescript
// src/lib/mollie-client.ts
import { createMollieClient } from '@mollie/api-client'

const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
  versionStrings: {
    'plumbing-saas': '1.0.0'
  }
})

// Dutch payment methods priority
export const DUTCH_PAYMENT_METHODS = [
  'ideal',        // Most popular in Netherlands
  'creditcard',   // International customers
  'banktransfer', // Business customers
  'sofort',       // German customers
  'bancontact',   // Belgian customers
] as const

export type PaymentMethod = typeof DUTCH_PAYMENT_METHODS[number]

// Emergency payment configuration
export const EMERGENCY_PAYMENT_CONFIG = {
  methods: ['ideal', 'creditcard'], // Fastest methods only
  expiresAt: 30, // 30 minutes for emergency payments
  description: 'Spoedgeval loodgieterswerk',
  locale: 'nl_NL'
}
```

### **Payment Creation with BTW**
```typescript
// src/lib/payment-service.ts
import { BTWCalculator } from './dutch-compliance'

export class PaymentService {
  // Create payment with Dutch BTW calculation
  static async createPayment({
    jobId,
    customerId,
    organizationId,
    amount,
    serviceType,
    isEmergency = false
  }: PaymentRequest) {
    // Get organization and customer details
    const org = await getOrganizationDB().organization.findUnique({
      where: { clerkId: organizationId }
    })
    
    const customer = await getOrganizationDB().customers.findUnique({
      where: { id: customerId }
    })
    
    if (!org || !customer) {
      throw new Error('Organization or customer not found')
    }
    
    // Calculate BTW
    const btwRate = BTWCalculator.getBTWRate(
      serviceType, 
      customer.type, 
      false // Not new construction
    )
    const btwCalculation = BTWCalculator.calculateBTW(amount, btwRate)
    
    // Create Mollie payment
    const payment = await mollieClient.payments.create({
      amount: {
        currency: 'EUR',
        value: btwCalculation.grossAmount.toFixed(2)
      },
      description: isEmergency 
        ? `Spoedgeval - ${org.name}` 
        : `Loodgieterswerk - ${org.name}`,
      
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?job=${jobId}`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mollie`,
      
      metadata: {
        organizationId,
        jobId,
        customerId,
        netAmount: btwCalculation.netAmount.toString(),
        btwRate: btwRate.toString(),
        btwAmount: btwCalculation.btwAmount.toString(),
        isEmergency: isEmergency.toString()
      },
      
      // Dutch-specific configuration
      locale: 'nl_NL',
      method: isEmergency ? EMERGENCY_PAYMENT_CONFIG.methods : DUTCH_PAYMENT_METHODS,
      
      // Emergency payments expire faster
      expiresAt: isEmergency 
        ? new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        : new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    })
    
    // Store payment in database
    await db.payment.create({
      data: {
        id: payment.id,
        organizationId,
        jobId,
        customerId,
        amount: btwCalculation.grossAmount,
        netAmount: btwCalculation.netAmount,
        btwRate,
        btwAmount: btwCalculation.btwAmount,
        currency: 'EUR',
        status: 'pending',
        molliePaymentId: payment.id,
        mollieStatus: payment.status,
        isEmergency,
        checkoutUrl: payment.getCheckoutUrl(),
        expiresAt: payment.expiresAt
      }
    })
    
    return {
      paymentId: payment.id,
      checkoutUrl: payment.getCheckoutUrl(),
      amount: btwCalculation,
      expiresAt: payment.expiresAt
    }
  }
  
  // Quick emergency payment flow
  static async createEmergencyPayment(emergencyDetails: EmergencyPaymentRequest) {
    const payment = await this.createPayment({
      ...emergencyDetails,
      isEmergency: true
    })
    
    // Send immediate SMS/WhatsApp with payment link
    await this.sendEmergencyPaymentLink(emergencyDetails.customerId, payment.checkoutUrl)
    
    return payment
  }
}
```

## 🔄 Webhook Processing

### **Mollie Webhook Handler**
```typescript
// src/app/api/webhooks/mollie/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { mollieClient } from '~/lib/mollie-client'
import { SecurityAuditSystem } from '~/lib/audit-system'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('mollie-signature')
    
    // Verify webhook signature (recommended for production)
    if (!verifyMollieSignature(body, signature)) {
      return new NextResponse('Invalid signature', { status: 401 })
    }
    
    const webhookData = JSON.parse(body)
    const paymentId = webhookData.id
    
    // Fetch payment details from Mollie
    const payment = await mollieClient.payments.get(paymentId)
    
    // Update payment status in database
    const updatedPayment = await db.payment.update({
      where: { molliePaymentId: paymentId },
      data: {
        mollieStatus: payment.status,
        status: mapMollieStatusToInternal(payment.status),
        paidAt: payment.paidAt ? new Date(payment.paidAt) : null,
        failedAt: payment.failedAt ? new Date(payment.failedAt) : null,
        canceledAt: payment.canceledAt ? new Date(payment.canceledAt) : null,
      }
    })
    
    // Handle payment status changes
    await handlePaymentStatusChange(updatedPayment, payment)
    
    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Mollie webhook error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

async function handlePaymentStatusChange(dbPayment: any, molliePayment: any) {
  switch (molliePayment.status) {
    case 'paid':
      await handleSuccessfulPayment(dbPayment, molliePayment)
      break
      
    case 'failed':
    case 'canceled':
    case 'expired':
      await handleFailedPayment(dbPayment, molliePayment)
      break
      
    case 'pending':
    case 'open':
      // No action needed, payment still in progress
      break
  }
}

async function handleSuccessfulPayment(dbPayment: any, molliePayment: any) {
  // Update job status
  await db.job.update({
    where: { id: dbPayment.jobId },
    data: {
      status: 'paid',
      paidAt: new Date(molliePayment.paidAt)
    }
  })
  
  // Generate and send invoice
  await generateInvoiceForPayment(dbPayment)
  
  // Send confirmation to customer
  await sendPaymentConfirmation(dbPayment.customerId, dbPayment)
  
  // Log successful payment
  await SecurityAuditSystem.logEvent({
    userId: 'system',
    organizationId: dbPayment.organizationId,
    action: 'PAYMENT_SUCCESSFUL',
    resource: 'payment',
    resourceId: dbPayment.id,
    metadata: {
      amount: dbPayment.amount,
      method: molliePayment.method,
      isEmergency: dbPayment.isEmergency
    },
    severity: 'low'
  })
}
```

### **Payment Status Management**
```typescript
// src/lib/payment-status.ts
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  REFUNDED = 'refunded'
}

export function mapMollieStatusToInternal(mollieStatus: string): PaymentStatus {
  switch (mollieStatus) {
    case 'open':
    case 'pending':
      return PaymentStatus.PENDING
    case 'paid':
      return PaymentStatus.PAID
    case 'failed':
      return PaymentStatus.FAILED
    case 'canceled':
      return PaymentStatus.CANCELED
    case 'expired':
      return PaymentStatus.EXPIRED
    default:
      return PaymentStatus.PENDING
  }
}

// Payment retry logic for failed payments
export class PaymentRetryService {
  static async retryFailedPayment(paymentId: string) {
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: { job: true, customer: true }
    })
    
    if (!payment || payment.status === PaymentStatus.PAID) {
      throw new Error('Payment cannot be retried')
    }
    
    // Create new payment with same details
    const newPayment = await PaymentService.createPayment({
      jobId: payment.jobId,
      customerId: payment.customerId,
      organizationId: payment.organizationId,
      amount: payment.netAmount,
      serviceType: payment.job.serviceType,
      isEmergency: payment.isEmergency
    })
    
    // Mark old payment as canceled
    await db.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.CANCELED }
    })
    
    return newPayment
  }
}
```

## 📱 Mobile Payment Optimization

### **Mobile-First Payment Flow**
```typescript
// src/components/payment/MobilePaymentFlow.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface MobilePaymentFlowProps {
  jobId: string
  amount: number
  isEmergency?: boolean
}

export function MobilePaymentFlow({ jobId, amount, isEmergency }: MobilePaymentFlowProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'creating' | 'redirecting' | 'processing'>('idle')
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const router = useRouter()
  
  const createPayment = async () => {
    setPaymentStatus('creating')
    
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          amount,
          isEmergency
        })
      })
      
      const { checkoutUrl } = await response.json()
      setPaymentUrl(checkoutUrl)
      setPaymentStatus('redirecting')
      
      // Redirect to Mollie checkout
      if (isEmergency) {
        // For emergency payments, open in same window
        window.location.href = checkoutUrl
      } else {
        // For regular payments, allow user to choose
        setTimeout(() => {
          window.location.href = checkoutUrl
        }, 2000)
      }
    } catch (error) {
      console.error('Payment creation failed:', error)
      setPaymentStatus('idle')
    }
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {isEmergency && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <i data-lucide="alert-triangle" className="w-5 h-5 text-red-600 mr-2"></i>
            <span className="text-sm font-medium text-red-900">Spoedgeval - Directe betaling vereist</span>
          </div>
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isEmergency ? 'Spoedgeval Betaling' : 'Betaling Afronden'}
        </h3>
        
        <div className="text-3xl font-bold text-emerald-600 mb-4">
          €{amount.toFixed(2)}
        </div>
        
        {paymentStatus === 'idle' && (
          <>
            <p className="text-gray-600 mb-6">
              {isEmergency 
                ? 'Betaal nu om de spoedservice te bevestigen'
                : 'Kies uw gewenste betaalmethode'}
            </p>
            
            <button
              onClick={createPayment}
              className={`w-full py-4 px-6 rounded-lg font-medium text-white ${
                isEmergency 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-emerald-600 hover:bg-emerald-700'
              } transition-colors`}
            >
              {isEmergency ? 'BETAAL NU' : 'Naar Betaling'}
            </button>
            
            {/* Payment method icons */}
            <div className="mt-4 flex justify-center space-x-4">
              <img src="/payment-icons/ideal.svg" alt="iDEAL" className="h-8" />
              <img src="/payment-icons/mastercard.svg" alt="Mastercard" className="h-8" />
              <img src="/payment-icons/visa.svg" alt="Visa" className="h-8" />
            </div>
          </>
        )}
        
        {paymentStatus === 'creating' && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-3 text-gray-600">Betaling voorbereiden...</span>
          </div>
        )}
        
        {paymentStatus === 'redirecting' && (
          <div className="text-center py-8">
            <div className="text-emerald-600 mb-4">
              <i data-lucide="check-circle" className="w-12 h-12 mx-auto"></i>
            </div>
            <p className="text-gray-600">Doorverwijzen naar beveiligde betaling...</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

## 🔒 Security & Compliance

### **PCI DSS Compliance**
```typescript
// src/lib/payment-security.ts
export class PaymentSecurity {
  // Never store sensitive payment data
  static validatePaymentData(paymentData: any) {
    const forbiddenFields = [
      'cardNumber',
      'cvv', 
      'cvc',
      'expiryDate',
      'pin',
      'iban', // Store encrypted or tokenized only
    ]
    
    forbiddenFields.forEach(field => {
      if (paymentData[field]) {
        throw new Error(`Forbidden field ${field} in payment data`)
      }
    })
  }
  
  // Secure payment reference generation
  static generatePaymentReference(organizationId: string, jobId: string): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    const orgCode = organizationId.substring(0, 6)
    
    return `PAY-${orgCode}-${timestamp}-${random}`.toUpperCase()
  }
  
  // Validate webhook signatures
  static verifyMollieSignature(body: string, signature: string | null): boolean {
    if (!signature || !process.env.MOLLIE_WEBHOOK_SECRET) {
      return false
    }
    
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', process.env.MOLLIE_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')
    
    return signature === expectedSignature
  }
}
```

### **Fraud Detection**
```typescript
// src/lib/fraud-detection.ts
export class FraudDetection {
  // Detect suspicious payment patterns
  static async assessPaymentRisk(paymentRequest: PaymentRequest): Promise<'low' | 'medium' | 'high'> {
    const riskFactors = []
    
    // Check payment frequency
    const recentPayments = await db.payment.count({
      where: {
        customerId: paymentRequest.customerId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })
    
    if (recentPayments > 3) {
      riskFactors.push('high_frequency_payments')
    }
    
    // Check amount patterns
    if (paymentRequest.amount > 1000 && paymentRequest.isEmergency) {
      riskFactors.push('high_emergency_amount')
    }
    
    // Check customer history
    const customerPayments = await db.payment.count({
      where: {
        customerId: paymentRequest.customerId,
        status: PaymentStatus.PAID
      }
    })
    
    if (customerPayments === 0 && paymentRequest.amount > 500) {
      riskFactors.push('new_customer_high_amount')
    }
    
    // Assess risk level
    if (riskFactors.length >= 2) return 'high'
    if (riskFactors.length === 1) return 'medium'
    return 'low'
  }
  
  // Apply risk-based controls
  static async applyRiskControls(paymentRequest: PaymentRequest, riskLevel: string) {
    switch (riskLevel) {
      case 'high':
        // Require manual approval for high-risk payments
        await this.flagForManualReview(paymentRequest)
        break
        
      case 'medium':
        // Additional verification steps
        await this.requestAdditionalVerification(paymentRequest)
        break
        
      case 'low':
        // Standard processing
        break
    }
  }
}
```

---

**This Mollie integration guide provides complete Dutch payment processing patterns with iDEAL support, BTW compliance, emergency payment flows, and comprehensive security measures.**