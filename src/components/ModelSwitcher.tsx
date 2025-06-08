import React, { useState } from 'react';
import { MODEL_LIMITS } from '../utils/rate-limiter/tokenCounter';

interface ModelSwitcherProps {
  currentModel?: string;
  onModelChange: (modelId: string) => void;
}

/**
 * Model Switcher Component
 * 
 * Allows users to switch between different AI models
 * Styled with ASU gold (#FFC627) and black text
 */
const ModelSwitcher: React.FC<ModelSwitcherProps> = ({ 
  currentModel = 'gpt-4o-mini', // Default to a known model if none provided
  onModelChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Group models by provider
  const modelGroups = {
    'OpenAI': [
      { id: 'gpt-4o', name: 'GPT-4o', status: 'online' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', status: 'online' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', status: 'online' },
    ],
    'Google': [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', status: 'online' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', status: 'online' },
    ],
    'Anthropic': [
      { id: 'claude-3.7-sonnet', name: 'Claude 3.7 Sonnet', status: 'online' },
      { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', status: 'online' },
      { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku', status: 'online' },
    ],
    'Local Models': [
      { id: 'llama4-scout', name: 'Llama 4 Scout', status: 'limited' },
      { id: 'llama3.2:3b', name: 'Llama 3.2 3B', status: 'online' },
      { id: 'llama3.1:8b', name: 'Llama 3.1 8B', status: 'online' },
      { id: 'mistral-7b', name: 'Mistral 7B', status: 'online' },
      { id: 'phi-3', name: 'Phi-3', status: 'limited' },
    ]
  };

  // Get model name from ID
  const getModelName = (modelId: string): string => {
    for (const group in modelGroups) {
      const model = modelGroups[group as keyof typeof modelGroups].find(m => m.id === modelId);
      if (model) return model.name;
    }
    return modelId;
  };

  // Get context window size for selected model
  const getContextWindow = (modelId: string): number => {
    return MODEL_LIMITS[modelId]?.contextWindow || 0;
  };

  // Get current model info
  const getCurrentModel = () => {
    for (const group in modelGroups) {
      const model = modelGroups[group as keyof typeof modelGroups].find(m => m.id === currentModel);
      if (model) return model;
    }
    return { id: currentModel, name: currentModel, status: 'unknown' };
  };

  // Get service logo
  const getServiceLogo = (modelId: string) => {
    if (modelId.includes('gpt')) return '🟢'; // OpenAI
    if (modelId.includes('gemini')) return '🔵'; // Google
    if (modelId.includes('claude')) return '🟣'; // Anthropic
    if (modelId.includes('llama') || modelId.includes('mistral') || modelId.includes('phi')) return '🟠'; // Local
    return '⚪';
  };

  // Get status color and indicator
  const getStatusIndicator = (status: string) => {
    switch(status) {
      case 'online': return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'limited': return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'offline': return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      default: return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  // Get model description
  const getModelDescription = (modelId: string): string => {
    const descriptions: Record<string, string> = {
      'gpt-4o': 'Advanced reasoning with multimodal capabilities',
      'gpt-4o-mini': 'Fast and cost-effective general tasks',
      'gpt-3.5-turbo': 'Reliable conversation and basic tasks',
      'gemini-2.0-flash': 'Ultra-fast responses with massive context',
      'gemini-1.5-pro': 'Research-grade analysis with huge context',
      'llama4-scout': 'Advanced local reasoning with massive context',
      'llama3.2:3b': 'Lightweight local model for basic tasks',
      'llama3.1:8b': 'Balanced local model with good capabilities',
      'mistral-7b': 'Open-source model with strong reasoning',
      'phi-3': 'Microsoft\'s compact but powerful model',
      'claude-3.7-sonnet': 'Balanced performance and thoughtfulness',
      'claude-3.5-sonnet': 'High quality responses with nuance',
      'claude-3.5-haiku': 'Fast and efficient text generation'
    };
    
    return descriptions[modelId] || 'General purpose AI assistant';
  };

  // Handle model selection
  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsOpen(false);
  };

  const currentModelInfo = getCurrentModel();

  return (
    <div className="relative">
      {/* Current model button - ASU Gold with black text */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-black bg-yellow-400 hover:bg-yellow-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-colors"
        style={{ backgroundColor: '#FFC627' }}
      >
        <div className="flex items-center">
          <div className="mr-2">{getServiceLogo(currentModel)}</div>
          <div className="flex flex-col items-start">
            <div className="flex items-center">
              <span className="font-medium">{getModelName(currentModel)}</span>
              <div className="ml-2 flex items-center">
                {getStatusIndicator(currentModelInfo.status)}
              </div>
            </div>
            <span className="text-xs">
              {getContextWindow(currentModel).toLocaleString()} tokens
            </span>
          </div>
        </div>
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-auto">
          {Object.entries(modelGroups).map(([groupName, models]) => (
            <div key={groupName} className="px-1 py-1">
              <div className="px-3 py-1 text-xs font-semibold text-gray-500">
                {groupName}
              </div>
              
              {models.map(model => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model.id)}
                  className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md ${
                    currentModel === model.id
                      ? 'bg-yellow-100 text-black'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">{getServiceLogo(model.id)}</div>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center">
                        <span className="font-medium">{model.name}</span>
                        <div className="ml-2 flex items-center">
                          {getStatusIndicator(model.status)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {getContextWindow(model.id).toLocaleString()} tokens
                      </span>
                      <span className="text-xs text-gray-500 mt-1 max-w-[250px] text-left">
                        {getModelDescription(model.id)}
                      </span>
                    </div>
                  </div>
                  
                  {currentModel === model.id && (
                    <svg className="w-5 h-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSwitcher; 