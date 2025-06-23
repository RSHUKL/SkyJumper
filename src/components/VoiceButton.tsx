import React, { useState, useEffect } from 'react';
import { useVoice } from '../hooks/useVoice';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle } from 'lucide-react';

interface VoiceButtonProps {
  onVoiceInput: (text: string) => void;
  className?: string;
  disabled?: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ 
  onVoiceInput, 
  className = '',
  disabled = false 
}) => {
  const {
    isListening,
    isSpeaking,
    error,
    stopSpeaking,
    startListening,
    stopListening,
    isSynthesisSupported,
    isRecognitionSupported,
    clearError,
    isSpeakerOn,
    toggleSpeaker
  } = useVoice();
  const [showTooltip, setShowTooltip] = useState(false);

  // Clean and sanitize text
  const sanitizeText = (text: string): string => {
    return text
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove all characters except letters, numbers, and spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim(); // Remove leading/trailing spaces
  };

  useEffect(() => {
    if (error) {
      setShowTooltip(true);
      const timer = setTimeout(() => {
        setShowTooltip(false);
        clearError();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleClick = async () => {
    if (disabled) return;

    if (isListening) {
      stopListening();
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    startListening({
      onResult: (transcript, isFinal) => {
        // For now, we only care about the final result.
        if (isFinal) {
          const cleanedText = sanitizeText(transcript);
          onVoiceInput(cleanedText);
        }
      },
      onEnd: () => {
        // Speech recognition ended.
      },
      onError: (error) => {
        console.error('VoiceButton error:', error);
      },
    });
  };

  if (!isRecognitionSupported && !isSynthesisSupported) {
    return (
      <div className="relative">
        <button
          disabled
          className="p-2 rounded-full bg-gray-300 text-gray-500 cursor-not-allowed"
          title="Voice input not supported in your browser"
        >
          <MicOff className="w-5 h-5" />
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded shadow-lg whitespace-nowrap">
          Voice input not supported
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 relative">
      {/* Speaker Toggle Button */}      {isSynthesisSupported && (
        <button
          onClick={toggleSpeaker}
          className={`p-2 rounded-full transition-colors ${
            isSpeakerOn() 
              ? 'bg-[#f58220] hover:bg-orange-600 text-white' 
              : 'bg-gray-300 hover:bg-gray-400 text-gray-600'
          }`}
          title={isSpeakerOn() ? 'Turn speaker off' : 'Turn speaker on'}
        >
          {isSpeakerOn() ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Voice Input Button */}      <button
        onClick={handleClick}
        disabled={disabled}
        className={`p-2 rounded-full transition-colors ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : isSpeaking
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-[#f58220] hover:bg-orange-600 text-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        title={isListening ? 'Click to stop listening' : 'Click to start voice input'}
      >
        {isListening ? (
          <Mic className="w-5 h-5 animate-pulse" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Error Tooltip */}
      {showTooltip && error && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-red-500 text-white text-sm rounded shadow-lg whitespace-nowrap flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}; 