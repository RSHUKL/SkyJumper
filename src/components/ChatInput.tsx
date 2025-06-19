import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { VoiceButton } from './VoiceButton';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  waitingForName?: boolean;
  userName?: string | null;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  disabled = false,
  waitingForName = false,
  userName = null
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  };

  const handleVoiceInput = (text: string) => {
    setMessage(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-end gap-2">
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={waitingForName ? 'Enter your name...' : 'Type your message...'}
            className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[44px] max-h-32"
            rows={1}
            disabled={isLoading || disabled}
          />
        </div>
        <VoiceButton
          onVoiceInput={handleVoiceInput}
          disabled={isLoading || disabled}
        />
        <button
          type="submit"
          disabled={
            isLoading || disabled || (waitingForName ? !message.trim() : !message.trim())
          }
          className={`p-2 rounded-full transition-colors ${
            isLoading || disabled || (waitingForName ? !message.trim() : !message.trim())
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'f58220 text-gray -600 hover:bg-orange-500 hover:text-white'
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