# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workspace Structure

**Working Directory**: `C:\Users\styry` (workspace root)
**Active Project**: `plumbing-agent/` - Netherlands emergency plumber SaaS

## Claude Code Workflow (MANDATORY)

### Role Definition
- **Claude Code**: Main implementation executor (this instance)
- **ChatGPT**: Strategic planner, super prompt creator, complex problem solver
- **User**: Uses `/init` command to load context, makes small targeted requests

### Standard Initialization Pattern
```bash
# User always starts with:
/init  # Analyzes codebase, loads context, suggests improvements

# Then provides targeted requests like:
- "Fix the TypeScript errors in customer router"
- "Add Dutch translations for invoice components"  
- "Implement the customer picker in job creation"
```

### Handoff from ChatGPT Super Prompts
When implementing ChatGPT-created super prompts:
1. **Read**: `plumbing-agent/Docs/Claude_super_prompt.md` template
2. **Apply**: Technical patterns from this CLAUDE.md
3. **Execute**: Following diff budget (≤10 files, ≤300 LOC)
4. **Validate**: Using `pnpm check` and `pnpm guard` pipeline

**Key Principle**: Small, targeted changes with immediate validation  
**Tool Policy**: Always use MCP tools directly - never use Task tool or specialist agents

## Essential Commands

```bash
cd plumbing-agent
pnpm dev          # localhost:3000 (development server)
pnpm check        # MANDATORY after every 2-3 file edits (TypeScript + pretypecheck)
pnpm guard        # Complete validation pipeline (includes i18n:check) - run at end
pnpm lint         # ESLint only - for targeted debugging when needed
pnpm context      # Bundle for ChatGPT collaboration
pnpm clean        # Clear build artifacts and caches

# Specialized commands (use when targeted)
pnpm lint:fix     # Auto-fix linting issues  
pnpm i18n:sync    # Sync Dutch/English translations
pnpm guard-safe   # Safe guard version (doesn't fail on minor issues)
```

## Tech Stack & Versions

- **Next.js 15.5.2** (App Router only), **React 19.1.1**, **TypeScript 5.9.2**
- **tRPC v11.5.0**, **Supabase PostgreSQL**, **Clerk v6.31.6** (multi-tenant)
- **shadcn/ui**, **Tailwind CSS v4**, **Schedule-X v3.0.0** (Temporal polyfill)
- **next-intl v4.3.5** (Dutch primary, English fallback)
- **Biome v2.2.2** (formatter), **ESLint v9** (linter), **Playwright** (testing)
- **Zod v4.1.4** (validation), **React Hook Form v7.62.0**, **@tanstack/react-query v5.85.5**

## Critical Rules

1. **Run `pnpm check` after every 2-3 file edits** - prevents TypeScript accumulation (includes pretypecheck)
2. **Use `~/` imports only** - no relative imports (`../`) allowed (ESLint enforced)
3. **i18n canonical pattern** - namespace hooks, read leaf strings only (prevents INSUFFICIENT_PATH errors)
4. **Zero ESLint suppressions** - fix root issues, never disable rules (complete ban in eslint.config.mjs)
5. **MCP testing only** - no `.spec.ts` files, use `mcp__playwright__*` tools
6. **Node.js 22.18.0 required** - enforced by engines and volta config
7. **Anti-placeholder protection** - custom ESLint rules prevent "Tijdelijke klant" and hardcoded IDs

## CRITICAL: Things Claude Code Must Never Miss

### Types, Zod & Nullish (CRITICAL - Prevents Type Errors)
```typescript
// ✅ CORRECT: Zod v4 only - use top-level format functions
z.url(), z.uuid(), z.iso.datetime(), z.enum([...])

// ❌ WRONG: Deprecated Zod v3 patterns
z.string().url(), z.string().uuid()  // Breaks in v4!

// ✅ CORRECT: Respect exactOptionalPropertyTypes
const value = data?.field ?? undefined;  // Use ?? for null|undefined only
const count = items.length;  // Don't add fake defaults for non-nullable

// ❌ WRONG: Using || for defaults or ! assertions
const value = data?.field || "default";  // Wrong operator
const id = data.id!;  // Banned except in generated files

// ✅ CORRECT: Map DB null → undefined in mappers
export const mapCustomer = (db: DbCustomer) => ({
  email: db.email ?? undefined,  // DB null becomes undefined for optional fields
});
```

### Time & Dates (CRITICAL - Never Use Date)
```typescript
// ✅ CORRECT: Always use Temporal with Europe/Amsterdam
const now = Temporal.Now.zonedDateTimeISO("Europe/Amsterdam");
const parsed = parseZdt(isoString);  // Use our helpers
const comparison = Temporal.ZonedDateTime.compare(date1, date2);

// ❌ WRONG: Any Date usage
const now = new Date();  // BANNED - triggers ESLint error
const parsed = new Date(isoString);  // BANNED
```

### Money & Precision (CRITICAL - Financial Accuracy)
```typescript
// ✅ CORRECT: Integer cents everywhere
const priceCents = 1250;  // €12.50
const totalCents = qty * priceCents;
const displayPrice = (totalCents / 100).toLocaleString('nl-NL', {
  style: 'currency', currency: 'EUR'
});

// ❌ WRONG: Float calculations or locale parsing
const price = 12.50;  // Precision errors
const total = price * qty;  // Accumulates errors
```

### Layering & Boundaries (CRITICAL - Architecture)
```typescript
// ✅ CORRECT: Maintain DTO boundaries
import type { CustomerDTO } from "~/types/customer";  // UI uses DTOs
const customer = await ctx.db.from("customers").select("*");  // Server uses DB types

// ❌ WRONG: Leaking RouterOutputs or DB types into UI
import type { RouterOutputs } from "~/trpc/shared";  // BANNED in components
```

### i18n (CRITICAL - No UI Literals)
```typescript
// ✅ CORRECT: Always use translation keys
const tCustomers = useTranslations('customers');
<Button>{tCustomers('actions.create')}</Button>

// ❌ WRONG: Any hardcoded strings in UI
<Button>Create Customer</Button>  // BANNED - triggers ESLint error
<Button>Nieuwe klant</Button>     // BANNED - triggers ESLint error
```

### ESLint & Boolean Checks (CRITICAL - Strict Mode)
```typescript
// ✅ CORRECT: Explicit boolean checks
if (items.length > 0) { }          // Arrays
if (text.trim().length > 0) { }    // Strings  
if (count >= 0) { }                // Numbers
if (user != null) { }              // Nullish

// ❌ WRONG: Truthiness checks (triggers strict-boolean-expressions)
if (items) { }        // BANNED
if (text) { }         // BANNED  
if (count) { }        // BANNED
```

### Common Pitfalls (IMMEDIATE ESCALATION)
1. **Adding ?? defaults where type is non-nullable** - triggers `no-unnecessary-condition`
2. **Truthiness checks on arrays/strings** - triggers `strict-boolean-expressions` 
3. **JSX literals instead of i18n keys** - triggers `i18next/no-literal-string`
4. **Using Date for comparisons** - triggers `no-restricted-globals`
5. **Editing `src/types/supabase.ts`** - NEVER edit generated files
6. **Importing legacy code** - triggers import restrictions
7. **Returning `any` from functions** - triggers TypeScript strict mode
8. **Missing feature flag checks** - UI shows unreleased features

### Supabase, Schema & RLS (CRITICAL - Database Integrity)
```typescript
// ✅ CORRECT: After any migration workflow
// 1. Apply migration via MCP supabase tools
// 2. Regenerate Supabase TS types
// 3. Verify no schema drift in acceptance tests

// ✅ CORRECT: Proper UUID handling
const customerId = z.uuid().parse(input.customerId);  // Validate UUIDs
const clerkUserId = "user_abc123";  // Clerk IDs are strings, not UUIDs

// ❌ WRONG: Passing Clerk IDs where UUIDs expected
await db.from("customers").eq("id", clerkUserId);  // Type error!

// ✅ CORRECT: Keep RLS policies correct
// Never edit policy helpers casually - they affect security
```

### Provider Architecture - Invoices (CRITICAL - Financial Workflow)
```typescript
// ✅ CORRECT: Provider is source of truth after send
// Link PDF/UBL/PaymentURL from provider response
const invoice = {
  providerInvoiceId: response.invoice_id,
  pdfUrl: response.pdf_url,
  paymentUrl: response.payment_url
};

// ❌ WRONG: Don't reintroduce local invoice numbers in send flow
// Legacy invoice numbers are read-only for compatibility

// ✅ CORRECT: Gate provider features behind feature flags
if (env.INVOICING_MONEYBIRD === "true") {
  // Show Moneybird features
}

// ❌ WRONG: No hardcoded provider data or mock IDs in UI
const mockInvoice = { id: "inv_123" };  // BANNED
```

### Next.js & Client/Server Split (CRITICAL - Bundle Security)
```typescript
// ✅ CORRECT: Mark client components explicitly
"use client";
import { useState } from "react";

// ✅ CORRECT: Keep server-only imports server-only
import "server-only";
import { serverOnlyEnv } from "~/lib/env";

// ❌ WRONG: Never import server secrets into client code
import { env } from "~/lib/env";  // Contains server secrets!

// ✅ CORRECT: Use stable import aliases consistently
import { Button } from "~/components/ui/button";

// ❌ WRONG: Deep relative spaghetti imports
import { Button } from "../../../components/ui/button";
```

### UI Micro-rules - Provider Components (CRITICAL - Consistency)
```typescript
// ✅ CORRECT: ProviderBadge components
<ProviderBadge 
  variant="outline"  // Only allowed Badge variants
  provider={invoice.provider ?? null}  // Nullable unions
  className="text-green-600"  // Color nuances via className
/>

// ✅ CORRECT: External links with security
<Link 
  href={paymentUrl}
  rel="noopener noreferrer"
  target="_blank"
>
  {t("actions.pay")}  // Translated labels
</Link>

// ❌ WRONG: Hardcoded labels or missing security
<Link href={url}>Pay Now</Link>  // Missing rel + hardcoded text
```

### Process Discipline (MANDATORY)
- **Touch Map**: Create/Edit/Don't Touch lists for every change
- **Diff Budget**: ≤10 files / ≤300 LOC per change
- **Check After Edits**: Run `pnpm check` after every 1-2 file edits
- **Final Validation**: `pnpm guard` before completion (includes i18n:check)
- **Escalation Rule**: >3 TypeScript errors = stop and escalate to ChatGPT
- **Tool Usage**: Use MCP tools directly (`mcp__supabase__*`, `mcp__playwright__*`) - NO Task/Agent tools

## Advanced ESLint Configuration

### Custom Rule Enforcement (CRITICAL - Quality Assurance)
```javascript
// eslint.config.mjs implements industry-leading code quality rules:

// 1. COMPLETE BAN on eslint-disable comments
"eslint-comments/no-use": "error",
"eslint-comments/no-restricted-disable": ["error", "*"],

// 2. Temporal enforcement (Date constructor banned)
"no-restricted-globals": ["error", { 
  "name": "Date", 
  "message": "Use Temporal.* instead" 
}],

// 3. Environment variable protection
"no-process-env": "error",  // Forces use of ~/lib/env.ts

// 4. Anti-placeholder AST detection
"no-restricted-syntax": ["error", {
  "selector": "Literal[value='Tijdelijke klant']",
  "message": "Banned placeholder string"
}],

// 5. Dutch locale enforcement
"selector": "CallExpression[callee.property.name='toLocaleDateString'][arguments.0.value!='nl-NL']",
"message": "Must use nl-NL locale for Dutch market compliance"
```

### Custom Local Rules
- **Location**: `tools/eslint-rules/no-banned-strings.js`
- **Purpose**: Advanced placeholder detection beyond static AST patterns
- **Scope**: Catches dynamic placeholder generation and variations

## Architecture Patterns

### Zod v4 Validation Pattern (CRITICAL - API Breaking)
```typescript
// ✅ CORRECT (Zod v4): Top-level format schemas
const schema = z.object({
  email: z.email().max(255, { error: "E-mail too long" }),
  phone: z.string().regex(/^\+?[0-9]+$/, { message: "Invalid phone" }),
  uuid: z.uuid(),
  amount: z.number().positive()
});

// ❌ WRONG (Zod v3 deprecated): Chained string methods
const schema = z.object({
  email: z.string().email("Invalid email").max(255),  // BREAKS IN v4!
  phone: z.string().regex(/^\+?[0-9]+$/),
  uuid: z.string().uuid(),
  amount: z.number().positive()
});
```

### i18n Pattern (CRITICAL - Prevents UI Failures)
```typescript
// ✅ CORRECT: Prevents INSUFFICIENT_PATH runtime errors
const tCustomers = useTranslations('customers');
const tForm = useTranslations('customers.form');
<Label>{tForm('name.label')}</Label>  // Reads string

// ❌ WRONG: Causes component render failures
const t = useTranslations();
<Label>{t('customers.form.name')}</Label>  // Reads object!
```

### RLS Security Pattern (CRITICAL - Multi-tenant Isolation)
```typescript
// ✅ CORRECT: Use tRPC context with RLS-aware client
export const customerRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // ctx.db uses JWT-based RLS policies
    const customers = await ctx.db
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    return customers.data ?? [];
  })
});

// ❌ WRONG: Direct service-role bypasses RLS
const supabase = createClient(url, serviceRoleKey);  // NEVER do this!
const customers = await supabase.from("customers").select("*");
```

### Dutch Locale Requirements
```typescript
// Always use nl-NL formatting for Dutch market
date.toLocaleDateString('nl-NL')  // "31-12-2025"
time.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })  // "13:30"

// Currency formatting with Euro symbol
amount.toLocaleString('nl-NL', { 
  style: 'currency', 
  currency: 'EUR' 
})  // "€ 125,50"

// Dutch BTW (VAT) compliance
const BTW_RATE = 0.21;  // 21% standard rate
const total = subtotal * (1 + BTW_RATE);
```

### Schedule-X Calendar Integration
```typescript
// Global Temporal polyfill required (loaded first)
import "~/lib/time";  // Must be imported before Schedule-X

// Use only these Temporal helper functions from ~/lib/time.ts
import { parseZdt, zdtToISO, parseDate, dateToISODate, epochMs } from "~/lib/time";

// Employee color system (deterministic)
const color = getEmployeeColor(employeeId);  // Consistent across views

// Temporal timezone constant (Europe/Amsterdam)
const TZ = "Europe/Amsterdam";
```

### File Structure Context
```
src/
├── app/(dashboard)/          # Protected routes with Clerk authentication
├── app/api/                  # Next.js API routes (webhooks, health checks)
├── server/api/routers/       # tRPC endpoints (business logic layer)
├── server/mappers/           # DTO layer (prevents DB type leakage)
├── server/db/sql/           # Migrations (apply via MCP supabase tools)
├── server/security/          # RLS policies and security utilities
├── components/ui/            # shadcn components (exempt from i18n rules)
├── components/calendar/      # Schedule-X calendar components
├── i18n/messages/           # Nested JSON: Dutch primary, English fallback
├── lib/                     # Utilities (env, time, validation)
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript type definitions
└── schema/                  # Zod validation schemas
```

### Import Alias Pattern
```typescript
// ✅ ALWAYS use ~/alias for internal imports
import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"
import { env } from "~/lib/env"

// ❌ NEVER use relative imports (ESLint enforced)
import { Button } from "../../components/ui/button"
```

## Common Issues & Solutions

### TypeScript Errors After Updates
**Issue**: Multiple TypeScript errors after dependency updates  
**Solution**: Run `pnpm check` after every 2-3 edits  
**Escalation**: >3 errors = `pnpm context` → ChatGPT

### ESLint Rule Violations
**Issue**: Strict ESLint rules prevent common patterns  
**Key Rules**: No `eslint-disable` comments allowed, no Date constructor, no `process.env` outside `~/lib/env.ts`
**Solution**: Fix root cause or refactor approach - never suppress rules

### i18n INSUFFICIENT_PATH Errors
**Issue**: Components fail to render with translation path errors  
**Cause**: Reading translation objects instead of leaf strings  
**Solution**: Use namespaced hooks at deepest container level

### Anti-Placeholder Detection
**Issue**: Custom ESLint rules flag placeholder strings/IDs
**Triggers**: "Tijdelijke klant", hardcoded IDs, placeholder variables
**Solution**: Use proper data flow or constants from API/database

### Supabase RLS Issues
**Issue**: Database queries return empty or fail  
**Solution**: Use `ctx.db` from tRPC context (RLS-aware), never direct service-role
**Tools**: `mcp__supabase__*` tools for migrations/queries

### Schedule-X Calendar Issues  
**Issue**: Calendar performance or rendering problems
**Solution**: Ensure Temporal polyfill loaded first via `src/lib/time.ts`

### Build Failures
**Quick Fix**: `pnpm clean && pnpm build`
**Deep Fix**: `pnpm guard` for full validation

## Escalation Protocol

**Escalate to ChatGPT after**:
- 3+ consecutive ESLint/TypeScript failures
- Any attempt to add ESLint suppressions (they're banned by config)
- Complex type system conflicts
- Architecture decisions beyond single-file changes

**Command**: `pnpm context` → create focused bundle for AI collaboration

## Automation Scripts & Quality Gates

### Critical Scripts (Located in `/scripts/`)
```bash
# Quality assurance automation
pnpm guard        # Complete pipeline: format, lint, typecheck, build, i18n, custom rules
pnpm guard-safe   # Safe version that doesn't fail on minor issues

# Pre-execution checks
preinstall        # Validates Node.js 22.18.0 requirement
pretypecheck.mjs  # Validates TypeScript before compilation

# i18n automation
pnpm i18n:sync    # Synchronizes Dutch/English translation files
pnpm i18n:prune   # Removes orphaned translation keys
pnpm i18n:check   # Validates translation completeness and structure
i18n-fix-literals # Converts hardcoded strings to translation keys

# Code quality validation
check-placeholders.mjs    # 4-layer anti-placeholder protection
check-imports.mjs         # Validates ~/alias import consistency  
check-routes.mjs          # Validates App Router structure
check-encoding.mjs        # UTF-8 encoding validation
audit-production-rules.mjs # Production readiness validation
```

### Guard Pipeline (Complete Validation - Run at End Only)
`pnpm guard` includes all validation steps:
1. **Biome Format** - Code formatting consistency
2. **Biome Check** - Additional code quality checks  
3. **ESLint** - Strict rule enforcement (no suppressions allowed)
4. **Pretypecheck** - Pre-TypeScript validation  
5. **TypeScript Check** - Strict type validation
6. **Import Validation** - ~/alias consistency check
7. **Route Validation** - App Router structure check
8. **Encoding Check** - UTF-8 file encoding validation
9. **Placeholder Check** - Anti-placeholder protection
10. **i18n Prune** - Remove unused translation keys
11. **i18n Check** - Validate translation completeness
12. **Production Rules** - Production readiness audit
13. **Next.js Build** - Full production build test

**Usage**: Only run `pnpm guard` at completion - it's comprehensive and slow

## Environment Requirements

**Node.js**: 22.18.0 (enforced by volta + engines config)
**Package Manager**: pnpm >= 9.0.0 (uses packageManager field)
**IDE**: Configure to use project's ESLint config (no rule suppressions allowed)

## Testing Strategy

**Framework**: Playwright via MCP tools (no traditional test files)
**Commands**: Use `mcp__playwright__*` functions for browser automation  
**Accessibility**: `mcp__playwright__browser_snapshot` for full DOM analysis
**Integration**: Real localhost:3000 testing during development

**IMPORTANT**: Use MCP tools directly, NOT Task/Agent tools (avoid Task tool and specialist agents)

## Environment Variables

```bash
# Required for development
SUPABASE_URL=https://...                 # Supabase project URL
SUPABASE_ANON_KEY=eyJ...                # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # Service role (webhooks only)
SUPABASE_JWT_SECRET=...                 # Required for RLS JWT minting

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_... # Clerk frontend auth
CLERK_SECRET_KEY=sk_...                  # Clerk backend auth
CLERK_WEBHOOK_SECRET=whsec_...          # Webhook signature verification

NEXT_PUBLIC_APP_URL=https://...         # App URL (optional)
POSTCODEAPI_NU_KEY=...                  # Dutch address lookup (optional)

# Webhook verification secrets
WHATSAPP_WEBHOOK_SECRET=...             # WhatsApp webhook verification
WHATSAPP_VERIFY_TOKEN=...               # WhatsApp verification token
MOLLIE_WEBHOOK_TOKEN=...                # Mollie webhook verification

# Feature flags
ENABLE_INVOICE_V2=false                 # Invoice v2 system toggle
ENABLE_PROVIDER_BADGES=true             # Provider badges display
ENABLE_LEGACY_FALLBACK=true             # Legacy system fallback
```

## Webhook Infrastructure

```typescript
// All webhooks use signature verification
// Located in: src/app/api/webhooks/*/route.ts

- /api/webhooks/clerk      # User/org sync (Svix verification)
- /api/webhooks/mollie     # Payment status (HMAC verification)
- /api/webhooks/whatsapp   # Message ingress (signature verification)
```

## Project Status

**Completion**: 85% (Customer Management & RLS Security production-ready)  
**Next Priority**: Customer integration in job creation
**Context**: Netherlands emergency plumber SaaS with Dutch locale compliance

## Key Features Implemented

- **RLS Security**: Full multi-tenant data isolation with JWT-based auth
- **Customer Management**: Complete CRUD with search, stats, dialog forms
- **Jobs System**: Multi-assignee support with calendar integration
- **Invoice System**: Unified DTO architecture with integer cents precision ✅ PRODUCTION READY
- **i18n Architecture**: Dutch/English with namespaced translation hooks
- **Anti-Placeholder**: 4-layer protection against test data pollution
- **Webhook Infrastructure**: Clerk, Mollie, WhatsApp with signature verification

## tRPC Router Architecture (Type-Safe API Layer)

### Router Structure (Located in `/src/server/api/routers/`)
```typescript
// Main router aggregation in /src/server/api/root.ts
export const appRouter = router({
  jobs: jobsRouter,           // ✅ Complete - Multi-assignee support
  employees: employeesRouter, // ✅ Complete - Color system integration
  customers: customersRouter, // ✅ Complete - CRUD with DTO mapping
  invoices: invoicesRouter,   // ✅ Complete - Dutch BTW compliance
  orgSettings: orgSettingsRouter, // ✅ Complete - Organization settings
  ai: aiRouter,              // 🔄 Scaffold - Returns empty array
  whatsapp: whatsappRouter,  // 🔄 Scaffold - Returns empty array
});
```

### Customer Router Features (Reference Implementation)
- **Complete CRUD Operations** - Create, Read, Update, Delete with validation
- **Advanced Search** - Multi-field search with pagination and sorting
- **DTO Mapping Layer** - Clean separation between DB and API types
- **Multi-tenant Security** - RLS-aware queries with org_id filtering
- **Soft Delete Support** - Archive/unarchive functionality
- **Linked Data Validation** - Prevents deletion when related records exist
- **Dutch Validation** - Phone numbers, postal codes, language selection

### Router Security Patterns
```typescript
// ✅ CORRECT: Always use protectedProcedure for authenticated routes
export const customersRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { db, auth: { orgId } } = ctx;  // RLS-aware client
    return await db.from("customers").select("*").eq("org_id", orgId);
  })
});

// ❌ WRONG: Never use publicProcedure for business data
export const customersRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    // No authentication, no organization filtering
  })
});
```

## Invoice System Architecture (CRITICAL - Production Ready)

### Unified DTO Pattern (Single Source of Truth)
```typescript
// ✅ CORRECT: Use src/schema/invoice.ts as canonical source
import { InvoiceLineDraftType, computeTotalsCents } from "~/schema/invoice";

// Server-side totals computation (integer cents precision)
const totals = computeTotalsCents(items);  // Avoids floating-point errors

// ❌ WRONG: Multiple DTO definitions cause schema divergence
interface LocalInvoiceItem { /* duplicate schema */ }  // Creates maintenance burden
```

### Money Precision Pattern (CRITICAL - Financial Accuracy)
```typescript
// ✅ CORRECT: Always use integer cents for calculations
const unitPriceCents = 1250;  // €12.50
const totalCents = qty * unitPriceCents;
const totalEuros = totalCents / 100;  // Only convert for display

// ❌ WRONG: Floating-point calculations cause rounding errors
const unitPrice = 12.50;  // Can become 12.499999999999998
const total = qty * unitPrice;  // Accumulates precision errors
```

### Audit Trail Pattern (CRITICAL - Compliance)
```typescript
// ✅ CORRECT: Use writeAudit() with Temporal timezone handling
import { writeAudit } from "~/server/db/invoice-audit";

await writeAudit({
  entity: "invoice",
  entityId: invoiceId,
  action: "created",
  actorId: userId,
  meta: { customerId, amount: totalCents },
  db: ctx.db,
  orgId: ctx.orgId
});

// ❌ WRONG: Manual audit logging misses timezone/PII sanitization
const auditEntry = { created_at: new Date() };  // Wrong timezone, no sanitization
```

### Autosave Pattern (UX Optimization)
```typescript
// ✅ CORRECT: Debounced autosave with status feedback
const debouncedAutoSave = useCallback(
  debounce(async (data) => {
    setAutoSaveStatus('saving');
    try {
      await saveDraftMutation.mutateAsync(data);
      setAutoSaveStatus('saved');
    } catch {
      setAutoSaveStatus('error');
    }
  }, 2000),
  [saveDraftMutation]
);

// ❌ WRONG: Aggressive saves cause poor UX and server load
useEffect(() => {
  saveDraft(data);  // Fires on every keystroke - bad UX
}, [data]);
```

### Dutch Legal Compliance Pattern
```typescript
// ✅ CORRECT: Validate Dutch business requirements
const isValidKvk = /^[0-9]{8}$/.test(kvkNumber);
const isValidBtw = /^NL[0-9]{9}B[0-9]{2}$/.test(btwNumber);
const vatRates = [0, 9, 21];  // Netherlands standard rates (integers)

// Required fields for Dutch invoices
const requiredFields = {
  supplierKvk: kvkNumber,     // Chamber of Commerce number
  supplierBtw: btwNumber,     // VAT identification
  customerAddress: address,   // Full address required
  vatRate: 21,               // Default Dutch VAT rate
  dueDate: addDays(now(), 30) // 30-day payment terms standard
};
```

### Server Mapper Integration (Type Safety)
```typescript
// ✅ CORRECT: Handle legacy UI format gracefully in mappers
export function mapDtoLineToDb(item: InvoiceItem): DbInvoiceLine {
  return {
    unit_price_ex_vat: item.unitPriceExVat ?? item.unitPriceCents / 100,
    line_type: item.lineType ?? mapKindToLineType(item.kind),
    // Graceful fallback between legacy and unified formats
  };
}

// ❌ WRONG: Assume single format - causes runtime errors
return {
  unit_price_ex_vat: item.unitPriceExVat,  // Breaks if using cents format
  line_type: item.lineType,                // Breaks if using kind format
};
```

## Invoice System Rules

1. **Integer Cents Only** - All money calculations use integer cents to avoid floating-point errors
2. **Unified Schema** - `src/schema/invoice.ts` is the single source of truth for all invoice DTOs  
3. **Server-Side Totals** - Use `computeTotalsCents()` for all invoice calculations (never client-side)
4. **Temporal Timezone** - All audit logs use `Temporal.Now.zonedDateTimeISO("Europe/Amsterdam")`
5. **Debounced Autosave** - 2-second delay with visual status feedback for optimal UX
6. **Dutch Compliance** - KVK, BTW-id validation and complete customer address required
7. **Audit Everything** - All invoice operations must call `writeAudit()` for compliance trail