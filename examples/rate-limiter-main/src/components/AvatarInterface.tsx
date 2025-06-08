import React, { useState, useRef, useCallback } from 'react';
import { avatarService, AvatarConfig, AvatarResponse } from '../services/AvatarService';

interface AvatarInterfaceProps {
  onAvatarResponse?: (response: AvatarResponse) => void;
}

export const AvatarInterface: React.FC<AvatarInterfaceProps> = ({ onAvatarResponse }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<AvatarResponse | null>(null);
  const [config, setConfig] = useState<AvatarConfig>({ model: 'hallo' });
  const [inputText, setInputText] = useState('');
  const [availableVoices, setAvailableVoices] = useState<Array<{id: string, name: string, language: string}>>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    // Load available voices
    avatarService.getAvailableVoices().then(setAvailableVoices);
  }, []);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const imageUrl = await avatarService.uploadAvatarImage(file);
        setConfig(prev => ({ ...prev, imageUrl }));
      } catch (error) {
        console.error('❌ Image upload failed:', error);
      }
    }
  }, []);

  const handleGenerateAvatar = useCallback(async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await avatarService.generateTalkingAvatar(inputText, config);
      setCurrentAvatar(response);
      onAvatarResponse?.(response);
    } catch (error) {
      console.error('❌ Avatar generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [inputText, config, onAvatarResponse]);

  const handleVoiceChange = useCallback((voiceId: string) => {
    setConfig(prev => ({
      ...prev,
      voiceSettings: {
        voice: voiceId,
        speed: prev.voiceSettings?.speed || 1.0,
        pitch: prev.voiceSettings?.pitch || 1.0
      }
    }));
  }, []);

  return (
    <div className="avatar-interface max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🎭 Interactive AI Avatar</h2>
        <p className="text-gray-600">Upload your photo and have a conversation with your AI avatar!</p>
      </div>

      {/* Configuration Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Avatar Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Avatar Settings</h3>
          
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avatar Model
            </label>
            <select
              value={config.model}
              onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value as AvatarConfig['model'] }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="hallo">Hallo (Realistic)</option>
              <option value="sadtalker">SadTalker (Expressive)</option>
              <option value="wav2lip">Wav2Lip (Fast)</option>
              <option value="musetalk">MuseTalk (Real-time)</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avatar Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {config.imageUrl && (
              <div className="mt-2">
                <img 
                  src={config.imageUrl} 
                  alt="Avatar" 
                  className="w-24 h-24 object-cover rounded-full border-2 border-gray-300"
                />
              </div>
            )}
          </div>
        </div>

        {/* Voice Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Voice Settings</h3>
          
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice
            </label>
            <select
              value={config.voiceSettings?.voice || 'alloy'}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {availableVoices.map(voice => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} ({voice.language})
                </option>
              ))}
            </select>
          </div>

          {/* Voice Speed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speed: {config.voiceSettings?.speed || 1.0}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={config.voiceSettings?.speed || 1.0}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                voiceSettings: {
                  ...prev.voiceSettings,
                  voice: prev.voiceSettings?.voice || 'alloy',
                  speed: parseFloat(e.target.value),
                  pitch: prev.voiceSettings?.pitch || 1.0
                }
              }))}
              className="w-full"
            />
          </div>

          {/* Voice Pitch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pitch: {config.voiceSettings?.pitch || 1.0}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={config.voiceSettings?.pitch || 1.0}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                voiceSettings: {
                  ...prev.voiceSettings,
                  voice: prev.voiceSettings?.voice || 'alloy',
                  speed: prev.voiceSettings?.speed || 1.0,
                  pitch: parseFloat(e.target.value)
                }
              }))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Text Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What should your avatar say?
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text for your avatar to speak..."
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
        />
      </div>

      {/* Generate Button */}
      <div className="mb-6">
        <button
          onClick={handleGenerateAvatar}
          disabled={isGenerating || !inputText.trim()}
          className={`w-full py-3 px-6 rounded-md font-medium text-white transition-colors ${
            isGenerating || !inputText.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating Avatar...
            </div>
          ) : (
            '🎭 Generate Talking Avatar'
          )}
        </button>
      </div>

      {/* Avatar Display */}
      {currentAvatar && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Your Avatar</h3>
          
          {currentAvatar.status === 'completed' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <video
                ref={videoRef}
                src={currentAvatar.videoUrl}
                controls
                autoPlay
                className="w-full max-w-md mx-auto rounded-lg shadow-md"
              >
                Your browser does not support the video tag.
              </video>
              
              <div className="mt-4 text-center text-sm text-gray-600">
                Duration: {currentAvatar.duration}s
              </div>
            </div>
          )}

          {currentAvatar.status === 'processing' && (
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="animate-pulse">
                <div className="h-48 bg-blue-200 rounded-lg mb-4"></div>
                <p className="text-blue-600">Processing your avatar...</p>
              </div>
            </div>
          )}

          {currentAvatar.status === 'error' && (
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-red-600">❌ Avatar generation failed. Please try again.</p>
            </div>
          )}
        </div>
      )}

      {/* Usage Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-2">💡 How to use:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>1. Upload a clear photo of yourself or any person</li>
          <li>2. Choose your preferred avatar model and voice settings</li>
          <li>3. Type what you want your avatar to say</li>
          <li>4. Click "Generate Talking Avatar" and watch the magic!</li>
        </ul>
      </div>
    </div>
  );
}; 