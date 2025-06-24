import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatHeader } from './components/ChatHeader';
import { ChatContainer } from './components/ChatContainer';
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
    scrollToBottom();  }, [chat.messages, chat.isLoading]);

  // Chat initialization removed - will be triggered on textbox focus

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
  }, [chat.autoVoiceMode, voice.isSpeaking, voice.isListening, chat.messages, voice.isRecognitionSupported]);  // Consolidated speech logic - speak AI messages when conditions are met
  useEffect(() => {
    const hasUserInteracted = voice.hasUserInteracted();
    
    console.log('=== SPEECH LOGIC CHECK ===');
    console.log('Voice settings:', {
      messagesLength: chat.messages.length,
      voiceEnabled: voice.settings.enabled,
      autoPlay: voice.settings.autoPlay,
      synthSupported: voice.isSynthesisSupported,
      hasUserInteracted,
      isSpeaking: voice.isSpeaking
    });

    // Only proceed if we have messages and voice is properly configured
    if (
      chat.messages.length > 0 &&
      voice.settings.enabled &&
      voice.settings.autoPlay &&
      voice.isSynthesisSupported &&
      !voice.isSpeaking
    ) {
      const lastMsg = chat.messages[chat.messages.length - 1];
      console.log('Last message:', { sender: lastMsg.sender, text: lastMsg.text.substring(0, 50) });
      
      if (lastMsg.sender === 'ai') {
        if (hasUserInteracted) {
          console.log('✅ All conditions met - attempting to speak AI message');
          // Stop any ongoing listening before speaking
          if (voice.isListening) {
            voice.stopContinuousListening();
          }
          voice.speak(lastMsg.text);
        } else {
          console.log('⏳ Waiting for user interaction before speaking');
        }
      }
    }  }, [chat.messages, voice]);

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

  // Debug: Check speech service state on component mount
  useEffect(() => {
    console.log('=== SPEECH DEBUG INFO ===');
    console.log('Speech Service State:', {
      synthSupported: voice.isSynthesisSupported,
      voiceEnabled: voice.settings.enabled,
      autoPlay: voice.settings.autoPlay,
      hasUserInteracted: voice.hasUserInteracted(),
      messagesLength: chat.messages.length,
      firstMessage: chat.messages[0]?.text?.substring(0, 50) || 'No messages yet'
    });
    
    // Test if we can manually trigger speech after a delay
    setTimeout(() => {
      console.log('=== DELAYED SPEECH TEST ===');
      console.log('User interaction check:', voice.hasUserInteracted());
      if (voice.hasUserInteracted() && chat.messages.length > 0) {
        const firstAIMessage = chat.messages.find(msg => msg.sender === 'ai');
        if (firstAIMessage) {
          console.log('Manually triggering speech for welcome message');
          voice.speak(firstAIMessage.text);
        }
      }
    }, 2000);  }, [chat.messages, voice]);

  // Handle textbox focus - initialize chat and trigger speech
  const handleTextboxFocus = useCallback(() => {
    console.log('🎯 Textbox focused - checking if chat needs initialization');
    
    // Initialize chat if not already done
    if (!chat.isInitialized) {
      console.log('Initializing chat on textbox focus...');
      chat.initializeChat();
      
      // Trigger user interaction for speech
      voice.triggerUserInteraction();
      
      // Speak the welcome message after a short delay to ensure it's added to messages
      setTimeout(() => {
        if (chat.messages.length > 0 && voice.settings.enabled && voice.settings.autoPlay) {
          const welcomeMessage = chat.messages.find(msg => msg.sender === 'ai');
          if (welcomeMessage && !voice.isSpeaking) {
            console.log('🔊 Speaking welcome message on textbox focus');
            voice.speak(welcomeMessage.text);
          }
        }
      }, 100);
    } else {
      console.log('Chat already initialized, triggering user interaction only');
      voice.triggerUserInteraction();
    }
  }, [voice, chat]);

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
  }  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <ChatHeader 
        onClearChat={chat.clearMessages}
        voiceEnabled={voice.settings.enabled}
        onToggleVoice={handleToggleVoice}
        autoVoiceMode={chat.autoVoiceMode}
        onToggleAutoVoice={chat.toggleAutoVoiceMode}
      />      {/* Main Content - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Section - Chat (50% width on desktop) */}
        <div className="flex-1 lg:w-1/2 flex flex-col h-[60vh] lg:h-[calc(100vh-152px)]">
          <div className="flex-1 w-full p-4 lg:p-6 overflow-y-auto">            <ChatContainer
              messages={chat.messages}
              isLoading={chat.isLoading}
              onSendMessage={handleSendMessage}
              waitingForName={chat.waitingForName}
              currentTranscript={currentTranscript}
              isAutoVoiceMode={chat.autoVoiceMode}
              showError={!!showError}
              errorMessage={errorMessage}
              onDismissError={clearError}
              messagesEndRef={messagesEndRef}
              voiceEnabled={voice.settings.enabled}
              onTextboxFocus={handleTextboxFocus}
            />
          </div>
        </div>{/* Right Section - Booking Form (50% width on desktop) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col border-l border-gray-200 bg-white/50 h-[calc(100vh-152px)]">
          <div className="flex-1 w-full p-4 lg:p-6 overflow-y-auto">
            <BookingForm
              bookingData={chat.booking?.data || {}}
              onUpdateField={handleUpdateBookingField}
            />
          </div>
        </div>
      </div>
        {/* Mobile: Bottom Booking Form (visible on small screens) */}      <div className="lg:hidden border-t border-gray-200 bg-white h-[40vh] overflow-hidden">
        <div className="h-full w-full">
          <BookingForm
            bookingData={chat.booking?.data || {}}
            onUpdateField={handleUpdateBookingField}
          />        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4 px-6 text-center">
        <p className="text-sm">
          Developed by{' '}
          <a 
            href="https://www.exponentsolutions.ai/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#f58220] hover:text-orange-300 transition-colors duration-200 font-medium"
          >
            Exponent Solutions AI
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;