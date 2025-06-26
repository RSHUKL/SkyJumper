import { Settings, Volume2, VolumeX, Headphones, TestTube } from 'lucide-react';
import logo from '../assets/happy-web-logo.png'; // adjust path based on your file structure
import { speechService } from '../services/speechService';

interface ChatHeaderProps {
  onClearChat: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  autoVoiceMode?: boolean;
  onToggleAutoVoice?: () => void;
}

export function ChatHeader({ 
  onClearChat, 
  voiceEnabled, 
  onToggleVoice, 
  autoVoiceMode = false, 
  onToggleAutoVoice 
}: ChatHeaderProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-[#5e0aa1]/20 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4">
            <img 
              src={logo}
              alt="SkyJumper Logo" 
              className="h-16 w-16 drop-shadow-sm"
            />
            <div>
              <h1 className="text-[#5e0aa1] font-semibold mb-1">SkyJumper AI</h1>
              <p className="text-sm text-[#5e0aa1]/70">Conversational AI with voice support</p>
            </div>
          </div>
        </div>        <div className="flex items-center gap-3">
          {onToggleAutoVoice && (
            <button
              onClick={onToggleAutoVoice}
              className={`p-2.5 rounded-lg transition-all duration-200 shadow-sm ${
                autoVoiceMode 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-100 text-[#5e0aa1]/50 hover:bg-gray-200'
              }`}
              title={autoVoiceMode ? 'Disable auto voice conversation' : 'Enable auto voice conversation'}
            >
              <Headphones size={20} />
            </button>          )}

          {/* Test Speech Button - for debugging */}
          <button
            onClick={() => {
              console.log('Testing speech synthesis...');
              speechService.triggerUserInteraction();
              speechService.speak('This is a test of speech synthesis', {
                enabled: true,
                autoPlay: true,
                voice: null,
                rate: 0.7,
                pitch: 1,
                volume: 1,
                language: 'en-US'
              });
            }}
            className="p-2.5 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all duration-200 shadow-sm"
            title="Test speech synthesis"
          >
            <TestTube size={20} />
          </button>

          <button
            onClick={onToggleVoice}
            className={`p-2.5 rounded-lg transition-all duration-200 shadow-sm ${
              voiceEnabled 
                ? 'bg-[#1c4aff] text-white hover:bg-[#1c4aff]/90' 
                : 'bg-gray-100 text-[#5e0aa1]/50 hover:bg-gray-200'
            }`}
            title={voiceEnabled ? 'Disable voice responses' : 'Enable voice responses'}
          >
            {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          <button
            onClick={onClearChat}
            className="p-2.5 rounded-lg bg-[#f58220] text-white hover:bg-[#f58220]/90 transition-all duration-200 shadow-sm"
            title="Clear chat history"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}