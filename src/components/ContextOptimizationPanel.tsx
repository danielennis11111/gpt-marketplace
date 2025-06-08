import React, { useState } from 'react';
import { CompressionEngine } from '../utils/rate-limiter/compressionEngine';
import type { CompressionStrategy } from '../utils/rate-limiter/compressionEngine';
import { 
  ArrowPathIcon, 
  LightBulbIcon, 
  CheckIcon, 
  ShieldExclamationIcon,
  DocumentTextIcon,
  ClockIcon,
  ArchiveBoxIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface ContextOptimizationPanelProps {
  conversationId?: string;
  onCompress?: (strategy: CompressionStrategy) => void;
  onApplyCompression?: (strategy: CompressionStrategy) => void;
  tokenUsage?: {
    total: number;
    percentage: number;
  };
  compressionStrategies?: Array<{
    type: string;
    id: string;
    name: string;
    description?: string;
    savings?: string;
    accuracy?: string;
    recommended?: boolean;
  }>;
}

/**
 * Panel that provides options for optimizing context window usage
 * with various compression strategies
 */
const ContextOptimizationPanel: React.FC<ContextOptimizationPanelProps> = ({
  onCompress,
  onApplyCompression,
  tokenUsage,
  compressionStrategies = []
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<CompressionStrategy['type']>('lossless');
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  
  // Define default strategies if none provided
  const strategies = compressionStrategies.length > 0 ? compressionStrategies : [
    {
      type: 'lossless',
      id: 'lossless',
      name: 'Lossless Compression',
      description: 'Preserves all information with minimal compression',
      savings: '20-30%',
      accuracy: '100%',
      recommended: tokenUsage?.percentage && tokenUsage.percentage < 70
    },
    {
      type: 'semantic',
      id: 'semantic',
      name: 'Semantic Compression',
      description: 'Retains core meaning while reducing redundant content',
      savings: '40-60%',
      accuracy: '95%',
      recommended: tokenUsage?.percentage && tokenUsage.percentage >= 70 && tokenUsage.percentage < 85
    },
    {
      type: 'summary',
      id: 'summary',
      name: 'Summary Compression',
      description: 'Creates concise summaries of conversation history',
      savings: '70-80%',
      accuracy: '85%',
      recommended: tokenUsage?.percentage && tokenUsage.percentage >= 85
    },
    {
      type: 'hybrid',
      id: 'hybrid',
      name: 'Hybrid Compression',
      description: 'Combines multiple strategies for optimal balance',
      savings: '50-70%',
      accuracy: '90%',
      recommended: false
    }
  ];

  const handleApplyCompression = () => {
    const strategy: CompressionStrategy = {
      type: selectedStrategy
    };
    
    if (onApplyCompression) {
      onApplyCompression(strategy);
    } else if (onCompress) {
      onCompress(strategy);
    }
  };

  const handleQuickCompress = () => {
    // Find the recommended strategy based on current usage
    let recommendedStrategy = strategies.find(s => s.recommended)?.id || 'lossless';
    
    // If nothing is recommended, base it on token usage
    if (!recommendedStrategy && tokenUsage) {
      if (tokenUsage.percentage >= 85) {
        recommendedStrategy = 'summary';
      } else if (tokenUsage.percentage >= 70) {
        recommendedStrategy = 'semantic';
      } else {
        recommendedStrategy = 'lossless';
      }
    }
    
    const strategy: CompressionStrategy = {
      type: recommendedStrategy as CompressionStrategy['type']
    };
    
    if (onApplyCompression) {
      onApplyCompression(strategy);
    } else if (onCompress) {
      onCompress(strategy);
    }
  };

  // Get icon for strategy type
  const getStrategyIcon = (type: string) => {
    switch (type) {
      case 'lossless':
        return <DocumentTextIcon className="w-5 h-5 text-green-500" />;
      case 'semantic':
        return <LightBulbIcon className="w-5 h-5 text-[#FFC627]" />;
      case 'summary':
        return <ArchiveBoxIcon className="w-5 h-5 text-purple-500" />;
      case 'hybrid':
        return <CpuChipIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick action button - visible even in simple mode */}
      <button
        onClick={handleQuickCompress}
        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#FFC627] text-black font-medium rounded-lg hover:bg-[#FFD24D] transition-colors"
      >
        <ArrowPathIcon className="w-5 h-5" />
        <span>Smart Compress Context Window</span>
      </button>

      {/* Toggle advanced mode */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsAdvancedMode(!isAdvancedMode)}
          className="text-sm text-gray-600 hover:text-[#FFC627] flex items-center space-x-1"
        >
          <span>{isAdvancedMode ? 'Hide advanced options' : 'Show advanced options'}</span>
          <svg 
            className={`w-4 h-4 transform transition-transform ${isAdvancedMode ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Advanced options */}
      {isAdvancedMode && (
        <div className="space-y-3">
          {strategies.map(strategy => {
            // Add default properties for external strategies
            const recommended = 'recommended' in strategy ? strategy.recommended : false;
            const description = 'description' in strategy ? strategy.description : '';
            const savings = 'savings' in strategy ? strategy.savings : '20-30%';
            const accuracy = 'accuracy' in strategy ? strategy.accuracy : '90%';
            
            return (
            <div 
              key={strategy.id}
              className={`relative p-3 rounded-lg border cursor-pointer ${
                selectedStrategy === strategy.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedStrategy(strategy.id as CompressionStrategy['type'])}
            >
              {/* Recommended badge */}
              {recommended && (
                <div className="absolute -top-2 -right-2 bg-[#FFC627] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  Recommended
                </div>
              )}
              
              <div className="flex items-start">
                {/* Strategy icon */}
                <div className="mr-3 mt-1">
                  {getStrategyIcon(strategy.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{strategy.name}</h4>
                    {selectedStrategy === strategy.id && (
                      <CheckIcon className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                  
                  <div className="flex items-center space-x-4 mt-2 text-xs">
                    <div className="flex items-center">
                      <ArrowPathIcon className="w-3.5 h-3.5 mr-1 text-green-500" />
                      <span className="text-gray-700">Savings: <span className="font-medium text-green-600">{savings}</span></span>
                    </div>
                    
                    <div className="flex items-center">
                      <ClockIcon className="w-3.5 h-3.5 mr-1 text-blue-500" />
                      <span className="text-gray-700">Accuracy: <span className="font-medium text-blue-600">{accuracy}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )})}
          
          <button
            onClick={handleApplyCompression}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span>Apply Selected Compression</span>
          </button>
          
          {/* Warning for critical context usage */}
          {tokenUsage && tokenUsage.percentage > 90 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 flex items-start">
              <ShieldExclamationIcon className="w-5 h-5 text-red-500 mr-2 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Critical context usage detected ({tokenUsage.percentage.toFixed(0)}%)</p>
                <p className="mt-1">Your context window is nearly full. Compression is recommended to maintain conversation quality and avoid potential truncation.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContextOptimizationPanel;