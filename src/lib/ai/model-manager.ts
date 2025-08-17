/**
 * AI Model Manager - Intelligent routing between GPT-5 and Claude Opus 4.1
 * 
 * This system selects the optimal AI model based on:
 * - Query complexity and type
 * - Cost optimization
 * - Model strengths and capabilities
 * - Context requirements
 */

export interface QueryContext {
  userMessage: string;
  messageCount: number;
  conversationHistory: Array<{ role: string; content: string }>;
  urgency: 'low' | 'normal' | 'high' | 'emergency';
  language: 'nl' | 'en';
  hasImages?: boolean;
  needsPlanning?: boolean;
  needsExtendedReasoning?: boolean;
  customerPhase: 'initial' | 'problem_identified' | 'quoted' | 'booking';
  sessionData?: {
    problemType?: string;
    customerInfo?: any;
    quotesGiven?: number[];
  };
}

export interface ModelCapabilities {
  name: 'gpt-5' | 'claude-opus-4.1';
  strengths: string[];
  contextWindow: number;
  costPerMillionTokens: { input: number; output: number };
  supportsStreaming: boolean;
  supportsImages: boolean;
  supportsExtendedThinking: boolean;
  responseSpeed: 'fast' | 'medium' | 'slow';
}

export const MODEL_CONFIGS: Record<string, ModelCapabilities> = {
  'gpt-5': {
    name: 'gpt-5',
    strengths: [
      'customer_interaction',
      'dutch_language',
      'emergency_handling',
      'multimodal',
      'health_expertise',
      'instruction_following',
      'streaming_responses'
    ],
    contextWindow: 32000,
    costPerMillionTokens: { input: 20, output: 60 },
    supportsStreaming: true,
    supportsImages: true,
    supportsExtendedThinking: false,
    responseSpeed: 'fast'
  },
  'claude-opus-4.1': {
    name: 'claude-opus-4.1',
    strengths: [
      'extended_reasoning',
      'complex_planning',
      'coding',
      'agentic_tasks',
      'large_context',
      'detailed_analysis',
      'cost_estimation',
      'technical_accuracy'
    ],
    contextWindow: 200000,
    costPerMillionTokens: { input: 15, output: 75 },
    supportsStreaming: true,
    supportsImages: true,
    supportsExtendedThinking: true,
    responseSpeed: 'medium'
  }
};

export class ModelManager {
  /**
   * Intelligently select the best AI model for the given context
   */
  static selectModel(context: QueryContext): 'gpt-5' | 'claude-opus-4.1' {
    const scores = {
      'gpt-5': this.calculateGPT5Score(context),
      'claude-opus-4.1': this.calculateClaudeScore(context)
    };

    // Log decision reasoning
    console.log('[ModelManager] Model Selection:', {
      query: context.userMessage.substring(0, 50) + '...',
      scores,
      selected: scores['gpt-5'] > scores['claude-opus-4.1'] ? 'gpt-5' : 'claude-opus-4.1',
      reasons: this.getSelectionReasons(context, scores)
    });

    return scores['gpt-5'] > scores['claude-opus-4.1'] ? 'gpt-5' : 'claude-opus-4.1';
  }

  private static calculateGPT5Score(context: QueryContext): number {
    let score = 50; // Base score

    // GPT-5 is optimized for customer-facing interactions
    if (context.customerPhase === 'initial') score += 25;
    
    // Emergency situations - GPT-5 is faster
    if (context.urgency === 'emergency') score += 30;
    
    // Dutch language expertise
    if (context.language === 'nl') score += 20;
    
    // Multimodal capabilities
    if (context.hasImages) score += 25;
    
    // Short conversations (better for customer chat)
    if (context.messageCount <= 5) score += 15;
    
    // Cost optimization for simple queries
    if (this.isSimpleQuery(context.userMessage)) score += 20;
    
    // Streaming for real-time feel
    if (context.customerPhase === 'initial' || context.urgency !== 'low') score += 15;

    return Math.min(score, 100);
  }

  private static calculateClaudeScore(context: QueryContext): number {
    let score = 50; // Base score

    // Claude excels at complex reasoning and planning
    if (context.needsExtendedReasoning) score += 35;
    if (context.needsPlanning) score += 30;
    
    // Long conversations (massive context window)
    if (context.messageCount > 10) score += 25;
    
    // Complex technical analysis
    if (this.isComplexTechnicalQuery(context.userMessage)) score += 30;
    
    // Cost estimation and detailed planning
    if (context.customerPhase === 'quoted' && context.sessionData?.problemType) score += 25;
    
    // Backend analysis tasks
    if (context.sessionData?.quotesGiven && context.sessionData.quotesGiven.length > 0) score += 20;
    
    // When we need detailed technical accuracy
    if (context.userMessage.toLowerCase().includes('technical') || 
        context.userMessage.toLowerCase().includes('exactly') ||
        context.userMessage.toLowerCase().includes('detailed')) score += 20;

    return Math.min(score, 100);
  }

  private static isSimpleQuery(message: string): boolean {
    const simplePatterns = [
      /^(hallo|hello|hi)/i,
      /^(wat kost|what does.*cost)/i,
      /^(wanneer|when)/i,
      /^(ja|nee|yes|no)$/i,
      /^(bedankt|thank you)/i
    ];
    
    return simplePatterns.some(pattern => pattern.test(message.trim())) || 
           message.trim().length < 20;
  }

  private static isComplexTechnicalQuery(message: string): boolean {
    const complexPatterns = [
      /plan|planning|schedule|route/i,
      /multiple|several|verschillende/i,
      /technical|technisch|exactly|precies/i,
      /estimate.*cost|kosten.*inschatting/i,
      /materials.*labor|materiaal.*arbeid/i,
      /step.*by.*step|stap.*voor.*stap/i
    ];
    
    return complexPatterns.some(pattern => pattern.test(message)) ||
           message.trim().length > 100;
  }

  private static getSelectionReasons(context: QueryContext, scores: Record<string, number>): string[] {
    const reasons: string[] = [];
    const winner = scores['gpt-5'] > scores['claude-opus-4.1'] ? 'gpt-5' : 'claude-opus-4.1';
    
    if (winner === 'gpt-5') {
      if (context.urgency === 'emergency') reasons.push('Emergency - need fast response');
      if (context.language === 'nl') reasons.push('Dutch language expertise');
      if (context.hasImages) reasons.push('Image analysis capability');
      if (context.messageCount <= 5) reasons.push('Early conversation - customer interaction');
      if (this.isSimpleQuery(context.userMessage)) reasons.push('Simple query - cost optimization');
    } else {
      if (context.needsExtendedReasoning) reasons.push('Complex reasoning required');
      if (context.messageCount > 10) reasons.push('Long conversation - large context');
      if (this.isComplexTechnicalQuery(context.userMessage)) reasons.push('Technical analysis needed');
      if (context.needsPlanning) reasons.push('Planning and analysis required');
    }
    
    return reasons;
  }

  /**
   * Estimate the cost of using a specific model for a query
   */
  static estimateCost(
    model: 'gpt-5' | 'claude-opus-4.1', 
    inputTokens: number, 
    outputTokens: number
  ): number {
    const config = MODEL_CONFIGS[model];
    const inputCost = (inputTokens / 1000000) * config.costPerMillionTokens.input;
    const outputCost = (outputTokens / 1000000) * config.costPerMillionTokens.output;
    return inputCost + outputCost;
  }

  /**
   * Get recommended model configuration for specific use cases
   */
  static getRecommendedConfig(useCase: string): ModelCapabilities | null {
    const useCaseMap: Record<string, 'gpt-5' | 'claude-opus-4.1'> = {
      'customer_chat': 'gpt-5',
      'emergency_response': 'gpt-5',
      'dutch_support': 'gpt-5',
      'image_analysis': 'gpt-5',
      'cost_estimation': 'claude-opus-4.1',
      'technical_planning': 'claude-opus-4.1',
      'long_conversation': 'claude-opus-4.1',
      'complex_reasoning': 'claude-opus-4.1',
      'backend_analysis': 'claude-opus-4.1'
    };

    const model = useCaseMap[useCase];
    return model ? MODEL_CONFIGS[model] : null;
  }

  /**
   * Validate that the selected model can handle the query requirements
   */
  static validateModelCapabilities(
    model: 'gpt-5' | 'claude-opus-4.1',
    context: QueryContext
  ): { isValid: boolean; issues: string[] } {
    const config = MODEL_CONFIGS[model];
    const issues: string[] = [];

    // Check context window limits
    const estimatedTokens = context.conversationHistory.length * 100; // Rough estimate
    if (estimatedTokens > config.contextWindow) {
      issues.push(`Context too large: ${estimatedTokens} > ${config.contextWindow} tokens`);
    }

    // Check capability requirements
    if (context.hasImages && !config.supportsImages) {
      issues.push('Model does not support image analysis');
    }

    if (context.needsExtendedReasoning && !config.supportsExtendedThinking) {
      issues.push('Model does not support extended reasoning');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

export default ModelManager;