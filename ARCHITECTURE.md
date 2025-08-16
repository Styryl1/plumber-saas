# 🏗️ Plumbing SaaS Platform - Technical Architecture

*Complete T3 Stack + Supabase + MCP Architecture Documentation*

## 🎯 Architecture Decision Summary

**Problem**: The previous vanilla JavaScript approach with 50+ files was breaking constantly, had no type safety, field name errors with Airtable, and couldn't scale.

**Solution**: Modern T3 Stack with MCP-powered development for type safety, scalability, and 10x faster development.

## 🚀 Core Technology Stack

### **Frontend Framework**
```yaml
Framework: Next.js 14 (App Router)
Language: TypeScript (strict mode)
Styling: Tailwind CSS + shadcn/ui
State Management: React Query (via tRPC)
Forms: React Hook Form + Zod validation
```

### **Backend & API**
```yaml
API Layer: tRPC (end-to-end type safety)
Database ORM: Prisma (type-safe queries)
Authentication: Clerk (multi-tenant)
Validation: Zod (runtime + compile-time)
File Uploads: Uploadthing (simpler than Supabase Storage)
```

### **Database & Storage**
```yaml
Database: Supabase PostgreSQL
Real-time: Supabase Realtime (WebSockets)
Storage: Supabase Storage (photos/videos)
Multi-tenancy: Row Level Security (RLS)
Caching: Built into tRPC + React Query
```

### **Calendar & UI**
```yaml
Calendar: Schedule-X (free, modern, drag-drop)
Components: shadcn/ui (Radix + Tailwind)
Icons: Lucide React
Charts: Recharts (for analytics)
```

### **Payments & Integrations**
```yaml
Payments: Mollie (iDEAL for Dutch market)
SMS/WhatsApp: Twilio
Email: Resend
Maps: Mapbox GL JS (better than Google Maps)
```

### **Development & Testing**
```yaml
Package Manager: npm
Build Tool: Next.js built-in (Turbopack)
Testing: Playwright MCP (browser automation)
Linting: ESLint + Prettier (T3 config)
Type Checking: TypeScript strict mode
```

### **Hosting & Deployment**
```yaml
Platform: Railway (everything in one place)
Domain: plumbingagent.nl
SSL: Automatic via Railway
CDN: Railway's global CDN
Database: Supabase Cloud (managed PostgreSQL)
```

## 🔧 Why T3 Stack is Perfect

### **Core Development Principles**
```typescript
// ✅ MANDATORY PRINCIPLES - NEVER VIOLATE
1. NO FALLBACK DATA - Real API data or error message only
   const { data, error } = api.jobs.list.useQuery()
   if (error) return <div>Error: {error.message}</div> // ✅ Real error
   // NEVER: const jobs = data || mockJobs // ❌ NO FAKE DATA

2. SHARED COMPONENTS = Faster development, fewer bugs  
   // ✅ Write once, use everywhere
   import { JobsCalendar } from '~/components/ui/calendar'
   // ❌ NEVER duplicate components

3. DELETE OLD CODE - Never layer
   // ✅ Complete replacement - old code deleted entirely  
   // ❌ NEVER keep old vanilla JS "just in case"

4. API-ONLY APPROACH - Consistent data flow
   // ✅ All data from tRPC APIs
   // ❌ NO hardcoded data anywhere
```

### **Type Safety Benefits**
```typescript
// Database schema defines types
model Job {
  id          String   @id @default(cuid())
  customerName String
  serviceType String  
  scheduledAt DateTime
}

// Prisma generates TypeScript types automatically
// tRPC shares these types to frontend
// No more field name errors!

const job = await ctx.db.job.create({
  data: {
    customerName: "Jan Bakker",
    serviceType: "Emergency Repairs", // TypeScript validates this exists
    scheduledAt: new Date(),
  }
})
// ✅ Full auto-complete and validation
```

### **No More Breaking Code**
- **Before**: 50 JS files, manual imports, runtime errors
- **After**: TypeScript catches errors at compile time
- **Before**: Field name guessing ("Job Type" vs "Service Type")
- **After**: Prisma schema is single source of truth

### **Faster Development**
- **Before**: Manual API setup, CORS issues, auth complexity
- **After**: tRPC handles API automatically with types
- **Before**: Multiple servers (frontend, backend, database)
- **After**: One Next.js app handles everything

## 🏢 Multi-Tenant Architecture

### **Business Model Structure**
```yaml
Individual Plumber Sites: Custom domains with embedded AI widget
Centralized AI Brain: Learns from all interactions across all customers  
Marketplace Integration: Seamless overflow when plumber unavailable
Data Isolation: Each plumber's data secure and private
Shared Intelligence: AI gets smarter from collective learning
```

### **Organization Isolation**
```typescript
// Clerk handles organization management
const { organization } = useOrganization()

// Supabase RLS ensures data isolation
CREATE POLICY "Users see own org data" ON jobs
  FOR ALL USING (
    organization_id = auth.jwt() ->> 'org_id'
  );

// Every query automatically filtered
const jobs = await ctx.db.job.findMany({
  where: {
    organizationId: ctx.auth.orgId // Automatically injected
  }
})
```

### **Subdomain Routing**
```typescript
// bros.plumbingagent.nl → Organization "bros"
// expert.plumbingagent.nl → Organization "expert"

// middleware.ts
export function middleware(req: NextRequest) {
  const hostname = req.nextUrl.hostname
  const subdomain = hostname.split('.')[0]
  
  // Route to correct organization
  const orgId = getOrgBySubdomain(subdomain)
  req.headers.set('x-organization-id', orgId)
}
```

## 📱 Mobile-First Strategy

### **Progressive Web App (PWA)**
```typescript
// Next.js PWA configuration
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

// Install prompt for mobile users
// Works like native app on phones
```

### **React Native Path**
```typescript
// Shared business logic
packages/
  shared/           # 80% code sharing
    api/           # tRPC client
    types/         # TypeScript types
    utils/         # Business logic
  web/             # Next.js app
  mobile/          # React Native app
```

## 🔄 Real-Time Features

### **Supabase Realtime**
```typescript
// Live job updates across all devices
const JobsCalendar = () => {
  const { data: jobs } = api.jobs.list.useQuery()
  
  useEffect(() => {
    const subscription = supabase
      .channel('jobs')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'jobs',
        filter: `organization_id=eq.${orgId}`
      }, (payload) => {
        // Update calendar instantly on all devices
        utils.jobs.list.invalidate()
      })
      .subscribe()
  }, [])
}
```

### **tRPC Subscriptions**
```typescript
// Real-time data with type safety
const jobUpdates = api.jobs.subscribe.useSubscription(
  { organizationId },
  {
    onData: (job) => {
      // TypeScript knows job structure
      showNotification(`Job ${job.customerName} updated`)
    }
  }
)
```

## 💳 Payment Integration

### **Mollie for Dutch Market**
```typescript
// server/api/routers/payments.ts
export const paymentsRouter = createTRPCRouter({
  createIdealPayment: protectedProcedure
    .input(z.object({
      invoiceId: z.string(),
      amount: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const payment = await mollieClient.payments.create({
        amount: {
          value: input.amount.toFixed(2),
          currency: 'EUR'
        },
        method: ['ideal', 'creditcard'],
        description: `Factuur ${input.invoiceId}`,
        redirectUrl: `${env.APP_URL}/invoices/${input.invoiceId}/success`,
        webhookUrl: `${env.APP_URL}/api/webhooks/mollie`,
        metadata: {
          invoiceId: input.invoiceId,
          organizationId: ctx.organization.id
        }
      })
      
      return payment._links.checkout.href
    })
})
```

## 📊 Database Schema

### **Core Tables**
```sql
-- Organizations (Plumber Companies)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  clerk_org_id TEXT UNIQUE,
  plan TEXT DEFAULT 'starter',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (Plumbers/Staff)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  clerk_user_id TEXT UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'technician',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs/Appointments
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  address TEXT,
  
  service_type TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'scheduled',
  priority TEXT DEFAULT 'normal',
  
  scheduled_at TIMESTAMPTZ NOT NULL,
  estimated_duration INTEGER, -- minutes
  
  amount DECIMAL(10,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Photos/Videos
CREATE TABLE job_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'before', 'after', 'during'
  media_type TEXT NOT NULL, -- 'photo', 'video'
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  job_id UUID REFERENCES jobs(id),
  invoice_number TEXT NOT NULL,
  
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL, -- BTW
  total DECIMAL(10,2) NOT NULL,
  
  status TEXT DEFAULT 'draft', -- draft, sent, paid, overdue
  mollie_payment_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ
);
```

### **Row Level Security**
```sql
-- Enable RLS on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_media ENABLE ROW LEVEL SECURITY;

-- Policies ensure perfect data isolation
CREATE POLICY "org_isolation_jobs" ON jobs
  USING (organization_id = auth.jwt() ->> 'organization_id');

CREATE POLICY "org_isolation_invoices" ON invoices  
  USING (organization_id = auth.jwt() ->> 'organization_id');
```

## 🏗️ Project Structure

```
plumbing-saas/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/            # Public pages (login, register)
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   ├── (dashboard)/       # Protected dashboard
│   │   │   ├── layout.tsx     # Dashboard layout
│   │   │   ├── page.tsx       # Overview dashboard
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx   # Schedule-X calendar
│   │   │   │   └── [id]/page.tsx # Job details
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx   # Customer list
│   │   │   │   └── [id]/page.tsx # Customer details
│   │   │   └── invoices/
│   │   │       ├── page.tsx   # Invoice list
│   │   │       └── [id]/page.tsx # Invoice details
│   │   ├── api/               # API routes
│   │   │   ├── webhooks/      # Mollie, Clerk webhooks
│   │   │   └── trpc/[trpc]/   # tRPC handler
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── calendar/         # Schedule-X components
│   │   ├── forms/            # Form components
│   │   └── layout/           # Layout components
│   ├── server/               # Backend code
│   │   ├── api/              # tRPC routers
│   │   │   ├── routers/
│   │   │   │   ├── jobs.ts   # Jobs CRUD
│   │   │   │   ├── customers.ts
│   │   │   │   ├── invoices.ts
│   │   │   │   └── payments.ts
│   │   │   ├── root.ts       # Root router
│   │   │   └── trpc.ts       # tRPC setup
│   │   └── db.ts             # Prisma client
│   ├── lib/                  # Utility libraries
│   │   ├── utils.ts          # General utilities
│   │   ├── supabase.ts       # Supabase client
│   │   └── mollie.ts         # Mollie client
│   ├── types/                # Shared TypeScript types
│   └── trpc/                 # tRPC client setup
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # SQL migrations
├── supabase/
│   ├── functions/            # Edge functions
│   └── migrations/           # Supabase migrations
├── public/                   # Static assets
├── .env.example              # Environment variables template
├── .mcp.json                 # MCP configuration
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies
├── tailwind.config.ts        # Tailwind configuration
└── tsconfig.json             # TypeScript configuration
```

## 💰 Cost Analysis

### **Development Costs (per month)**
```yaml
Free Tier:
  - Supabase: FREE (up to 500MB DB, 1GB storage, 2M edge functions)
  - Clerk: FREE (up to 10,000 monthly active users)
  - Railway: $5 (hobby tier)
  Total: $5/month

Production (up to 50 plumbers):
  - Railway Pro: $20
  - Supabase: FREE (still within limits)
  - Clerk: FREE (still within limits)
  Total: $20/month

Scale (up to 500 plumbers):
  - Railway: $50
  - Supabase Pro: $25
  - Clerk Pro: $25
  Total: $100/month

Enterprise (1000+ plumbers):
  - Railway: $100
  - Supabase Team: $599
  - Clerk Pro: $99
  Total: $798/month
```

### **Revenue Scaling**
```yaml
50 plumbers × €149/month = €7,450/month revenue
500 plumbers × €149/month = €74,500/month revenue  
1000 plumbers × €149/month = €149,000/month revenue

Profit Margins:
- 50 plumbers: €7,430/month profit (99.7% margin)
- 500 plumbers: €74,400/month profit (99.9% margin)
- 1000 plumbers: €148,202/month profit (99.5% margin)
```

## 🚀 Performance Optimizations

### **Next.js Optimizations**
```typescript
// Automatic code splitting
const JobsPage = dynamic(() => import('./jobs/page'), {
  loading: () => <JobsPageSkeleton />
})

// Image optimization
import Image from 'next/image'
<Image
  src="/job-photo.jpg"
  width={800}
  height={600}
  alt="Job photo"
  priority={false}
/>

// Font optimization
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
```

### **Database Optimizations**
```sql
-- Indexes for performance
CREATE INDEX idx_jobs_org_scheduled ON jobs(organization_id, scheduled_at);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_invoices_org_status ON invoices(organization_id, status);

-- Partial indexes for common queries
CREATE INDEX idx_jobs_today ON jobs(organization_id, scheduled_at) 
  WHERE scheduled_at::date = CURRENT_DATE;
```

### **Caching Strategy**
```typescript
// tRPC with React Query caching
const { data: jobs } = api.jobs.list.useQuery(
  { date: selectedDate },
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  }
)

// Optimistic updates
const createJob = api.jobs.create.useMutation({
  onMutate: async (newJob) => {
    // Cancel outgoing refetches
    await utils.jobs.list.cancel()
    
    // Snapshot previous value
    const previousJobs = utils.jobs.list.getData()
    
    // Optimistically update
    utils.jobs.list.setData(undefined, (old) => 
      old ? [...old, { ...newJob, id: 'temp' }] : [{ ...newJob, id: 'temp' }]
    )
    
    return { previousJobs }
  },
  onError: (err, newJob, context) => {
    // Rollback on error
    utils.jobs.list.setData(undefined, context?.previousJobs)
  },
  onSettled: () => {
    // Refetch after error or success
    utils.jobs.list.invalidate()
  },
})
```

## 🔒 Security Considerations

### **Authentication & Authorization**
```typescript
// Clerk handles authentication
// tRPC middleware enforces authorization
export const protectedProcedure = t.procedure
  .use(async ({ ctx, next }) => {
    if (!ctx.auth.userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
    
    return next({
      ctx: {
        auth: ctx.auth,
        organization: await getOrganization(ctx.auth.orgId)
      }
    })
  })
```

### **Data Validation**
```typescript
// Zod schemas validate all inputs
const createJobSchema = z.object({
  customerName: z.string().min(1).max(100),
  serviceType: z.enum(['Emergency Repairs', 'Leak Detection', 'Bathroom Renovation']),
  scheduledAt: z.date().min(new Date()),
  amount: z.number().positive().max(10000),
})

// Runtime validation prevents SQL injection
export const jobsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createJobSchema)
    .mutation(async ({ ctx, input }) => {
      // input is fully validated and typed
    })
})
```

### **Environment Variables**
```typescript
// env.mjs - Type-safe environment variables
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    CLERK_SECRET_KEY: z.string().min(1),
    MOLLIE_API_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    // ...
  }
})
```

## 📈 Monitoring & Analytics

### **Error Tracking**
```typescript
// Sentry integration
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})

// Automatic error tracking in tRPC
export const createTRPCRouter = t.router
```

### **Performance Monitoring**
```typescript
// Web Vitals tracking
export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric)
  
  // Send to analytics
  analytics.track('Web Vital', {
    name: metric.name,
    value: metric.value,
  })
}
```

### **Business Metrics**
```typescript
// Track important business events
const createJob = api.jobs.create.useMutation({
  onSuccess: (job) => {
    analytics.track('Job Created', {
      organizationId: job.organizationId,
      serviceType: job.serviceType,
      amount: job.amount,
    })
  }
})
```

---

## 🎯 Next Steps

1. **Create T3 app**: `npm create t3-app@latest plumbing-saas`
2. **Set up MCPs**: Configure Supabase, Clerk, Context7, Firecrawl
3. **Design database schema**: Use Supabase MCP
4. **Implement authentication**: Clerk organization setup
5. **Build Schedule-X calendar**: Jobs page with drag-drop
6. **Add payment integration**: Mollie iDEAL
7. **Deploy to Railway**: Production deployment

This architecture ensures type safety, scalability, and rapid development while maintaining the ability to scale to thousands of plumbers across the Netherlands.