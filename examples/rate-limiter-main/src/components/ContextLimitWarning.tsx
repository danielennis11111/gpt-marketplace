import React from 'react';
import { AlertTriangle, X, MessageSquare } from 'lucide-react';
import { ContextWindowInfo, ModelInfo } from '../types';

interface ContextLimitWarningProps {
  contextInfo: ContextWindowInfo;
  availableModels: ModelInfo[];
  onStartNewChat: () => void;
  onSwitchModel: (modelName: string) => void;
  onDismiss: () => void;
}

export const ContextLimitWarning: React.FC<ContextLimitWarningProps> = ({
  contextInfo,
  availableModels,
  onStartNewChat,
  onSwitchModel,
  onDismiss
}) => {
  const usagePercentage = (contextInfo.currentTokens / contextInfo.maxTokens) * 100;
  const isNearLimit = usagePercentage >= contextInfo.warningThreshold;
  const isAtLimit = usagePercentage >= 90;

  if (!isNearLimit) return null;

  const higherLimitModels = availableModels.filter(
    model => model.maxContextTokens > contextInfo.maxTokens
  );

  return (
    <div className={`rounded-lg p-4 mb-4 border-l-4 ${
      isAtLimit 
        ? 'bg-red-50 border-red-400 text-red-800' 
        : 'bg-yellow-50 border-yellow-400 text-yellow-800'
    }`}>
      <div className="flex items-start">
        <AlertTriangle className={`w-5 h-5 mt-0.5 mr-3 ${
          isAtLimit ? 'text-red-500' : 'text-yellow-500'
        }`} />
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-2">
            {isAtLimit ? 'Context Limit Reached' : 'Approaching Context Limit'}
          </h3>
          <p className="text-sm mb-3">
            You're using {Math.round(usagePercentage)}% of your context window 
            ({contextInfo.currentTokens.toLocaleString()} / {contextInfo.maxTokens.toLocaleString()} tokens) 
            with {contextInfo.modelName}.
            {isAtLimit 
              ? ' Messages will start getting truncated and the model may "forget" earlier parts of the conversation.'
              : ' Soon, older messages will start to get truncated.'
            }
          </p>
          
          <div className="bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className={`h-2 rounded-full ${
                isAtLimit ? 'bg-red-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onStartNewChat}
              className="inline-flex items-center px-3 py-1.5 bg-asu-maroon text-white text-sm rounded-md hover:bg-red-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Start New Chat
            </button>
            
            {higherLimitModels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium">Or switch to:</span>
                {higherLimitModels.slice(0, 2).map((model) => (
                  <button
                    key={model.name}
                    onClick={() => onSwitchModel(model.name)}
                    className="px-3 py-1.5 bg-green-100 text-green-800 text-sm rounded-md hover:bg-green-200 transition-colors"
                  >
                    {model.name} ({(model.maxContextTokens / 1000).toFixed(0)}K tokens)
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="ml-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}; 