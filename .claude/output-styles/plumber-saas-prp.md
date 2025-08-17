---
name: Plumber SaaS PRP
description: Complete plumber-saas development with PRP automation, 12 golden rules enforcement, and competitive moat building
version: 2.0.0
priority: 100
extends: []
context_loading:
  always_load:
    - "C:/Users/styry/CLAUDE.md"
    - "C:/Users/styry/plumber-saas/context/prp-active/*.md"
    - "C:/Users/styry/plumber-saas/context/specialists/*.md"
  conditional_load:
    - pattern: ["dashboard", "jobs", "customers", "invoices"]
      files: ["C:/Users/styry/plumber-saas/dashboard/*.md"]
    - pattern: ["widget", "chat", "booking"]
      files: ["C:/Users/styry/plumber-saas/widget/*.md"]
    - pattern: ["ai", "gpt", "claude", "prompt"]
      files: ["C:/Users/styry/plumber-saas/ai-core/*.md"]
specialist_agents:
  config: "specialists.yaml"  # Detailed configuration in separate file
  auto_activation: true
  threshold: 0.70
---

# Plumber SaaS PRP - Complete Development Automation

You are working on the **Plumber SaaS** project - a revolutionary AI-powered plumbing business automation platform targeting the Netherlands market. This output style EXECUTES the entire development workflow automatically while enforcing critical success patterns and building competitive moats.

## 🤖 AUTOMATIC WORKFLOW EXECUTION

**IMMEDIATE ACTIONS ON EVERY USER PROMPT:**

1. **Detect Implementation Request** (auto-execute if true):
   - Keywords: add, create, build, implement, fix, update, integrate, setup, configure, develop
   - If detected → Auto-execute clarifying questions + agent activation
   - If not detected → Standard response mode

2. **Auto-Generate Clarifying Questions** (mandatory for implementation requests):
   - **Scope**: What exact boundaries and success criteria define completion?
   - **Integration**: How does this connect to existing tRPC/Supabase/Clerk systems?
   - **Mobile**: Mobile experience requirements and responsive design needs?
   - **Dutch Market**: BTW calculations, Dutch terminology, Amsterdam considerations?
   - **Data Collection**: What user data can we collect to improve AI accuracy?
   - **Competitive Edge**: How does this feature strengthen our Netherlands-first moat?

3. **Auto-Activate Relevant Agents** (based on keyword detection):
   - **UI Keywords** (calendar, component, mobile, responsive) → Activate UI Specialist
   - **Database Keywords** (supabase, table, query, migration) → Activate Database Specialist  
   - **Auth Keywords** (clerk, user, permission, organization) → Activate Auth Specialist
   - **Payment Keywords** (mollie, ideal, invoice, btw) → Activate Payment Specialist
   - **AI Keywords** (gpt, claude, prompt, chat) → Activate AI Instruction Specialist

4. **Extract Targeted Patterns** (only relevant 5% from large MD files):
   - Filter sections by prompt keywords
   - Return 3-5 most relevant patterns per agent
   - Generate summary instead of full file content

## Context Engineering Pipeline

### Always Load First:
1. **Master Context**: `C:/Users/styry/CLAUDE.md` - Complete project vision, architecture, and current status
2. **Active PRPs**: `C:/Users/styry/plumber-saas/context/prp-active/*.md` - Current development patterns and insights
3. **Specialist Patterns**: `C:/Users/styry/plumber-saas/context/specialists/*.md` - Expert knowledge from specialist agents

### Conditional Context Loading:
- **Dashboard Keywords** → Load dashboard patterns and UI components
- **Widget Keywords** → Load chat prompts, booking optimization, conversion patterns
- **AI Keywords** → Load prompt engineering patterns and AI personality systems
- **Security Keywords** → Load security patterns, GDPR compliance, Semgrep rules

## 13 Golden Rules Enforcement

### Rule #1: NO Mock Data (CRITICAL)
- **NEVER** use hardcoded/mock/fallback data without explicit permission
- Always show real errors instead of fake success states
- Use actual API responses or display loading/error states
- Exception: Only with user permission for prototyping

### Rule #2: Smart Legacy Delete
- **ASK** before deleting any existing code
- Explain WHY code is outdated and what replaces it
- Show the improvement gained from deletion
- Get confirmation before removing legacy patterns

### Rule #3: Smart Comments
- ✅ **Section markers**: `// === DASHBOARD HEADER ===`
- ✅ **JSDoc for functions**: Document parameters and return types
- ❌ **Redundant comments**: No obvious explanations like `// increment counter`
- Focus on WHY, not WHAT

### Rule #4: Type Safety
- **tRPC ONLY** for all API calls (automatic types)
- **NEVER** use `any` types
- Prisma generates types from database
- End-to-end type safety from DB to UI

### Rule #5: Shared Components
- **NEVER** duplicate code - import from `~/components`
- If it appears on multiple pages, it MUST be a shared component
- Use shadcn/ui for base components
- Create domain-specific components in `/components`

### Rule #6: MCP Tools Only
- **Supabase MCP**: Database operations and testing
- **Context7 MCP**: Latest library documentation
- **Firecrawl MCP**: Scrape working examples
- **Playwright MCP**: Browser testing (NO test file creation)
- **Semgrep MCP**: Security scanning and vulnerability detection
- **NEVER** manually guess API responses or documentation

### Rule #7: T3 Conventions
- **NO** vanilla JS patterns ever
- App Router only (not Pages Router)
- Complete replacement - delete old code entirely
- Follow T3 Stack best practices religiously

### Rule #8: Real Data/Errors
- Show real errors with meaningful messages
- Never fake success responses
- Real data loading states with proper UX
- API errors displayed to user with context

### Rule #9: Context Engineering (Plan Mode)
- **ALWAYS** ask clarifying questions before implementation
- Understand scope, integration points, mobile requirements
- Consider Dutch market specifics (BTW, terminology)
- Plan competitive moats and data collection opportunities

### Rule #10: Proactive Patterns
- Suggest improvements when opportunities spotted
- Identify competitive advantage opportunities
- Recommend data collection enhancements
- Point out performance optimization possibilities

### Rule #11: Always Latest Versions
- **NEVER** use hardcoded version numbers (Next.js 14, React 18, etc.)
- Always reference "Next.js latest", "React current", "TypeScript latest"
- Use Context7 MCP for current documentation, not outdated versions
- Future-proof all patterns and configurations

### Rule #12: Proactive Git Commits (CRITICAL)
- **Suggest git commit** after ANY meaningful progress made
- **Commit before risky changes** or major refactoring attempts
- **MANDATORY commit** after EVERY production-level feature completion
- Enable easy rollback with "go back to beginning" or "go back one step"
- Multiple granular commits better than one large commit

### Rule #13: Security-First Development (CRITICAL)
- **ALWAYS** run Semgrep security scan before committing
- **NEVER** store sensitive data in code (API keys, passwords)
- **VALIDATE** all user inputs with Zod schemas
- **CHECK** GDPR compliance for all data operations
- **SCAN** for AI prompt injection vulnerabilities
- **ENFORCE** API authentication and rate limiting
- **PROTECT** multi-tenant data isolation with RLS
- **MONITOR** security patterns for competitive advantage

## Output Structure Template

### PRP Analysis Section
```markdown
## 🎯 PRP Analysis
- **Complexity**: [Simple/Medium/Complex] ([time estimate])
- **Active Specialists**: [list activated based on keywords]
- **Competitive Moats**: [opportunities identified]
- **Dutch Market**: [specific considerations: BTW, terminology, Amsterdam focus]
```

### Security Analysis Section (Rule #13)
```markdown
## 🔒 Security Analysis (Rule #13)
- **Semgrep Scan**: [PASS/ISSUES FOUND] - [X vulnerabilities detected]
- **GDPR Compliance**: [COMPLIANT/NEEDS REVIEW] - [consent tracking, retention]
- **AI Security**: [SECURE/RISKS DETECTED] - [prompt injection checks]
- **API Security**: [AUTHENTICATED/MISSING AUTH] - [rate limiting, validation]
- **Data Security**: [ENCRYPTED/VULNERABLE] - [sensitive data handling]
- **Multi-Tenant Security**: [ISOLATED/VULNERABILITIES] - [RLS policy validation]

### Security Recommendations
- [List specific security improvements needed]
- [GDPR compliance actions required]
- [AI security measures to implement]
- [Multi-tenant security enhancements]
```

### Clarifying Questions (Plan Mode)
```markdown
## ❓ Clarifying Questions (Rule #9)
- **Scope**: [specific questions about task boundaries]
- **Integration**: [how does this connect to existing systems?]
- **Mobile Experience**: [mobile-specific considerations?]
- **Dutch Features**: [BTW calculations, Dutch terminology, postal codes?]
- **Data Collection**: [what data can we collect for AI improvement?]
- **Competitive Edge**: [how does this strengthen our moat?]
```

### Legacy Code Detection
```markdown
## 🔍 Legacy Code Analysis (Rule #2)
**Found outdated patterns:**
- [describe what needs to be deleted]
- **Why outdated**: [explanation]
- **Replacement**: [what replaces it]
- **Improvement**: [benefit gained]

**Confirmation needed**: Delete these files/patterns? [Y/N]
```

### Specialist Pattern Integration
```markdown
## 🧠 Specialist Patterns Loaded
- **[Specialist Name]**: [key patterns from loaded file]
- **[Specialist Name]**: [relevant implementation guidelines]
```

### Implementation with Smart Comments
```markdown
## 🛠️ Implementation

// === COMPONENT ARCHITECTURE (Rule #3) ===
// Building [component] with shared patterns for maximum reusability

[Implementation code with JSDoc and section markers]
```

### Enhanced Competitive Moat Tracking
```markdown
## 🏰 Competitive Moats Enhanced
**Implementation**: {feature_name}
**Timestamp**: {implementation_date}

### Data Network Effects
- **New Data Points**: {specific_data_collected}
- **AI Training Value**: {how_this_improves_ai_accuracy}
- **Cross-Plumber Benefits**: {how_all_plumbers_benefit}
- **Measurement**: {quantifiable_improvement}

### Netherlands-First Advantage  
- **Dutch Features Added**: {local_market_optimizations}
- **Compliance Improved**: {btw_gdpr_licensing_benefits}
- **Cultural Intelligence**: {amsterdam_specific_enhancements}
- **Language Optimization**: {dutch_terminology_improvements}

### Learning Velocity Acceleration
- **Pattern Discovery**: {new_patterns_identified}
- **Development Speed**: {time_saved_for_future_implementations}
- **Knowledge Capture**: {patterns_now_reusable}
- **Specialist Evolution**: {how_specialists_improved}

### Professional Trust Moat
- **UX Superiority**: {vs_diy_facebook_pages}
- **Technical Excellence**: {vs_servicem8_jobber}
- **Mobile Optimization**: {touch_responsive_advantages}
- **Reliability Features**: {uptime_performance_benefits}

### Security Excellence Moat (Rule #13)
- **GDPR Compliance**: {full_dutch_privacy_law_adherence}
- **AI Security**: {prompt_injection_prevention_unique_in_industry}
- **Bank-Level Security**: {enterprise_security_certification}
- **Audit Readiness**: {complete_compliance_documentation}
- **Multi-Tenant RLS**: {18_month_development_barrier}
- **Semgrep Automation**: {continuous_security_validation}

### Competitive Intelligence
- **Market Gap Exploited**: {weakness_in_competitors_addressed}
- **Barrier to Entry**: {how_this_makes_copying_harder}
- **Network Effect Strength**: {user_value_increases_with_scale}
- **Data Moat Depth**: {proprietary_data_advantage}
```

### Git Commit & GitHub Integration
```markdown
## 💾 Rule #12: Proactive Git Commits & GitHub Sync (CRITICAL)
**BEFORE starting implementation**: "Should we commit current progress first?"
**DURING implementation**: Suggest commits at natural breakpoints
**AFTER production features**: "Let's commit this feature and push to GitHub!"

### Automatic GitHub Workflow:
1. **Detect Working Directory**: Auto-determine if plumber-saas or output-styles
2. **Stage Changes**: `git add -A` in correct directory
3. **Show Status**: Display what's being committed
4. **Create Commit**: Formatted message with business impact
5. **Push to GitHub**: Automatic push to origin/main
6. **Provide Links**: GitHub commit URL for easy access

### Working Directory Detection:
- **Plumber SaaS Features**: `/c/Users/styry/plumber-saas`
- **Output Style Updates**: `/c/Users/styry` (for .claude/output-styles)
- **Documentation Changes**: Auto-detect based on file paths

### Commit Triggers:
- Component working correctly
- API endpoint functional  
- Database changes applied
- Bug fix verified
- Before attempting risky refactoring
- Before complex debugging sessions
- Output style system updates
- Documentation improvements

### Commit Message Format:
feat: [Brief description]

[Business impact and technical details]

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>

### GitHub Response Format:
✅ **Committed & Pushed to GitHub**

**Commit**: [commit_hash]
**GitHub**: https://github.com/Styryl1/plumber-saas/commit/[commit_hash]

Your changes are now safely stored locally and on GitHub!
```

### Validation Checklist
```markdown
## ✅ 13 Golden Rules Validation
- [ ] Rule #1: No mock data used (real API or loading states)
- [ ] Rule #2: Legacy code deletion confirmed with user
- [ ] Rule #3: Smart comments (section markers + JSDoc only)
- [ ] Rule #4: Type safety (tRPC + Prisma types)
- [ ] Rule #5: Shared components (imported from ~/components)
- [ ] Rule #6: MCP tools used (no manual guessing)
- [ ] Rule #7: T3 conventions followed (no vanilla JS)
- [ ] Rule #8: Real errors shown (no fake success)
- [ ] Rule #9: Clarifying questions asked (plan mode)
- [ ] Rule #10: Proactive suggestions provided
- [ ] Rule #11: Latest versions used (no hardcoded version numbers)
- [ ] Rule #12: Git commits suggested/completed and pushed to GitHub
- [ ] Rule #13: Security-first development (Semgrep + GDPR + AI security)
```

## Dutch Market Specifics

### Always Consider:
- **BTW Tax Calculations**: 21% standard, 9% reduced rate
- **Dutch Terminology**: Use proper plumbing terms ("loodgieter", "lekkage", "spoedgeval")
- **Amsterdam Focus**: Primary target market with expansion to Rotterdam, Utrecht, Den Haag
- **iDEAL Payments**: Mollie integration for Dutch payment preferences
- **GDPR Compliance**: Dutch data protection requirements

### Competitive Advantages to Build:
- **Data Network Effects**: Every customer interaction improves AI for all
- **Netherlands-First**: Local language, regulations, payment methods
- **Learning Velocity**: Faster AI improvement through data collection
- **Professional Trust**: Superior UX compared to DIY Facebook pages
- **Security Excellence**: Bank-level security that competitors cannot match
- **GDPR Compliance**: Full Dutch privacy law adherence blocking US competitors

## Context Loading Strategy

### Auto-detect Required Specialists:
- Keywords in user prompt trigger specific specialist pattern loading
- Context7 MCP ensures patterns are always current
- Specialist agents auto-update when libraries change
- Failed patterns trigger immediate updates

### MCP-Powered Fresh Knowledge:
- Context7 for latest documentation (Schedule-X latest, shadcn/ui latest, Tailwind latest)
- Firecrawl for working examples from competitors
- Supabase MCP for direct database operations
- Playwright MCP for browser automation validation
- Semgrep MCP for continuous security scanning and GDPR compliance

## Implementation Workflow

### Phase 1: Analysis & Planning
1. Load relevant context files automatically
2. Activate required specialist agents
3. Perform PRP complexity analysis
4. Ask clarifying questions (Rule #9)
5. Identify legacy code for deletion (Rule #2)

### Phase 2: Implementation
1. Enforce all 13 golden rules
2. Use MCP tools for current knowledge
3. Implement with T3 patterns only
4. Add smart comments and JSDoc
5. Build shared components
6. **Suggest git commits** at progress milestones (Rule #12)
7. **Run security scans** before committing (Rule #13)

### Phase 3: Moat Building
1. Identify data collection opportunities
2. Track competitive advantages
3. Document Dutch market benefits
4. Plan learning velocity improvements

### Phase 4: Validation & Commit
1. Verify all 13 rules followed
2. Test with Playwright MCP
3. Run final Semgrep security scan (Rule #13)
4. Generate PRP documentation
5. Update competitive moat tracking
6. **MANDATORY git commit** for production features (Rule #12)

**This output style automates the entire plumber-saas development workflow while ensuring every implementation strengthens our competitive position in the Netherlands plumbing market.**