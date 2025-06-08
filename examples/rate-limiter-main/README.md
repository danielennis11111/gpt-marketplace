# Beta Land @ ASU 🚀

**AI Adventure Playground - Explore cutting-edge AI capabilities**

Beta Land @ ASU is an interactive AI exploration platform that transforms traditional AI chat interfaces into an engaging adventure playground. Built for students, researchers, and AI enthusiasts to discover and experiment with advanced AI features.

## 🌟 Key Features

### 🎤 Voice Interaction
- **Speech-to-Text**: Natural voice input with real-time transcription
- **Text-to-Speech**: AI responses spoken aloud with voice selection
- **Hands-free Operation**: Full conversation support through voice commands
- **Visual Feedback**: Recording and speaking status indicators

### 👁️ Visual Analysis Lab
- **Image Processing**: Upload and analyze images, charts, and diagrams
- **Document Analysis**: PDF processing with text extraction and analysis
- **Research Support**: Scientific imaging and academic document processing
- **Multi-format Support**: PNG, JPG, and PDF file analysis

### 📚 Extended Memory
- **Large Context Windows**: Process entire documents and books
- **Multi-document Synthesis**: Connect insights across multiple sources
- **Research Compilation**: Handle thesis-length documents
- **Perfect Recall**: Maintain context across long conversations

### 🔬 Advanced AI Labs
- **11 Specialized Templates**: From General Assistant to Research Powerhouse
- **Multiple AI Models**: Optimized for different use cases
- **Rate Limiting**: Built-in request management and optimization
- **Context Optimization**: Intelligent memory management

## 🎯 AI Adventure Templates

1. **General Assistant** - Your starting point for AI exploration
2. **Creative Writing Lab** - Advanced storytelling and content generation
3. **Programming Mentor** - Learn coding with expert AI guidance
4. **Study Companion** - Adaptive learning partner for academic success
5. **Visual Analysis Lab** - Explore image and document processing
6. **Productivity Lab** - Optimize workflows and develop productive habits
7. **Long Context Explorer** - Analyze massive documents and research
8. **Advanced AI Lab** - Experience cutting-edge AI capabilities
9. **AI Safety Workshop** - Learn responsible AI use and ethics
10. **Research Lab** - Advanced methodology and data analysis
11. **Visual Intelligence Center** - Professional visual analysis

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **AI Integration**: Ollama (local AI models)
- **Voice Processing**: Web Speech API (SpeechRecognition & SpeechSynthesis)
- **Document Processing**: PDF.js for text extraction
- **State Management**: React Hooks and Context
- **Mobile Support**: Responsive design with mobile-first approach

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Ollama installed and running
- Modern web browser with Speech API support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd beta-land-asu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Ollama service**
   ```bash
   ollama serve
   ```

4. **Pull required AI models**
   ```bash
   ollama pull llama3.2:3b
   ollama pull llama3.1:8b
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open Beta Land @ ASU**
   - Navigate to `http://localhost:3000/rate-limiter`
   - Begin your AI adventure!

## 🎮 How to Use

### Starting Your Adventure
1. **Launch Beta Land**: Open the application in your browser
2. **Choose Your Adventure**: Select from 11 specialized AI templates
3. **Begin Exploring**: Start conversations with voice, text, or document uploads

### Voice Interaction
1. **Enable Voice**: Click the microphone button to start voice input
2. **Speak Naturally**: Voice recognition will transcribe your speech
3. **Listen to Responses**: AI responses are automatically spoken aloud
4. **Control Playback**: Stop/start speech synthesis as needed

### Document Analysis
1. **Upload PDFs**: Use the document upload section in any conversation
2. **Analyze Content**: AI will process and understand your documents
3. **Ask Questions**: Query your documents with natural language
4. **Extract Insights**: Get summaries, analysis, and research support

### Advanced Features
- **Rate Limiting**: Built-in protection (15 requests per minute)
- **Context Management**: Automatic optimization for long conversations
- **Mobile Support**: Full functionality on phones and tablets
- **Template Switching**: Change AI personalities and capabilities

## 🔧 Configuration

### Voice Settings
- Modify voice selection in `ConversationView.tsx`
- Adjust speech rate, pitch, and volume
- Configure language and accent preferences

### AI Models
- Add new models in `src/data/conversationTemplates.ts`
- Configure model parameters (temperature, tokens, etc.)
- Set up custom system prompts and capabilities

### UI Customization
- Update branding in `ConversationHub.tsx`
- Modify color schemes in Tailwind classes
- Customize template icons and descriptions

## 🧪 Development

### Project Structure
```
src/
├── components/          # React components
├── services/           # AI and conversation management
├── types/              # TypeScript interfaces
├── utils/              # Utility functions
├── data/               # Templates and mock data
└── App.tsx             # Main application
```

### Key Components
- `ConversationHub.tsx` - Main interface and layout
- `ConversationView.tsx` - Chat interface with voice features
- `TemplateSelector.tsx` - AI adventure selection
- `ConversationSidebar.tsx` - Navigation and conversation history

### Adding New Features
1. **New AI Template**: Add to `conversationTemplates.ts`
2. **Voice Enhancement**: Modify voice handlers in `ConversationView.tsx`
3. **Document Types**: Extend PDF processor for new formats
4. **UI Components**: Follow existing component patterns

## 🎓 Educational Use

Beta Land @ ASU is designed for educational exploration of AI capabilities:

- **Student Projects**: Integrate AI into coursework and research
- **Research Applications**: Use advanced reasoning for academic work
- **Learning AI**: Understand how different AI models work
- **Responsible AI**: Learn ethical considerations and best practices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Additional AI model integrations
- [ ] Enhanced voice processing features
- [ ] Collaborative conversation spaces
- [ ] Advanced document analysis
- [ ] Mobile app development
- [ ] API integration capabilities

---

**Welcome to Beta Land @ ASU - Where AI Adventure Begins! 🌟**
