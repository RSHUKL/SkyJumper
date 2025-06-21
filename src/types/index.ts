export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

export interface VoiceSettings {
  enabled: boolean;
  autoPlay: boolean;
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
  language: string;
}

export interface Language {
  code: string;
  name: string;
  voices: SpeechSynthesisVoice[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isListening: boolean;
  isPlaying: boolean;
  error: string | null;
  userName: string | null;
  waitingForName: boolean;
  booking: BookingState | null;
}

export interface APIError {
  message: string;
  code?: string;
  status?: number;
}

export interface BookingDetails {
  name: string;
  phone: string;
  email?: string;
  slotTime: string;
  bookingDate: string;
  [key: string]: string;
}

export type BookingStep = 'location' | 'name' | 'phone' | 'slotTime' | 'bookingDate' | 'done';

export interface BookingState {
  step: BookingStep;
  data: Partial<BookingDetails>;
}