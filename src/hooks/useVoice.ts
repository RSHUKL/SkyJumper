import { useState, useCallback, useRef } from 'react';
import { speechService } from '../services/speechService';
import type { VoiceSettings } from '../types';

export function useVoice() {
  const [settings, setSettings] = useState<VoiceSettings>({
    enabled: true,
    autoPlay: true,
    voice: null,
    rate: 0.7,
    pitch: 1,
    volume: 1,
    language: 'en-US'
  });
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSpeaker = useCallback(() => {
    return speechService.toggleSpeaker();
  }, []);

  const isSpeakerOn = useCallback(() => {
    return speechService.isSpeakerOn();
  }, []);

  const startListening = useCallback(
    ({
      onResult,
      onEnd,
      onError,
    }: {
      onResult: (transcript: string, isFinal: boolean) => void;
      onEnd: () => void;
      onError: (error: any) => void;
    }) => {
      if (isListening) return;

      setError(null);
      setIsListening(true);

      speechService.startListening({
        onResult,
        onEnd: () => {
          setIsListening(false);
          onEnd();
        },
        onError: (err: any) => {
          console.error('Voice recognition error:', err);
          setError(err.message || err);
          setIsListening(false);
          onError(err);
        },
      });
    },
    [isListening]
  );

  const stopListening = useCallback(() => {
    speechService.stopListening();
    setIsListening(false);
  }, []);

  const speak = useCallback(
    async (text: string) => {
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
    },
    [settings]
  );

  const stopSpeaking = useCallback(() => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
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
    toggleSpeaker,
  };
}