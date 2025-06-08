import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Archive, 
  Search, 
  AlertTriangle, 
  Settings, 
  Database,
  FileText,
  GitBranch,
  ShieldAlert
} from 'lucide-react';
import { ContextOptimizationState, OptimizationAction, EmergencyMode } from '../types/contextOptimization';

interface ContextOptimizationPanelProps {
  optimizationState: ContextOptimizationState;
  onOptimizationAction: (action: OptimizationAction) => void;
  currentTokens: number;
  maxTokens: number;
}

export const ContextOptimizationPanel: React.FC<ContextOptimizationPanelProps> = ({
  optimizationState,
  onOptimizationAction,
  currentTokens,
  maxTokens
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmergencyControls, setShowEmergencyControls] = useState(false);

  const utilizationPercentage = (currentTokens / maxTokens) * 100;
  const isNearLimit = utilizationPercentage > 75;
  const isAtLimit = utilizationPercentage > 90;

  const compressionRatio = optimizationState.cache.length > 0 
    ? optimizationState.cache.reduce((sum, cache) => sum + (cache.strategy?.compressionRatio || 1), 0) / optimizationState.cache.length
    : 1;

  const handleCompress = (strategy: 'lossless' | 'semantic' | 'summary' | 'hybrid') => {
    onOptimizationAction({
      type: 'compress',
      payload: { strategy },
      timestamp: new Date()
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onOptimizationAction({
        type: 'search',
        payload: { 
          query: searchQuery,
          semantic: true,
          fuzzy: true,
          limit: 10
        },
        timestamp: new Date()
      });
    }
  };

  const handleEmergencyMode = (reason: EmergencyMode['reason']) => {
    onOptimizationAction({
      type: 'emergency_mode',
      payload: { 
        reason,
        fallbackStrategy: 'compression'
      },
      timestamp: new Date()
    });
  };

  const handleClearCache = () => {
    onOptimizationAction({
      type: 'cache_clear',
      payload: {},
      timestamp: new Date()
    });
  };

  return (
    <div className={`bg-white border rounded-lg p-4 transition-all ${isExpanded ? 'shadow-lg' : 'shadow'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-[#FFC627]" />
          <h3 className="font-semibold text-gray-900">Context Optimization</h3>
          {optimizationState.emergencyMode.active && (
            <ShieldAlert className="w-4 h-4 text-red-500" />
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Context Usage Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Context Usage</span>
          <span>{currentTokens.toLocaleString()} / {maxTokens.toLocaleString()} tokens</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
          />
        </div>
        {compressionRatio < 1 && (
          <div className="text-xs text-[#FFC627] mt-1">
            Compression active: {((1 - compressionRatio) * 100).toFixed(1)}% space saved
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => handleCompress('hybrid')}
          disabled={optimizationState.cache.length === 0}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-[#FFC627] bg-opacity-20 text-[#191919] rounded-lg hover:bg-[#FFC627] hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Archive className="w-4 h-4" />
          <span>Auto Compress</span>
        </button>
        
        <button
          onClick={() => setShowEmergencyControls(true)}
          className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm ${
            isAtLimit 
              ? 'bg-red-50 text-red-700 hover:bg-red-100' 
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Emergency</span>
        </button>
      </div>

      {/* Expanded Controls */}
      {isExpanded && (
        <div className="space-y-4 border-t pt-4">
          {/* Search Interface */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Semantic Search
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversation history..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC627] focus:border-[#FFC627] text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-[#FFC627] text-[#191919] rounded-lg hover:bg-yellow-400 text-sm"
              >
                Search
              </button>
            </div>
          </div>

          {/* Compression Strategies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Archive className="w-4 h-4 inline mr-1" />
              Compression Strategies
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCompress('lossless')}
                className="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm"
              >
                Lossless
              </button>
              <button
                onClick={() => handleCompress('semantic')}
                className="px-3 py-2 bg-[#FFC627] bg-opacity-20 text-[#191919] rounded-lg hover:bg-[#FFC627] hover:bg-opacity-30 text-sm"
              >
                Semantic
              </button>
              <button
                onClick={() => handleCompress('summary')}
                className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm"
              >
                Summary
              </button>
              <button
                onClick={() => handleCompress('hybrid')}
                className="px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-sm"
              >
                Hybrid
              </button>
            </div>
          </div>

          {/* Index Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Database className="w-4 h-4 inline mr-1" />
              Index Status
            </label>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <span>Indexed Entries:</span>
                <span className="font-medium">{optimizationState.index.entries.size}</span>
              </div>
              <div className="flex justify-between">
                <span>Semantic Clusters:</span>
                <span className="font-medium">{new Set(optimizationState.index.semanticTree.map(n => n.cluster)).size}</span>
              </div>
              <div className="flex justify-between">
                <span>Cache Size:</span>
                <span className="font-medium">{optimizationState.cache.length}</span>
              </div>
            </div>
          </div>

          {/* Git-like Operations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <GitBranch className="w-4 h-4 inline mr-1" />
              Version Control
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => onOptimizationAction({
                  type: 'index',
                  payload: { operation: 'snapshot' },
                  timestamp: new Date()
                })}
                className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-sm"
              >
                Create Snapshot
              </button>
              <button
                onClick={handleClearCache}
                className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Mode Controls */}
      {showEmergencyControls && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-2 mb-4">
              <ShieldAlert className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Emergency Mode</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Activate emergency protocols to handle critical situations when normal operation is compromised.
            </p>
            
            <div className="space-y-2 mb-6">
              <button
                onClick={() => {
                  handleEmergencyMode('bandwidth');
                  setShowEmergencyControls(false);
                }}
                className="w-full px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-left"
              >
                <div className="font-medium">Bandwidth Crisis</div>
                <div className="text-sm opacity-75">Compress everything, reduce features</div>
              </button>
              
              <button
                onClick={() => {
                  handleEmergencyMode('context_overflow');
                  setShowEmergencyControls(false);
                }}
                className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-left"
              >
                <div className="font-medium">Context Overflow</div>
                <div className="text-sm opacity-75">Aggressive summarization</div>
              </button>
              
              <button
                onClick={() => {
                  handleEmergencyMode('rate_limit');
                  setShowEmergencyControls(false);
                }}
                className="w-full px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 text-left"
              >
                <div className="font-medium">Rate Limit Hit</div>
                <div className="text-sm opacity-75">Cache-only mode</div>
              </button>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowEmergencyControls(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Mode Active Banner */}
      {optimizationState.emergencyMode.active && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-700">
              Emergency Mode Active: {optimizationState.emergencyMode.reason}
            </span>
          </div>
          <div className="text-xs text-red-600 mt-1">
            Using {optimizationState.emergencyMode.fallbackStrategy} strategy
          </div>
        </div>
      )}
    </div>
  );
}; 