# Beta aiLand - AI Marketplace

An interactive AI marketplace where users can explore, share, and refine AI concepts and prompts. 

## Features

- Browse community-contributed AI concepts and prompts
- Create and share your own AI prompts with guided templates
- "Hone In" feature to refine your ideas with AI assistance
- Connect to real AI models via Ollama (local) and Gemini (API)
- Settings for configuring your preferred AI provider

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- npm or yarn
- [Ollama](https://ollama.ai/) installed locally (for local AI model access)
- A Gemini API key (optional, for Google Gemini access)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/marketplace4.0.git
cd marketplace4.0
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start Ollama server (if using local models)
```bash
./start-ollama.sh
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Open the application in your browser
- The application will run at http://localhost:5173 (or another port if 5173 is in use)

### Setting Up AI Providers

#### Ollama (Local Models)
1. Install Ollama from [ollama.ai](https://ollama.ai/)
2. Run `./start-ollama.sh` to start the Ollama server
3. The app will automatically detect available models

#### Gemini (Google API)
1. Get a Gemini API key from [Google AI Studio](https://ai.google.dev/)
2. In the app, go to Settings and enter your Gemini API key
3. Select Gemini as your preferred provider

## Development

This project is built with:
- React
- TypeScript
- Vite
- TailwindCSS
- Various AI APIs

## License

MIT License
