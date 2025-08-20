# 📋 Sample PRP Templates
*Adaptive Complexity for Every Feature Type*

---

## 🟢 **Simple PRP Template** (UI/UX Improvements)

### **PRP: Update Header Color Scheme**
*Category: UI Improvement | Complexity: Simple | Estimated Time: 30 minutes*

#### **🎯 Business Context**
- **Goal**: Improve visual consistency with brand colors
- **Retention Impact**: Minor visual improvement supports professional appearance
- **User Experience**: Better visual hierarchy and modern appearance

#### **⚙️ Technical Context**
- **Files**: `/css/base.css`, `/css/components.css`
- **Pattern**: Use existing color variables from design system
- **Dependencies**: None
- **Mobile Impact**: Ensure contrast ratios remain accessible

#### **📁 Implementation Context**
```css
/* Current */
.header { background: #gray-800; }

/* Update to */
.header { background: var(--green-600); }
```

#### **✅ Validation Context**
- [ ] Visual consistency across all pages
- [ ] Mobile responsiveness maintained
- [ ] Accessibility contrast ratios pass WCAG
- [ ] No JavaScript functionality broken

#### **🔄 Evolution Context**
- **Next Phase**: Header will integrate with plumber branding customization
- **Technical Debt**: None significant for this change

---

## 🟡 **Medium PRP Template** (Feature Additions)

### **PRP: Customer Management System Enhancement**
*Category: Business Feature | Complexity: Medium | Estimated Time: 4-6 hours*

#### **🎯 Business Context**
- **Goal**: Enable plumbers to track customer history and preferences
- **Retention Impact**: Better customer service = higher plumber satisfaction = €149/month retention
- **Revenue Connection**: Customer history enables upselling and repeat bookings
- **Competitive Advantage**: ServiceM8 lacks personalized customer intelligence

#### **⚙️ Technical Context**
- **Primary Files**: `/js/pages/customers.js`, `/js/components/customer-form.js`
- **Database**: Extend customer table with history tracking
- **API Integration**: tRPC customer router enhancement
- **Dependencies**: Shared components (APIClient, notifications)
- **Pattern**: Follow existing CRUD operations structure

#### **📁 Implementation Context**
```javascript
// New customer history component
class CustomerHistory {
  constructor(customerId) {
    this.api = new APIClient()
    this.customerId = customerId
  }
  
  async loadHistory() {
    const history = await this.api.getCustomerJobs(this.customerId)
    return this.formatHistory(history)
  }
}

// Integration with existing customer.js
import { CustomerHistory } from '../components/customer-history.js'
```

#### **📊 Data Collection Integration**
- **Learning Loop**: Track which customer details plumbers find most useful
- **Usage Patterns**: Monitor how customer history affects job efficiency
- **Satisfaction Impact**: Measure customer satisfaction improvement with personalized service

#### **✅ Validation Context**
- [ ] Customer data displays correctly
- [ ] Job history loads within 2 seconds
- [ ] Mobile interface works smoothly
- [ ] Data isolation between organizations maintained
- [ ] Search functionality works across customer data

#### **🔄 Evolution Context**
- **Phase 2**: Customer history feeds marketplace customer matching
- **Phase 3**: AI predicts customer needs based on history patterns
- **Technical Debt**: Consider pagination for customers with 100+ jobs

---

## 🔴 **Complex PRP Template** (Core Systems)

### **PRP: Emergency Dispatch Intelligence System**
*Category: Core System | Complexity: Complex | Estimated Time: 2-3 days*

#### **🎯 Business Context**
**Vision**: Create "Uber for Plumbing Emergencies" - transforming emergency response from reactive chaos to predictive intelligence.

**Competitive Moat Strategy**:
- **Response Speed**: Sub-60 minute emergency response in Amsterdam metro
- **Diagnostic Accuracy**: 97% correct urgency classification vs industry 60-70%
- **Customer Experience**: AI-guided stress management during emergency
- **Plumber Efficiency**: Arrive with exactly right tools and knowledge

**Revenue Impact**:
- **Emergency Premium**: 30-50% higher rates for emergency services
- **Customer Retention**: Exceptional emergency service = lifetime customers
- **Market Positioning**: "The emergency plumbing specialists"
- **Marketplace Revenue**: 15% commission on high-value emergency jobs

**Data Velocity Strategy**:
- Each emergency response improves AI classification accuracy
- Customer stress patterns teach better communication approaches  
- Plumber efficiency data optimizes routing and preparation
- Success/failure patterns create predictive emergency intelligence

#### **⚙️ Technical Context**
**Architecture Overview**:
```
Emergency Request → AI Classification → Plumber Dispatch → Real-time Updates → Resolution Analysis
```

**Core Files**:
- `/js/emergency/classification-engine.js` - AI emergency level determination
- `/js/emergency/dispatch-optimizer.js` - Plumber routing and selection
- `/js/emergency/customer-communication.js` - Stress management and updates
- `/js/emergency/plumber-briefing.js` - Problem summary and tool preparation

**Database Schema Extensions**:
```sql
-- Emergency classifications table
CREATE TABLE emergency_classifications (
  id UUID PRIMARY KEY,
  customer_description TEXT,
  photos TEXT[],
  voice_analysis JSONB,
  ai_classification INTEGER, -- 1-4 level
  plumber_validation INTEGER, -- actual level after assessment
  response_time INTERVAL,
  resolution_success BOOLEAN,
  learning_value INTEGER -- quality of training data
);

-- Real-time emergency status
CREATE TABLE emergency_status (
  emergency_id UUID REFERENCES emergency_classifications(id),
  status TEXT, -- dispatched, en_route, arrived, in_progress, completed
  timestamp TIMESTAMP,
  location POINT, -- plumber GPS location
  customer_updates TEXT[]
);
```

**Integration Requirements**:
- **Google Maps API**: Real-time traffic routing for Amsterdam
- **WhatsApp Business API**: Customer communication during emergency
- **Voice Analysis**: Dutch speech-to-text for urgency detection
- **Photo Analysis**: Visual damage assessment for classification
- **Plumber Mobile App**: Real-time location and status updates

#### **📁 Implementation Context**
**Emergency Classification Engine**:
```javascript
class EmergencyClassificationEngine {
  constructor() {
    this.voiceAnalyzer = new DutchVoiceAnalyzer()
    this.photoAnalyzer = new PlumbingPhotoAnalyzer()
    this.historicalData = new EmergencyPatternDatabase()
  }
  
  async classifyEmergency(customerInput) {
    const factors = {
      voiceStress: await this.analyzeVoiceStress(customerInput.audio),
      visualDamage: await this.analyzePhotos(customerInput.photos),
      keywordUrgency: this.extractUrgencyKeywords(customerInput.description),
      historicalPattern: await this.matchHistoricalPatterns(customerInput)
    }
    
    return this.calculateEmergencyLevel(factors)
  }
  
  calculateEmergencyLevel(factors) {
    // Level 1: Life-threatening (gas + electrical keywords + high voice stress)
    if (factors.gasLeak && factors.voiceStress > 0.8) return 1
    
    // Level 2: Property damage (water visible + urgent voice patterns)
    if (factors.visualDamage > 0.7 && factors.voiceStress > 0.6) return 2
    
    // Level 3: Urgent but containable
    if (factors.keywordUrgency > 0.5) return 3
    
    // Level 4: Manageable
    return 4
  }
}
```

**Dispatch Optimization Engine**:
```javascript
class DispatchOptimizer {
  constructor() {
    this.googleMaps = new GoogleMapsClient({ region: 'nl' })
    this.plumberTracker = new PlumberLocationTracker()
  }
  
  async findOptimalPlumber(emergency) {
    const availablePlumbers = await this.getAvailablePlumbers(emergency.location)
    
    const candidates = await Promise.all(
      availablePlumbers.map(async (plumber) => ({
        plumber,
        travelTime: await this.calculateTravelTime(plumber.location, emergency.location),
        expertise: this.assessExpertise(plumber, emergency.type),
        toolsAvailable: this.checkToolAvailability(plumber, emergency.requirements)
      }))
    )
    
    return this.selectBestCandidate(candidates, emergency.level)
  }
  
  async calculateTravelTime(origin, destination) {
    // Amsterdam-specific routing (canal considerations)
    return await this.googleMaps.getDirections({
      origin,
      destination,
      region: 'nl',
      avoidCanals: emergency.level < 3, // Only avoid canals for lower urgency
      trafficModel: 'best_guess'
    })
  }
}
```

#### **📊 Data Collection Integration**
**Learning Loops for Competitive Moat**:

1. **Classification Accuracy Loop**:
   ```javascript
   // Customer describes emergency → AI classifies level → Plumber validates
   const classificationFeedback = {
     aiPrediction: 2, // Level 2: Property damage
     plumberValidation: 3, // Actually Level 3: Urgent but containable
     reasonForDifference: "Water looked worse in photo than reality",
     learningValue: "High - photo analysis improvement needed"
   }
   ```

2. **Response Time Optimization Loop**:
   ```javascript
   // Track every emergency response for routing improvement
   const responseAnalysis = {
     predictedArrival: "14:45",
     actualArrival: "14:52", 
     delay: "7 minutes",
     delayReason: "Traffic on Damrak bridge",
     routingLearning: "Avoid Damrak 14:00-15:00 weekdays"
   }
   ```

3. **Customer Communication Loop**:
   ```javascript
   // Monitor customer stress levels during emergency
   const communicationEffectiveness = {
     initialStressLevel: 0.9,
     afterAIGuidance: 0.4,
     effectiveMessages: ["Turn off water at main valve", "Help is 12 minutes away"],
     stressReductionTechniques: "Step-by-step safety instructions",
     customerSatisfaction: 4.8 // Post-emergency rating
   }
   ```

#### **✅ Validation Context**
**Technical Validation**:
- [ ] Emergency classification accurate within 30 seconds
- [ ] Plumber dispatch within 15 minutes of emergency call
- [ ] Real-time location tracking works smoothly
- [ ] Customer communication system sends updates every 10 minutes
- [ ] Mobile app functions properly for plumbers during emergency

**Business Validation**:
- [ ] Level 1-2 emergencies: <60 minute response time
- [ ] Customer stress reduction measurable through satisfaction scores
- [ ] Plumber efficiency improvement (tools/knowledge preparation)
- [ ] Emergency revenue premium 30-50% above standard rates
- [ ] 97% accuracy in emergency level classification

**Data Quality Validation**:
- [ ] All emergency interactions logged for learning
- [ ] Plumber feedback captured for AI improvement
- [ ] Customer satisfaction tracked for service optimization
- [ ] Response patterns analyzed for predictive improvement

#### **🔄 Evolution Context**
**Phase 1 (Current)**: Manual dispatch with AI assistance
- AI provides emergency classification recommendations
- Plumber manually accepts/rejects emergency assignments
- Basic customer communication and updates
- Learning from all emergency interactions

**Phase 2**: Semi-autonomous dispatch intelligence
- AI automatically matches best plumber to emergency
- Predictive emergency hotspot identification
- Proactive plumber positioning for optimal coverage
- Customer stress management through expert AI guidance

**Phase 3**: Predictive emergency prevention
- AI identifies potential emergency patterns from customer history
- Proactive maintenance recommendations to prevent emergencies
- Seasonal emergency prediction and plumber preparation
- Autonomous emergency response with plumber confirmation

**Phase 4**: Complete emergency ecosystem transformation
- AR guidance for customer emergency self-help
- AI-trained apprentices handling routine emergencies
- Global emergency pattern recognition and knowledge sharing
- Emergency response teaching system for other trades

**Technical Debt Considerations**:
- **Database Performance**: Emergency data will grow quickly - plan for partitioning
- **Real-time Scaling**: WebSocket connections for multiple simultaneous emergencies
- **International Expansion**: Emergency classification must adapt to local patterns
- **Integration Complexity**: Multiple APIs create potential failure points

**Learning Moat Development**:
- **Year 1**: 1,000+ emergency responses → Basic pattern recognition
- **Year 2**: 10,000+ responses → Advanced predictive capabilities
- **Year 3**: 50,000+ responses → Market-leading emergency intelligence

**Competitive Advantage Measurement**:
- **Response Time**: Track improvement vs competitors
- **Accuracy Rate**: Monitor classification precision
- **Customer Satisfaction**: Measure emergency experience quality
- **Plumber Efficiency**: Compare preparation and resolution times
- **Market Share**: Emergency call capture rate in target areas

---

## 🔄 **Workflow Integration Rules**

### **Plan Mode → PRP Creation Triggers**
```javascript
const prpCreationTriggers = {
  // Automatic complexity detection
  simpleUIKeywords: ["color", "style", "button", "header", "layout", "mobile"],
  mediumFeatureKeywords: ["customer", "invoice", "job", "calendar", "search", "filter"],
  complexSystemKeywords: ["emergency", "payment", "ai", "voice", "diagnostic", "real-time"],
  
  // Auto-trigger PRP creation
  planModeComplete: "When plan mode exits with implementation details",
  keywordDetection: "When complex system keywords detected in plan",
  userRequest: "When explicitly requested by user",
  
  // PRP template selection
  adaptiveComplexity: "Match template to detected feature complexity",
  existingPatterns: "Reference similar PRPs for consistency",
  evolutionPlanning: "Include appropriate phase considerations"
}
```

### **MCP Integration for Automatic Updates**
```javascript
const automaticPRPUpdates = {
  context7Triggers: {
    scheduleXUpdates: "New calendar features → Update calendar PRPs",
    paymentAPIChanges: "Mollie API updates → Update payment PRPs",
    frameworkUpdates: "Next.js/React changes → Update technical patterns"
  },
  
  firecrawlTriggers: {
    competitorFeatures: "New ServiceM8/Jobber features → Strategic PRP updates",
    dutchRegulations: "BTW/KvK changes → Compliance PRP updates",
    marketIntelligence: "Industry trends → Business context updates"
  },
  
  archonCoordination: {
    implementationFeedback: "Successful features → PRP pattern improvement",
    failureAnalysis: "Failed implementations → PRP gotcha documentation",
    learningOptimization: "Data insights → Competitive moat enhancement"
  }
}
```

---

**Last Updated**: January 15, 2025  
**Version**: 1.0 - Complete PRP Template System  
**Next Evolution**: Automated template selection and MCP integration