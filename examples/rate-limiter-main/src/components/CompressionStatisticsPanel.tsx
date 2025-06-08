import React, { useState, useEffect } from 'react';
import { CompressionEngine, CompressionStatistics } from '../utils/compressionEngine';
import { TrendingUp, Activity, Target, Archive, PieChart, Calendar } from 'lucide-react';

interface CompressionStatisticsPanelProps {
  compressionEngine: CompressionEngine;
  refreshInterval?: number; // in milliseconds
}

/**
 * 📊 Compression Statistics Panel
 * Shows comprehensive compression analytics including lossless percentages and efficiency metrics
 */
const CompressionStatisticsPanel: React.FC<CompressionStatisticsPanelProps> = ({
  compressionEngine,
  refreshInterval = 5000 // Default 5 seconds
}) => {
  const [statistics, setStatistics] = useState<CompressionStatistics | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'history' | 'efficiency'>('overview');

  // Refresh statistics periodically
  useEffect(() => {
    const updateStats = () => {
      const stats = compressionEngine.getCompressionStatistics();
      setStatistics(stats);
    };

    updateStats(); // Initial load
    const interval = setInterval(updateStats, refreshInterval);

    return () => clearInterval(interval);
  }, [compressionEngine, refreshInterval]);

  if (!statistics) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <Archive className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">Loading compression statistics...</span>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  const getCompressionRatioColor = (ratio: number): string => {
    if (ratio < 0.5) return 'text-green-600';
    if (ratio < 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLosslessColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
      {/* Minimized View */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <Archive className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-700">Compression Stats:</span>
          <span className="font-mono text-blue-600">
            {statistics.totalCompressions} events
          </span>
          <span className={`font-medium ${getLosslessColor(statistics.losslessPercentage)}`}>
            {statistics.losslessPercentage.toFixed(1)}% lossless
          </span>
          <span className="text-green-600 font-medium">
            {formatNumber(statistics.totalTokensSaved)} tokens saved
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Mini efficiency bar */}
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (1 - statistics.averageCompressionRatio) * 100)}%` }}
            />
          </div>
          
          <svg 
            className={`w-4 h-4 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: PieChart },
              { id: 'history', label: 'History', icon: Calendar },
              { id: 'efficiency', label: 'Efficiency', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-3">
              {/* Key Metrics */}
              <div>
                <h4 className="font-medium text-gray-700 text-xs mb-2">Key Metrics</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total compressions:</span>
                      <span className="font-mono font-semibold">{statistics.totalCompressions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tokens saved:</span>
                      <span className="font-mono text-green-600 font-semibold">
                        {formatNumber(statistics.totalTokensSaved)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg compression ratio:</span>
                      <span className={`font-mono font-semibold ${getCompressionRatioColor(statistics.averageCompressionRatio)}`}>
                        {(statistics.averageCompressionRatio * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lossless percentage:</span>
                      <span className={`font-mono font-semibold ${getLosslessColor(statistics.losslessPercentage)}`}>
                        {statistics.losslessPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average accuracy:</span>
                      <span className="font-mono text-blue-600 font-semibold">
                        {(statistics.averageAccuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Best strategy:</span>
                      <span className="font-mono text-purple-600 font-semibold">
                        {statistics.mostEffectiveStrategy}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compression by Type */}
              <div>
                <h4 className="font-medium text-gray-700 text-xs mb-2">Compressions by Type</h4>
                <div className="space-y-1">
                  {Object.entries(statistics.compressionsByType).map(([type, count]) => {
                    const percentage = (count / statistics.totalCompressions) * 100;
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-xs text-gray-600 capitalize w-16">{type}:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                type === 'lossless' ? 'bg-green-500' :
                                type === 'semantic' ? 'bg-blue-500' :
                                type === 'summary' ? 'bg-yellow-500' : 'bg-purple-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-mono ml-2">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Compressions */}
              {statistics.recentCompressions.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 text-xs mb-2">Recent Compressions</h4>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {statistics.recentCompressions.slice(-5).map((event, index) => (
                      <div key={event.id} className="flex items-center justify-between text-xs bg-white rounded p-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-1 rounded text-xs font-mono ${
                            event.strategy === 'lossless' ? 'bg-green-100 text-green-700' :
                            event.strategy === 'semantic' ? 'bg-blue-100 text-blue-700' :
                            event.strategy === 'summary' ? 'bg-yellow-100 text-yellow-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {event.strategy}
                          </span>
                          <span className="text-gray-600">
                            {event.originalTokens}→{event.compressedTokens} tokens
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-mono ${getCompressionRatioColor(event.ratio)}`}>
                            {(event.ratio * 100).toFixed(0)}%
                          </span>
                          <span className="text-gray-500">
                            {event.timestamp.toLocaleTimeString().slice(0, 5)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {selectedTab === 'history' && (
            <div className="space-y-3">
              {/* Daily History */}
              <div>
                <h4 className="font-medium text-gray-700 text-xs mb-2">Daily Activity (Last 7 Days)</h4>
                <div className="space-y-1">
                  {statistics.compressionHistory.daily.map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{new Date(day.date).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono">{day.compressions} compressions</span>
                        <span className="font-mono text-green-600">{formatNumber(day.tokensSaved)} saved</span>
                        <div className="w-12 bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full"
                            style={{ width: `${Math.min(100, (day.compressions / 10) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly History */}
              <div>
                <h4 className="font-medium text-gray-700 text-xs mb-2">Weekly Summary (Last 4 Weeks)</h4>
                <div className="space-y-1">
                  {statistics.compressionHistory.weekly.map((week, index) => (
                    <div key={week.week} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{week.week}</span>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono">{week.compressions} compressions</span>
                        <span className="font-mono text-green-600">{formatNumber(week.tokensSaved)} saved</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, (week.compressions / 50) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Efficiency Tab */}
          {selectedTab === 'efficiency' && (
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-700 text-xs mb-2">Strategy Effectiveness</h4>
                <div className="space-y-2">
                  {compressionEngine.getEfficiencyReport().compressionsByStrategy
                    .sort((a, b) => b.tokensSaved - a.tokensSaved)
                    .map((strategy) => (
                    <div key={strategy.strategy} className="bg-white rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium capitalize">{strategy.strategy}</span>
                        <span className="text-xs text-gray-500">{strategy.count} uses</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Tokens saved:</span>
                        <span className="font-mono text-green-600">{formatNumber(strategy.tokensSaved)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Avg compression:</span>
                        <span className={`font-mono ${getCompressionRatioColor(strategy.avgRatio)}`}>
                          {(strategy.avgRatio * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-1 rounded-full"
                          style={{ width: `${Math.min(100, (strategy.tokensSaved / statistics.totalTokensSaved) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Efficiency */}
              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                <h4 className="font-medium text-blue-800 text-xs mb-1">Overall Efficiency</h4>
                <div className="text-xs text-blue-700">
                  <p>
                    <strong>{statistics.losslessPercentage.toFixed(1)}%</strong> of compressions were lossless, 
                    saving <strong>{formatNumber(statistics.totalTokensSaved)}</strong> tokens total.
                  </p>
                  <p className="mt-1">
                    Average compression ratio: <strong>{(statistics.averageCompressionRatio * 100).toFixed(1)}%</strong> 
                    with <strong>{(statistics.averageAccuracy * 100).toFixed(1)}%</strong> accuracy.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompressionStatisticsPanel; 