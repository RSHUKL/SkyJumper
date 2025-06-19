import React, { useEffect, useRef } from 'react';
import { useVoice } from '../hooks/useVoice';
import { Message } from '../types';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onSpeakComplete?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSpeakComplete }) => {
  const { speak, stopSpeaking } = useVoice();
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message.role === 'assistant' && message.content) {
      const speakMessage = async () => {
        try {
          await speak(message.content);
          onSpeakComplete?.();
        } catch (error) {
          console.error('Error speaking message:', error);
          onSpeakComplete?.();
        }
      };
      speakMessage();
    }

    return () => {
      if (message.role === 'assistant') {
        stopSpeaking();
      }
    };
  }, [message, speak, stopSpeaking, onSpeakComplete]);

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [message]);

  return (
    <div
      ref={messageRef}
      className={`flex items-start gap-3 p-4 ${
        message.role === 'user' ? 'bg-gray-50' : 'bg-white'
      }`}
    >
      <div className="flex-shrink-0">
        {message.role === 'user' ? (
          <User className="w-6 h-6 text-blue-500" />
        ) : (
          <Bot className="w-6 h-6 text-green-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 mb-1">
          {message.role === 'user' ? 'You' : 'SkyJumper Assistant'}
        </div>
        <div className="text-sm text-gray-700 whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
}; 