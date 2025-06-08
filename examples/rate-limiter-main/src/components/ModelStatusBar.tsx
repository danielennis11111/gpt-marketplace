import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Lightbulb } from 'lucide-react';
import { AIModel } from '../types/index';
import { LlamaService } from '../utils/llamaService';

interface ModelStatusBarProps {
  models: AIModel[];
  onRefresh?: () => void;
}

const ModelStatusBar: React.FC<ModelStatusBarProps> = ({ models, onRefresh }) => {
  const [llamaService] = useState(() => new LlamaService());
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const checkOllamaStatus = useCallback(async () => {
    setOllamaStatus('checking');
    try {
      const isRunning = await llamaService.isServerRunning();
      setOllamaStatus(isRunning ? 'online' : 'offline');
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      setOllamaStatus('offline');
    }
  }, [llamaService, onRefresh]);

  useEffect(() => {
    checkOllamaStatus();
    const interval = setInterval(checkOllamaStatus, 30000);
    return () => clearInterval(interval);
  }, [checkOllamaStatus]);

  const getStatusColor = (status: AIModel['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'loading': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getOllamaStatusColor = () => {
    switch (ollamaStatus) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'checking': return 'bg-yellow-500 animate-pulse';
      default: return 'bg-gray-500';
    }
  };

  const onlineCount = models.filter(m => m.status === 'online').length;
  const totalCount = models.length;

  return (
    <div className="flex items-center space-x-3">
      {/* Ollama Status */}
      <div className="flex items-center space-x-2">
        <div className="relative group">
          <div className={`w-3 h-3 rounded-full ${getOllamaStatusColor()}`} />
          
          {/* Ollama Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            Ollama Server - {ollamaStatus}
            {ollamaStatus === 'offline' && (
              <div className="text-xs text-gray-300 mt-1">
                Run: ollama serve
              </div>
            )}
            <div className="absolute top-full right-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900" />
          </div>
        </div>
        
        <div className="hidden sm:flex items-center space-x-2">
          <span className="text-sm text-gray-600">Ollama:</span>
          <span className={`text-sm font-medium ${
            ollamaStatus === 'online' ? 'text-green-600' : 
            ollamaStatus === 'checking' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {ollamaStatus}
          </span>
        </div>
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-gray-300" />
      
      {/* Models Status */}
      <div className="hidden sm:flex items-center space-x-2">
        <span className="text-sm text-gray-600">Models:</span>
        <span className="text-sm font-medium text-gray-900">
          {onlineCount}/{totalCount} online
        </span>
      </div>
      
      <div className="flex items-center space-x-1">
        {models.map((model) => (
          <div
            key={model.id}
            className="relative group"
            title={`${model.name} - ${model.status}`}
          >
            <div className={`w-3 h-3 rounded-full ${getStatusColor(model.status)}`} />
            
            {/* Model Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              {model.name} - {model.status}
              <div className="text-xs text-gray-300 mt-1">
                {model.capabilities.join(', ')}
              </div>
              {model.isMultimodal && (
                <div className="text-xs text-yellow-300 flex items-center">
            <Zap className="w-3 h-3 mr-1" />
            Multimodal
          </div>
              )}
              <div className="absolute top-full right-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900" />
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={checkOllamaStatus}
        className={`p-1 hover:bg-gray-100 rounded transition-colors ${
          ollamaStatus === 'checking' ? 'animate-spin' : ''
        }`}
        title="Refresh status"
        disabled={ollamaStatus === 'checking'}
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      {/* Quick Start Instructions for Offline State */}
      {ollamaStatus === 'offline' && (
        <div className="hidden lg:flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
          <Lightbulb className="w-3 h-3 mr-1" />
          Start Ollama: <code className="ml-1 bg-gray-200 px-1 rounded">ollama serve</code>
        </div>
      )}
    </div>
  );
};

export default ModelStatusBar; 