import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatHeader } from './components/ChatHeader';
import { MessageBubble } from './components/MessageBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { ChatInput } from './components/ChatInput';
import { ErrorMessage } from './components/ErrorMessage';
import { BookingForm } from './components/BookingForm';
import { useChat } from './hooks/useChat';
import { useVoice } from './hooks/useVoice';
import { groqService } from './services/groqService';
import type { BookingDetails } from './types';

function App() {
  const navigate = useNavigate();
  const chat = useChat(navigate);
  const voice = useVoice();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [chat.messages, chat.isLoading]);  // Initialize auto voice conversation on first load
  useEffect(() => {
    const initializeWithPermissions = async () => {
      if (!chat.isInitialized && chat.autoVoiceMode && voice.isSynthesisSupported && voice.isRecognitionSupported) {
        // Check microphone permissions first
        const hasPermission = await voice.checkMicrophonePermissions();
        if (!hasPermission) {
          // Try to request permissions
          const granted = await voice.requestMicrophonePermissions();
          if (!granted) {
            console.warn('Microphone permissions denied, auto voice mode may not work properly');
          }
        }
        
        const welcomeMessage = chat.initializeAutoVoice();
        if (welcomeMessage) {
          // Don't speak here - let the speaking useEffect handle it
        }
      }
    };
    
    initializeWithPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.isInitialized, chat.autoVoiceMode, voice.isSynthesisSupported, voice.isRecognitionSupported]);
  // Handle automatic voice flow: when bot finishes speaking, start listening
  useEffect(() => {
    if (chat.autoVoiceMode && !voice.isSpeaking && !voice.isListening && chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      
      // If the last message was from AI and we're not already listening, start continuous listening
      if (lastMessage.sender === 'ai' && voice.isRecognitionSupported) {
        voice.startContinuousListening({
          onResult: (transcript, isFinal) => {
            if (!isFinal) {
              setCurrentTranscript(transcript);
            }
          },
          onSilence: (transcript) => {
            if (transcript.trim()) {
              setCurrentTranscript('');
              handleSendMessage(transcript);
            }
          },
          onError: (error) => {
            console.error('Continuous listening error:', error);
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.autoVoiceMode, voice.isSpeaking, voice.isListening, chat.messages, voice.isRecognitionSupported]);// Speak the latest AI message if voice is enabled
  useEffect(() => {
    if (
      chat.messages.length > 0 &&
      voice.settings.enabled &&
      voice.settings.autoPlay &&
      voice.isSynthesisSupported
    ) {      const lastMsg = chat.messages[chat.messages.length - 1];
      if (lastMsg.sender === 'ai') {
        // Stop any ongoing listening when bot starts speaking
        if (voice.isListening) {
          voice.stopContinuousListening();
        }
        voice.speak(lastMsg.text);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.messages, voice.settings.enabled, voice.settings.autoPlay, voice.isSynthesisSupported]);
  const handleSendMessage = async (text: string) => {
    // Stop any ongoing listening when user sends a message
    if (voice.isListening) {
      voice.stopContinuousListening();
    }
    
    await chat.sendMessage(text);
    // Note: The useEffect will handle speaking the AI response
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

  const handleUpdateBookingField = (field: keyof BookingDetails, value: string) => {
    chat.updateBookingField(field, value);
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
      {/* Header */}
      <ChatHeader 
        onClearChat={chat.clearMessages}
        voiceEnabled={voice.settings.enabled}
        onToggleVoice={handleToggleVoice}
        autoVoiceMode={chat.autoVoiceMode}
        onToggleAutoVoice={chat.toggleAutoVoiceMode}
      />      {/* Main Content - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">        {/* Left Section - Chat (50% width on desktop) */}
        <div className="flex-1 lg:w-1/2 flex flex-col h-[60vh] lg:h-[calc(100vh-80px)]">
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {showError && (
              <ErrorMessage 
                message={errorMessage}
                onDismiss={clearError}
              />
            )}
            
            <div className="space-y-4 mb-4">
              {chat.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {chat.isLoading && <TypingIndicator />}
            </div>
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input at bottom of chat section */}
          <div className="border-t border-gray-200">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={chat.isLoading}
              disabled={chat.isLoading}
              waitingForName={chat.waitingForName}
              currentTranscript={currentTranscript}
              isAutoVoiceMode={chat.autoVoiceMode}
            />
          </div>
        </div>
          {/* Right Section - Booking Form (50% width on desktop) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col border-l border-gray-200 bg-white/50 h-[calc(100vh-80px)]">
          <div className="flex-1 w-full p-4 lg:p-6">
            <BookingForm
              bookingData={chat.booking?.data || {}}
              onUpdateField={handleUpdateBookingField}
            />
          </div>
        </div>
      </div>
        {/* Mobile: Bottom Booking Form (visible on small screens) */}
      <div className="lg:hidden border-t border-gray-200 bg-white h-[40vh] overflow-hidden">
        <div className="h-full w-full">
          <BookingForm
            bookingData={chat.booking?.data || {}}
            onUpdateField={handleUpdateBookingField}
          />        </div>
      </div>
    </div>
  );
}

export default App;