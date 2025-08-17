# Multi-Tenant Patterns - Organization-Based Data Isolation

## Overview
Complete multi-tenant architecture patterns for plumbing SaaS supporting 500+ organizations with perfect data isolation, performance optimization, and Dutch market compliance.

## Architecture Overview

### Tenant Isolation Strategy
```
Single Database + Row Level Security (RLS)
├── Shared Infrastructure (Cost Effective)
├── Perfect Data Isolation (Security)
├── Scalable to 1000+ Organizations
└── Real-time Subscriptions per Tenant
```

### Benefits of This Approach
- **Cost Effective**: Single database reduces infrastructure costs
- **Maintenance**: One schema to maintain and update
- **Performance**: Shared resources with tenant-specific optimization
- **Security**: PostgreSQL RLS ensures perfect isolation
- **Real-time**: Supabase subscriptions filtered by organization
- **Compliance**: GDPR and Dutch business law compliant

## Clerk Organization Integration

### Organization Setup in Clerk
```typescript
// src/lib/clerk-organizations.ts
import { auth, clerkClient } from '@clerk/nextjs'

export async function createOrganizationWithDefaults(data: {
  name: string
  slug: string
  createdBy: string
}) {
  const organization = await clerkClient.organizations.createOrganization({
    name: data.name,
    slug: data.slug,
    createdBy: data.createdBy,
    publicMetadata: {
      plan: 'STARTER',
      industry: 'plumbing',
      country: 'Netherlands'
    },
    privateMetadata: {
      setupCompleted: false,
      trialStartDate: new Date().toISOString()
    }
  })

  // Create corresponding database record
  await createDatabaseOrganization({
    clerkId: organization.id,
    name: data.name,
    slug: data.slug
  })

  return organization
}

export async function getCurrentOrganization() {
  const { orgId } = auth()
  
  if (!orgId) {
    throw new Error('No organization selected')
  }

  return await clerkClient.organizations.getOrganization({
    organizationId: orgId
  })
}

export async function switchOrganization(orgId: string) {
  const { userId } = auth()
  
  if (!userId) {
    throw new Error('User not authenticated')
  }

  // Verify user has access to this organization
  const membership = await clerkClient.organizations.getOrganizationMembership({
    organizationId: orgId,
    userId
  })

  if (!membership) {
    throw new Error('Access denied to organization')
  }

  return membership
}
```

### Middleware for Organization Context
```typescript
// src/middleware.ts
import { authMiddleware } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export default authMiddleware({
  publicRoutes: [
    '/',
    '/api/widget/(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks/(.*)'
  ],
  
  afterAuth(auth, req) {
    // Handle unauthenticated users
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Dashboard routes require organization
    if (auth.userId && req.nextUrl.pathname.startsWith('/dashboard')) {
      if (!auth.orgId) {
        return NextResponse.redirect(new URL('/organization-selection', req.url))
      }

      // Add organization context to headers
      const response = NextResponse.next()
      response.headers.set('x-organization-id', auth.orgId)
      return response
    }

    return NextResponse.next()
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
}
```

## Database Multi-Tenant Implementation

### RLS Policy Patterns
```sql
-- Template for organization-scoped RLS policies
CREATE OR REPLACE FUNCTION create_organization_policy(
  table_name TEXT,
  policy_name TEXT DEFAULT NULL
) RETURNS void AS $$
DECLARE
  full_policy_name TEXT;
BEGIN
  full_policy_name := COALESCE(policy_name, 'organization_isolation_' || table_name);
  
  EXECUTE format('
    CREATE POLICY %I ON %I
    FOR ALL USING (organization_id::text = auth.org_id())
  ', full_policy_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- Apply to all tenant tables
SELECT create_organization_policy('jobs');
SELECT create_organization_policy('customers');
SELECT create_organization_policy('invoices');
SELECT create_organization_policy('materials');
SELECT create_organization_policy('employees');
```

### Organization Context in tRPC
```typescript
// src/server/api/trpc.ts
import { auth } from '@clerk/nextjs'
import { TRPCError } from '@trpc/server'
import { db } from '~/server/db'

export const createTRPCContext = async () => {
  const { userId, orgId, orgRole, orgSlug } = auth()
  
  // Get organization details if authenticated
  let organization = null
  if (orgId) {
    organization = await db.organization.findUnique({
      where: { clerkId: orgId },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        isActive: true
      }
    })
  }

  return {
    db,
    userId,
    orgId,
    orgRole,
    orgSlug,
    organization,
  }
}

// Middleware to ensure organization access
export const organizationProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId || !ctx.orgId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required'
    })
  }

  if (!ctx.organization) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Organization not found'
    })
  }

  if (!ctx.organization.isActive) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Organization is inactive'
    })
  }

  return next({
    ctx: {
      userId: ctx.userId,
      orgId: ctx.orgId,
      orgRole: ctx.orgRole,
      organization: ctx.organization,
    }
  })
})

// Role-based access control
export const adminProcedure = organizationProcedure.use(({ ctx, next }) => {
  if (ctx.orgRole !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required'
    })
  }

  return next({ ctx })
})
```

## Data Access Patterns

### Organization-Scoped Database Client
```typescript
// src/lib/organization-db.ts
import { auth } from '@clerk/nextjs'
import { db } from '~/server/db'

export class OrganizationDatabase {
  constructor(private organizationId: string) {}

  // Jobs with organization isolation
  get jobs() {
    return {
      findMany: (args?: any) => db.job.findMany({
        ...args,
        where: {
          organizationId: this.organizationId,
          ...args?.where
        }
      }),

      findUnique: (args: any) => db.job.findFirst({
        ...args,
        where: {
          id: args.where.id,
          organizationId: this.organizationId
        }
      }),

      create: (args: any) => db.job.create({
        ...args,
        data: {
          organizationId: this.organizationId,
          ...args.data
        }
      }),

      update: (args: any) => db.job.updateMany({
        ...args,
        where: {
          id: args.where.id,
          organizationId: this.organizationId
        }
      }),

      delete: (args: any) => db.job.deleteMany({
        where: {
          id: args.where.id,
          organizationId: this.organizationId
        }
      })
    }
  }

  // Customers with organization isolation
  get customers() {
    return {
      findMany: (args?: any) => db.customer.findMany({
        ...args,
        where: {
          organizationId: this.organizationId,
          ...args?.where
        }
      }),

      create: (args: any) => db.customer.create({
        ...args,
        data: {
          organizationId: this.organizationId,
          ...args.data
        }
      }),

      search: async (query: string) => db.customer.findMany({
        where: {
          organizationId: this.organizationId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query } },
            { address: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10
      })
    }
  }

  // Analytics with organization scope
  async getAnalytics(dateRange: { from: Date; to: Date }) {
    const [jobStats, customerStats, revenueStats] = await Promise.all([
      // Job statistics
      db.job.groupBy({
        by: ['status'],
        where: {
          organizationId: this.organizationId,
          createdAt: {
            gte: dateRange.from,
            lte: dateRange.to
          }
        },
        _count: true
      }),

      // Customer statistics
      db.customer.aggregate({
        where: {
          organizationId: this.organizationId,
          createdAt: {
            gte: dateRange.from,
            lte: dateRange.to
          }
        },
        _count: true
      }),

      // Revenue statistics
      db.invoice.aggregate({
        where: {
          organizationId: this.organizationId,
          status: 'PAID',
          invoiceDate: {
            gte: dateRange.from,
            lte: dateRange.to
          }
        },
        _sum: { total: true },
        _avg: { total: true },
        _count: true
      })
    ])

    return {
      jobs: jobStats,
      customers: customerStats,
      revenue: revenueStats
    }
  }
}

// Helper to get organization-scoped database
export async function getOrganizationDB(): Promise<OrganizationDatabase> {
  const { orgId } = auth()
  
  if (!orgId) {
    throw new Error('No organization context')
  }

  // Get organization ID from database
  const organization = await db.organization.findUnique({
    where: { clerkId: orgId },
    select: { id: true }
  })

  if (!organization) {
    throw new Error('Organization not found')
  }

  return new OrganizationDatabase(organization.id)
}
```

## Real-time Multi-Tenant Subscriptions

### Organization-Filtered Real-time Updates
```typescript
// src/hooks/useOrganizationRealtime.ts
import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '~/lib/supabase'

export function useOrganizationRealtime() {
  const { orgId } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!orgId) return

    const supabase = getSupabaseClient()
    
    // Get organization database ID
    const getOrgDatabaseId = async () => {
      const { data } = await supabase
        .from('organizations')
        .select('id')
        .eq('clerk_id', orgId)
        .single()
      
      return data?.id
    }

    getOrgDatabaseId().then(orgDatabaseId => {
      if (!orgDatabaseId) return

      // Subscribe to all organization data changes
      const channel = supabase
        .channel(`organization:${orgDatabaseId}`)
        
        // Jobs updates
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'jobs',
            filter: `organization_id=eq.${orgDatabaseId}`
          },
          (payload) => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] })
            
            // Trigger specific notifications based on event
            if (payload.eventType === 'UPDATE' && payload.new.status === 'COMPLETED') {
              showNotification('Job completed successfully!')
            }
          }
        )
        
        // Customer updates
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'customers',
            filter: `organization_id=eq.${orgDatabaseId}`
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
          }
        )
        
        // Invoice updates
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'invoices',
            filter: `organization_id=eq.${orgDatabaseId}`
          },
          (payload) => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
            
            if (payload.eventType === 'UPDATE' && payload.new.status === 'PAID') {
              showNotification('Payment received!')
            }
          }
        )
        
        .subscribe()

      return () => {
        channel.unsubscribe()
      }
    })

  }, [orgId, queryClient])
}

function showNotification(message: string) {
  // Integration with your notification system
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(message)
  }
}
```

## Performance Optimization for Multi-Tenancy

### Query Optimization Patterns
```typescript
// src/lib/query-optimization.ts
import { db } from '~/server/db'

export class OptimizedQueries {
  constructor(private organizationId: string) {}

  // Optimized job listing with pagination
  async getJobs(params: {
    limit?: number
    cursor?: string
    status?: string
    dateFrom?: Date
    dateTo?: Date
  }) {
    const { limit = 50, cursor, status, dateFrom, dateTo } = params

    return db.job.findMany({
      where: {
        organizationId: this.organizationId,
        ...(status && { status }),
        ...(dateFrom && dateTo && {
          scheduledAt: {
            gte: dateFrom,
            lte: dateTo
          }
        })
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
            address: true,
            postalCode: true
          }
        },
        _count: {
          select: {
            jobMaterials: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledAt: 'asc' }
      ],
      take: limit + 1, // Take one extra for cursor
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1
      })
    })
  }

  // Optimized search across multiple entities
  async globalSearch(query: string) {
    const searchTerms = query.split(' ').filter(term => term.length > 2)
    
    if (searchTerms.length === 0) return { jobs: [], customers: [], invoices: [] }

    const [jobs, customers, invoices] = await Promise.all([
      // Search jobs
      db.job.findMany({
        where: {
          organizationId: this.organizationId,
          OR: searchTerms.map(term => ({
            OR: [
              { title: { contains: term, mode: 'insensitive' } },
              { description: { contains: term, mode: 'insensitive' } },
              { address: { contains: term, mode: 'insensitive' } },
              { postalCode: { contains: term } }
            ]
          }))
        },
        include: {
          customer: { select: { name: true } }
        },
        take: 5
      }),

      // Search customers
      db.customer.findMany({
        where: {
          organizationId: this.organizationId,
          OR: searchTerms.map(term => ({
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { email: { contains: term, mode: 'insensitive' } },
              { phone: { contains: term } },
              { address: { contains: term, mode: 'insensitive' } }
            ]
          }))
        },
        take: 5
      }),

      // Search invoices
      db.invoice.findMany({
        where: {
          organizationId: this.organizationId,
          OR: searchTerms.map(term => ({
            OR: [
              { invoiceNumber: { contains: term } },
              { description: { contains: term, mode: 'insensitive' } }
            ]
          }))
        },
        include: {
          customer: { select: { name: true } }
        },
        take: 5
      })
    ])

    return { jobs, customers, invoices }
  }

  // Bulk operations with organization safety
  async bulkUpdateJobStatus(jobIds: string[], status: string) {
    return db.job.updateMany({
      where: {
        id: { in: jobIds },
        organizationId: this.organizationId // Security check
      },
      data: { status }
    })
  }
}
```

### Caching Strategies
```typescript
// src/lib/organization-cache.ts
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export class OrganizationCache {
  constructor(private organizationId: string) {}

  private key(suffix: string): string {
    return `org:${this.organizationId}:${suffix}`
  }

  // Cache organization settings
  async getSettings() {
    const cached = await redis.get(this.key('settings'))
    if (cached) {
      return JSON.parse(cached)
    }

    const settings = await db.organization.findUnique({
      where: { id: this.organizationId },
      select: {
        services: true,
        workingHours: true,
        pricing: true,
        aiPersonality: true
      }
    })

    if (settings) {
      await redis.setex(this.key('settings'), 3600, JSON.stringify(settings)) // 1 hour cache
    }

    return settings
  }

  // Cache frequently accessed customers
  async getFrequentCustomers() {
    const cached = await redis.get(this.key('frequent-customers'))
    if (cached) {
      return JSON.parse(cached)
    }

    const customers = await db.customer.findMany({
      where: { organizationId: this.organizationId },
      include: {
        _count: { select: { jobs: true } }
      },
      orderBy: {
        jobs: { _count: 'desc' }
      },
      take: 20
    })

    await redis.setex(this.key('frequent-customers'), 1800, JSON.stringify(customers)) // 30 min cache

    return customers
  }

  // Invalidate cache on updates
  async invalidateSettings() {
    await redis.del(this.key('settings'))
  }

  async invalidateCustomers() {
    await redis.del(this.key('frequent-customers'))
  }
}
```

## Data Migration and Tenant Onboarding

### New Organization Setup
```typescript
// src/lib/organization-setup.ts
import { db } from '~/server/db'
import type { OrganizationSetupData } from '~/types'

export async function setupNewOrganization(data: OrganizationSetupData) {
  return db.$transaction(async (tx) => {
    // 1. Create organization record
    const organization = await tx.organization.create({
      data: {
        clerkId: data.clerkId,
        name: data.name,
        slug: data.slug,
        email: data.email,
        phone: data.phone,
        
        // Dutch business defaults
        services: [
          'LEAK_REPAIR',
          'BOILER_SERVICE',
          'DRAIN_CLEANING',
          'INSTALLATION',
          'MAINTENANCE'
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
        },
        aiPersonality: 'professional'
      }
    })

    // 2. Create default materials catalog
    await tx.material.createMany({
      data: [
        {
          organizationId: organization.id,
          name: 'PVC Buis 110mm',
          category: 'Leidingen',
          costPrice: 15.50,
          sellPrice: 20.15,
          btwRate: 21.00,
          currentStock: 10,
          minStock: 5,
          unit: 'meter'
        },
        {
          organizationId: organization.id,
          name: 'Kraan 1/2"',
          category: 'Kranen',
          costPrice: 25.00,
          sellPrice: 32.50,
          btwRate: 21.00,
          currentStock: 20,
          minStock: 10,
          unit: 'stuk'
        }
        // Add more default materials
      ]
    })

    // 3. Create owner employee record
    await tx.employee.create({
      data: {
        organizationId: organization.id,
        clerkUserId: data.ownerClerkId,
        firstName: data.ownerFirstName,
        lastName: data.ownerLastName,
        email: data.email,
        role: 'OWNER',
        hourlyRate: 75.00,
        hiredAt: new Date()
      }
    })

    return organization
  })
}
```

This multi-tenant architecture provides perfect data isolation, scalable performance, and comprehensive organization management for the plumbing SaaS platform supporting 500+ organizations.