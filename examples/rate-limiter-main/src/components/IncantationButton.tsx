import React, { useState } from 'react';
import { Play, Terminal, Copy, Check, AlertCircle } from 'lucide-react';

interface IncantationButtonProps {
  command: string;
  description: string;
  workingDirectory?: string;
  onExecute: (command: string, workingDirectory?: string) => Promise<{ success: boolean; output: string; error?: string }>;
  variant?: 'primary' | 'secondary' | 'danger';
}

const IncantationButton: React.FC<IncantationButtonProps> = ({
  command,
  description,
  workingDirectory,
  onExecute,
  variant = 'primary'
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; output: string; error?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExecute = async () => {
    setIsRunning(true);
    setLastResult(null);
    
    try {
      const result = await onExecute(command, workingDirectory);
      setLastResult(result);
    } catch (error) {
      setLastResult({
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy command:', error);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          button: 'bg-red-600 text-white hover:bg-red-700 border-red-600',
          border: 'border-red-200 bg-red-50/30'
        };
      case 'secondary':
        return {
          button: 'bg-gray-600 text-white hover:bg-gray-700 border-gray-600',
          border: 'border-gray-200 bg-gray-50/30'
        };
      default:
        return {
          button: 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600',
          border: 'border-blue-200 bg-blue-50/30'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`border rounded-lg p-4 my-3 ${styles.border}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-900">{description}</span>
        </div>
        
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          title="Copy command"
        >
          {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Command Display */}
      <div className="mb-4">
        <div className="bg-gray-900 text-green-400 rounded-lg p-3 font-mono text-sm overflow-x-auto">
          <div className="flex items-center space-x-2">
            <span className="text-blue-400">$</span>
            <span>{command}</span>
          </div>
        </div>
        
        {workingDirectory && (
          <div className="text-xs text-gray-500 mt-1 font-mono">
            Working directory: {workingDirectory}
          </div>
        )}
      </div>

      {/* Execute Button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleExecute}
          disabled={isRunning}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isRunning
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : `${styles.button}`
          }`}
        >
          <Play className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} />
          <span>{isRunning ? 'Running...' : 'Run Incantation'}</span>
        </button>
        
        {lastResult && (
          <div className={`flex items-center space-x-1 text-sm ${
            lastResult.success ? 'text-green-600' : 'text-red-600'
          }`}>
            {lastResult.success ? (
              <Check className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{lastResult.success ? 'Success' : 'Failed'}</span>
          </div>
        )}
      </div>

      {/* Output Display */}
      {lastResult && (lastResult.output || lastResult.error) && (
        <div className="mt-4">
          <div className="text-xs font-medium text-gray-600 mb-1">Output:</div>
          <div className={`bg-gray-900 rounded-lg p-3 text-sm font-mono max-h-40 overflow-y-auto ${
            lastResult.success ? 'text-green-400' : 'text-red-400'
          }`}>
            <pre className="whitespace-pre-wrap">
              {lastResult.error || lastResult.output}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncantationButton; 