import React from 'react';
import { MessageCircle, Bot, Mic, MicOff } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import { ErrorMessage } from './ErrorMessage';
import type { Message } from '../types';

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  waitingForName: boolean;
  currentTranscript: string;
  isAutoVoiceMode: boolean;
  showError: boolean;
  errorMessage: string;
  onDismissError: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  voiceEnabled: boolean;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isLoading,
  onSendMessage,
  waitingForName,
  currentTranscript,
  isAutoVoiceMode,
  showError,
  errorMessage,
  onDismissError,
  messagesEndRef,
  voiceEnabled
}) => {
  const getActiveUsers = () => {
    return messages.length > 0 ? '1 Active Chat' : 'Ready to Chat';
  };

  const getResponseRate = () => {
    const botMessages = messages.filter(m => m.sender === 'ai').length;
    const userMessages = messages.filter(m => m.sender === 'user').length;
    
    if (userMessages === 0) return '0%';
    return Math.round((botMessages / userMessages) * 100) + '%';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full flex flex-col w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5e0aa1] to-[#f58220] px-3 py-3 lg:px-4 lg:py-4 text-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 lg:h-6 lg:w-6" />
            <div>
              <h2 className="text-base lg:text-xl font-bold">SkyJumper Assistant</h2>
              <p className="text-white/90 text-xs lg:text-sm">Your personal booking companion</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {voiceEnabled ? (
              <Mic className="h-4 w-4 text-white/80" />
            ) : (
              <MicOff className="h-4 w-4 text-white/60" />
            )}
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="mt-2 lg:mt-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium flex items-center">
              <MessageCircle className="h-3 w-3 mr-1" />
              {getActiveUsers()}
            </span>
            <span className="text-xs font-bold">Response Rate: {getResponseRate()}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-1.5">
            <div 
              className="bg-white h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: messages.length > 0 ? '100%' : '0%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-3 lg:p-4 overflow-y-auto">
        {showError && (
          <ErrorMessage 
            message={errorMessage}
            onDismiss={onDismissError}
          />
        )}
        
        <div className="space-y-3 lg:space-y-4 mb-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isLoading && <TypingIndicator />}
        </div>
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input at bottom */}
      <div className="border-t border-gray-200 flex-shrink-0">
        <ChatInput
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          disabled={isLoading}
          waitingForName={waitingForName}
          currentTranscript={currentTranscript}
          isAutoVoiceMode={isAutoVoiceMode}
        />
      </div>
    </div>
  );
};
