import React, { useState, useEffect } from 'react';
import { Bug, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ModelManager } from '../services/ModelManager';
import AIServiceRouter from '../services/AIServiceRouter';

interface DebugPanelProps {
  modelManager: ModelManager;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ modelManager }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<{
    openai: boolean | null;
    gemini: boolean | null;
    llama: boolean | null;
  }>({
    openai: null,
    gemini: null,
    llama: null
  });
  const [lastTest, setLastTest] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const testServices = async () => {
    setIsRefreshing(true);
    try {
      const router = new AIServiceRouter();
      const availability = await router.checkAvailability();
      setServiceStatus(availability);
      setLastTest(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error testing services:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const testModel = async (modelId: string) => {
    setIsRefreshing(true);
    try {
      console.log(`🧪 Testing ${modelId}...`);
      const router = new AIServiceRouter();
      
      const testMessage = [{
        role: 'user' as const,
        content: 'Hello! This is a test message.'
      }];

      const response = await router.sendMessage(testMessage, modelId, {
        maxTokens: 50,
        temperature: 0.1
      });

      console.log(`✅ ${modelId} test result:`, response);
      alert(`${modelId} works! Response: ${response.content.substring(0, 100)}...`);
    } catch (error) {
      console.error(`❌ ${modelId} test failed:`, error);
      alert(`${modelId} failed: ${error}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    testServices();
  }, []);

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <Clock className="w-4 h-4 text-gray-400" />;
    if (status === true) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = (status: boolean | null) => {
    if (status === null) return 'Testing...';
    if (status === true) return 'Online';
    return 'Offline';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 z-50"
        title="Open Debug Panel"
      >
        <Bug className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <Bug className="w-4 h-4 mr-2" />
          Debug Panel
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={testServices}
            disabled={isRefreshing}
            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Service Status */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Service Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">OpenAI</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(serviceStatus.openai)}
                <span className="text-xs">{getStatusText(serviceStatus.openai)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Gemini</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(serviceStatus.gemini)}
                <span className="text-xs">{getStatusText(serviceStatus.gemini)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Llama (Local)</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(serviceStatus.llama)}
                <span className="text-xs">{getStatusText(serviceStatus.llama)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Check */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">API Keys</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>OpenAI:</span>
              <span className={process.env.REACT_APP_OPENAI_API_KEY ? 'text-green-600' : 'text-red-600'}>
                {process.env.REACT_APP_OPENAI_API_KEY ? 'Set' : 'Missing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Gemini:</span>
              <span className={process.env.REACT_APP_GEMINI_API_KEY ? 'text-green-600' : 'text-red-600'}>
                {process.env.REACT_APP_GEMINI_API_KEY ? 'Set' : 'Missing'}
              </span>
            </div>
          </div>
        </div>

        {/* Model Tests */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Test Models</h4>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => testModel('gpt-4o')}
              disabled={isRefreshing}
              className="px-3 py-1 text-xs bg-[#FFC627] bg-opacity-20 text-[#191919] rounded hover:bg-[#FFC627] hover:bg-opacity-30 disabled:opacity-50"
            >
              Test GPT-4o
            </button>
            <button
              onClick={() => testModel('gemini-2.0-flash')}
              disabled={isRefreshing}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
            >
              Test Gemini
            </button>
            <button
              onClick={() => testModel('llama3.1:8b')}
              disabled={isRefreshing}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 disabled:opacity-50"
            >
              Test Llama
            </button>
          </div>
        </div>

        {lastTest && (
          <div className="text-xs text-gray-500 text-center">
            Last checked: {lastTest}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel; 