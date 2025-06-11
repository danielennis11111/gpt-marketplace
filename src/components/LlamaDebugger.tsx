import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { checkLlamaIntegration } from '../utils/llamaKeyTester';

/**
 * A debugging component to verify Llama API integration is working correctly
 */
const LlamaDebugger: React.FC = () => {
  const { settings } = useSettings();
  const [results, setResults] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    setResults(null);
    
    try {
      const testResults = await checkLlamaIntegration(settings);
      setResults(testResults);
    } catch (error) {
      setResults(`Error running test: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 bg-white p-3 rounded-md shadow-md border border-gray-300 z-50">
        <button 
          onClick={() => setIsExpanded(true)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Debug Llama API
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-md shadow-md border border-gray-300 z-50 w-96">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-900">Llama API Debugger</h3>
        <button 
          onClick={() => setIsExpanded(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <span className="sr-only">Close</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">
          This tool checks if your Llama API key is properly configured and working across the application.
        </div>
        
        <button
          onClick={runTest}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md text-sm font-medium transition-colors"
        >
          {isLoading ? 'Testing...' : 'Test Llama API Integration'}
        </button>
      </div>
      
      {results && (
        <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm font-mono whitespace-pre-wrap">
          {results}
        </div>
      )}
    </div>
  );
};

export default LlamaDebugger; 