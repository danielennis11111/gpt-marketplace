import React, { useState } from 'react';
import { CompressionEngine } from '../utils/rate-limiter/compressionEngine';
import type { CompressionStrategy } from '../utils/rate-limiter/compressionEngine';
import { ArrowPathIcon, LightBulbIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ContextOptimizationPanelProps {
  conversationId: string;
  onCompress: (strategy: CompressionStrategy) => void;
  tokenUsage: {
    total: number;
    percentage: number;
  };
}

/**
 * Panel that provides options for optimizing context window usage
 * with various compression strategies
 */
const ContextOptimizationPanel: React.FC<ContextOptimizationPanelProps> = ({
  conversationId,
  onCompress,
  tokenUsage
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<CompressionStrategy['type']>('lossless');
  const [isCompressing, setIsCompressing] = useState(false);
  
  const compressionEngine = CompressionEngine.getInstance();

  const strategies = [
    { 
      id: 'lossless', 
      name: 'Lossless Compression', 
      description: 'Preserves all information with pattern-based compression',
      savings: '20-30%',
      accuracy: '100%',
      recommended: tokenUsage.percentage < 70
    },
    { 
      id: 'semantic', 
      name: 'Semantic Compression', 
      description: 'Preserves key meaning while reducing redundancy',
      savings: '40-60%',
      accuracy: '85-95%',
      recommended: tokenUsage.percentage >= 70 && tokenUsage.percentage < 90
    },
    { 
      id: 'summary', 
      name: 'Summary Compression', 
      description: 'Creates concise summaries of previous exchanges',
      savings: '70-90%',
      accuracy: '70-80%',
      recommended: tokenUsage.percentage >= 90
    }
  ];

  const handleCompression = () => {
    setIsCompressing(true);
    
    try {
      // Create strategy object
      const strategy: CompressionStrategy = { 
        type: selectedStrategy,
        options: {
          preserveRatio: selectedStrategy === 'semantic' ? 0.8 : 0.6,
          includeChecksum: true
        }
      };
      
      // Call the compression handler
      onCompress(strategy);
    } catch (error) {
      console.error("Compression error:", error);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Context Window Optimization</h3>
        <p className="text-sm text-gray-500 mt-1">
          {tokenUsage.percentage >= 90
            ? "Context window nearly full. Compression highly recommended."
            : tokenUsage.percentage >= 70
            ? "Context window getting full. Consider compression to save space."
            : "Optimize your context window to fit more content."}
        </p>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Context Usage:</span>
            <span className={`font-medium ${
              tokenUsage.percentage >= 90 ? 'text-red-600' :
              tokenUsage.percentage >= 70 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {tokenUsage.percentage}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                tokenUsage.percentage >= 90 ? 'bg-red-500' :
                tokenUsage.percentage >= 70 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, tokenUsage.percentage)}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {strategies.map(strategy => (
            <div 
              key={strategy.id}
              className={`relative p-3 rounded-lg border cursor-pointer ${
                selectedStrategy === strategy.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedStrategy(strategy.id as CompressionStrategy['type'])}
            >
              <div className="flex justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    selectedStrategy === strategy.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200'
                  }`}>
                    {selectedStrategy === strategy.id && (
                      <CheckIcon className="w-3 h-3" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 flex items-center">
                      {strategy.name}
                      {strategy.recommended && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Recommended
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {strategy.description}
                    </p>
                  </div>
                </div>
                
                <div className="text-right text-xs">
                  <div className="text-green-600 font-medium">
                    {strategy.savings} savings
                  </div>
                  <div className="text-blue-600">
                    {strategy.accuracy} accuracy
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleCompression}
          disabled={isCompressing}
          className="mt-4 w-full py-2 px-4 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex justify-center items-center space-x-2"
        >
          {isCompressing ? (
            <>
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              <span>Compressing...</span>
            </>
          ) : (
            <>
              <LightBulbIcon className="w-4 h-4" />
              <span>Apply {selectedStrategy} Compression</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ContextOptimizationPanel; 