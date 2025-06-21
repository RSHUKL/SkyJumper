import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatHeader } from './components/ChatHeader';
import { MessageBubble } from './components/MessageBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { ChatInput } from './components/ChatInput';
import { ErrorMessage } from './components/ErrorMessage';
import { WelcomeMessage } from './components/WelcomeMessage';
import { useChat } from './hooks/useChat';
import { useVoice } from './hooks/useVoice';
import { groqService } from './services/groqService';

function App() {
  const navigate = useNavigate();
  const chat = useChat(navigate);
  const voice = useVoice();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages, chat.isLoading]);

  // Speak the latest AI message if voice is enabled
  useEffect(() => {
    if (
      chat.messages.length > 0 &&
      voice.settings.enabled &&
      voice.settings.autoPlay &&
      voice.isSynthesisSupported
    ) {
      const lastMsg = chat.messages[chat.messages.length - 1];
      if (lastMsg.sender === 'ai') {
        voice.speak(lastMsg.text);
      }
    }
  }, [chat.messages, voice.settings, voice.isSynthesisSupported, voice.speak]);

  const handleSendMessage = async (text: string) => {
    await chat.sendMessage(text);
    // Do NOT call voice.speak here; useEffect will handle it.
  };

  const handleToggleVoice = () => {
    if (voice.isSpeaking) {
      voice.stopSpeaking();
    }
    voice.updateSettings({ enabled: !voice.settings.enabled });
  };

  const showError = chat.error || voice.error;
  const errorMessage = chat.error || voice.error || '';

  const clearError = () => {
    chat.clearError();
    voice.clearError();
  };

  if (!groqService.isAvailable()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Setup Required</h2>
          <p className="text-gray-600 mb-4">
            Please set up your Groq API key to use the AI assistant.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-sm font-medium text-gray-700 mb-2">Steps:</p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Get an API key from <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Groq Console</a></li>
              <li>Create a <code className="bg-gray-200 px-1 rounded">.env</code> file</li>
              <li>Add <code className="bg-gray-200 px-1 rounded">VITE_GROQ_API_KEY=your_key_here</code></li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <ChatHeader 
          onClearChat={chat.clearMessages}
          voiceEnabled={voice.settings.enabled}
          onToggleVoice={handleToggleVoice}
        />
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {showError && (
              <ErrorMessage 
                message={errorMessage}
                onDismiss={clearError}
              />
            )}
            
            {chat.messages.length === 0 ? (
              <WelcomeMessage />
            ) : (
              <div className="space-y-4">
                {chat.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                
                {chat.isLoading && <TypingIndicator />}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={chat.isLoading}
          disabled={chat.isLoading}
          waitingForName={chat.waitingForName}
          userName={chat.userName}
        />
      </div>
    </div>
  );
}

export default App;