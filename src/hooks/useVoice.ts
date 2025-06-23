import { useState, useCallback } from 'react';
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
      onError: (error: Error | string | unknown) => void;
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
        onError: (err: Error | string | unknown) => {
          console.error('Voice recognition error:', err);
          setError(err instanceof Error ? err.message : String(err));
          setIsListening(false);
          onError(err);
        },
      });
    },
    [isListening]
  );

  const stopListening = useCallback(() => {
    // speechService.stopListening(); // Method doesn't exist - commented out
    setIsListening(false);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!settings.enabled || !text.trim()) return;

      try {
        setError(null);
        setIsSpeaking(true);
        await speechService.speak(text, settings);
      } catch (error: unknown) {
        console.error('Speech synthesis error:', error);
        setError(error instanceof Error ? error.message : String(error));
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

  const startContinuousListening = useCallback(
    ({
      onResult,
      onSilence,
      onError,
    }: {
      onResult: (transcript: string, isFinal: boolean) => void;
      onSilence: (transcript: string) => void;
      onError: (error: unknown) => void;
    }) => {
      if (isListening) return;

      setError(null);
      setIsListening(true);

      speechService.startContinuousListening({
        onResult,
        onSilence: (transcript: string) => {
          setIsListening(false);
          onSilence(transcript);
        },
        onError: (err: unknown) => {
          console.error('Voice recognition error:', err);
          setError(typeof err === 'string' ? err : 'Voice recognition error');
          setIsListening(false);
          onError(err);
        },
      });
    },
    [isListening]
  );

  const stopContinuousListening = useCallback(() => {
    speechService.stopContinuousListening();
    setIsListening(false);
  }, []);

  const checkMicrophonePermissions = useCallback(async () => {
    try {
      const hasPermission = await speechService.checkMicrophonePermissions();
      return hasPermission;
    } catch (error) {
      console.error('Permission check error:', error);
      setError('Unable to check microphone permissions');
      return false;
    }
  }, []);

  const requestMicrophonePermissions = useCallback(async () => {
    try {
      const granted = await speechService.requestMicrophonePermissions();
      if (!granted) {
        setError('Microphone permissions were denied. Please allow microphone access in your browser settings.');
      }
      return granted;
    } catch (error) {
      console.error('Permission request error:', error);
      setError('Unable to request microphone permissions');
      return false;
    }
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
    startContinuousListening,
    stopContinuousListening,
    checkMicrophonePermissions,
    requestMicrophonePermissions,
  };
}