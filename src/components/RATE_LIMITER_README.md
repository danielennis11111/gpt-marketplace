# Beta Land @ ASU - Rate Limiter Wrapper

**AI Adventure Playground - Explore cutting-edge AI capabilities**

This component recreates the [Beta Land @ ASU repository](https://github.com/danielennis11111/rate-limiter) as a local wrapper within the marketplace application.

## 🌟 Key Features

### 🎤 Voice Interaction
- **Speech-to-Text**: Natural voice input with real-time transcription using Web Speech API
- **Text-to-Speech**: AI responses spoken aloud with voice selection
- **Hands-free Operation**: Full conversation support through voice commands
- **Visual Feedback**: Recording and speaking status indicators

### 👁️ Visual Analysis Lab
- **Document Processing**: PDF processing with text extraction and analysis
- **Multi-format Support**: PNG, JPG, and PDF file analysis
- **Research Support**: Scientific imaging and academic document processing

### 📚 Extended Memory
- **Large Context Windows**: Process entire documents and books
- **Multi-document Synthesis**: Connect insights across multiple sources
- **Perfect Recall**: Maintain context across long conversations

### 🔬 Advanced AI Labs
- **11 Specialized Templates**: From General Assistant to Research Powerhouse
- **Multiple AI Models**: Optimized for different use cases (llama3.2:3b, llama3.1:8b)
- **Rate Limiting**: Built-in request management (15 requests per minute)
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
- **UI Components**: Custom shadcn/ui inspired components
- **Icons**: Lucide React
- **Voice Processing**: Web Speech API (SpeechRecognition & SpeechSynthesis)
- **Document Processing**: File upload support for PDFs and images
- **State Management**: React Hooks and Context
- **Rate Limiting**: Built-in 15 requests per minute with visual feedback

## 🚀 Usage

### Starting Your Adventure

1. **Navigate to Rate Limiter**: Click "Beta Land @ ASU" in the sidebar
2. **Choose Your Adventure**: Select from 11 specialized AI templates
3. **Begin Exploring**: Start conversations with voice, text, or document uploads

### Voice Interaction

1. **Enable Voice**: Click the microphone button to start voice input
2. **Speak Naturally**: Voice recognition will transcribe your speech
3. **Listen to Responses**: AI responses are automatically spoken aloud
4. **Control Playback**: Stop/start speech synthesis as needed

### Document Analysis

1. **Upload Files**: Use the upload button in the conversation interface
2. **Supported Formats**: PDF, PNG, JPG, JPEG files
3. **Analyze Content**: AI will process and understand your documents
4. **Ask Questions**: Query your documents with natural language

### Rate Limiting

- **15 requests per minute** maximum
- **Visual indicators** show remaining requests and reset time
- **Automatic blocking** when limit is reached
- **1-minute reset window** for request counter

## 🔧 Component Structure

```
RateLimiterWrapper/
├── ConversationTemplate interface - AI template definitions
├── Message interface - Chat message structure  
├── Conversation interface - Conversation management
├── Voice Features - Speech recognition and synthesis
├── File Upload - Document processing support
├── Rate Limiting - Request management and UI feedback
└── Template Selection - 11 specialized AI adventures
```

### Key Components

- **Template Cards**: Interactive selection of AI specializations
- **Conversation Interface**: Full-featured chat with voice and file support
- **Rate Limit Display**: Real-time status of request limits
- **Voice Controls**: Microphone and speaker toggle buttons
- **File Upload**: Drag-and-drop or click to upload documents
- **Sidebar History**: Recent conversations and template switching

## 🎓 Educational Use

Beta Land @ ASU is designed for educational exploration of AI capabilities:

- **Student Projects**: Integrate AI into coursework and research
- **Research Applications**: Use advanced reasoning for academic work
- **Learning AI**: Understand how different AI models work
- **Responsible AI**: Learn ethical considerations and best practices

## 🔒 Privacy & Security

- **Local Processing**: Voice recognition runs in the browser
- **No Data Storage**: Conversations are stored locally in component state
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **File Processing**: Client-side file handling for privacy

## 🚧 Future Enhancements

Based on the original repository roadmap:

- [ ] **Ollama Integration**: Connect to local AI models via API
- [ ] **Persistent Storage**: Save conversations across sessions
- [ ] **Enhanced Voice**: More voice options and languages
- [ ] **Collaborative Spaces**: Multi-user conversation support
- [ ] **Advanced Analysis**: Better document processing capabilities
- [ ] **Mobile App**: Dedicated mobile application

## 🤝 Contributing

To enhance the rate limiter wrapper:

1. **Add New Templates**: Modify the `conversationTemplates` array
2. **Improve Voice**: Enhance speech recognition accuracy
3. **Document Types**: Add support for more file formats
4. **UI Enhancements**: Improve the conversation interface
5. **Performance**: Optimize rendering and state management

## 📄 Integration Notes

This component integrates seamlessly with the existing marketplace:

- **Routing**: Available at `/rate-limiter` route
- **Navigation**: Added to main sidebar under "Beta Land @ ASU"
- **Styling**: Uses consistent Tailwind CSS and design system
- **Components**: Shares UI components with rest of application

---

**Welcome to Beta Land @ ASU - Where AI Adventure Begins! 🌟**

Based on the original repository: https://github.com/danielennis11111/rate-limiter 