# 🚀 Professional Plumber Business-in-a-Box
*Complete AI-Powered Business Automation Platform*

## 🎯 Project Vision & Strategy

### **Dual Revenue Stream Platform:**
1. **Widget SaaS**: AI business partner for plumbers - a chatbot and dashboard fully automated
2. **Marketplace**: "Treatwell for plumbers" - seamless customer overflow and emergency dispatch

**Target Market**: Netherlands (Amsterdam → Rotterdam → Utrecht → Den Haag)
**Business Model**: €799 setup + €149/month for complete business automation
**Competition**: ServiceM8, Jobber, Zoofy, Angi - but with Netherlands-first advantage

## 💔 Core Problem We Solve
**The "Oh Fuck" Moment**: Universal stress when needing a plumber
- **Gemiste oproepen**: 40% lost revenue (€3,200/month) from missed calls during work
- **Administratie chaos**: 10 hours/week lost on manual scheduling, invoicing, callbacks  
- **Vergeten materialen**: €500-800/month "forgotten" materials not invoiced
- **No professional presence**: DIY Facebook pages vs established competitors

## 🏗️ ARCHITECTURE DECISION 2025 - T3 Stack + MCP

### **FINAL TECH STACK (Production-Ready):**
```yaml
Core Framework:
  - Next.js (App Router) with T3 Stack
  - TypeScript (strict mode)
  - tRPC + Zod (end-to-end type safety)
  - Supabase Direct (no ORM complexity)
  
Database & Backend:
  - Supabase (PostgreSQL + Real-time + Storage)
  - Row Level Security for multi-tenancy
  - Real-time subscriptions built-in
  
Authentication:
  - Clerk (multi-tenant ready via MCP)
  - Organization-based isolation
  
UI & Calendar:
  - Tailwind CSS + shadcn/ui components
  - Schedule-X calendar (free, drag-drop, modern)
  
Payments & Integrations:
  - Mollie (iDEAL for Dutch market)
  - WhatsApp via Twilio
  
Hosting:
  - Railway (everything in one platform)
```

### **ULTIMATE WORKFLOW 9-PHASE AUTOMATION (ACTIVE):**
```yaml
Revolutionary Development System:
  - 10 Specialist Agents: Dynamic selection (1-10 based on complexity)
  - Agent Research Delegation: Agents handle ALL external research
  - Phase 8 Triple Review: Security + UX + Architect parallel validation
  - Auto-Hook System: Automated workflow triggers and checkpoints
  - Pattern Creation: Agents research → validate → add to database
  - No Guesswork Policy: Never research directly, always delegate

Archon Setup (All 9 MCP Servers Configured):
  - Supabase: Database operations + RLS management
  - Context7: Latest documentation research  
  - Firecrawl: Working examples + Dutch market research
  - Playwright: Browser testing + E2E automation
  - Semgrep: Security scanning + vulnerability detection
  - shadcn: UI components + design system
  - Clerk: Authentication + multi-tenant management
  - Exa: Advanced search + competitive intelligence
  - Archon: Task management + knowledge base
```

# 13 Golden Rules - NEVER VIOLATE THESE

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
- **Supabase + tRPC + Zod** for end-to-end type safety
- **NEVER** use `any` types
- Supabase generates database types, Zod validates runtime data
- Complete type safety from database to UI

## Rule #5: Shared Components
- **NEVER** duplicate code - import from `~/components`
- If it appears on multiple pages, it MUST be a shared component
- Use shadcn/ui for base components
- Create domain-specific components in `/components`

## Rule #6: Agent Research Delegation (REVOLUTIONARY)
- **ALWAYS** delegate research to save context windows + get validated patterns
- **UI Agent**: Website transitions, animations via Firecrawl + Context7
- **T3 Agent**: Implementation patterns via Context7
- **Security Agent**: Vulnerabilities, GDPR compliance via Context7
- **Business Agent**: Dutch market requirements via Firecrawl
- **Result**: Perfect patterns created + massive context savings

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

## Rule #9: Ultimate Workflow Automation (ACTIVE)
- **Auto-detection**: Hooks analyze prompts for plan vs conversation mode
- **Dynamic agent selection**: 1-10 specialists based on task complexity
- **Phase 8 triple review**: Security + UX + Architect parallel validation
- **Research delegation**: When uncertain, delegate to appropriate specialist
- **Auto-checkpoints**: Git commits after each successful phase
- **Loop detection**: Prevent infinite modification cycles (3-strike rule)

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
- **Document failure patterns** to prevent repeated mistakes
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

## 🎯 **Current Mission Status**
Transform every stressed "oh fuck, I need a plumber" moment into confident "let me book one in under 30 seconds" 

## 🏆 **COMPETITIVE ADVANTAGES**

### **🤖 Archon Intelligence (UNBEATABLE)**
- **10 Specialist Agents**: Dynamic selection (1-10 based on complexity)
- **Agent Research Delegation**: Massive context window savings  
- **All 9 MCP Servers**: Supabase, Context7, Firecrawl, Playwright, Semgrep, shadcn, Clerk, Exa
- **Perfect Pattern Creation**: Agents research → validate → archon database

### **🇳🇱 Netherlands-First Moat (IMPOSSIBLE TO REPLICATE)**
- **AI Sophistication**: Dual-model system no competitor has
- **Dutch Cultural Intelligence**: Down-to-earth plumber mentality built-in
- **GDPR + iDEAL Integration**: 95% Dutch payment preference covered
- **Emergency Classification**: Amsterdam-specific crisis management

### **⚡ Technical Lead (18-24 MONTHS AHEAD)**
- **Development Velocity**: Agent automation = 10x faster than competitors
- **Security Fortress**: Automated scanning blocks US competitors  
- **Type Safety**: Supabase + tRPC + Zod prevents all major bugs
- **Real-time Architecture**: Scalable to 10,000+ Dutch plumbers

**🎯 Result**: While competitors struggle with basic features, we deliver bulletproof AI-powered solutions at Netherlands speed.

---

**Last Updated**: January 20, 2025 - Archon Intelligence + Netherlands-First Strategy Operational

