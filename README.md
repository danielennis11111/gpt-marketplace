# AI Marketplace 4.0

A modern AI marketplace application with enhanced RAG (Retrieval Augmented Generation) capabilities, supporting multiple AI providers including Ollama, Google Gemini, and Llama API.

## Features

### 🤖 Multi-Provider AI Support
- **Ollama** (Local models) - Run models locally with full privacy
- **Google Gemini** (Cloud) - Advanced vision, audio, and document processing  
- **Llama API** (Cloud) - High-performance language models with vision support

### 📁 Enhanced RAG File Upload
**Model-Aware File Processing** - File support varies based on your selected AI model:

#### Gemini 2.0 Flash (Most Comprehensive)
- **Documents**: PDF, TXT, MD, DOC, DOCX, RTF, ODT (50MB max)
- **Images**: JPG, JPEG, PNG, GIF, BMP, WEBP, SVG - *Vision processing with dimension analysis*
- **Audio**: MP3, WAV, OGG, FLAC, M4A, AAC - *Audio transcription and analysis*
- **Video**: MP4, AVI, MOV, MKV, WEBM - *Video content analysis*
- **Code**: JS, TS, PY, Java, C++, HTML, CSS, React/Vue/Svelte files
- **Data**: JSON, XML, CSV, YAML, TOML, INI - *Structured data parsing*

#### Gemini 1.5 Pro
- **Documents**: PDF, TXT, MD, DOC, DOCX, RTF (50MB max)
- **Images**: JPG, JPEG, PNG, GIF, BMP, WEBP - *Vision processing*
- **Video**: MP4, AVI, MOV, MKV - *Video analysis*
- **Code & Data**: Full support for code and structured data files

#### Gemini 1.5 Flash
- **Documents**: PDF, TXT, MD, DOC, DOCX (20MB max)
- **Images**: JPG, JPEG, PNG, GIF, WEBP - *Vision processing*
- **Code & Data**: JS, TS, PY, Java, HTML, CSS, JSON, CSV

#### Ollama Models (Local)
- **Documents**: PDF, TXT, MD, DOC, DOCX (10MB max)
- **Data**: JSON, CSV, XML, YAML - *Text-based processing only*

#### Llama Vision Models
- **Documents**: PDF, TXT, MD, DOC, DOCX (25MB max)
- **Images**: JPG, JPEG, PNG, GIF, WEBP - *Vision processing*
- **Code & Data**: Full support for programming files

### 🎯 Smart File Processing
- **Automatic Format Detection** - Files are processed based on their type and model capabilities
- **Vision Integration** - Images are converted to base64 with dimension analysis for vision models
- **Code Syntax Preservation** - Programming files maintain syntax highlighting and structure
- **Structured Data Parsing** - JSON/CSV files are formatted for optimal AI understanding
- **Size Validation** - File size limits enforced based on model capabilities
- **Intelligent Compression** - RAG documents compressed to fit model context windows

### 💬 Advanced Chat Features
- **Streaming Responses** - Real-time AI responses for supported models
- **Context Compression** - Intelligent conversation history management
- **File Download System** - Export AI responses in multiple formats (TXT, MD, JSON, PDF, etc.)
- **Voice Input** - Audio transcription for hands-free interaction
- **Token Management** - Real-time token usage tracking and optimization

### 🚀 Launch Pad & Community
- **AI Idea Generator** - Create custom AI assistants with intelligent title generation
- **Community Sharing** - Share ideas with export to GitHub integration
- **Template System** - Pre-built conversation templates
- **Settings Management** - Secure local storage of API keys and preferences

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Configure AI Providers**
   - Visit Settings page (`/settings`)
   - Add API keys for your preferred providers
   - Test connections to verify setup

4. **Upload Files for RAG**
   - Navigate to any chat interface
   - Click the upload button (shows supported formats based on your model)
   - Files are automatically processed and added to conversation context

## API Configuration

### Gemini API
1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add key in Settings → Google Gemini API
3. Select model: `gemini-2.0-flash` (recommended), `gemini-1.5-pro`, or `gemini-1.5-flash`

### Llama API  
1. Get your API key from [Llama API](https://api.llama.com)
2. Add key in Settings → Llama API
3. Select from available models including vision-capable variants

### Ollama (Local)
1. Install [Ollama](https://ollama.com)
2. Pull models: `ollama pull llama3.1` or `ollama pull llama3.2`
3. The app auto-detects running Ollama instances

## File Upload Examples

### Vision Processing (Gemini/Llama Vision Models)
```
Upload: screenshot.png (1920x1080)
→ AI can analyze images, read text, describe content
→ Base64 encoded with dimension metadata
```

### Code Analysis
```
Upload: components/App.tsx
→ Formatted with syntax highlighting
→ AI can explain, debug, or suggest improvements
```

### Data Processing
```
Upload: sales_data.csv
→ Parsed and formatted for analysis
→ AI can generate insights, create summaries
```

### Document Processing
```
Upload: research_paper.pdf
→ Text extracted and structured
→ AI can summarize, answer questions, find insights
```

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Heroicons
- **State Management**: React Context + Local Storage
- **File Processing**: Enhanced RAG processor with model-aware capabilities
- **AI Integration**: Direct API calls to Ollama, Gemini, and Llama services
- **Security**: Client-side encryption, local storage of sensitive data

## Technology Stack

- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Lucide React for icons
- Native browser APIs for file processing
- WebRTC for audio input
- Canvas API for image processing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Note**: This application runs entirely in the browser with no backend server. All API keys and data are stored locally in your browser's secure storage.
