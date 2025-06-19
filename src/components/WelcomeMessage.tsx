import React from 'react';
import { Mic, MessageSquare, Zap } from 'lucide-react';

export function WelcomeMessage() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to SkyJumper Trampoline Park! 🎉</h2>
        <p className="text-gray-600 mb-4">
          I'm your virtual assistant, here to help you with information about our trampoline parks. You can ask me about:
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
          <li>Our locations and facilities</li>
          <li>Pricing and packages</li>
          <li>Safety guidelines</li>
          <li>Booking information</li>
          <li>General inquiries about trampoline parks</li>
        </ul>
        <p className="text-gray-600">
          Feel free to type your question or use the microphone button to speak. How can I help you today?
        </p>
      </div>
    </div>
  );
}