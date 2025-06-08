import React, { useState, useEffect } from 'react';
import { LlamaService } from '../utils/llamaService';

interface LlamaServerStatusProps {
  llamaService: LlamaService;
}

export const LlamaServerStatus: React.FC<LlamaServerStatusProps> = ({ llamaService }) => {
  const [isServerRunning, setIsServerRunning] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const checkServerStatus = async () => {
    setIsChecking(true);
    try {
      const running = await llamaService.isServerRunning();
      setIsServerRunning(running);
    } catch (error) {
      setIsServerRunning(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Check server status on component mount and periodically
  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusColor = () => {
    if (isServerRunning === null || isChecking) return 'text-yellow-500';
    return isServerRunning ? 'text-green-500' : 'text-red-500';
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    if (isServerRunning === null) return 'Unknown';
    return isServerRunning ? 'Online' : 'Offline';
  };

  const getStatusIcon = () => {
    if (isChecking) return '⟳';
    if (isServerRunning === null) return '?';
    return isServerRunning ? '●' : '●';
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <span className={`${getStatusColor()}`}>
        {getStatusIcon()}
      </span>
      <span className="text-gray-600">
        Ollama Server: <span className={getStatusColor()}>{getStatusText()}</span>
      </span>
      
      {!isServerRunning && (
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-[#FFC627] hover:text-yellow-600 underline text-xs"
        >
          Start Guide
        </button>
      )}
      
      <button
        onClick={checkServerStatus}
        disabled={isChecking}
        className="text-gray-400 hover:text-gray-600 text-xs px-1"
        title="Refresh status"
      >
        ↻
      </button>

      {showInstructions && !isServerRunning && (
        <div className="absolute z-50 mt-2 p-4 bg-gray-900 text-white rounded-lg shadow-xl max-w-md">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-sm">Start Ollama Server</h3>
            <button
              onClick={() => setShowInstructions(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2 text-xs">
            <p className="text-gray-300">To enable AI responses, start the Ollama server:</p>
            
            <div className="bg-gray-800 p-2 rounded font-mono text-green-400">
              brew services start ollama
            </div>
            
            <p className="text-gray-300">Or run manually:</p>
            
            <div className="bg-gray-800 p-2 rounded font-mono text-green-400 break-all">
              ollama serve
            </div>
            
            <div className="border-t border-gray-700 pt-2 mt-2">
              <p className="text-gray-400 text-xs">
                💡 While the server is offline, you'll see simulated responses.
                Once online, you'll get real AI-powered assistance!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 