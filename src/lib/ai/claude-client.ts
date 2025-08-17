/**
 * Claude Opus 4.1 Client - Backend analysis and planning for plumbing operations
 * 
 * Optimized for:
 * - Extended reasoning and planning
 * - Technical analysis
 * - Cost breakdowns
 * - Multi-step scheduling
 * - Complex problem solving
 */

import Anthropic from '@anthropic-ai/sdk';

export interface AnalysisRequest {
  conversationHistory: Array<{ role: string; content: string }>;
  customerData: {
    name?: string;
    phone?: string;
    address?: string;
    problemType?: string;
    urgency?: string;
  };
  requestType: 'cost_analysis' | 'scheduling' | 'technical_assessment' | 'planning';
  context?: {
    previousQuotes?: number[];
    materials?: string[];
    timeConstraints?: string;
    specialRequirements?: string;
  };
}

export interface DetailedAnalysis {
  summary: string;
  technicalAssessment: {
    problemComplexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
    estimatedDuration: {
      min: number; // hours
      max: number; // hours
      description: string;
    };
    materialsNeeded: {
      item: string;
      quantity: string;
      estimatedCost: number;
      essential: boolean;
    }[];
    toolsRequired: string[];
    expertise: 'basic' | 'intermediate' | 'advanced' | 'specialist';
  };
  costBreakdown: {
    labor: {
      hours: number;
      rate: number;
      total: number;
    };
    materials: {
      item: string;
      cost: number;
    }[];
    additional: {
      description: string;
      cost: number;
    }[];
    subtotal: number;
    btw: number; // 21% VAT
    total: number;
  };
  scheduling: {
    priority: 'low' | 'normal' | 'high' | 'emergency';
    recommendedTimeSlot: string;
    preparation: string[];
    followUpNeeded: boolean;
  };
  risks: {
    level: 'low' | 'medium' | 'high';
    description: string;
    mitigation: string;
  }[];
  recommendations: string[];
  confidence: number; // 0-100
}

export class ClaudeClient {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }

  /**
   * Perform detailed analysis using Claude's extended reasoning
   */
  async performDetailedAnalysis(request: AnalysisRequest): Promise<DetailedAnalysis> {
    try {
      const systemPrompt = this.buildAnalysisPrompt();
      const userPrompt = this.buildUserPrompt(request);

      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022", // Latest available Claude model
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent analysis
        tools: [
          {
            name: "provide_detailed_analysis",
            description: "Provide a structured analysis of the plumbing request",
            input_schema: {
              type: "object",
              properties: {
                summary: {
                  type: "string",
                  description: "Brief summary of the analysis in Dutch"
                },
                problem_complexity: {
                  type: "string",
                  enum: ["simple", "moderate", "complex", "very_complex"],
                  description: "Assessment of problem complexity"
                },
                estimated_duration_hours: {
                  type: "object",
                  properties: {
                    min: { type: "number" },
                    max: { type: "number" },
                    description: { type: "string" }
                  },
                  required: ["min", "max", "description"]
                },
                materials_needed: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      item: { type: "string" },
                      quantity: { type: "string" },
                      estimated_cost: { type: "number" },
                      essential: { type: "boolean" }
                    },
                    required: ["item", "quantity", "estimated_cost", "essential"]
                  }
                },
                cost_breakdown: {
                  type: "object",
                  properties: {
                    labor_hours: { type: "number" },
                    labor_rate: { type: "number" },
                    labor_total: { type: "number" },
                    materials_total: { type: "number" },
                    subtotal: { type: "number" },
                    btw_21_percent: { type: "number" },
                    total_with_btw: { type: "number" }
                  },
                  required: ["labor_hours", "labor_rate", "labor_total", "materials_total", "subtotal", "btw_21_percent", "total_with_btw"]
                },
                urgency_priority: {
                  type: "string",
                  enum: ["low", "normal", "high", "emergency"],
                  description: "Priority level for scheduling"
                },
                recommendations: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of recommendations in Dutch"
                },
                confidence_percentage: {
                  type: "number",
                  minimum: 0,
                  maximum: 100,
                  description: "Confidence in the analysis (0-100)"
                }
              },
              required: ["summary", "problem_complexity", "estimated_duration_hours", "cost_breakdown", "urgency_priority", "confidence_percentage"]
            }
          }
        ],
        tool_choice: { type: "tool", name: "provide_detailed_analysis" }
      });

      // Parse the structured response from tool calls
      const content = response.content[0];
      if (content.type === 'tool_use' && content.name === 'provide_detailed_analysis') {
        return this.parseStructuredAnalysis(content.input);
      } else if (content.type === 'text') {
        // Fallback to text parsing if no tool call
        return this.parseAnalysisResponse(content.text);
      } else {
        throw new Error('Unexpected response format from Claude');
      }

    } catch (error) {
      console.error('Claude analysis error:', error);
      
      // NO FALLBACK DATA - throw error to be handled upstream
      throw new Error(`Analyse tijdelijk niet beschikbaar. Contacteer de loodgieter direct voor complexe vragen. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate work order with detailed specifications
   */
  async generateWorkOrder(
    customerData: AnalysisRequest['customerData'],
    analysis: DetailedAnalysis
  ): Promise<{
    workOrderId: string;
    customerInfo: any;
    jobDetails: any;
    costEstimate: any;
    timeline: any;
    instructions: string[];
  }> {
    const systemPrompt = `Je bent een expert in het maken van gedetailleerde werkorders voor loodgieterswerk. 
    Maak een professionele werkorder met alle benodigde details voor de uitvoering.`;

    const userPrompt = `Maak een werkorder op basis van deze analyse:

Klantgegevens:
${JSON.stringify(customerData, null, 2)}

Technische analyse:
${JSON.stringify(analysis, null, 2)}

Geef een gestructureerde werkorder terug in JSON formaat met:
- Unieke werkorder ID
- Klantinformatie
- Jobdetails en specificaties  
- Kostenschatting
- Tijdlijn
- Uitvoeringsinstructies`;

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.1
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return JSON.parse(content.text);
      }
      throw new Error('Invalid response format');

    } catch (error) {
      console.error('Work order generation error:', error);
      throw new Error('Werkorder generatie gefaald. Handmatig aanmaken vereist.');
    }
  }

  private buildAnalysisPrompt(): string {
    return `Je bent een expert loodgieter met 20+ jaar ervaring in Nederland. Je specialiseert je in:
- Technische analyse van loodgieter problemen
- Kostenberekeningen en materiaalschattingen
- Planning en prioritering van werkzaamheden
- Nederlandse bouwvoorschriften en BTW berekeningen

ANALYSEER ALTIJD:
1. Technische complexiteit en benodigde expertise
2. Geschatte tijd en materialen
3. Kostenbreakdown (arbeid + materiaal + BTW)
4. Risico's en aanbevelingen
5. Planning en prioriteit

NEDERLANDSE MARKTPRIJZEN (2025):
- Uurtarief loodgieter: €75-98 (standaard/spoed)
- Materialen: gangbare Nederlandse prijzen
- BTW: 21% (hoog tarief) of 9% (verlaagd tarief voor bepaalde werkzaamheden)

GEEF ALTIJD een gestructureerde analyse terug in dit formaat:
- Technische beoordeling
- Gedetailleerde kostenbreakdown
- Tijdsplanning en prioriteit
- Risico's en aanbevelingen
- Betrouwbaarheidspercentage

Gebruik je uitgebreide context window om alle conversatiegeschiedenis mee te nemen in je analyse.`;
  }

  private buildUserPrompt(request: AnalysisRequest): string {
    let prompt = `ANALYSEVERZOEK: ${request.requestType.toUpperCase()}\n\n`;
    
    prompt += `CONVERSATIEGESCHIEDENIS:\n`;
    request.conversationHistory.forEach((msg, idx) => {
      prompt += `${idx + 1}. ${msg.role}: ${msg.content}\n`;
    });
    
    prompt += `\nKLANTGEGEVENS:\n`;
    prompt += `- Naam: ${request.customerData.name || 'Onbekend'}\n`;
    prompt += `- Telefoon: ${request.customerData.phone || 'Onbekend'}\n`;
    prompt += `- Adres: ${request.customerData.address || 'Onbekend'}\n`;
    prompt += `- Probleem: ${request.customerData.problemType || 'Te bepalen'}\n`;
    prompt += `- Urgentie: ${request.customerData.urgency || 'Normaal'}\n`;
    
    if (request.context) {
      prompt += `\nAANVULLENDE CONTEXT:\n`;
      if (request.context.previousQuotes) {
        prompt += `- Eerdere offertes: €${request.context.previousQuotes.join(', €')}\n`;
      }
      if (request.context.materials) {
        prompt += `- Vermelde materialen: ${request.context.materials.join(', ')}\n`;
      }
      if (request.context.timeConstraints) {
        prompt += `- Tijdsbeperkingen: ${request.context.timeConstraints}\n`;
      }
      if (request.context.specialRequirements) {
        prompt += `- Speciale eisen: ${request.context.specialRequirements}\n`;
      }
    }
    
    prompt += `\nVOER EEN UITGEBREIDE ANALYSE UIT EN GEEF EEN GEDETAILLEERD ANTWOORD.`;
    
    return prompt;
  }

  /**
   * Parse structured analysis from Claude's tool call
   */
  private parseStructuredAnalysis(toolInput: any): DetailedAnalysis {
    try {
      return {
        summary: toolInput.summary || 'Analyse uitgevoerd',
        technicalAssessment: {
          problemComplexity: toolInput.problem_complexity || 'moderate',
          estimatedDuration: {
            min: toolInput.estimated_duration_hours?.min || 1,
            max: toolInput.estimated_duration_hours?.max || 3,
            description: toolInput.estimated_duration_hours?.description || 'Geschatte duur'
          },
          materialsNeeded: (toolInput.materials_needed || []).map((material: any) => ({
            item: material.item,
            quantity: material.quantity,
            estimatedCost: material.estimated_cost,
            essential: material.essential
          })),
          toolsRequired: ['Standaard loodgieter gereedschap'],
          expertise: this.mapComplexityToExpertise(toolInput.problem_complexity)
        },
        costBreakdown: {
          labor: {
            hours: toolInput.cost_breakdown?.labor_hours || 2,
            rate: toolInput.cost_breakdown?.labor_rate || 75,
            total: toolInput.cost_breakdown?.labor_total || 150
          },
          materials: (toolInput.materials_needed || []).map((material: any) => ({
            item: material.item,
            cost: material.estimated_cost
          })),
          additional: [],
          subtotal: toolInput.cost_breakdown?.subtotal || 150,
          btw: toolInput.cost_breakdown?.btw_21_percent || 31.5,
          total: toolInput.cost_breakdown?.total_with_btw || 181.5
        },
        scheduling: {
          priority: toolInput.urgency_priority || 'normal',
          recommendedTimeSlot: this.getTimeSlotForPriority(toolInput.urgency_priority),
          preparation: ['Zorg voor toegang tot het werkgebied'],
          followUpNeeded: toolInput.problem_complexity === 'very_complex'
        },
        risks: this.generateRisksForComplexity(toolInput.problem_complexity),
        recommendations: toolInput.recommendations || ['Professionele uitvoering aanbevolen'],
        confidence: Math.min(toolInput.confidence_percentage || 85, 100)
      };
    } catch (error) {
      console.error('Error parsing structured analysis:', error);
      // Fallback to default analysis
      return this.createDefaultAnalysis();
    }
  }

  private parseAnalysisResponse(responseText: string): DetailedAnalysis {
    // Try to extract structured data from Claude's response
    // This is a simplified parser - in production you'd want more robust parsing
    try {
      // Look for JSON structure in response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.validateAndNormalizeAnalysis(parsed);
      }
    } catch (error) {
      console.warn('Could not parse JSON from Claude response, using text parsing');
    }

    // Fallback to text parsing
    return this.parseTextAnalysis(responseText);
  }

  private parseTextAnalysis(text: string): DetailedAnalysis {
    // Extract key information from text response
    const lines = text.split('\n');
    
    // This is a simplified text parser
    // In production, you'd want more sophisticated NLP parsing
    return {
      summary: this.extractSection(text, 'samenvatting|summary'),
      technicalAssessment: {
        problemComplexity: this.extractComplexity(text),
        estimatedDuration: this.extractDuration(text),
        materialsNeeded: this.extractMaterials(text),
        toolsRequired: this.extractTools(text),
        expertise: this.extractExpertise(text)
      },
      costBreakdown: this.extractCosts(text),
      scheduling: this.extractScheduling(text),
      risks: this.extractRisks(text),
      recommendations: this.extractRecommendations(text),
      confidence: this.extractConfidence(text)
    };
  }

  // Helper methods for text parsing
  private extractSection(text: string, pattern: string): string {
    const regex = new RegExp(`${pattern}:?\\s*([^\\n]+)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : 'Geen specifieke samenvatting beschikbaar';
  }

  private extractComplexity(text: string): 'simple' | 'moderate' | 'complex' | 'very_complex' {
    const lower = text.toLowerCase();
    if (lower.includes('zeer complex') || lower.includes('very complex')) return 'very_complex';
    if (lower.includes('complex')) return 'complex';
    if (lower.includes('matig') || lower.includes('moderate')) return 'moderate';
    return 'simple';
  }

  private extractDuration(text: string): { min: number; max: number; description: string } {
    const hourMatches = text.match(/(\d+)[-–](\d+)\s*uur/g);
    if (hourMatches && hourMatches[0]) {
      const numbers = hourMatches[0].match(/\d+/g);
      if (numbers && numbers.length >= 2) {
        return {
          min: parseInt(numbers[0]),
          max: parseInt(numbers[1]),
          description: `Geschatte duur: ${numbers[0]}-${numbers[1]} uur`
        };
      }
    }
    return { min: 1, max: 3, description: 'Geschatte duur: 1-3 uur' };
  }

  private extractMaterials(text: string): Array<{item: string; quantity: string; estimatedCost: number; essential: boolean}> {
    // Simplified material extraction
    const materials = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('materiaal') || line.toLowerCase().includes('onderdel')) {
        materials.push({
          item: line.trim(),
          quantity: '1x',
          estimatedCost: 25, // Default estimate
          essential: true
        });
      }
    }
    
    return materials.length > 0 ? materials : [
      { item: 'Standaard loodgieter materialen', quantity: 'Naar behoefte', estimatedCost: 50, essential: true }
    ];
  }

  private extractTools(text: string): string[] {
    return ['Standaard loodgieter gereedschap']; // Simplified
  }

  private extractExpertise(text: string): 'basic' | 'intermediate' | 'advanced' | 'specialist' {
    const lower = text.toLowerCase();
    if (lower.includes('specialist') || lower.includes('expert')) return 'specialist';
    if (lower.includes('gevorderd') || lower.includes('advanced')) return 'advanced';
    if (lower.includes('intermediate') || lower.includes('matig')) return 'intermediate';
    return 'basic';
  }

  private extractCosts(text: string): DetailedAnalysis['costBreakdown'] {
    // Extract cost information from text
    const costMatches = text.match(/€\s*(\d+(?:[.,]\d{2})?)/g);
    let totalEstimate = 150; // Default
    
    if (costMatches && costMatches.length > 0) {
      const amounts = costMatches.map(match => {
        const num = match.replace(/[€\s]/g, '').replace(',', '.');
        return parseFloat(num);
      });
      totalEstimate = Math.max(...amounts);
    }

    const labor = totalEstimate * 0.7; // 70% labor
    const materials = totalEstimate * 0.3; // 30% materials
    const subtotal = labor + materials;
    const btw = subtotal * 0.21; // 21% VAT
    
    return {
      labor: {
        hours: Math.round(labor / 75), // €75/hour
        rate: 75,
        total: labor
      },
      materials: [
        { item: 'Loodgieter materialen', cost: materials }
      ],
      additional: [],
      subtotal: Math.round(subtotal),
      btw: Math.round(btw),
      total: Math.round(subtotal + btw)
    };
  }

  private extractScheduling(text: string): DetailedAnalysis['scheduling'] {
    return {
      priority: 'normal',
      recommendedTimeSlot: 'Werkdag tussen 9:00-17:00',
      preparation: ['Zorg voor toegang tot het probleem gebied'],
      followUpNeeded: false
    };
  }

  private extractRisks(text: string): Array<{level: 'low' | 'medium' | 'high'; description: string; mitigation: string}> {
    return [
      {
        level: 'low',
        description: 'Standaard loodgieter risicos',
        mitigation: 'Volg veiligheidsprotocollen'
      }
    ];
  }

  private extractRecommendations(text: string): string[] {
    return ['Professionele uitvoering aanbevolen'];
  }

  private extractConfidence(text: string): number {
    const confidenceMatch = text.match(/(\d+)%\s*vertrouwen|confidence.*?(\d+)%/i);
    if (confidenceMatch) {
      return parseInt(confidenceMatch[1] || confidenceMatch[2]);
    }
    return 80; // Default confidence
  }

  /**
   * Helper methods for structured analysis parsing
   */
  private mapComplexityToExpertise(complexity: string): 'basic' | 'intermediate' | 'advanced' | 'specialist' {
    switch (complexity) {
      case 'simple': return 'basic';
      case 'moderate': return 'intermediate';
      case 'complex': return 'advanced';
      case 'very_complex': return 'specialist';
      default: return 'intermediate';
    }
  }

  private getTimeSlotForPriority(priority: string): string {
    switch (priority) {
      case 'emergency': return 'Binnen 2 uur';
      case 'high': return 'Zelfde dag';
      case 'normal': return 'Binnen 2-3 werkdagen';
      case 'low': return 'Binnen een week';
      default: return 'Binnen 2-3 werkdagen';
    }
  }

  private generateRisksForComplexity(complexity: string): Array<{level: 'low' | 'medium' | 'high'; description: string; mitigation: string}> {
    const baseRisk = {
      level: 'low' as const,
      description: 'Standaard loodgieter risicos',
      mitigation: 'Volg veiligheidsprotocollen'
    };

    switch (complexity) {
      case 'very_complex':
        return [
          baseRisk,
          {
            level: 'high' as const,
            description: 'Complex werk vereist specialist kennis',
            mitigation: 'Zorg voor ervaren loodgieter en inspectie achteraf'
          }
        ];
      case 'complex':
        return [
          baseRisk,
          {
            level: 'medium' as const,
            description: 'Uitgebreide werkzaamheden kunnen onvoorziene problemen opleveren',
            mitigation: 'Plan extra tijd en overleg tussentijds'
          }
        ];
      default:
        return [baseRisk];
    }
  }

  private createDefaultAnalysis(): DetailedAnalysis {
    return {
      summary: 'Standaard loodgieter analyse uitgevoerd',
      technicalAssessment: {
        problemComplexity: 'moderate',
        estimatedDuration: { min: 1, max: 3, description: 'Geschatte duur: 1-3 uur' },
        materialsNeeded: [
          { item: 'Standaard loodgieter materialen', quantity: 'Naar behoefte', estimatedCost: 50, essential: true }
        ],
        toolsRequired: ['Standaard loodgieter gereedschap'],
        expertise: 'intermediate'
      },
      costBreakdown: {
        labor: { hours: 2, rate: 75, total: 150 },
        materials: [{ item: 'Loodgieter materialen', cost: 50 }],
        additional: [],
        subtotal: 200,
        btw: 42,
        total: 242
      },
      scheduling: {
        priority: 'normal',
        recommendedTimeSlot: 'Binnen 2-3 werkdagen',
        preparation: ['Zorg voor toegang tot het werkgebied'],
        followUpNeeded: false
      },
      risks: [{
        level: 'low',
        description: 'Standaard loodgieter risicos',
        mitigation: 'Volg veiligheidsprotocollen'
      }],
      recommendations: ['Professionele uitvoering aanbevolen'],
      confidence: 80
    };
  }

  private validateAndNormalizeAnalysis(data: any): DetailedAnalysis {
    // Validate and ensure all required fields are present
    return {
      summary: data.summary || 'Analyse uitgevoerd',
      technicalAssessment: {
        problemComplexity: data.technicalAssessment?.problemComplexity || 'moderate',
        estimatedDuration: data.technicalAssessment?.estimatedDuration || { min: 1, max: 3, description: '1-3 uur' },
        materialsNeeded: data.technicalAssessment?.materialsNeeded || [],
        toolsRequired: data.technicalAssessment?.toolsRequired || [],
        expertise: data.technicalAssessment?.expertise || 'intermediate'
      },
      costBreakdown: data.costBreakdown || {
        labor: { hours: 2, rate: 75, total: 150 },
        materials: [],
        additional: [],
        subtotal: 150,
        btw: 31.5,
        total: 181.5
      },
      scheduling: data.scheduling || {
        priority: 'normal',
        recommendedTimeSlot: 'Werkdag',
        preparation: [],
        followUpNeeded: false
      },
      risks: data.risks || [],
      recommendations: data.recommendations || [],
      confidence: Math.min(data.confidence || 80, 100)
    };
  }
}

export default ClaudeClient;