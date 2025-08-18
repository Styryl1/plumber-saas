# Payments - Dutch Payment Excellence

## 🎯 Quick Context
**Purpose**: Handle all Dutch payment preferences - 90% want iDEAL, everyone hates credit cards
**Users**: Plumbers need fast invoicing, customers want familiar payment methods
**Competition**: ServiceM8/Jobber don't understand European payments - we own this
**Status**: Check PRP.md for current development status

## 📁 What's In This Domain
- `CLAUDE.md` - You are here (payments context)
- `PRP.md` - Current status, next priorities
- `patterns/` - iDEAL, BTW, SEPA, emergency pricing patterns
- `benchmarks.md` - Transaction success rates, BTW accuracy
- `anti-patterns.md` - Common payment mistakes to avoid

## 🔍 Key Patterns
| Pattern | File | Purpose | Success |
|---------|------|---------|---------|
| mollie-ideal-flow | patterns/ideal-integration.md | Native Dutch payment preference | 🟢 98% |
| btw-calculation | patterns/btw-invoicing.md | 21% standard, 9% reduced VAT | 🟢 99% |
| emergency-surcharges | patterns/emergency-pricing.md | €50 after 17:00, €75 weekends | 🟢 96% |
| sepa-subscriptions | patterns/recurring-payments.md | Direct debit for regular customers | 🟡 87% |
| forgotten-materials | patterns/material-recovery.md | Recover €800/month lost revenue | 🟢 94% |
| mobile-checkout | patterns/phone-payments.md | One-thumb payment completion | 🟡 89% |

## 🇳🇱 Dutch Payment Ecosystem
### **Primary Methods (Priority Order)**
1. **iDEAL** (90% preference) - Direct bank transfers
2. **Credit/Debit Cards** (8%) - Visa/Mastercard
3. **PayPal** (2%) - Mainly expats

### **Business Banking Integration**
- **ABN AMRO** - Most plumber businesses
- **ING** - Second most popular
- **Rabobank** - Traditional choice
- **Mollie API** - Handles all Dutch banks automatically

## 🤝 Integration Points
- **← widget**: Emergency deposit requests from stressed customers
- **← dashboard**: Invoice generation and payment tracking
- **→ auth**: Secure payment processing with user isolation
- **→ calendar**: Payment confirmation triggers job confirmation
- **← emergency**: Surge pricing for Level 1-2 emergencies

## 🏆 Competitive Advantages in This Domain
- **vs ServiceM8**: No iDEAL support vs native Dutch payments
- **vs Jobber**: US-focused Stripe vs European Mollie
- **vs Traditional**: Manual invoices vs automated BTW calculations
- **vs Competitors**: English invoices vs proper Dutch business language

## 📊 Current Metrics & Targets
- iDEAL Success Rate: 98% → Target 99%
- Payment Completion Time: 45s → Target <30s
- BTW Calculation Accuracy: 99% → Maintain 99%+
- Emergency Surcharge Collection: 78% → Target 90%
- Forgotten Materials Recovery: €2,400/month → Target €3,200/month
- Mobile Payment Conversion: 89% → Target 95%

## 💰 Pricing Intelligence
### **Standard Rates**
- **Labor**: €75/hour (21% BTW)
- **Materials**: Cost + 15% margin (9% or 21% BTW depending on item)
- **Call-out**: €35 (21% BTW)

### **Emergency Surcharges**
- **After 17:00**: +€50 (21% BTW)
- **Weekends**: +€75 (21% BTW)
- **Public Holidays**: +€100 (21% BTW)
- **Level 1 Emergency**: +€125 (21% BTW)

## 🚀 Quick Start
Working on payments? You need:
1. This file for Dutch market context
2. PRP.md for current payment system status
3. Search patterns/ for Mollie and BTW implementations
4. Check benchmarks.md for transaction success requirements
5. Test with actual iDEAL transactions (not just Stripe)
6. Always verify BTW calculations are legally compliant

---

**Last Updated**: January 17, 2025  
**Next Review**: Weekly by Payment_Agent and Security_Agent
**Primary Agents**: Payment_Agent, Security_Agent, Database_Agent