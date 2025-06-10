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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your AI model preferences and configurations</p>
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
                    <span className="block text-lg font-medium text-gray-900">Ollama (Local)</span>
                    <span className="block text-sm text-gray-500 mt-1">
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
                    <span className="block text-lg font-medium text-gray-900">Gemini</span>
                    <span className="block text-sm text-gray-500 mt-1">
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

              {/* Llama API Option */}
              <div 
                className={`border rounded-xl p-5 transition duration-200 ${
                  settings.preferredChatProvider === 'llama' 
                    ? 'border-purple-500 bg-purple-50' 
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
                    className="mt-1 text-purple-600 focus:ring-purple-500"
                    disabled={!isLlamaConfigured()}
                  />
                  <label htmlFor="provider-llama" className="ml-3 cursor-pointer flex-1">
                    <span className="block text-lg font-medium text-gray-900">Llama API</span>
                    <span className="block text-sm text-gray-500 mt-1">
                      Cloud-based Meta Llama models. Requires API key.
                    </span>
                  </label>
                </div>
                
                <div className="mt-3 ml-7">
                  <div className="mb-3">
                    <label htmlFor="llama-api-key" className="block text-sm font-medium text-gray-700">
                      API Key
                    </label>
                    <div className="mt-1 flex relative rounded-md shadow-sm">
                      <input
                        type={showLlamaApiKey ? "text" : "password"}
                        name="llama-api-key"
                        id="llama-api-key"
                        value={tempLlamaApiKey}
                        onChange={(e) => handleLlamaApiKeyChange(e.target.value)}
                        className="focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3"
                        placeholder="Enter your Llama API key"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLlamaApiKey(!showLlamaApiKey)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                      >
                        {showLlamaApiKey ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap space-x-2">
                    <button
                      type="button"
                      onClick={saveLlamaApiKey}
                      disabled={!unsavedLlamaChanges}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                        unsavedLlamaChanges
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Save
                    </button>
                    {unsavedLlamaChanges && (
                      <button
                        type="button"
                        onClick={discardLlamaChanges}
                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        Discard
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={clearLlamaApiKey}
                      disabled={!tempLlamaApiKey}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center ${
                        tempLlamaApiKey
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={testLlamaConnection}
                      disabled={testingLlamaConnection || !tempLlamaApiKey}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center ${
                        !testingLlamaConnection && tempLlamaApiKey
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {testingLlamaConnection ? (
                        <>
                          <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-3 w-3 mr-1" />
                          Test Connection
                        </>
                      )}
                    </button>
                  </div>
                  
                  {llamaConnectionResult && (
                    <div className={`mt-3 p-2 text-sm rounded ${
                      llamaConnectionResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      <div className="flex items-center">
                        {llamaConnectionResult.success ? (
                          <CheckCircleIcon className="h-4 w-4 mr-1.5 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 mr-1.5 text-red-500" />
                        )}
                        <span>{llamaConnectionResult.message}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 text-xs text-gray-500">
                    <a 
                      href="https://www.llama-api.com" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 flex items-center"
                    >
                      Get a Llama API key
                      <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
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
      </div>
    </div>
  );
}; 