import React, { useState } from 'react';
import { ChevronDown, Cpu, Zap, Clock, Check, DollarSign, Shield, Gauge } from 'lucide-react';
import ServiceLogo from './ServiceLogo';
import { AIModel } from '../types/index';

interface ModelSwitcherProps {
  models: AIModel[];
  currentModelId: string;
  onModelSwitch: (modelId: string) => void;
  compact?: boolean;
}

interface ModelDescription {
  purpose: string;
  rateLimiting: string;
  cost: string;
  strengths: string[];
  idealFor: string;
}

const ModelSwitcher: React.FC<ModelSwitcherProps> = ({
  models,
  currentModelId,
  onModelSwitch,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentModel = models.find(m => m.id === currentModelId) || models[0];
  
  // If no models available, return loading state
  if (!models || models.length === 0 || !currentModel) {
    return (
      <div className={compact ? 'px-3 py-1' : 'bg-white border border-gray-200 rounded-lg p-4'}>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <span>Loading models...</span>
        </div>
      </div>
    );
  }
  
  const sortedModels = models.sort((a, b) => {
    // Sort by: Current model first, then Online, then Limited, then Loading, then Offline, then by name
    const isACurrent = a.id === currentModelId;
    const isBCurrent = b.id === currentModelId;
    
    if (isACurrent && !isBCurrent) return -1;
    if (!isACurrent && isBCurrent) return 1;
    
    const statusOrder = { 'online': 0, 'limited': 1, 'loading': 2, 'offline': 3 };
    const aOrder = statusOrder[(a?.status || 'unknown') as keyof typeof statusOrder] ?? 4;
    const bOrder = statusOrder[(b?.status || 'unknown') as keyof typeof statusOrder] ?? 4;
    
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.name.localeCompare(b.name);
  });

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
      'llama4-scout': {
        purpose: 'Advanced local reasoning with massive context',
        rateLimiting: 'No rate limits - runs locally',
        cost: 'Free - local processing, no API costs',
        strengths: ['10M token context', 'Privacy', 'Unlimited use'],
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

  const getModelIcon = (modelId: string) => {
    return <ServiceLogo modelId={modelId} variant="light" size="sm" />;
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
        >
          <div className="text-xs">{getStatusIcon(currentModel?.status || 'loading')}</div>
          <span className="font-medium">{currentModel?.name || 'Loading...'}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full right-0 mt-1 w-[320px] bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
              {sortedModels.map((model) => {
                const description = getModelDescription(model.id);
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      onModelSwitch(model.id);
                      setIsOpen(false);
                    }}
                    disabled={model?.status === 'offline' || model?.status === 'loading'}
                    className={`w-full p-4 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-100 last:border-b-0 ${
                      model.id === currentModelId ? 'bg-[#FFC627] bg-opacity-20 border-l-4 border-l-[#FFC627]' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getModelIcon(model.id)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900 truncate">{model.name}</span>
                          {model.id === currentModelId && (
                            <Check className="w-4 h-4 text-[#FFC627] flex-shrink-0" />
                          )}
                          <div className={`flex items-center space-x-1 text-xs ${getStatusColor(model?.status)} flex-shrink-0`}>
                            <div>{getStatusIcon(model?.status)}</div>
                            <span className="font-medium">{getStatusText(model?.status)}</span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2">{description.purpose}</p>
                        
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Gauge className="w-3 h-3" />
                            <span>{description.rateLimiting}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <DollarSign className="w-3 h-3" />
                            <span>{description.cost}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {description.strengths.slice(0, 2).map((strength, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <Cpu className="w-4 h-4 mr-2" />
          AI Model
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm text-[#FFC627] hover:text-yellow-600 flex items-center"
        >
          Switch Model <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Current Model Display */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-center">
          <ServiceLogo modelId={currentModel.id} variant="light" size="lg" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-900">{currentModel?.name || 'Loading...'}</span>
            <div className={`flex items-center space-x-1 text-xs ${getStatusColor(currentModel?.status || 'loading')}`}>
              <div>{getStatusIcon(currentModel?.status || 'loading')}</div>
              <span className="font-medium">{getStatusText(currentModel?.status || 'loading')}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">{getModelDescription(currentModel?.id || '').purpose}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <Gauge className="w-3 h-3" />
                <span>{getModelDescription(currentModel?.id || '').rateLimiting}</span>
              </span>
              <span className="flex items-center space-x-1">
                <DollarSign className="w-3 h-3" />
                <span>{getModelDescription(currentModel?.id || '').cost}</span>
              </span>
            </div>
        </div>
      </div>

      {/* Model List (when expanded) */}
      {isOpen && (
        <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
          <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">Available Models</h4>
          <div className="grid grid-cols-1 gap-3">
            {sortedModels.map((model) => {
              const description = getModelDescription(model.id);
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelSwitch(model.id);
                    setIsOpen(false);
                  }}
                  disabled={model?.status === 'offline' || model?.status === 'loading'}
                  className={`w-full p-4 text-left border rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    model.id === currentModelId
                      ? 'border-[#FFC627] border-opacity-40 bg-[#FFC627] bg-opacity-20 shadow-sm'
                      : model?.status === 'online' || model?.status === 'limited'
                        ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                        : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center flex-shrink-0 mt-1">
                      <ServiceLogo modelId={model.id} variant="light" size="md" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">{model.name}</span>
                          {model.id === currentModelId && (
                            <Check className="w-4 h-4 text-[#FFC627]" />
                          )}
                        </div>
                        <div className={`text-xs font-medium ${getStatusColor(model?.status)} flex items-center space-x-1`}>
                          <span>{getStatusIcon(model?.status)}</span>
                          <span>{getStatusText(model?.status)}</span>
                        </div>
                      </div>

                      {/* Purpose */}
                      <p className="text-sm text-gray-700 mb-3 font-medium">{description.purpose}</p>

                      {/* Key Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <Gauge className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-xs font-medium text-gray-700 block">Rate Limiting</span>
                              <span className="text-xs text-gray-600">{description.rateLimiting}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <DollarSign className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-xs font-medium text-gray-700 block">Cost</span>
                              <span className="text-xs text-gray-600">{description.cost}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Strengths & Ideal For */}
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-700 block mb-1">Strengths</span>
                          <div className="flex flex-wrap gap-1">
                            {description.strengths.map((strength, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                              >
                                {strength}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-gray-100">
                          <span className="text-xs font-medium text-gray-700 block mb-1">💡 Ideal For</span>
                          <span className="text-xs text-gray-600 italic">{description.idealFor}</span>
                        </div>
                      </div>

                      {/* Context Window Info */}
                      {model.maxTokens && (
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">Context Window</span>
                          <span className="text-xs font-mono text-gray-700">
                            {(model.maxTokens / 1000).toLocaleString()}K tokens
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSwitcher; 