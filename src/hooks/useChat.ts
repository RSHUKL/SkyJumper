import { useState, useCallback, useRef } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { groqService } from '../services/groqService';
import type { Message, ChatState, BookingDetails } from '../types';

export function useChat(navigate: NavigateFunction) {  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isListening: false,
    isPlaying: false,
    error: null,
    userName: null,
    waitingForName: false,
    waitingForNameConfirmation: false,
    autoVoiceMode: false, // Changed to false by default so mic button is visible
    isInitialized: false,
    booking: null,
    pendingUserName: null
  });
  const messageIdCounter = useRef(0);
  const conversationHistory = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const isAutoVoiceInitialized = useRef(false);
  const isGeneralInitialized = useRef(false);

  const generateMessageId = () => `msg-${++messageIdCounter.current}`;

  const addMessage = useCallback((text: string, sender: 'user' | 'ai') => {
    const newMessage: Message = {
      id: generateMessageId(),
      text,
      sender,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    // Update conversation history for AI context
    conversationHistory.current.push({
      role: sender === 'user' ? 'user' : 'assistant',
      content: text
    });

    // Keep conversation history reasonable (last 20 messages)
    if (conversationHistory.current.length > 20) {
      conversationHistory.current = conversationHistory.current.slice(-20);
    }

    return newMessage;
  }, []);  // Enhanced helper to extract comprehensive booking information
  const extractBookingInfo = (userText: string, aiResponse: string): Partial<BookingDetails> => {
    const info: Partial<BookingDetails> = {};
    const combinedText = `${userText} ${aiResponse}`.toLowerCase();
    
    // Extract name patterns (more comprehensive)
    const namePatterns = [
      /(?:my name is|i'm|call me)\s+([a-zA-Z]+)/i,
      /(?:hi|hello),?\s*(?:i'm|i am)\s+([a-zA-Z]+)/i,
      /(?:this is|it's)\s+([a-zA-Z]+)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = userText.match(pattern) || aiResponse.match(pattern);
      if (match && match[1].length > 1) {
        info.name = match[1];
        break;
      }
    }
    
    // Extract phone number (various formats)
    const phonePatterns = [
      /(?:\+91[\s-]?)?([6-9]\d{9})/,
      /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/,
      /(\d{10})/
    ];
    
    for (const pattern of phonePatterns) {
      const match = combinedText.match(pattern);
      if (match) {
        info.phone = match[1].replace(/[-.\s]/g, '');
        break;
      }
    }
    
    // Extract event type
    if (/birthday/i.test(combinedText)) info.eventType = 'Birthday Party';
    else if (/kitty.*party/i.test(combinedText)) info.eventType = 'Kitty Party';
    else if (/corporate/i.test(combinedText)) info.eventType = 'Corporate Event';
    else if (/family.*outing/i.test(combinedText)) info.eventType = 'Family Outing';
    else if (/team.*building/i.test(combinedText)) info.eventType = 'Team Building';
    
    // Extract number of guests
    const guestPatterns = [
      /(\d+)\s*(?:people|guests|kids|children|adults|persons)/i,
      /(?:for|about)\s*(\d+)/i
    ];
    
    for (const pattern of guestPatterns) {
      const match = combinedText.match(pattern);
      if (match) {
        info.numberOfGuests = match[1];
        break;
      }
    }
    
    // Extract age group
    if (/kids?|children|3-12|under.*12/i.test(combinedText)) info.ageGroup = 'Kids (3-12 years)';
    else if (/teen|13-17|teenager/i.test(combinedText)) info.ageGroup = 'Teens (13-17 years)';
    else if (/adult|18\+|grown.*up/i.test(combinedText)) info.ageGroup = 'Adults (18+ years)';
    else if (/mixed|all.*age|family/i.test(combinedText)) info.ageGroup = 'Mixed Ages';
    
    // Extract location (check against our 20 locations)
    const locations = [
      'ambernath', 'amritsar', 'bangalore', 'bathinda', 'chennai', 'chandigarh',
      'delhi', 'faridabad', 'ghaziabad', 'gurugram', 'jalandhar', 'karnal',
      'lucknow', 'noida', 'pune'
    ];
    
    for (const location of locations) {
      if (combinedText.includes(location)) {
        info.location = location.charAt(0).toUpperCase() + location.slice(1);
        break;
      }
    }
    
    // Extract date
    const datePatterns = [
      /(?:on|for)\s*(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*)/i,
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
      /(tomorrow|next week|this weekend)/i
    ];
    
    for (const pattern of datePatterns) {
      const match = combinedText.match(pattern);
      if (match) {
        info.eventDate = match[1];
        break;
      }
    }
    
    // Extract time slot
    const timePatterns = [
      /(\d{1,2}:\d{2}\s*(?:am|pm)?\s*-?\s*\d{1,2}:\d{2}\s*(?:am|pm)?)/i,
      /(morning|afternoon|evening)/i,
      /(\d{1,2}\s*(?:am|pm))/i
    ];
    
    for (const pattern of timePatterns) {
      const match = combinedText.match(pattern);
      if (match) {
        info.timeSlot = match[1];
        break;
      }
    }
    
    // Extract theme
    const themes = ['superhero', 'princess', 'unicorn', 'sports', 'space', 'frozen', 'cars', 'avengers', 'bollywood'];
    for (const theme of themes) {
      if (combinedText.includes(theme)) {
        info.theme = theme.charAt(0).toUpperCase() + theme.slice(1);
        break;
      }
    }
    
    return info;
  };

  // Simple helper to detect booking completion
  const isBookingComplete = (aiResponse: string): boolean => {
    const indicators = [
      'booking confirmed',
      'confirmation pdf',
      'booking complete',
      'reservation confirmed',
      'pdf has been generated'
    ];
    return indicators.some(indicator => 
      aiResponse.toLowerCase().includes(indicator)
    );
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    addMessage(text.trim(), 'user');
    setState(prev => ({ ...prev, error: null, isLoading: true }));

    try {
      if (state.waitingForNameConfirmation && state.pendingUserName) {
        const confirmation = text.trim().toLowerCase();
        if (['yes', 'yeah', 'yep', 'correct', 'right'].includes(confirmation)) {
          const confirmedName = state.pendingUserName;
          setState(prev => ({
            ...prev,
            userName: confirmedName,
            waitingForNameConfirmation: false,
            pendingUserName: null,
            booking: {
              step: 'phone',
              data: { ...prev.booking?.data, name: confirmedName }
            }
          }));

          const responseText = `Great! Your name is ${confirmedName}. To proceed with the booking, could you please provide your phone number?`;
          addMessage(responseText, 'ai');
          conversationHistory.current.push({ role: 'assistant', content: responseText });

        } else {
          setState(prev => ({ ...prev, waitingForNameConfirmation: false, pendingUserName: null }));
          const responseText = "My apologies. Could you please spell out your name for me?";
          addMessage(responseText, 'ai');
          conversationHistory.current.push({ role: 'assistant', content: responseText });
        }
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const isFirstMessage = state.messages.length <= 1;
      const needsName = !state.userName;

      const response = await groqService.generateResponse(
        conversationHistory.current,
        3,
        state.userName,
        { isFirstMessage, needsName, expectingBooking: false }
      );

      const bookingInfo = extractBookingInfo(text.trim(), response);

      if (bookingInfo.name && !state.userName && !state.pendingUserName) {
        const newPendingName = bookingInfo.name;
        setState(prev => ({
          ...prev,
          pendingUserName: newPendingName,
          waitingForNameConfirmation: true
        }));
        const confirmationMsg = `I heard your name is ${bookingInfo.name}. Is the spelling correct?`;
        addMessage(confirmationMsg, 'ai');
        conversationHistory.current.push({ role: 'assistant', content: confirmationMsg });
      } else {
        addMessage(response, 'ai');
        setState(prev => ({
          ...prev,
          booking: {
            step: prev.booking?.step || 'name',
            data: { ...prev.booking?.data, ...bookingInfo }
          }
        }));

        if (isBookingComplete(response)) {
          setTimeout(() => {
            console.log('Booking completed, redirecting...');
            navigate('/login');
          }, 3000);
        }
      }

      setState(prev => ({ ...prev, isLoading: false }));

    } catch (error: unknown) {
      console.error('Chat error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get AI response'
      }));
    }
  }, [addMessage, state.messages.length, state.userName, state.waitingForNameConfirmation, state.pendingUserName, navigate]);

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      error: null,
      userName: null,
      waitingForName: false,
      waitingForNameConfirmation: false,
      pendingUserName: null,
      isInitialized: false,
      booking: null
    }));
    conversationHistory.current = [];
    isAutoVoiceInitialized.current = false;
  }, []);

  const setListening = useCallback((listening: boolean) => {
    setState(prev => ({ ...prev, isListening: listening }));
  }, []);

  const setPlaying = useCallback((playing: boolean) => {
    setState(prev => ({ ...prev, isPlaying: playing }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);  // Initialize auto voice conversation with AI
  const initializeAutoVoice = useCallback(() => {
    console.log('=== initializeAutoVoice called ===', {
      isAutoVoiceInitialized: isAutoVoiceInitialized.current,
      isInitialized: state.isInitialized,
      autoVoiceMode: state.autoVoiceMode
    });
    
    if (!isAutoVoiceInitialized.current && !state.isInitialized && state.autoVoiceMode) {
      isAutoVoiceInitialized.current = true;
      
      // Business-focused welcome message
      const welcomeMsg = "Hi! Welcome to SkyJumper — your spot for fun and adventure. I'm your booking assistant. Can I please have your name to get started?";
      
      console.log('Adding welcome message via initializeAutoVoice');
      addMessage(welcomeMsg, 'ai');
      setState(prev => ({ ...prev, isInitialized: true }));
      
      return welcomeMsg;
    } else {
      console.log('Skipping initializeAutoVoice - already initialized or wrong conditions');
    }
    return null;
  }, [addMessage, state.autoVoiceMode, state.isInitialized]);  // Initialize chat with default welcome message (regardless of auto voice mode)
  const initializeChat = useCallback(() => {
    console.log('=== initializeChat called ===', {
      isInitialized: state.isInitialized,
      isGeneralInitialized: isGeneralInitialized.current
    });
    
    if (!state.isInitialized && !isGeneralInitialized.current) {
      isGeneralInitialized.current = true;
      
      // Business-focused welcome message
      const welcomeMsg = "Hi! Welcome to SkyJumper — your spot for fun and adventure. I'm your booking assistant. Can I please have your name to get started?";
      
      console.log('Adding welcome message via initializeChat');
      addMessage(welcomeMsg, 'ai');
      setState(prev => ({ ...prev, isInitialized: true }));
      
      return welcomeMsg;
    } else {
      console.log('Skipping initializeChat - already initialized');
    }
    return null;
  }, [addMessage, state.isInitialized]);
  const toggleAutoVoiceMode = useCallback(() => {
    setState(prev => ({ ...prev, autoVoiceMode: !prev.autoVoiceMode }));
  }, []);

  const updateBookingField = useCallback((field: keyof BookingDetails, value: string) => {
    setState(prev => ({
      ...prev,
      booking: {
        step: prev.booking?.step || 'name',
        data: { ...prev.booking?.data, [field]: value }
      }
    }));
  }, []);
  return {
    ...state,
    sendMessage,
    clearMessages,
    setListening,
    setPlaying,
    clearError,
    initializeAutoVoice,
    initializeChat,
    toggleAutoVoiceMode,
    updateBookingField
  };
}
