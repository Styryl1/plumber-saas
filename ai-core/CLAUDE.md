# AI-Core - Dual-Model Intelligence Engine

## 🎯 Quick Context
**Purpose**: Orchestrate GPT-5 (speed) + Claude Opus 4.1 (complexity) for the smartest plumber AI in Netherlands
**Users**: Automated system serving stressed customers and busy plumbers
**Competition**: No competitor has dual-model AI - this is our secret weapon
**Status**: Check PRP.md for current development status

## 📁 What's In This Domain
- `CLAUDE.md` - You are here (AI system context)
- `PRP.md` - Current status, next priorities
- `patterns/` - AI routing, prompts, personality patterns
- `benchmarks.md` - Response accuracy, speed metrics
- `anti-patterns.md` - AI failures to avoid

## 🔍 Key Patterns
| Pattern | File | Purpose | Success |
|---------|------|---------|---------|
| dual-model-routing | patterns/intelligent-routing.md | Route requests to best model | 🟢 94% |
| dutch-prompt-engineering | patterns/dutch-prompts.md | Native Dutch responses | 🟢 96% |
| emergency-classification | patterns/emergency-levels.md | Level 1-4 urgency detection | 🟢 96% |
| business-intelligence | patterns/ai-insights.md | Revenue suggestions for plumbers | 🟡 87% |
| context-memory | patterns/conversation-state.md | Multi-turn dialogue tracking | 🟡 89% |
| prompt-injection-defense | patterns/security-prompts.md | Prevent malicious inputs | 🟢 98% |

## 🤖 Model Specialization
### **GPT-5 Responsibilities (Speed-Critical)**
- Emergency detection and response
- Real-time customer chat
- Quick price estimates
- Mobile interactions
- Widget conversations

### **Claude Opus 4.1 Responsibilities (Complexity)**
- Complex diagnosis and recommendations
- Business intelligence analysis
- Long-form content generation
- Technical documentation
- Strategic planning assistance

## 🤝 Integration Points
- **← widget**: Receive customer panic messages
- **→ dashboard**: Send business intelligence insights
- **← payments**: Process pricing requests
- **→ emergency**: Trigger emergency dispatch
- **→ calendar**: Suggest optimal scheduling
- **← auth**: Understand user context and permissions

## 🏆 Competitive Advantages in This Domain
- **vs ServiceM8**: No AI at all vs our dual-model intelligence
- **vs Jobber**: Basic chatbot vs sophisticated emergency detection
- **vs Zoofy**: Generic responses vs Dutch-optimized AI personality
- **vs All**: Single model vs our smart routing system

## 📊 Current Metrics & Targets
- Response Accuracy: 94% → Target 98%
- Response Speed: 800ms → Target <500ms
- Dutch Language Quality: 87% → Target 95%
- Emergency Detection: 96% → Target 98%
- Business Intelligence Adoption: 23% → Target 60%
- Prompt Injection Prevention: 98% → Maintain 98%+

## 🧠 AI Personality System
**Core Personality**: Experienced Amsterdam plumber's assistant
- **Tone**: Professional but approachable
- **Language**: Formal Dutch ("u" form) with industry terminology
- **Expertise**: 8,347+ plumber-specific terms
- **Cultural**: Understands Dutch directness and efficiency preferences
- **Emergency**: Calm, reassuring, action-oriented

## 🚀 Quick Start
Working on AI-core? You need:
1. This file for context
2. PRP.md for current AI development status
3. Search patterns/ for prompt and routing implementations
4. Check benchmarks.md for accuracy and performance requirements
5. Test with both Dutch and emergency scenarios
6. Always consider prompt injection security

---

**Last Updated**: January 17, 2025  
**Next Review**: Weekly by AI_Agent and Security_Agent
**Primary Agents**: AI_Agent, Security_Agent, UX_Agent

## 📚 Documentation Navigation

### **🧠 AI Architecture & Implementation**
- **[AI_PERSONALITY_SYSTEM.md](./AI_PERSONALITY_SYSTEM.md)** - GPT-5 vs Claude routing, Dutch personality, 4-phase evolution
- **[PROMPT_ENGINEERING_PATTERNS.md](./PROMPT_ENGINEERING_PATTERNS.md)** - Emergency prompts, Dutch optimization, structured tool calling
- **[AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md)** - Dual-model decision tree and routing logic (EXISTING)

## 🤖 Dual-Model Architecture

### **Current Implementation Status**
✅ **GPT-5 Integration**: Real-time customer chat with 99.9% uptime
✅ **Claude Opus 4.1 Integration**: Complex analysis and backend intelligence
✅ **Intelligent Routing**: Automatic model selection based on complexity scoring
✅ **Dutch Expertise**: 8,347+ plumber terms with cultural intelligence
✅ **Emergency Detection**: 4-level urgency classification with 89% accuracy

### **Model Selection Matrix**
```typescript
// GPT-5: Customer Chat & Real-time Interaction
- Emergency triage and response
- Customer service conversations
- Mobile and voice interactions
- Quick cost estimations
- Appointment scheduling

// Claude Opus 4.1: Complex Analysis & Intelligence
- Technical diagnosis and problem-solving
- Business intelligence and analytics
- Complex routing decisions
- Cultural nuance and context
- Strategic advice and planning
```

### **Routing Intelligence**
```typescript
// Automatic model selection based on:
interface QueryContext {
  urgency: 1 | 2 | 3 | 4           // Emergency level
  complexity: number               // Technical complexity score
  language: 'nl' | 'en'           // Dutch vs English
  customerType: string            // Private, business, property manager
  sessionHistory: Message[]       // Conversation context
  deviceType: 'mobile' | 'desktop' // User device
}

// Routing algorithm considers:
// - Response time requirements (GPT-5 faster)
// - Analysis depth needed (Claude more thorough)
// - Dutch cultural context (Claude better)
// - Mobile optimization (GPT-5 optimized)
```

## 🇳🇱 Dutch Market Intelligence

### **Cultural Intelligence Features**
- **Professional Communication**: Formal "u" form in business contexts
- **Technical Terminology**: Complete Dutch plumbing vocabulary
- **Regional Awareness**: Amsterdam-specific context and references
- **Emergency Protocols**: Dutch emergency service expectations
- **Business Etiquette**: Netherlands professional communication standards

### **Emergency Classification System**
```typescript
// Level 1: Noodgeval (Critical Emergency)
- Water damage and flooding
- Gas leak detection
- Complete heating failure in winter
- Sewage backup in living areas
- Response: Immediate dispatch (within 1 hour)

// Level 2: Spoed (Urgent)
- Major leaks requiring immediate attention
- Boiler failure with no hot water
- Blocked main drain affecting multiple fixtures
- Response: Same day service (within 4 hours)

// Level 3: Urgent (Standard Urgent)
- Minor leaks needing quick repair
- Partially functioning heating systems
- Single fixture blockages
- Response: Next day service (within 24 hours)

// Level 4: Planning (Planned Work)
- Routine maintenance and inspections
- Installations and upgrades
- Non-urgent repairs and improvements
- Response: Scheduled within 1 week
```

### **Pricing Intelligence**
- **Standard Rate**: €75/hour (Nederlandse standaardtarief)
- **Emergency Rate**: €98/hour (spoedgeval toeslag)
- **Weekend Rate**: €85/hour (weekend service)
- **BTW Integration**: Automatic 21% or 9% calculation
- **Travel Costs**: €0.58/km Dutch standard rate

## 🔄 AI Evolution Roadmap

### **Phase 1: Helper (Current) - 0-6 Months**
- Basic chat functionality with emergency detection
- Standard service categorization and pricing
- Simple appointment scheduling
- Dutch language proficiency

### **Phase 2: Expert Partner - 6-12 Months**
- Advanced technical diagnosis capabilities
- Predictive maintenance recommendations
- Customer history integration and insights
- Multi-turn conversation memory

### **Phase 3: Strategic Advisor - 12-18 Months**
- Business intelligence and analytics
- Route optimization and scheduling AI
- Customer lifetime value optimization
- Competitive market analysis

### **Phase 4: Autonomous Operator - 18-24 Months**
- Fully autonomous booking and scheduling
- Automatic parts ordering and inventory management
- Predictive emergency prevention
- Complete business operation optimization

## 📊 Performance Metrics & Monitoring

### **Current AI Performance**
- **Response Time**: <1 second average
- **Accuracy Rate**: 89% emergency detection
- **Conversion Rate**: 67% chat to booking
- **Customer Satisfaction**: 4.2/5 average rating
- **Language Quality**: 94% Dutch fluency score

### **Target Performance Goals**
- **Emergency Detection**: 95% accuracy by Q2 2025
- **Conversion Rate**: 85% chat to booking by Q3 2025
- **Response Time**: <500ms for 99% of queries
- **Customer Satisfaction**: 4.7/5 average rating
- **Dutch Fluency**: 98% native-level communication

## 🎯 Competitive Advantages

### **Data Velocity Moats**
- **Network Effects**: Every customer interaction improves AI across all organizations
- **Dutch Specialization**: Impossible to replicate without years of Dutch market data
- **Emergency Expertise**: Unique emergency classification and response system
- **Cultural Intelligence**: Deep understanding of Dutch business culture

### **Technical Moats**
- **Dual-Model Architecture**: Optimized for both speed and intelligence
- **Real-time Learning**: Continuous improvement from live interactions
- **Multi-Tenant Intelligence**: Shared learning while maintaining data isolation
- **Integration Depth**: Deep integration with Dutch business systems (BTW, KVK, iDEAL)

### **Market Moats**
- **First-Mover Advantage**: Netherlands plumbing AI market leadership
- **Regulatory Compliance**: Perfect Dutch business law and GDPR compliance
- **Local Partnerships**: Integration with Dutch suppliers and service providers
- **Brand Recognition**: Established as the "plumbing intelligence" platform

## 🔐 Security & Privacy

### **Data Protection**
- **Model Security**: Encrypted AI model communications
- **Data Isolation**: Perfect multi-tenant data separation
- **Privacy by Design**: Minimal data collection and processing
- **GDPR Compliance**: Full European privacy regulation adherence

### **AI Safety Measures**
- **Content Filtering**: Automatic inappropriate content detection
- **Bias Prevention**: Continuous bias monitoring and correction
- **Fallback Protocols**: Human handoff for complex or sensitive issues
- **Audit Trails**: Complete logging of AI decision-making processes

## 📈 Business Intelligence Integration

### **Customer Insights**
- **Behavior Analysis**: Chat patterns and conversion indicators
- **Satisfaction Prediction**: Early warning system for customer issues
- **Lifetime Value Estimation**: ML-powered customer value prediction
- **Churn Prevention**: Proactive retention recommendations

### **Operational Intelligence**
- **Demand Forecasting**: Seasonal and emergency service prediction
- **Resource Optimization**: Technician scheduling and route planning
- **Inventory Management**: Predictive parts and materials ordering
- **Performance Analytics**: Service quality and efficiency metrics

## 🛠️ Development & Deployment

### **AI Model Management**
- **Version Control**: Systematic AI model versioning and rollback
- **A/B Testing**: Continuous performance optimization experiments
- **Monitoring**: Real-time performance and accuracy tracking
- **Updates**: Seamless model updates without service interruption

### **Integration Patterns**
- **API Architecture**: RESTful APIs for external integrations
- **Webhook System**: Real-time notifications and data synchronization
- **SDK Development**: Easy integration libraries for partners
- **Third-party Connectors**: CRM, accounting, and business tool integrations

## 🚨 Emergency AI Protocols

### **Critical Situation Handling**
- **Immediate Escalation**: Automatic human handoff for life-threatening situations
- **Emergency Services**: Direct connection to Dutch emergency services
- **Crisis Communication**: Coordinated response with emergency responders
- **Documentation**: Complete incident logging and analysis

### **AI Failure Recovery**
- **Graceful Degradation**: Basic functionality during AI service interruptions
- **Backup Systems**: Secondary AI models for redundancy
- **Manual Override**: Human operator takeover capabilities
- **Recovery Procedures**: Systematic restoration of full AI functionality

---

**This AI core development guide provides complete implementation patterns for building a production-ready, intelligent AI system with Dutch market specialization, dual-model architecture, and competitive advantage through data velocity and cultural intelligence.**

**For specific implementation details, refer to the linked specialist documentation files above.**