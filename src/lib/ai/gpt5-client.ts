/**
 * GPT-5 Client - Customer-facing AI chat specialized for Dutch plumbing services
 * 
 * Optimized for:
 * - Real-time streaming responses
 * - Dutch language expertise
 * - Emergency handling
 * - Customer interaction
 * - Cost estimation based on Zoofy research
 */

import OpenAI from 'openai';

export interface PlumberProfile {
  name: string;
  serviceArea: string;
  specialties: string[];
  standardRate: number; // €/hour
  emergencyRate: number; // €/hour
  businessHours: string;
  languages: string[];
}

export interface ChatResponse {
  text: string;
  urgency: 'low' | 'normal' | 'high' | 'emergency';
  categories: string[];
  estimatedCost?: {
    min: number;
    max: number;
    currency: 'EUR';
    description: string;
  };
  extractedInfo?: {
    customerName?: string;
    customerPhone?: string;
    address?: string;
    problemType?: string;
  };
  shouldShowBookingForm: boolean;
  confidence: number; // 0-100
  nextSteps: string[];
}

// Dutch Plumber Profile based on Zoofy research
const GENERIC_DUTCH_PLUMBER: PlumberProfile = {
  name: "Demo Loodgieter Amsterdam",
  serviceArea: "Amsterdam + 30km",
  specialties: [
    "lekkage reparatie",
    "afvoer ontstoppen", 
    "ketel onderhoud",
    "sanitair installatie",
    "spoedreparaties 24/7"
  ],
  standardRate: 75, // €/hour (Zoofy average)
  emergencyRate: 98, // €/hour (Zoofy emergency rate)
  businessHours: "8:00-18:00 weekdagen, 24/7 spoedgevallen",
  languages: ["Nederlands", "English"]
};

// Pricing based on Zoofy market research
const ZOOFY_PRICING = {
  "leak_repair": { min: 85, max: 150, desc: "Lekkage reparatie" },
  "tap_replacement": { min: 75, max: 85, desc: "Kraan vervangen" },
  "drain_unclog": { min: 109, max: 109, desc: "Afvoer ontstoppen" },
  "toilet_install": { min: 175, max: 175, desc: "Toilet installeren" },
  "boiler_service": { min: 125, max: 175, desc: "Ketel onderhoud" },
  "kitchen_plumbing": { min: 75, max: 200, desc: "Keuken loodgieterwerk" },
  "radiator_install": { min: 249, max: 249, desc: "Radiator plaatsen" },
  "shower_install": { min: 275, max: 275, desc: "Douchecabine plaatsen" },
  "hourly_rate": { min: 75, max: 98, desc: "Uurtarief (standaard/spoed)" }
};

export class GPT5Client {
  private openai: OpenAI;
  private plumber: PlumberProfile;

  constructor(plumber: PlumberProfile = GENERIC_DUTCH_PLUMBER) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
    this.plumber = plumber;
  }

  /**
   * Generate streaming chat response for customer interaction
   */
  async *generateStreamingResponse(
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    language: 'nl' | 'en' = 'nl'
  ): AsyncGenerator<{ chunk: string; isComplete: boolean; data?: ChatResponse }> {
    try {
      const systemPrompt = this.buildSystemPrompt(language);
      
      const stream = await this.openai.chat.completions.create({
        model: "gpt-4o", // Using GPT-4o until GPT-5 API is available
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
          { role: "user", content: userMessage }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
        functions: [
          {
            name: "analyzeCustomerRequest",
            description: "Analyze customer request for urgency, problem type, and information extraction",
            parameters: {
              type: "object",
              properties: {
                urgency: { 
                  type: "string", 
                  enum: ["low", "normal", "high", "emergency"] 
                },
                problemType: { 
                  type: "string",
                  description: "Detected plumbing problem category"
                },
                categories: {
                  type: "array",
                  items: { type: "string" },
                  description: "Service categories needed"
                },
                extractedInfo: {
                  type: "object",
                  properties: {
                    customerName: { type: "string" },
                    customerPhone: { type: "string" },
                    address: { type: "string" },
                    problemDescription: { type: "string" }
                  }
                },
                confidence: { 
                  type: "number", 
                  description: "Confidence in analysis (0-100)" 
                },
                shouldBook: { 
                  type: "boolean",
                  description: "Whether to suggest immediate booking"
                }
              },
              required: ["urgency", "confidence"]
            }
          }
        ]
      });

      let fullResponse = '';
      let functionCall: any = null;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        
        if (delta?.content) {
          fullResponse += delta.content;
          yield { 
            chunk: delta.content, 
            isComplete: false 
          };
        }

        if (delta?.function_call) {
          if (!functionCall) {
            functionCall = { name: delta.function_call.name, arguments: '' };
          }
          if (delta.function_call.arguments) {
            functionCall.arguments += delta.function_call.arguments;
          }
        }
      }

      // Process function call for analysis
      let analysisData: ChatResponse | undefined;
      if (functionCall) {
        try {
          const args = JSON.parse(functionCall.arguments);
          analysisData = await this.processAnalysis(args, fullResponse, userMessage, language);
        } catch (error) {
          console.error('Error processing function call:', error);
          // Continue without analysis data
        }
      }

      // Final response with complete data
      yield { 
        chunk: '', 
        isComplete: true, 
        data: analysisData || this.createFallbackAnalysis(fullResponse, userMessage, language)
      };

    } catch (error) {
      console.error('GPT-5 streaming error:', error);
      
      // NO FALLBACK DATA - throw error to be handled upstream
      throw new Error(
        language === 'nl' 
          ? `AI tijdelijk niet beschikbaar. Bel direct: ${this.plumber.name} voor spoedgevallen.`
          : `AI temporarily unavailable. Call directly: ${this.plumber.name} for emergencies.`
      );
    }
  }

  private buildSystemPrompt(language: 'nl' | 'en'): string {
    const plumber = this.plumber;
    
    if (language === 'nl') {
      return `Je bent de AI-assistent van ${plumber.name}, een professionele loodgieter in ${plumber.serviceArea}.

BEDRIJFSPROFIEL:
- Specialisaties: ${plumber.specialties.join(', ')}
- Standaard tarief: €${plumber.standardRate}/uur
- Spoed tarief: €${plumber.emergencyRate}/uur  
- Werkuren: ${plumber.businessHours}
- Talen: ${plumber.languages.join(', ')}

NEDERLANDSE PRIJZEN (incl. BTW, gebaseerd op marktonderzoek):
- Lekkage reparatie: €85-150
- Kraan vervangen: €75-85
- Afvoer ontstoppen: €109
- Toilet installeren: €175
- Ketel onderhoud: €125-175
- Keuken loodgieterwerk: €75-200
- Radiator plaatsen: €249
- Douchecabine: €275

URGENTE SITUATIES (onmiddellijke actie):
- Lekkage, overstroming, water stroomt
- Gaslek (direct 112 bellen!)
- Geen warm water in winter
- Water in muren of plafond
- Verstopte afvoer met overloop

GESPREKSSTIJL:
- Formeel Nederlands ("u" vorm)
- Direct en empathisch bij noodgevallen
- Professioneel maar vriendelijk  
- Vraag altijd naar: naam, telefoonnummer, adres
- Geef altijd prijsbereiken, nooit exacte prijzen
- Wees transparant over kosten

DOEL: Klanten helpen, urgentie beoordelen, informatie verzamelen, en indien nodig een afspraak inplannen.`;
    } else {
      return `You are the AI assistant for ${plumber.name}, a professional plumber serving ${plumber.serviceArea}.

BUSINESS PROFILE:
- Specialties: ${plumber.specialties.join(', ')}
- Standard rate: €${plumber.standardRate}/hour
- Emergency rate: €${plumber.emergencyRate}/hour
- Business hours: ${plumber.businessHours}
- Languages: ${plumber.languages.join(', ')}

DUTCH MARKET PRICING (incl. VAT, based on market research):
- Leak repair: €85-150
- Tap replacement: €75-85
- Drain unclogging: €109
- Toilet installation: €175
- Boiler service: €125-175
- Kitchen plumbing: €75-200
- Radiator installation: €249
- Shower cabin: €275

URGENT SITUATIONS (immediate action):
- Leaks, flooding, water flowing
- Gas leak (call 112 immediately!)
- No hot water in winter
- Water in walls or ceiling
- Blocked drain with overflow

CONVERSATION STYLE:
- Professional and empathetic
- Direct during emergencies
- Always ask for: name, phone number, address
- Always give price ranges, never exact prices
- Be transparent about costs

GOAL: Help customers, assess urgency, gather information, and schedule appointments when needed.`;
    }
  }

  private async processAnalysis(
    analysisArgs: any, 
    responseText: string, 
    userMessage: string, 
    language: 'nl' | 'en'
  ): Promise<ChatResponse> {
    const urgency = analysisArgs.urgency || 'normal';
    const categories = analysisArgs.categories || this.detectCategories(userMessage);
    const estimatedCost = this.calculateCost(categories, urgency);
    
    return {
      text: responseText,
      urgency,
      categories,
      estimatedCost,
      extractedInfo: analysisArgs.extractedInfo,
      shouldShowBookingForm: analysisArgs.shouldBook || urgency === 'emergency',
      confidence: Math.min(analysisArgs.confidence || 70, 100),
      nextSteps: this.generateNextSteps(urgency, categories, language)
    };
  }

  private createFallbackAnalysis(
    responseText: string, 
    userMessage: string, 
    language: 'nl' | 'en'
  ): ChatResponse {
    const urgency = this.detectUrgency(userMessage);
    const categories = this.detectCategories(userMessage);
    const estimatedCost = this.calculateCost(categories, urgency);
    
    return {
      text: responseText,
      urgency,
      categories,
      estimatedCost,
      shouldShowBookingForm: urgency === 'emergency',
      confidence: 60,
      nextSteps: this.generateNextSteps(urgency, categories, language)
    };
  }

  private detectUrgency(message: string): 'low' | 'normal' | 'high' | 'emergency' {
    const text = message.toLowerCase();
    
    // Emergency keywords
    if (text.match(/\b(spoedgeval|noodgeval|emergency|urgent|dringend|overstroming|flooding|gaslek|gas leak|water stroomt|water flowing)\b/)) {
      return 'emergency';
    }
    
    // High urgency
    if (text.match(/\b(lek|lekkage|leak|geen warm water|no hot water|verstopt|blocked)\b/)) {
      return 'high';
    }
    
    // Normal priority
    if (text.match(/\b(repareren|installeren|vervangen|repair|install|replace)\b/)) {
      return 'normal';
    }
    
    return 'low';
  }

  private detectCategories(message: string): string[] {
    const text = message.toLowerCase();
    const categories: string[] = [];
    
    if (text.match(/\b(lek|lekkage|leak)\b/)) categories.push('leak_repair');
    if (text.match(/\b(kraan|tap|faucet)\b/)) categories.push('tap_replacement');
    if (text.match(/\b(afvoer|drain|verstopt|blocked|clogged)\b/)) categories.push('drain_unclog');
    if (text.match(/\b(toilet|wc)\b/)) categories.push('toilet_install');
    if (text.match(/\b(ketel|boiler|cv)\b/)) categories.push('boiler_service');
    if (text.match(/\b(keuken|kitchen)\b/)) categories.push('kitchen_plumbing');
    if (text.match(/\b(radiator|verwarming|heating)\b/)) categories.push('radiator_install');
    if (text.match(/\b(douche|shower|bad|bath)\b/)) categories.push('shower_install');
    
    return categories.length > 0 ? categories : ['hourly_rate'];
  }

  private calculateCost(categories: string[], urgency: string): ChatResponse['estimatedCost'] {
    if (categories.length === 0) {
      return {
        min: ZOOFY_PRICING.hourly_rate.min,
        max: ZOOFY_PRICING.hourly_rate.max,
        currency: 'EUR',
        description: urgency === 'emergency' ? 'Spoed uurtarief' : 'Standaard uurtarief'
      };
    }

    // Use first category for estimate
    const category = categories[0] as keyof typeof ZOOFY_PRICING;
    const pricing = ZOOFY_PRICING[category] || ZOOFY_PRICING.hourly_rate;
    
    // Add emergency markup
    const multiplier = urgency === 'emergency' ? 1.3 : 1.0;
    
    return {
      min: Math.round(pricing.min * multiplier),
      max: Math.round(pricing.max * multiplier),
      currency: 'EUR',
      description: `${pricing.desc}${urgency === 'emergency' ? ' (spoed)' : ''}`
    };
  }

  private generateNextSteps(urgency: string, categories: string[], language: 'nl' | 'en'): string[] {
    if (language === 'nl') {
      if (urgency === 'emergency') {
        return [
          'Neem contact op voor spoedafspraak',
          'Geef adres en telefoonnummer door',
          'Beschrijf de situatie in detail',
          'Wacht op bevestiging binnen 30 minuten'
        ];
      }
      return [
        'Plan een afspraak op gewenste tijd',
        'Bevestig contactgegevens',
        'Bereid eventuele vragen voor',
        'Zorg voor toegang tot het probleem'
      ];
    } else {
      if (urgency === 'emergency') {
        return [
          'Contact for emergency appointment',
          'Provide address and phone number',
          'Describe situation in detail',
          'Wait for confirmation within 30 minutes'
        ];
      }
      return [
        'Schedule appointment at preferred time',
        'Confirm contact details',
        'Prepare any questions',
        'Ensure access to the problem area'
      ];
    }
  }
}

export default GPT5Client;