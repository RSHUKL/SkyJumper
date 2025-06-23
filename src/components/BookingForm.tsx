import React from 'react';
import { User, Phone, Calendar, MapPin, Clock, Users, Palette, MessageSquare, CheckCircle } from 'lucide-react';
import type { BookingDetails } from '../types';

interface BookingFormProps {
  bookingData: Partial<BookingDetails>;
  onUpdateField: (field: keyof BookingDetails, value: string) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ bookingData, onUpdateField }) => {
  const fields = [
    {
      key: 'name' as keyof BookingDetails,
      label: 'Full Name',
      icon: User,
      placeholder: 'Enter your full name',
      required: true
    },
    {
      key: 'phone' as keyof BookingDetails,
      label: 'Phone Number',
      icon: Phone,
      placeholder: '+91 XXXXX XXXXX',
      required: true
    },
    {
      key: 'eventType' as keyof BookingDetails,
      label: 'Event Type',
      icon: Calendar,
      placeholder: 'Birthday Party, Kitty Party, Corporate...',
      required: true
    },
    {
      key: 'numberOfGuests' as keyof BookingDetails,
      label: 'Number of Guests',
      icon: Users,
      placeholder: 'How many people?',
      required: true
    },
    {
      key: 'ageGroup' as keyof BookingDetails,
      label: 'Age Group',
      icon: Users,
      placeholder: 'Kids, Teens, Adults, Mixed',
      required: false
    },
    {
      key: 'location' as keyof BookingDetails,
      label: 'Preferred Location',
      icon: MapPin,
      placeholder: 'Choose SkyJumper location',
      required: true
    },
    {
      key: 'eventDate' as keyof BookingDetails,
      label: 'Event Date',
      icon: Calendar,
      placeholder: 'DD/MM/YYYY or describe',
      required: true
    },
    {
      key: 'timeSlot' as keyof BookingDetails,
      label: 'Time Slot',
      icon: Clock,
      placeholder: '10:00 AM - 12:00 PM',
      required: true
    },
    {
      key: 'theme' as keyof BookingDetails,
      label: 'Theme Preference',
      icon: Palette,
      placeholder: 'Superhero, Princess, Sports...',
      required: false
    },
    {
      key: 'specialRequirements' as keyof BookingDetails,
      label: 'Special Requirements',
      icon: MessageSquare,
      placeholder: 'Any special requests or notes...',
      required: false
    }
  ];

  const getCompletionPercentage = () => {
    const requiredFields = fields.filter(f => f.required);
    const completedRequired = requiredFields.filter(f => bookingData[f.key]?.trim()).length;
    return Math.round((completedRequired / requiredFields.length) * 100);
  };

  const isFieldCompleted = (fieldKey: keyof BookingDetails) => {
    return bookingData[fieldKey]?.trim() ? true : false;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full lg:h-auto flex flex-col w-full">      {/* Header */}
      <div className="bg-gradient-to-r from-[#5e0aa1] to-[#f58220] p-4 lg:p-6 text-white flex-shrink-0">
        <h2 className="text-lg lg:text-2xl font-bold mb-1 lg:mb-2">Booking Details</h2>
        <p className="text-white/90 text-xs lg:text-sm">Information collected from our conversation</p>
        
        {/* Progress Bar */}
        <div className="mt-3 lg:mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs lg:text-sm font-medium">Completion Progress</span>
            <span className="text-xs lg:text-sm font-bold">{getCompletionPercentage()}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-1.5 lg:h-2">
            <div 
              className="bg-white h-1.5 lg:h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
        </div>
      </div>{/* Form Fields */}
      <div className="flex-1 p-4 lg:p-6 space-y-4 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-3 lg:gap-4">
          {fields.map((field) => {
            const Icon = field.icon;
            const isCompleted = isFieldCompleted(field.key);
            
            return (
              <div key={field.key} className="relative">
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 lg:pl-3 flex items-center pointer-events-none">
                    <Icon 
                      className={`h-4 w-4 lg:h-5 lg:w-5 transition-colors ${
                        isCompleted 
                          ? 'text-green-500' 
                          : bookingData[field.key] 
                            ? 'text-[#f58220]' 
                            : 'text-gray-400'
                      }`} 
                    />
                  </div>
                  
                  <input
                    type="text"
                    value={bookingData[field.key] || ''}
                    onChange={(e) => onUpdateField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className={`block w-full pl-8 lg:pl-10 pr-8 lg:pr-10 py-2 lg:py-3 border rounded-lg focus:ring-2 focus:ring-[#f58220] focus:border-transparent transition-all text-sm lg:text-base ${
                      isCompleted
                        ? 'border-green-300 bg-green-50'
                        : bookingData[field.key]
                          ? 'border-[#f58220] bg-orange-50'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  />
                  
                  {isCompleted && (
                    <div className="absolute inset-y-0 right-0 pr-2 lg:pr-3 flex items-center">
                      <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-500" />
                    </div>
                  )}
                </div>
                
                {/* Auto-fill indicator */}
                {bookingData[field.key] && (
                  <p className="mt-1 text-xs text-[#f58220] flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#f58220] rounded-full mr-1.5 animate-pulse"></span>
                    Auto-filled from conversation
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>      {/* Footer */}
      <div className="p-4 lg:p-6 bg-gray-50 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="text-xs lg:text-sm text-gray-600">
            <span className="font-medium">{fields.filter(f => isFieldCompleted(f.key)).length}</span>
            {' of '}
            <span className="font-medium">{fields.length}</span>
            {' fields completed'}
          </div>
          
          {getCompletionPercentage() === 100 && (
            <div className="flex items-center text-green-600 font-medium text-xs lg:text-sm">
              <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
              Ready to book!
            </div>
          )}
        </div>
        
        {getCompletionPercentage() >= 80 && (
          <button className="w-full mt-2 lg:mt-3 bg-gradient-to-r from-[#5e0aa1] to-[#f58220] text-white py-2.5 lg:py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm lg:text-base">
            Complete Booking
          </button>
        )}
      </div>
    </div>
  );
};
