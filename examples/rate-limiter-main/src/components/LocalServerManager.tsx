import React, { useState, useEffect, useCallback } from 'react';
import { Play, Square, RefreshCw, Server, Activity, AlertCircle, CheckCircle, Clock, FolderOpen, Home, Settings, Zap } from 'lucide-react';

interface SystemStatus {
  ports: { [key: string]: { inUse: boolean; pid: string | null } };
  models: { ollama: { available: boolean; models: string[] } };
  currentDirectory?: string;
}

interface SetupResult {
  success: boolean;
  message: string;
  details: string[];
}

type ServerState = 'stopped' | 'starting' | 'running' | 'error';

const LocalServerManager: React.FC = () => {
  const [serverState, setServerState] = useState<ServerState>('stopped');
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [setupLogs, setSetupLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [selectedDirectory, setSelectedDirectory] = useState<string>('');
  const [showDirectoryPicker, setShowDirectoryPicker] = useState(false);

  // Initialize with default directory
  useEffect(() => {
    const initializeDirectory = async () => {
      try {
        // Try to get current directory from backend
        const response = await fetch('http://localhost:3001/api/system/status');
        if (response.ok) {
          const status = await response.json();
          if (status.currentDirectory) {
            setSelectedDirectory(status.currentDirectory);
            return;
          }
        }
      } catch (error) {
        console.log('Could not get current directory from backend, using default');
      }
      
      // Fallback to default directory
      const defaultDir = '/Users/danielennis/ai-apps/rate limit message';
      setSelectedDirectory(defaultDir);
    };
    
    initializeDirectory();
  }, []);

  // Enhanced system status checking with better error handling
  const checkSystemStatus = useCallback(async (retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const params = new URLSearchParams();
        if (selectedDirectory) {
          params.set('directory', selectedDirectory);
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`http://localhost:3001/api/system/status?${params}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const status = await response.json();
          setSystemStatus(status);
          setLastCheck(new Date());
          
          // Enhanced server state determination
          const backendRunning = status.ports['3001']?.inUse;
          const frontendRunning = status.ports['3000']?.inUse;
          
          if (backendRunning) {
            setServerState('running');
          } else {
            setServerState('stopped');
          }
          
          return status;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn(`System status check attempt ${attempt}/${retries} failed:`, error);
        
        if (attempt === retries) {
          console.error('All system status check attempts failed');
          setServerState('error');
          setSystemStatus(null);
          return null;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    return null;
  }, [selectedDirectory]);

  // Directory picker options
  const getCommonDirectories = () => {
    return [
      { path: '/Users/danielennis/ai-apps/rate limit message', name: 'Rate Limit Message (Current)' },
      { path: '/Users/danielennis/ai-apps', name: 'AI Apps Directory' },
      { path: '/Users/danielennis/Desktop', name: 'Desktop' },
      { path: '/Users/danielennis', name: 'Home Directory' },
    ];
  };

  // Enhanced automation with better error handling and progress tracking
  const runCompleteSetup = async () => {
    if (!selectedDirectory) {
      alert('Please select a project directory first!');
      return;
    }

    setServerState('starting');
    setSetupLogs([]);
    
    const log = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
      const timestamp = new Date().toLocaleTimeString();
      const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '🔧';
      setSetupLogs(prev => [...prev, `${timestamp}: ${emoji} ${message}`]);
    };

    try {
      log('🎯 Starting complete system setup...', 'info');
      log(`📂 Project Directory: ${selectedDirectory}`, 'info');
      
      // Step 1: Pre-flight checks
      log('🔍 Running pre-flight checks...', 'info');
      const currentStatus = await checkSystemStatus(1); // Single attempt for pre-check
      
      // Step 2: Smart port management
      if (currentStatus?.ports['3001']?.inUse) {
        log('🔄 Backend running - preparing clean restart...', 'warning');
      }
      
      // Step 3: Enhanced setup with progress tracking
      log('🚀 Executing automated setup sequence...', 'info');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        log('⏰ Setup request timed out after 30 seconds', 'error');
      }, 30000);
      
      const setupResponse = await fetch('http://localhost:3001/api/system/setup-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          directory: selectedDirectory,
          projectName: selectedDirectory.split('/').pop() || 'project',
          requestId: Date.now().toString() // For tracking
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!setupResponse.ok) {
        throw new Error(`Setup API failed: HTTP ${setupResponse.status} - ${setupResponse.statusText}`);
      }
      
      const setupResult: SetupResult = await setupResponse.json();
      
      // Log all setup details with better formatting
      setupResult.details.forEach(detail => {
        if (detail.includes('✅') || detail.includes('success')) {
          log(detail.replace(/^[✅🎉]?\s*/, ''), 'success');
        } else if (detail.includes('❌') || detail.includes('error')) {
          log(detail.replace(/^[❌⚠️]?\s*/, ''), 'error');
        } else if (detail.includes('⚠️') || detail.includes('warning')) {
          log(detail.replace(/^[⚠️]?\s*/, ''), 'warning');
        } else {
          log(detail.replace(/^[🔧🎯📊]?\s*/, ''), 'info');
        }
      });
      
      // Step 4: Intelligent backend health monitoring
      log('⏳ Monitoring backend startup...', 'info');
      let attempts = 0;
      const maxAttempts = 20; // Increased for reliability
      const backoffDelays = [1000, 1500, 2000, 2500, 3000]; // Progressive delays
      
      while (attempts < maxAttempts) {
        const delay = backoffDelays[Math.min(attempts, backoffDelays.length - 1)];
        await new Promise(resolve => setTimeout(resolve, delay));
        attempts++;
        
        try {
          const healthController = new AbortController();
          const healthTimeout = setTimeout(() => healthController.abort(), 3000);
          
          const healthResponse = await fetch('http://localhost:3001/api/health', {
            signal: healthController.signal
          });
          
          clearTimeout(healthTimeout);
          
          if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            log(`Backend online: ${healthData.specialization || 'Llama 4 Scout'} ready!`, 'success');
            setServerState('running');
            
            // Final status check to verify everything
            await new Promise(resolve => setTimeout(resolve, 1000));
            await checkSystemStatus();
            log('🎉 Complete setup finished successfully!', 'success');
            return;
          }
        } catch (error) {
          if (attempts < maxAttempts) {
            log(`Backend starting... (${attempts}/${maxAttempts})`, 'info');
          }
        }
      }
      
      throw new Error('Backend failed to come online after setup (max attempts exceeded)');
      
    } catch (error) {
      console.error('Setup failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Setup failed: ${errorMessage}`, 'error');
      setServerState('error');
      
      // Provide recovery suggestions
      if (errorMessage.includes('EADDRINUSE')) {
        log('💡 Suggestion: Try stopping all servers first, then setup again', 'warning');
      } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        log('💡 Suggestion: Check your network connection and try again', 'warning');
      } else if (errorMessage.includes('fetch')) {
        log('💡 Suggestion: Backend may not be running - try manual restart', 'warning');
      }
    }
  };

  // Kill all local servers
  const stopAllServers = async () => {
    setServerState('starting');
    setSetupLogs([]);
    
    const log = (message: string) => {
      setSetupLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    try {
      log('🛑 Stopping all local servers...');
      
      // Kill processes on key ports
      const ports = ['3000', '3001', '11434'];
      for (const port of ports) {
        try {
          const killResponse = await fetch(`http://localhost:3001/api/system/kill-port/${port}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ directory: selectedDirectory })
          });
          
          if (killResponse.ok) {
            const result = await killResponse.json();
            log(result.message);
          }
        } catch (error) {
          log(`⚠️ Could not clear port ${port}`);
        }
      }
      
      setServerState('stopped');
      log('✅ All servers stopped');
      
    } catch (error) {
      console.error('Stop failed:', error);
      log(`❌ Stop failed: ${error instanceof Error ? error.message : String(error)}`);
      setServerState('error');
    }
  };

  // Enhanced auto-monitoring with intelligent intervals
  useEffect(() => {
    if (!selectedDirectory) return;
    
    const getRefreshInterval = () => {
      switch (serverState) {
        case 'starting': return 2000; // Check every 2s when starting
        case 'error': return 5000;    // Check every 5s when in error state  
        case 'running': return 15000; // Check every 15s when stable
        default: return 10000;        // Default 10s interval
      }
    };
    
    // Initial check
    checkSystemStatus();
    
    // Set up intelligent monitoring
    const interval = setInterval(() => {
      if (isVisible) { // Only check when panel is open
        checkSystemStatus();
      }
    }, getRefreshInterval());
    
    return () => clearInterval(interval);
  }, [checkSystemStatus, selectedDirectory, serverState, isVisible]);

  const getStatusIcon = () => {
    switch (serverState) {
      case 'running': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'starting': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Server className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (serverState) {
      case 'running': return 'Local System Running';
      case 'starting': return 'Setting Up...';
      case 'error': return 'Setup Error';
      default: return 'Local System Stopped';
    }
  };

  const getStatusColor = () => {
    switch (serverState) {
      case 'running': return 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100';
      case 'starting': return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'error': return 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100';
      default: return 'text-gray-600 border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`inline-flex items-center px-3 py-1.5 text-sm font-medium border rounded-lg transition-colors ${getStatusColor()}`}
        disabled={serverState === 'starting'}
      >
        {getStatusIcon()}
        <span className="ml-1.5">{getStatusText()}</span>
      </button>

      {/* Expanded Panel */}
      {isVisible && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Local System Manager</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            {lastCheck && (
              <p className="text-xs text-gray-500 mt-1">
                Last checked: {lastCheck.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Directory Selection */}
          <div className="p-4 border-b border-gray-100">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <FolderOpen className="w-4 h-4 mr-1.5" />
              Project Directory
            </h4>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-600 bg-gray-50 rounded p-2 font-mono">
                {selectedDirectory || 'No directory selected'}
              </div>
              
              <button
                onClick={() => setShowDirectoryPicker(!showDirectoryPicker)}
                className="w-full text-left px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Choose Directory...
              </button>
              
              {showDirectoryPicker && (
                <div className="border border-gray-200 rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto">
                  {getCommonDirectories().map((dir) => (
                    <button
                      key={dir.path}
                      onClick={() => {
                        setSelectedDirectory(dir.path);
                        setShowDirectoryPicker(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-blue-50 transition-colors ${
                        selectedDirectory === dir.path ? 'bg-blue-100 text-blue-800' : 'text-gray-700'
                      }`}
                    >
                      <div className="font-medium">{dir.name}</div>
                      <div className="text-xs text-gray-500 font-mono">{dir.path}</div>
                    </button>
                  ))}
                  
                  <div className="border-t pt-1 mt-1">
                    <input
                      type="text"
                      placeholder="Enter custom path..."
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          setSelectedDirectory(e.currentTarget.value);
                          setShowDirectoryPicker(false);
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex gap-2 mb-2">
              <button
                onClick={runCompleteSetup}
                disabled={serverState === 'starting' || !selectedDirectory}
                className={`flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  serverState === 'starting' || !selectedDirectory
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Zap className="w-4 h-4 mr-1.5" />
                Complete Setup
              </button>
              
              <button
                onClick={stopAllServers}
                disabled={serverState === 'starting'}
                className={`flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium border border-red-200 text-red-600 rounded-lg transition-colors ${
                  serverState === 'starting'
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-red-50'
                }`}
              >
                <Square className="w-4 h-4 mr-1.5" />
                Stop All
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => checkSystemStatus()}
                disabled={serverState === 'starting'}
                className="flex-1 inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh Status
              </button>
              
              <button
                onClick={() => window.open('http://localhost:3001/api/health', '_blank')}
                disabled={serverState !== 'running'}
                className="flex-1 inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Settings className="w-3 h-3 mr-1" />
                Health Check
              </button>
            </div>
          </div>

          {/* System Status */}
          {systemStatus && (
            <div className="p-4 border-b border-gray-100">
              <h4 className="font-medium text-gray-900 mb-2">System Status</h4>
              
              <div className="space-y-2">
                {/* Current Directory */}
                {systemStatus.currentDirectory && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-600">Working Dir:</span>
                    <div className="ml-4 text-xs text-gray-500 font-mono bg-gray-50 rounded p-1">
                      {systemStatus.currentDirectory}
                    </div>
                  </div>
                )}
                
                {/* Port Status */}
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Ports:</span>
                  <div className="ml-4 space-y-1">
                    {Object.entries(systemStatus.ports).map(([port, status]) => (
                      <div key={port} className="flex items-center justify-between">
                        <span>:{port}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          status.inUse ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {status.inUse ? `Running (PID: ${status.pid})` : 'Free'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Models Status */}
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Ollama Models:</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                    systemStatus.models.ollama.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {systemStatus.models.ollama.available 
                      ? `${systemStatus.models.ollama.models.length} models`
                      : 'Not available'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Setup Logs */}
          {setupLogs.length > 0 && (
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Activity className="w-4 h-4 mr-1.5" />
                Setup Logs
              </h4>
              
              <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {setupLogs.join('\n')}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocalServerManager; 