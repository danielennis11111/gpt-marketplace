/**
 * 🔍 RAG Discovery Panel - Show Incantation-Powered Research History
 * 
 * Displays the discoveries made through RAG searches, showing what prompt patterns
 * (incantations) led to finding specific information in documents.
 */

import React, { useState } from 'react';
import { Search, Zap, FileText, Clock, Target, TrendingUp } from 'lucide-react';
import { RAGDiscovery } from '../types/index';

interface RAGDiscoveryPanelProps {
  discoveries: RAGDiscovery[];
  onDiscoveryClick?: (discovery: RAGDiscovery) => void;
  className?: string;
}

interface DiscoveryCardProps {
  discovery: RAGDiscovery;
  onClick?: () => void;
}

const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ discovery, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getIncantationColor = (incantation: string) => {
    const colors: Record<string, string> = {
      'semantic-search': 'bg-blue-100 text-blue-800',
      'chain-of-thought': 'bg-purple-100 text-purple-800',
      'expert-persona': 'bg-green-100 text-green-800',
      'working-backwards': 'bg-orange-100 text-orange-800',
      'assumption-reversal': 'bg-pink-100 text-pink-800'
    };
    return colors[incantation] || 'bg-gray-100 text-gray-800';
  };
  
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return timestamp.toLocaleDateString();
  };
  
  return (
    <div 
      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
      onClick={() => {
        setIsExpanded(!isExpanded);
        onClick?.();
      }}
    >
      {/* Header */}
      <div className="flex items-start space-x-3 mb-3">
        <Search className="w-5 h-5 text-gray-600 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            "{discovery.query}"
          </h4>
          <div className="flex items-center space-x-3 mt-1">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {formatTimestamp(discovery.timestamp)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {discovery.results.length} sources
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {Math.round(discovery.confidence * 100)}% confidence
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Incantation Badge */}
      <div className="flex items-center space-x-2 mb-3">
        <Zap className="w-4 h-4 text-purple-600" />
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIncantationColor(discovery.incantationUsed)}`}>
          {discovery.incantationUsed.replace('-', ' ')}
        </span>
      </div>
      
      {/* Results Preview */}
      <div className="space-y-2">
        {discovery.results.slice(0, isExpanded ? undefined : 2).map((result, index) => (
          <div key={result.id} className="bg-gray-50 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">
                {result.source}
              </span>
              <span className="text-xs text-gray-500">
                {Math.round(result.relevance * 100)}% match
              </span>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">
              {result.highlightedText || result.content.substring(0, 100)}...
            </p>
          </div>
        ))}
        
        {!isExpanded && discovery.results.length > 2 && (
          <button 
            className="text-xs text-blue-600 hover:text-blue-800"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
          >
            +{discovery.results.length - 2} more sources
          </button>
        )}
      </div>
      
      {/* Quality Indicators */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-3 text-xs text-gray-500">
          <span>Quality: {Math.round((discovery.results.reduce((sum, r) => sum + (r.quality || 0.5), 0) / discovery.results.length) * 100)}%</span>
          <span>Sources: {discovery.results.length}</span>
        </div>
        <Target className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};

const RAGDiscoveryPanel: React.FC<RAGDiscoveryPanelProps> = ({
  discoveries,
  onDiscoveryClick,
  className = ''
}) => {
  if (discoveries.length === 0) {
    return (
      <div className={`text-center text-gray-500 py-8 ${className}`}>
        <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No RAG discoveries yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Upload documents and ask questions to see incantation-powered research
        </p>
      </div>
    );
  }
  
  // Sort discoveries by timestamp (newest first)
  const sortedDiscoveries = [...discoveries].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );
  
  // Group by incantation type
  const groupedByIncantation = sortedDiscoveries.reduce((groups, discovery) => {
    const incantation = discovery.incantationUsed;
    if (!groups[incantation]) {
      groups[incantation] = [];
    }
    groups[incantation].push(discovery);
    return groups;
  }, {} as Record<string, RAGDiscovery[]>);
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-purple-900">Research Discovery History</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-purple-600 font-medium">{discoveries.length}</span>
            <span className="text-purple-700"> Discoveries</span>
          </div>
          <div>
            <span className="text-purple-600 font-medium">{Object.keys(groupedByIncantation).length}</span>
            <span className="text-purple-700"> Incantations</span>
          </div>
          <div>
            <span className="text-purple-600 font-medium">
              {discoveries.reduce((sum, d) => sum + d.results.length, 0)}
            </span>
            <span className="text-purple-700"> Sources</span>
          </div>
        </div>
      </div>
      
      {/* Discoveries */}
      <div className="space-y-3">
        {sortedDiscoveries.map((discovery, index) => (
          <DiscoveryCard
            key={`${discovery.timestamp.getTime()}-${index}`}
            discovery={discovery}
            onClick={() => onDiscoveryClick?.(discovery)}
          />
        ))}
      </div>
    </div>
  );
};

export default RAGDiscoveryPanel; 