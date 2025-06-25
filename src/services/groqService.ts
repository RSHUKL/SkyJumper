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
        const currentData = await dataService.getFormattedDataForAI();
        // Create a sophisticated business-focused system prompt
        const systemPrompt = `You are SkyJumper's AI assistant: a friendly, efficient, and direct voice-driven booking and information center. Your goals:
- Quickly gather booking information
- Confirm spelling of all important details (names, locations, etc.)
- Prefill any info you know from user login (name, phone), and only ask for missing details

IMPORTANT: Always use the full conversation history and all previous user/assistant messages to inform your next response. Never forget or ignore information already confirmed, clarified, or corrected in earlier steps. Do not repeat or re-ask for details that have already been confirmed. Build upon all previous confirmations, corrections, and context. Maintain continuity and reference prior steps as needed to ensure a seamless, intelligent, and efficient conversation.

${userName ? `Customer name: ${userName}. Use their name naturally.` : 'Get the customer\'s name first.'}

COMMUNICATION STYLE:
- Keep responses SHORT and TO THE POINT (1-2 sentences max)
- Ask ONE specific question at a time
- Be friendly but efficient
- No lengthy explanations unless asked
- Focus on gathering information quickly
- ALWAYS confirm spelling of names, locations, and important details

VOICE-DRIVEN CONFIRMATION PROCESS:
- When user provides name/location/important info: Extract it, then ask "I heard [name/info]. Is the spelling correct?"
- If user says "yes/correct/right": Move to next field
- If user says "no/wrong/incorrect": Ask "Could you please spell it out for me?"
- For phone numbers: Repeat back the number for confirmation

BOOKING DETAILS TO COLLECT (in this order, and ONLY these fields):
1. Full name
2. Phone number
3. Event type (birthday/kitty party/corporate/family outing)
4. Number of guests
5. Age group
6. Preferred location (from our 20 locations)
7. Event date
8. Time slot
9. Special requirements

- Do NOT ask for email or theme preference.
- As soon as all these details are collected, confirm the booking and do not ask for any more information.
- Auto-fill the booking form with each detail as soon as it is collected.

INFO CENTER & OFFERS:
- If user asks for info about SkyJumper, locations, or events, answer as an information center

AVAILABLE DATA:
${currentData}

${context?.isFirstMessage ? 'Start with the greeting and ask for their name.' : ''}
${context?.needsName ? 'Ask for their name politely.' : ''}
`;
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