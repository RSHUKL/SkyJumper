import { useState, useCallback, useRef } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { groqService } from '../services/groqService';
import type { Message, ChatState, BookingState, BookingStep, BookingDetails } from '../types';
import { generateBookingPDF } from '../services/pdfService';

const BOOKING_STEPS: BookingStep[] = ['location', 'name', 'phone', 'slotTime', 'bookingDate', 'done'];
const BOOKING_QUESTIONS: Record<BookingStep, string> = {
  location: "What is your preferred location for the booking? Kindly select one from the following options: Ambernath!, Amritsar!, Bangalore!, Bathinda!, Chennai!, Chandigarh!, Delhi!, Faridabad!, Ghaziabad!, Gurugram ILD!, Gurugram M3M Broadway!, Gurugram Ocus Medley!, Jalandhar!, Karnal!, Lucknow!, Noida Go Bananas!, Noida Spectrum!, Noida Wave!, Pune Amanora!, Pune Creaticity! ",
  name: "May I please have your full name to ensure the booking is registered correctly under your details?",
  phone: "Could you kindly share your phone number? This will help us contact you if needed and confirm your reservation.",
  slotTime: "What preferred slot time would you like to reserve for your visit? For example, 30 Min, 60 Min, 90 Min",
  bookingDate: "On which date would you like to schedule your visit? Kindly enter the date !",
  done: ''
};

export function useChat(navigate: NavigateFunction) {
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
          text: 'Your booking has been successfully confirmed. A confirmation PDF containing all the relevant details has been generated and downloaded for your reference. Thank you for choosing SkyJumper! for best experience log on to our website https://skyjumpertrampolinepark.com/',
          sender: 'ai',
          timestamp: new Date()
        };
        newMessages.push(botMsg);
        newConversationHistory.push({ role: 'assistant', content: botMsg.text });
        conversationHistory.current = newConversationHistory.slice(-20);
        
        // Redirect to login page
        setTimeout(() => navigate('/login'), 2000);

        return {
          ...prev,
          messages: newMessages,
          booking: null
        };
      }
    });
  }, [navigate]);

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
      const aiText = `Nice to meet you, ${name}! I'm here to ensure your SkyJumper experience is as seamless and enjoyable as possible. How may I assist you today in planning your visit or managing your booking?`;
      addMessage(aiText, 'ai');
      return { text: aiText };
    }

    // If first message and greeting, ask for name
    if (state.messages.length === 0 && isGreeting(text)) {
      addMessage(text.trim(), 'user');
      setState(prev => ({ ...prev, waitingForName: true }));
      const aiText = `Welcome to SkyJumper! your go-to destination for excitement and adventure. I'm your Assistant, your dedicated booking assistant, here to help you plan a memorable experience filled with trampolines, games, and high-energy activities. To get started, may I please have your name?`;
      addMessage(aiText, 'ai');
      return { text: aiText };
    }

    // If booking intent, start booking flow
    if (isBookingIntent(text)) {
      addMessage(text.trim(), 'user');
      addMessage(BOOKING_QUESTIONS['location'], 'ai');
      setState(prev => ({ ...prev, booking: { step: 'location', data: {} } }));
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