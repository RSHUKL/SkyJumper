import { Groq } from 'groq-sdk';
import type { APIError } from '../types';
import { skyjumperService } from './skyjumperService';

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
    userName?: string | null
  ): Promise<string> {
    const chunks = [];
    for await (const chunk of this.generateStreamingResponse(messages, retries, userName)) {
      chunks.push(chunk);
    }
    return chunks.join('');
  }
  
  async *generateStreamingResponse(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    retries = 3,
    userName?: string | null
  ): AsyncGenerator<string> {
    if (!this.initialized || !this.client) {
      throw new Error('Groq service is not properly initialized. Please check your API key.');
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const stream = await this.client.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `You are a helpful AI assistant for SkyJumper Trampoline Park.\n\n$${userName ? `The user's name is ${userName}. Personalize your responses using their name when appropriate.\n` : ''}You can provide information about:\n- Locations and facilities\n- Pricing and packages\n- Safety guidelines\n- Booking information\n- General inquiries about trampoline parks\n\nWhen users ask about specific topics, use the following information:\n\nLocations:\n${skyjumperService.getLocations().map(loc => skyjumperService.formatLocationInfo(loc)).join('\n\n')}\n\nPricing:\n${skyjumperService.getPricing().map(price => skyjumperService.formatPricingInfo(price)).join('\n\n')}\n\nSafety Guidelines:\n${skyjumperService.formatSafetyGuidelines()}\n\nAlways be friendly and helpful. If you don't know something specific, direct users to visit https://skyjumpertrampolinepark.com/ or call +91 8882288001 for more information.`
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
      } catch (error: any) {
        console.error(`Groq API attempt ${attempt} failed:`, error);
        
        if (attempt === retries) {
          const apiError: APIError = {
            message: error.message || 'Failed to generate AI response',
            code: error.code,
            status: error.status
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