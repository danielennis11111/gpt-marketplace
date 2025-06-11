import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useChatService } from '../hooks/useChatService';
import { useOllama } from '../hooks/useOllama';
import EmbeddedTerminal from '../components/EmbeddedTerminal';
import {
  CogIcon,
  KeyIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckIcon,
  ServerIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { fetchAllAvailableModels, debugModelLoading } from '../utils/modelHelper';
import EnhancedRAGDemo from '../components/EnhancedRAGDemo';
import CitationDemo from '../components/CitationDemo';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettings, isGeminiConfigured, isLlamaConfigured } = useSettings();
  const chatService = useChatService();
  const ollama = useOllama();
  const [showApiKey, setShowApiKey] = useState(false);
  const [showLlamaApiKey, setShowLlamaApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(settings.geminiApiKey);
  const [tempLlamaApiKey, setTempLlamaApiKey] = useState(settings.llamaApiKey);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testingLlamaConnection, setTestingLlamaConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null);
  const [llamaConnectionResult, setLlamaConnectionResult] = useState<{ success: boolean; message: string } | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [unsavedLlamaChanges, setUnsavedLlamaChanges] = useState(false);
  const [refreshingModels, setRefreshingModels] = useState(false);
  const [modelPullStatus, setModelPullStatus] = useState<{ model: string; status: string } | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isDebugLoading, setIsDebugLoading] = useState(false);

  // Effect to update ollamaModel in settings when model changes
  useEffect(() => {
    if (ollama.status.currentModel && ollama.status.currentModel !== settings.ollamaModel) {
      updateSettings({ ollamaModel: ollama.status.currentModel });
    }
  }, [ollama.status.currentModel, settings.ollamaModel, updateSettings]);

  const handleApiKeyChange = (value: string) => {
    setTempApiKey(value);
    setUnsavedChanges(value !== settings.geminiApiKey);
    setConnectionResult(null);
  };

  const handleLlamaApiKeyChange = (value: string) => {
    setTempLlamaApiKey(value);
    setUnsavedLlamaChanges(value !== settings.llamaApiKey);
    setLlamaConnectionResult(null);
  };

  const saveApiKey = () => {
    updateSettings({ geminiApiKey: tempApiKey });
    setUnsavedChanges(false);
  };

  const saveLlamaApiKey = () => {
    updateSettings({ llamaApiKey: tempLlamaApiKey });
    setUnsavedLlamaChanges(false);
  };

  const discardChanges = () => {
    setTempApiKey(settings.geminiApiKey);
    setUnsavedChanges(false);
    setConnectionResult(null);
  };

  const discardLlamaChanges = () => {
    setTempLlamaApiKey(settings.llamaApiKey);
    setUnsavedLlamaChanges(false);
    setLlamaConnectionResult(null);
  };

  const clearApiKey = () => {
    setTempApiKey('');
    updateSettings({ geminiApiKey: '', preferredChatProvider: 'ollama' });
    setUnsavedChanges(false);
    setConnectionResult(null);
  };

  const clearLlamaApiKey = () => {
    setTempLlamaApiKey('');
    updateSettings({ llamaApiKey: '', preferredChatProvider: 'ollama' });
    setUnsavedLlamaChanges(false);
    setLlamaConnectionResult(null);
  };

  const testConnection = async () => {
    if (!tempApiKey.trim()) {
      setConnectionResult({ success: false, message: 'Please enter an API key first' });
      return;
    }

    setTestingConnection(true);
    setConnectionResult(null);

    try {
      // Temporarily test with the current temp key
      const tempService = new (await import('../services/geminiService')).GeminiService(tempApiKey);
      const result = await tempService.testConnection();
      setConnectionResult(result);
      
      if (result.success && unsavedChanges) {
        // Auto-save if test is successful
        saveApiKey();
      }
    } catch (error) {
      setConnectionResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const testLlamaConnection = async () => {
    if (!tempLlamaApiKey.trim()) {
      setLlamaConnectionResult({ success: false, message: 'Please enter an API key first' });
      return;
    }

    setTestingLlamaConnection(true);
    setLlamaConnectionResult(null);

    try {
      // Temporarily test with the current temp key
      const tempService = new (await import('../services/llamaApiService')).LlamaApiService(tempLlamaApiKey);
      const result = await tempService.testConnection();
      setLlamaConnectionResult(result);
      
      if (result.success && unsavedLlamaChanges) {
        // Auto-save if test is successful
        saveLlamaApiKey();
      }
    } catch (error) {
      setLlamaConnectionResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      });
    } finally {
      setTestingLlamaConnection(false);
    }
  };

  const handleProviderChange = (provider: 'ollama' | 'gemini' | 'llama') => {
    if (provider === 'gemini' && !isGeminiConfigured()) {
      // Don't allow switching to Gemini if not configured
      return;
    }
    if (provider === 'llama' && !isLlamaConfigured()) {
      // Don't allow switching to Llama if not configured
      return;
    }
    updateSettings({ preferredChatProvider: provider });
  };

  const refreshOllamaModels = async () => {
    setRefreshingModels(true);
    await ollama.checkOllamaStatus();
    setRefreshingModels(false);
  };

  const handlePullModel = async (modelName: string) => {
    setModelPullStatus({ model: modelName, status: 'starting' });
    
    try {
      const result = await ollama.pullModel(modelName);
      
      if (result.needsManualPull) {
        window.alert(result.message);
        setModelPullStatus(null);
      } else if (result.success) {
        setModelPullStatus({ model: modelName, status: 'success' });
        setTimeout(() => {
          refreshOllamaModels();
          setModelPullStatus(null);
        }, 2000);
      } else {
        setModelPullStatus(null);
        refreshOllamaModels();
      }
    } catch (error) {
      setModelPullStatus(null);
      refreshOllamaModels();
    }
  };

  const handlePullLlama4Scout = async () => {
    if (window.confirm('Download llama4scout model? This may take several minutes depending on your internet connection.')) {
      handlePullModel('llama4scout');
    }
  };

  const handleDebugCheck = async () => {
    setIsDebugLoading(true);
    try {
      const results = await fetchAllAvailableModels({
        llamaApiKey: settings.llamaApiKey,
        geminiApiKey: settings.geminiApiKey
      });
      
      console.log('Debug results:', results);
      setDebugInfo(results);
    } catch (error) {
      console.error('Debug check error:', error);
      setDebugInfo({ error: String(error) });
    } finally {
      setIsDebugLoading(false);
    }
  };

  // Add a function to generate fallback information based on available providers
  const getFallbackInfo = () => {
    const providers = [];
    if (isGeminiConfigured()) providers.push('Gemini');
    if (isLlamaConfigured()) providers.push('Llama');
    if (ollama.status.isConnected) providers.push('Ollama');

    if (providers.length === 0) {
      return "No AI providers are configured. Configure at least one provider below.";
    } else if (providers.length === 1) {
      return `${providers[0]} is your only configured AI provider.`;
    } else {
      const primary = settings.preferredChatProvider === 'gemini' ? 'Gemini' : 
                      settings.preferredChatProvider === 'llama' ? 'Llama' : 'Ollama';
      const fallbacks = providers.filter(p => p.toLowerCase() !== settings.preferredChatProvider);
      
      return `${primary} is your primary provider with ${fallbacks.join(' and ')} as fallback${fallbacks.length > 1 ? 's' : ''}.`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your AI model preferences and configurations</p>
        </div>

        {/* Fallback Information Card */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 mb-6">
          <div className="flex">
            <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">AI Provider Status</h3>
              <p className="text-gray-600 mb-2">
                {isGeminiConfigured() || isLlamaConfigured() || ollama.status.isConnected ? 
                  `Your primary provider is ${settings.preferredChatProvider === 'gemini' ? 'Gemini' : 
                                              settings.preferredChatProvider === 'llama' ? 'Llama' : 'Ollama'}. 
                   The app will automatically use other configured providers as fallbacks if needed.` : 
                  'No AI providers are configured. Configure at least one provider below.'}
              </p>
              <p className="text-sm text-gray-500">
                All chat components will try alternative providers if the primary one fails or is unavailable.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Chat Provider Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Chat Provider</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              Choose your preferred AI model provider for the marketplace assistant and idea generation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ollama Option */}
              <div 
                className={`border rounded-xl p-5 transition duration-200 ${
                  settings.preferredChatProvider === 'ollama' 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start mb-4">
                  <input
                    type="radio"
                    id="provider-ollama"
                    name="chatProvider"
                    value="ollama"
                    checked={settings.preferredChatProvider === 'ollama'}
                    onChange={() => handleProviderChange('ollama')}
                    className="mt-1 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="provider-ollama" className="ml-3 cursor-pointer flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <img 
                        src="/ollama-logo.png"
                        alt="Ollama"
                        className="w-5 h-5 object-contain"
                      />
                      <span className="text-lg font-medium text-gray-900">Ollama (Local)</span>
                    </div>
                    <span className="block text-sm text-gray-500">
                      Run AI models locally on your machine. Free but requires setup.
                    </span>
                  </label>
                </div>

                {settings.preferredChatProvider === 'ollama' && (
                  <div className="mt-2 ml-7">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-700">Available Models</h3>
                      <button 
                        onClick={refreshOllamaModels} 
                        disabled={refreshingModels}
                        className="inline-flex items-center text-xs text-red-600 hover:text-red-800"
                      >
                        <ArrowPathIcon className={`w-3 h-3 mr-1 ${refreshingModels ? 'animate-spin' : ''}`} />
                        {refreshingModels ? 'Refreshing...' : 'Refresh'}
                      </button>
                    </div>

                    {ollama.status.isConnected ? (
                      <>
                        {ollama.status.models.length > 0 ? (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {ollama.status.models.map((model) => (
                              <label 
                                key={model.name}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                                  ollama.status.currentModel === model.name 
                                    ? 'bg-red-100' 
                                    : 'hover:bg-gray-100'
                                }`}
                              >
                                <div className="flex items-center">
                                  <input
                                    type="radio"
                                    name="ollamaModel"
                                    value={model.name}
                                    checked={ollama.status.currentModel === model.name}
                                    onChange={() => ollama.setCurrentModel(model.name)}
                                    className="text-red-600 focus:ring-red-500"
                                  />
                                  <div className="ml-2">
                                    <div className="font-medium text-sm text-gray-900">{model.name}</div>
                                    <div className="text-xs text-gray-500">
                                      {model.size && `${model.size}`}
                                    </div>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg text-center text-sm">
                            <p className="text-gray-700 mb-2">No models found</p>
                            <a 
                              href="https://ollama.com/library" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center text-red-600 hover:text-red-800 text-xs"
                            >
                              Browse Model Library
                              <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                            </a>
                          </div>
                        )}
                        
                        {/* Show notification for missing llama4scout model */}
                        {ollama.suggestReinstallLlama4Scout() && (
                          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start">
                              <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 mr-1.5 flex-shrink-0" />
                              <div>
                                <p className="text-amber-800 text-xs font-medium">llama4scout model not found</p>
                                <p className="text-amber-700 text-xs mt-1">
                                  You previously selected this model but it's not currently installed.
                                  Run <code className="bg-amber-100 px-1 py-0.5 rounded">ollama pull llama4scout</code> to install it.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-3 text-xs text-gray-500">
                          Install models with <code className="bg-gray-100 px-1 py-0.5 rounded">ollama pull model_name</code>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                          <p>Common Ollama commands:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li><code className="bg-gray-100 px-1 py-0.5 rounded">ollama list</code> - List installed models</li>
                            <li><code className="bg-gray-100 px-1 py-0.5 rounded">ollama pull llama3:8b</code> - Download a model</li>
                            <li><code className="bg-gray-100 px-1 py-0.5 rounded">ollama serve</code> - Start Ollama server</li>
                            <li><code className="bg-gray-100 px-1 py-0.5 rounded">ollama --help</code> - Show help</li>
                          </ul>
                        </div>
                        
                        {/* Quick Model Installer */}
                        <div className="mt-4 border-t border-gray-100 pt-3">
                          <h4 className="text-xs font-medium text-gray-700 mb-2">Looking for more models?</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={handlePullLlama4Scout}
                              disabled={modelPullStatus?.model === 'llama4scout' && modelPullStatus.status === 'starting'}
                              className={`text-center text-xs py-1.5 px-2 rounded text-red-800 transition-colors ${
                                modelPullStatus?.model === 'llama4scout' && modelPullStatus.status === 'starting' 
                                  ? 'bg-gray-100 cursor-not-allowed' 
                                  : 'bg-red-100 hover:bg-red-200'
                              }`}
                            >
                              {modelPullStatus?.model === 'llama4scout' && modelPullStatus.status === 'starting' 
                                ? 'Processing...' 
                                : modelPullStatus?.model === 'llama4scout' && modelPullStatus.status === 'success'
                                  ? 'Success!' 
                                  : 'Pull llama4scout'}
                            </button>
                            <a 
                              href="https://ollama.com/library" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-center text-xs py-1.5 px-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-800 transition-colors"
                            >
                              Browse Model Library
                            </a>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                              onClick={() => refreshOllamaModels()}
                              className="text-center text-xs py-1.5 px-2 bg-blue-100 hover:bg-blue-200 rounded text-blue-800 transition-colors flex items-center justify-center"
                            >
                              <ArrowPathIcon className={`w-3 h-3 mr-1 ${refreshingModels ? 'animate-spin' : ''}`} />
                              Refresh Models
                            </button>
                            <button
                              onClick={() => {
                                const command = window.prompt('Enter model to pull (e.g., llama3:8b, gemma:7b)', 'llama3:8b');
                                if (command) {
                                  handlePullModel(command);
                                }
                              }}
                              className="text-center text-xs py-1.5 px-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-800 transition-colors"
                            >
                              Pull Other Model
                            </button>
                          </div>
                          
                          <div className="mt-2 text-xs text-gray-500">
                            <p>Popular models: llama3:8b, gemma:7b, mistral:7b, llama2:7b</p>
                            <p className="mt-1">High-performance models: devstral:24b, llama4:16x17b</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start">
                            <XCircleIcon className="w-4 h-4 text-yellow-600 mt-0.5 mr-1.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-yellow-800 text-xs font-medium">Ollama is not running</p>
                              <p className="text-yellow-700 text-xs mt-1">
                                Start the Ollama server to use local AI models
                              </p>
                              
                              <div className="mt-3 flex items-center gap-2">
                                <button
                                  onClick={ollama.checkOllamaStatus}
                                  className="flex items-center justify-center text-xs font-medium py-1.5 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                  <ArrowPathIcon className="w-3 h-3 mr-1.5" />
                                  Check Connection
                                </button>
                                
                                <a 
                                  href="https://ollama.com/download" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center text-xs font-medium py-1.5 px-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                >
                                  <ArrowTopRightOnSquareIcon className="w-3 h-3 mr-1.5" />
                                  Download Ollama
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Embedded Terminal */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <ServerIcon className="w-4 h-4 mr-1.5 text-red-600" />
                            Embedded Terminal
                          </h4>
                          <p className="text-xs text-gray-600 mb-2">
                            Use this terminal to start the Ollama server directly from your browser
                          </p>
                          
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <EmbeddedTerminal 
                              onCommandRun={() => {
                                // Set a timeout to check Ollama status
                                setTimeout(() => {
                                  ollama.checkOllamaStatus();
                                }, 5000);
                              }}
                              autoFocus={true}
                            />
                          </div>
                          
                          <p className="text-xs text-gray-500 mt-2">
                            Type <code className="bg-gray-100 px-1 py-0.5 rounded">ollama serve</code> in the terminal above to start the Ollama server.
                            After installing Ollama, you can pull models with <code className="bg-gray-100 px-1 py-0.5 rounded">ollama pull llama3:8b</code>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Gemini Option */}
              <div 
                className={`border rounded-xl p-5 transition duration-200 ${
                  settings.preferredChatProvider === 'gemini' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start mb-4">
                  <input
                    type="radio"
                    id="provider-gemini"
                    name="chatProvider"
                    value="gemini"
                    checked={settings.preferredChatProvider === 'gemini'}
                    onChange={() => handleProviderChange('gemini')}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                    disabled={!isGeminiConfigured()}
                  />
                  <label htmlFor="provider-gemini" className="ml-3 cursor-pointer flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <img 
                        src="/gemini-logo.png"
                        alt="Google Gemini"
                        className="w-5 h-5 object-contain"
                      />
                      <span className="text-lg font-medium text-gray-900">Gemini</span>
                    </div>
                    <span className="block text-sm text-gray-500">
                      Cloud-based AI from Google. Free tier available.
                    </span>
                  </label>
                </div>

                {(settings.preferredChatProvider === 'gemini' || !isGeminiConfigured()) && (
                  <div className="mt-2 ml-7">
                    <div className="space-y-3">
                      <div>
                        <div className="relative">
                          <input
                            type={showApiKey ? 'text' : 'password'}
                            id="gemini-api-key"
                            value={tempApiKey}
                            onChange={(e) => handleApiKeyChange(e.target.value)}
                            placeholder="Enter your Gemini API key..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showApiKey ? (
                              <EyeSlashIcon className="w-4 h-4" />
                            ) : (
                              <EyeIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            <a 
                              href="https://aistudio.google.com/app/apikey" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Get free API key
                            </a>
                          </p>
                          {settings.geminiApiKey && (
                            <div className="relative group">
                              <div className="flex items-center text-xs text-green-600 cursor-help">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                Securely stored
                              </div>
                              <div className="absolute bottom-full right-0 mb-2 w-56 p-2 bg-gray-800 text-xs text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                Your API key is encrypted before being stored locally in your browser. It never leaves your device and is not transmitted to any servers.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Connection Test Result */}
                      {connectionResult && (
                        <div className={`p-2 rounded-lg ${
                          connectionResult.success 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          <div className="flex items-center">
                            {connectionResult.success ? (
                              <CheckCircleIcon className="w-4 h-4 text-green-600 mr-1.5" />
                            ) : (
                              <XCircleIcon className="w-4 h-4 text-red-600 mr-1.5" />
                            )}
                            <span className={`text-xs font-medium ${
                              connectionResult.success ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {connectionResult.message}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={testConnection}
                          disabled={testingConnection || !tempApiKey.trim()}
                          className="inline-flex items-center px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {testingConnection ? (
                            <ArrowPathIcon className="w-3 h-3 mr-1.5 animate-spin" />
                          ) : (
                            <CheckCircleIcon className="w-3 h-3 mr-1.5" />
                          )}
                          {testingConnection ? 'Testing...' : 'Test Connection'}
                        </button>

                        {unsavedChanges && (
                          <>
                            <button
                              onClick={saveApiKey}
                              className="inline-flex items-center px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={discardChanges}
                              className="inline-flex items-center px-3 py-1.5 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {(tempApiKey || settings.geminiApiKey) && (
                          <button
                            onClick={clearApiKey}
                            className="inline-flex items-center px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <TrashIcon className="w-3 h-3 mr-1.5" />
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Llama Option */}
              <div 
                className={`border rounded-xl p-5 transition duration-200 ${
                  settings.preferredChatProvider === 'llama' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start mb-4">
                  <input
                    type="radio"
                    id="provider-llama"
                    name="chatProvider"
                    value="llama"
                    checked={settings.preferredChatProvider === 'llama'}
                    onChange={() => handleProviderChange('llama')}
                    className="mt-1 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="provider-llama" className="ml-3 cursor-pointer flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">M</span>
                      </div>
                      <span className="text-lg font-medium text-gray-900">Llama (Cloud API)</span>
                    </div>
                    <span className="block text-sm text-gray-500">
                      Access Meta's powerful Llama models via cloud API. Requires API key.
                    </span>
                  </label>
                </div>

                {settings.preferredChatProvider === 'llama' && (
                  <div className="mt-2 ml-7">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <div className="flex items-center">
                        {isLlamaConfigured() ? (
                          <>
                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-1" />
                            <span className="text-green-600 text-sm">Connected</span>
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="w-5 h-5 text-red-500 mr-1" />
                            <span className="text-red-600 text-sm">Not configured</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-2">
                      <strong>Debug:</strong> Llama API key is {settings.llamaApiKey ? 'set' : 'not set'}, 
                      length: {settings.llamaApiKey?.length || 0} chars
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <a 
                        href="https://www.llama-api.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        Get an API key
                        <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                      </a>
                      
                      <button
                        onClick={testLlamaConnection}
                        disabled={testingLlamaConnection || !tempLlamaApiKey.trim()}
                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {testingLlamaConnection ? 'Testing...' : 'Test Connection'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  chatService.isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium text-blue-900">
                  Current provider: {chatService.providerName} 
                  {chatService.isConnected ? ' (Connected)' : ' (Disconnected)'}
                </span>
              </div>
            </div>
          </div>

          {/* Gemini API Key */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <KeyIcon className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Gemini API Key</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Enter your Google AI Studio API key to use Gemini models. 
              <a 
                href="https://aistudio.google.com/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 ml-1 inline-flex items-center"
              >
                Get API key <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
              </a>
            </p>

            <div className="mb-4">
              <label htmlFor="gemini-api-key" className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <div className="relative rounded-md">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  id="gemini-api-key"
                  placeholder="Enter your Gemini API key"
                  value={tempApiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center bg-transparent text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex space-x-2">
                <button
                  onClick={testConnection}
                  disabled={testingConnection}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testingConnection ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </button>
                
                <button
                  onClick={clearApiKey}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="h-4 w-4 mr-1 text-gray-500" />
                  Clear
                </button>
              </div>
              
              {unsavedChanges && (
                <div className="flex space-x-2">
                  <button
                    onClick={discardChanges}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveApiKey}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Save
                  </button>
                </div>
              )}
            </div>

            {connectionResult && (
              <div className={`mt-3 rounded-md p-3 text-sm ${connectionResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {connectionResult.success ? (
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    {connectionResult.message}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                    {connectionResult.message}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Llama API Key */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <KeyIcon className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Llama API Key</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Enter your Llama API key to use Meta's Llama models. 
              <a 
                href="https://llama.meta.com/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-800 ml-1 inline-flex items-center"
              >
                Get API key <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
              </a>
            </p>

            <div className="mb-4">
              <label htmlFor="llama-api-key" className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <div className="relative rounded-md">
                <input
                  type={showLlamaApiKey ? 'text' : 'password'}
                  id="llama-api-key"
                  placeholder="Enter your Llama API key"
                  value={tempLlamaApiKey}
                  onChange={(e) => handleLlamaApiKeyChange(e.target.value)}
                  className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowLlamaApiKey(!showLlamaApiKey)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center bg-transparent text-gray-500 hover:text-gray-700"
                >
                  {showLlamaApiKey ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex space-x-2">
                <button
                  onClick={testLlamaConnection}
                  disabled={testingLlamaConnection}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testingLlamaConnection ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </button>
                
                <button
                  onClick={clearLlamaApiKey}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="h-4 w-4 mr-1 text-gray-500" />
                  Clear
                </button>
              </div>
              
              {unsavedLlamaChanges && (
                <div className="flex space-x-2">
                  <button
                    onClick={discardLlamaChanges}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveLlamaApiKey}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Save
                  </button>
                </div>
              )}
            </div>

            {llamaConnectionResult && (
              <div className={`mt-3 rounded-md p-3 text-sm ${llamaConnectionResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {llamaConnectionResult.success ? (
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    {llamaConnectionResult.message}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                    {llamaConnectionResult.message}
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
              <ExclamationTriangleIcon className="w-5 h-5 inline-block mr-1 text-yellow-500" />
              <span>Debug info: </span>
              <code className="bg-gray-100 px-1 py-0.5 rounded">isLlamaConfigured(): {isLlamaConfigured() ? 'true' : 'false'}</code>
              <span>, API key length: </span>
              <code className="bg-gray-100 px-1 py-0.5 rounded">{settings.llamaApiKey?.length || 0}</code>
            </div>
          </div>

          {/* Other Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <CogIcon className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Enable Notifications</div>
                  <div className="text-sm text-gray-500">
                    Receive notifications for new community ideas and updates
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
                  className="toggle-checkbox text-red-600 focus:ring-red-500"
                />
              </label>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset all settings? This action cannot be undone.')) {
                    resetSettings();
                    setTempApiKey('');
                    setUnsavedChanges(false);
                    setConnectionResult(null);
                  }
                }}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Reset All Settings
              </button>
              <p className="text-sm text-gray-500 mt-2">
                This will clear all your preferences and API keys.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">Developer Debug</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Check connectivity and available models for configured API services.
          </p>
          
          <div className="mb-4">
            <button
              onClick={handleDebugCheck}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              disabled={isDebugLoading}
            >
              {isDebugLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking...
                </>
              ) : (
                'Check Available Models'
              )}
            </button>
          </div>
          
          {debugInfo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Debug Results</h3>
              
              {debugInfo.map((info: any, index: number) => (
                <div key={index} className="mb-4 p-3 border border-gray-200 rounded-md bg-white">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold capitalize">{info.provider} Provider</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      info.apiKeyConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {info.apiKeyConfigured ? 'API Key Configured' : 'No API Key'}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm">
                      {info.error ? (
                        <span className="text-red-600">{info.error}</span>
                      ) : (
                        <span className="text-green-600">Found {info.modelCount} models</span>
                      )}
                    </p>
                    
                    {info.models.length > 0 && (
                      <div className="mt-2 max-h-48 overflow-y-auto">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-2 py-1 text-left">ID</th>
                              <th className="px-2 py-1 text-left">Name</th>
                              <th className="px-2 py-1 text-left">Version</th>
                            </tr>
                          </thead>
                          <tbody>
                            {info.models.map((model: any, modelIndex: number) => (
                              <tr key={modelIndex} className="border-t border-gray-200">
                                <td className="px-2 py-1 font-mono">{model.id}</td>
                                <td className="px-2 py-1">{model.name}</td>
                                <td className="px-2 py-1">{model.version || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced RAG File Support Demo */}
        <div className="mt-8">
          <EnhancedRAGDemo />
        </div>

        {/* Citation System Demo */}
        <div className="mt-8">
          <CitationDemo />
        </div>
      </div>
    </div>
  );
}; 