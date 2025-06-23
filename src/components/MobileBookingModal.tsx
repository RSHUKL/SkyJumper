import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { BookingForm } from './BookingForm';
import type { BookingDetails } from '../types';

interface MobileBookingModalProps {
  bookingData: Partial<BookingDetails>;
  onUpdateField: (field: keyof BookingDetails, value: string) => void;
}

export const MobileBookingModal: React.FC<MobileBookingModalProps> = ({ 
  bookingData, 
  onUpdateField 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getCompletionPercentage = () => {
    const requiredFields = ['name', 'phone', 'eventType', 'numberOfGuests', 'location', 'eventDate', 'timeSlot'];
    const completedRequired = requiredFields.filter(field => 
      bookingData[field as keyof BookingDetails]?.trim()
    ).length;
    return Math.round((completedRequired / requiredFields.length) * 100);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-[#5e0aa1] to-[#f58220] text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 group"
        >
          <div className="relative">
            <FileText className="w-6 h-6" />
            {/* Progress indicator */}
            {getCompletionPercentage() > 0 && (
              <div className="absolute -top-2 -right-2 bg-white text-[#5e0aa1] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {getCompletionPercentage()}%
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="absolute inset-x-0 bottom-0 top-16 bg-white rounded-t-3xl shadow-2xl transform transition-transform">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            {/* Form Content */}
            <div className="flex-1 overflow-hidden">
              <BookingForm
                bookingData={bookingData}
                onUpdateField={onUpdateField}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
