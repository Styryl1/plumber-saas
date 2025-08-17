# Payment Flows - Emergency & Mobile Integration

## 🎯 Overview
Complete payment flow integration for widget with emergency payments, mobile optimization, voice invoice integration, and Dutch payment preferences.

## 💳 Dutch Payment Preferences

### **Payment Method Priority**
```typescript
// Dutch customer payment preferences
export const DUTCH_PAYMENT_PREFERENCES = {
  // Order of preference for Dutch customers
  priority: [
    'ideal',        // 70% of Dutch online payments
    'creditcard',   // International and business
    'banktransfer', // Large amounts and B2B
    'paypal',       // Familiar alternative
    'sofort'        // German border regions
  ],
  
  // Emergency payment preferences
  emergency: [
    'ideal',        // Fastest for Dutch customers
    'creditcard'    // Immediate for international
  ],
  
  // Mobile preferences
  mobile: {
    preferred: ['ideal', 'apple_pay', 'google_pay'],
    fallback: ['creditcard', 'paypal']
  },
  
  // Business payment preferences
  business: {
    preferred: ['banktransfer', 'creditcard'],
    terms: 'net_14_days',
    approval_required: true
  }
}
```

### **Payment Amount Psychology**
```typescript
// Dutch payment amount preferences
export class DutchPaymentPsychology {
  static getOptimalPaymentMethod(amount: number, urgency: number, customerType: string) {
    // Emergency: any amount via fastest method
    if (urgency >= 3) {
      return {
        primary: 'ideal',
        message: 'Voor spoedgevallen accepteren we directe iDEAL betaling',
        timing: 'immediate'
      }
    }
    
    // Small amounts (<€150): prefer instant
    if (amount < 150) {
      return {
        primary: 'ideal',
        message: 'Direct betalen met iDEAL',
        timing: 'immediate'
      }
    }
    
    // Medium amounts (€150-500): choice
    if (amount < 500) {
      return {
        primary: 'ideal',
        secondary: 'banktransfer',
        message: 'Betaal direct met iDEAL of binnen 14 dagen via factuur',
        timing: 'flexible'
      }
    }
    
    // Large amounts (>€500): prefer invoice
    return {
      primary: 'banktransfer',
      secondary: 'ideal',
      message: 'Betaling via factuur (14 dagen) of direct met iDEAL',
      timing: 'invoice_preferred'
    }
  }
}
```

## 🚑 Emergency Payment Flows

### **Critical Emergency Payment**
```typescript
// Ultra-fast emergency payment flow
export class EmergencyPaymentFlow {
  // 30-second emergency payment process
  static getCriticalEmergencyFlow(jobDetails: any) {
    return {
      // Step 1: Immediate cost display (5 seconds)
      cost_display: {
        message: `
🚑 SPOEDSERVICE

Kosten: €${jobDetails.emergencyRate}/uur
Geschat: €${jobDetails.estimatedTotal}
(Inclusief spoedtoeslag €25)

Direct betalen voor snelste service?
        `,
        options: [
          { text: 'JA - BETAAL NU', action: 'immediate_payment', style: 'emergency' },
          { text: 'Factuur achteraf', action: 'invoice_later', style: 'secondary' }
        ]
      },
      
      // Step 2: One-tap payment (10 seconds)
      payment_selection: {
        message: 'Snelste betaalmethode:',
        methods: [
          { 
            method: 'ideal', 
            display: '🇳🇱 iDEAL (2 minuten)', 
            priority: 1,
            mobile_optimized: true
          },
          { 
            method: 'creditcard', 
            display: '💳 Creditcard (1 minuut)', 
            priority: 2,
            mobile_optimized: true
          }
        ]
      },
      
      // Step 3: Confirmation (15 seconds)
      confirmation: {
        success_message: `
✅ BETALING BEVESTIGD

Vakman direct onderweg!
Aankomst: ${jobDetails.eta} minuten
Contact: ${jobDetails.technicianPhone}

Tracking via SMS gestuurd.
        `,
        actions: [
          'send_sms_tracking',
          'notify_technician',
          'start_timer'
        ]
      }
    }
  }
  
  // Emergency payment with reduced friction
  static createEmergencyPayment(jobId: string, amount: number) {
    return {
      // Mollie payment with emergency settings
      payment_config: {
        amount: { currency: 'EUR', value: amount.toFixed(2) },
        description: `Spoedservice - ${jobId}`,
        method: ['ideal', 'creditcard'], // Only fast methods
        locale: 'nl_NL',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min expiry
        metadata: {
          emergency: true,
          jobId,
          priority: 'critical'
        }
      },
      
      // Immediate redirect
      user_experience: {
        redirect_delay: 0, // Immediate
        confirmation_page: 'simplified',
        mobile_optimized: true,
        return_url: `/emergency-tracking/${jobId}`
      }
    }
  }
}
```

### **Progressive Payment Options**
```typescript
// Flexible payment timing for different urgency levels
export const PAYMENT_TIMING_STRATEGIES = {
  // Critical emergency (Level 1)
  critical: {
    timing: 'before_service',
    message: 'Voor spoedservice vragen we vooruitbetaling',
    discount: 0,
    payment_methods: ['ideal', 'creditcard'],
    urgency_justification: 'Hierdoor kunnen we direct starten zonder administratie'
  },
  
  // Urgent (Level 2)
  urgent: {
    timing: 'flexible',
    message: 'Betaal nu met korting of achteraf via factuur',
    discount: '2%_early_payment',
    payment_methods: ['ideal', 'creditcard', 'banktransfer'],
    incentive: 'Vooruitbetaling = 2% korting + geen factuurkosten'
  },
  
  // Standard urgent (Level 3)
  standard: {
    timing: 'after_completion',
    message: 'Betaling na voltooiing van het werk',
    discount: 0,
    payment_methods: ['ideal', 'banktransfer', 'creditcard'],
    terms: 'Betaling binnen 14 dagen'
  },
  
  // Planned service (Level 4)
  planned: {
    timing: 'invoice',
    message: 'Factuur na oplevering',
    discount: 0,
    payment_methods: ['banktransfer', 'ideal', 'creditcard'],
    terms: 'Betaaltermijn 14 dagen'
  }
}
```

## 📱 Mobile Payment Optimization

### **One-Tap Mobile Payments**
```typescript
// Mobile-optimized payment interface
export class MobilePaymentInterface {
  // Touch-friendly payment selection
  static getMobilePaymentUI(paymentOptions: any[]) {
    return {
      // Large, thumb-friendly payment buttons
      payment_buttons: {
        size: 'minimum_44px_height',
        spacing: '16px_between_options',
        text_size: '18px_readable',
        icons: 'payment_method_logos'
      },
      
      // Simplified payment flow
      flow: {
        steps: 'maximum_3_screens',
        back_button: 'always_visible',
        progress: 'step_indicator',
        loading: 'immediate_feedback'
      },
      
      // Mobile-specific features
      mobile_features: {
        auto_zoom_prevention: 'font_size_16px',
        keyboard_optimization: 'numeric_for_amounts',
        gesture_support: 'swipe_navigation',
        offline_fallback: 'cache_payment_intent'
      }
    }
  }
  
  // Mobile payment component
  static createMobilePaymentComponent(amount: number, urgency: number) {
    return `
      <div class="mobile-payment-container">
        <!-- Amount display -->
        <div class="amount-display">
          <div class="amount-large">€${amount.toFixed(2)}</div>
          <div class="amount-details">Inclusief BTW en reiskosten</div>
        </div>
        
        <!-- Payment methods -->
        <div class="payment-methods">
          ${this.generatePaymentButtons(amount, urgency)}
        </div>
        
        <!-- Security badges -->
        <div class="security-badges">
          <img src="/badges/ssl-secure.svg" alt="SSL Secure">
          <img src="/badges/mollie-verified.svg" alt="Mollie Verified">
        </div>
      </div>
    `
  }
  
  private static generatePaymentButtons(amount: number, urgency: number) {
    const methods = DutchPaymentPsychology.getOptimalPaymentMethod(amount, urgency, 'private')
    
    return `
      <button class="payment-btn payment-btn-primary" data-method="ideal">
        <img src="/payment-icons/ideal.svg" alt="iDEAL">
        <span>iDEAL - Direct betalen</span>
        <div class="payment-time">2 minuten</div>
      </button>
      
      <button class="payment-btn payment-btn-secondary" data-method="creditcard">
        <img src="/payment-icons/cards.svg" alt="Credit Card">
        <span>Creditcard</span>
        <div class="payment-time">1 minuut</div>
      </button>
      
      ${urgency < 3 ? `
        <button class="payment-btn payment-btn-tertiary" data-method="invoice">
          <img src="/payment-icons/invoice.svg" alt="Factuur">
          <span>Factuur achteraf</span>
          <div class="payment-time">14 dagen betaaltermijn</div>
        </button>
      ` : ''}
    `
  }
}
```

### **Mobile Payment Validation**
```javascript
// Client-side mobile payment validation
class MobilePaymentValidator {
  // Validate before Mollie redirect
  validatePayment(paymentData) {
    const errors = []
    
    // Amount validation
    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Ongeldig bedrag')
    }
    
    // Method validation
    const validMethods = ['ideal', 'creditcard', 'banktransfer']
    if (!validMethods.includes(paymentData.method)) {
      errors.push('Ongeldige betaalmethode')
    }
    
    // Mobile-specific validations
    if (this.isMobile()) {
      // Check if method is mobile-friendly
      const mobileFriendly = ['ideal', 'creditcard', 'paypal']
      if (!mobileFriendly.includes(paymentData.method)) {
        errors.push('Deze betaalmethode werkt beter op desktop')
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  // Mobile detection
  isMobile() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }
  
  // Network status check
  async checkNetworkForPayment() {
    if (!navigator.onLine) {
      return {
        ready: false,
        message: 'Geen internetverbinding. Probeer opnieuw wanneer u online bent.'
      }
    }
    
    // Test connection speed
    const startTime = Date.now()
    try {
      await fetch('/api/ping', { method: 'HEAD' })
      const responseTime = Date.now() - startTime
      
      if (responseTime > 5000) {
        return {
          ready: true,
          warning: 'Langzame verbinding gedetecteerd. Betaling kan langer duren.'
        }
      }
      
      return { ready: true }
    } catch (error) {
      return {
        ready: false,
        message: 'Verbindingsprobleem. Controleer uw internet en probeer opnieuw.'
      }
    }
  }
}
```

## 🎤 Voice Invoice Integration

### **Voice-to-Payment Workflow**
```typescript
// Voice invoice processing for immediate payment
export class VoiceInvoicePayment {
  // Convert voice input to payment request
  static async processVoiceInvoice(audioBlob: Blob, context: any) {
    // Speech-to-text processing
    const transcript = await this.speechToText(audioBlob)
    
    // Extract payment-relevant information
    const invoiceData = this.extractInvoiceData(transcript)
    
    // Generate payment request
    return {
      items: invoiceData.items,
      labor: invoiceData.labor,
      total: invoiceData.total,
      btw: invoiceData.btw,
      payment_options: this.getPaymentOptions(invoiceData.total, context)
    }
  }
  
  // Extract structured data from Dutch voice input
  private static extractInvoiceData(transcript: string) {
    const patterns = {
      // Labor patterns
      labor: /(?:arbeid|werk|tijd)\s*[:=]?\s*(€?\d+(?:[,.]\d{2})?)/gi,
      
      // Material patterns  
      materials: /(?:materiaal|onderdelen|kraan|buis)\s*[:=]?\s*(€?\d+(?:[,.]\d{2})?)/gi,
      
      // Time patterns
      time: /(\d+(?:[,.]\d+)?)\s*(?:uur|uren)/gi,
      
      // Total patterns
      total: /(?:totaal|samen|eindtotaal)\s*[:=]?\s*(€?\d+(?:[,.]\d{2})?)/gi
    }
    
    // Extract and calculate
    const laborCosts = this.extractCurrency(transcript.match(patterns.labor)?.[1])
    const materialCosts = this.extractCurrency(transcript.match(patterns.materials)?.[1])
    const timeSpent = parseFloat(transcript.match(patterns.time)?.[1] || '0')
    
    const subtotal = laborCosts + materialCosts
    const btw = subtotal * 0.21 // 21% Dutch VAT
    const total = subtotal + btw
    
    return {
      items: [
        { description: 'Arbeidsloon', amount: laborCosts },
        { description: 'Materialen', amount: materialCosts }
      ],
      labor: { hours: timeSpent, rate: laborCosts / timeSpent },
      subtotal,
      btw,
      total
    }
  }
  
  // Generate payment options based on voice invoice
  private static getPaymentOptions(amount: number, context: any) {
    if (context.emergency) {
      return {
        primary: {
          method: 'ideal',
          message: 'Direct betalen voor spoedservice voltooid',
          discount: 0
        }
      }
    }
    
    return {
      primary: {
        method: 'ideal',
        message: 'Direct betalen - geen factuurkosten',
        discount: '2%'
      },
      secondary: {
        method: 'banktransfer',
        message: 'Factuur - betaling binnen 14 dagen',
        discount: 0
      }
    }
  }
}
```

## 🔒 Payment Security & Compliance

### **PCI DSS Compliance for Widget**
```typescript
// Security measures for widget payments
export class WidgetPaymentSecurity {
  // Secure payment data handling
  static sanitizePaymentData(paymentData: any) {
    // Remove sensitive fields before logging
    const sanitized = { ...paymentData }
    
    // Never store these fields
    delete sanitized.cardNumber
    delete sanitized.cvv
    delete sanitized.expiryDate
    delete sanitized.iban
    
    return sanitized
  }
  
  // Validate payment origin
  static validatePaymentOrigin(request: any) {
    const allowedOrigins = [
      'https://plumbingagent.nl',
      'https://*.plumbingagent.nl',
      'http://localhost:3001' // Development only
    ]
    
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    
    return allowedOrigins.some(allowed => 
      origin?.match(allowed) || referer?.match(allowed)
    )
  }
  
  // Payment session security
  static createSecurePaymentSession(jobId: string, customerId: string) {
    return {
      sessionId: this.generateSecureId(),
      jobId,
      customerId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent(),
      verified: false
    }
  }
}
```

### **Fraud Detection for Widget Payments**
```typescript
// Widget-specific fraud detection
export class WidgetFraudDetection {
  // Analyze payment risk
  static async assessPaymentRisk(paymentRequest: any) {
    const riskFactors = []
    
    // High-risk patterns
    if (paymentRequest.amount > 1000 && paymentRequest.urgency === 4) {
      riskFactors.push('high_amount_non_emergency')
    }
    
    // Rapid repeat requests
    const recentRequests = await this.getRecentRequests(paymentRequest.customerData)
    if (recentRequests > 3) {
      riskFactors.push('multiple_rapid_requests')
    }
    
    // Location inconsistency
    if (await this.detectLocationInconsistency(paymentRequest)) {
      riskFactors.push('location_mismatch')
    }
    
    return {
      riskLevel: this.calculateRiskLevel(riskFactors),
      factors: riskFactors,
      recommendation: this.getRiskRecommendation(riskFactors)
    }
  }
  
  private static calculateRiskLevel(factors: string[]): 'low' | 'medium' | 'high' {
    if (factors.length === 0) return 'low'
    if (factors.length <= 2) return 'medium'
    return 'high'
  }
}
```

---

**This payment flows guide provides complete integration patterns for emergency payments, mobile optimization, voice invoice integration, and security compliance within the AI chat widget.**