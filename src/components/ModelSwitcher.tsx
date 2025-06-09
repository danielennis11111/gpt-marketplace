import React, { useState } from 'react';
import { ChevronDown, Cpu, Check, DollarSign, Gauge } from 'lucide-react';
import { MODEL_LIMITS } from '../utils/rate-limiter/tokenCounter';

interface ModelSwitcherProps {
  currentModel?: string;
  onModelChange: (modelId: string) => void;
  compact?: boolean;
  provider?: 'openai' | 'gemini' | 'ollama' | 'anthropic';
}

interface ModelDescription {
  purpose: string;
  rateLimiting: string;
  cost: string;
  strengths: string[];
  idealFor: string;
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
  provider = 'openai'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Group models by provider
  const allModelGroups = {
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

  // Filter model groups based on the current provider
  const getFilteredModelGroups = () => {
    const groups: Record<string, typeof allModelGroups['OpenAI']> = {};
    
    if (provider === 'openai') {
      groups['OpenAI'] = allModelGroups['OpenAI'];
    } else if (provider === 'gemini') {
      groups['Google'] = allModelGroups['Google'];
    } else if (provider === 'anthropic') {
      groups['Anthropic'] = allModelGroups['Anthropic'];
    } else if (provider === 'ollama') {
      groups['Local Models'] = allModelGroups['Local Models'];
    } else {
      // If no provider specified or unknown, show all
      return allModelGroups;
    }
    
    return groups;
  };
  
  const modelGroups = getFilteredModelGroups();

  // Enhanced model descriptions with practical information
  const getModelDescription = (modelId: string): ModelDescription => {
    const descriptions: Record<string, ModelDescription> = {
      'gpt-4o': {
        purpose: 'Advanced reasoning and multimodal analysis',
        rateLimiting: 'Moderate limits, stable for production use',
        cost: 'Premium pricing, higher cost per token',
        strengths: ['Complex reasoning', 'Code generation', 'Multimodal'],
        idealFor: 'Complex projects requiring high-quality outputs'
      },
      'gpt-4o-mini': {
        purpose: 'Fast and cost-effective general tasks',
        rateLimiting: 'Higher rate limits, excellent availability',
        cost: 'Very cost-effective, budget-friendly',
        strengths: ['Speed', 'Cost efficiency', 'High availability'],
        idealFor: 'Rapid prototyping and everyday tasks'
      },
      'gpt-3.5-turbo': {
        purpose: 'Reliable conversation and basic tasks',
        rateLimiting: 'Stable limits, good for continuous use',
        cost: 'Budget option, lowest cost per token',
        strengths: ['Proven reliability', 'Fast responses', 'Low cost'],
        idealFor: 'Basic automation and simple conversations'
      },
      'gemini-2.0-flash': {
        purpose: 'Ultra-fast responses with massive context',
        rateLimiting: 'Generous limits, optimized for high throughput',
        cost: 'Competitive pricing, good value',
        strengths: ['1M token context', 'Lightning speed', 'Multimodal'],
        idealFor: 'Large document processing and real-time apps'
      },
      'gemini-1.5-pro': {
        purpose: 'Research-grade analysis with huge context',
        rateLimiting: 'Research-friendly limits, stable access',
        cost: 'Research-tier pricing, moderate cost',
        strengths: ['2M token context', 'Deep analysis', 'Scientific accuracy'],
        idealFor: 'Academic research and complex analysis'
      },
      'claude-3.7-sonnet': {
        purpose: 'Balanced performance and thoughtfulness',
        rateLimiting: 'Research-grade limits with good availability',
        cost: 'Premium pricing, moderate cost per token',
        strengths: ['Nuanced responses', '200K context', 'Ethical design'],
        idealFor: 'Complex reasoning and thoughtful analysis'
      },
      'claude-3.5-sonnet': {
        purpose: 'High quality responses with nuance',
        rateLimiting: 'Research-friendly limits, stable access',
        cost: 'Premium pricing, moderate cost',
        strengths: ['200K context', 'Factual accuracy', 'Thoughtful reasoning'],
        idealFor: 'Research and detailed knowledge work'
      },
      'claude-3.5-haiku': {
        purpose: 'Fast and efficient text generation',
        rateLimiting: 'Higher throughput, excellent for scaling',
        cost: 'Cost-effective, budget-friendly',
        strengths: ['Speed', 'Efficiency', 'Reliability'],
        idealFor: 'Rapid prototyping and high-volume tasks'
      },
      'llama4-scout': {
        purpose: 'Advanced local reasoning with massive context',
        rateLimiting: 'No rate limits - runs locally',
        cost: 'Free - local processing, no API costs',
        strengths: ['128K token context', 'Privacy', 'Unlimited use'],
        idealFor: 'Privacy-sensitive work and unlimited experimentation'
      },
      'llama3.2:3b': {
        purpose: 'Lightweight local model for basic tasks',
        rateLimiting: 'No rate limits - runs locally',
        cost: 'Free - local processing, no API costs',
        strengths: ['Fast local inference', 'Privacy', 'Low resource usage'],
        idealFor: 'Quick local tasks and testing'
      },
      'llama3.1:8b': {
        purpose: 'Balanced local model with good capabilities',
        rateLimiting: 'No rate limits - runs locally',
        cost: 'Free - local processing, no API costs',
        strengths: ['Good reasoning', 'Privacy', 'Balanced performance'],
        idealFor: 'Local development and privacy-focused work'
      },
      'mistral-7b': {
        purpose: 'Open-source model with strong reasoning',
        rateLimiting: 'No rate limits - runs locally',
        cost: 'Free - local processing, no API costs',
        strengths: ['Reasoning', 'Privacy', 'Community support'],
        idealFor: 'Local development and specialized fine-tuning'
      },
      'phi-3': {
        purpose: 'Microsoft\'s compact but powerful model',
        rateLimiting: 'No rate limits - runs locally',
        cost: 'Free - local processing, no API costs',
        strengths: ['Small size', 'Strong performance', 'Efficiency'],
        idealFor: 'Resource-constrained environments'
      }
    };
    
    return descriptions[modelId] || {
      purpose: 'General purpose AI assistant',
      rateLimiting: 'Standard rate limits apply',
      cost: 'Variable pricing',
      strengths: ['General capabilities'],
      idealFor: 'General use cases'
    };
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

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'online':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'offline':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'limited':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'loading':
        return <div className="w-2 h-2 bg-[#FFC627] rounded-full animate-pulse"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'limited':
        return 'Limited';
      case 'loading':
        return 'Testing...';
      default:
        return 'Unknown';
    }
  };

  // Get current model info
  const getCurrentModel = () => {
    for (const group in modelGroups) {
      const model = modelGroups[group as keyof typeof modelGroups].find(m => m.id === currentModel);
      if (model) return model;
    }
    
    // If current model is not in the filtered list, show a special "not available" entry
    if (provider && currentModel) {
      // Check if it's an Ollama model that's not in our predefined list
      if (provider === 'ollama' && currentModel.includes('llama') || 
          currentModel.includes('mistral') || currentModel.includes('phi')) {
        return { 
          id: currentModel, 
          name: currentModel, 
          status: 'online',
          isCustom: true
        };
      }
      
      return { 
        id: currentModel, 
        name: currentModel, 
        status: provider === 'ollama' ? 'online' : 'unknown',
        isCustom: true  
      };
    }
    
    return { id: currentModel, name: currentModel, status: 'unknown' };
  };

  // Get connection status display for the header
  const getConnectionStatus = () => {
    switch (provider) {
      case 'openai':
        return { connected: true, name: 'OpenAI' };
      case 'gemini': 
        return { connected: true, name: 'Gemini' };
      case 'anthropic':
        return { connected: true, name: 'Claude' };
      case 'ollama':
        return { connected: true, name: 'Ollama' };
      default:
        return { connected: false, name: 'AI Model' };
    }
  };

  // Get service logo icon component (no emojis)
  const getServiceLogo = (modelId: string) => {
    const logoClasses = "w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center";
    
    if (modelId.includes('gpt')) {
      return <div className={`${logoClasses} bg-green-100`}>
        <span className="text-green-700 text-xs font-bold">GPT</span>
      </div>;
    }
    if (modelId.includes('gemini')) {
      return <div className={`${logoClasses} bg-blue-100`}>
        <span className="text-blue-700 text-xs font-bold">G</span>
      </div>;
    }
    if (modelId.includes('claude')) {
      return <div className={`${logoClasses} bg-purple-100`}>
        <span className="text-purple-700 text-xs font-bold">C</span>
      </div>;
    }
    if (modelId.includes('llama') || modelId.includes('mistral') || modelId.includes('phi')) {
      return <div className={`${logoClasses} bg-orange-100`}>
        <span className="text-orange-700 text-xs font-bold">L</span>
      </div>;
    }
    return <div className={`${logoClasses} bg-gray-100`}>
      <span className="text-gray-700 text-xs font-bold">AI</span>
    </div>;
  };

  const currentModelInfo = getCurrentModel();
  const sortedModelGroups = Object.entries(modelGroups).sort((a, b) => {
    const aHasCurrent = a[1].some(m => m.id === currentModel);
    const bHasCurrent = b[1].some(m => m.id === currentModel);
    
    if (aHasCurrent && !bHasCurrent) return -1;
    if (!aHasCurrent && bHasCurrent) return 1;
    return a[0].localeCompare(b[0]);
  });

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className={`inline-flex items-center justify-center ${
            compact 
              ? 'px-2 py-1 text-sm' 
              : 'px-4 py-2 text-base'
          } font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          {getServiceLogo(currentModel)}
          <div className="ml-2 text-left">
            <div className="font-medium truncate">
              {currentModelInfo.name}
            </div>
            {!compact && (
              <div className="text-xs text-gray-500 flex items-center">
                <div className={`w-2 h-2 rounded-full mr-1 ${getConnectionStatus().connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {getConnectionStatus().name}
              </div>
            )}
          </div>
          <ChevronDown className={`ml-2 h-4 w-4 ${compact ? '' : 'mt-0.5'}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10" style={{ width: compact ? '300px' : '350px' }}>
          <div className="py-2 px-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900">Select Model</div>
              <div className="flex items-center text-xs text-gray-600">
                <div className={`w-2 h-2 rounded-full mr-1 ${getConnectionStatus().connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {getConnectionStatus().name}: {getConnectionStatus().connected ? 'Connected' : 'Not Connected'}
              </div>
            </div>
          </div>
          <div className="py-2 px-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900">Available Models</div>
              <div className="text-xs text-gray-600">
                {sortedModelGroups.map(([groupName, models]) => models.length).reduce((a, b) => a + b, 0)} models
              </div>
            </div>
          </div>
          <div className="py-2 px-3">
            {sortedModelGroups.map(([groupName, models]) => (
              <div key={groupName} className="mb-4 last:mb-0">
                <h5 className="text-xs font-semibold text-gray-500 mb-2">{groupName}</h5>
                <div className="space-y-2">
                  {models.map(model => {
                    const description = getModelDescription(model.id);
                    return (
                      <button
                        key={model.id}
                        onClick={() => {
                          onModelChange(model.id);
                          setIsOpen(false);
                        }}
                        disabled={model?.status === 'offline' || model?.status === 'loading'}
                        className={`w-full p-3 text-left border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                          model.id === currentModel
                            ? 'border-[#FFC627] border-opacity-40 bg-[#FFC627] bg-opacity-10 shadow-sm'
                            : model?.status === 'online' || model?.status === 'limited'
                              ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex items-center justify-center flex-shrink-0 mt-0.5">
                            {getServiceLogo(model.id)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{model.name}</span>
                                {model.id === currentModel && (
                                  <Check className="w-4 h-4 text-[#FFC627]" />
                                )}
                              </div>
                              <div className={`text-xs ${getStatusColor(model?.status)} flex items-center space-x-1`}>
                                {getStatusIcon(model?.status)}
                                <span>{getStatusText(model?.status)}</span>
                              </div>
                            </div>
                            
                            {/* Purpose */}
                            <p className="text-xs text-gray-600 mt-1">{description.purpose}</p>
                            
                            {/* Strengths */}
                            {!compact && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {description.strengths.slice(0, 2).map((strength, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                                  >
                                    {strength}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSwitcher; 