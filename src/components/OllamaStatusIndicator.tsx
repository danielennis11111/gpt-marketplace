import React, { useState } from 'react';
import { useOllama } from '../hooks/useOllama';
import { useSettings } from '../contexts/SettingsContext';

/**
 * A simple indicator that shows AI provider connection status
 */
const OllamaStatusIndicator: React.FC = () => {
  const ollama = useOllama();
  const { settings } = useSettings();
  const [isStarting, setIsStarting] = useState(false);
  
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

  const handleStartOllama = async () => {
    setIsStarting(true);
    await ollama.startOllama();
    setTimeout(() => {
      setIsStarting(false);
    }, 5000);
  };
  
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
      
      {/* Show start button for Ollama when not connected */}
      {!statusInfo.isConnected && preferredProvider === 'ollama' && (
        <button
          onClick={handleStartOllama}
          disabled={isStarting}
          className={`ml-2 text-xs px-2 py-1 rounded ${
            isStarting 
              ? 'bg-gray-300 text-gray-700 cursor-wait' 
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {isStarting ? 'Starting...' : 'Start Ollama'}
        </button>
      )}
    </div>
  );
};

export default OllamaStatusIndicator; 