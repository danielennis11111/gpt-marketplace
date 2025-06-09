import React, { useState, useEffect } from 'react';
import { 
  BoltIcon, 
  ClockIcon, 
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface ProgressiveThinkingIndicatorProps {
  isThinking: boolean;
  isStreaming?: boolean;
  modelName?: string;
  canStream?: boolean;
}

/**
 * A component that shows a progressive "thinking" animation
 * when the AI is generating a response.
 */
const ProgressiveThinkingIndicator: React.FC<ProgressiveThinkingIndicatorProps> = ({ 
  isThinking,
  isStreaming = false,
  modelName = 'AI',
  canStream = false
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    if (!isThinking && !isStreaming) {
      setElapsedTime(0);
      setCurrentMessage('');
      return;
    }

    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);

      if (isStreaming) {
        setCurrentMessage(`Generating a response...`);
      } else {
        // Progressive messaging based on elapsed time
        if (elapsed === 0) {
          setCurrentMessage('Processing your request...');
        } else if (elapsed < 5) {
          setCurrentMessage(`I've been thinking for ${elapsed} second${elapsed > 1 ? 's' : ''}...`);
        } else if (elapsed < 10) {
          setCurrentMessage('Analyzing information carefully...');
        } else {
          setCurrentMessage('This is a complex request, please be patient...');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isThinking, isStreaming]);
  
  if (!isThinking && !isStreaming) return null;
  
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-gray-100 px-4 py-3 rounded-lg w-full">
        <div className="flex items-center space-x-3">
          {/* Animated thinking icon */}
          {isStreaming ? (
            <div className="h-6 w-6 rounded-full bg-[#FFC627] flex items-center justify-center">
              <div className="h-2 w-2 bg-white rounded-full animate-ping"></div>
            </div>
          ) : (
            <div className="flex space-x-1">
              {elapsedTime < 5 ? (
                // Fast animation for initial thinking
                <>
                  <div className="w-2 h-2 bg-[#FFC627] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#FFC627] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-[#FFC627] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </>
              ) : (
                // Brain icon for deep thinking
                <CpuChipIcon className="w-5 h-5 text-[#FFC627] animate-pulse" />
              )}
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-gray-700 text-sm">{currentMessage}</span>
              {elapsedTime > 0 && !isStreaming && (
                <div className="flex items-center text-xs text-gray-500">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  {elapsedTime}s
                </div>
              )}
            </div>
            
            {elapsedTime >= 5 && !isStreaming && (
              <div className="mt-1 text-xs text-gray-500 flex items-center">
                <BoltIcon className="w-3 h-3 mr-1" />
                {modelName} is processing your request carefully
              </div>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-[#FFC627] h-1 rounded-full transition-all duration-1000"
              style={{ 
                width: isStreaming ? '100%' : `${Math.min(90, (elapsedTime / 20) * 100)}%`,
                animation: 'pulse 2s infinite'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveThinkingIndicator; 