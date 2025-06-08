import React from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface RateLimitIndicatorProps {
  percentage: number;
}

const RateLimitIndicator: React.FC<RateLimitIndicatorProps> = ({ percentage }) => {
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 95;

  const getStatusColor = () => {
    if (isAtLimit) return 'text-red-600';
    if (isNearLimit) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (isAtLimit) return <XCircleIcon className="w-4 h-4 text-red-500" />;
    if (isNearLimit) return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
    return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (isAtLimit) return 'Near capacity';
    if (isNearLimit) return 'Moderate usage';
    return 'Good';
  };

  return (
    <div className={`rounded-lg border p-3 transition-colors ${
      isAtLimit 
        ? 'bg-red-50 border-red-200' 
        : isNearLimit 
          ? 'bg-yellow-50 border-yellow-200' 
          : 'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            <span className="font-medium">{percentage.toFixed(0)}%</span>
            <span className="text-gray-400 ml-1">context used</span>
          </div>
        </div>
      </div>

      {/* Warning Messages */}
      {isAtLimit && (
        <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800">
          <strong>Context window nearly full.</strong> Consider compressing history to continue conversation effectively.
        </div>
      )}

      {isNearLimit && !isAtLimit && (
        <div className="mt-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
          <strong>Approaching context limit.</strong> Optimize now to ensure continued quality responses.
        </div>
      )}

      {/* Usage Details */}
      <div className="mt-2 bg-gray-100 rounded-full h-1 overflow-hidden">
        <div 
          className={`h-1 transition-all duration-300 ${
            isAtLimit 
              ? 'bg-red-500' 
              : isNearLimit 
                ? 'bg-yellow-500' 
                : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}; 

export default RateLimitIndicator; 