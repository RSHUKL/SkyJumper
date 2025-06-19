import { useState, useCallback, useRef } from 'react';
import { speechService } from '../services/speechService';
import type { VoiceSettings } from '../types';

const defaultVoiceSettings: VoiceSettings = {
  enabled: true,
  autoPlay: true,
  voice: null,
  rate: 0.7,
  pitch: 1,
  volume: 1,
  language: 'en-US'
};

export function useVoice() {
  const [settings, setSettings] = useState<VoiceSettings>(defaultVoiceSettings);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isListeningRef = useRef(false);

  const toggleSpeaker = useCallback(() => {
    return speechService.toggleSpeaker();
  }, []);

  const isSpeakerOn = useCallback(() => {
    return speechService.isSpeakerOn();
  }, []);

  const startListening = useCallback(async (): Promise<string | null> => {
    if (isListeningRef.current) return null;

    try {
      setError(null);
      setIsListening(true);
      isListeningRef.current = true;

      const result = await speechService.startListening();
      return result;
    } catch (error: any) {
      console.error('Voice recognition error:', error);
      setError(error.message);
      return null;
    } finally {
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, []);

  const stopListening = useCallback(() => {
    if (isListeningRef.current) {
      speechService.stopListening();
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!settings.enabled || !text.trim()) return;

    try {
      setError(null);
      setIsSpeaking(true);
      
      await speechService.speak(text, settings);
    } catch (error: any) {
      console.error('Speech synthesis error:', error);
      setError(error.message);
    } finally {
      setIsSpeaking(false);
    }
  }, [settings]);

  const stopSpeaking = useCallback(() => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return {
    settings,
    isListening,
    isSpeaking,
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    updateSettings,
    isRecognitionSupported: speechService.isRecognitionSupported(),
    isSynthesisSupported: speechService.isSynthesisSupported(),
    clearError: () => setError(null),
    isSpeakerOn,
    toggleSpeaker
  };
}