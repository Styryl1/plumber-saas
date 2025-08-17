# Multi-Tenant Security Patterns - Complete Isolation

## 🎯 Overview
Complete multi-tenant security implementation for plumbing SaaS with perfect data isolation, GDPR compliance, and Dutch security regulations.

## 🔒 Core Security Architecture

### **Data Isolation Strategy**
```typescript
// Perfect tenant isolation at database level
interface TenantIsolation {
  // Database level isolation
  rowLevelSecurity: {
    enabled: true,
    policy: 'organizationId = auth.jwt() ->> "org_id"'
  }
  
  // Application level isolation  
  middleware: {
    enforceOrgContext: true,
    validateOrgAccess: true,
    auditDataAccess: true
  }
  
  // API level isolation
  endpoints: {
    orgScoped: true,
    crossOrgBlocked: true,
    adminOverride: false  // Never allow cross-org access
  }
}
```

### **Supabase Row Level Security (RLS)**
```sql
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Organization access policy
CREATE POLICY "organization_isolation" ON customers
FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::text);

CREATE POLICY "organization_isolation" ON jobs  
FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::text);

CREATE POLICY "organization_isolation" ON invoices
FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::text);

-- User can only access their own organization
CREATE POLICY "user_organization_access" ON organizations
FOR ALL USING (clerk_id = (auth.jwt() ->> 'org_id')::text);

-- Prevent any cross-organization data leakage
CREATE POLICY "no_cross_org_access" ON customers
FOR ALL USING (
  organization_id IS NOT NULL AND
  organization_id = (auth.jwt() ->> 'org_id')::text
);
```

### **Clerk JWT Integration**
```typescript
// src/lib/auth-helpers.ts
import { auth } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

export function getSupabaseClient() {
  const { getToken, orgId } = auth()
  
  if (!orgId) {
    throw new Error('Organization context required for database access')
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: async () => {
          const token = await getToken({ template: 'supabase' })
          return token ? { Authorization: `Bearer ${token}` } : {}
        }
      }
    }
  )
  
  return supabase
}

// Validate organization context in every request
export function validateOrganizationAccess(requestedOrgId: string) {
  const { orgId } = auth()
  
  if (!orgId) {
    throw new Error('No organization context')
  }
  
  if (orgId !== requestedOrgId) {
    throw new Error('Cross-organization access denied')
  }
  
  return true
}
```

## 🛡️ Security Middleware

### **Organization Context Enforcement**
```typescript
// src/middleware/security.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'

export async function securityMiddleware(request: NextRequest) {
  const auth = getAuth(request)
  
  // Skip security for public routes
  if (isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.next()
  }
  
  // Require authentication
  if (!auth.userId) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
  
  // Require organization context for protected routes
  if (isProtectedRoute(request.nextUrl.pathname) && !auth.orgId) {
    return NextResponse.redirect(new URL('/select-organization', request.url))
  }
  
  // Validate organization access for API routes
  if (request.nextUrl.pathname.startsWith('/api/dashboard')) {
    const orgIdFromPath = extractOrgIdFromPath(request.nextUrl.pathname)
    if (orgIdFromPath && orgIdFromPath !== auth.orgId) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }
  
  // Add security headers
  const response = NextResponse.next()
  response.headers.set('X-Organization-ID', auth.orgId || '')
  response.headers.set('X-User-ID', auth.userId)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  return response
}

function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/',
    '/api/widget',
    '/api/webhooks',
    '/nl',
    '/en',
    '/sign-in',
    '/sign-up'
  ]
  
  return publicRoutes.some(route => pathname.startsWith(route))
}

function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith('/dashboard') || 
         pathname.startsWith('/api/dashboard')
}
```

### **API Route Protection**
```typescript
// src/lib/api-security.ts
import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { z } from 'zod'

export function withOrganizationSecurity<T extends Record<string, any>>(
  handler: (req: NextRequest, context: { orgId: string; userId: string; params: T }) => Promise<Response>
) {
  return async (req: NextRequest, { params }: { params: T }) => {
    const auth = getAuth(req)
    
    // Validate authentication
    if (!auth.userId) {
      return new Response('Unauthorized', { status: 401 })
    }
    
    if (!auth.orgId) {
      return new Response('Organization context required', { status: 403 })
    }
    
    // Validate CSRF token for state-changing operations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const csrfToken = req.headers.get('X-CSRF-Token')
      if (!csrfToken || !validateCSRFToken(csrfToken, auth.userId)) {
        return new Response('CSRF validation failed', { status: 403 })
      }
    }
    
    // Rate limiting per organization
    const rateLimitKey = `${auth.orgId}:${req.nextUrl.pathname}`
    if (await isRateLimited(rateLimitKey)) {
      return new Response('Rate limit exceeded', { status: 429 })
    }
    
    try {
      return await handler(req, {
        orgId: auth.orgId,
        userId: auth.userId,
        params
      })
    } catch (error) {
      // Log security events
      await logSecurityEvent({
        userId: auth.userId,
        orgId: auth.orgId,
        action: 'API_ERROR',
        path: req.nextUrl.pathname,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      throw error
    }
  }
}
```

## 🔐 Input Validation & Sanitization

### **Comprehensive Input Validation**
```typescript
// src/lib/validation.ts
import { z } from 'zod'

// Dutch business validation patterns
export const dutchValidation = {
  kvkNumber: z.string()
    .regex(/^\d{8}$/, 'KVK nummer moet 8 cijfers zijn')
    .refine(async (val) => await validateKVKNumber(val), 'Ongeldig KVK nummer'),
    
  btwNumber: z.string()
    .regex(/^NL\d{9}B\d{2}$/, 'BTW nummer moet format NL123456789B12 hebben')
    .refine(async (val) => await validateBTWNumber(val), 'Ongeldig BTW nummer'),
    
  postalCode: z.string()
    .regex(/^\d{4}\s?[A-Z]{2}$/, 'Ongeldige Nederlandse postcode'),
    
  phoneNumber: z.string()
    .regex(/^(\+31|0)[1-9]\d{8}$/, 'Ongeldig Nederlands telefoonnummer'),
    
  iban: z.string()
    .regex(/^NL\d{2}[A-Z]{4}\d{10}$/, 'Ongeldig Nederlands IBAN')
}

// Customer data validation
export const customerSchema = z.object({
  name: z.string()
    .min(2, 'Naam moet minimaal 2 karakters zijn')
    .max(100, 'Naam mag maximaal 100 karakters zijn')
    .regex(/^[a-zA-Z\s\-\'\.]+$/, 'Naam bevat ongeldige karakters'),
    
  email: z.string()
    .email('Ongeldig email adres')
    .max(255, 'Email adres te lang'),
    
  phone: dutchValidation.phoneNumber,
  
  address: z.object({
    street: z.string().min(1).max(100),
    houseNumber: z.string().max(10),
    postalCode: dutchValidation.postalCode,
    city: z.string().min(1).max(50)
  }),
  
  // Prevent XSS in notes
  notes: z.string()
    .max(1000, 'Notities mogen maximaal 1000 karakters zijn')
    .transform(sanitizeHTML)
    .optional()
})

// Job data validation
export const jobSchema = z.object({
  customerId: z.string().uuid('Ongeldige klant ID'),
  
  serviceType: z.enum([
    'leak_repair',
    'boiler_service', 
    'drain_cleaning',
    'installation',
    'maintenance',
    'emergency'
  ]),
  
  description: z.string()
    .min(10, 'Beschrijving moet minimaal 10 karakters zijn')
    .max(500, 'Beschrijving mag maximaal 500 karakters zijn')
    .transform(sanitizeHTML),
    
  scheduledAt: z.date()
    .min(new Date(), 'Geplande tijd moet in de toekomst zijn')
    .max(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'Geplande tijd te ver in de toekomst'),
    
  estimatedDuration: z.number()
    .min(15, 'Minimale duur is 15 minuten')
    .max(480, 'Maximale duur is 8 uur'),
    
  hourlyRate: z.number()
    .min(40, 'Minimum uurtarief is €40')
    .max(200, 'Maximum uurtarief is €200')
})

function sanitizeHTML(input: string): string {
  // Remove all HTML tags and dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

async function validateKVKNumber(kvk: string): Promise<boolean> {
  // Integrate with KVK API for real validation
  try {
    const response = await fetch(`https://api.kvk.nl/api/v1/naamgevingen/${kvk}`, {
      headers: { 'apikey': process.env.KVK_API_KEY! }
    })
    return response.ok
  } catch {
    return false
  }
}
```

### **SQL Injection Prevention**
```typescript
// src/lib/db-security.ts
import { db } from './db'

// Always use parameterized queries through Prisma
export class SecureDatabase {
  // ✅ Safe: Using Prisma's built-in parameterization
  static async findCustomers(orgId: string, searchTerm?: string) {
    return db.customer.findMany({
      where: {
        organizationId: orgId,
        ...(searchTerm && {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } }
          ]
        })
      }
    })
  }
  
  // ❌ Never use raw SQL with user input
  static async dangerousQuery(userInput: string) {
    throw new Error('Raw SQL queries with user input are forbidden')
  }
  
  // ✅ Safe: If raw SQL needed, use $queryRaw with parameters
  static async safeRawQuery(orgId: string, limit: number) {
    return db.$queryRaw`
      SELECT * FROM customers 
      WHERE organization_id = ${orgId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
  }
}
```

## 🔍 Security Monitoring & Auditing

### **Comprehensive Audit Logging**
```typescript
// src/lib/audit-system.ts
interface SecurityEvent {
  userId: string
  organizationId: string
  action: string
  resource: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export class SecurityAuditSystem {
  static async logEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    // Store in secure audit table
    await db.securityAuditLog.create({
      data: {
        ...event,
        timestamp: new Date(),
      }
    })
    
    // Alert on critical events
    if (event.severity === 'critical') {
      await this.sendSecurityAlert(event)
    }
  }
  
  static async logDataAccess(
    userId: string,
    orgId: string,
    table: string,
    operation: 'read' | 'write' | 'delete',
    recordCount: number
  ) {
    await this.logEvent({
      userId,
      organizationId: orgId,
      action: `DATA_${operation.toUpperCase()}`,
      resource: table,
      metadata: { recordCount },
      severity: operation === 'delete' ? 'high' : 'low'
    })
  }
  
  static async logAuthenticationEvent(
    userId: string,
    orgId: string,
    event: 'login' | 'logout' | 'failed_login' | 'password_change'
  ) {
    await this.logEvent({
      userId,
      organizationId: orgId,
      action: `AUTH_${event.toUpperCase()}`,
      resource: 'authentication',
      severity: event === 'failed_login' ? 'medium' : 'low'
    })
  }
  
  private static async sendSecurityAlert(event: SecurityEvent) {
    // Send to security monitoring system
    await fetch(process.env.SECURITY_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alert: 'CRITICAL_SECURITY_EVENT',
        event,
        timestamp: new Date()
      })
    })
  }
}
```

### **Intrusion Detection**
```typescript
// src/lib/intrusion-detection.ts
export class IntrusionDetection {
  // Detect suspicious access patterns
  static async detectSuspiciousActivity(userId: string, orgId: string) {
    const recentEvents = await db.securityAuditLog.findMany({
      where: {
        userId,
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      },
      orderBy: { timestamp: 'desc' }
    })
    
    const suspiciousPatterns = [
      this.detectRapidDataAccess(recentEvents),
      this.detectCrossOrgAttempts(recentEvents, orgId),
      this.detectUnusualDataVolume(recentEvents),
      this.detectOffHoursAccess(recentEvents)
    ]
    
    const detectedThreats = suspiciousPatterns.filter(Boolean)
    
    if (detectedThreats.length > 0) {
      await SecurityAuditSystem.logEvent({
        userId,
        organizationId: orgId,
        action: 'SUSPICIOUS_ACTIVITY_DETECTED',
        resource: 'system',
        metadata: { threats: detectedThreats },
        severity: 'critical'
      })
      
      // Temporarily throttle user access
      await this.applySecurityThrottle(userId)
    }
  }
  
  private static detectRapidDataAccess(events: any[]): string | null {
    const dataAccessEvents = events.filter(e => e.action.startsWith('DATA_'))
    if (dataAccessEvents.length > 50) {
      return 'Rapid data access detected'
    }
    return null
  }
  
  private static detectCrossOrgAttempts(events: any[], validOrgId: string): string | null {
    const crossOrgAttempts = events.filter(e => 
      e.organizationId !== validOrgId && 
      e.action.includes('ACCESS_DENIED')
    )
    if (crossOrgAttempts.length > 3) {
      return 'Cross-organization access attempts detected'
    }
    return null
  }
}
```

## 🛡️ Data Encryption & Privacy

### **Data Encryption at Rest**
```typescript
// src/lib/encryption.ts
import crypto from 'crypto'

export class DataEncryption {
  private static algorithm = 'aes-256-gcm'
  private static key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
  
  static encryptSensitiveData(data: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.algorithm, this.key)
    cipher.setAAD(Buffer.from('plumber-saas', 'utf8'))
    
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
  }
  
  static decryptSensitiveData(encryptedData: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':')
    
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const decipher = crypto.createDecipher(this.algorithm, this.key)
    
    decipher.setAAD(Buffer.from('plumber-saas', 'utf8'))
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }
}

// Encrypt sensitive customer data
export const customerDataEncryption = {
  encryptPersonalData: (customer: any) => ({
    ...customer,
    phone: DataEncryption.encryptSensitiveData(customer.phone),
    email: DataEncryption.encryptSensitiveData(customer.email),
    address: DataEncryption.encryptSensitiveData(JSON.stringify(customer.address))
  }),
  
  decryptPersonalData: (encryptedCustomer: any) => ({
    ...encryptedCustomer,
    phone: DataEncryption.decryptSensitiveData(encryptedCustomer.phone),
    email: DataEncryption.decryptSensitiveData(encryptedCustomer.email),
    address: JSON.parse(DataEncryption.decryptSensitiveData(encryptedCustomer.address))
  })
}
```

### **GDPR Compliance Implementation**
```typescript
// src/lib/gdpr-compliance.ts
export class GDPRCompliance {
  // Right to be forgotten
  static async deleteCustomerData(customerId: string, orgId: string) {
    // Validate organization access
    validateOrganizationAccess(orgId)
    
    // Log deletion request
    await SecurityAuditSystem.logEvent({
      userId: 'system',
      organizationId: orgId,
      action: 'GDPR_DELETE_REQUEST',
      resource: 'customer',
      resourceId: customerId,
      severity: 'high'
    })
    
    // Delete or anonymize related data
    await db.$transaction(async (tx) => {
      // Anonymize jobs instead of deleting (for business records)
      await tx.job.updateMany({
        where: { customerId, organizationId: orgId },
        data: {
          customerName: 'DELETED_CUSTOMER',
          customerEmail: 'deleted@privacy.local',
          customerPhone: 'DELETED'
        }
      })
      
      // Delete customer record
      await tx.customer.delete({
        where: { id: customerId, organizationId: orgId }
      })
      
      // Delete related documents
      await tx.document.deleteMany({
        where: { customerId, organizationId: orgId }
      })
    })
  }
  
  // Data portability
  static async exportCustomerData(customerId: string, orgId: string) {
    validateOrganizationAccess(orgId)
    
    const customerData = await db.customer.findUnique({
      where: { id: customerId, organizationId: orgId },
      include: {
        jobs: true,
        invoices: true,
        documents: true
      }
    })
    
    if (!customerData) {
      throw new Error('Customer not found')
    }
    
    // Log export request
    await SecurityAuditSystem.logEvent({
      userId: 'system',
      organizationId: orgId,
      action: 'GDPR_EXPORT_REQUEST',
      resource: 'customer',
      resourceId: customerId,
      severity: 'medium'
    })
    
    return {
      exportDate: new Date(),
      customerData: customerDataEncryption.decryptPersonalData(customerData),
      dataRetentionInfo: {
        legalBasis: 'Contract performance',
        retentionPeriod: '7 years (Dutch tax law)',
        deletionDate: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000)
      }
    }
  }
}
```

---

**This multi-tenant security guide provides complete security patterns with perfect data isolation, comprehensive audit logging, GDPR compliance, and Dutch market security requirements for the plumbing SaaS platform.**