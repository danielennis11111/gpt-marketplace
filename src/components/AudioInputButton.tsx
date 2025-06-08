import React, { useState, useEffect, useCallback } from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';

interface AudioInputButtonProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  buttonText?: string;
  buttonClass?: string;
  asugold?: boolean;
}

/**
 * Audio Input Button Component
 * 
 * Allows users to dictate text using their microphone.
 * Uses the Web Speech API for speech recognition.
 */
const AudioInputButton: React.FC<AudioInputButtonProps> = ({
  onTranscription,
  disabled = false,
  buttonText = 'Speak',
  buttonClass = '',
  asugold = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [supported, setSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  // Initialize speech recognition on component mount
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      setSupported(false);
      return;
    }
    
    // Create recognition instance
    const recognitionInstance = new SpeechRecognition();
    
    // Configure recognition
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';
    
    // Set up event handlers
    recognitionInstance.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update interim transcript
      setInterimTranscript(interimTranscript);
      
      // If we have a final transcript, pass it to the callback
      if (finalTranscript) {
        onTranscription(finalTranscript);
      }
    };
    
    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    
    recognitionInstance.onend = () => {
      setIsListening(false);
    };
    
    // Store recognition instance
    setRecognition(recognitionInstance);
    
    // Clean up on unmount
    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [onTranscription]);
  
  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setInterimTranscript('');
    } else {
      recognition.start();
      setIsListening(true);
    }
  }, [isListening, recognition]);
  
  // Generate appropriate button style based on ASU gold parameter
  const getButtonStyle = () => {
    const baseClasses = 'rounded-full flex items-center justify-center focus:outline-none transition-colors';
    
    if (asugold) {
      // ASU Gold (#FFC627) with black text for ASU branding
      return `${baseClasses} ${buttonClass} ${
        isListening 
          ? 'bg-yellow-600 hover:bg-yellow-700 text-black' 
          : 'bg-yellow-500 hover:bg-yellow-600 text-black'
      }`;
    }
    
    // Default styling
    return `${baseClasses} ${buttonClass} ${
      isListening 
        ? 'bg-red-600 hover:bg-red-700 text-white' 
        : 'bg-blue-600 hover:bg-blue-700 text-white'
    }`;
  };
  
  if (!supported) {
    return (
      <button 
        className="px-3 py-2 rounded bg-gray-200 text-gray-500 cursor-not-allowed"
        disabled={true}
        title="Speech recognition not supported in this browser"
      >
        <MicrophoneIcon className="h-5 w-5" />
      </button>
    );
  }
  
  return (
    <div className="relative">
      <button
        onClick={toggleListening}
        disabled={disabled}
        className={`${getButtonStyle()} p-3 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isListening ? 'Stop recording' : 'Start dictation'}
        aria-label={isListening ? 'Stop recording' : 'Start dictation'}
      >
        {isListening ? (
          <StopIcon className="h-5 w-5" />
        ) : (
          <MicrophoneIcon className="h-5 w-5" />
        )}
      </button>
      
      {/* Show interim transcript */}
      {isListening && interimTranscript && (
        <div className="absolute bottom-full mb-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg max-w-xs whitespace-normal">
          {interimTranscript}
        </div>
      )}
      
      {/* Recording indicator */}
      {isListening && (
        <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default AudioInputButton; 