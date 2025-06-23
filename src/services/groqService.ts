import { Groq } from 'groq-sdk';
import type { APIError } from '../types';
import { dataService } from './dataService';

class GroqService {
  private client: Groq | null = null;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    
    if (!apiKey) {
      console.warn('Groq API key not found. Please set VITE_GROQ_API_KEY in your environment variables.');
      return;
    }

    try {
      this.client = new Groq({
        apiKey,
        dangerouslyAllowBrowser: true
      });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Groq client:', error);
    }
  }
  async generateResponse(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    retries = 3,
    userName?: string | null,
    context?: {
      isFirstMessage?: boolean;
      expectingBooking?: boolean;
      needsName?: boolean;
    }
  ): Promise<string> {
    const chunks = [];
    for await (const chunk of this.generateStreamingResponse(messages, retries, userName, context)) {
      chunks.push(chunk);
    }
    return chunks.join('');
  }
  
  async *generateStreamingResponse(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    retries = 3,
    userName?: string | null,
    context?: {
      isFirstMessage?: boolean;
      expectingBooking?: boolean;
      needsName?: boolean;
    }
  ): AsyncGenerator<string> {
    if (!this.initialized || !this.client) {
      throw new Error('Groq service is not properly initialized. Please check your API key.');
    }    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Get dynamic, real-time data for AI context
        const currentData = await dataService.getFormattedDataForAI();        // Create a sophisticated business-focused system prompt
        const systemPrompt = `You are SkyJumper's booking assistant - friendly, efficient, and direct. Your goal is to quickly gather booking information.

${userName ? `Customer name: ${userName}. Use their name naturally.` : 'Get the customer\'s name first.'}

COMMUNICATION STYLE:
- Keep responses SHORT and TO THE POINT (1-2 sentences max)
- Ask ONE specific question at a time
- Be friendly but efficient
- No lengthy explanations unless asked
- Focus on gathering information quickly

INFORMATION TO COLLECT (in this order):
1. Customer name
2. Phone number
3. Event type (birthday/kitty party/corporate/family outing)
4. Number of guests and age group
5. Preferred location from our 20 locations
6. Preferred date and time
7. Theme preference (if birthday/kitty party)
8. Any special requirements

AVAILABLE DATA:
${currentData}

CONVERSATION EXAMPLES:
- First message: "Hi! Welcome to SkyJumper — your spot for fun and adventure. I'm your booking assistant. Can I please have your name to get started?"
- Getting phone: "Thanks [Name]! What's your phone number?"
- Event type: "What type of event are you planning?"
- Guests: "How many guests will be joining?"
- Location: "Which location works best for you? We have [mention 2-3 nearby options]"

${context?.isFirstMessage ? 'Start with the greeting and ask for their name.' : ''}
${context?.needsName ? 'Ask for their name politely.' : ''}

Keep it simple, direct, and efficient!`;

        const stream = await this.client.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            ...messages
          ],
          model: 'llama3-8b-8192',
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 1,
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            yield content;
          }
        }
        return; // Exit loop on success
      } catch (error: unknown) {
        console.error(`Groq API attempt ${attempt} failed:`, error);
        
        if (attempt === retries) {
          const apiError: APIError = {
            message: error instanceof Error ? error.message : 'Failed to generate AI response',
            code: error && typeof error === 'object' && 'code' in error ? String(error.code) : undefined,
            status: error && typeof error === 'object' && 'status' in error ? Number(error.status) : undefined
          };
          throw apiError;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    throw new Error('Max retries exceeded');
  }

  isAvailable(): boolean {
    return this.initialized && this.client !== null;
  }
}

export const groqService = new GroqService();