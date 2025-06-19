import type { VoiceSettings } from '../types';

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
    mozSpeechRecognition: new () => SpeechRecognition;
    msSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

class SpeechService {
  private synthesis: SpeechSynthesis;
  private recognition: SpeechRecognition | null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isVoicesLoaded: boolean = false;
  private retryCount: number = 0;
  private readonly MAX_RETRIES: number = 3;
  private isListening: boolean = false;
  private isSpeakerEnabled: boolean = true;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.recognition = this.createRecognition();
    this.loadVoices();
  }

  private createRecognition(): SpeechRecognition | null {
    const SpeechRecognition = window.SpeechRecognition || 
                             (window as any).webkitSpeechRecognition || 
                             (window as any).mozSpeechRecognition || 
                             (window as any).msSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        this.isListening = true;
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        this.isListening = false;
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
      };

      return recognition;
    } catch (error) {
      console.error('Error creating speech recognition:', error);
      return null;
    }
  }

  private loadVoices() {
    if (this.isVoicesLoaded) return;

    const voices = this.synthesis.getVoices();
    if (voices.length > 0) {
      this.selectVoice(voices);
    } else {
      this.synthesis.onvoiceschanged = () => {
        const voices = this.synthesis.getVoices();
        this.selectVoice(voices);
      };
    }
  }

  private selectVoice(voices: SpeechSynthesisVoice[]) {
    // Log all available voices for debugging
    console.log('Available voices:', voices.map(v => v.name));

    // Try to find a female voice with higher priority
    const femaleVoice = voices.find(voice => {
      const name = voice.name.toLowerCase();
      return (
        name.includes('female') ||
        name.includes('samantha') ||
        name.includes('zira') ||
        name.includes('karen') ||
        name.includes('melissa') ||
        name.includes('microsoft zira') ||
        name.includes('microsoft heera') ||
        name.includes('microsoft kalpana') ||
        name.includes('google uk female') ||
        name.includes('google us female') ||
        name.includes('google female') ||
        name.includes('siri') ||
        name.includes('cortana') ||
        name.includes('alexa') ||
        name.includes('ivona') ||
        name.includes('amy') ||
        name.includes('emma') ||
        name.includes('lisa') ||
        name.includes('susan') ||
        name.includes('victoria')
      );
    });

    if (femaleVoice) {
      console.log('Selected female voice:', femaleVoice.name);
      this.selectedVoice = femaleVoice;
    } else {
      // If no female voice found, try to find a natural-sounding voice
      const naturalVoice = voices.find(voice => {
        const name = voice.name.toLowerCase();
        return (
          name.includes('natural') ||
          name.includes('premium') ||
          name.includes('enhanced') ||
          name.includes('neural') ||
          name.includes('wave')
        );
      });

      if (naturalVoice) {
        console.log('Selected natural voice:', naturalVoice.name);
        this.selectedVoice = naturalVoice;
      } else {
        // Last resort: try to find any voice that's not explicitly male
        const nonMaleVoice = voices.find(voice => {
          const name = voice.name.toLowerCase();
          return !(
            name.includes('male') ||
            name.includes('david') ||
            name.includes('mark') ||
            name.includes('michael') ||
            name.includes('john') ||
            name.includes('peter') ||
            name.includes('thomas')
          );
        });

        this.selectedVoice = nonMaleVoice || voices[0];
        console.log('Selected fallback voice:', this.selectedVoice.name);
      }
    }

    this.isVoicesLoaded = true;
  }

  private async waitForVoices(): Promise<void> {
    if (this.isVoicesLoaded) return;

    return new Promise((resolve) => {
      const checkVoices = () => {
        const voices = this.synthesis.getVoices();
        if (voices.length > 0) {
          this.selectVoice(voices);
          resolve();
        } else if (this.retryCount < this.MAX_RETRIES) {
          this.retryCount++;
          setTimeout(checkVoices, 1000);
        } else {
          console.warn('Failed to load voices after retries');
          resolve();
        }
      };
      checkVoices();
    });
  }


  private convertToPlainText(text: string): string {
    // Split text into sentences and process each one
    const sentences = text.split(/([.!?]+\s+)/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      // Skip sentences containing URLs or email patterns
      .filter(sentence => {
        const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|org|net|edu|gov|io|ai|app|dev))/i;
        const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        return !urlPattern.test(sentence) && !emailPattern.test(sentence);
      })
      .map(sentence => {
        // Replace special characters with appropriate alternatives or remove them
        return sentence
          .replace(/[^\w\s.,!?'-]/g, ' ') // Keep only alphanumeric, basic punctuation, and apostrophes
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim();
      })
      .filter(sentence => sentence.length > 0);

    return sentences.join(' ').trim();
  }
    




  private processLLMResponse(text: string): string {
    // Remove URLs and links first
    text = text.replace(/https?:\/\/[^\s]+/g, ''); // Remove http/https URLs
    text = text.replace(/www\.[^\s]+/g, '');       // Remove www URLs
    text = text.replace(/[a-zA-Z0-9-]+\.(com|org|net|edu|gov|io|ai|app|dev)[^\s]*/gi, ''); // Remove domain references
    
    // Remove code blocks and technical content
    text = text.replace(/```[\s\S]*?```/g, '');
    text = text.replace(/`[^`]+`/g, '');
    
    // Remove markdown formatting
    text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
    text = text.replace(/\*(.*?)\*/g, '$1');     // Italic
    text = text.replace(/~~(.*?)~~/g, '$1');     // Strikethrough
    text = text.replace(/\[(.*?)\]\([^)]+\)/g, '$1'); // Links
    
    // Remove HTML and XML tags
    text = text.replace(/<[^>]*>/g, '');
    
    // Handle lists and bullet points
    text = text.replace(/^\s*[-*•]\s+/gm, ''); // Start of line bullets
    text = text.replace(/\n\s*[-*•]\s+/g, '. '); // Mid-text bullets to periods
    
    // Remove emojis and other special unicode characters
    text = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
    text = text.replace(/[\u{2700}-\u{27BF}]/gu, '');
    
    // Remove excess whitespace and normalize
    text = text.replace(/\s+/g, ' ').trim();
    
    // Handle common special characters in chat
    text = text.replace(/&[a-z]+;/g, ' '); // HTML entities
    text = text.replace(/[""]/g, '"');      // Smart quotes
    text = text.replace(/['']/g, "'");      // Smart apostrophes
    text = text.replace(/[–—]/g, '-');      // Em and en dashes
    text = text.replace(/…/g, '...');       // Ellipsis
    
    return this.convertToPlainText(text);
  }

  public toggleSpeaker(): boolean {
    this.isSpeakerEnabled = !this.isSpeakerEnabled;
    if (!this.isSpeakerEnabled) {
      this.stopSpeaking(); // Stop any ongoing speech
    }
    return this.isSpeakerEnabled;
  }

  public isSpeakerOn(): boolean {
    return this.isSpeakerEnabled;
  }

  async speak(text: string, settings: VoiceSettings): Promise<void> {
    // If speaker is disabled, don't speak
    if (!this.isSpeakerEnabled || !this.isSynthesisSupported() || !text.trim()) return;

    try {
      await this.waitForVoices();

      // Cancel any ongoing speech
      this.synthesis.cancel();

      // Process text based on whether it's from an LLM
      const plainText = text.includes('```') || text.includes('[]') || text.includes('<')
        ? this.processLLMResponse(text)
        : this.convertToPlainText(text);

      // Skip if no valid text remains after processing
      if (!plainText.trim()) {
        console.log('No valid text to speak after processing');
        return;
      }

      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(plainText);

      // Apply settings
      utterance.voice = this.selectedVoice;
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;

      // Add event listeners
      utterance.onend = () => {
        console.log('Speech ended');
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
      };

      // Small delay to ensure previous speech is cleared
      await new Promise(resolve => setTimeout(resolve, 100));

      // Speak
      this.synthesis.speak(utterance);
    } catch (error) {
      console.error('Error in speak:', error);
      throw error;
    }
  }

  stopSpeaking() {
    if (this.isSynthesisSupported()) {
      this.synthesis.cancel();
    }
  }

  async startListening(): Promise<string> {
    if (!this.isRecognitionSupported()) {
      throw new Error('Speech recognition not supported in this browser');
    }

    if (!this.recognition) {
      throw new Error('Speech recognition not initialized');
    }

    if (this.isListening) {
      this.stopListening();
    }

    return new Promise((resolve, reject) => {
      let hasResult = false;
      let timeoutId: NodeJS.Timeout;

      timeoutId = setTimeout(() => {
        if (!hasResult) {
          this.stopListening();
          reject(new Error('No speech detected within timeout'));
        }
      }, 10000);

      this.recognition!.onresult = (event) => {
        clearTimeout(timeoutId);
        hasResult = true;
        const text = event.results[0][0].transcript;
        console.log('Speech recognition result:', text);
        resolve(text);
      };

      this.recognition!.onerror = (event: any) => {
        clearTimeout(timeoutId);
        console.error('Speech recognition error:', event.error);
        reject(new Error(`Recognition error: ${event.error}`));
      };

      this.recognition!.onend = () => {
        clearTimeout(timeoutId);
        if (!hasResult) {
          reject(new Error('No speech detected'));
        }
      };

      try {
        console.log('Starting speech recognition...');
        this.recognition!.start();
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error starting speech recognition:', error);
        reject(error);
      }
    });
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        console.log('Stopping speech recognition...');
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
      this.isListening = false;
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  isSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  isRecognitionSupported(): boolean {
    return 'webkitSpeechRecognition' in window;
  }
}

export const speechService = new SpeechService();