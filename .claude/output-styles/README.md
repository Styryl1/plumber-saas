# Plumber SaaS PRP Output Style System

## Overview

The **plumber-saas-prp** output style is a comprehensive development automation system designed specifically for the Plumber SaaS project. It enforces the 12 Golden Rules, automates context loading, coordinates specialist agents, and builds competitive moats while focusing on the Netherlands market.

## 🚀 Quick Start

### Using the Output Style

1. **Select the style in Claude Code:**
   ```bash
   claude-code --output-style plumber-saas-prp
   ```

2. **The system automatically:**
   - Loads project context from `CLAUDE.md`
   - Activates specialist agents based on your prompt keywords
   - Enforces all 12 Golden Rules during implementation
   - Builds competitive moats and tracks Dutch market advantages

### Example Usage

```bash
# For dashboard development (activates UI + T3 + Database specialists)
"Create a new jobs calendar page with Schedule-X integration"

# For widget development (activates UI + UX + AI specialists)
"Improve the booking conversion flow with better Dutch messaging"

# For payment features (activates Payment + Database specialists)
"Add BTW calculation to the invoice generation system"
```

## 📋 System Components

### Core Configuration Files

- **`plumber-saas-prp.md`** - Main output style configuration
- **`rules.yaml`** - 12 Golden Rules definitions and enforcement
- **`specialists.yaml`** - Specialist agent configurations and activation
- **`workflow.yaml`** - 5-phase automated workflow
- **`context-loading.yaml`** - Intelligent context loading strategy

### Templates Directory

- **`main.md`** - Comprehensive output template
- **`prp-simple.md`** - Template for simple tasks (<4 hours)
- **`prp-medium.md`** - Template for medium tasks (1-3 days)
- **`prp-complex.md`** - Template for complex tasks (3+ days)
- **`clarifying-questions.md`** - Rule #9 question templates

### Insights Directory

- **`explanatory.yaml`** - When and how to provide educational insights
- **`patterns.yaml`** - Proactive improvement suggestions

### Validation Directory

- **`pre-checks.yaml`** - Pre-implementation validation
- **`during-checks.yaml`** - Real-time compliance monitoring
- **`post-checks.yaml`** - Comprehensive post-implementation validation

## 🎯 The 12 Golden Rules

### Rule #1: NO Mock Data
- **NEVER** use hardcoded/mock/fallback data without permission
- Always show real errors instead of fake success states
- Use actual API responses or display loading/error states

### Rule #2: Smart Legacy Delete
- **ASK** before deleting any existing code
- Explain WHY code is outdated and what replaces it
- Show the improvement gained from deletion

### Rule #3: Smart Comments
- ✅ **Section markers**: `// === DASHBOARD HEADER ===`
- ✅ **JSDoc for functions**: Document parameters and return types
- ❌ **Redundant comments**: No obvious explanations

### Rule #4: Type Safety
- **tRPC ONLY** for all API calls (automatic types)
- **NEVER** use `any` types
- Prisma generates types from database

### Rule #5: Shared Components
- **NEVER** duplicate code - import from `~/components`
- If it appears on multiple pages, it MUST be a shared component
- Use shadcn/ui for base components

### Rule #6: MCP Tools Only
- **Supabase MCP**: Database operations and testing
- **Context7 MCP**: Latest library documentation
- **Firecrawl MCP**: Scrape working examples
- **Playwright MCP**: Browser testing (NO test file creation)

### Rule #7: T3 Conventions
- **NO** vanilla JS patterns ever
- App Router only (not Pages Router)
- Complete replacement - delete old code entirely

### Rule #8: Real Data/Errors
- Show real errors with meaningful messages
- Never fake success responses
- Real data loading states with proper UX

### Rule #9: Context Engineering (Plan Mode)
- **ALWAYS** ask clarifying questions before implementation
- Understand scope, integration points, mobile requirements
- Consider Dutch market specifics (BTW, terminology)

### Rule #10: Proactive Patterns
- Suggest improvements when opportunities spotted
- Identify competitive advantage opportunities
- Recommend data collection enhancements

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

## 🤖 Specialist Agent System

### Auto-Activation Based on Keywords

| Specialist | Keywords | Focus Area |
|-----------|----------|------------|
| **UI Specialist** | ui, component, tailwind, schedule-x, mobile, calendar | Schedule-X latest, shadcn/ui latest, Tailwind CSS latest |
| **UX Design** | conversion, psychology, journey, booking, personality | Dutch customer psychology, conversion optimization |
| **T3 Specialist** | next, trpc, typescript, react, prisma | Next.js latest, tRPC latest, TypeScript latest, Prisma latest |
| **Database** | supabase, prisma, rls, migration, postgresql | Supabase, PostgreSQL, RLS, multi-tenancy |
| **Auth** | clerk, auth, organization, permission, user | Clerk, multi-tenant auth, organizations |
| **Payment** | mollie, ideal, payment, invoice, btw | Mollie, iDEAL, Dutch compliance, BTW |
| **Testing** | test, validation, e2e, browser, playwright | Playwright MCP, browser automation |
| **AI Instruction** | gpt, claude, prompt, ai, chat, voice | AI personality, Dutch prompts, voice processing |

### Specialist Coordination

- **Maximum 4 specialists** active simultaneously
- **Automatic conflict resolution** based on project priorities
- **Pattern synthesis** for unified implementation approach
- **Knowledge sharing** across specialist agents

## 🇳🇱 Dutch Market Focus

### Always Consider:
- **BTW Tax Calculations**: 21% standard, 9% reduced rate
- **Dutch Terminology**: Use proper plumbing terms ("loodgieter", "lekkage", "spoedgeval")
- **Amsterdam Focus**: Primary target market with expansion to Rotterdam, Utrecht, Den Haag
- **iDEAL Payments**: Mollie integration for Dutch payment preferences
- **GDPR Compliance**: Dutch data protection requirements

### Competitive Advantages Built:
- **Data Network Effects**: Every customer interaction improves AI for all
- **Netherlands-First**: Local language, regulations, payment methods
- **Learning Velocity**: Faster AI improvement through data collection
- **Professional Trust**: Superior UX compared to DIY Facebook pages

## 🔄 5-Phase Automated Workflow

### Phase 1: Analysis & Planning (5-15 minutes)
1. **Context Loading**: Auto-load CLAUDE.md, PRP patterns, specialist patterns
2. **Specialist Activation**: Auto-activate based on keywords
3. **Complexity Analysis**: Determine simple/medium/complex and select template
4. **Legacy Detection**: Scan for outdated code patterns

### Phase 2: Clarifying Questions & Strategy (10-20 minutes)
1. **Rule #9 Questions**: Ask about scope, integration, mobile, Dutch features
2. **Specialist Consultation**: Gather recommendations from activated specialists
3. **Moat Identification**: Identify competitive advantage opportunities

### Phase 3: Implementation & Build (Variable)
1. **Rule Enforcement**: Strict adherence to all 12 golden rules
2. **MCP Knowledge Gathering**: Use Context7, Firecrawl, Supabase MCPs
3. **Dutch Integration**: Implement Netherlands-specific features
4. **Shared Component Creation**: Build reusable components

### Phase 4: Testing & Quality Assurance (15-30 minutes)
1. **Playwright Testing**: Browser automation validation
2. **Rule Compliance Check**: Validate all 12 rules followed
3. **Performance Validation**: Lighthouse scores, bundle size
4. **Accessibility Check**: WCAG 2.1 AA compliance

### Phase 5: PRP Generation & Moat Building (10-15 minutes)
1. **PRP Generation**: Create documentation based on complexity template
2. **Competitive Moat Tracking**: Document advantages gained
3. **Pattern Distribution**: Update specialist pattern files
4. **Feedback Collection**: Set up continuous improvement tracking

## 📊 Context Loading Strategy

### Always Loaded Files:
```
C:/Users/styry/CLAUDE.md
C:/Users/styry/plumber-saas/context/prp-active/*.md
C:/Users/styry/plumber-saas/context/specialists/*.md
```

### Conditionally Loaded (based on keywords):
- **Dashboard keywords** → `/dashboard/*.md`
- **Widget keywords** → `/widget/*.md`
- **AI keywords** → `/ai-core/*.md`

### MCP-Powered Fresh Knowledge:
- **Context7 MCP**: Latest documentation (Schedule-X latest, shadcn/ui latest, Tailwind latest)
- **Firecrawl MCP**: Working examples from competitors
- **Supabase MCP**: Direct database operations
- **Playwright MCP**: Browser automation validation

## 🎯 Success Metrics

### Rule Compliance:
- **Target**: 100% compliance with all 12 golden rules
- **Measurement**: Automated validation + specialist review

### Quality Standards:
- **Performance**: Lighthouse scores >90 mobile, >95 desktop
- **Accessibility**: WCAG 2.1 AA compliance 100%
- **Security**: Zero vulnerabilities found

### Dutch Market Optimization:
- **BTW Compliance**: 100% accuracy in tax calculations
- **Localization Quality**: Professional Dutch terminology and UX
- **Payment Optimization**: iDEAL-first payment experience

### Competitive Advantage:
- **Data Collection**: Meaningful data captured for AI improvement
- **Netherlands Positioning**: Local market advantages strengthened
- **Learning Velocity**: Patterns created for future acceleration

## 🔧 Configuration and Customization

### Modifying Rules
Edit `rules.yaml` to update rule definitions, enforcement levels, or Dutch market specifics.

### Adding Specialist Agents
Edit `specialists.yaml` to add new specialists, modify keywords, or update responsibilities.

### Customizing Workflow
Edit `workflow.yaml` to modify phase durations, add steps, or change validation criteria.

### Template Customization
Modify templates in `/templates/` directory to change output format or add new template types.

## 🚨 Troubleshooting

### Context Loading Issues
- Verify file paths in `context-loading.yaml`
- Check file permissions for project directories
- Ensure MCP servers are connected and functional

### Specialist Activation Problems
- Check keyword matching in `specialists.yaml`
- Verify specialist pattern files exist and are accessible
- Adjust activation threshold if needed (default: 0.7)

### Rule Compliance Failures
- Review specific rule requirements in `rules.yaml`
- Check pre/during/post validation configurations
- Ensure MCP tools are functional for validation

### Performance Issues
- Review context loading strategy for optimization
- Check MCP response caching settings
- Consider reducing specialist activation threshold

## 📈 Continuous Improvement

### Pattern Learning
- Successful patterns automatically extracted to specialist files
- Failed patterns trigger validation rule updates
- Cross-session learning through context cache

### Performance Monitoring
- Track context loading performance
- Monitor specialist activation accuracy
- Measure rule compliance effectiveness

### Competitive Advantage Tracking
- Document moat building success
- Track Dutch market penetration improvements
- Monitor learning velocity acceleration

## 🎓 Best Practices

### For Developers
1. **Trust the System**: Let the PRP workflow guide implementation
2. **Answer Clarifying Questions**: Provide detailed responses in Phase 2
3. **Follow MCP Recommendations**: Use fresh knowledge from MCP tools
4. **Embrace Rule Enforcement**: Rules exist to build competitive advantages

### For Project Success
1. **Consistent Usage**: Use the output style for all plumber-saas development
2. **Pattern Sharing**: Contribute successful patterns back to specialist files
3. **Dutch Market Focus**: Always consider Netherlands-specific requirements
4. **Competitive Thinking**: Look for moat-building opportunities in every feature

---

**This output style automates the entire plumber-saas development workflow while ensuring every implementation strengthens our competitive position in the Netherlands plumbing market.**