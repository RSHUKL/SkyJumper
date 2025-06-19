<<<<<<< HEAD
# Skyjump-2.0
=======
# Conversational AI Assistant

A modern, production-ready conversational AI assistant built with React, TypeScript, and advanced voice processing capabilities.

## Features

### 🎤 Voice Processing
- **Web Speech API Integration**: Browser-based speech recognition
- **Whisper API Fallback**: High-quality transcription when browser STT is unavailable
- **Google Cloud TTS**: Premium voice synthesis with natural-sounding responses
- **Browser SpeechSynthesis Fallback**: Universal compatibility across devices
- **Real-time Audio Processing**: Optimized streaming and playback

### 🤖 AI Integration
- **Groq API**: Lightning-fast AI responses using Mixtral/LLaMA3 models
- **Conversation Context**: Maintains chat history for coherent exchanges
- **Error Handling**: Comprehensive retry logic and graceful fallbacks
- **Rate Limiting**: Built-in protection against API abuse

### 🎨 User Experience
- **Modern Interface**: Clean, responsive design with glassmorphism effects
- **Real-time Feedback**: Visual indicators for recording, processing, and playback states
- **Accessibility**: Full keyboard navigation and screen reader support
- **Mobile Optimized**: Touch-friendly interface with responsive breakpoints

### 🔒 Security & Performance
- **Environment Variables**: Secure API key management
- **Input Validation**: Sanitization and validation of all user inputs
- **Caching**: Optimized message storage and retrieval
- **Error Boundaries**: Graceful error handling throughout the application

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Groq API key ([Get one here](https://console.groq.com))

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Configure your API keys in `.env`**:
   ```env
   # Required
   VITE_GROQ_API_KEY=your_groq_api_key_here
   
   # Optional (for enhanced features)
   VITE_GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

### API Keys Setup

#### Groq API (Required)
1. Visit [Groq Console](https://console.groq.com)
2. Create an account and generate an API key
3. Add to `.env` as `VITE_GROQ_API_KEY`

#### Google Cloud TTS (Optional)
1. Enable the Text-to-Speech API in Google Cloud Console
2. Create an API key
3. Add to `.env` as `VITE_GOOGLE_CLOUD_API_KEY`

#### OpenAI Whisper (Optional)
1. Get an API key from [OpenAI Platform](https://platform.openai.com)
2. Add to `.env` as `VITE_OPENAI_API_KEY`

## Usage

### Basic Conversation
1. Type your message in the input field and press Enter
2. Or click the microphone button to use voice input
3. The AI will respond with both text and optional voice output

### Voice Features
- **Voice Input**: Click the microphone button to start recording
- **Voice Output**: Toggle voice responses using the speaker icon in the header
- **Voice Settings**: Customize voice parameters through the settings

### Keyboard Shortcuts
- `Enter`: Send message
- `Shift + Enter`: New line in message
- `Escape`: Stop current voice input/output

## Architecture

### Frontend Structure
```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── services/           # API integrations and external services
├── types/              # TypeScript type definitions
└── App.tsx            # Main application component
```

### Key Components
- **ChatInput**: Handles text and voice input with real-time feedback
- **MessageBubble**: Displays chat messages with timestamps
- **VoiceButton**: Manages voice recording states and controls
- **TypingIndicator**: Shows AI processing status

### Custom Hooks
- **useChat**: Manages conversation state and AI interactions
- **useVoice**: Handles voice recognition and synthesis
- **useGroq**: Manages AI API calls with retry logic

## Browser Compatibility

### Voice Recognition
- **Chrome/Edge**: Full Web Speech API support
- **Firefox**: Limited support, fallback to Whisper API recommended
- **Safari**: Partial support on macOS/iOS
- **Mobile**: Native support on modern browsers

### Voice Synthesis
- **All Modern Browsers**: Universal support via SpeechSynthesis API
- **Enhanced Quality**: Google Cloud TTS for premium voices

## Troubleshooting

### Common Issues

**"Speech recognition not supported"**
- Update your browser to the latest version
- Ensure microphone permissions are granted
- Try using Chrome/Edge for best compatibility

**"API key not found"**
- Verify `.env` file exists and contains the API key
- Restart the development server after adding keys
- Check that the key starts with `VITE_` prefix

**Voice not working**
- Check browser permissions for microphone access
- Verify voice synthesis is enabled in settings
- Try different voices from the voice selection

### Performance Issues
- **Slow responses**: Check your internet connection and API limits
- **Memory usage**: Clear chat history periodically for long conversations
- **Audio glitches**: Reduce voice synthesis rate/pitch if needed

## Development

### Testing
```bash
npm run test       # Run unit tests
npm run test:e2e   # Run end-to-end tests
```

### Building
```bash
npm run build      # Production build
npm run preview    # Preview production build
```

### Linting
```bash
npm run lint       # Check code quality
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the troubleshooting guide above
- Review browser compatibility requirements
- Verify API key configuration
- Test with different browsers/devices
>>>>>>> 259fcc8 (Initial commit: Fix booking flow, improve bot greeting, and ensure chat/voice work as expected)
