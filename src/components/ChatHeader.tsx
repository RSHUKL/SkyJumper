import { Settings, Volume2, VolumeX } from 'lucide-react';
import logo from '../assets/happy-web-logo.png'; // adjust path based on your file structure

interface ChatHeaderProps {
  onClearChat: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

export function ChatHeader({ onClearChat, voiceEnabled, onToggleVoice }: ChatHeaderProps) {
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
        </div>

        <div className="flex items-center gap-3">
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