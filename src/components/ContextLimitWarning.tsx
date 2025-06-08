import React from 'react';
import { ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ContextLimitWarningProps {
  usagePercentage: number;
  totalTokens: number;
  maxTokens: number;
  remainingTokens: number;
  onCompressHistory?: () => void;
  onCreateNewConversation?: () => void;
}

/**
 * Warning component that displays when approaching or exceeding context window limits
 */
const ContextLimitWarning: React.FC<ContextLimitWarningProps> = ({
  usagePercentage,
  totalTokens,
  maxTokens,
  remainingTokens,
  onCompressHistory,
  onCreateNewConversation
}) => {
  // Determine warning level
  const isCritical = usagePercentage >= 95;
  const isWarning = usagePercentage >= 80 && usagePercentage < 95;
  const isNotice = usagePercentage >= 60 && usagePercentage < 80;

  if (!isNotice && !isWarning && !isCritical) {
    return null;
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div
      className={`mb-4 p-3 rounded-lg flex flex-col space-y-2 ${
        isCritical
          ? 'bg-red-50 border border-red-200'
          : isWarning
          ? 'bg-yellow-50 border border-yellow-200'
          : 'bg-blue-50 border border-blue-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-start">
        <div className="mr-2 mt-0.5">
          {isCritical ? (
            <XCircleIcon className="w-5 h-5 text-red-500" />
          ) : isWarning ? (
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
          ) : (
            <InformationCircleIcon className="w-5 h-5 text-blue-500" />
          )}
        </div>
        <div className="flex-1">
          <h3
            className={`text-sm font-medium ${
              isCritical
                ? 'text-red-800'
                : isWarning
                ? 'text-yellow-800'
                : 'text-blue-800'
            }`}
          >
            {isCritical
              ? 'Context window nearly full'
              : isWarning
              ? 'Approaching context limit'
              : 'Context window filling up'}
          </h3>
          <p
            className={`text-xs mt-1 ${
              isCritical
                ? 'text-red-700'
                : isWarning
                ? 'text-yellow-700'
                : 'text-blue-700'
            }`}
          >
            {isCritical
              ? `You've used ${usagePercentage.toFixed(1)}% of available context. Only ${formatNumber(
                  remainingTokens
                )} tokens remain for your conversation.`
              : isWarning
              ? `You're using ${usagePercentage.toFixed(1)}% of available context (${formatNumber(
                  totalTokens
                )} of ${formatNumber(maxTokens)} tokens).`
              : `You're using ${usagePercentage.toFixed(1)}% of your context window.`}
          </p>
        </div>
      </div>

      {/* Actions */}
      {(onCompressHistory || onCreateNewConversation) && (
        <div className="flex flex-wrap gap-2 mt-1">
          {onCompressHistory && (
            <button
              onClick={onCompressHistory}
              className={`text-xs px-3 py-1 rounded-md font-medium ${
                isCritical
                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                  : isWarning
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              Compress conversation history
            </button>
          )}
          {onCreateNewConversation && (
            <button
              onClick={onCreateNewConversation}
              className={`text-xs px-3 py-1 rounded-md font-medium ${
                isCritical
                  ? 'bg-white text-red-800 border border-red-300 hover:bg-red-50'
                  : isWarning
                  ? 'bg-white text-yellow-800 border border-yellow-300 hover:bg-yellow-50'
                  : 'bg-white text-blue-800 border border-blue-300 hover:bg-blue-50'
              }`}
            >
              Start new conversation
            </button>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${
            isCritical
              ? 'bg-red-500'
              : isWarning
              ? 'bg-yellow-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(100, usagePercentage)}%` }}
        />
      </div>
    </div>
  );
};

export default ContextLimitWarning; 