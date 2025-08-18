# Emergency - Crisis Management System

## 🎯 Quick Context
**Purpose**: Transform "oh fuck, basement flooding" panic into organized emergency dispatch
**Users**: Stressed customers (panic mode) and available plumbers (earn premium rates)
**Competition**: No competitor has intelligent emergency classification - this is pure gold
**Status**: Check PRP.md for current development status

## 📁 What's In This Domain
- `CLAUDE.md` - You are here (emergency context)
- `PRP.md` - Current status, next priorities
- `patterns/` - Emergency detection, dispatch, pricing patterns
- `benchmarks.md` - Response times, accuracy metrics
- `anti-patterns.md` - Emergency handling mistakes to avoid

## 🔍 Key Patterns
| Pattern | File | Purpose | Success |
|---------|------|---------|---------|
| emergency-classification | patterns/level-detection.md | Level 1-4 urgency classification | 🟢 96% |
| dutch-panic-detection | patterns/dutch-emergency-terms.md | Recognize "lekkage", "overstroming" etc. | 🟢 98% |
| auto-dispatch | patterns/plumber-matching.md | Route to available emergency plumbers | 🟡 87% |
| surge-pricing | patterns/emergency-rates.md | Dynamic pricing for urgent situations | 🟢 94% |
| customer-calming | patterns/stress-reduction.md | Psychology to reduce panic | 🟢 92% |
| response-time-tracking | patterns/performance-monitoring.md | Monitor dispatch to arrival times | 🟢 95% |

## 🚨 Emergency Classification System
### **Level 1: CRITICAL (15 min response)**
- Burst pipes with flooding
- Gas smell with water involved
- Electrical + water emergency
- **Pricing**: +€125 surcharge

### **Level 2: URGENT (45 min response)**  
- Boiler failure (winter)
- Major leaks affecting property
- No hot water with health needs
- **Pricing**: +€75 surcharge

### **Level 3: STANDARD (2 hour response)**
- Toilet blockages
- Minor leaks
- Heating issues (non-critical)
- **Pricing**: Standard rates

### **Level 4: PLANNED (24-48 hour response)**
- Maintenance
- Installations
- Upgrades
- **Pricing**: Standard rates, possible discounts

## 🤝 Integration Points
- **← widget**: Receive customer panic messages
- **← ai-core**: Get emergency classification from AI
- **→ calendar**: Create emergency slots automatically
- **→ payments**: Apply surge pricing
- **→ dashboard**: Alert available plumbers
- **← auth**: Verify plumber availability and location

## 🏆 Competitive Advantages in This Domain
- **vs ServiceM8**: Manual emergency flagging vs automatic AI detection
- **vs Jobber**: No emergency classification vs our 4-level system
- **vs Traditional**: Phone tag chaos vs intelligent routing
- **vs Competitors**: English-only vs Dutch emergency terminology

## 📊 Current Metrics & Targets
- Emergency Detection Accuracy: 96% → Target 98%
- Average Response Time: 42 min → Target 30 min
- Level 1 Response: 18 min → Target 15 min
- Customer Panic Reduction: 4.1/5 calm rating → Target 4.7/5
- Plumber Emergency Revenue: €1,200/month → Target €2,000/month
- False Emergency Rate: 4% → Target <2%

## 🇳🇱 Dutch Emergency Terms Recognition
### **Critical Terms (Level 1)**
- "overstroming" (flooding)
- "gesprongen leiding" (burst pipe)
- "water overal" (water everywhere)
- "kelder loopt vol" (basement filling up)

### **Urgent Terms (Level 2)**
- "geen warm water" (no hot water)
- "cv kapot" (heating broken)
- "grote lekkage" (major leak)
- "boiler doet niets" (boiler not working)

## 📱 Mobile Emergency Optimization
- **One-tap emergency button**
- **Location auto-detection**
- **Photo upload for damage assessment**
- **Real-time plumber ETA**
- **WhatsApp status updates**

## 🚀 Quick Start
Working on emergency? You need:
1. This file for emergency system context
2. PRP.md for current emergency feature status
3. Search patterns/ for classification and dispatch implementations
4. Check benchmarks.md for critical response time requirements
5. Test with real Dutch emergency scenarios
6. Always prioritize customer stress reduction

---

**Last Updated**: January 17, 2025  
**Next Review**: Weekly by UX_Agent and AI_Agent
**Primary Agents**: AI_Agent, UX_Agent, Payment_Agent, Database_Agent