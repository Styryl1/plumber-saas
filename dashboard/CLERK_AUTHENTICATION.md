# Clerk Authentication Patterns - Multi-Tenant Implementation

## 🎯 Overview
Complete Clerk authentication implementation for multi-tenant plumbing SaaS with organization-based isolation, role management, and Dutch market compliance.

## 🔐 Core Authentication Architecture

### **Clerk Organization Structure**
```typescript
// Organization-based multi-tenancy pattern
interface PlumberOrganization {
  id: string                    // org_2b1234567890abcdef
  name: string                  // "Van der Berg Loodgieters"
  slug: string                  // "van-der-berg-loodgieters"
  
  // Dutch business details
  metadata: {
    kvkNumber: string           // Dutch Chamber of Commerce
    btwNumber: string           // VAT number
    serviceArea: string[]       // ["Amsterdam", "Haarlem"]
    businessType: 'individual' | 'company'
    certifications: string[]   // ["VCA", "Gas-installateur"]
  }
  
  // Subscription and limits
  maxMembers: number           // Based on plan
  currentPlan: 'starter' | 'professional' | 'enterprise'
  billingEmail: string
  
  // Feature flags
  features: {
    aiChat: boolean
    voiceInvoice: boolean
    marketplaceAccess: boolean
    advancedReporting: boolean
  }
}
```

### **User Role Hierarchy**
```typescript
// Role-based access control within organizations
interface UserRoles {
  // Organization roles
  'org:owner': {
    permissions: ['*']          // Full access to everything
    description: 'Business owner with full control'
  }
  
  'org:admin': {
    permissions: [
      'users:manage',
      'billing:view',
      'settings:manage',
      'customers:*',
      'jobs:*',
      'invoices:*'
    ]
    description: 'Administrator with business management access'
  }
  
  'org:plumber': {
    permissions: [
      'jobs:view',
      'jobs:update',
      'customers:view',
      'customers:create',
      'invoices:create',
      'invoices:view'
    ]
    description: 'Field technician with job and customer access'
  }
  
  'org:office': {
    permissions: [
      'customers:*',
      'jobs:view',
      'jobs:create',
      'invoices:*',
      'scheduling:manage'
    ]
    description: 'Office staff with administrative access'
  }
  
  'org:viewer': {
    permissions: [
      'jobs:view',
      'customers:view',
      'invoices:view'
    ]
    description: 'Read-only access for reporting and oversight'
  }
}
```

## 🏗️ T3 Integration Patterns

### **Clerk Provider Setup**
```typescript
// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#059669',     // Emerald-600 brand color
          colorBackground: '#ffffff',
          colorInputBackground: '#ffffff',
          borderRadius: '0.5rem',
        },
        elements: {
          formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-700',
          card: 'shadow-xl border border-gray-200',
          headerTitle: 'text-emerald-600',
          dividerLine: 'bg-gray-200',
          formFieldLabel: 'text-gray-700 font-medium',
        }
      }}
    >
      <html lang="nl">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### **Organization Context Provider**
```typescript
// src/lib/organization-context.tsx
'use client'

import { useOrganization, useUser } from '@clerk/nextjs'
import { createContext, useContext, ReactNode } from 'react'

interface OrganizationContextType {
  organization: any
  membership: any
  isOwner: boolean
  isAdmin: boolean
  hasPermission: (permission: string) => boolean
  orgSlug: string | null
}

const OrganizationContext = createContext<OrganizationContextType | null>(null)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { organization, membership } = useOrganization()
  const { user } = useUser()
  
  const isOwner = membership?.role === 'org:owner'
  const isAdmin = membership?.role === 'org:admin' || isOwner
  
  const hasPermission = (permission: string): boolean => {
    if (isOwner) return true
    
    const rolePermissions = UserRoles[membership?.role as keyof typeof UserRoles]
    if (!rolePermissions) return false
    
    return rolePermissions.permissions.includes(permission) || 
           rolePermissions.permissions.includes('*')
  }
  
  return (
    <OrganizationContext.Provider value={{
      organization,
      membership,
      isOwner,
      isAdmin,
      hasPermission,
      orgSlug: organization?.slug || null
    }}>
      {children}
    </OrganizationContext.Provider>
  )
}

export const useOrganizationContext = () => {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganizationContext must be used within OrganizationProvider')
  }
  return context
}
```

### **Middleware Protection**
```typescript
// src/middleware.ts
import { authMiddleware } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/api/widget/(.*)',      // Widget API is public
    '/api/webhooks/(.*)',    // Webhook endpoints
    '/nl',                   // Dutch landing page
    '/en',                   // English landing page
  ],
  
  // Routes that require authentication but not organization
  ignoredRoutes: [
    '/api/auth/(.*)',
    '/select-organization',
    '/create-organization',
  ],
  
  // Organization-specific route protection
  afterAuth(auth, req) {
    // If user is not authenticated and trying to access protected route
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
    
    // If user is authenticated but no organization for dashboard routes
    if (auth.userId && !auth.orgId && req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/select-organization', req.url))
    }
    
    // Organization-based subdomain routing (future feature)
    const host = req.headers.get('host')
    if (host && host !== process.env.NEXT_PUBLIC_APP_URL) {
      const subdomain = host.split('.')[0]
      // Route to organization-specific dashboard
      if (subdomain && subdomain !== 'www') {
        return NextResponse.rewrite(new URL(`/org/${subdomain}${req.nextUrl.pathname}`, req.url))
      }
    }
    
    return NextResponse.next()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

## 🔒 Data Isolation Patterns

### **Organization-Scoped Database Queries**
```typescript
// src/lib/db-helpers.ts
import { auth } from '@clerk/nextjs'
import { db } from './db'

export async function getOrganizationDB() {
  const { orgId } = auth()
  
  if (!orgId) {
    throw new Error('Organization context required')
  }
  
  // Return organization-scoped database client
  return {
    // Jobs scoped to organization
    jobs: {
      findMany: (args?: any) => db.job.findMany({
        ...args,
        where: {
          ...args?.where,
          organizationId: orgId
        }
      }),
      
      create: (data: any) => db.job.create({
        data: {
          ...data,
          organizationId: orgId
        }
      }),
      
      update: (args: any) => db.job.update({
        ...args,
        where: {
          ...args.where,
          organizationId: orgId
        }
      }),
      
      delete: (args: any) => db.job.delete({
        ...args,
        where: {
          ...args.where,
          organizationId: orgId
        }
      })
    },
    
    // Customers scoped to organization
    customers: {
      findMany: (args?: any) => db.customer.findMany({
        ...args,
        where: {
          ...args?.where,
          organizationId: orgId
        }
      }),
      
      // ... similar pattern for other operations
    },
    
    // Organization settings
    organization: {
      findUnique: () => db.organization.findUnique({
        where: { clerkId: orgId }
      }),
      
      update: (data: any) => db.organization.update({
        where: { clerkId: orgId },
        data
      })
    }
  }
}
```

### **tRPC Context with Organization**
```typescript
// src/server/api/trpc.ts
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { getAuth } from '@clerk/nextjs/server'
import { db } from '~/server/db'

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req } = opts
  const auth = getAuth(req)
  
  return {
    db,
    auth,
    userId: auth.userId,
    orgId: auth.orgId,
  }
}

// Protected procedure that requires organization
export const orgProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  
  if (!ctx.auth.orgId) {
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: 'Organization context required'
    })
  }
  
  return next({
    ctx: {
      auth: ctx.auth,
      userId: ctx.auth.userId,
      orgId: ctx.auth.orgId,
    }
  })
})
```

## 🎨 UI Components

### **Organization Switcher**
```typescript
// src/components/layout/OrganizationSwitcher.tsx
import { OrganizationSwitcher } from '@clerk/nextjs'

export function CustomOrganizationSwitcher() {
  return (
    <OrganizationSwitcher
      appearance={{
        elements: {
          organizationSwitcherTrigger: 'border border-gray-300 rounded-lg px-3 py-2 bg-white',
          organizationSwitcherTriggerIcon: 'text-emerald-600',
          dropdownMenuContent: 'bg-white border border-gray-200 shadow-lg rounded-lg',
          dropdownMenuItem: 'hover:bg-emerald-50',
          organizationPreviewMainIdentifier: 'text-gray-900 font-medium',
          organizationPreviewSecondaryIdentifier: 'text-gray-500 text-sm',
        },
        variables: {
          colorPrimary: '#059669',
        }
      }}
      createOrganizationMode="modal"
      createOrganizationUrl="/create-organization"
      organizationProfileMode="modal"
      organizationProfileUrl="/organization-profile"
      afterCreateOrganizationUrl="/dashboard"
      afterLeaveOrganizationUrl="/select-organization"
      afterSelectOrganizationUrl="/dashboard"
    />
  )
}
```

### **Permission-Based Rendering**
```typescript
// src/components/auth/PermissionGuard.tsx
import { useOrganizationContext } from '~/lib/organization-context'
import { ReactNode } from 'react'

interface PermissionGuardProps {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { hasPermission } = useOrganizationContext()
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Usage in components
export function JobsActions() {
  return (
    <div className="flex gap-2">
      <PermissionGuard permission="jobs:create">
        <button className="btn-primary">
          Create Job
        </button>
      </PermissionGuard>
      
      <PermissionGuard permission="jobs:manage">
        <button className="btn-secondary">
          Manage Schedule
        </button>
      </PermissionGuard>
    </div>
  )
}
```

### **User Profile Integration**
```typescript
// src/components/layout/UserProfile.tsx
import { UserButton } from '@clerk/nextjs'

export function CustomUserProfile() {
  return (
    <UserButton
      appearance={{
        elements: {
          userButtonAvatarBox: 'w-10 h-10',
          userButtonPopoverCard: 'bg-white border border-gray-200 shadow-lg',
          userButtonPopoverActions: 'bg-gray-50',
          userButtonPopoverActionButton: 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700',
        },
        variables: {
          colorPrimary: '#059669',
        }
      }}
      afterSignOutUrl="/"
      userProfileMode="modal"
      userProfileUrl="/user-profile"
    >
      <UserButton.MenuItems>
        <UserButton.Link
          label="Dashboard"
          labelIcon={<i data-lucide="layout-dashboard" className="w-4 h-4" />}
          href="/dashboard"
        />
        <UserButton.Link
          label="Organization"
          labelIcon={<i data-lucide="building" className="w-4 h-4" />}
          href="/organization"
        />
        <UserButton.Action
          label="Support"
          labelIcon={<i data-lucide="help-circle" className="w-4 h-4" />}
          onClick={() => window.open('mailto:support@plumbingagent.nl')}
        />
      </UserButton.MenuItems>
    </UserButton>
  )
}
```

## 🔄 Organization Lifecycle Management

### **Organization Creation Flow**
```typescript
// src/app/(auth)/create-organization/page.tsx
'use client'

import { CreateOrganization } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function CreateOrganizationPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bedrijf aanmaken</h1>
          <p className="text-gray-600 mt-2">
            Maak uw loodgietersbedrijf aan om te beginnen
          </p>
        </div>
        
        <CreateOrganization
          appearance={{
            elements: {
              card: 'bg-white shadow-xl border border-gray-200 rounded-xl',
              headerTitle: 'text-emerald-600 text-xl font-bold',
              formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-700',
              formFieldLabel: 'text-gray-700 font-medium',
              formFieldInput: 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500',
            },
            variables: {
              colorPrimary: '#059669',
            }
          }}
          afterCreateOrganizationUrl="/dashboard"
        />
      </div>
    </div>
  )
}
```

### **Organization Selection**
```typescript
// src/app/(auth)/select-organization/page.tsx
'use client'

import { OrganizationList } from '@clerk/nextjs'

export default function SelectOrganizationPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bedrijf selecteren</h1>
          <p className="text-gray-600 mt-2">
            Kies het bedrijf waarmee u wilt werken
          </p>
        </div>
        
        <OrganizationList
          appearance={{
            elements: {
              card: 'bg-white shadow-xl border border-gray-200 rounded-xl',
              organizationListHeader: 'text-emerald-600 text-xl font-bold',
              organizationPreviewMainIdentifier: 'text-gray-900 font-medium',
              organizationPreviewSecondaryIdentifier: 'text-gray-500',
              organizationSwitcherTrigger: 'border border-emerald-300 hover:border-emerald-400',
            },
            variables: {
              colorPrimary: '#059669',
            }
          }}
          afterCreateOrganizationUrl="/dashboard"
          afterSelectOrganizationUrl="/dashboard"
          createOrganizationMode="modal"
        />
      </div>
    </div>
  )
}
```

## 📊 Analytics and Monitoring

### **Organization Usage Tracking**
```typescript
// src/lib/analytics.ts
import { auth } from '@clerk/nextjs'

export async function trackOrganizationEvent(event: string, properties?: Record<string, any>) {
  const { userId, orgId } = auth()
  
  if (!orgId) return
  
  // Track organization-level events
  await analytics.track({
    userId,
    event,
    properties: {
      ...properties,
      organizationId: orgId,
      timestamp: new Date(),
    }
  })
}

// Usage tracking in components
export function useOrganizationAnalytics() {
  const trackEvent = (event: string, properties?: Record<string, any>) => {
    trackOrganizationEvent(event, properties)
  }
  
  return { trackEvent }
}
```

### **Security Audit Logging**
```typescript
// src/lib/audit-logger.ts
interface AuditEvent {
  userId: string
  organizationId: string
  action: string
  resource: string
  resourceId?: string
  metadata?: Record<string, any>
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

export async function logAuditEvent(event: Omit<AuditEvent, 'timestamp'>) {
  await db.auditLog.create({
    data: {
      ...event,
      timestamp: new Date(),
    }
  })
}

// Usage in protected operations
export async function deleteCustomer(customerId: string) {
  const { userId, orgId } = auth()
  
  // Perform the deletion
  const result = await getOrganizationDB().customers.delete({
    where: { id: customerId }
  })
  
  // Log the audit event
  await logAuditEvent({
    userId: userId!,
    organizationId: orgId!,
    action: 'DELETE',
    resource: 'customer',
    resourceId: customerId,
  })
  
  return result
}
```

---

**This Clerk authentication guide provides complete multi-tenant authentication patterns with organization-based isolation, role management, and Dutch market compliance for the plumbing SaaS platform.**