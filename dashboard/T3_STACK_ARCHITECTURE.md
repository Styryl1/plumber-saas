# T3 Stack Architecture - Complete Implementation Guide

## Overview
Production-ready T3 Stack configuration for multi-tenant plumbing SaaS platform supporting 500+ organizations with perfect type safety and performance optimization.

## Core Stack Configuration

### Next.js Latest App Router Setup
```bash
npm create t3-app@latest plumbing-saas -- \
  --nextAuth \
  --prisma \
  --tailwind \
  --trpc \
  --appRouter

cd plumbing-saas
npm install @clerk/nextjs schedule-x @mollie/api-client
```

### TypeScript Latest Strict Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "~/*": ["./src/*"] }
  }
}
```

### tRPC Latest Implementation Patterns
```typescript
// src/server/api/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import { type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "~/server/db";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const { userId, orgId } = auth();
  return {
    db,
    userId,
    orgId,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId || !ctx.orgId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      userId: ctx.userId,
      orgId: ctx.orgId,
    },
  });
});
```

## Project Structure

```
plumbing-saas/
├── src/
│   ├── app/                     # Next.js Latest App Router
│   │   ├── (auth)/             # Public authentication pages
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   │   ├── jobs/           # Schedule-X calendar integration
│   │   │   │   └── page.tsx
│   │   │   ├── customers/      # Customer management
│   │   │   │   └── page.tsx
│   │   │   ├── invoices/       # Invoice system
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx      # Dashboard layout wrapper
│   │   ├── api/                # API routes and webhooks
│   │   │   ├── trpc/[trpc]/    # tRPC handler
│   │   │   │   └── route.ts
│   │   │   └── widget/         # Public widget APIs
│   │   │       ├── config/route.ts
│   │   │       ├── send-message/route.ts
│   │   │       └── start-session/route.ts
│   │   ├── layout.tsx          # Root layout with Clerk
│   │   └── page.tsx            # Landing page
│   ├── components/             # Shared UI components
│   │   ├── ui/                 # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── calendar.tsx    # Schedule-X wrapper
│   │   ├── layout/             # Layout components
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── NavigationRail.tsx
│   │   └── widget/             # Widget components
│   │       ├── ChatWidget.tsx
│   │       ├── BookingForm.tsx
│   │       └── FeedbackForm.tsx
│   ├── server/                 # Backend logic
│   │   ├── api/                # tRPC routers
│   │   │   ├── root.ts         # Root router
│   │   │   └── routers/        # Feature-specific routers
│   │   │       ├── jobs.ts
│   │   │       ├── customers.ts
│   │   │       ├── invoices.ts
│   │   │       └── widget.ts
│   │   ├── db.ts               # Prisma client
│   │   └── api/trpc.ts         # tRPC configuration
│   ├── lib/                    # Utilities and configurations
│   │   ├── ai/                 # AI model integration
│   │   │   ├── model-manager.ts
│   │   │   ├── gpt5-client.ts
│   │   │   └── claude-client.ts
│   │   ├── supabase.ts         # Supabase client
│   │   └── utils.ts            # Utility functions
│   ├── styles/
│   │   └── globals.css         # Global styles with Tailwind
│   ├── trpc/                   # tRPC client configuration
│   │   ├── react.tsx           # React Query integration
│   │   └── server.ts           # Server-side client
│   └── types/                  # Shared TypeScript types
│       ├── widget.ts
│       └── database.ts
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                     # Static assets
└── .env.example                # Environment variables template
```

## Prisma ORM Integration

### Schema Configuration
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Organization {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  jobs      Job[]
  customers Customer[]
  invoices  Invoice[]

  @@map("organizations")
}

model Job {
  id             String   @id @default(cuid())
  organizationId String
  customerId     String
  title          String
  description    String?
  status         JobStatus @default(SCHEDULED)
  scheduledAt    DateTime
  completedAt    DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  customer     Customer     @relation(fields: [customerId], references: [id])
  invoices     Invoice[]

  @@map("jobs")
}

enum JobStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

## Clerk Authentication Integration

### Root Layout Configuration
```tsx
// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import { TRPCReactProvider } from '~/trpc/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <TRPCReactProvider>
            {children}
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
```

### Dashboard Layout with Organization Context
```tsx
// src/app/(dashboard)/layout.tsx
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '~/components/layout/DashboardLayout'

export default async function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, orgId } = auth()

  if (!userId) {
    redirect('/sign-in')
  }

  if (!orgId) {
    redirect('/organization-selection')
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
```

## Real-time Subscriptions with Supabase

### Supabase Client Configuration
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Authenticated client with RLS
export const getSupabaseClient = () => {
  const { getToken } = auth()
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: async () => {
        const token = await getToken({ template: 'supabase' })
        return token ? { Authorization: `Bearer ${token}` } : {}
      },
    },
  })
}
```

## Development Commands

### Development Workflow
```bash
# Start development server (Next.js + tRPC)
npm run dev

# Database operations
npx prisma studio          # Visual database editor
npx prisma db push         # Push schema changes
npx prisma generate        # Regenerate Prisma client

# Build and deployment
npm run build              # Production build
npm start                  # Production server

# Type checking
npm run type-check         # TypeScript validation
```

### MCP Development Integration
```bash
# Add MCP servers for enhanced development
claude mcp add supabase "@supabase/mcp"
claude mcp add clerk "@clerk/mcp-server"
claude mcp add context7 "@upstash/context7"
claude mcp add playwright "@playwright/mcp"

# Use claude-code for context preservation
claude-code --resume
```

## Performance Optimization

### Bundle Optimization
```javascript
// next.config.mjs
/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    }
    return config
  },
}

export default config
```

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/plumbing_saas"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_KEY="your-service-key"

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# AI Models
OPENAI_API_KEY="sk-proj-..."
ANTHROPIC_API_KEY="sk-ant-api03-..."

# External Services
MOLLIE_API_KEY="test_..."
TWILIO_ACCOUNT_SID="AC..."
```

## Production Deployment

### Railway Configuration
```json
// package.json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev --turbo",
    "postinstall": "prisma generate"
  }
}
```

### Environment Setup
- **Single Service**: One Next.js app handles both frontend and API
- **Automatic Detection**: Railway detects Next.js and configures deployment
- **Database**: External Supabase PostgreSQL
- **Domain**: Custom domain pointing to Railway service

This T3 Stack architecture provides type-safe, scalable foundation for the multi-tenant plumbing SaaS platform with perfect integration between Next.js latest, tRPC current, Prisma latest, and Supabase current.