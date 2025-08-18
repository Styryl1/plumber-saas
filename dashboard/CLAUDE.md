# Dashboard - Plumber Control Center

## 🎯 Quick Context
**Purpose**: Transform busy plumbers into efficient business owners with comprehensive job management
**Users**: Jan (veteran needs simple), Mohammed (apprentice wants speed), Lisa (owner needs overview), Erik (solo wants automation)
**Competition**: ServiceM8 (complex), Jobber (slow), basic spreadsheets
**Status**: Check PRP.md for current development status

## 📁 What's In This Domain
- `CLAUDE.md` - You are here (dashboard context)
- `PRP.md` - Current status, next priorities
- `patterns/` - All dashboard implementation patterns  
- `benchmarks.md` - Performance metrics, load times
- `anti-patterns.md` - ServiceM8 mistakes to avoid

## 🔍 Key Patterns
| Pattern | File | Purpose | Success |
|---------|------|---------|---------|
| schedule-x-calendar | patterns/calendar-integration.md | Drag-drop job scheduling | 🟡 89% |
| jobs-table | patterns/data-table.md | Real-time job management | 🟢 94% |
| customer-management | patterns/customer-crud.md | Complete customer lifecycle | 🟢 96% |
| invoice-generation | patterns/invoice-btw.md | Dutch BTW-compliant invoices | 🟢 98% |
| multi-tenant-auth | patterns/clerk-isolation.md | Organization-based security | 🟢 97% |
| mobile-dashboard | patterns/responsive-grid.md | Mobile-first layout | 🟡 87% |

## 🤝 Integration Points
- **→ calendar**: Schedule-X integration for job scheduling
- **→ payments**: Mollie invoice generation and payments
- **→ auth**: Clerk organization management
- **← widget**: Receive new job bookings automatically
- **→ ai-core**: Business intelligence and suggestions
- **→ mobile**: Responsive design patterns

## 🏆 Competitive Advantages in This Domain
- **vs ServiceM8**: Simpler onboarding, faster load times
- **vs Jobber**: Dutch-first design, BTW compliance built-in
- **vs Spreadsheets**: Professional appearance, automated workflows
- **vs DIY Solutions**: Complete business management, not just scheduling

## 📊 Current Metrics & Targets
- Dashboard Load Time: 800ms → Target <500ms
- Task Completion Time: 45s → Target <30s
- User Onboarding: 15 min → Target <5 min
- Mobile Usage: 65% → Target 70%
- Feature Adoption: 78% → Target 85%
- Customer Satisfaction: 4.2/5 → Target 4.7/5

## 👥 User Personas Considerations
- **Jan (Veteran)**: Large buttons, simple workflows, familiar terminology
- **Mohammed (Apprentice)**: Fast interactions, modern UI, mobile-optimized
- **Lisa (Owner)**: Overview dashboards, team management, business insights
- **Erik (Solo)**: Automated workflows, all-in-one interface, minimal clicks

## 🚀 Quick Start
Working on dashboard? You need:
1. This file for context
2. PRP.md for current development status
3. Search patterns/ for implementations
4. Check benchmarks.md for performance requirements
5. Review anti-patterns.md for ServiceM8's mistakes to avoid
6. Consider ALL 4 personas in every feature

---

**Last Updated**: January 17, 2025  
**Next Review**: Weekly by UI_Agent and UX_Agent
**Primary Agents**: UI_Agent, Database_Agent, Auth_Agent