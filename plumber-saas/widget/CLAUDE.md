# Widget - Customer Panic Interface

## 🎯 Quick Context
**Purpose**: Transform "oh fuck, basement flooding" → calm booking in <30 seconds via Vercel AI SDK
**Users**: Stressed Dutch customers on mobile phones  
**Competition**: ServiceM8 has no chat, Jobber uses basic forms
**Status**: ✅ **FULLY IMPLEMENTED** - Production-ready AI SDK chat widget with T3 Stack

## 📁 What's In This Domain
- `CLAUDE.md` - You are here (widget context)
- `PRP.md` - Current status, next priorities
- `patterns/` - All widget implementation patterns
- `benchmarks.md` - Conversion rates, performance metrics
- `anti-patterns.md` - Competitor mistakes to avoid

## 🔍 Key Patterns
| Pattern | File | Purpose | Success |
|---------|------|---------|---------|
| emergency-detection | patterns/chat-detection.md | Recognize Dutch panic terms | 🟢 96% |
| trust-signals | patterns/trust-building.md | Build instant credibility | 🟢 94% |
| mobile-booking | patterns/one-thumb-flow.md | Glove-friendly forms | 🟡 89% |
| chat-interface | patterns/ai-chat-flow.md | AI SDK streaming chat (GPT-4o + Claude 3.5) | 🟢 92% |
| conversion-flow | patterns/panic-to-booking.md | 3-click booking process | 🟡 87% |
## 🏗️ **AI SDK TECH STACK (PRODUCTION-READY)**

### **Widget AI Framework**
```typescript
Vercel AI SDK v5:
  - useChat() hook - Real-time streaming chat widget
  - Emergency detection with Claude 3.5 Sonnet
  - Fast responses with GPT-4o Mini
  - Type-safe tRPC integration

Widget Architecture:
  - Next.js App Router - Server-side AI processing
  - React streaming - Optimistic UI updates
  - Mobile-first PWA - One-thumb operations
  - GDPR-compliant data handling
```

### **AI Model Routing for Widget**
```typescript
Smart Widget Routing:
  - anthropic('claude-3-5-sonnet-20241022') // Emergency triage
  - openai('gpt-4o-mini') // Fast customer chat
  - openai('gpt-4o') // Complex scheduling logic

API Endpoints:
  - /api/chat - Streaming widget conversations
  - /api/trpc/ai.triageEmergency - Emergency classification
  - /api/trpc/ai.chatCompletion - Customer support
```

## 🤝 Integration Points
- **→ ai-core**: Emergency detection via AI SDK streaming
- **→ payments**: Trigger emergency deposits via Mollie  
- **→ dashboard**: Create job in plumber's calendar
- **← mobile**: Receive touch optimization patterns
- **→ auth**: Customer session management

## 🏆 Competitive Advantages in This Domain
- **vs ServiceM8**: AI SDK streaming chat vs no chat at all
- **vs Jobber**: AI SDK dual-model intelligence vs basic forms
- **vs Zoofy**: Direct AI relationship vs platform control
- **vs DIY Facebook**: Professional AI panic interface vs amateur posts

## 📊 Current Metrics & Targets
- Widget Load Time: 1.2s → Target <1s
- Chat Response Time: 800ms → Target <500ms
- Conversion Rate: 67% → Target 85%
- Mobile Usage: 78% of all sessions
- Emergency Detection: 89% → Target 95%
- Customer Stress Reduction: 4.1/5 → Target 4.7/5

## 🚀 Quick Start
Working on widget? You need:
1. This file for context
2. PRP.md for current development status
3. Search patterns/ for implementations
4. Check benchmarks.md for performance data
5. Review anti-patterns.md for what NOT to do

---

## 🤖 ULTIMATE WORKFLOW INTEGRATION

**Active**: 9-Phase Automation with 10 Specialist Agents
**Mode**: Dynamic Agent Selection (1-10 based on task complexity)
**Research**: Agents handle all external research (Context7 + Firecrawl)

### Widget-Specific Agent Focus:
- **AI Specialist**: AI SDK dual-model routing (GPT-4o + Claude 3.5), Dutch emergency detection, panic term recognition
- **UX Specialist**: Panic-to-calm conversion flow, mobile-first design, trust building
- **UI Specialist**: One-thumb operations, chat interface, mobile responsiveness
- **Security Specialist**: GDPR compliance, session security, cross-domain protection
- **Business Specialist**: Dutch market optimization, conversion tracking, competitive analysis

### Phase 8 Triple Review for Widget:
- **Security**: Verify GDPR compliance, data protection, cross-domain security
- **UX**: Validate panic-to-booking flow, mobile usability, stress reduction
- **Architect**: Ensure clean widget architecture, optimal performance, scalable design

**Pattern Research**: When widget patterns are unknown, AI Agent researches chat interfaces via Context7, UX Agent researches conversion flows via Firecrawl
**Emergency Intelligence**: AI Agent specializes in Dutch panic detection (Level 1-4 classification)
**Dutch Optimization**: Business Agent ensures cultural adaptation, mobile-first approach

---

**Last Updated**: January 18, 2025  
**Next Review**: Weekly by Ultimate Workflow Phase 8 Triple Review
**Primary Agents**: AI_Agent, UX_Agent, UI_Agent, Security_Agent, Business_Agent
- **Offline Capability**: Basic functionality without internet

### **Performance Standards**
- **Load Time**: <2 seconds initial widget load
- **Response Time**: <1 second AI message processing
- **Bundle Size**: <150KB compressed widget code
- **Battery Efficiency**: Optimized for mobile device power consumption

## 🔄 Real-time Features

### **Live Chat Experience**
- **Typing Indicators**: Real-time user activity feedback
- **Message Delivery**: Instant message synchronization
- **Connection Status**: Visual indicators for network state
- **Auto-Reconnection**: Seamless recovery from disconnections

### **Conversion Tracking**
- **Lead Generation**: Automatic contact capture
- **Booking Conversion**: From chat to scheduled appointment
- **Value Attribution**: Revenue tracking per widget session
- **A/B Testing**: Personality and flow optimization

## 🎯 Business Integration

### **CRM Synchronization**
- **Customer Data**: Automatic profile creation and updates
- **Interaction History**: Complete conversation logging
- **Lead Scoring**: ML-powered conversion probability
- **Follow-up Automation**: Email and SMS sequences

### **Calendar Integration**
- **Availability Checking**: Real-time schedule verification
- **Appointment Booking**: Direct calendar slot reservation
- **Confirmation System**: Automated booking confirmations
- **Reminder Automation**: WhatsApp and email reminders

## 🔐 Security & Privacy

### **Data Protection**
- **GDPR Compliance**: Full European privacy regulation adherence
- **Data Minimization**: Collect only necessary information
- **Encryption**: End-to-end message encryption
- **Retention Policies**: Automatic data deletion schedules

### **Cross-Domain Security**
- **CORS Configuration**: Restricted domain embedding
- **Rate Limiting**: IP-based abuse prevention
- **Input Validation**: Comprehensive XSS protection
- **Session Security**: Secure token management

## 📊 Analytics & Insights

### **Conversation Analytics**
- **Popular Questions**: Most frequent customer inquiries
- **Conversion Funnels**: Chat-to-booking optimization
- **Satisfaction Scores**: Customer feedback integration
- **Response Quality**: AI accuracy measurement

### **Business Intelligence**
- **Lead Source Attribution**: Traffic and conversion tracking
- **Seasonal Patterns**: Emergency vs. planned service trends
- **Geographic Analysis**: Service area performance mapping
- **Competitive Intelligence**: Market positioning insights

## 🛠️ Development Workflow

### **Widget Deployment Process**
1. **Code Changes**: Update widget components
2. **Build Process**: Compile and optimize for production
3. **CDN Distribution**: Deploy to global content delivery network
4. **Version Management**: Backward compatibility maintenance
5. **Performance Monitoring**: Real-time performance tracking

### **Testing Strategy**
- **Unit Testing**: Component functionality validation
- **Integration Testing**: AI model response verification
- **Cross-Browser Testing**: Compatibility across all platforms
- **Load Testing**: High-traffic scenario simulation
- **A/B Testing**: Conversion optimization experiments

## 🚨 Emergency Protocols

### **Critical Issue Response**
- **AI Failures**: Automatic fallback to human handoff
- **Server Downtime**: Graceful degradation with offline forms
- **Payment Issues**: Alternative booking methods
- **Security Breaches**: Immediate containment and notification

### **24/7 Monitoring**
- **Uptime Tracking**: 99.9% availability target
- **Performance Metrics**: Response time and error rates
- **Security Scanning**: Continuous vulnerability assessment
- **Usage Analytics**: Real-time traffic and conversion monitoring

---

**This widget development guide provides complete implementation patterns for building a production-ready AI chat widget with Dutch market optimization, dual-model AI integration, and conversion-focused design.**

**For specific implementation details, refer to the linked specialist documentation files above.**