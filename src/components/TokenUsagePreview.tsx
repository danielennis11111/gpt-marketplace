import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  ArrowsPointingOutIcon, 
  ArrowsPointingInIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface TokenUsagePreviewProps {
  total: number;
  remaining: number;
  max: number;
  isLoading?: boolean;
}

/**
 * 📊 Enhanced Token Usage Preview Component
 * Shows real-time token usage with visual breakdown and animation
 */
const TokenUsagePreview: React.FC<TokenUsagePreviewProps> = ({
  total,
  remaining,
  max,
  isLoading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevTotal, setPrevTotal] = useState(total);
  
  const percentage = Math.round((total / max) * 100);
  
  // Detect changes in token usage to trigger animations
  useEffect(() => {
    if (total !== prevTotal) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPrevTotal(total);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [total, prevTotal]);

  const getUsageColor = () => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBarColor = () => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Simulated breakdown for visualization purposes
  const breakdowns = {
    system: Math.round(total * 0.1),
    history: Math.round(total * 0.7),
    current: Math.round(total * 0.2),
  };

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm transition-all duration-300 ${isLoading ? 'opacity-70' : 'opacity-100'}`}>
      {/* Minimized View */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">Token Usage:</span>
          <span className={`font-mono ${getUsageColor()} ${isAnimating ? 'animate-pulse' : ''}`}>
            {total.toLocaleString()} / {max.toLocaleString()}
          </span>
          <span className="text-gray-500">
            {remaining.toLocaleString()} remaining
          </span>
          <span className={`font-medium ${getUsageColor()} ${isAnimating ? 'animate-pulse' : ''}`}>
            {percentage}% of context window
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Mini Progress Bar */}
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getBarColor()} transition-all duration-500 ${isAnimating ? 'animate-pulse' : ''}`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
          
          {/* Expand/Collapse Icon */}
          {isExpanded ? (
            <ArrowsPointingInIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          ) : (
            <ArrowsPointingOutIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="mt-2 flex justify-center">
          <div className="flex space-x-2 items-center text-xs text-gray-500">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
            <span>Calculating token usage...</span>
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && !isLoading && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-4 animate-fadeIn">
          {/* Visual Token Distribution */}
          <div>
            <h4 className="font-medium text-gray-700 text-xs mb-2 flex items-center">
              <DocumentTextIcon className="w-4 h-4 mr-1" />
              Context Window Visualization
            </h4>
            <div className="w-full h-5 bg-gray-100 rounded-lg overflow-hidden relative">
              {/* System Instructions */}
              <div 
                className="h-full bg-blue-400 absolute left-0 transition-all duration-500"
                style={{ width: `${(breakdowns.system / max) * 100}%` }}
                title={`System Instructions: ~${breakdowns.system} tokens`}
              />
              
              {/* Conversation History */}
              <div 
                className="h-full bg-purple-400 absolute left-0 transition-all duration-500"
                style={{ width: `${((breakdowns.system + breakdowns.history) / max) * 100}%`, marginLeft: `${(breakdowns.system / max) * 100}%` }}
                title={`Conversation History: ~${breakdowns.history} tokens`}
              />
              
              {/* Current Message */}
              <div 
                className="h-full bg-green-400 absolute left-0 transition-all duration-500"
                style={{ width: `${(breakdowns.current / max) * 100}%`, marginLeft: `${((breakdowns.system + breakdowns.history) / max) * 100}%` }}
                title={`Current Message: ~${breakdowns.current} tokens`}
              />
            </div>
            
            {/* Legend */}
            <div className="flex justify-between text-xs mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-sm mr-1"></div>
                <span className="text-gray-600">System</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-400 rounded-sm mr-1"></div>
                <span className="text-gray-600">History</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-sm mr-1"></div>
                <span className="text-gray-600">Current</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded-sm mr-1"></div>
                <span className="text-gray-600">Available</span>
              </div>
            </div>
          </div>

          {/* Current Context Breakdown */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                Message Tokens
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-1.5"></div>
                    <span className="text-gray-600">System instructions:</span>
                  </div>
                  <span className="font-mono">{breakdowns.system.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-1.5"></div>
                    <span className="text-gray-600">Conversation history:</span>
                  </div>
                  <span className="font-mono">{breakdowns.history.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></div>
                    <span className="text-gray-600">Current message:</span>
                  </div>
                  <span className="font-mono">{breakdowns.current.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                <CpuChipIcon className="w-4 h-4 mr-1" />
                Context Capacity
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total tokens used:</span>
                  <span className={`font-mono ${getUsageColor()}`}>{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tokens remaining:</span>
                  <span className="font-mono">{remaining.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Usage percentage:</span>
                  <span className={`font-mono font-bold ${getUsageColor()}`}>{percentage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations based on usage */}
          <div className={`text-xs p-3 rounded flex items-start space-x-2 ${
            percentage > 80 ? 'bg-red-50 border border-red-200' : 
            percentage > 50 ? 'bg-yellow-50 border border-yellow-200' : 
            'bg-blue-50 border border-blue-100'
          }`}>
            <ExclamationCircleIcon className={`w-5 h-5 shrink-0 ${
              percentage > 80 ? 'text-red-500' : 
              percentage > 50 ? 'text-yellow-500' : 
              'text-blue-500'
            }`} />
            <div>
              <p className={`font-medium mb-1 ${
                percentage > 80 ? 'text-red-700' : 
                percentage > 50 ? 'text-yellow-700' : 
                'text-blue-700'
              }`}>
                {percentage > 80 ? 'High token usage detected' : 
                 percentage > 50 ? 'Moderate token usage' : 
                 'Efficient token usage'}
              </p>
              <ul className="list-disc pl-4 space-y-1 ml-0.5 text-gray-600">
                {percentage > 80 && (
                  <>
                    <li>Consider using compression to reduce token usage</li>
                    <li>Responses may be shorter due to limited remaining context</li>
                  </>
                )}
                {percentage > 50 && percentage <= 80 && (
                  <>
                    <li>Monitor usage as conversation continues</li>
                    <li>Consider compression if adding large amounts of text</li>
                  </>
                )}
                {percentage <= 50 && (
                  <>
                    <li>Context window has plenty of space</li>
                    <li>Model has good context for high-quality responses</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenUsagePreview;
