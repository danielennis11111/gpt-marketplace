import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChartBarIcon,
  ArrowsPointingOutIcon, 
  ArrowsPointingInIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CpuChipIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { estimateTokenCount } from '../utils/rate-limiter/tokenCounter';
import type { DocumentContext } from '../utils/rate-limiter/tokenCounter';

// Define the types we need locally
interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  tokens?: number;
}

interface Conversation {
  id: string;
  templateId: string;
  messages: Message[];
  title?: string;
  lastUpdated?: Date;
}

interface ConversationTemplate {
  id: string;
  name: string;
  persona?: string;
  description?: string;
  modelId: string;
  systemPrompt: string;
  features: {
    contextLength?: number;
    [key: string]: any;
  };
  parameters: {
    temperature: number;
    maxTokens: number;
    topP: number;
    [key: string]: any;
  };
}

interface TokenUsagePreviewProps {
  conversation: Conversation;
  template: ConversationTemplate;
  currentInput: string;
  currentModelId?: string;
  ragContext?: string;
  ragDocuments?: DocumentContext[];
}

/**
 * 📊 Enhanced Token Usage Preview Component
 * Shows real-time token usage with visual breakdown and animation
 */
const TokenUsagePreview: React.FC<TokenUsagePreviewProps> = ({
  conversation,
  template,
  currentInput,
  currentModelId,
  ragContext,
  ragDocuments = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Calculate token usage
  const getModelContextWindow = useCallback((): number => {
    // This is a simplified implementation - in production would use detailed model info
    return 8192; // Default context window size
  }, [currentModelId, template]);

  // Calculate token counts with null checks
  const systemTokens = template?.systemPrompt ? estimateTokenCount(template.systemPrompt) : 0;
  const historyTokens = conversation?.messages
    ? conversation.messages.reduce((sum: number, msg: Message) => sum + (msg.tokens || estimateTokenCount(msg.content)), 0)
    : 0;
  const ragTokens = ragDocuments?.length 
    ? ragDocuments.reduce((sum: number, doc: DocumentContext) => sum + (doc.tokenCount || 0), 0) 
    : (ragContext ? estimateTokenCount(ragContext) : 0);
  const messageTokens = currentInput ? estimateTokenCount(currentInput) : 0;
  
  const total = systemTokens + historyTokens + ragTokens + messageTokens;
  const max = getModelContextWindow();
  const remaining = Math.max(0, max - total);
  const percentage = Math.round((total / max) * 100);
  
  // Detect changes in token usage to trigger animations
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [total]);

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

  // Breakdown calculation with RAG tokens included
  const breakdowns = {
    system: systemTokens,
    rag: ragTokens,
    history: historyTokens,
    current: messageTokens,
  };

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm transition-all duration-300`}>
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

      {/* Expanded View */}
      {isExpanded && (
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
              
              {/* RAG Documents - added new section */}
              <div 
                className="h-full bg-amber-400 absolute left-0 transition-all duration-500"
                style={{ width: `${(breakdowns.rag / max) * 100}%`, marginLeft: `${(breakdowns.system / max) * 100}%` }}
                title={`RAG Documents: ${breakdowns.rag} tokens`}
              />
              
              {/* Conversation History */}
              <div 
                className="h-full bg-purple-400 absolute left-0 transition-all duration-500"
                style={{ width: `${(breakdowns.history / max) * 100}%`, marginLeft: `${((breakdowns.system + breakdowns.rag) / max) * 100}%` }}
                title={`Conversation History: ~${breakdowns.history} tokens`}
              />
              
              {/* Current Message */}
              <div 
                className="h-full bg-green-400 absolute left-0 transition-all duration-500"
                style={{ width: `${(breakdowns.current / max) * 100}%`, marginLeft: `${((breakdowns.system + breakdowns.rag + breakdowns.history) / max) * 100}%` }}
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
                <div className="w-3 h-3 bg-amber-400 rounded-sm mr-1"></div>
                <span className="text-gray-600">RAG</span>
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
                    <div className="w-2 h-2 bg-amber-400 rounded-full mr-1.5"></div>
                    <span className="text-gray-600">RAG documents:</span>
                  </div>
                  <span className="font-mono">{breakdowns.rag.toLocaleString()}</span>
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
                    {breakdowns.rag > 0 && breakdowns.rag > total * 0.3 && (
                      <li>RAG documents using significant context space ({Math.round((breakdowns.rag / total) * 100)}%)</li>
                    )}
                  </>
                )}
                {percentage > 50 && percentage <= 80 && (
                  <>
                    <li>Monitor usage as conversation continues</li>
                    <li>Consider compression if adding large amounts of text</li>
                    {breakdowns.rag > 0 && (
                      <li>RAG documents using {Math.round((breakdowns.rag / total) * 100)}% of used context</li>
                    )}
                  </>
                )}
                {percentage <= 50 && (
                  <>
                    <li>Context window has plenty of space</li>
                    <li>Model has good context for high-quality responses</li>
                    {breakdowns.rag > 0 && (
                      <li>RAG documents successfully loaded into context</li>
                    )}
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
