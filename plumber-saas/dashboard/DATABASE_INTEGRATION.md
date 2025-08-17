# Database Integration - Supabase + Prisma Multi-Tenant Patterns

## Overview
Production-ready database integration patterns for multi-tenant plumbing SaaS supporting 500+ organizations with perfect data isolation, real-time subscriptions, and Dutch market compliance.

## Core Architecture

### Supabase + Prisma Integration
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Public client for unauthenticated operations (widget)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Authenticated client with RLS and Clerk integration
export const getSupabaseClient = async () => {
  const { getToken } = auth()
  const token = await getToken({ template: 'supabase' })
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  })
}

// Service role client for admin operations
export const getSupabaseServiceClient = () => {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
```

### Prisma Schema for Multi-Tenant SaaS
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Core tenant model
model Organization {
  id          String   @id @default(cuid())
  clerkId     String   @unique
  name        String
  slug        String   @unique
  email       String
  phone       String?
  
  // Dutch business fields
  kvkNumber   String?  @unique // Chamber of Commerce
  btwNumber   String?  @unique // VAT number
  iban        String?  // Bank account
  
  // Business configuration
  services    Json     @default("[]")
  workingHours Json    @default("{}")
  serviceArea  Json    @default("{}")
  pricing     Json     @default("{}")
  
  // AI configuration
  aiPersonality String @default("professional")
  aiInstructions String?
  widgetConfig   Json   @default("{}")
  
  // Subscription
  plan        PlanType @default(STARTER)
  planExpiry  DateTime?
  isActive    Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  jobs        Job[]
  customers   Customer[]
  invoices    Invoice[]
  materials   Material[]
  employees   Employee[]
  widgetSessions WidgetSession[]

  @@map("organizations")
}

enum PlanType {
  STARTER
  PROFESSIONAL
  ENTERPRISE
}

// Job management
model Job {
  id              String    @id @default(cuid())
  organizationId  String
  customerId      String
  employeeId      String?
  
  // Job details
  title           String
  description     String?
  category        JobCategory
  priority        Priority   @default(NORMAL)
  status          JobStatus  @default(SCHEDULED)
  
  // Scheduling
  scheduledAt     DateTime
  estimatedDuration Int     // minutes
  actualDuration  Int?     // minutes
  completedAt     DateTime?
  
  // Location
  address         String
  postalCode      String
  city            String
  coordinates     Json?    // lat/lng for route optimization
  
  // Pricing
  laborRate       Decimal  @db.Decimal(10, 2)
  materialsCost   Decimal  @db.Decimal(10, 2) @default(0)
  totalCost       Decimal  @db.Decimal(10, 2)
  btwRate         Decimal  @db.Decimal(4, 2) @default(21.00) // Dutch VAT
  
  // Tracking
  notes           String?
  internalNotes   String?
  photos          Json     @default("[]")
  attachments     Json     @default("[]")
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  customer        Customer     @relation(fields: [customerId], references: [id])
  employee        Employee?    @relation(fields: [employeeId], references: [id])
  invoices        Invoice[]
  jobMaterials    JobMaterial[]
  timeEntries     TimeEntry[]

  @@index([organizationId, status])
  @@index([organizationId, scheduledAt])
  @@map("jobs")
}

enum JobCategory {
  LEAK_REPAIR
  BOILER_SERVICE
  DRAIN_CLEANING
  INSTALLATION
  MAINTENANCE
  EMERGENCY
  OTHER
}

enum Priority {
  LOW
  NORMAL
  HIGH
  EMERGENCY
}

enum JobStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

// Customer management
model Customer {
  id              String   @id @default(cuid())
  organizationId  String
  
  // Contact info
  name            String
  email           String?
  phone           String
  
  // Address (Dutch format)
  address         String
  postalCode      String   // 1234 AB format
  city            String
  country         String   @default("Netherlands")
  
  // Customer details
  customerType    CustomerType @default(PRIVATE)
  notes           String?
  tags            Json         @default("[]")
  
  // Communication preferences
  preferredContact ContactMethod @default(PHONE)
  language        String        @default("nl")
  
  // Business info (for business customers)
  companyName     String?
  kvkNumber       String?
  btwNumber       String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  jobs            Job[]
  invoices        Invoice[]

  @@index([organizationId, name])
  @@index([organizationId, postalCode])
  @@map("customers")
}

enum CustomerType {
  PRIVATE
  BUSINESS
  PROPERTY_MANAGER
}

enum ContactMethod {
  PHONE
  EMAIL
  WHATSAPP
  SMS
}

// Invoice management with Dutch compliance
model Invoice {
  id              String   @id @default(cuid())
  organizationId  String
  customerId      String
  jobId           String?
  
  // Invoice details
  invoiceNumber   String   @unique
  description     String
  status          InvoiceStatus @default(DRAFT)
  
  // Amounts (Dutch BTW compliance)
  subtotal        Decimal  @db.Decimal(10, 2)
  btwAmount       Decimal  @db.Decimal(10, 2)
  btwRate         Decimal  @db.Decimal(4, 2)
  total           Decimal  @db.Decimal(10, 2)
  
  // Dates
  invoiceDate     DateTime
  dueDate         DateTime
  paidAt          DateTime?
  
  // Payment
  paymentMethod   PaymentMethod?
  paymentReference String?
  
  // Files
  pdfUrl          String?
  attachments     Json     @default("[]")
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  customer        Customer     @relation(fields: [customerId], references: [id])
  job             Job?         @relation(fields: [jobId], references: [id])
  invoiceLines    InvoiceLine[]

  @@index([organizationId, status])
  @@index([organizationId, invoiceDate])
  @@map("invoices")
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
}

enum PaymentMethod {
  CASH
  BANK_TRANSFER
  IDEAL
  CARD
  OTHER
}

model InvoiceLine {
  id          String  @id @default(cuid())
  invoiceId   String
  
  description String
  quantity    Decimal @db.Decimal(10, 3)
  unitPrice   Decimal @db.Decimal(10, 2)
  total       Decimal @db.Decimal(10, 2)
  btwRate     Decimal @db.Decimal(4, 2)
  
  // Relations
  invoice     Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@map("invoice_lines")
}

// Materials and inventory
model Material {
  id              String   @id @default(cuid())
  organizationId  String
  
  name            String
  description     String?
  sku             String?
  category        String
  
  // Pricing
  costPrice       Decimal  @db.Decimal(10, 2)
  sellPrice       Decimal  @db.Decimal(10, 2)
  btwRate         Decimal  @db.Decimal(4, 2) @default(21.00)
  
  // Inventory
  currentStock    Int      @default(0)
  minStock        Int      @default(0)
  unit            String   @default("pcs")
  
  // Supplier
  supplier        String?
  supplierSku     String?
  
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  jobMaterials    JobMaterial[]

  @@index([organizationId, category])
  @@map("materials")
}

model JobMaterial {
  id          String  @id @default(cuid())
  jobId       String
  materialId  String
  
  quantity    Decimal @db.Decimal(10, 3)
  unitPrice   Decimal @db.Decimal(10, 2)
  total       Decimal @db.Decimal(10, 2)
  
  // Relations
  job         Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  material    Material @relation(fields: [materialId], references: [id])

  @@map("job_materials")
}

// Employee management
model Employee {
  id              String   @id @default(cuid())
  organizationId  String
  clerkUserId     String?  @unique
  
  // Personal info
  firstName       String
  lastName        String
  email           String
  phone           String?
  
  // Employment
  role            EmployeeRole @default(TECHNICIAN)
  hourlyRate      Decimal      @db.Decimal(10, 2)
  isActive        Boolean      @default(true)
  
  // Skills and certifications
  skills          Json         @default("[]")
  certifications  Json         @default("[]")
  
  hiredAt         DateTime
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  jobs            Job[]
  timeEntries     TimeEntry[]

  @@index([organizationId, role])
  @@map("employees")
}

enum EmployeeRole {
  OWNER
  MANAGER
  TECHNICIAN
  APPRENTICE
  ADMIN
}

model TimeEntry {
  id          String   @id @default(cuid())
  jobId       String
  employeeId  String
  
  startTime   DateTime
  endTime     DateTime?
  duration    Int?     // minutes
  description String?
  
  // Relations
  job         Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  employee    Employee @relation(fields: [employeeId], references: [id])

  @@map("time_entries")
}

// Widget and AI integration
model WidgetSession {
  id              String   @id @default(cuid())
  organizationId  String
  
  // Session tracking
  fingerprint     String?
  ipAddress       String
  userAgent       String?
  referrer        String?
  
  // Location data
  country         String?
  city            String?
  postalCode      String?
  
  startedAt       DateTime @default(now())
  endedAt         DateTime?
  lastActiveAt    DateTime @default(now())
  
  // Conversion tracking
  leadGenerated   Boolean  @default(false)
  bookingMade     Boolean  @default(false)
  conversionValue Decimal? @db.Decimal(10, 2)

  // Relations
  organization    Organization    @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  messages        WidgetMessage[]

  @@index([organizationId, startedAt])
  @@map("widget_sessions")
}

model WidgetMessage {
  id          String   @id @default(cuid())
  sessionId   String
  
  type        MessageType
  content     String
  metadata    Json     @default("{}")
  
  timestamp   DateTime @default(now())

  // Relations
  session     WidgetSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId, timestamp])
  @@map("widget_messages")
}

enum MessageType {
  USER
  ASSISTANT
  SYSTEM
}
```

## Row Level Security (RLS) Policies

### Organization-Based Data Isolation
```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only access their own organization
CREATE POLICY "Users can view own organization" ON organizations
FOR ALL USING (
  clerk_id = auth.jwt() ->> 'sub' OR
  id = auth.jwt() ->> 'org_id'
);

-- Jobs: Organization members only
CREATE POLICY "Organization members can manage jobs" ON jobs
FOR ALL USING (
  organization_id = auth.jwt() ->> 'org_id'
);

-- Customers: Organization isolation
CREATE POLICY "Organization members can manage customers" ON customers
FOR ALL USING (
  organization_id = auth.jwt() ->> 'org_id'
);

-- Invoices: Organization isolation with additional checks
CREATE POLICY "Organization members can manage invoices" ON invoices
FOR ALL USING (
  organization_id = auth.jwt() ->> 'org_id'
);

-- Materials: Organization inventory isolation
CREATE POLICY "Organization members can manage materials" ON materials
FOR ALL USING (
  organization_id = auth.jwt() ->> 'org_id'
);

-- Employees: Organization staff isolation
CREATE POLICY "Organization members can manage employees" ON employees
FOR ALL USING (
  organization_id = auth.jwt() ->> 'org_id'
);

-- Widget sessions: Allow public access for organization's own widgets
CREATE POLICY "Public widget access" ON widget_sessions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Organization can view own widget sessions" ON widget_sessions
FOR SELECT USING (
  organization_id = auth.jwt() ->> 'org_id'
);

-- Widget messages: Follow session permissions
CREATE POLICY "Widget messages follow session permissions" ON widget_messages
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM widget_sessions 
    WHERE id = session_id 
    AND (
      organization_id = auth.jwt() ->> 'org_id' OR
      auth.jwt() IS NULL  -- Allow public access for active chats
    )
  )
);
```

## Prisma Client Configuration

### Multi-Tenant Query Patterns
```typescript
// src/server/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Organization-scoped database operations
export class OrganizationDB {
  constructor(private orgId: string) {}

  get jobs() {
    return {
      findMany: (args?: any) => db.job.findMany({
        ...args,
        where: { 
          organizationId: this.orgId,
          ...args?.where 
        }
      }),
      
      findFirst: (args?: any) => db.job.findFirst({
        ...args,
        where: { 
          organizationId: this.orgId,
          ...args?.where 
        }
      }),
      
      create: (args: any) => db.job.create({
        ...args,
        data: {
          organizationId: this.orgId,
          ...args.data
        }
      }),
      
      update: (args: any) => db.job.update({
        ...args,
        where: {
          organizationId: this.orgId,
          ...args.where
        }
      }),
      
      delete: (args: any) => db.job.delete({
        where: {
          organizationId: this.orgId,
          ...args.where
        }
      }),
    }
  }

  get customers() {
    return {
      findMany: (args?: any) => db.customer.findMany({
        ...args,
        where: { 
          organizationId: this.orgId,
          ...args?.where 
        }
      }),
      
      create: (args: any) => db.customer.create({
        ...args,
        data: {
          organizationId: this.orgId,
          ...args.data
        }
      }),
    }
  }

  get invoices() {
    return {
      findMany: (args?: any) => db.invoice.findMany({
        ...args,
        where: { 
          organizationId: this.orgId,
          ...args?.where 
        }
      }),
      
      create: (args: any) => db.invoice.create({
        ...args,
        data: {
          organizationId: this.orgId,
          ...args.data
        }
      }),
    }
  }
}

// Helper to create organization-scoped DB
export const createOrgDB = (orgId: string) => new OrganizationDB(orgId)
```

### tRPC Integration with Database
```typescript
// src/server/api/trpc.ts
import { auth } from '@clerk/nextjs'
import { createOrgDB } from '~/server/db'

export const createTRPCContext = async () => {
  const { userId, orgId } = auth()
  
  return {
    db,
    orgDb: orgId ? createOrgDB(orgId) : null,
    userId,
    orgId,
  }
}

// Usage in routers
export const jobsRouter = createTRPCRouter({
  list: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.orgDb!.jobs.findMany({
        include: {
          customer: {
            select: { name: true, phone: true }
          }
        },
        orderBy: { scheduledAt: 'asc' }
      })
    }),
})
```

## Real-time Subscriptions

### Supabase Real-time Integration
```typescript
// src/hooks/useRealtimeJobs.ts
import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { getSupabaseClient } from '~/lib/supabase'
import type { Job } from '@prisma/client'

export function useRealtimeJobs() {
  const { orgId } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    if (!orgId) return

    const supabase = getSupabaseClient()
    
    // Subscribe to job changes for this organization
    const subscription = supabase
      .channel(`jobs:org:${orgId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `organization_id=eq.${orgId}`,
        },
        (payload) => {
          handleJobChange(payload)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [orgId])

  const handleJobChange = (payload: any) => {
    switch (payload.eventType) {
      case 'INSERT':
        setJobs(prev => [...prev, payload.new])
        break
      case 'UPDATE':
        setJobs(prev => prev.map(job => 
          job.id === payload.new.id ? payload.new : job
        ))
        break
      case 'DELETE':
        setJobs(prev => prev.filter(job => job.id !== payload.old.id))
        break
    }
  }

  return { jobs, setJobs }
}
```

## Database Utilities

### Dutch Postal Code Validation
```typescript
// src/lib/dutch-validation.ts
export function validateDutchPostalCode(postalCode: string): boolean {
  const dutchPostalCodeRegex = /^[1-9][0-9]{3}\s?[A-Z]{2}$/i
  return dutchPostalCodeRegex.test(postalCode)
}

export function normalizeDutchPostalCode(postalCode: string): string {
  return postalCode
    .replace(/\s/g, '')
    .toUpperCase()
    .replace(/^(\d{4})([A-Z]{2})$/, '$1 $2')
}

export function validateDutchPhone(phone: string): boolean {
  const dutchPhoneRegex = /^(\+31|0)[1-9][0-9]{8}$/
  return dutchPhoneRegex.test(phone.replace(/\s/g, ''))
}

export function validateKVKNumber(kvk: string): boolean {
  const kvkRegex = /^[0-9]{8}$/
  return kvkRegex.test(kvk)
}

export function validateBTWNumber(btw: string): boolean {
  // Dutch BTW number format: NL123456789B01
  const btwRegex = /^NL[0-9]{9}B[0-9]{2}$/
  return btwRegex.test(btw)
}
```

### Database Migration Helpers
```typescript
// src/lib/migration-helpers.ts
import { db } from '~/server/db'

export async function createOrganizationWithDefaults(data: {
  clerkId: string
  name: string
  email: string
}) {
  return db.organization.create({
    data: {
      ...data,
      slug: generateSlug(data.name),
      services: [
        'leak_repair',
        'boiler_service', 
        'drain_cleaning',
        'installation',
        'maintenance'
      ],
      workingHours: {
        monday: { start: '08:00', end: '17:00' },
        tuesday: { start: '08:00', end: '17:00' },
        wednesday: { start: '08:00', end: '17:00' },
        thursday: { start: '08:00', end: '17:00' },
        friday: { start: '08:00', end: '17:00' },
        saturday: { start: '09:00', end: '15:00' },
        sunday: { closed: true }
      },
      pricing: {
        standardRate: 75,
        emergencyRate: 98,
        materialMarkup: 1.3
      }
    }
  })
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
}
```

This database integration provides perfect multi-tenant isolation, Dutch market compliance, and real-time capabilities for the plumbing SaaS platform.