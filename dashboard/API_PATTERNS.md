# API Patterns - tRPC vs Direct API Decision Matrix

## Overview
Complete guide for API architecture decisions in multi-tenant plumbing SaaS platform. When to use tRPC vs Direct API routes, security patterns, and implementation strategies.

## Decision Matrix: tRPC vs Direct API

### Use tRPC When:
- ✅ **Authenticated dashboard functionality**
- ✅ **Type safety is critical**
- ✅ **Complex data relationships**
- ✅ **Real-time subscriptions needed**
- ✅ **Internal API consumption only**

### Use Direct API When:
- ✅ **Public widget endpoints**
- ✅ **Webhook receivers**
- ✅ **Third-party integrations**
- ✅ **Simple stateless operations**
- ✅ **External API consumption**

## tRPC Patterns for Dashboard

### Job Management Router
```typescript
// src/server/api/routers/jobs.ts
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const jobsRouter = createTRPCRouter({
  // List jobs with organization filtering
  list: protectedProcedure
    .input(z.object({
      status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']).optional(),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const jobs = await ctx.db.job.findMany({
        where: {
          organizationId: ctx.orgId,
          status: input.status,
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { scheduledAt: 'asc' },
        include: {
          customer: {
            select: { name: true, phone: true, address: true }
          }
        }
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (jobs.length > input.limit) {
        const nextItem = jobs.pop();
        nextCursor = nextItem!.id;
      }

      return { jobs, nextCursor };
    }),

  // Create new job with validation
  create: protectedProcedure
    .input(z.object({
      customerId: z.string(),
      title: z.string().min(1).max(200),
      description: z.string().optional(),
      scheduledAt: z.date().min(new Date()),
      estimatedDuration: z.number().min(30).max(480), // 30min to 8hrs
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate customer belongs to organization
      const customer = await ctx.db.customer.findFirst({
        where: {
          id: input.customerId,
          organizationId: ctx.orgId,
        }
      });

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found or access denied',
        });
      }

      // Check for scheduling conflicts
      const conflictingJob = await ctx.db.job.findFirst({
        where: {
          organizationId: ctx.orgId,
          scheduledAt: {
            gte: input.scheduledAt,
            lt: new Date(input.scheduledAt.getTime() + (input.estimatedDuration * 60000))
          },
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
        }
      });

      if (conflictingJob) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Time slot already booked',
        });
      }

      return ctx.db.job.create({
        data: {
          ...input,
          organizationId: ctx.orgId,
        },
        include: {
          customer: true,
        }
      });
    }),

  // Update job status with business logic
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
      completedAt: z.date().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.db.job.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.orgId,
        }
      });

      if (!job) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Job not found',
        });
      }

      // Business logic for status transitions
      if (input.status === 'COMPLETED' && !input.completedAt) {
        input.completedAt = new Date();
      }

      return ctx.db.job.update({
        where: { id: input.id },
        data: {
          status: input.status,
          completedAt: input.completedAt,
          notes: input.notes,
        }
      });
    }),
});
```

### Customer Management Router
```typescript
// src/server/api/routers/customers.ts
export const customersRouter = createTRPCRouter({
  // Search customers with Dutch postal code support
  search: protectedProcedure
    .input(z.object({
      query: z.string().min(2),
      postalCode: z.string().optional(),
      limit: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.customer.findMany({
        where: {
          organizationId: ctx.orgId,
          OR: [
            { name: { contains: input.query, mode: 'insensitive' } },
            { email: { contains: input.query, mode: 'insensitive' } },
            { phone: { contains: input.query } },
            { address: { contains: input.query, mode: 'insensitive' } },
          ],
          ...(input.postalCode && {
            postalCode: { startsWith: input.postalCode }
          })
        },
        take: input.limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { jobs: true }
          }
        }
      });
    }),

  // Create customer with Dutch validation
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(2).max(100),
      email: z.string().email().optional(),
      phone: z.string().regex(/^(\+31|0)[1-9][0-9]{8}$/, 'Invalid Dutch phone number'),
      address: z.string().min(5).max(200),
      postalCode: z.string().regex(/^[1-9][0-9]{3}\s?[A-Z]{2}$/i, 'Invalid Dutch postal code'),
      city: z.string().min(2).max(50),
    }))
    .mutation(async ({ ctx, input }) => {
      // Normalize postal code format
      const normalizedPostalCode = input.postalCode
        .replace(/\s/g, '')
        .toUpperCase()
        .replace(/^(\d{4})([A-Z]{2})$/, '$1 $2');

      return ctx.db.customer.create({
        data: {
          ...input,
          postalCode: normalizedPostalCode,
          organizationId: ctx.orgId,
        }
      });
    }),
});
```

## Direct API Patterns for Widget

### Session Management
```typescript
// src/app/api/widget/start-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '~/lib/supabase';

const startSessionSchema = z.object({
  organizationId: z.string(),
  userAgent: z.string().optional(),
  referrer: z.string().url().optional(),
  fingerprint: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, userAgent, referrer, fingerprint } = startSessionSchema.parse(body);

    // Create session with browser fingerprinting
    const { data: session, error } = await supabase
      .from('widget_sessions')
      .insert({
        organization_id: organizationId,
        user_agent: userAgent,
        referrer,
        fingerprint,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      sessionId: session.id,
      status: 'success'
    });

  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
```

### AI Chat Integration
```typescript
// src/app/api/widget/send-message/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ModelManager } from '~/lib/ai/model-manager';
import { supabase } from '~/lib/supabase';

const messageSchema = z.object({
  sessionId: z.string(),
  message: z.string().min(1).max(1000),
  organizationId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message, organizationId } = messageSchema.parse(body);

    // Validate session
    const { data: session } = await supabase
      .from('widget_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('organization_id', organizationId)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Store user message
    await supabase.from('widget_messages').insert({
      session_id: sessionId,
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Get organization config for AI personality
    const { data: orgConfig } = await supabase
      .from('organizations')
      .select('name, ai_personality, services')
      .eq('id', organizationId)
      .single();

    // Route to appropriate AI model
    const aiResponse = await ModelManager.processMessage({
      message,
      organizationContext: orgConfig,
      sessionHistory: await getSessionHistory(sessionId),
    });

    // Store AI response
    await supabase.from('widget_messages').insert({
      session_id: sessionId,
      type: 'assistant',
      content: aiResponse.content,
      metadata: {
        model: aiResponse.model,
        urgency_level: aiResponse.urgencyLevel,
        estimated_cost: aiResponse.estimatedCost,
        should_show_booking: aiResponse.shouldShowBooking,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      response: aiResponse.content,
      urgencyLevel: aiResponse.urgencyLevel,
      estimatedCost: aiResponse.estimatedCost,
      shouldShowBooking: aiResponse.shouldShowBooking,
    });

  } catch (error) {
    console.error('Message processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

async function getSessionHistory(sessionId: string) {
  const { data: messages } = await supabase
    .from('widget_messages')
    .select('type, content, timestamp')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true })
    .limit(10);

  return messages || [];
}
```

## Security Patterns

### Rate Limiting Implementation
```typescript
// src/lib/rate-limiter.ts
import { NextRequest } from 'next/server';

interface RateLimitConfig {
  requests: number;
  windowMs: number;
  keyGenerator?: (req: NextRequest) => string;
}

class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();

  async isAllowed(req: NextRequest, config: RateLimitConfig): Promise<boolean> {
    const key = config.keyGenerator?.(req) || this.getDefaultKey(req);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Clean expired entries
    this.cleanExpired(windowStart);

    const current = this.store.get(key);
    
    if (!current || current.resetTime < now) {
      this.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    if (current.count >= config.requests) {
      return false;
    }

    current.count++;
    return true;
  }

  private getDefaultKey(req: NextRequest): string {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    return `${ip}:${userAgent}`;
  }

  private cleanExpired(windowStart: number) {
    for (const [key, value] of this.store.entries()) {
      if (value.resetTime < windowStart) {
        this.store.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Usage in API routes
export async function rateLimit(req: NextRequest, config: RateLimitConfig) {
  const allowed = await rateLimiter.isAllowed(req, config);
  
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  return null;
}
```

### Input Validation Middleware
```typescript
// src/lib/validation-middleware.ts
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest, data: T) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json();
      const validatedData = schema.parse(body);
      return await handler(req, validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: error.errors 
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
  };
}
```

## Error Handling Patterns

### Centralized Error Handler
```typescript
// src/lib/error-handler.ts
import { TRPCError } from '@trpc/server';
import { NextResponse } from 'next/server';

export class APIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return NextResponse.json(
      { 
        error: error.message,
        code: error.code 
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: error.errors 
      },
      { status: 400 }
    );
  }

  // Default error response
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

export function handleTRPCError(error: unknown): TRPCError {
  if (error instanceof TRPCError) {
    return error;
  }

  if (error instanceof APIError) {
    return new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message,
    });
  }

  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
}
```

## Testing Patterns

### tRPC Testing
```typescript
// src/__tests__/api/jobs.test.ts
import { createTRPCMsw } from 'msw-trpc';
import { appRouter } from '~/server/api/root';

const trpcMsw = createTRPCMsw(appRouter);

describe('Jobs Router', () => {
  test('should list jobs for organization', async () => {
    const caller = appRouter.createCaller({
      db: mockDb,
      userId: 'user_123',
      orgId: 'org_123',
    });

    const result = await caller.jobs.list({ limit: 10 });
    
    expect(result.jobs).toHaveLength(5);
    expect(result.jobs[0].organizationId).toBe('org_123');
  });

  test('should prevent cross-organization access', async () => {
    const caller = appRouter.createCaller({
      db: mockDb,
      userId: 'user_123',
      orgId: 'org_456',
    });

    const result = await caller.jobs.list({});
    
    expect(result.jobs).toHaveLength(0);
  });
});
```

This API patterns guide ensures proper separation between authenticated dashboard functionality (tRPC) and public widget endpoints (Direct API) while maintaining security and type safety throughout the application.