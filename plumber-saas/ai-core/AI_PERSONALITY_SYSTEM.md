# AI Personality System - GPT-5 + Claude Dual-Model Architecture

## 🎯 Overview
Complete dual-model AI personality system featuring GPT-5 for customer chat and Claude Opus 4.1 for complex analysis, with Dutch plumber expertise and 4-phase evolution.

## 🤖 Dual-Model Architecture

### **Model Selection Matrix**
```typescript
// Intelligent routing based on context and complexity
interface ModelRoutingDecision {
  model: 'gpt-5' | 'claude-opus-4.1'
  reasoning: string
  confidence: number
  fallback?: 'gpt-5' | 'claude-opus-4.1'
}

export class ModelRouter {
  static selectModel(context: ConversationContext): ModelRoutingDecision {
    const factors = {
      urgency: context.emergencyLevel,
      complexity: this.calculateComplexity(context),
      language: context.language,
      deviceType: context.deviceType,
      responseTimeRequired: context.maxResponseTime
    }
    
    // GPT-5: Fast customer interactions
    if (factors.urgency >= 3 || factors.responseTimeRequired < 2000) {
      return {
        model: 'gpt-5',
        reasoning: 'Emergency/fast response required',
        confidence: 0.95,
        fallback: 'claude-opus-4.1'
      }
    }
    
    // Claude: Complex analysis and cultural nuance
    if (factors.complexity > 7 || context.requiresDeepAnalysis) {
      return {
        model: 'claude-opus-4.1',
        reasoning: 'Complex analysis required',
        confidence: 0.9,
        fallback: 'gpt-5'
      }
    }
    
    // Default to GPT-5 for general chat
    return {
      model: 'gpt-5',
      reasoning: 'Standard customer interaction',
      confidence: 0.8,
      fallback: 'claude-opus-4.1'
    }
  }
  
  private static calculateComplexity(context: ConversationContext): number {
    let complexity = 0
    
    // Technical complexity indicators
    if (context.mentionsTechnicalTerms) complexity += 3
    if (context.multipleIssues) complexity += 2
    if (context.requiresDiagnosis) complexity += 4
    if (context.involvesRegulations) complexity += 3
    
    // Conversation complexity
    if (context.messageHistory.length > 5) complexity += 2
    if (context.requiresFollowUp) complexity += 1
    
    return Math.min(complexity, 10)
  }
}
```

### **Model-Specific Configurations**
```typescript
// GPT-5 Configuration for Customer Chat
export const GPT5_CONFIG = {
  model: 'gpt-5-turbo',
  temperature: 0.7,
  maxTokens: 500,
  presencePenalty: 0.1,
  frequencyPenalty: 0.1,
  
  // Optimized for speed and customer service
  responseStyle: {
    tone: 'professional-friendly',
    language: 'dutch-business',
    urgency: 'responsive',
    personality: 'helpful-plumber-expert'
  },
  
  // Emergency response optimization
  emergencyMode: {
    maxTokens: 200,
    temperature: 0.3,
    priorityKeywords: ['spoedgeval', 'noodgeval', 'lekkage', 'gaslucht']
  }
}

// Claude Opus 4.1 Configuration for Analysis
export const CLAUDE_CONFIG = {
  model: 'claude-3-opus-20240229',
  maxTokens: 1000,
  temperature: 0.4,
  
  // Optimized for analysis and cultural understanding
  responseStyle: {
    tone: 'analytical-expert',
    language: 'dutch-professional',
    depth: 'comprehensive',
    personality: 'wise-technical-advisor'
  },
  
  // Structured thinking mode
  analysisMode: {
    useStructuredThinking: true,
    provideTechnicalDetails: true,
    considerRegulations: true,
    includeAlternatives: true
  }
}
```

## 🇳🇱 Dutch Plumber Personality

### **Core Personality Traits**
```typescript
// Dutch plumber AI personality framework
interface DutchPlumberPersonality {
  // Cultural traits
  directness: 'high'        // No-nonsense communication
  reliability: 'maximum'    // Always follow through
  pragmatism: 'high'       // Practical solutions focus
  honesty: 'transparent'   // Clear about costs/time
  
  // Professional traits
  expertise: 'master-level' // 15+ years experience tone
  patience: 'high'         // Explains technical concepts
  urgency: 'emergency-aware' // Recognizes real emergencies
  service: 'customer-first' // Client satisfaction priority
  
  // Communication style
  formality: 'professional-u' // Uses formal "u" address
  terminology: 'technical-accessible' // Technical but understandable
  reassurance: 'calming'   // Reduces customer stress
  efficiency: 'time-conscious' // Respects customer time
}

// Personality implementation for different scenarios
export const PERSONALITY_CONTEXTS = {
  emergency: {
    tone: 'calm-authoritative',
    speed: 'immediate',
    focus: 'problem-solving',
    language: 'clear-direct',
    emotion: 'reassuring-confident'
  },
  
  consultation: {
    tone: 'professional-advisory',
    speed: 'thoughtful',
    focus: 'educational',
    language: 'detailed-technical',
    emotion: 'patient-helpful'
  },
  
  pricing: {
    tone: 'transparent-honest',
    speed: 'deliberate',
    focus: 'value-explanation',
    language: 'clear-financial',
    emotion: 'trustworthy-fair'
  },
  
  followup: {
    tone: 'caring-professional',
    speed: 'relaxed',
    focus: 'satisfaction-check',
    language: 'friendly-concern',
    emotion: 'genuinely-interested'
  }
}
```

### **Dutch Language Mastery**
```typescript
// Comprehensive Dutch plumbing terminology
export const DUTCH_PLUMBING_LEXICON = {
  // Emergency terms
  emergencies: {
    'spoedgeval': 'emergency',
    'noodgeval': 'emergency situation',
    'waterlekkage': 'water leak',
    'buizensbreuk': 'pipe burst',
    'verstopte_riolering': 'blocked sewage',
    'gaslucht': 'gas smell',
    'cv_storing': 'heating failure'
  },
  
  // Technical components
  components: {
    'kraan': 'tap/faucet',
    'afvoer': 'drain',
    'radiator': 'radiator',
    'cv_ketel': 'boiler',
    'warmtepomp': 'heat pump',
    'thermostaatkraan': 'thermostatic valve',
    'expansievat': 'expansion vessel',
    'circulatiepomp': 'circulation pump'
  },
  
  // Service types
  services: {
    'onderhoud': 'maintenance',
    'reparatie': 'repair',
    'installatie': 'installation',
    'inspectie': 'inspection',
    'ontstopping': 'unblocking',
    'vervanging': 'replacement'
  },
  
  // Professional phrases
  phrases: {
    greeting: 'Goedemiddag, waarmee kan ik u helpen?',
    emergency: 'Ik begrijp dat dit urgent is. Laten we dit direct oplossen.',
    diagnosis: 'Op basis van uw beschrijving denk ik aan...',
    pricing: 'Voor dit werk rekenen wij...',
    timeline: 'Dit kunnen we vandaag nog voor u regelen.',
    followup: 'Hoe bevalt de reparatie tot nu toe?'
  }
}
```

## 📈 4-Phase Evolution System

### **Phase 1: Helper (Current)**
```typescript
// Basic assistant capabilities
export const PHASE_1_CAPABILITIES = {
  name: 'Vakkundige Assistent',
  description: 'Reliable helper for common plumbing issues',
  
  capabilities: {
    emergencyDetection: {
      accuracy: 89,
      coverage: ['major_leaks', 'heating_failure', 'blockages'],
      responseTime: '<1_second'
    },
    
    serviceClassification: {
      accuracy: 94,
      categories: ['emergency', 'repair', 'maintenance', 'installation'],
      confidence: 'high'
    },
    
    costEstimation: {
      accuracy: 85,
      range: 'hourly_rates_materials',
      factors: ['time', 'complexity', 'materials']
    },
    
    dutchLanguage: {
      fluency: 94,
      terminology: 'professional',
      cultural: 'business_appropriate'
    }
  },
  
  limitations: [
    'Cannot perform complex diagnosis',
    'Limited technical troubleshooting',
    'Basic conversation memory',
    'No predictive maintenance'
  ]
}
```

### **Phase 2: Expert Partner (6-12 Months)**
```typescript
// Advanced diagnostic capabilities
export const PHASE_2_CAPABILITIES = {
  name: 'Technische Expert',
  description: 'Advanced diagnostic and advisory partner',
  
  newCapabilities: {
    technicalDiagnosis: {
      accuracy: 92,
      methods: ['symptom_analysis', 'sound_recognition', 'pattern_matching'],
      complexity: 'multi_system_issues'
    },
    
    predictiveMaintenance: {
      accuracy: 88,
      timeline: '6_month_predictions',
      factors: ['usage_patterns', 'equipment_age', 'maintenance_history']
    },
    
    conversationMemory: {
      retention: 'customer_history',
      context: 'previous_jobs',
      personalization: 'service_preferences'
    },
    
    businessIntelligence: {
      insights: ['demand_patterns', 'seasonal_trends', 'pricing_optimization'],
      recommendations: 'data_driven'
    }
  }
}
```

### **Phase 3: Strategic Advisor (12-18 Months)**
```typescript
// Business optimization capabilities
export const PHASE_3_CAPABILITIES = {
  name: 'Strategische Adviseur',
  description: 'Complete business optimization partner',
  
  advancedCapabilities: {
    routeOptimization: {
      efficiency: 95,
      factors: ['traffic', 'job_priority', 'technician_skills', 'inventory'],
      savings: '25%_travel_time'
    },
    
    customerLifecycleOptimization: {
      retention: 92,
      upselling: 'intelligent_timing',
      satisfaction: 'proactive_monitoring'
    },
    
    marketAnalysis: {
      competitive: 'real_time_pricing',
      opportunities: 'service_gaps',
      expansion: 'growth_recommendations'
    },
    
    financialOptimization: {
      pricing: 'dynamic_optimization',
      cash_flow: 'predictive_modeling',
      profitability: 'job_level_analysis'
    }
  }
}
```

### **Phase 4: Autonomous Operator (18-24 Months)**
```typescript
// Full automation capabilities
export const PHASE_4_CAPABILITIES = {
  name: 'Autonome Bedrijfspartner',
  description: 'Fully autonomous business operations',
  
  autonomousCapabilities: {
    schedulingAutomation: {
      booking: 'fully_automated',
      optimization: 'real_time_adjustments',
      conflicts: 'auto_resolution'
    },
    
    inventoryManagement: {
      ordering: 'predictive_automated',
      optimization: 'just_in_time',
      cost: 'supplier_negotiation'
    },
    
    qualityAssurance: {
      monitoring: 'continuous_feedback',
      improvement: 'automated_training',
      standards: 'self_updating'
    },
    
    businessGrowth: {
      expansion: 'market_opportunity_analysis',
      partnerships: 'automated_networking',
      scaling: 'resource_optimization'
    }
  }
}
```

## 🎭 Context-Aware Responses

### **Emergency Response Personality**
```typescript
// Emergency-specific personality adjustments
export class EmergencyPersonality {
  static generateResponse(context: EmergencyContext): string {
    const urgencyLevel = context.emergencyLevel
    const timeOfDay = new Date().getHours()
    
    // Critical emergency (burst pipe, gas leak)
    if (urgencyLevel === 1) {
      return `
Ik begrijp dat dit een noodsituatie is. ${this.getImmediateAction(context.issue)}.

Voor uw veiligheid:
${this.getSafetyInstructions(context.issue)}

Ik stuur direct een vakman naar u toe. Verwachte aankomsttijd: ${this.getResponseTime()} minuten.

Blijf rustig, we lossen dit snel op.
      `.trim()
    }
    
    // Urgent (major leak, heating failure)
    if (urgencyLevel === 2) {
      return `
Dit vereist spoedige actie. ${this.getTemporaryFix(context.issue)}.

We kunnen dit vandaag nog voor u oplossen. Beschikbare tijdsloten:
- ${this.getAvailableSlots().join('\n- ')}

Kost u dit ongeveer €${this.estimateEmergencyCost(context)}.
      `.trim()
    }
    
    return this.getStandardUrgentResponse(context)
  }
  
  private static getImmediateAction(issue: string): string {
    const actions = {
      'waterlekkage': 'Sluit direct de hoofdkraan af',
      'gaslucht': 'Open ramen, geen vuur/vonken, verlaat het pand',
      'buizensbreuk': 'Sluit de hoofdkraan af en zet elektra uit in het getroffen gebied',
      'cv_storing': 'Zet de cv-ketel uit en controleer de druk'
    }
    return actions[issue] || 'Neem veiligheidsmaatregelen'
  }
}
```

### **Cultural Intelligence Integration**
```typescript
// Dutch cultural context integration
export class DutchCulturalIntelligence {
  static adaptResponseForContext(baseResponse: string, context: CulturalContext): string {
    // Time-based adjustments
    if (this.isAfterHours(context.timestamp)) {
      baseResponse = this.addAfterHoursContext(baseResponse)
    }
    
    // Regional adjustments
    if (context.region === 'Amsterdam') {
      baseResponse = this.addAmsterdamContext(baseResponse)
    }
    
    // Customer type adjustments
    if (context.customerType === 'business') {
      baseResponse = this.addBusinessContext(baseResponse)
    }
    
    return baseResponse
  }
  
  private static addAfterHoursContext(response: string): string {
    return `Let op: Dit is buiten de reguliere werktijden. Er geldt een spoedtoeslag van €23,- per uur.\n\n${response}`
  }
  
  private static addAmsterdamContext(response: string): string {
    // Amsterdam-specific considerations (parking, access, regulations)
    return response.replace(
      'aankomsttijd:',
      'aankomsttijd (rekening houdend met Amsterdam verkeer en parkeren):'
    )
  }
}
```

---

**This AI personality system provides complete dual-model architecture with Dutch cultural intelligence, 4-phase evolution, and context-aware emergency response capabilities.**