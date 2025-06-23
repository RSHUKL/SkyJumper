import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { VoiceButton } from './VoiceButton';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  waitingForName?: boolean;
  currentTranscript?: string;
  isAutoVoiceMode?: boolean;
  onTextboxFocus?: () => void; // Add callback for when textbox is focused
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  disabled = false,
  waitingForName = false,
  currentTranscript = '',
  isAutoVoiceMode = false,
  onTextboxFocus
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };  const handleVoiceInput = (text: string) => {
    setMessage(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
      {/* Show listening indicator and current transcript in auto voice mode */}
      {isAutoVoiceMode && currentTranscript && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700">Listening...</span>
          </div>
          <p className="text-sm text-blue-600 italic">"{currentTranscript}"</p>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onTextboxFocus} // Call the onTextboxFocus prop when the textarea is focused
            placeholder={
              isAutoVoiceMode 
                ? (waitingForName ? 'Listening for your name...' : 'Listening for your message...') 
                : (waitingForName ? 'Enter your name...' : 'Type your message...')
            }
            className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[44px] max-h-32"
            rows={1}
            disabled={isLoading || disabled}
          />
        </div>
        {!isAutoVoiceMode && (
          <VoiceButton
            onVoiceInput={handleVoiceInput}
            disabled={isLoading || disabled}
          />
        )}
        <button
          type="submit"
          disabled={
            isLoading || disabled || (waitingForName ? !message.trim() : !message.trim())
          }
          className={`p-2 rounded-full transition-colors ${
            isLoading || disabled || (waitingForName ? !message.trim() : !message.trim())
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#f58220] text-gray-600 hover:bg-orange-500 hover:text-white'
          }`}
          title={waitingForName ? (!message.trim() ? 'Enter your name first' : 'Send name') : (!message.trim() ? 'Type a message first' : 'Send message')}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
};