import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useSettings } from '../contexts/SettingsContext';

const SettingsForm: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState({
    geminiApiKey: settings.geminiApiKey || '',
    llamaApiKey: settings.llamaApiKey || '',
  });

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showLlamaKey, setShowLlamaKey] = useState(false);

  const handleProviderChange = (provider: 'gemini' | 'llama' | 'ollama') => {
    updateSettings({
      preferredChatProvider: provider
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    updateSettings({ [name]: value });
  };

  const handleSave = () => {
    updateSettings({
      geminiApiKey: formData.geminiApiKey,
      llamaApiKey: formData.llamaApiKey,
    });
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    updateSettings({
      theme
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h2>
      
      {/* API Provider Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Preferred Chat Provider
        </label>
        <div className="flex flex-wrap gap-3">
          <button 
            type="button"
            onClick={() => handleProviderChange('gemini')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              settings.preferredChatProvider === 'gemini'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <img 
              src="/gemini-logo.png"
              alt="Gemini"
              className="w-4 h-4 object-contain"
            />
            Gemini AI
          </button>
          <button 
            type="button"
            onClick={() => handleProviderChange('llama')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              settings.preferredChatProvider === 'llama'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            Llama API
          </button>
          <button 
            type="button"
            onClick={() => handleProviderChange('ollama')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              settings.preferredChatProvider === 'ollama'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <img 
              src="/ollama-logo.png"
              alt="Ollama"
              className="w-4 h-4 object-contain"
            />
            Local Ollama
          </button>
        </div>
      </div>

      {/* Gemini API Key Input */}
      {settings.preferredChatProvider === 'gemini' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Gemini API Key
          </label>
          <div className="relative">
            <input
              type={showGeminiKey ? "text" : "password"}
              name="geminiApiKey"
              value={formData.geminiApiKey}
              onChange={handleInputChange}
              placeholder="Enter your Gemini API key"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowGeminiKey(!showGeminiKey)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            >
              {showGeminiKey ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Google AI Studio</a>
          </p>
        </div>
      )}
      
      {/* Llama API Key Input */}
      {settings.preferredChatProvider === 'llama' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Llama API Key
          </label>
          <div className="relative">
            <input
              type={showLlamaKey ? "text" : "password"}
              name="llamaApiKey"
              value={formData.llamaApiKey}
              onChange={handleInputChange}
              placeholder="Enter your Llama API key"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowLlamaKey(!showLlamaKey)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            >
              {showLlamaKey ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Get your API key from the <a href="https://www.llama-api.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Llama API website</a>
          </p>
        </div>
      )}

      {/* Ollama Model Selection */}
      {settings.preferredChatProvider === 'ollama' && (
        <div className="space-y-4">
          {/* Ollama model selection would go here */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ollama will use models installed on your local machine.
          </p>
        </div>
      )}

      {/* Theme Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Theme
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              settings.theme === 'light'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              settings.theme === 'dark'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Dark
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4">
        <button
          onClick={handleSave}
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsForm; 