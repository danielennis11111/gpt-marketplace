import React, { useState, useEffect } from 'react';
import {
  saveLlamaApiKey,
  saveGeminiApiKey,
  removeLlamaApiKey,
  removeGeminiApiKey,
  hasLlamaApiKey,
  hasGeminiApiKey,
  testLlamaConnection,
  testGeminiConnection,
  testOllamaConnection,
  listLlamaModels,
  listOllamaModels,
  setPrimaryModel,
  getPrimaryModel
} from '../lib/api';

interface Model {
  id: string;
  name: string;
  type: 'llama' | 'gemini' | 'ollama';
}

export default function Settings() {
  const [llamaApiKey, setLlamaApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isTestingLlama, setIsTestingLlama] = useState(false);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [isTestingOllama, setIsTestingOllama] = useState(false);
  const [llamaTestResult, setLlamaTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [geminiTestResult, setGeminiTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [ollamaTestResult, setOllamaTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  useEffect(() => {
    // Check if API keys exist in local storage
    if (hasLlamaApiKey()) {
      setLlamaApiKey('••••••••••••••••');
    }
    if (hasGeminiApiKey()) {
      setGeminiApiKey('••••••••••••••••');
    }

    // Load primary model selection
    const primary = getPrimaryModel();
    if (primary) {
      setSelectedModel({
        id: primary.model,
        name: primary.model,
        type: primary.type
      });
    }

    // Load available models
    loadAvailableModels();
  }, []);

  const loadAvailableModels = async () => {
    const models: Model[] = [];

    // Load Llama models if API key exists
    if (hasLlamaApiKey()) {
      const llamaResult = await listLlamaModels();
      if (llamaResult.success && llamaResult.data) {
        models.push(...llamaResult.data.map((m: any) => ({
          id: m.id,
          name: m.id,
          type: 'llama' as const
        })));
      }
    }

    // Load Ollama models
    const ollamaResult = await listOllamaModels();
    if (ollamaResult.success && ollamaResult.data) {
      models.push(...ollamaResult.data.models.map((m: any) => ({
        id: m.name,
        name: m.name,
        type: 'ollama' as const
      })));
    }

    // Add Gemini model
    if (hasGeminiApiKey()) {
      models.push({
        id: 'gemini-pro',
        name: 'Gemini Pro',
        type: 'gemini'
      });
    }

    setAvailableModels(models);
  };

  const handleSaveLlamaKey = async () => {
    if (!llamaApiKey) {
      setLlamaTestResult({ success: false, message: 'Please enter an API key' });
      return;
    }

    setIsTestingLlama(true);
    setLlamaTestResult(null);

    try {
      saveLlamaApiKey(llamaApiKey);
      const result = await testLlamaConnection();
      
      setLlamaTestResult({
        success: result.success,
        message: result.message || (result.success ? 'API key saved and verified!' : 'Failed to verify API key')
      });

      if (result.success) {
        loadAvailableModels();
      }
    } catch (error) {
      setLlamaTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred while testing the connection'
      });
    } finally {
      setIsTestingLlama(false);
    }
  };

  const handleSaveGeminiKey = async () => {
    if (!geminiApiKey) {
      setGeminiTestResult({ success: false, message: 'Please enter an API key' });
      return;
    }

    setIsTestingGemini(true);
    setGeminiTestResult(null);

    try {
      saveGeminiApiKey(geminiApiKey);
      const result = await testGeminiConnection();
      
      setGeminiTestResult({
        success: result.success,
        message: result.message || (result.success ? 'API key saved and verified!' : 'Failed to verify API key')
      });

      if (result.success) {
        loadAvailableModels();
      }
    } catch (error) {
      setGeminiTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred while testing the connection'
      });
    } finally {
      setIsTestingGemini(false);
    }
  };

  const handleTestOllama = async () => {
    setIsTestingOllama(true);
    setOllamaTestResult(null);

    try {
      const result = await testOllamaConnection();
      
      setOllamaTestResult({
        success: result.success,
        message: result.message || (result.success ? 'Successfully connected to Ollama!' : 'Failed to connect to Ollama')
      });

      if (result.success) {
        loadAvailableModels();
      }
    } catch (error) {
      setOllamaTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred while testing the connection'
      });
    } finally {
      setIsTestingOllama(false);
    }
  };

  const handleRemoveLlamaKey = () => {
    removeLlamaApiKey();
    setLlamaApiKey('');
    setLlamaTestResult(null);
    loadAvailableModels();
  };

  const handleRemoveGeminiKey = () => {
    removeGeminiApiKey();
    setGeminiApiKey('');
    setGeminiTestResult(null);
    loadAvailableModels();
  };

  const handleModelSelect = (model: Model) => {
    setSelectedModel(model);
    setPrimaryModel(model.id, model.type);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-8">
        {/* Llama API Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Llama API Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="llamaApiKey" className="block text-sm font-medium text-gray-700 mb-1">
                Llama API Key
              </label>
              <input
                type="password"
                id="llamaApiKey"
                value={llamaApiKey}
                onChange={(e) => setLlamaApiKey(e.target.value)}
                placeholder="Enter your Llama API key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleSaveLlamaKey}
                disabled={isTestingLlama}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isTestingLlama ? 'Testing...' : 'Save & Test Connection'}
              </button>
              
              {hasLlamaApiKey() && (
                <button
                  onClick={handleRemoveLlamaKey}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Remove Key
                </button>
              )}
            </div>

            {llamaTestResult && (
              <div className={`mt-4 p-4 rounded-md ${
                llamaTestResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {llamaTestResult.message}
              </div>
            )}
          </div>
        </div>

        {/* Gemini API Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Gemini API Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="geminiApiKey" className="block text-sm font-medium text-gray-700 mb-1">
                Gemini API Key
              </label>
              <input
                type="password"
                id="geminiApiKey"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleSaveGeminiKey}
                disabled={isTestingGemini}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isTestingGemini ? 'Testing...' : 'Save & Test Connection'}
              </button>
              
              {hasGeminiApiKey() && (
                <button
                  onClick={handleRemoveGeminiKey}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Remove Key
                </button>
              )}
            </div>

            {geminiTestResult && (
              <div className={`mt-4 p-4 rounded-md ${
                geminiTestResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {geminiTestResult.message}
              </div>
            )}
          </div>
        </div>

        {/* Ollama Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Ollama Configuration</h2>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Make sure Ollama is running locally with <code className="bg-gray-100 px-2 py-1 rounded">ollama serve</code>
            </p>

            <div className="flex space-x-4">
              <button
                onClick={handleTestOllama}
                disabled={isTestingOllama}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isTestingOllama ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {ollamaTestResult && (
              <div className={`mt-4 p-4 rounded-md ${
                ollamaTestResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {ollamaTestResult.message}
              </div>
            )}
          </div>
        </div>

        {/* Model Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Primary Model Selection</h2>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Select your primary model for chatting across the site
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableModels.map((model) => (
                <button
                  key={`${model.type}-${model.id}`}
                  onClick={() => handleModelSelect(model)}
                  className={`p-4 border rounded-lg text-left ${
                    selectedModel?.id === model.id && selectedModel?.type === model.type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-medium">{model.name}</div>
                  <div className="text-sm text-gray-500 capitalize">{model.type}</div>
                </button>
              ))}
            </div>

            {availableModels.length === 0 && (
              <p className="text-gray-500 italic">
                No models available. Please add API keys or start Ollama to see available models.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 