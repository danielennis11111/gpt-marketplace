import React, { useState } from 'react';
import { ChevronDown, Cpu, Check, DollarSign, Gauge, BookOpen, Zap, Brain, Globe, Lock, Bug } from 'lucide-react';
import { MODEL_LIMITS } from '../utils/rate-limiter/tokenCounter';

interface ModelSwitcherProps {
  currentModel?: string;
  onModelChange: (modelId: string) => void;
  compact?: boolean;
  provider?: 'openai' | 'gemini' | 'ollama' | 'anthropic' | 'llama';
  availableModels?: any[]; // Add available models prop
}

interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  contextWindow: number;
  costEstimate: 'free' | 'low' | 'medium' | 'high';
  tags: string[];
  status?: string;
  provider?: string;
}

/**
 * Model Switcher Component
 * 
 * Allows users to switch between different AI models
 * Clean, modern design with detailed model information
 */
const ModelSwitcher: React.FC<ModelSwitcherProps> = ({ 
  currentModel = 'gpt-4o-mini',
  onModelChange,
  compact = false,
  provider,
  availableModels = [] // Default to empty array
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Define model information with context window sizes and cost estimates
  const modelInfoMap: Record<string, ModelInfo> = {
    // Gemini models
    'gemini-flash': {
      id: 'gemini-flash',
      name: 'Gemini 2.0 Flash',
      description: 'Google\'s fastest model - excellent for most tasks',
      contextWindow: 1000000,
      costEstimate: 'low',
      tags: ['fast', 'multimodal', 'vision']
    },
    'gemini-pro': {
      id: 'gemini-pro',
      name: 'Gemini 2.0 Pro',
      description: 'Google\'s balanced model - high quality with good speed',
      contextWindow: 1000000,
      costEstimate: 'medium',
      tags: ['balanced', 'reasoning', 'multimodal']
    },
    'gemini-ultra': {
      id: 'gemini-ultra',
      name: 'Gemini 2.0 Ultra',
      description: 'Google\'s most advanced model - high-end reasoning',
      contextWindow: 1000000, 
      costEstimate: 'high',
      tags: ['premium', 'reasoning', 'multimodal']
    },
    
    // Llama models - Meta's real model IDs
    'meta/llama-3-70b-instruct': {
      id: 'meta/llama-3-70b-instruct',
      name: 'Llama 3 70B',
      description: 'Meta\'s most powerful model - excellent reasoning',
      contextWindow: 128000,
      costEstimate: 'medium',
      tags: ['reasoning', 'instruction-tuned']
    },
    'meta/llama-3-8b-instruct': {
      id: 'meta/llama-3-8b-instruct',
      name: 'Llama 3 8B',
      description: 'Fast and efficient model from Meta',
      contextWindow: 128000,
      costEstimate: 'low',
      tags: ['fast', 'efficient']
    },
    'meta/llama-3.1-70b-instruct': {
      id: 'meta/llama-3.1-70b-instruct',
      name: 'Llama 3.1 70B',
      description: 'Meta\'s latest powerful model with excellent reasoning',
      contextWindow: 128000,
      costEstimate: 'medium',
      tags: ['reasoning', 'instruction-tuned']
    },
    'meta/llama-3.1-8b-instruct': {
      id: 'meta/llama-3.1-8b-instruct',
      name: 'Llama 3.1 8B',
      description: 'Latest fast and efficient model from Meta',
      contextWindow: 128000,
      costEstimate: 'low',
      tags: ['fast', 'efficient']
    },
    
    // Ollama local models
    'ollama-local': {
      id: 'ollama-local',
      name: 'Ollama (Local)',
      description: 'Runs models locally on your machine',
      contextWindow: 8192,
      costEstimate: 'free',
      tags: ['privacy', 'offline', 'local']
    }
  };

  // Map available models to include full details
  const enhanceModels = (models: any[]) => {
    return models.map(model => {
      // Check if model has llama prefix but doesn't match exactly with our pre-defined models
      const isLlamaModel = model.id.includes('llama') || model.provider === 'llama';
      
      // If it's a Llama model not in our predefined list, create a custom model info
      if (isLlamaModel && !modelInfoMap[model.id]) {
        return {
          id: model.id,
          name: model.name || `Llama ${model.id.split('/').pop()}`,
          description: model.description || 'Meta Llama model',
          contextWindow: model.maxContextLength || 128000,
          costEstimate: 'medium',
          tags: model.capabilities || ['instruction-tuned'],
          provider: 'llama',
          status: model.isConnected ? 'online' : 'offline',
          version: model.version || '3'
        };
      }
      
      // For other models, use the predefined info or fallback
      const baseInfo = modelInfoMap[model.id] || {
        id: model.id,
        name: model.name || model.id,
        description: model.description || `Model ${model.id}`,
        contextWindow: model.maxContextLength || 8192,
        costEstimate: model.provider === 'ollama' ? 'free' : 'medium',
        tags: model.capabilities || []
      };
      
      return {
        ...baseInfo,
        ...model,
        provider: model.provider || 'unknown',
        status: model.isConnected ? 'online' : 'offline'
      };
    });
  };

  // Use the availableModels if provided, otherwise fall back to the hardcoded groups
  const getModelGroups = () => {
    if (availableModels && availableModels.length > 0) {
      // Group the available models by provider
      const groups: Record<string, any[]> = {};
      const enhancedModels = enhanceModels(availableModels);
      
      enhancedModels.forEach(model => {
        const providerName = model.provider ? (
          model.provider === 'gemini' ? 'Google Gemini' :
          model.provider === 'ollama' ? 'Local Models' :
          model.provider === 'anthropic' ? 'Anthropic' :
          model.provider === 'llama' ? 'Meta Llama' : 'OpenAI'
        ) : 'Other Models';
        
        if (!groups[providerName]) {
          groups[providerName] = [];
        }
        
        groups[providerName].push(model);
      });
      
      return groups;
    }
    
    // Fallback to hardcoded groups
    return {
      'Google Gemini': [
        modelInfoMap['gemini-flash'],
        modelInfoMap['gemini-pro'],
        modelInfoMap['gemini-ultra']
      ],
      'Meta Llama': [
        modelInfoMap['meta/llama-3-70b-instruct'],
        modelInfoMap['meta/llama-3-8b-instruct'],
        modelInfoMap['meta/llama-3.1-70b-instruct'],
        modelInfoMap['meta/llama-3.1-8b-instruct']
      ],
      'Local Models': [
        modelInfoMap['ollama-local']
      ]
    };
  };

  // Get all model groups
  const allModelGroups = getModelGroups();

  // Filter model groups based on the current provider
  const getFilteredModelGroups = () => {
    // Always return all models, ignoring the provider filter
    return allModelGroups;
  };
  
  // Use all model groups regardless of provider
  const modelGroups = allModelGroups;

  // Helper function to format context window size nicely
  const formatContextWindow = (size: number): string => {
    if (size >= 1000000) {
      return `${size / 1000000}M tokens`;
    } else if (size >= 1000) {
      return `${size / 1000}K tokens`;
    }
    return `${size} tokens`;
  };

  // Helper function to render cost indicator
  const renderCostIndicator = (cost: string) => {
    switch (cost) {
      case 'free':
        return <span className="text-green-500 flex items-center"><DollarSign className="h-3 w-3 mr-1" />Free</span>;
      case 'low':
        return <span className="text-blue-500 flex items-center"><DollarSign className="h-3 w-3 mr-1" />Low cost</span>;
      case 'medium':
        return <span className="text-yellow-500 flex items-center"><DollarSign className="h-3 w-3 mr-1" />Medium cost</span>;
      case 'high':
        return <span className="text-red-500 flex items-center"><DollarSign className="h-3 w-3 mr-1" />High cost</span>;
      default:
        return <span className="text-gray-500 flex items-center"><DollarSign className="h-3 w-3 mr-1" />Unknown</span>;
    }
  };

  // Helper function to render tags
  const renderTags = (tags: string[]) => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {tags.map(tag => (
          <span 
            key={tag} 
            className="px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'offline':
        return 'text-red-500';
      case 'limited':
        return 'text-yellow-500';
      case 'loading':
        return 'text-[#FFC627]';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case 'online':
        return 'Available';
      case 'offline':
        return 'Offline';
      case 'limited':
        return 'Rate limited';
      case 'loading':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  // Find current model details
  const getCurrentModel = () => {
    for (const [groupName, models] of Object.entries(allModelGroups)) {
      const found = models.find(model => model.id === currentModel);
      if (found) {
        return {
          ...found,
          group: groupName
        };
      }
    }
    
    // Fallback for when the current model isn't in our groups
    return {
      id: currentModel,
      name: currentModel,
      group: 'Unknown',
      description: 'Unknown model',
      contextWindow: 0,
      costEstimate: 'unknown',
      tags: [],
      status: 'unknown'
    };
  };

  const currentModelInfo = getCurrentModel();

  // Render the component
  return (
    <div className="relative">
      {/* Current Model Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full px-3 py-2 
          bg-white border border-gray-300 rounded-md shadow-sm
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500
          text-sm font-medium text-gray-700
          ${compact ? 'max-w-[200px]' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <Cpu className="w-4 h-4 mr-2 text-gray-500" />
          <span>{compact ? currentModelInfo.name : `Model: ${currentModelInfo.name}`}</span>
        </div>
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {/* Debug Button */}
      <div className="absolute -top-7 right-0">
        <button 
          className="p-1 text-xs bg-gray-100 rounded-md hover:bg-gray-200 text-gray-500"
          onClick={() => {
            console.log('All model groups:', allModelGroups);
            console.log('Current model groups:', modelGroups);
            console.log('Available models:', availableModels);
            console.log('Current model:', currentModelInfo);
            alert(`Debug info logged to console! 
Available models: ${availableModels?.length || 0}
Current model: ${currentModel}
Provider groups: ${Object.keys(allModelGroups).join(', ')}
Total models: ${Object.values(allModelGroups).flat().length}
`);
          }}
        >
          <Bug className="w-3 h-3" />
        </button>
      </div>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-40 w-96 mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-auto max-h-96 right-0">
          {/* Provider Categories */}
          {Object.entries(modelGroups).map(([groupName, models]) => (
            <div key={groupName} className="border-b border-gray-200 last:border-b-0">
              <div className="px-4 py-2 bg-gray-50 text-sm font-semibold text-gray-700">
                {groupName} ({models.length} models)
              </div>
              <ul className="py-1" role="listbox">
                {models.map((model) => (
                  <li 
                    key={model.id}
                    role="option"
                    aria-selected={currentModel === model.id}
                    className={`
                      px-4 py-3 cursor-pointer hover:bg-gray-50
                      ${currentModel === model.id ? 'bg-indigo-50' : ''}
                    `}
                    onClick={() => {
                      onModelChange(model.id);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">{model.name}</p>
                          {currentModel === model.id && (
                            <Check className="w-4 h-4 text-indigo-600 ml-2" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {model.description || `Model ${model.id}`}
                        </p>
                        
                        {renderTags(model.tags)}
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                          <div className="flex items-center text-gray-600">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {formatContextWindow(model.contextWindow)}
                          </div>
                          
                          <div>
                            {renderCostIndicator(model.costEstimate)}
                          </div>
                          
                          <div className={`flex items-center ${getStatusColor(model.status)}`}>
                            <Zap className="h-3 w-3 mr-1" />
                            {getStatusText(model.status)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Provider icon */}
                      <div className="flex-shrink-0 ml-2">
                        {model.provider === 'gemini' && (
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-xs font-bold">G</span>
                          </div>
                        )}
                        {model.provider === 'llama' && (
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 text-xs font-bold">L</span>
                          </div>
                        )}
                        {model.provider === 'ollama' && (
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                            <Lock className="w-3 h-3 text-gray-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSwitcher; 