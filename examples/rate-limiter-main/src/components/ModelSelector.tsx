import React, { useState, useEffect } from 'react';
import { ConversationTemplate } from '../types/index';
import AIServiceRouter from '../services/AIServiceRouter';

interface ModelSelectorProps {
  template: ConversationTemplate;
  currentModel: string;
  onModelChange: (modelId: string) => void;
  isRateLimited?: boolean;
  rateLimitedModel?: string;
}

interface ModelStatus {
  id: string;
  name: string;
  status: 'available' | 'rate_limited' | 'offline' | 'checking';
  contextWindow: number;
  type: 'openai' | 'gemini' | 'llama';
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  template,
  currentModel,
  onModelChange,
  isRateLimited = false,
  rateLimitedModel
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [modelStatuses, setModelStatuses] = useState<ModelStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  // Define available models based on template
  const availableModels: ModelStatus[] = [
    // OpenAI Models
    { id: 'gpt-4o', name: 'GPT-4o', status: 'checking', contextWindow: 128000, type: 'openai' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', status: 'checking', contextWindow: 128000, type: 'openai' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', status: 'checking', contextWindow: 16385, type: 'openai' },
    
    // Gemini Models  
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', status: 'checking', contextWindow: 1000000, type: 'gemini' },
    
    // Llama Models (Local)
    { id: 'llama4-scout', name: 'Llama 4 Scout (CLI)', status: 'checking', contextWindow: 10485760, type: 'llama' },
    { id: 'llama4-maverick', name: 'Llama 4 Maverick (Ollama)', status: 'checking', contextWindow: 1048576, type: 'llama' },
    { id: 'llama3.2:3b', name: 'Llama 3.2 3B (Local)', status: 'checking', contextWindow: 131072, type: 'llama' },
    { id: 'llama3.1:8b', name: 'Llama 3.1 8B (Local)', status: 'checking', contextWindow: 131072, type: 'llama' }
  ];

  useEffect(() => {
    if (template.features.availableModels) {
      // Filter to only show models available for this template
      const filteredModels = availableModels.filter(model => 
        template.features.availableModels!.includes(model.id)
      );
      setModelStatuses(filteredModels);
      checkModelAvailability(filteredModels);
    } else {
      setModelStatuses(availableModels);
      checkModelAvailability(availableModels);
    }
  }, [template]);

  // Update rate limited status
  useEffect(() => {
    if (isRateLimited && rateLimitedModel) {
      setModelStatuses(prev => prev.map(model => 
        model.id === rateLimitedModel 
          ? { ...model, status: 'rate_limited' }
          : model
      ));
    }
  }, [isRateLimited, rateLimitedModel]);

  const checkModelAvailability = async (models: ModelStatus[]) => {
    setIsChecking(true);
    const aiRouter = new AIServiceRouter();
    
    try {
      const availability = await aiRouter.checkAvailability();
      
      setModelStatuses(prev => prev.map(model => {
        if (model.type === 'openai') {
          return { ...model, status: availability.openai ? 'available' : 'offline' };
        } else if (model.type === 'gemini') {
          return { ...model, status: availability.gemini ? 'available' : 'offline' };
        } else if (model.type === 'llama') {
          return { ...model, status: availability.llama ? 'available' : 'offline' };
        }
        return model;
      }));
    } catch (error) {
      console.error('Error checking model availability:', error);
      setModelStatuses(prev => prev.map(model => ({ ...model, status: 'offline' })));
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status: ModelStatus['status']) => {
    switch (status) {
      case 'available':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'rate_limited':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'offline':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'checking':
        return <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-300 rounded-full"></div>;
    }
  };

  const getStatusText = (status: ModelStatus['status']) => {
    switch (status) {
      case 'available': return 'Available';
      case 'rate_limited': return 'Rate Limited';
      case 'offline': return 'Offline';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  const formatContextWindow = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M tokens`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(0)}K tokens`;
    }
    return `${tokens} tokens`;
  };

  const currentModelInfo = modelStatuses.find(m => m.id === currentModel);

  return (
    <div className="relative">
      {/* Rate Limited Banner */}
      {isRateLimited && rateLimitedModel && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-yellow-800">
              <strong>{rateLimitedModel}</strong> hit rate limit. Switched to <strong>{currentModel}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Model Selector Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {getStatusIcon(currentModelInfo?.status || 'checking')}
          <div className="text-left">
            <div className="font-medium text-gray-900">
              {currentModelInfo?.name || currentModel}
            </div>
            <div className="text-sm text-gray-500">
              {formatContextWindow(currentModelInfo?.contextWindow || 128000)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isChecking && (
            <div className="w-4 h-4 border-2 border-[#FFC627] border-t-transparent rounded-full animate-spin"></div>
          )}
          <svg 
            className={`w-4 h-4 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Model List */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-2 space-y-1">
            {modelStatuses.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelChange(model.id);
                  setIsExpanded(false);
                }}
                disabled={model.status === 'offline'}
                className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${
                  model.id === currentModel
                    ? 'bg-[#FFC627] bg-opacity-20 text-[#191919]'
                    : model.status === 'offline'
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'hover:bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(model.status)}
                  <div className="text-left">
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatContextWindow(model.contextWindow)} • {getStatusText(model.status)}
                    </div>
                  </div>
                </div>
                
                {model.id === currentModel && (
                  <div className="w-4 h-4 text-[#FFC627]">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Refresh Button */}
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={() => checkModelAvailability(modelStatuses)}
              disabled={isChecking}
              className="w-full p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
            >
              {isChecking ? 'Checking...' : 'Refresh Status'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector; 