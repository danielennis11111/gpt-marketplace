import React, { useState, useEffect, useCallback } from 'react';
import { ConversationTemplate, Conversation } from '../types/index';
import { 
  MODEL_LIMITS, 
  estimateTokenCount, 
  calculateDetailedTokenUsage, 
  calculateConversationStats,
  getContextRecommendations,
  DocumentContext,
  DetailedTokenUsage,
  ConversationTokenStats
} from '../utils/tokenCounter';
import { CompressionEngine } from '../utils/compressionEngine';
import CompressionStatisticsPanel from './CompressionStatisticsPanel';

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
 * Shows comprehensive real-time token usage with cumulative tracking
 */
const TokenUsagePreview: React.FC<TokenUsagePreviewProps> = ({
  conversation,
  template,
  currentInput,
  currentModelId,
  ragContext,
  ragDocuments = []
}) => {
  // Get actual model context window - use useCallback to prevent useEffect dependency warnings
  const getModelContextWindow = useCallback((): number => {
    const modelId = currentModelId || template.modelId;
    const modelLimits = MODEL_LIMITS[modelId];
    return modelLimits?.contextWindow || template.features.contextLength || 128000;
  }, [currentModelId, template.modelId, template.features.contextLength]);

  const [tokenUsage, setTokenUsage] = useState<DetailedTokenUsage>({
    systemPrompt: 0,
    conversationHistory: 0,
    ragContext: 0,
    currentMessage: 0,
    total: 0,
    remaining: getModelContextWindow(),
    percentage: 0,
    estimatedCost: 0,
    breakdown: {
      systemTokens: 0,
      inputTokensTotal: 0,
      outputTokensTotal: 0,
      ragTokens: 0,
      currentInputTokens: 0,
      expectedOutputTokens: 0
    },
    costs: {
      inputCost: 0,
      outputCost: 0,
      totalCost: 0
    },
    contextUtilization: {
      historyPercentage: 0,
      ragPercentage: 0,
      systemPercentage: 0,
      availableForResponse: getModelContextWindow()
    }
  });

  const [conversationStats, setConversationStats] = useState<ConversationTokenStats>({
    totalMessages: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    averageInputTokens: 0,
    averageOutputTokens: 0,
    longestMessage: 0,
    shortestMessage: 0,
    cumulativeCost: 0
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [compressionEngine] = useState(() => CompressionEngine.getInstance());

  // Calculate comprehensive token usage using enhanced system
  useEffect(() => {
    const modelId = currentModelId || template.modelId;
    
    // Prepare RAG documents from context if not provided directly
    const documents: DocumentContext[] = ragDocuments.length > 0 
      ? ragDocuments 
      : ragContext 
        ? [{
            type: 'txt' as const,
            name: 'RAG Context',
            content: ragContext,
            tokenCount: estimateTokenCount(ragContext),
            size: ragContext.length,
            uploadedAt: new Date()
          }] 
        : [];
    
    // Calculate detailed token usage
    const detailedUsage = calculateDetailedTokenUsage(
      template.systemPrompt || '',
      conversation.messages,
      documents,
      currentInput,
      modelId
    );
    
    // Calculate conversation statistics
    const stats = calculateConversationStats(conversation.messages, modelId);
    
    setTokenUsage(detailedUsage);
    setConversationStats(stats);
  }, [conversation.messages, template, currentInput, currentModelId, ragContext, ragDocuments]);

  const getUsageColor = () => {
    if (tokenUsage.percentage < 50) return 'text-green-600';
    if (tokenUsage.percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBarColor = () => {
    if (tokenUsage.percentage < 50) return 'bg-green-500';
    if (tokenUsage.percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const recommendations = getContextRecommendations(tokenUsage);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
      {/* Minimized View */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <span className="font-medium text-gray-700">Token Usage:</span>
          <span className={`font-mono ${getUsageColor()}`}>
            {tokenUsage.total.toLocaleString()} / {getModelContextWindow().toLocaleString()}
          </span>
          <span className="text-gray-500">
            {tokenUsage.remaining.toLocaleString()} remaining
          </span>
          <span className={`font-medium ${getUsageColor()}`}>
            {tokenUsage.percentage}% of context window
          </span>
          {tokenUsage.costs.totalCost > 0 && (
            <span className="text-blue-600 font-medium">
              ${tokenUsage.costs.totalCost.toFixed(4)}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Mini Progress Bar */}
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getBarColor()} transition-all duration-300`}
              style={{ width: `${Math.min(100, tokenUsage.percentage)}%` }}
            />
          </div>
          
          <svg 
            className={`w-4 h-4 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
          {/* Current Context Breakdown */}
          <div>
            <h4 className="font-medium text-gray-700 text-xs mb-2">Current Context Window Usage</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between">
                  <span className="text-gray-600">System instructions:</span>
                  <span className="font-mono">{tokenUsage.breakdown.systemTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Conversation history:</span>
                  <span className="font-mono">{tokenUsage.conversationHistory.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">RAG/Document content:</span>
                  <span className={`font-mono ${tokenUsage.breakdown.ragTokens > 0 ? 'text-blue-600 font-semibold' : ''}`}>
                    {tokenUsage.breakdown.ragTokens.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your message:</span>
                  <span className="font-mono">{tokenUsage.breakdown.currentInputTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected AI response:</span>
                  <span className="font-mono">{tokenUsage.breakdown.expectedOutputTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available for response:</span>
                  <span className="font-mono text-green-600">{tokenUsage.contextUtilization.availableForResponse.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conversation Statistics */}
          <div>
            <h4 className="font-medium text-gray-700 text-xs mb-2">Conversation Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total messages:</span>
                  <span className="font-mono">{conversationStats.totalMessages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Input tokens (cumulative):</span>
                  <span className="font-mono text-blue-600">{conversationStats.totalInputTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Output tokens (cumulative):</span>
                  <span className="font-mono text-purple-600">{conversationStats.totalOutputTokens.toLocaleString()}</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg input per message:</span>
                  <span className="font-mono">{conversationStats.averageInputTokens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg output per message:</span>
                  <span className="font-mono">{conversationStats.averageOutputTokens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Longest message:</span>
                  <span className="font-mono">{conversationStats.longestMessage}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          {tokenUsage.costs.totalCost > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 text-xs mb-2">Cost Analysis</h4>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Input cost:</span>
                  <span className="font-mono text-blue-600">${tokenUsage.costs.inputCost.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Output cost:</span>
                  <span className="font-mono text-purple-600">${tokenUsage.costs.outputCost.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total cost:</span>
                  <span className="font-mono font-semibold">${tokenUsage.costs.totalCost.toFixed(4)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Context Utilization Visualization */}
          <div>
            <h4 className="font-medium text-gray-700 text-xs mb-2">Context Window Breakdown</h4>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex">
              <div 
                className="bg-yellow-500" 
                style={{ width: `${tokenUsage.contextUtilization.systemPercentage}%` }}
                title={`System: ${tokenUsage.contextUtilization.systemPercentage}%`}
              />
              <div 
                className="bg-blue-500" 
                style={{ width: `${tokenUsage.contextUtilization.historyPercentage}%` }}
                title={`History: ${tokenUsage.contextUtilization.historyPercentage}%`}
              />
              <div 
                className="bg-purple-500" 
                style={{ width: `${tokenUsage.contextUtilization.ragPercentage}%` }}
                title={`RAG: ${tokenUsage.contextUtilization.ragPercentage}%`}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>System</span>
              <span>History</span>
              <span>RAG</span>
              <span>Available</span>
            </div>
          </div>

          {/* Full Progress Bar */}
          <div className="mt-3">
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getBarColor()} transition-all duration-300`}
                style={{ width: `${Math.min(100, tokenUsage.percentage)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>0</span>
              <span className="font-medium">Context Window</span>
              <span>{getModelContextWindow().toLocaleString()}</span>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.status !== 'good' && (
            <div className={`mt-2 p-2 rounded text-xs border ${
              recommendations.status === 'critical' 
                ? 'bg-red-50 border-red-200 text-red-700' 
                : 'bg-yellow-50 border-yellow-200 text-yellow-700'
            }`}>
              <div className="font-medium mb-1">
                {recommendations.status === 'critical' ? '⚠️' : '📊'} {recommendations.message}
              </div>
              {recommendations.actions.length > 0 && (
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  {recommendations.actions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              )}
                        </div>
           )}

           {/* Compression Statistics */}
           <div className="mt-3 pt-3 border-t border-gray-200">
             <CompressionStatisticsPanel 
               compressionEngine={compressionEngine}
               refreshInterval={10000} // Refresh every 10 seconds
             />
           </div>
         </div>
       )}
    </div>
  );
};

export default TokenUsagePreview;