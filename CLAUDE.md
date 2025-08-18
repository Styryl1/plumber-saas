# 🚀 Professional Plumber Business-in-a-Box
*Complete AI-Powered Business Automation Platform*

## 🎯 Project Vision & Strategy

### **Dual Revenue Stream Platform:**
1. **Widget SaaS**: AI receptionist for individual plumber websites (competing with Jobber's AI)
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
  - tRPC (end-to-end type safety)
  - Prisma ORM (type-safe database)
  
Database & Backend:
  - Supabase (PostgreSQL + Real-time + Storage)
  - Row Level Security for multi-tenancy
  - Real-time subscriptions built-in
  
Authentication:
  - Clerk (simpler than NextAuth, multi-tenant ready)
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

MCP Tools (Agent-Controlled):
  - Supabase MCP: Database operations via Database Agent
  - Context7 MCP: Latest docs via specialist agents for research
  - Firecrawl MCP: Working examples via UI/Business agents
  - Playwright MCP: Browser testing via Testing Agent
  - Semgrep MCP: Security scanning via Security Agent
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
- **tRPC ONLY** for all API calls (automatic types)
- **NEVER** use `any` types
- Prisma generates types from database
- End-to-end type safety from DB to UI

## Rule #5: Shared Components
- **NEVER** duplicate code - import from `~/components`
- If it appears on multiple pages, it MUST be a shared component
- Use shadcn/ui for base components
- Create domain-specific components in `/components`

## Rule #6: Agent Research Delegation (REVOLUTIONARY)
- **NEVER** research directly - ALWAYS delegate to specialist agents
- **UI Agent**: Researches website transitions, animations via Firecrawl + Context7
- **T3 Agent**: Researches implementation patterns via Context7
- **Security Agent**: Researches vulnerabilities, GDPR compliance via Context7
- **Business Agent**: Researches Dutch market requirements via Firecrawl
- **Agents create validated patterns** with success/failure notes
- **Massive context window savings** through intelligent delegation
- **Perfect pattern creation** → automatically added to database

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
Transform every stressed "oh fuck, I need a plumber" moment into confident "let me check with my AI expert" - while enabling any apprentice to become a successful business owner from day one with AI as their pocket business partner.

## 🤖 **ULTIMATE WORKFLOW 9-PHASE SYSTEM (OPERATIONAL)**

**Status**: ✅ **FULLY IMPLEMENTED & TESTED** - Ready for production use

### **Revolutionary Automation Features:**

**🔥 Agent Research Delegation** (Context Window Revolution):
- **UI Agent**: Website transitions, animations, component patterns
- **T3 Agent**: Implementation approaches, API design, type safety  
- **Security Agent**: Vulnerabilities, GDPR compliance, auth patterns
- **Database Agent**: Schema patterns, RLS policies, multi-tenant strategies
- **AI Agent**: Dual-model routing, Dutch emergency detection
- **Payment Agent**: Mollie integration, iDEAL, Dutch tax compliance
- **Testing Agent**: Playwright automation, E2E validation
- **Business Agent**: Dutch market requirements, competitive analysis  
- **Architect Agent**: System design, scalability, pattern governance
- **Security Agent**: Authentication flows, privacy compliance

**⚡ Dynamic Agent Selection**:
- **Simple tasks (1-2 agents)**: UI tweaks, text changes, styling
- **Medium tasks (3-5 agents)**: Features, integrations, forms
- **Complex tasks (6-10 agents)**: Architecture, full features, systems

**🛡️ Phase 8 Triple-Agent Review**:
- **Security Agent**: Vulnerability scan, GDPR compliance, auth validation
- **UX Agent**: User flow validation, mobile responsiveness, accessibility  
- **Architect Agent**: Pattern compliance, technical debt, structure review

**🔄 9-Phase Automation Workflow**:
1. **Context Discovery** - Intelligent domain-specific pattern loading
2. **Requirement Analysis** - Extract explicit + implicit Dutch requirements  
3. **Dynamic Team Assembly** - Select optimal 1-10 specialist agents
4. **Pattern Matching + Research** - Use existing or delegate research to agents
5. **Implementation Planning** - Step-by-step blueprint with checkpoints
6. **Automated Execution** - Sequential implementation with specialist expertise
7. **Quality Assurance** - Automated testing + Dutch market validation
8. **Triple-Agent Review** - Parallel Security + UX + Architect validation
9. **Pattern Learning** - Document success/failure, update pattern database

### **Competitive Advantages Automated:**
- **18-24 month technical lead** through intelligent development acceleration
- **Netherlands-first optimization** with cultural and regulatory intelligence
- **Zero context waste** through agent research delegation
- **Perfect pattern creation** and reuse for maximum velocity
- **Bulletproof quality** through triple-agent review system

---

**🚀 ULTIMATE WORKFLOW IS NOW YOUR PRIMARY DEVELOPMENT INTERFACE**  
Every task triggers intelligent automation, agent coordination, and competitive advantage building.

**Last Updated**: January 18, 2025 - Ultimate Workflow 9-Phase System Operational  
**Next Enhancement**: Real-world validation and pattern database expansion

