# 13 Golden Rules - Preserved from Output Style

## Rule #1: NO Mock Data (CRITICAL)
- **NEVER** use hardcoded/mock/fallback data without explicit permission
- Always show real errors instead of fake success states
- Use actual API responses or display loading/error states
- Exception: Only with user permission for prototyping

## Rule #2: Smart Legacy Delete
- **ASK** before deleting any existing code
- Explain WHY code is outdated and what replaces it
- Show the improvement gained from deletion
- Get confirmation before removing legacy patterns

## Rule #3: Smart Comments
- ✅ **Section markers**: `// === DASHBOARD HEADER ===`
- ✅ **JSDoc for functions**: Document parameters and return types
- ❌ **Redundant comments**: No obvious explanations like `// increment counter`
- Focus on WHY, not WHAT

## Rule #4: Type Safety
- **tRPC ONLY** for all API calls (automatic types)
- **NEVER** use `any` types
- Prisma generates types from database
- End-to-end type safety from DB to UI

## Rule #5: Shared Components
- **NEVER** duplicate code - import from `~/components`
- If it appears on multiple pages, it MUST be a shared component
- Use shadcn/ui for base components
- Create domain-specific components in `/components`

## Rule #6: MCP Tools Only
- **Supabase MCP**: Database operations and testing
- **Context7 MCP**: Latest library documentation
- **Firecrawl MCP**: Scrape working examples
- **Playwright MCP**: Browser testing (NO test file creation)
- **Semgrep MCP**: Security scanning and vulnerability detection
- **NEVER** manually guess API responses or documentation

## Rule #7: T3 Conventions
- **NO** vanilla JS patterns ever
- App Router only (not Pages Router)
- Complete replacement - delete old code entirely
- Follow T3 Stack best practices religiously

## Rule #8: Real Data/Errors
- Show real errors with meaningful messages
- Never fake success responses
- Real data loading states with proper UX
- API errors displayed to user with context

## Rule #9: Context Engineering (Plan Mode)
- **ALWAYS** ask clarifying questions before implementation
- Understand scope, integration points, mobile requirements
- Consider Dutch market specifics (BTW, terminology)
- Plan competitive moats and data collection opportunities

## Rule #10: Proactive Patterns
- Suggest improvements when opportunities spotted
- Identify competitive advantage opportunities
- Recommend data collection enhancements
- Point out performance optimization possibilities

## Rule #11: Always Latest Versions
- **NEVER** use hardcoded version numbers (Next.js 14, React 18, etc.)
- Always reference "Next.js latest", "React current", "TypeScript latest"
- Use Context7 MCP for current documentation, not outdated versions
- Future-proof all patterns and configurations

## Rule #12: Proactive Git Commits (CRITICAL)
- **Suggest git commit** after ANY meaningful progress made
- **Commit before risky changes** or major refactoring attempts
- **MANDATORY commit** after EVERY production-level feature completion
- Enable easy rollback with "go back to beginning" or "go back one step"
- Multiple granular commits better than one large commit

## Rule #13: Security-First Development (CRITICAL)
- **ALWAYS** run Semgrep security scan before committing
- **NEVER** store sensitive data in code (API keys, passwords)
- **VALIDATE** all user inputs with Zod schemas
- **CHECK** GDPR compliance for all data operations
- **SCAN** for AI prompt injection vulnerabilities
- **ENFORCE** API authentication and rate limiting
- **PROTECT** multi-tenant data isolation with RLS
- **MONITOR** security patterns for competitive advantage