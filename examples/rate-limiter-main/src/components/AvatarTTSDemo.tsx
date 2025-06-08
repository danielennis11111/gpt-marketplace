import React, { useState, useRef } from 'react';
import { AvatarTTSService, AvatarVoiceProfile, AvatarSpeechRequest } from '../services/AvatarTTSService';

interface AvatarTTSDemoProps {
  openaiApiKey: string;
  llamaBackendUrl?: string;
}

export const AvatarTTSDemo: React.FC<AvatarTTSDemoProps> = ({ 
  openaiApiKey, 
  llamaBackendUrl = 'http://localhost:3001' 
}) => {
  const [selectedProfile, setSelectedProfile] = useState<string>('scout-friendly');
  const [inputText, setInputText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const avatarTTSService = useRef(new AvatarTTSService(openaiApiKey, llamaBackendUrl));
  
  const profiles = AvatarTTSService.getAvatarProfiles();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSampleContent = (contentType: string) => {
    const samples = {
      business: "Let me provide a comprehensive analysis of our Q4 performance metrics. Our revenue increased by 23% year-over-year, driven primarily by strategic market expansion.",
      storytelling: "Once upon a time, in a digital realm where AI and creativity converged, there lived a virtual avatar who could speak with the voices of many personalities.",
      conversation: "Hey there! I'm excited to show you how our new voice adaptation system works. It's pretty amazing how the voice changes based on content type!",
      technical: "The neural network architecture implements a transformer-based approach with attention mechanisms to optimize voice synthesis and emotional context detection."
    };
    
    setInputText(samples[contentType as keyof typeof samples] || samples.conversation);
  };

  const generateAvatarSpeech = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    addLog(`🎭 Starting speech generation with ${selectedProfile}`);
    
    try {
      const request: AvatarSpeechRequest = {
        text: inputText,
        avatarProfile: selectedProfile,
        emotion: 'neutral'
      };

      const response = await avatarTTSService.current.generateAvatarSpeech(request);
      
      setAudioUrl(response.audioUrl);
      setLastResponse(response);
      
      addLog(`✅ Generated ${(response.metadata.textLength)} chars in ${response.synthesisTime}ms`);
      addLog(`🎵 Voice: ${response.avatarProfile.ttsVoice} | Model: ${response.llamaModel}`);
      addLog(`💭 Emotions: ${response.emotionalTags.join(', ')}`);

    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAndSpeak = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    addLog(`🧠➡️🎭 Full pipeline: Llama → TTS`);
    
    try {
      const response = await avatarTTSService.current.generateAndSpeak(
        inputText,
        'You are a helpful AI assistant demonstrating voice adaptation.',
        selectedProfile
      );
      
      setAudioUrl(response.audioResponse.audioUrl);
      setLastResponse(response.audioResponse);
      
      addLog(`📝 Llama response: "${response.textResponse.substring(0, 50)}..."`);
      addLog(`✅ Generated speech in ${response.audioResponse.synthesisTime}ms`);

    } catch (error) {
      addLog(`❌ Pipeline error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      addLog(`🔊 Playing audio`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🎭 Avatar TTS Demo
        </h2>
        <p className="text-gray-600">
          Test the new Avatar TTS service with intelligent voice adaptation powered by Llama 4 Scout
        </p>
      </div>

      {/* Voice Profile Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Choose Avatar Voice Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedProfile === profile.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedProfile(profile.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">{profile.name}</h4>
                <span className="text-sm text-blue-600">{profile.ttsVoice}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{profile.description}</p>
              <div className="text-xs text-gray-500">
                {profile.useCase.join(', ')} | Speed: {profile.voiceSpeed}x
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Content Buttons */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3">Try Sample Content</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => testSampleContent('business')}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
          >
            Business Analysis
          </button>
          <button
            onClick={() => testSampleContent('storytelling')}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
          >
            Creative Story
          </button>
          <button
            onClick={() => testSampleContent('conversation')}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
          >
            Friendly Chat
          </button>
          <button
            onClick={() => testSampleContent('technical')}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
          >
            Technical Explanation
          </button>
        </div>
      </div>

      {/* Text Input */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Input Text</h3>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to convert to speech..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={generateAvatarSpeech}
          disabled={isGenerating || !inputText.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? '🎵 Generating...' : '🎭 Generate Speech Only'}
        </button>
        
        <button
          onClick={generateAndSpeak}
          disabled={isGenerating || !inputText.trim()}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? '🧠 Processing...' : '🧠➡️🎭 Llama + TTS Pipeline'}
        </button>

        {audioUrl && (
          <button
            onClick={playAudio}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            🔊 Play Audio
          </button>
        )}
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="mb-6">
          <audio ref={audioRef} controls className="w-full">
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Response Info */}
      {lastResponse && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Last Response Info</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Profile:</strong> {lastResponse.avatarProfile.name}
            </div>
            <div>
              <strong>Voice:</strong> {lastResponse.metadata.voice}
            </div>
            <div>
              <strong>Model:</strong> {lastResponse.llamaModel}
            </div>
            <div>
              <strong>Speed:</strong> {lastResponse.metadata.speed}x
            </div>
            <div>
              <strong>Duration:</strong> {lastResponse.metadata.estimatedDuration.toFixed(1)}s
            </div>
            <div>
              <strong>Synthesis Time:</strong> {lastResponse.synthesisTime}ms
            </div>
          </div>
          <div className="mt-2">
            <strong>Emotional Tags:</strong> {lastResponse.emotionalTags.join(', ')}
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Activity Log</h3>
          <button
            onClick={clearLogs}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Clear Logs
          </button>
        </div>
        <div className="bg-black text-green-400 p-3 rounded-lg h-48 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-gray-500">No activity yet...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarTTSDemo; 