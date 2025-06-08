# 🔧 Environment Setup Guide

## Overview
This guide helps you set up all the required environment variables for ASU GPT Beta Land. The application supports three AI services:

1. **🦙 Llama Models** (Local Ollama)
2. **🧠 Google Gemini** (Cloud API)
3. **🤖 OpenAI GPT** (Cloud API)

## 📋 Required Environment Variables

Create a `.env` file in your project root with the following variables:

### 🔑 API Keys

```bash
# Google Gemini API Key (required for Gemini models)
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI API Key (required for GPT models)
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here

# Default model selection
REACT_APP_DEFAULT_MODEL=gemini-2.0-flash
```

## 🚀 Quick Setup

### 1. Copy Environment Template
```bash
cp env.example .env
```

### 2. Get Your API Keys

#### **Google Gemini API Key** 🧠
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Click "Get API Key"
3. Create a new project or select existing
4. Copy your API key
5. Add to `.env`: `REACT_APP_GEMINI_API_KEY=your_key_here`

#### **OpenAI API Key** 🤖
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Copy your API key
5. Add to `.env`: `REACT_APP_OPENAI_API_KEY=sk-your_key_here`

### 3. Install Ollama (for local models) 🦙
```bash
# macOS
brew install ollama

# Start Ollama service
ollama serve

# Pull required models
ollama pull llama3.2:3b
ollama pull llama3.1:8b
```

### 4. Start the Application
```bash
npm install
npm start
```

## 🤖 Available Models

### **OpenAI Models** (Cloud)
- **GPT-4o** - Most advanced multimodal model
- **GPT-4 Turbo** - Optimized for technical tasks
- **GPT-4o Mini** - Efficient and cost-effective
- **o1-Preview** - Advanced reasoning capabilities

### **Google Gemini Models** (Cloud)
- **Gemini 2.0 Flash** - Fast and capable
- **Gemini Grounded Search** - Web-connected research

### **Llama Models** (Local)
- **Llama 3.2:3b** - Fast, lightweight responses
- **Llama 3.1:8b** - More capable, slower responses

## 🔄 Smart AI Routing

The application automatically routes requests based on model ID:
- `gpt-*` or `o1-*` → OpenAI Service
- `gemini-*` → Google Gemini Service  
- `llama*` → Local Ollama Service

If a cloud service fails, it automatically falls back to Llama.

## ✅ Testing Your Setup

1. **Check Environment Variables**:
   ```bash
   node -e "console.log('Gemini:', !!process.env.REACT_APP_GEMINI_API_KEY)"
   node -e "console.log('OpenAI:', !!process.env.REACT_APP_OPENAI_API_KEY)"
   ```

2. **Test Ollama Connection**:
   ```bash
   curl http://localhost:11434/api/tags
   ```

3. **Test in Application**:
   - Visit `http://localhost:3000`
   - Try different conversation templates
   - Check browser console for connection logs

## 🛠️ Troubleshooting

### **Gemini API Issues**
- Ensure API key is valid and has proper permissions
- Check if you have available credits
- Verify the API key starts with `AIza`

### **OpenAI API Issues**
- Ensure API key is valid and active
- Check if you have available credits/billing set up
- Verify the API key starts with `sk-`

### **Ollama Issues**
- Ensure Ollama is running: `ollama serve`
- Check if models are installed: `ollama list`
- Restart Ollama service if needed

### **Environment Variable Issues**
- Ensure `.env` file is in project root
- Restart development server after changing `.env`
- Check that variables start with `REACT_APP_`

## 🎯 Production Deployment

For production deployments, set environment variables through your hosting platform:

### **Vercel**
```bash
vercel env add REACT_APP_GEMINI_API_KEY
vercel env add REACT_APP_OPENAI_API_KEY
```

### **Netlify**
Set in Site Settings → Environment Variables

### **Other Platforms**
Follow your platform's environment variable configuration guide.

## 🚨 Security Notes

- **Never commit API keys** to version control
- Use different API keys for development and production
- Monitor API usage and set spending limits
- Rotate API keys regularly for security

## 📞 Support

If you encounter issues:
1. Check browser console for error messages
2. Verify all environment variables are set correctly  
3. Test API connections individually
4. Check that all services are running (for Ollama)

---

🎉 **You're ready to use ASU GPT Beta Land with all three AI services!** 