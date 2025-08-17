# AI Model Integration Patterns for Next.js 2025

## Complete Guide: GPT-5 & Claude Opus 4.1 Integration in Next.js Applications

*Last Updated: January 2025*

## Table of Contents

1. [Latest Model Capabilities & Considerations](#latest-model-capabilities--considerations)
2. [Core SDK Setup & Configuration](#core-sdk-setup--configuration)
3. [Intelligent Model Routing Strategies](#intelligent-model-routing-strategies)
4. [Real-time Streaming Implementation](#real-time-streaming-implementation)
5. [Function Calling & Tool Use Patterns](#function-calling--tool-use-patterns)
6. [Error Handling Without Fallback Data](#error-handling-without-fallback-data)
7. [Cost Optimization Strategies](#cost-optimization-strategies)
8. [Context Management & Memory](#context-management--memory)
9. [Production-Ready Examples](#production-ready-examples)

---

## Latest Model Capabilities & Considerations

### GPT-5 (January 2025)
- **Unified Architecture**: Single system with automatic routing between gpt-5-main (fast) and gpt-5-thinking (deep reasoning)
- **Enhanced Performance**: Superior coding, math, reasoning, and safety
- **Auto-Reasoning**: Automatically engages deeper thinking for complex problems
- **API Availability**: Available via OpenAI API with standard endpoints

### Claude Opus 4.1 (Sonnet 4)
- **Extended Thinking**: Advanced reasoning capabilities with thinking blocks
- **Streaming Excellence**: Superior real-time response streaming
- **Tool Use**: Enhanced function calling and multi-step reasoning
- **Context Windows**: Larger context handling for complex conversations

---

## Core SDK Setup & Configuration

### OpenAI SDK Setup (GPT-5)

```typescript
// lib/ai/openai-client.ts
import OpenAI from 'openai';
import { z } from 'zod';

interface OpenAIConfig {
  apiKey: string;
  model: 'gpt-5' | 'gpt-5-main' | 'gpt-5-thinking';
  maxTokens?: number;
  temperature?: number;
}

export class OpenAIService {
  private client: OpenAI;
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
    this.config = config;
  }

  // GPT-5 streaming with automatic routing
  async streamCompletion(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    options?: {
      forceThinking?: boolean;
      tools?: OpenAI.Chat.Completions.ChatCompletionTool[];
    }
  ): Promise<ReadableStream> {
    const stream = await this.client.chat.completions.create({
      model: options?.forceThinking ? 'gpt-5-thinking' : 'gpt-5',
      messages,
      stream: true,
      max_tokens: this.config.maxTokens ?? 2048,
      temperature: this.config.temperature ?? 0.7,
      tools: options?.tools,
    });

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }

  // Function calling with enhanced error handling
  async callFunction(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    tools: OpenAI.Chat.Completions.ChatCompletionTool[]
  ) {
    try {
      const runner = this.client.chat.completions.runTools({
        model: 'gpt-5',
        messages,
        tools,
        max_tokens: this.config.maxTokens ?? 2048,
      });

      const finalContent = await runner.finalContent();
      const finalMessage = await runner.finalMessage();
      const totalUsage = await runner.totalUsage();

      return {
        content: finalContent,
        message: finalMessage,
        usage: totalUsage,
        success: true,
      };
    } catch (error) {
      throw new OpenAIError(error);
    }
  }
}

// Custom error handling
export class OpenAIError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;

  constructor(error: any) {
    super(error.message || 'OpenAI API error');
    this.name = 'OpenAIError';
    this.code = error.code || 'UNKNOWN_ERROR';
    this.statusCode = error.status;
  }
}
```

### Anthropic SDK Setup (Claude Opus 4.1)

```typescript
// lib/ai/anthropic-client.ts
import Anthropic from '@anthropic-ai/sdk';

interface AnthropicConfig {
  apiKey: string;
  model: 'claude-sonnet-4-20250514' | 'claude-opus-4.1';
  maxTokens?: number;
  temperature?: number;
}

export class AnthropicService {
  private client: Anthropic;
  private config: AnthropicConfig;

  constructor(config: AnthropicConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
    this.config = config;
  }

  // Claude streaming with thinking blocks
  async streamMessage(
    messages: Anthropic.MessageParam[],
    options?: {
      enableThinking?: boolean;
      tools?: Anthropic.Tool[];
    }
  ): Promise<ReadableStream> {
    const stream = this.client.messages.stream({
      model: this.config.model,
      messages,
      max_tokens: this.config.maxTokens ?? 2048,
      temperature: this.config.temperature ?? 0.7,
      tools: options?.tools,
      // Enable thinking blocks for complex reasoning
      ...(options?.enableThinking && {
        thinking: { enabled: true }
      })
    });

    return new ReadableStream({
      async start(controller) {
        try {
          stream
            .on('text', (text) => {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ content: text })}\n\n`)
              );
            })
            .on('inputJson', (partialJson) => {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ json: partialJson })}\n\n`)
              );
            })
            .on('error', (error) => {
              controller.error(new AnthropicError(error));
            });

          await stream.done();
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }

  // Enhanced message creation with extended thinking
  async createMessage(
    messages: Anthropic.MessageParam[],
    options?: {
      enableThinking?: boolean;
      tools?: Anthropic.Tool[];
    }
  ) {
    try {
      const message = await this.client.messages.create({
        model: this.config.model,
        messages,
        max_tokens: this.config.maxTokens ?? 2048,
        temperature: this.config.temperature ?? 0.7,
        tools: options?.tools,
        ...(options?.enableThinking && {
          thinking: { enabled: true }
        })
      });

      return {
        content: message.content,
        usage: message.usage,
        stopReason: message.stop_reason,
        success: true,
      };
    } catch (error) {
      throw new AnthropicError(error);
    }
  }
}

export class AnthropicError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;

  constructor(error: any) {
    super(error.message || 'Anthropic API error');
    this.name = 'AnthropicError';
    this.code = error.code || 'UNKNOWN_ERROR';
    this.statusCode = error.status;
  }
}
```

---

## Intelligent Model Routing Strategies

### Smart Router Implementation

```typescript
// lib/ai/smart-router.ts
import { OpenAIService } from './openai-client';
import { AnthropicService } from './anthropic-client';

export type TaskComplexity = 'simple' | 'moderate' | 'complex' | 'reasoning';
export type TaskType = 'chat' | 'code' | 'analysis' | 'creative' | 'mathematical';

interface RoutingContext {
  taskType: TaskType;
  complexity: TaskComplexity;
  requiresReasoning: boolean;
  tokenBudget?: number;
  userPreference?: 'openai' | 'anthropic';
}

export class AIRouter {
  private openaiService: OpenAIService;
  private anthropicService: AnthropicService;

  constructor(
    openaiConfig: { apiKey: string },
    anthropicConfig: { apiKey: string }
  ) {
    this.openaiService = new OpenAIService({
      apiKey: openaiConfig.apiKey,
      model: 'gpt-5',
    });

    this.anthropicService = new AnthropicService({
      apiKey: anthropicConfig.apiKey,
      model: 'claude-sonnet-4-20250514',
    });
  }

  // Intelligent model selection based on query analysis
  private analyzeQuery(query: string): RoutingContext {
    const lowercaseQuery = query.toLowerCase();
    
    // Detect task type
    let taskType: TaskType = 'chat';
    if (lowercaseQuery.includes('code') || lowercaseQuery.includes('function')) {
      taskType = 'code';
    } else if (lowercaseQuery.includes('analyze') || lowercaseQuery.includes('explain')) {
      taskType = 'analysis';
    } else if (lowercaseQuery.includes('write') || lowercaseQuery.includes('create')) {
      taskType = 'creative';
    } else if (lowercaseQuery.includes('calculate') || lowercaseQuery.includes('math')) {
      taskType = 'mathematical';
    }

    // Detect complexity
    let complexity: TaskComplexity = 'simple';
    const complexityIndicators = ['complex', 'detailed', 'comprehensive', 'multi-step'];
    const reasoningIndicators = ['why', 'how', 'explain', 'analyze', 'compare'];
    
    if (complexityIndicators.some(indicator => lowercaseQuery.includes(indicator))) {
      complexity = 'complex';
    } else if (reasoningIndicators.some(indicator => lowercaseQuery.includes(indicator))) {
      complexity = 'reasoning';
    } else if (query.length > 200) {
      complexity = 'moderate';
    }

    const requiresReasoning = reasoningIndicators.some(indicator => 
      lowercaseQuery.includes(indicator)
    );

    return {
      taskType,
      complexity,
      requiresReasoning,
    };
  }

  // Route requests to optimal model
  private selectModel(context: RoutingContext): 'gpt5' | 'claude' {
    // User preference override
    if (context.userPreference) {
      return context.userPreference === 'openai' ? 'gpt5' : 'claude';
    }

    // Cost-based routing for simple tasks
    if (context.complexity === 'simple' && context.tokenBudget && context.tokenBudget < 1000) {
      return 'gpt5'; // GPT-5 main is faster and cheaper for simple tasks
    }

    // Task-specific routing
    switch (context.taskType) {
      case 'code':
        return 'gpt5'; // GPT-5 excels at coding tasks
      
      case 'analysis':
      case 'creative':
        return 'claude'; // Claude excels at analysis and creative writing
      
      case 'mathematical':
        return context.complexity === 'complex' ? 'gpt5' : 'gpt5'; // GPT-5 thinking for complex math
      
      default:
        // For complex reasoning tasks, prefer Claude's thinking blocks
        return context.requiresReasoning || context.complexity === 'complex' 
          ? 'claude' 
          : 'gpt5';
    }
  }

  // Main routing method
  async routeRequest(
    query: string,
    messages: any[],
    options?: {
      stream?: boolean;
      tools?: any[];
      userPreference?: 'openai' | 'anthropic';
    }
  ) {
    const context = this.analyzeQuery(query);
    if (options?.userPreference) {
      context.userPreference = options.userPreference;
    }

    const selectedModel = this.selectModel(context);

    const routingInfo = {
      selectedModel,
      reasoning: this.getRoutingReasoning(context, selectedModel),
      context,
    };

    try {
      if (selectedModel === 'gpt5') {
        if (options?.stream) {
          const stream = await this.openaiService.streamCompletion(messages, {
            forceThinking: context.complexity === 'complex' || context.requiresReasoning,
            tools: options.tools,
          });
          return { stream, routingInfo };
        } else {
          const result = await this.openaiService.callFunction(messages, options?.tools || []);
          return { result, routingInfo };
        }
      } else {
        if (options?.stream) {
          const stream = await this.anthropicService.streamMessage(messages, {
            enableThinking: context.requiresReasoning || context.complexity === 'complex',
            tools: options.tools,
          });
          return { stream, routingInfo };
        } else {
          const result = await this.anthropicService.createMessage(messages, {
            enableThinking: context.requiresReasoning || context.complexity === 'complex',
            tools: options.tools,
          });
          return { result, routingInfo };
        }
      }
    } catch (error) {
      throw new RoutingError(error, routingInfo);
    }
  }

  private getRoutingReasoning(context: RoutingContext, selectedModel: string): string {
    const reasons = [];
    
    if (context.userPreference) {
      reasons.push(`User preference: ${context.userPreference}`);
    }
    
    if (selectedModel === 'gpt5') {
      if (context.taskType === 'code') {
        reasons.push('GPT-5 excels at coding tasks');
      }
      if (context.complexity === 'simple') {
        reasons.push('GPT-5 main is faster for simple tasks');
      }
    } else {
      if (context.taskType === 'analysis') {
        reasons.push('Claude excels at analytical tasks');
      }
      if (context.requiresReasoning) {
        reasons.push('Claude thinking blocks for complex reasoning');
      }
    }

    return reasons.join(', ') || 'Default routing logic applied';
  }
}

export class RoutingError extends Error {
  constructor(
    originalError: any,
    public readonly routingInfo: any
  ) {
    super(`Routing failed: ${originalError.message}`);
    this.name = 'RoutingError';
  }
}
```

---

## Real-time Streaming Implementation

### Next.js API Route for Streaming

```typescript
// app/api/ai/stream/route.ts
import { NextRequest } from 'next/server';
import { AIRouter } from '@/lib/ai/smart-router';

const router = new AIRouter(
  { apiKey: process.env.OPENAI_API_KEY! },
  { apiKey: process.env.ANTHROPIC_API_KEY! }
);

export async function POST(request: NextRequest) {
  try {
    const { messages, query, options } = await request.json();

    const { stream, routingInfo } = await router.routeRequest(
      query,
      messages,
      { ...options, stream: true }
    );

    // Add routing info to the stream
    const enhancedStream = new ReadableStream({
      async start(controller) {
        // Send routing information first
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ 
              type: 'routing_info', 
              data: routingInfo 
            })}\n\n`
          )
        );

        // Pipe the AI response stream
        const reader = stream.getReader();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            controller.enqueue(value);
          }
          
          controller.enqueue(
            new TextEncoder().encode('data: [DONE]\n\n')
          );
          controller.close();
        } catch (error) {
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(enhancedStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Streaming error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
```

### React Hook for Streaming

```typescript
// hooks/use-ai-stream.ts
import { useState, useCallback, useRef } from 'react';

interface StreamMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RoutingInfo {
  selectedModel: string;
  reasoning: string;
  context: any;
}

interface UseAIStreamReturn {
  messages: StreamMessage[];
  isStreaming: boolean;
  error: string | null;
  routingInfo: RoutingInfo | null;
  sendMessage: (content: string, options?: any) => Promise<void>;
  clearMessages: () => void;
  abortStream: () => void;
}

export function useAIStream(): UseAIStreamReturn {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routingInfo, setRoutingInfo] = useState<RoutingInfo | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string, options?: any) => {
    setIsStreaming(true);
    setError(null);
    
    // Add user message
    const userMessage: StreamMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);

    // Prepare assistant message placeholder
    const assistantMessage: StreamMessage = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMessage]);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          query: content,
          options,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              setIsStreaming(false);
              break;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'routing_info') {
                setRoutingInfo(parsed.data);
              } else if (parsed.content) {
                setMessages(prev => {
                  const updated = [...prev];
                  const lastMessage = updated[updated.length - 1];
                  if (lastMessage.role === 'assistant') {
                    lastMessage.content += parsed.content;
                  }
                  return updated;
                });
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        console.error('Streaming error:', err);
        setError(err.message || 'An error occurred while streaming');
        // Remove the incomplete assistant message
        setMessages(prev => prev.slice(0, -1));
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setRoutingInfo(null);
  }, []);

  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    messages,
    isStreaming,
    error,
    routingInfo,
    sendMessage,
    clearMessages,
    abortStream,
  };
}
```

---

## Function Calling & Tool Use Patterns

### Universal Tool Definition

```typescript
// lib/ai/tools.ts
import { z } from 'zod';

// Universal tool schema that works with both APIs
export interface UniversalTool {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  handler: (input: any) => Promise<any>;
}

// Convert to OpenAI format
export function toOpenAITool(tool: UniversalTool): any {
  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.inputSchema),
    },
  };
}

// Convert to Anthropic format
export function toAnthropicTool(tool: UniversalTool): any {
  return {
    name: tool.name,
    description: tool.description,
    input_schema: zodToJsonSchema(tool.inputSchema),
  };
}

// Example tools
export const weatherTool: UniversalTool = {
  name: 'get_weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('Location to get weather for'),
    units: z.enum(['celsius', 'fahrenheit']).optional().default('celsius'),
  }),
  handler: async (input) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      location: input.location,
      temperature: 22,
      conditions: 'Sunny',
      units: input.units,
    };
  },
};

export const searchTool: UniversalTool = {
  name: 'search_web',
  description: 'Search the web for current information',
  inputSchema: z.object({
    query: z.string().describe('Search query'),
    maxResults: z.number().optional().default(5),
  }),
  handler: async (input) => {
    // Simulate web search
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      query: input.query,
      results: [
        { title: 'Example Result 1', url: 'https://example.com/1', snippet: 'First result...' },
        { title: 'Example Result 2', url: 'https://example.com/2', snippet: 'Second result...' },
      ],
    };
  },
};

// Helper function to convert Zod schema to JSON Schema
function zodToJsonSchema(schema: z.ZodSchema): any {
  // Simplified conversion - in production, use zod-to-json-schema library
  if (schema instanceof z.ZodObject) {
    const properties: any = {};
    const required: string[] = [];
    
    for (const [key, value] of Object.entries(schema.shape)) {
      properties[key] = zodToJsonSchema(value as z.ZodSchema);
      if (!(value as any).isOptional()) {
        required.push(key);
      }
    }
    
    return {
      type: 'object',
      properties,
      required,
    };
  }
  
  if (schema instanceof z.ZodString) {
    return { type: 'string', description: schema.description };
  }
  
  if (schema instanceof z.ZodNumber) {
    return { type: 'number', description: schema.description };
  }
  
  if (schema instanceof z.ZodEnum) {
    return { type: 'string', enum: schema.options, description: schema.description };
  }
  
  return { type: 'string' };
}
```

### Tool Execution Router

```typescript
// lib/ai/tool-executor.ts
import { UniversalTool } from './tools';

export class ToolExecutor {
  private tools: Map<string, UniversalTool> = new Map();

  registerTool(tool: UniversalTool) {
    this.tools.set(tool.name, tool);
  }

  async executeTool(name: string, input: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool "${name}" not found`);
    }

    try {
      // Validate input against schema
      const validatedInput = tool.inputSchema.parse(input);
      
      // Execute tool with validated input
      const result = await tool.handler(validatedInput);
      
      return {
        success: true,
        result,
        toolName: name,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        toolName: name,
      };
    }
  }

  getAvailableTools(): string[] {
    return Array.from(this.tools.keys());
  }

  getToolsForOpenAI() {
    return Array.from(this.tools.values()).map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: this.zodToJsonSchema(tool.inputSchema),
      },
    }));
  }

  getToolsForAnthropic() {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: this.zodToJsonSchema(tool.inputSchema),
    }));
  }

  private zodToJsonSchema(schema: any): any {
    // Implementation would be same as above
    // In production, use zod-to-json-schema library
    return {};
  }
}
```

---

## Error Handling Without Fallback Data

### Strict Error Handling Pattern

```typescript
// lib/ai/error-handling.ts
export type AIResult<T> = {
  success: true;
  data: T;
  metadata: {
    model: string;
    tokensUsed?: number;
    processingTime: number;
  };
} | {
  success: false;
  error: {
    type: 'RATE_LIMIT' | 'INVALID_INPUT' | 'API_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT';
    message: string;
    retryable: boolean;
    retryAfter?: number;
  };
  metadata: {
    model?: string;
    attemptedAt: number;
  };
};

export class AIErrorHandler {
  static handleOpenAIError(error: any): AIResult<never> {
    const now = Date.now();
    
    if (error.code === 'rate_limit_exceeded') {
      return {
        success: false,
        error: {
          type: 'RATE_LIMIT',
          message: 'Rate limit exceeded. Please try again later.',
          retryable: true,
          retryAfter: error.retryAfter || 60000, // 60 seconds default
        },
        metadata: { attemptedAt: now },
      };
    }
    
    if (error.code === 'invalid_request_error') {
      return {
        success: false,
        error: {
          type: 'INVALID_INPUT',
          message: error.message || 'Invalid request parameters',
          retryable: false,
        },
        metadata: { attemptedAt: now },
      };
    }
    
    if (error.code === 'insufficient_quota') {
      return {
        success: false,
        error: {
          type: 'API_ERROR',
          message: 'API quota exceeded. Please check your billing.',
          retryable: false,
        },
        metadata: { attemptedAt: now },
      };
    }
    
    // Network/timeout errors
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: {
          type: 'TIMEOUT',
          message: 'Request timed out. Please try again.',
          retryable: true,
        },
        metadata: { attemptedAt: now },
      };
    }
    
    // Generic API error
    return {
      success: false,
      error: {
        type: 'API_ERROR',
        message: error.message || 'An unexpected error occurred',
        retryable: error.status >= 500, // Server errors are retryable
      },
      metadata: { attemptedAt: now },
    };
  }

  static handleAnthropicError(error: any): AIResult<never> {
    // Similar implementation for Anthropic errors
    const now = Date.now();
    
    if (error.status === 429) {
      return {
        success: false,
        error: {
          type: 'RATE_LIMIT',
          message: 'Rate limit exceeded for Anthropic API',
          retryable: true,
          retryAfter: 60000,
        },
        metadata: { attemptedAt: now },
      };
    }
    
    if (error.status === 400) {
      return {
        success: false,
        error: {
          type: 'INVALID_INPUT',
          message: error.message || 'Invalid request to Anthropic API',
          retryable: false,
        },
        metadata: { attemptedAt: now },
      };
    }
    
    return {
      success: false,
      error: {
        type: 'API_ERROR',
        message: error.message || 'Anthropic API error',
        retryable: error.status >= 500,
      },
      metadata: { attemptedAt: now },
    };
  }
}

// Retry mechanism with exponential backoff
export class RetryHandler {
  static async withRetry<T>(
    operation: () => Promise<AIResult<T>>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<AIResult<T>> {
    let lastResult: AIResult<T>;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      lastResult = await operation();
      
      if (lastResult.success || !lastResult.error.retryable) {
        return lastResult;
      }
      
      if (attempt < maxRetries) {
        const delay = lastResult.error.retryAfter || (baseDelay * Math.pow(2, attempt));
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return lastResult!;
  }
}
```

### React Component Error Boundaries

```tsx
// components/ai-error-boundary.tsx
import React from 'react';
import { AIResult } from '@/lib/ai/error-handling';

interface AIErrorDisplayProps {
  result: AIResult<never>;
  onRetry?: () => void;
}

export function AIErrorDisplay({ result, onRetry }: AIErrorDisplayProps) {
  if (result.success) return null;

  const { error } = result;
  
  const getErrorIcon = () => {
    switch (error.type) {
      case 'RATE_LIMIT': return '⏱️';
      case 'INVALID_INPUT': return '❌';
      case 'NETWORK_ERROR': return '🌐';
      case 'TIMEOUT': return '⏰';
      default: return '⚠️';
    }
  };

  const getErrorColor = () => {
    switch (error.type) {
      case 'RATE_LIMIT': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'INVALID_INPUT': return 'border-red-500 bg-red-50 text-red-800';
      case 'NETWORK_ERROR': return 'border-blue-500 bg-blue-50 text-blue-800';
      case 'TIMEOUT': return 'border-orange-500 bg-orange-50 text-orange-800';
      default: return 'border-gray-500 bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getErrorColor()}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{getErrorIcon()}</span>
        <h3 className="font-semibold">
          {error.type === 'RATE_LIMIT' && 'Rate Limit Exceeded'}
          {error.type === 'INVALID_INPUT' && 'Invalid Request'}
          {error.type === 'NETWORK_ERROR' && 'Network Error'}
          {error.type === 'TIMEOUT' && 'Request Timeout'}
          {error.type === 'API_ERROR' && 'API Error'}
        </h3>
      </div>
      
      <p className="mb-3">{error.message}</p>
      
      {error.retryable && onRetry && (
        <div className="flex items-center justify-between">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-white border border-current rounded hover:bg-opacity-90 transition-colors"
          >
            Try Again
          </button>
          {error.retryAfter && (
            <span className="text-sm opacity-75">
              Retry after {Math.round(error.retryAfter / 1000)}s
            </span>
          )}
        </div>
      )}
      
      {!error.retryable && (
        <p className="text-sm opacity-75">
          This error cannot be automatically retried. Please check your input or configuration.
        </p>
      )}
    </div>
  );
}
```

---

## Cost Optimization Strategies

### Token Usage Tracking & Optimization

```typescript
// lib/ai/cost-optimization.ts
interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  model: string;
  timestamp: number;
}

interface CostConfig {
  models: {
    [key: string]: {
      inputCostPer1k: number;
      outputCostPer1k: number;
    };
  };
  dailyBudget?: number;
  monthlyBudget?: number;
}

export class CostOptimizer {
  private usage: TokenUsage[] = [];
  private config: CostConfig;

  constructor(config: CostConfig) {
    this.config = config;
  }

  // Track token usage
  trackUsage(usage: TokenUsage) {
    this.usage.push(usage);
    this.cleanup(); // Remove old entries
  }

  // Calculate cost for a usage entry
  calculateCost(usage: TokenUsage): number {
    const modelConfig = this.config.models[usage.model];
    if (!modelConfig) return 0;

    const inputCost = (usage.inputTokens / 1000) * modelConfig.inputCostPer1k;
    const outputCost = (usage.outputTokens / 1000) * modelConfig.outputCostPer1k;
    
    return inputCost + outputCost;
  }

  // Get total cost for a time period
  getTotalCost(hours: number = 24): number {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.usage
      .filter(u => u.timestamp > cutoff)
      .reduce((total, usage) => total + this.calculateCost(usage), 0);
  }

  // Check if within budget
  isWithinBudget(): { daily: boolean; monthly: boolean } {
    const dailyCost = this.getTotalCost(24);
    const monthlyCost = this.getTotalCost(24 * 30);

    return {
      daily: !this.config.dailyBudget || dailyCost <= this.config.dailyBudget,
      monthly: !this.config.monthlyBudget || monthlyCost <= this.config.monthlyBudget,
    };
  }

  // Get cost-optimized model recommendation
  recommendModel(
    taskType: string,
    complexity: string,
    estimatedTokens: number
  ): string {
    const budgetStatus = this.isWithinBudget();
    
    // If over budget, prefer cheaper models
    if (!budgetStatus.daily || !budgetStatus.monthly) {
      if (complexity === 'simple') {
        return 'gpt-5-main'; // Cheapest for simple tasks
      }
      return 'claude-sonnet-4-20250514'; // Mid-tier option
    }

    // Normal routing logic when within budget
    if (taskType === 'code' && complexity === 'complex') {
      return 'gpt-5-thinking';
    }
    
    if (taskType === 'analysis' || taskType === 'creative') {
      return 'claude-opus-4.1';
    }

    return 'gpt-5';
  }

  // Optimize prompt for cost efficiency
  optimizePrompt(prompt: string, maxTokens?: number): string {
    // Remove unnecessary words and optimize for token efficiency
    let optimized = prompt
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\b(please|kindly|if you would|if you could)\b/gi, '') // Remove politeness tokens
      .replace(/\b(very|really|quite|extremely)\b/gi, '') // Remove intensifiers
      .trim();

    // If still too long and maxTokens is specified, truncate intelligently
    if (maxTokens && this.estimateTokens(optimized) > maxTokens * 0.8) {
      const words = optimized.split(' ');
      const targetWords = Math.floor(words.length * 0.7); // Reduce by 30%
      optimized = words.slice(0, targetWords).join(' ') + '...';
    }

    return optimized;
  }

  // Estimate token count (rough approximation)
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English
    return Math.ceil(text.length / 4);
  }

  // Clean up old usage data
  private cleanup() {
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.usage = this.usage.filter(u => u.timestamp > oneMonthAgo);
  }

  // Get usage statistics
  getUsageStats(hours: number = 24) {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    const recentUsage = this.usage.filter(u => u.timestamp > cutoff);

    const totalTokens = recentUsage.reduce(
      (acc, u) => ({
        input: acc.input + u.inputTokens,
        output: acc.output + u.outputTokens,
      }),
      { input: 0, output: 0 }
    );

    const totalCost = recentUsage.reduce(
      (total, usage) => total + this.calculateCost(usage), 
      0
    );

    const modelBreakdown = recentUsage.reduce((acc, u) => {
      acc[u.model] = (acc[u.model] || 0) + this.calculateCost(u);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTokens,
      totalCost,
      modelBreakdown,
      requestCount: recentUsage.length,
      averageCostPerRequest: recentUsage.length > 0 ? totalCost / recentUsage.length : 0,
    };
  }
}

// Cost configuration for 2025 pricing
export const COST_CONFIG: CostConfig = {
  models: {
    'gpt-5': {
      inputCostPer1k: 0.10, // Estimated pricing
      outputCostPer1k: 0.20,
    },
    'gpt-5-main': {
      inputCostPer1k: 0.05, // Faster, cheaper variant
      outputCostPer1k: 0.10,
    },
    'gpt-5-thinking': {
      inputCostPer1k: 0.15, // More expensive for complex reasoning
      outputCostPer1k: 0.30,
    },
    'claude-sonnet-4-20250514': {
      inputCostPer1k: 0.15,
      outputCostPer1k: 0.75,
    },
    'claude-opus-4.1': {
      inputCostPer1k: 0.75, // Premium model
      outputCostPer1k: 2.25,
    },
  },
  dailyBudget: 50.00, // $50 per day
  monthlyBudget: 1000.00, // $1000 per month
};
```

---

## Context Management & Memory

### Conversation Memory System

```typescript
// lib/ai/memory-manager.ts
interface ConversationContext {
  id: string;
  userId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    tokenCount?: number;
    metadata?: Record<string, any>;
  }>;
  summary?: string;
  entities: Record<string, any>; // Extracted entities
  preferences: Record<string, any>; // User preferences learned
  createdAt: number;
  updatedAt: number;
}

export class MemoryManager {
  private contexts: Map<string, ConversationContext> = new Map();
  private maxContextLength: number;
  private maxContextAge: number; // milliseconds

  constructor(options: {
    maxContextLength?: number;
    maxContextAge?: number;
  } = {}) {
    this.maxContextLength = options.maxContextLength || 8000; // tokens
    this.maxContextAge = options.maxContextAge || 24 * 60 * 60 * 1000; // 24 hours
  }

  // Initialize or get conversation context
  getContext(contextId: string, userId: string): ConversationContext {
    let context = this.contexts.get(contextId);
    
    if (!context) {
      context = {
        id: contextId,
        userId,
        messages: [],
        entities: {},
        preferences: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this.contexts.set(contextId, context);
    }

    // Clean up old contexts
    this.cleanup();
    
    return context;
  }

  // Add message to context with intelligent truncation
  addMessage(
    contextId: string,
    message: {
      role: 'user' | 'assistant' | 'system';
      content: string;
      metadata?: Record<string, any>;
    }
  ) {
    const context = this.contexts.get(contextId);
    if (!context) return;

    const tokenCount = this.estimateTokens(message.content);
    
    const newMessage = {
      ...message,
      timestamp: Date.now(),
      tokenCount,
    };

    context.messages.push(newMessage);
    context.updatedAt = Date.now();

    // Intelligent context truncation
    this.truncateContext(context);

    // Extract entities and update preferences
    this.updateEntitiesAndPreferences(context, newMessage);
  }

  // Get optimized message history for AI models
  getOptimizedHistory(
    contextId: string,
    options: {
      maxTokens?: number;
      includeSystem?: boolean;
      preserveRecent?: number; // Always keep last N messages
    } = {}
  ): Array<{ role: string; content: string }> {
    const context = this.contexts.get(contextId);
    if (!context) return [];

    const {
      maxTokens = this.maxContextLength,
      includeSystem = true,
      preserveRecent = 4,
    } = options;

    let messages = [...context.messages];
    
    if (!includeSystem) {
      messages = messages.filter(m => m.role !== 'system');
    }

    // Always preserve the most recent messages
    const recentMessages = messages.slice(-preserveRecent);
    const olderMessages = messages.slice(0, -preserveRecent);

    let totalTokens = recentMessages.reduce(
      (sum, msg) => sum + (msg.tokenCount || 0), 
      0
    );

    // Add older messages if they fit within token limit
    const selectedOlderMessages = [];
    for (let i = olderMessages.length - 1; i >= 0; i--) {
      const msg = olderMessages[i];
      const msgTokens = msg.tokenCount || 0;
      
      if (totalTokens + msgTokens <= maxTokens) {
        selectedOlderMessages.unshift(msg);
        totalTokens += msgTokens;
      } else {
        break;
      }
    }

    // Combine with context summary if available and helpful
    const finalMessages = [...selectedOlderMessages, ...recentMessages];
    
    if (context.summary && selectedOlderMessages.length === 0 && olderMessages.length > 0) {
      // If we couldn't fit any older messages, include summary
      finalMessages.unshift({
        role: 'system',
        content: `Previous conversation summary: ${context.summary}`,
        timestamp: context.createdAt,
        tokenCount: this.estimateTokens(context.summary),
      });
    }

    return finalMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  // Generate conversation summary for long contexts
  private async generateSummary(context: ConversationContext): Promise<string> {
    // This would typically call an AI model to summarize
    // For now, return a simple summary
    const messageCount = context.messages.length;
    const topics = Object.keys(context.entities).slice(0, 3).join(', ');
    
    return `Conversation with ${messageCount} messages about: ${topics}. ` +
           `User preferences: ${JSON.stringify(context.preferences)}`;
  }

  // Intelligent context truncation
  private truncateContext(context: ConversationContext) {
    const totalTokens = context.messages.reduce(
      (sum, msg) => sum + (msg.tokenCount || 0), 
      0
    );

    if (totalTokens <= this.maxContextLength) return;

    // Generate summary before truncating if we don't have one
    if (!context.summary && context.messages.length > 10) {
      // In a real implementation, this would be async
      context.summary = `Previous conversation about ${Object.keys(context.entities).join(', ')}`;
    }

    // Keep system messages and recent messages
    const systemMessages = context.messages.filter(m => m.role === 'system');
    const nonSystemMessages = context.messages.filter(m => m.role !== 'system');
    
    // Keep last 50% of non-system messages
    const keepCount = Math.floor(nonSystemMessages.length * 0.5);
    const recentMessages = nonSystemMessages.slice(-keepCount);

    context.messages = [...systemMessages, ...recentMessages];
  }

  // Extract entities and update preferences
  private updateEntitiesAndPreferences(
    context: ConversationContext,
    message: { role: string; content: string; metadata?: Record<string, any> }
  ) {
    // Simple entity extraction (in production, use NLP libraries)
    const content = message.content.toLowerCase();
    
    // Extract names (simple heuristic)
    const namePattern = /my name is (\w+)|i'm (\w+)|call me (\w+)/g;
    let match;
    while ((match = namePattern.exec(content)) !== null) {
      const name = match[1] || match[2] || match[3];
      context.entities.name = name;
    }

    // Extract preferences
    if (content.includes('prefer') || content.includes('like')) {
      const preferencePattern = /i (prefer|like) ([\w\s]+)/g;
      while ((match = preferencePattern.exec(content)) !== null) {
        const preference = match[2].trim();
        context.preferences[preference] = true;
      }
    }

    // Extract location
    const locationPattern = /i'm in (\w+)|from (\w+)|live in (\w+)/g;
    while ((match = locationPattern.exec(content)) !== null) {
      const location = match[1] || match[2] || match[3];
      context.entities.location = location;
    }
  }

  // Estimate token count
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4); // Rough estimation
  }

  // Clean up old contexts
  private cleanup() {
    const now = Date.now();
    for (const [id, context] of this.contexts.entries()) {
      if (now - context.updatedAt > this.maxContextAge) {
        this.contexts.delete(id);
      }
    }
  }

  // Get context statistics
  getContextStats(contextId: string) {
    const context = this.contexts.get(contextId);
    if (!context) return null;

    const totalTokens = context.messages.reduce(
      (sum, msg) => sum + (msg.tokenCount || 0), 
      0
    );

    return {
      messageCount: context.messages.length,
      totalTokens,
      entities: context.entities,
      preferences: context.preferences,
      createdAt: new Date(context.createdAt),
      updatedAt: new Date(context.updatedAt),
    };
  }
}
```

---

## Production-Ready Examples

### Complete Chat Component

```tsx
// components/ai-chat.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAIStream } from '@/hooks/use-ai-stream';
import { AIErrorDisplay } from '@/components/ai-error-boundary';
import { MemoryManager } from '@/lib/ai/memory-manager';
import { CostOptimizer, COST_CONFIG } from '@/lib/ai/cost-optimization';

interface AIChatProps {
  userId: string;
  contextId: string;
  className?: string;
}

export function AIChat({ userId, contextId, className }: AIChatProps) {
  const [input, setInput] = useState('');
  const [costOptimizer] = useState(() => new CostOptimizer(COST_CONFIG));
  const [memoryManager] = useState(() => new MemoryManager());
  const [lastError, setLastError] = useState<any>(null);
  
  const {
    messages,
    isStreaming,
    error,
    routingInfo,
    sendMessage,
    clearMessages,
    abortStream,
  } = useAIStream();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize context
  useEffect(() => {
    memoryManager.getContext(contextId, userId);
  }, [contextId, userId, memoryManager]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const optimizedInput = costOptimizer.optimizePrompt(input);
    const context = memoryManager.getContext(contextId, userId);
    
    // Get optimized message history
    const messageHistory = memoryManager.getOptimizedHistory(contextId, {
      maxTokens: 6000,
      preserveRecent: 4,
    });

    // Add user message to memory
    memoryManager.addMessage(contextId, {
      role: 'user',
      content: optimizedInput,
    });

    try {
      await sendMessage(optimizedInput, {
        context: messageHistory,
        userId,
        preferences: context.preferences,
      });

      // Track successful completion
      if (routingInfo) {
        costOptimizer.trackUsage({
          inputTokens: costOptimizer.estimateTokens(optimizedInput),
          outputTokens: costOptimizer.estimateTokens(
            messages[messages.length - 1]?.content || ''
          ),
          model: routingInfo.selectedModel,
          timestamp: Date.now(),
        });
      }

      setInput('');
      setLastError(null);
    } catch (err) {
      setLastError(err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleRetry = () => {
    if (lastError) {
      const lastUserMessage = messages[messages.length - 2]?.content;
      if (lastUserMessage) {
        sendMessage(lastUserMessage);
      }
    }
  };

  const contextStats = memoryManager.getContextStats(contextId);
  const usageStats = costOptimizer.getUsageStats(24);
  const budgetStatus = costOptimizer.isWithinBudget();

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with stats */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold">AI Assistant</h2>
          {routingInfo && (
            <div className="text-sm text-gray-600">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              {routingInfo.selectedModel}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {contextStats && (
            <span>{contextStats.messageCount} messages</span>
          )}
          <span>${usageStats.totalCost.toFixed(3)} today</span>
          {(!budgetStatus.daily || !budgetStatus.monthly) && (
            <span className="text-red-600">⚠️ Over budget</span>
          )}
          <button
            onClick={clearMessages}
            className="text-red-600 hover:text-red-800"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.role === 'assistant' && index === messages.length - 1 && isStreaming && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                  <span className="text-xs opacity-75">Thinking...</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {error && (
          <AIErrorDisplay
            result={{ success: false, error: { type: 'API_ERROR', message: error, retryable: true }, metadata: { attemptedAt: Date.now() } }}
            onRetry={handleRetry}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
            disabled={isStreaming}
          />
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStreaming ? 'Stop' : 'Send'}
            </button>
            {isStreaming && (
              <button
                type="button"
                onClick={abortStream}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Abort
              </button>
            )}
          </div>
        </form>
        
        {routingInfo && (
          <div className="mt-2 text-xs text-gray-500">
            Routing: {routingInfo.reasoning}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Environment Configuration

```bash
# .env.local
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Rate limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Cost controls
MAX_DAILY_COST=50.00
MAX_MONTHLY_COST=1000.00

# Context management
MAX_CONTEXT_LENGTH=8000
MAX_CONTEXT_AGE_HOURS=24

# Model preferences
DEFAULT_MODEL_PREFERENCE=auto
FORCE_THINKING_THRESHOLD=complex
```

---

## Key Takeaways

1. **Model Selection**: Use GPT-5 for coding and fast responses, Claude Opus 4.1 for analysis and creative tasks
2. **Streaming**: Implement proper streaming with abort capabilities for better UX
3. **Error Handling**: Never use fallback data; provide clear error states with retry options
4. **Cost Management**: Track usage, optimize prompts, and implement budget controls
5. **Context Management**: Use intelligent truncation and memory systems for long conversations
6. **Tool Use**: Implement universal tool definitions that work across both APIs
7. **TypeScript**: Maintain strict type safety throughout the integration

This implementation provides a robust foundation for integrating both GPT-5 and Claude Opus 4.1 in production Next.js applications with proper cost optimization, error handling, and user experience considerations.