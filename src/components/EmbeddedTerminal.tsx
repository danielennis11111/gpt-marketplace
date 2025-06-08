import React, { useState, useEffect, useRef } from 'react';
import { useOllama } from '../hooks/useOllama';

interface EmbeddedTerminalProps {
  onCommandRun?: () => void;
  autoFocus?: boolean;
}

/**
 * A component that simulates a terminal window where users can run commands
 * Specifically designed to help users start the Ollama server
 */
const EmbeddedTerminal: React.FC<EmbeddedTerminalProps> = ({ 
  onCommandRun,
  autoFocus = false
}) => {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isOllamaRunning, setIsOllamaRunning] = useState(false);
  const ollama = useOllama();
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add initial welcome message
  useEffect(() => {
    setCommandHistory([
      'Welcome to the embedded terminal!',
      'This terminal helps you start the Ollama server to use local AI models.',
      'Type "ollama serve" to start the Ollama server.',
      'You can also try "help" for more commands.',
      ''
    ]);
  }, []);

  // Auto-scroll to bottom of terminal when content changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  // Auto-focus input if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Check if Ollama is running
  useEffect(() => {
    const checkOllamaStatus = async () => {
      await ollama.checkOllamaStatus();
      setIsOllamaRunning(ollama.status.isConnected);
    };
    
    checkOllamaStatus();
    
    // Set up interval to check status
    const interval = setInterval(checkOllamaStatus, 5000);
    
    return () => clearInterval(interval);
  }, [ollama]);

  // Update terminal when Ollama status changes
  useEffect(() => {
    if (ollama.status.isConnected && !isOllamaRunning) {
      setIsOllamaRunning(true);
      setCommandHistory(prev => [
        ...prev,
        '✅ Ollama server is now running!',
        'You can now use local AI models in the app.',
        ''
      ]);
      setIsRunning(false);
    }
  }, [ollama.status.isConnected, isOllamaRunning]);

  const handleCommand = async () => {
    const command = currentCommand.trim();
    
    if (!command) return;
    
    // Add command to history
    setCommandHistory(prev => [...prev, `$ ${command}`]);
    setCurrentCommand('');
    
    // Handle different commands
    if (command === 'clear') {
      setCommandHistory([]);
      return;
    }
    
    if (command === 'help') {
      setCommandHistory(prev => [
        ...prev,
        'Available commands:',
        '  ollama serve - Start the Ollama server',
        '  clear - Clear the terminal',
        '  help - Show this help message',
        '  status - Check if Ollama server is running',
        ''
      ]);
      return;
    }
    
    if (command === 'status') {
      await ollama.checkOllamaStatus();
      setCommandHistory(prev => [
        ...prev,
        ollama.status.isConnected 
          ? '✅ Ollama server is running' 
          : '❌ Ollama server is not running',
        ''
      ]);
      return;
    }
    
    if (command === 'ollama serve' || command === 'ollama') {
      setIsRunning(true);
      setCommandHistory(prev => [
        ...prev,
        'Starting Ollama server...',
        'Listening on 127.0.0.1:11434',
        'This terminal window is now running the Ollama server.',
        'You can use local AI models in the app while this is running.',
        '(Keep this window open to continue using Ollama)',
        ''
      ]);
      
      // Try to actually start Ollama
      await ollama.startOllama();
      
      // Notify parent component
      if (onCommandRun) {
        onCommandRun();
      }
      
      return;
    }
    
    // Default response for unknown commands
    setCommandHistory(prev => [
      ...prev,
      `Command not found: ${command}`,
      'Type "help" for available commands',
      ''
    ]);
  };

  return (
    <div className="bg-black text-green-500 font-mono text-sm rounded-lg overflow-hidden border border-gray-700 flex flex-col">
      <div className="bg-gray-800 px-4 py-2 flex items-center">
        <div className="flex space-x-2 mr-4">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex-1 text-center text-xs text-gray-400">Terminal</div>
      </div>
      
      {/* Terminal output */}
      <div 
        ref={terminalRef}
        className="p-4 h-64 overflow-y-auto flex-1 whitespace-pre-wrap"
      >
        {commandHistory.map((line, i) => (
          <div key={i} className={line.startsWith('✅') ? 'text-green-400' : line.startsWith('❌') ? 'text-red-400' : ''}>
            {line}
          </div>
        ))}
      </div>
      
      {/* Command input */}
      <div className="border-t border-gray-700 p-2 flex items-center">
        <span className="text-green-500 mr-2">$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCommand();
            }
          }}
          disabled={isRunning}
          placeholder={isRunning ? 'Ollama server is running...' : 'Type a command...'}
          className="bg-transparent text-green-500 outline-none flex-1"
          autoComplete="off"
          spellCheck="false"
        />
      </div>
      
      {/* Status indicator */}
      <div className="bg-gray-900 px-4 py-1 text-xs flex items-center">
        <div className={`w-2 h-2 rounded-full mr-2 ${isOllamaRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-gray-400">
          Ollama Status: {isOllamaRunning ? 'Running' : 'Not Running'}
        </span>
      </div>
    </div>
  );
};

export default EmbeddedTerminal; 