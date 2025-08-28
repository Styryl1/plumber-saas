# 🚀 Professional Plumber Business-in-a-Box
*Netherlands-First AI-Powered Emergency Dispatch Platform*

## 🚨 CRITICAL VIOLATIONS = IMMEDIATE STOP

### Rule #1: 9-PHASE WORKFLOW MANDATORY
**STOP after each of 9 phases** → Show "⏸️ Phase X complete. Continue?"
**VIOLATION**: "🚨 SKIPPED PHASE STOP - Reverting to checkpoint"

### Rule #2: EXPERT AGENT DELEGATION FIRST  
**Research via 10 specialist agents only** → Never direct research (wastes context)
**VIOLATION**: "🚨 DIRECT RESEARCH - Delegating to specialist agent"

### Rule #3: NO MOCK DATA EVER
**Real API responses only** → Show actual errors, not fake success  
**VIOLATION**: "🚨 MOCK DATA DETECTED - Using real implementation"

### Rule #4: QUESTIONS FIRST IN PLAN MODE
**Always ask clarifying questions** → Dutch requirements, scope, edge cases
**VIOLATION**: "🚨 NO QUESTIONS ASKED - Entering plan mode"

### Rule #5: MCP TOOLS INTEGRATION
**Use MCP servers for all external operations** → Context7, Supabase, Clerk, Playwright
**VIOLATION**: "🚨 BYPASSING MCP - Using direct API calls"

### Rule #6: PATTERN TRANSPARENCY REQUIRED
**Always display agent patterns used** → Show confidence, validation status
**VIOLATION**: "🚨 HIDDEN PATTERN USAGE - Must show agent attribution"

## 🎯 PROJECT MISSION
Transform "oh fuck, I need a plumber" → "let me book one in 30 seconds"

**Target**: Netherlands plumber market (Amsterdam → Rotterdam → Utrecht)
**Stack**: T3 + Supabase + Clerk + Mollie + Playwright + 10 Expert Agents

## 🤖 10 EXPERT AGENTS (300-500 lines each)
- **T3** (253) - tRPC, Next.js App Router patterns
- **UI** (341) - shadcn/ui, Dutch UX patterns
- **Database** (412) - Supabase RLS, multi-tenant GDPR
- **Auth** (450) - Clerk multi-tenant organizations
- **Testing** (542) - Playwright zero-file E2E
- **Payment** (549) - Mollie iDEAL, BTW compliance
- **AI** (430) - Dual-model emergency detection
- **Security** (512) - GDPR, AI injection prevention  
- **UX** (505) - Behavioral psychology, conversion
- **Architect** (707) - Multi-tenant scaling, events

## 📋 EXPERT AGENT DELEGATION PROTOCOL

### When uncertain about ANY implementation:

**📋 DELEGATING TO EXPERT: {agent_name}**
- **Mode**: Quick Lookup | PRP Enhancement
- **Query**: {specific_technical_question}
- **Expected**: Complete working implementation
- **Context**: Dutch plumber SaaS, multi-tenant, emergency services

### Agent Quick Reference Guide:
- **T3 patterns** → T3 Specialist
- **UI/UX implementation** → UI + UX Specialists  
- **Database queries/schemas** → Database Specialist
- **Authentication/GDPR** → Auth + Security Specialists
- **Testing/E2E flows** → Testing Specialist
- **Payments/Dutch compliance** → Payment Specialist
- **AI features/classification** → AI Specialist
- **Security/vulnerabilities** → Security Specialist
- **Conversion/psychology** → UX Specialist
- **Architecture/scaling** → Architect Specialist

## 🔧 MCP SERVER REQUIREMENTS

### Required MCP Tools:
- **Context7** (current documentation - used by all agents)
- **Firecrawl** (production examples - used by all agents)
- **Supabase** (database operations - Database specialist)
- **Playwright** (testing automation - Testing specialist)
- **Semgrep** (security scanning - Security specialist)
- **shadcn** (UI components - UI specialist)
- **Clerk** (authentication - Auth specialist)
- **Exa** (advanced search - all agents for research)

### Pattern Transparency Display:

**🤖 AGENT PATTERN USED:**
- **Agent**: {agent_name} ({agent_lines} lines)
- **Pattern**: {pattern_name}
- **Domain**: {domain} | **Confidence**: 95%+ | **Area**: Dutch SaaS
- **Why**: {selection_reason}
- **Validation**: ✅ Production-ready | ⚠️ Needs testing | ❌ Deprecated

## ⚡ SUCCESS TRACKING METRICS

### Agent Consultation Success Rates:
- **Maximum 3 consultations** per implementation issue
- **Target 95%+ success rate** for each specialist
- **Track patterns used** and their effectiveness
- **Document failure modes** and alternatives

### Golden Rules Violation Detection:
**Monitor silently but respond dramatically when detected:**

🚨 **VIOLATION: Bypassing expert agents - MUST delegate for expertise**
🚨 **VIOLATION: Using mock data - MUST use real API or loading states**
🚨 **VIOLATION: Make-it-work mode - MUST use proper patterns**