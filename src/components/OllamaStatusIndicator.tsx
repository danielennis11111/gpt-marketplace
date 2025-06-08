import React from 'react';
import { useOllama } from '../hooks/useOllama';
import { useSettings } from '../contexts/SettingsContext';

/**
 * A simple indicator that shows AI provider connection status
 */
const OllamaStatusIndicator: React.FC = () => {
  const ollama = useOllama();
  const { settings } = useSettings();
  
  // Check if Gemini is configured
  const hasGeminiApiKey = !!settings.geminiApiKey && settings.geminiApiKey.trim() !== '';
  const preferredProvider = settings.preferredChatProvider;
  
  // Determine which provider to show
  let statusInfo = {
    name: 'AI Provider',
    isConnected: false,
    details: ''
  };
  
  if (preferredProvider === 'gemini' && hasGeminiApiKey) {
    statusInfo = {
      name: 'Gemini',
      isConnected: true,
      details: '2.0 Flash'
    };
  } else if (preferredProvider === 'ollama' && ollama.status.isConnected) {
    statusInfo = {
      name: 'Ollama',
      isConnected: ollama.status.isConnected,
      details: ollama.status.currentModel || 'Connected'
    };
  } else if (ollama.status.isConnected) {
    statusInfo = {
      name: 'Ollama',
      isConnected: ollama.status.isConnected,
      details: ollama.status.currentModel || 'Connected'
    };
  }
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <div 
        className={`w-3 h-3 rounded-full ${
          statusInfo.isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span>
        {statusInfo.isConnected 
          ? `${statusInfo.name} Connected: ${statusInfo.details}` 
          : 'No AI Provider Connected'}
      </span>
    </div>
  );
};

export default OllamaStatusIndicator; 