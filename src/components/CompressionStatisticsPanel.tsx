import React, { useState, useEffect } from 'react';
import { CompressionEngine } from '../utils/rate-limiter/compressionEngine';
import type { CompressionStatistics } from '../utils/rate-limiter/compressionEngine';
import { ArchiveBoxIcon, ChartBarIcon, ArrowTrendingUpIcon, CalendarIcon } from '@heroicons/react/24/outline';

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
          <ArchiveBoxIcon className="w-4 h-4 text-gray-400" />
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
          <ArchiveBoxIcon className="w-4 h-4 text-blue-600" />
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
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'history', label: 'History', icon: CalendarIcon },
              { id: 'efficiency', label: 'Efficiency', icon: ArrowTrendingUpIcon }
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompressionStatisticsPanel;