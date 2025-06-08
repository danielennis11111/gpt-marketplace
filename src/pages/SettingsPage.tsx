import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useChatService } from '../hooks/useChatService';
import {
  CogIcon,
  KeyIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettings, isGeminiConfigured } = useSettings();
  const chatService = useChatService();
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(settings.geminiApiKey);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const handleApiKeyChange = (value: string) => {
    setTempApiKey(value);
    setUnsavedChanges(value !== settings.geminiApiKey);
    setConnectionResult(null);
  };

  const saveApiKey = () => {
    updateSettings({ geminiApiKey: tempApiKey });
    setUnsavedChanges(false);
  };

  const discardChanges = () => {
    setTempApiKey(settings.geminiApiKey);
    setUnsavedChanges(false);
    setConnectionResult(null);
  };

  const clearApiKey = () => {
    setTempApiKey('');
    updateSettings({ geminiApiKey: '', preferredChatProvider: 'ollama' });
    setUnsavedChanges(false);
    setConnectionResult(null);
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

  const handleProviderChange = (provider: 'ollama' | 'gemini') => {
    if (provider === 'gemini' && !isGeminiConfigured()) {
      // Don't allow switching to Gemini if not configured
      return;
    }
    updateSettings({ preferredChatProvider: provider });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your preferences and API configurations</p>
        </div>

        <div className="space-y-6">
          {/* Chat Provider Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Chat Provider</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              Choose your preferred AI chat provider for the marketplace assistant and idea generation.
            </p>

            <div className="space-y-3">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="chatProvider"
                  value="ollama"
                  checked={settings.preferredChatProvider === 'ollama'}
                  onChange={() => handleProviderChange('ollama')}
                  className="text-red-600 focus:ring-red-500"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900">Ollama (Local)</div>
                  <div className="text-sm text-gray-500">
                    Run AI models locally on your machine. Free but requires setup.
                  </div>
                </div>
              </label>

              <label className={`flex items-center p-4 border rounded-lg transition-colors ${
                isGeminiConfigured() 
                  ? 'border-gray-200 cursor-pointer hover:bg-gray-50' 
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed'
              }`}>
                <input
                  type="radio"
                  name="chatProvider"
                  value="gemini"
                  checked={settings.preferredChatProvider === 'gemini'}
                  onChange={() => handleProviderChange('gemini')}
                  disabled={!isGeminiConfigured()}
                  className="text-red-600 focus:ring-red-500 disabled:opacity-50"
                />
                <div className="ml-3">
                  <div className={`font-medium ${isGeminiConfigured() ? 'text-gray-900' : 'text-gray-400'}`}>
                                         Google Gemini 2.0 Flash
                   </div>
                   <div className={`text-sm ${isGeminiConfigured() ? 'text-gray-500' : 'text-gray-400'}`}>
                     {isGeminiConfigured() 
                       ? 'Latest Gemini model with enhanced speed and performance. Requires API key.'
                       : 'Configure your API key below to enable Gemini 2.0 Flash'
                     }
                  </div>
                </div>
              </label>
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

          {/* Gemini API Configuration */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <KeyIcon className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Gemini API Configuration</h2>
            </div>
            
                         <p className="text-gray-600 mb-4">
               Enter your Google Gemini API key to enable cloud-based AI features with the latest Gemini 2.0 Flash model. 
               Your API key is stored securely in your browser's local storage.
             </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                  Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    id="apiKey"
                    value={tempApiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="Enter your Gemini API key..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Get your free API key from{' '}
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-700 underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>

              {/* Connection Test Result */}
              {connectionResult && (
                <div className={`p-3 rounded-lg border ${
                  connectionResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center">
                    {connectionResult.success ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-600 mr-2" />
                    )}
                    <span className={`text-sm font-medium ${
                      connectionResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {connectionResult.message}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={testConnection}
                  disabled={testingConnection || !tempApiKey.trim()}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testingConnection ? (
                    <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                  )}
                  {testingConnection ? 'Testing...' : 'Test Connection'}
                </button>

                {unsavedChanges && (
                  <>
                    <button
                      onClick={saveApiKey}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save API Key
                    </button>
                    <button
                      onClick={discardChanges}
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Discard Changes
                    </button>
                  </>
                )}

                {(tempApiKey || settings.geminiApiKey) && (
                  <button
                    onClick={clearApiKey}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Clear API Key
                  </button>
                )}
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