import { useState, useCallback, useRef } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { groqService } from '../services/groqService';
import type { Message, ChatState, BookingDetails } from '../types';

export function useChat(navigate: NavigateFunction) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isListening: false,
    isPlaying: false,
    error: null,
    userName: null,
    waitingForName: false,
    autoVoiceMode: false,
    isInitialized: false,
    booking: null
  });
  const stateRef = useRef(state);
  stateRef.current = state;
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

    conversationHistory.current.push({
      role: sender === 'user' ? 'user' : 'assistant',
      content: text
    });

    if (conversationHistory.current.length > 20) {
      conversationHistory.current = conversationHistory.current.slice(-20);
    }

    return newMessage;
  }, []);

  const extractBookingInfo = (userText: string, aiResponse: string): Partial<BookingDetails> => {
    const info: Partial<BookingDetails> = {};
    const combinedText = `${userText} ${aiResponse}`.toLowerCase();
    
    // Extract name patterns (now supports full names with spaces)
    const namePatterns = [
      /(?:my name is|i'm|call me)\s+([a-zA-Z][a-zA-Z ]+)/i,
      /(?:hi|hello),?\s*(?:i'm|i am)\s+([a-zA-Z][a-zA-Z ]+)/i,
      /(?:this is|it's)\s+([a-zA-Z][a-zA-Z ]+)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = userText.match(pattern) || aiResponse.match(pattern);
      if (match && match[1].length > 1) {
        info.name = match[1].trim();
        break;
      }
    }
    
    // Fallback: If the user just types their name (e.g., 'Rajat Shukla')
    if (!info.name && /^[A-Z][a-z]+( [A-Z][a-z]+)*$/.test(userText.trim())) {
      info.name = userText.trim();
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
    
    // Extract event type (only from userText, stricter matching)
    const eventTypePatterns = [
      { regex: /\bbirthday( party)?\b/i, value: 'Birthday Party' },
      { regex: /\bkitty( party)?\b/i, value: 'Kitty Party' },
      { regex: /\bcorporate( event)?\b/i, value: 'Corporate Event' },
      { regex: /\bfamily( outing)?\b/i, value: 'Family Outing' },
      { regex: /\bteam( building)?\b/i, value: 'Team Building' },
    ];
    for (const { regex, value } of eventTypePatterns) {
      if (regex.test(userText)) {
        info.eventType = value;
        break;
      }
    }
    
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
    
    // Fallback: if user input is just a number, treat as number of guests
    if (
      !info.numberOfGuests &&
      /^\d+$/.test(userText.trim()) &&
      // Only treat as guests if not a valid phone number (10 digits starting with 6-9)
      !/^[6-9]\d{9}$/.test(userText.trim())
    ) {
      info.numberOfGuests = userText.trim();
    }
    
    // Extract age group (only from userText, stricter matching)
    if (/kids?|children|3-12|under.*12/i.test(userText)) info.ageGroup = 'Kids (3-12 years)';
    else if (/teen|13-17|teenager/i.test(userText)) info.ageGroup = 'Teens (13-17 years)';
    else if (/adult|18\+|grown.*up/i.test(userText)) info.ageGroup = 'Adults (18+ years)';
    else if (/mixed|all.*age|family/i.test(userText)) info.ageGroup = 'Mixed Ages';
    
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

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      error: null,
      userName: null,
      waitingForName: false,
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
  }, []);

  const initializeAutoVoice = useCallback(() => {
    if (!isAutoVoiceInitialized.current && !state.isInitialized && state.autoVoiceMode) {
      isAutoVoiceInitialized.current = true;
      const welcomeMsg = "Hi! Welcome to SkyJumper — your spot for fun and adventure. I'm your booking assistant. Can I please have your name to get started?";
      addMessage(welcomeMsg, 'ai');
      setState(prev => ({ ...prev, isInitialized: true }));
      return welcomeMsg;
    }
    return null;
  }, [addMessage, state.autoVoiceMode, state.isInitialized]);

  const initializeChat = useCallback(() => {
    if (!state.isInitialized && !isGeneralInitialized.current) {
      isGeneralInitialized.current = true;
      const welcomeMsg = "Hi! Welcome to SkyJumper — your spot for fun and adventure. I'm your booking assistant. Can I please have your name to get started?";
      addMessage(welcomeMsg, 'ai');
      setState(prev => ({ ...prev, isInitialized: true }));
      return welcomeMsg;
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

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    addMessage(text.trim(), 'user');
    setState(prev => ({ ...prev, error: null, isLoading: true }));

    try {
      const isFirstMessage = state.messages.length <= 1;
      const needsName = !state.userName;

      const response = await groqService.generateResponse(
        conversationHistory.current,
        3,
        state.userName,
        { isFirstMessage, needsName, expectingBooking: false }
      );

      const bookingInfo = extractBookingInfo(text.trim(), response);

      addMessage(response, 'ai');
      setState(prev => ({
        ...prev,
        booking: {
          step: prev.booking?.step || 'name',
          data: { ...(prev.booking?.data || {}), ...bookingInfo }
        }
      }));

      // Prompt for next missing field in order
      if (bookingInfo.phone && !bookingInfo.eventType) {
        // Only add manual prompt if AI response did not already ask for event type
        const aiAskedEventType = /event type|what type of event|which event/i.test(response);
        if (!aiAskedEventType) {
          const nextPrompt = 'Thank you for sharing your phone number. What type of event would you like to book? (e.g., Birthday Party, Kitty Party, Corporate Event, etc.)';
          addMessage(nextPrompt, 'ai');
          conversationHistory.current.push({ role: 'assistant', content: nextPrompt });
        }
      } else if (bookingInfo.eventType && !bookingInfo.numberOfGuests) {
        // Only add manual prompt if AI response did not already ask for number of guests
        const aiAskedGuests = /number of guests|how many guests|guests are you expecting/i.test(response);
        if (!aiAskedGuests) {
          const nextPrompt = 'How many guests are you expecting for the event?';
          addMessage(nextPrompt, 'ai');
          conversationHistory.current.push({ role: 'assistant', content: nextPrompt });
        }
      } else if (bookingInfo.numberOfGuests && !bookingInfo.ageGroup) {
        // Only add manual prompt if AI response did not already ask for age group
        const aiAskedAgeGroup = /age group|what is the age|guests.*age/i.test(response);
        if (!aiAskedAgeGroup) {
          const nextPrompt = 'What is the age group of the guests? (e.g., Kids, Teens, Adults, Mixed)';
          addMessage(nextPrompt, 'ai');
          conversationHistory.current.push({ role: 'assistant', content: nextPrompt });
        }
      } else if (bookingInfo.ageGroup && !bookingInfo.location) {
        // Only add manual prompt if AI response did not already ask for location
        const aiAskedLocation = /location|which location|skyjumper location/i.test(response);
        if (!aiAskedLocation) {
          const nextPrompt = 'Which SkyJumper location would you prefer for your event?';
          addMessage(nextPrompt, 'ai');
          conversationHistory.current.push({ role: 'assistant', content: nextPrompt });
        }
      } else if (bookingInfo.location && !bookingInfo.eventDate) {
        // Only add manual prompt if AI response did not already ask for event date (stricter check)
        const aiAskedEventDate = /(date|when|which day|what day)[^\.!?]*[\?]/i.test(response);
        if (!aiAskedEventDate) {
          const nextPrompt = 'On which date would you like to book the event? (Please specify DD/MM/YYYY or describe)';
          addMessage(nextPrompt, 'ai');
          conversationHistory.current.push({ role: 'assistant', content: nextPrompt });
        }
      } else if (bookingInfo.eventDate && !bookingInfo.timeSlot) {
        // Only add manual prompt if AI response did not already ask for time slot
        const aiAskedTimeSlot = /time slot|what time|which time|when/i.test(response);
        if (!aiAskedTimeSlot) {
          const nextPrompt = 'What time slot do you prefer for your event? (e.g., 10:00 AM - 12:00 PM)';
          addMessage(nextPrompt, 'ai');
          conversationHistory.current.push({ role: 'assistant', content: nextPrompt });
        }
      } else if (bookingInfo.timeSlot && !bookingInfo.specialRequirements) {
        // Optionally ask for special requirements, or skip to confirmation
        const nextPrompt = 'Any special requirements or notes for your event? If not, just say "No".';
        addMessage(nextPrompt, 'ai');
        conversationHistory.current.push({ role: 'assistant', content: nextPrompt });
      } else if (bookingInfo.timeSlot) {
        // After timeSlot (and optionally specialRequirements), confirm booking
        const confirmPrompt = 'Thank you! Your booking details are complete. We will now confirm your booking.';
        addMessage(confirmPrompt, 'ai');
        conversationHistory.current.push({ role: 'assistant', content: confirmPrompt });
      }

      if (isBookingComplete(response)) {
        // Removed automatic clear and re-initialization to prevent repeating questions
        // setTimeout(() => {
        //   clearMessages();
        //   initializeChat();
        // }, 3000);
      }
    } catch (error: unknown) {
      console.error('Chat error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get AI response'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [addMessage, clearMessages, initializeChat, navigate]);

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
