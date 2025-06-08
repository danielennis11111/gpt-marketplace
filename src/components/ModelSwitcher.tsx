import React, { useState } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { MODEL_LIMITS } from '../utils/rate-limiter/tokenCounter';

interface ModelSwitcherProps {
  currentModel: string;
  onModelChange: (modelId: string) => void;
}

/**
 * Model Switcher Component
 * 
 * Allows users to switch between different AI models
 * Styled with ASU gold (#FFC627) and black text
 */
const ModelSwitcher: React.FC<ModelSwitcherProps> = ({ 
  currentModel, 
  onModelChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Group models by provider
  const modelGroups = {
    'OpenAI': [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ],
    'Google': [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    ],
    'Anthropic': [
      { id: 'claude-3.7-sonnet', name: 'Claude 3.7 Sonnet' },
      { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
      { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku' },
    ],
    'Local Models': [
      { id: 'llama4-scout', name: 'Llama 4 Scout' },
      { id: 'llama3.2:3b', name: 'Llama 3.2 3B' },
      { id: 'llama3.1:8b', name: 'Llama 3.1 8B' },
      { id: 'mistral-7b', name: 'Mistral 7B' },
      { id: 'phi-3', name: 'Phi-3' },
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

  // Handle model selection
  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Current model button - ASU Gold with black text */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-black bg-yellow-400 hover:bg-yellow-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-colors"
        style={{ backgroundColor: '#FFC627' }}
      >
        <div className="flex items-center">
          <span className="font-medium">{getModelName(currentModel)}</span>
          <span className="ml-2 text-xs">
            ({getContextWindow(currentModel).toLocaleString()} tokens)
          </span>
        </div>
        <ChevronDownIcon className="w-5 h-5" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-auto">
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
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-gray-500">
                      Context: {getContextWindow(model.id).toLocaleString()} tokens
                    </span>
                  </div>
                  
                  {currentModel === model.id && (
                    <CheckIcon className="w-5 h-5 text-yellow-600" />
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