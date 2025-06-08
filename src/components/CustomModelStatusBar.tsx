import React from 'react';
import { useOllama } from '../hooks/useOllama';

/**
 * A simplified ModelStatusBar component that only shows Ollama status
 * This replaces the rate-limiter ModelStatusBar component that was causing errors
 */
const CustomModelStatusBar: React.FC = () => {
  const ollama = useOllama();
  
  return (
    <div className="flex items-center space-x-2">
      {/* Ollama Status */}
      <div className="flex items-center space-x-1">
        <div 
          className={`w-2 h-2 rounded-full ${
            ollama.status.isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-xs text-gray-700">
          {ollama.status.isConnected 
            ? `Ollama: ${ollama.status.currentModel || 'Connected'}` 
            : 'Ollama: Disconnected'}
        </span>
      </div>
    </div>
  );
};

export default CustomModelStatusBar; 