# Data Models - Complete Business Schema for Plumbing Operations

## Overview
Complete data model specifications for multi-tenant plumbing SaaS supporting Dutch business operations, BTW compliance, and emergency service management.

## Core Business Entities

### Organization Model
```typescript
// src/types/organization.ts
export interface Organization {
  id: string
  clerkId: string
  name: string
  slug: string
  email: string
  phone?: string
  
  // Dutch business fields
  kvkNumber?: string    // Chamber of Commerce: 12345678
  btwNumber?: string    // VAT number: NL123456789B01
  iban?: string         // Dutch bank account
  
  // Business address
  address?: string
  postalCode?: string   // 1234 AB format
  city?: string
  country: string       // Default: "Netherlands"
  
  // Business configuration
  services: ServiceType[]
  workingHours: WorkingHours
  serviceArea: ServiceArea
  pricing: PricingConfig
  
  // AI and widget configuration
  aiPersonality: 'professional' | 'friendly' | 'technical'
  aiInstructions?: string
  widgetConfig: WidgetConfig
  
  // Subscription
  plan: PlanType
  planExpiry?: Date
  isActive: boolean
  
  createdAt: Date
  updatedAt: Date
}

export type ServiceType = 
  | 'LEAK_REPAIR'
  | 'BOILER_SERVICE'
  | 'DRAIN_CLEANING'
  | 'INSTALLATION'
  | 'MAINTENANCE'
  | 'EMERGENCY'
  | 'OTHER'

export interface WorkingHours {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

export interface DaySchedule {
  closed?: boolean
  start?: string  // "08:00"
  end?: string    // "17:00"
  breaks?: Array<{ start: string; end: string }>
}

export interface ServiceArea {
  postalCodes: string[]     // ["1012", "1013", "1014"]
  maxDistance: number       // kilometers
  emergencyArea: string[]   // Priority postal codes
}

export interface PricingConfig {
  standardRate: number      // €75/hour
  emergencyRate: number     // €98/hour
  weekendRate?: number      // €85/hour
  materialMarkup: number    // 1.3 (30% markup)
  travelCost?: number       // €0.58/km
  minimumCharge?: number    // €45
}

export type PlanType = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
```

### Job Management Models
```typescript
// src/types/job.ts
export interface Job {
  id: string
  organizationId: string
  customerId: string
  employeeId?: string
  
  // Job details
  title: string
  description?: string
  category: JobCategory
  priority: Priority
  status: JobStatus
  
  // Scheduling
  scheduledAt: Date
  estimatedDuration: number  // minutes
  actualDuration?: number    // minutes
  completedAt?: Date
  
  // Location
  address: string
  postalCode: string         // Dutch format: 1234 AB
  city: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  
  // Pricing with Dutch BTW
  laborRate: number          // €75.00
  materialsCost: number      // €125.50
  totalCost: number          // €200.50
  btwRate: number            // 21.00 or 9.00
  
  // Documentation
  notes?: string
  internalNotes?: string
  photos: string[]           // URLs to photos
  attachments: Attachment[]
  
  // Relations
  customer: Customer
  employee?: Employee
  materials: JobMaterial[]
  timeEntries: TimeEntry[]
  invoices: Invoice[]
  
  createdAt: Date
  updatedAt: Date
}

export type JobCategory = 
  | 'LEAK_REPAIR'      // Lekkage reparatie
  | 'BOILER_SERVICE'   // CV-ketel onderhoud
  | 'DRAIN_CLEANING'   // Afvoer ontstopping
  | 'INSTALLATION'     // Installatie
  | 'MAINTENANCE'      // Onderhoud
  | 'EMERGENCY'        // Spoedgeval
  | 'OTHER'

export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY'

export type JobStatus = 
  | 'SCHEDULED'    // Ingepland
  | 'IN_PROGRESS'  // Bezig
  | 'COMPLETED'    // Voltooid
  | 'CANCELLED'    // Geannuleerd
  | 'NO_SHOW'      // Niet verschenen

export interface JobMaterial {
  id: string
  jobId: string
  materialId: string
  quantity: number
  unitPrice: number
  total: number
  material: Material
}

export interface TimeEntry {
  id: string
  jobId: string
  employeeId: string
  startTime: Date
  endTime?: Date
  duration?: number      // minutes
  description?: string
  employee: Employee
}

export interface Attachment {
  id: string
  filename: string
  url: string
  type: 'image' | 'document' | 'video'
  size: number
  uploadedAt: Date
}
```

### Customer Management Models
```typescript
// src/types/customer.ts
export interface Customer {
  id: string
  organizationId: string
  
  // Contact information
  name: string
  email?: string
  phone: string              // Dutch format: +31612345678 or 0612345678
  
  // Dutch address format
  address: string
  postalCode: string         // 1234 AB format
  city: string
  country: string            // Default: "Netherlands"
  
  // Customer classification
  customerType: CustomerType
  preferredContact: ContactMethod
  language: 'nl' | 'en'
  
  // Business customer fields
  companyName?: string
  kvkNumber?: string         // Chamber of Commerce number
  btwNumber?: string         // VAT number for business customers
  
  // Customer management
  notes?: string
  tags: string[]
  
  // Statistics
  totalJobs: number
  totalSpent: number
  lastJobDate?: Date
  averageRating?: number
  
  // Relations
  jobs: Job[]
  invoices: Invoice[]
  
  createdAt: Date
  updatedAt: Date
}

export type CustomerType = 
  | 'PRIVATE'           // Particulier
  | 'BUSINESS'          // Bedrijf
  | 'PROPERTY_MANAGER'  // Vastgoedbeheerder

export type ContactMethod = 'PHONE' | 'EMAIL' | 'WHATSAPP' | 'SMS'

// Customer search and filtering
export interface CustomerSearchParams {
  query?: string
  postalCode?: string
  customerType?: CustomerType
  tags?: string[]
  dateFrom?: Date
  dateTo?: Date
  limit?: number
  offset?: number
}

export interface CustomerAnalytics {
  totalCustomers: number
  newThisMonth: number
  repeatCustomers: number
  averageJobValue: number
  topPostalCodes: Array<{
    postalCode: string
    count: number
  }>
  customerTypes: Record<CustomerType, number>
}
```

### Invoice and Financial Models
```typescript
// src/types/invoice.ts
export interface Invoice {
  id: string
  organizationId: string
  customerId: string
  jobId?: string
  
  // Invoice identification
  invoiceNumber: string      // INV-2024-0001
  description: string
  status: InvoiceStatus
  
  // Dutch BTW compliance
  subtotal: number           // €165.29
  btwAmount: number          // €34.71 (21%) or €14.88 (9%)
  btwRate: number            // 21.00 or 9.00
  total: number              // €200.00
  
  // Dates
  invoiceDate: Date
  dueDate: Date              // Usually 14 days
  paidAt?: Date
  
  // Payment tracking
  paymentMethod?: PaymentMethod
  paymentReference?: string  // Mollie payment ID or bank reference
  
  // Files and communication
  pdfUrl?: string
  emailSentAt?: Date
  remindersSent: number
  attachments: Attachment[]
  
  // Relations
  customer: Customer
  job?: Job
  lines: InvoiceLine[]
  
  createdAt: Date
  updatedAt: Date
}

export type InvoiceStatus = 
  | 'DRAFT'      // Concept
  | 'SENT'       // Verzonden
  | 'PAID'       // Betaald
  | 'OVERDUE'    // Vervallen
  | 'CANCELLED'  // Geannuleerd

export type PaymentMethod = 
  | 'CASH'           // Contant
  | 'BANK_TRANSFER'  // Overboeking
  | 'IDEAL'          // iDEAL
  | 'CARD'           // Pinpas
  | 'OTHER'

export interface InvoiceLine {
  id: string
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  btwRate: number
}

// Dutch BTW rates (2024)
export const BTW_RATES = {
  STANDARD: 21.00,           // Standard rate
  REDUCED: 9.00,             // Reduced rate for repairs
  ZERO: 0.00                 // Zero rate (rare)
} as const

// Invoice generation settings
export interface InvoiceSettings {
  invoicePrefix: string      // "INV"
  paymentTerms: number       // 14 days
  autoSend: boolean
  reminderSchedule: number[] // [7, 3, 1] days before due
  latePaymentFee: number     // €25.00
  bankDetails: {
    iban: string
    bic?: string
    accountName: string
  }
}
```

### Materials and Inventory Models
```typescript
// src/types/material.ts
export interface Material {
  id: string
  organizationId: string
  
  // Product information
  name: string               // "PVC Buis 110mm"
  description?: string
  sku?: string              // Internal SKU
  category: string          // "Leidingen", "Kranen", "Fittingen"
  
  // Pricing with Dutch BTW
  costPrice: number         // €15.50
  sellPrice: number         // €20.15
  btwRate: number           // 21.00
  
  // Inventory management
  currentStock: number      // 25
  minStock: number          // 5
  maxStock?: number         // 100
  unit: string              // "meter", "stuk", "liter"
  
  // Supplier information
  supplier?: string         // "Wavin Nederland"
  supplierSku?: string      // Supplier's SKU
  supplierPrice?: number
  
  // Status and tracking
  isActive: boolean
  lastOrderDate?: Date
  lastStockUpdate: Date
  
  createdAt: Date
  updatedAt: Date
}

export interface MaterialCategory {
  id: string
  name: string              // "Leidingen"
  description?: string
  parentId?: string         // For subcategories
  sortOrder: number
}

export interface StockMovement {
  id: string
  materialId: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  reason: string            // "Purchase", "Job usage", "Stock count"
  reference?: string        // Job ID or Purchase Order
  performedBy: string       // Employee ID
  timestamp: Date
}

export interface MaterialUsageAnalytics {
  materialId: string
  material: Material
  usageThisMonth: number
  usageLast3Months: number
  averageMonthlyUsage: number
  stockDaysRemaining: number
  reorderSuggested: boolean
}
```

### Employee and Team Models
```typescript
// src/types/employee.ts
export interface Employee {
  id: string
  organizationId: string
  clerkUserId?: string      // Link to Clerk user account
  
  // Personal information
  firstName: string
  lastName: string
  email: string
  phone?: string
  
  // Employment details
  role: EmployeeRole
  hourlyRate: number        // €75.00
  isActive: boolean
  
  // Skills and certifications
  skills: string[]          // ["CV-installatie", "Lekkage detectie"]
  certifications: Certification[]
  
  // Work scheduling
  workingHours: WorkingHours
  availability: Availability[]
  
  // Performance tracking
  averageRating?: number
  completedJobs: number
  totalHours: number
  
  // Dates
  hiredAt: Date
  terminatedAt?: Date
  createdAt: Date
  updatedAt: Date
  
  // Relations
  jobs: Job[]
  timeEntries: TimeEntry[]
}

export type EmployeeRole = 
  | 'OWNER'         // Eigenaar
  | 'MANAGER'       // Manager
  | 'TECHNICIAN'    // Monteur
  | 'APPRENTICE'    // Leerling
  | 'ADMIN'         // Administratie

export interface Certification {
  id: string
  name: string              // "VCA Basis"
  issuedBy: string          // "ATEX"
  issuedDate: Date
  expiryDate?: Date
  certificateNumber?: string
  documentUrl?: string
}

export interface Availability {
  id: string
  employeeId: string
  type: 'VACATION' | 'SICK' | 'UNAVAILABLE' | 'TRAINING'
  startDate: Date
  endDate: Date
  reason?: string
  approvedBy?: string
}

export interface EmployeePerformance {
  employeeId: string
  period: {
    from: Date
    to: Date
  }
  metrics: {
    jobsCompleted: number
    averageJobDuration: number
    customerRating: number
    onTimePercentage: number
    revenueGenerated: number
    hoursWorked: number
  }
}
```

### Widget and AI Integration Models
```typescript
// src/types/widget.ts
export interface WidgetSession {
  id: string
  organizationId: string
  
  // Session tracking
  fingerprint?: string
  ipAddress: string
  userAgent?: string
  referrer?: string
  
  // Geographic information
  country?: string
  city?: string
  postalCode?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  
  // Session timeline
  startedAt: Date
  endedAt?: Date
  lastActiveAt: Date
  duration?: number         // seconds
  
  // Conversion tracking
  leadGenerated: boolean
  bookingMade: boolean
  conversionValue?: number  // €200.00
  
  // Analytics
  pageViews: number
  interactions: number
  
  // Relations
  messages: WidgetMessage[]
}

export interface WidgetMessage {
  id: string
  sessionId: string
  type: MessageType
  content: string
  metadata: MessageMetadata
  timestamp: Date
}

export type MessageType = 'USER' | 'ASSISTANT' | 'SYSTEM'

export interface MessageMetadata {
  model?: 'gpt-latest' | 'claude-latest'
  urgencyLevel?: 1 | 2 | 3 | 4
  estimatedCost?: number
  serviceType?: string
  shouldShowBooking?: boolean
  location?: string
  confidence?: number
}

export interface WidgetConfig {
  // Appearance
  primaryColor: string      // "#059669"
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size: 'small' | 'medium' | 'large'
  
  // Behavior
  autoOpen: boolean
  openDelay: number         // seconds
  welcomeMessage: string
  
  // Features
  showPricing: boolean
  allowFileUpload: boolean
  enableVoice: boolean
  collectEmail: boolean
  
  // Business settings
  emergencyOnly: boolean
  workingHoursOnly: boolean
  serviceAreaRestriction: boolean
}

export interface ChatAnalytics {
  organizationId: string
  period: {
    from: Date
    to: Date
  }
  metrics: {
    totalSessions: number
    averageSessionDuration: number
    messagesPerSession: number
    conversionRate: number
    leadValue: number
    topQuestions: Array<{
      question: string
      count: number
    }>
    emergencyRequests: number
    satisfactionScore: number
  }
}
```

### Dutch Business Compliance Models
```typescript
// src/types/compliance.ts
export interface DutchBusinessData {
  kvkNumber: string         // 12345678
  btwNumber: string         // NL123456789B01
  tradeNames: string[]      // Official business names
  businessAddress: {
    street: string
    houseNumber: string
    postalCode: string      // 1234 AB
    city: string
    country: string         // "Nederland"
  }
  businessType: string      // "Eenmanszaak", "BV", "NV"
  sbiCodes: string[]        // ["43221"] - Plumbing installation
  isActive: boolean
  registrationDate: Date
}

export interface BTWDeclaration {
  id: string
  organizationId: string
  period: {
    year: number
    quarter: 1 | 2 | 3 | 4
  }
  
  // BTW amounts
  salesHigh: number         // 21% BTW sales
  btwHigh: number           // 21% BTW owed
  salesLow: number          // 9% BTW sales
  btwLow: number            // 9% BTW owed
  salesZero: number         // 0% BTW sales
  
  // Deductible BTW
  purchaseBtw: number       // BTW on purchases
  
  // Calculation
  totalBtwOwed: number
  totalBtwDeductible: number
  amountToPay: number       // Or refund if negative
  
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED'
  submittedAt?: Date
  
  createdAt: Date
  updatedAt: Date
}

export interface GDPRDataRequest {
  id: string
  organizationId: string
  customerId: string
  type: 'EXPORT' | 'DELETE' | 'RECTIFICATION'
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED'
  requestedAt: Date
  processedAt?: Date
  processedBy?: string
  notes?: string
  
  // For data export
  exportUrl?: string
  
  // For data deletion
  deletionConfirmed?: boolean
  retentionReason?: string  // Legal requirement to keep certain data
}
```

### Validation Schemas
```typescript
// src/lib/validation-schemas.ts
import { z } from 'zod'

// Dutch postal code validation
export const dutchPostalCodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{3}\s?[A-Z]{2}$/i, 'Invalid Dutch postal code format')
  .transform(val => val.replace(/\s/g, '').toUpperCase().replace(/^(\d{4})([A-Z]{2})$/, '$1 $2'))

// Dutch phone number validation
export const dutchPhoneSchema = z
  .string()
  .regex(/^(\+31|0)[1-9][0-9]{8}$/, 'Invalid Dutch phone number')

// KVK number validation
export const kvkNumberSchema = z
  .string()
  .regex(/^[0-9]{8}$/, 'KVK number must be 8 digits')

// BTW number validation
export const btwNumberSchema = z
  .string()
  .regex(/^NL[0-9]{9}B[0-9]{2}$/, 'Invalid Dutch BTW number format')

// Job creation schema
export const createJobSchema = z.object({
  customerId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.enum(['LEAK_REPAIR', 'BOILER_SERVICE', 'DRAIN_CLEANING', 'INSTALLATION', 'MAINTENANCE', 'EMERGENCY', 'OTHER']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'EMERGENCY']).default('NORMAL'),
  scheduledAt: z.date().min(new Date()),
  estimatedDuration: z.number().min(30).max(480),
  address: z.string().min(5).max(200),
  postalCode: dutchPostalCodeSchema,
  city: z.string().min(2).max(50),
  laborRate: z.number().positive(),
  notes: z.string().optional()
})

// Customer creation schema
export const createCustomerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: dutchPhoneSchema,
  address: z.string().min(5).max(200),
  postalCode: dutchPostalCodeSchema,
  city: z.string().min(2).max(50),
  customerType: z.enum(['PRIVATE', 'BUSINESS', 'PROPERTY_MANAGER']).default('PRIVATE'),
  companyName: z.string().optional(),
  kvkNumber: kvkNumberSchema.optional(),
  btwNumber: btwNumberSchema.optional(),
  notes: z.string().optional()
})
```

This comprehensive data model provides type-safe, validated structures for all business operations in the Dutch plumbing market with full BTW compliance and GDPR support.