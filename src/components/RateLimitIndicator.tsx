import React, { useState, useEffect } from 'react';
import { ClockIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface RateLimitInfo {
  currentRequests: number;
  maxRequests: number;
  resetTime: Date;
  isBlocked: boolean;
}

interface RateLimitIndicatorProps {
  rateLimitInfo: RateLimitInfo;
  onRateLimitReset: () => void;
}

export const RateLimitIndicator: React.FC<RateLimitIndicatorProps> = ({
  rateLimitInfo,
  onRateLimitReset
}) => {
  const [timeUntilReset, setTimeUntilReset] = useState<number>(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const resetTime = rateLimitInfo.resetTime.getTime();
      const timeDiff = Math.max(0, resetTime - now);
      
      if (timeDiff === 0) {
        onRateLimitReset();
      }
      
      setTimeUntilReset(timeDiff);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [rateLimitInfo.resetTime, onRateLimitReset]);

  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  const usagePercentage = (rateLimitInfo.currentRequests / rateLimitInfo.maxRequests) * 100;
  const isNearLimit = usagePercentage >= 80;
  const remaining = rateLimitInfo.maxRequests - rateLimitInfo.currentRequests;

  const getStatusColor = () => {
    if (rateLimitInfo.isBlocked) return 'text-red-600';
    if (isNearLimit) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (rateLimitInfo.isBlocked) return <XCircleIcon className="w-4 h-4 text-red-500" />;
    if (isNearLimit) return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
    return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (rateLimitInfo.isBlocked) return 'Rate limited';
    if (isNearLimit) return 'Near limit';
    return 'Available';
  };

  return (
    <div className={`rounded-lg border p-3 transition-colors ${
      rateLimitInfo.isBlocked 
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
            <span className="font-medium">{rateLimitInfo.currentRequests}</span>
            <span className="text-gray-400"> / </span>
            <span>{rateLimitInfo.maxRequests}</span>
            <span className="text-gray-400 ml-1">requests/min</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Progress Ring */}
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 14}`}
                strokeDashoffset={`${2 * Math.PI * 14 * (1 - usagePercentage / 100)}`}
                className={`transition-all duration-300 ${
                  rateLimitInfo.isBlocked 
                    ? 'text-red-500' 
                    : isNearLimit 
                      ? 'text-yellow-500' 
                      : 'text-green-500'
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-bold ${getStatusColor()}`}>
                {remaining}
              </span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center space-x-1 text-gray-600">
            <ClockIcon className="w-3 h-3" />
            <span className="text-xs font-medium">
              {formatTime(timeUntilReset)}
            </span>
          </div>
        </div>
      </div>

      {/* Warning Messages */}
      {rateLimitInfo.isBlocked && (
        <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800">
          <strong>Rate limit exceeded.</strong> Wait {formatTime(timeUntilReset)} before sending another request.
        </div>
      )}

      {isNearLimit && !rateLimitInfo.isBlocked && (
        <div className="mt-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
          <strong>Approaching rate limit.</strong> {remaining} requests remaining this minute.
        </div>
      )}

      {/* Usage Details */}
      <div className="mt-2 bg-gray-100 rounded-full h-1 overflow-hidden">
        <div 
          className={`h-1 transition-all duration-300 ${
            rateLimitInfo.isBlocked 
              ? 'bg-red-500' 
              : isNearLimit 
                ? 'bg-yellow-500' 
                : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
        />
      </div>
    </div>
  );
}; 

export default RateLimitIndicator; 