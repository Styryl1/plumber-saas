# Pattern Index - Master Catalog

> **Last Updated**: January 17, 2025
> **Total Patterns**: 0 (establishing baseline)
> **Pattern Success Rate**: N/A (starting fresh)
> **Token Efficiency**: Target 98% reduction vs full-file loading

## 🔍 **Quick Search Keywords**

| Keyword | Related Patterns | Description |
|---------|------------------|-------------|
| emergency | emergency-alert, priority-query, dispatch-flow | Emergency handling patterns |
| calendar | schedule-x-config, date-picker, time-slots | Calendar and scheduling patterns |
| mobile | touch-targets, bottom-sheet, swipe-actions | Mobile-first interaction patterns |
| payment | mollie-integration, btw-calculation, ideal-flow | Dutch payment processing |
| auth | clerk-organization, multi-tenant, rls-policy | Authentication and security |
| dashboard | stats-card, responsive-grid, navigation | Dashboard UI patterns |
| widget | chat-interface, booking-form, conversion | Widget interaction patterns |
| dutch | terminology, btw-rates, formal-language | Netherlands market patterns |

## 📊 **Pattern Registry**

| Pattern | Domain | File | Lines | Usage | Success | Last Used | Agent |
|---------|--------|------|-------|-------|---------|-----------|-------|
| button-primary | UI | dashboard/TAILWIND_PATTERNS.md | 84-125 | 0 | - | Never | UI_Agent |
| multi-tenant-query | DB | dashboard/DATABASE_INTEGRATION.md | 45-89 | 0 | - | Never | Database_Agent |
| emergency-detection | UX | widget/CHAT_PROMPTS.md | 156-203 | 0 | - | Never | UX_Agent |
| clerk-organization | Auth | dashboard/CLERK_AUTHENTICATION.md | 67-124 | 0 | - | Never | Auth_Agent |
| mollie-ideal | Payment | dashboard/MOLLIE_INTEGRATION.md | 89-156 | 0 | - | Never | Payment_Agent |

*Note: Pattern usage and success rates will be populated as features are implemented*

## 🤖 **Agent Pattern Ownership**

### **UI_Agent Patterns**
- **Primary Domain**: dashboard/TAILWIND_PATTERNS.md
- **Expertise**: Tailwind CSS, shadcn/ui, Schedule-X, animations, responsive design
- **Keywords**: button, card, grid, mobile, animation, responsive

### **Database_Agent Patterns**  
- **Primary Domain**: dashboard/DATABASE_INTEGRATION.md, dashboard/SUPABASE_ARCHITECTURE.md
- **Expertise**: Supabase, PostgreSQL, Prisma, RLS, multi-tenant queries
- **Keywords**: query, schema, migration, rls, multi-tenant, database

### **UX_Agent Patterns**
- **Primary Domain**: dashboard/UX_PSYCHOLOGY_PATTERNS.md, widget/CONVERSION_OPTIMIZATION.md  
- **Expertise**: User psychology, conversion optimization, Dutch market behavior
- **Keywords**: conversion, psychology, dutch, emergency, stress, user-journey

### **Auth_Agent Patterns**
- **Primary Domain**: dashboard/CLERK_AUTHENTICATION.md, dashboard/MULTI_TENANT_SECURITY.md
- **Expertise**: Clerk, multi-tenant auth, organizations, security
- **Keywords**: auth, clerk, organization, security, permission, multi-tenant

### **Payment_Agent Patterns**
- **Primary Domain**: dashboard/MOLLIE_INTEGRATION.md, dashboard/DUTCH_COMPLIANCE.md
- **Expertise**: Mollie API, iDEAL, BTW compliance, Dutch payments
- **Keywords**: payment, mollie, ideal, btw, invoice, dutch-compliance

### **AI_Agent Patterns**
- **Primary Domain**: ai-core/AI_INSTRUCTIONS.md, widget/CHAT_PROMPTS.md
- **Expertise**: Prompt engineering, dual-model routing, Dutch AI optimization
- **Keywords**: prompt, ai, gpt, claude, chat, dutch-language, emergency-detection

### **Testing_Agent Patterns**
- **Primary Domain**: dashboard/PLAYWRIGHT_TESTING_PATTERNS.md
- **Expertise**: Playwright MCP, browser automation, E2E validation
- **Keywords**: test, playwright, validation, browser, e2e, automation

## 📈 **Pattern Usage Analytics**

### **Most Used Patterns** (Top 10)
*Will populate as features are implemented*

### **Highest Success Rate** (>95%)
*Will populate as patterns mature*

### **Recently Enhanced**
*Will track pattern improvements*

### **Consolidation Candidates**
*Will identify similar patterns for merging*

## 🔄 **Pattern Maintenance Status**

### **Health Metrics**
- **Average Pattern Age**: N/A (new system)
- **Usage Distribution**: N/A (establishing baseline)
- **Success Rate Trend**: N/A (starting fresh)
- **Consolidation Opportunities**: N/A (need usage data)

### **Maintenance Schedule**
- **Daily**: Usage tracking and success recording
- **Weekly**: Consolidation analysis and pattern enhancement
- **Monthly**: Deep cleaning and archive migration
- **Quarterly**: Agent domain rebalancing

## 🎯 **Pattern Enhancement Workflow**

### **After Every Feature Implementation**
1. **Track Usage**: Record which patterns were used
2. **Measure Success**: Did the patterns work as expected?
3. **Capture Improvements**: What modifications were made?
4. **Update Patterns**: Enhance with new learnings (80% enhancement rule)
5. **Update Index**: Refresh usage counts and success rates

### **Pattern Quality Gates**
- **Success Rate**: Must maintain >80% success rate or archived
- **Usage Frequency**: <5 uses in 90 days triggers review
- **Similarity Check**: >70% similarity triggers consolidation review
- **Age Limit**: Unused for >180 days triggers archive consideration

## 🔍 **Search Instructions for Taskmaster**

### **Pattern Discovery Workflow**
```typescript
// How Taskmaster should find patterns:
1. Search PATTERN_INDEX.md by keywords
2. Identify top 3-5 relevant patterns
3. Use grep to extract ONLY relevant lines
4. Never send full files to agents
5. Provide pattern excerpts (<500 tokens total)
```

### **Agent Consultation Format**
```markdown
TO: [Agent_Name]
CONTEXT: "Building [feature] for Dutch plumbers"
PATTERN EXCERPT: 
```
[Lines 84-125 from TAILWIND_PATTERNS.md]
```
QUESTION: "How should we optimize this for [specific use case]?"
RESPOND WITH: Pattern recommendations and modifications only
```

---

**System Status**: 🚀 Ready for pattern population
**Next Milestone**: Implement first feature with pattern tracking
**Token Efficiency Goal**: 98% reduction in agent consumption