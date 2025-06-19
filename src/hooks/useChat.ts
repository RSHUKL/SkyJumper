import { useState, useCallback, useRef } from 'react';
import { groqService } from '../services/groqService';
import type { Message, ChatState, BookingState, BookingStep, BookingDetails } from '../types';
import { generateBookingPDF } from '../services/pdfService';

const BOOKING_STEPS: BookingStep[] = ['name', 'phone', 'email', 'slotTime', 'bookingDate', 'done'];
const BOOKING_QUESTIONS: Record<BookingStep, string> = {
  name: "What's your full name?",
  phone: "What's your phone number?",
  email: "What's your email address?",
  slotTime: "What slot time would you like to book? (e.g., 3:00 PM - 4:00 PM)",
  bookingDate: "For which date is the booking? (e.g., 2024-07-01)",
  done: ''
};

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isListening: false,
    isPlaying: false,
    error: null,
    userName: null,
    waitingForName: false,
    // Booking state
    booking: null as BookingState | null
  });

  const messageIdCounter = useRef(0);
  const conversationHistory = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const generateMessageId = () => `msg-${++messageIdCounter.current}`;

  // Helper: detect greeting
  const isGreeting = (text: string) => {
    const greetings = [
      'hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'yo', 'sup', 'hola', 'namaste'
    ];
    const normalized = text.trim().toLowerCase();
    return greetings.some(greet => normalized.startsWith(greet));
  };

  // Helper: detect booking intent
  const isBookingIntent = (text: string) => {
    const bookingWords = ['book', 'booking', 'reserve', 'reservation', 'slot', 'ticket'];
    const normalized = text.trim().toLowerCase();
    return bookingWords.some(word => normalized.includes(word));
  };

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
  }, []);

  // Booking flow handler
  const handleBookingStep = useCallback((text: string) => {
    setState(prev => {
      if (!prev.booking) return prev;
      const { step, data } = prev.booking;
      const nextData = { ...data };
      if (step !== 'done') nextData[step] = text.trim();
      const currentStepIdx = BOOKING_STEPS.indexOf(step);
      const nextStep = BOOKING_STEPS[currentStepIdx + 1];
      // Prepare new messages array
      let newMessages = [...prev.messages];
      let newConversationHistory = [...conversationHistory.current];
      // Add user message
      const userMsg: Message = {
        id: generateMessageId(),
        text: text.trim(),
        sender: 'user',
        timestamp: new Date()
      };
      newMessages.push(userMsg);
      newConversationHistory.push({ role: 'user', content: text.trim() });
      if (nextStep && nextStep !== 'done') {
        // Add bot question
        const botMsg: Message = {
          id: generateMessageId(),
          text: BOOKING_QUESTIONS[nextStep],
          sender: 'ai',
          timestamp: new Date()
        };
        newMessages.push(botMsg);
        newConversationHistory.push({ role: 'assistant', content: BOOKING_QUESTIONS[nextStep] });
        conversationHistory.current = newConversationHistory.slice(-20);
        return {
          ...prev,
          messages: newMessages,
          booking: { step: nextStep, data: nextData }
        };
      } else {
        // Booking complete
        // Generate PDF
        generateBookingPDF(nextData as BookingDetails);
        const botMsg: Message = {
          id: generateMessageId(),
          text: 'Your booking is confirmed! A confirmation PDF has been downloaded.',
          sender: 'ai',
          timestamp: new Date()
        };
        newMessages.push(botMsg);
        newConversationHistory.push({ role: 'assistant', content: botMsg.text });
        conversationHistory.current = newConversationHistory.slice(-20);
        return {
          ...prev,
          messages: newMessages,
          booking: null
        };
      }
    });
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return null;

    // If in booking flow, handle booking step
    if (state.booking) {
      handleBookingStep(text);
      return { text };
    }

    // If waiting for name, treat this message as the user's name
    if (state.waitingForName) {
      const name = text.trim();
      setState(prev => ({ ...prev, userName: name, waitingForName: false }));
      addMessage(name, 'user');
      const aiText = `Nice to meet you, ${name}! How can I help you today?`;
      addMessage(aiText, 'ai');
      return { text: aiText };
    }

// If first message and greeting, ask for name
if (state.messages.length === 0 && isGreeting(text)) {
  addMessage(text.trim(), 'user');
  setState(prev => ({ ...prev, waitingForName: true }));
  const aiText = `Hey there! Welcome to SkyJumper — the place where the fun never stops!
I’m Skippy, your bounce-tastic booking buddy, and I’m super excited to help you plan your next thrilling adventure.
We’ve got trampolines, games, and high-flying activities lined up just for you — but first things first!
What is your name?`;
  addMessage(aiText, 'ai');
  return { text: aiText };
}

    // If booking intent, start booking flow
    if (isBookingIntent(text)) {
      addMessage(text.trim(), 'user');
      addMessage(BOOKING_QUESTIONS['name'], 'ai');
      setState(prev => ({ ...prev, booking: { step: 'name', data: {} } }));
      return { text };
    }

    setState(prev => ({ ...prev, error: null }));
    // Add user message
    const userMessage = addMessage(text.trim(), 'user');
    // Show loading state
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // Generate AI response, pass userName for personalization
      const response = await groqService.generateResponse(conversationHistory.current, 3, state.userName);
      // Add AI message
      const aiMessage = addMessage(response, 'ai');
      setState(prev => ({ ...prev, isLoading: false }));
      return aiMessage;
    } catch (error: any) {
      console.error('Chat error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to get AI response'
      }));
      return null;
    }
  }, [addMessage, state.messages.length, state.waitingForName, state.userName, state.booking, handleBookingStep]);

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      error: null,
      userName: null,
      waitingForName: false,
      booking: null
    }));
    conversationHistory.current = [];
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

  return {
    ...state,
    sendMessage,
    clearMessages,
    setListening,
    setPlaying,
    clearError
  };
}