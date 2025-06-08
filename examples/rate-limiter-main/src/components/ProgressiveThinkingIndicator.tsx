import React, { useState, useEffect } from 'react';
import { Brain, Clock, Zap } from 'lucide-react';

interface ProgressiveThinkingIndicatorProps {
  isThinking: boolean;
  modelName?: string;
  canStream?: boolean;
}

const ProgressiveThinkingIndicator: React.FC<ProgressiveThinkingIndicatorProps> = ({
  isThinking,
  modelName = 'AI',
  canStream = true
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    if (!isThinking) {
      setElapsedTime(0);
      setCurrentMessage('');
      return;
    }

    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);

      // Progressive messaging based on elapsed time
      if (elapsed === 0) {
        setCurrentMessage('generating...');
      } else if (elapsed < 5) {
        setCurrentMessage(`I've been thinking for ${elapsed} second${elapsed > 1 ? 's' : ''}...`);
      } else {
        setCurrentMessage('I\'m thinking deeply about this to answer appropriately...');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isThinking]);

  if (!isThinking || canStream) return null;

  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 px-4 py-3 rounded-lg max-w-md">
        <div className="flex items-center space-x-3">
          {/* Animated thinking icon */}
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
              <Brain className="w-5 h-5 text-[#FFC627] animate-pulse" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-gray-700 text-sm">{currentMessage}</span>
              {elapsedTime > 0 && (
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {elapsedTime}s
                </div>
              )}
            </div>
            
            {elapsedTime >= 5 && (
              <div className="mt-1 text-xs text-gray-500 flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                {modelName} is processing your request carefully
              </div>
            )}
          </div>
        </div>
        
        {/* Progress bar for deep thinking */}
        {elapsedTime >= 5 && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-[#FFC627] h-1 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.min(100, ((elapsedTime - 5) / 30) * 100)}%`,
                  animation: 'pulse 2s infinite'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressiveThinkingIndicator; 