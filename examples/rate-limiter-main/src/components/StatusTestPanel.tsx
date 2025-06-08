import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { AIModel, ModelStatus } from '../types/index';

interface StatusTestPanelProps {
  models: AIModel[];
  onRefreshStatus: () => Promise<void>;
  getModelStatus: (modelId: string) => ModelStatus | undefined;
}

const StatusTestPanel: React.FC<StatusTestPanelProps> = ({
  models,
  onRefreshStatus,
  getModelStatus
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshStatus();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Status refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'limited':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'loading':
        return <Clock className="w-4 h-4 text-[#FFC627]" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-50 border-green-200';
      case 'offline':
        return 'bg-red-50 border-red-200';
      case 'limited':
        return 'bg-yellow-50 border-yellow-200';
      case 'loading':
        return 'bg-[#FFC627] bg-opacity-20 border-[#FFC627] border-opacity-40';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  // Group models by service
  const groupedModels = models.reduce((acc, model) => {
    let service = 'Unknown';
    if (model.id.startsWith('gpt-') || model.id.startsWith('o3') || model.id.startsWith('o4-') || model.id === 'o3') {
      service = 'OpenAI';
    } else if (model.id.startsWith('gemini')) {
      service = 'Gemini';
    } else if (model.id.includes('llama')) {
      service = 'Llama/Ollama';
    }

    if (!acc[service]) acc[service] = [];
    acc[service].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-[#FFC627]" />
          Model Status Monitor
        </h3>
        <div className="flex items-center space-x-3">
          {lastRefresh && (
            <span className="text-xs text-gray-500">
              Last check: {formatTime(lastRefresh)}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1 px-3 py-1 bg-[#FFC627] bg-opacity-20 hover:bg-[#FFC627] hover:bg-opacity-30 text-[#191919] rounded text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Testing...' : 'Test All'}</span>
          </button>
        </div>
      </div>

      {Object.entries(groupedModels).map(([service, serviceModels]) => (
        <div key={service} className="mb-4 last:mb-0">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <span className="mr-2">{service}</span>
            <span className="text-xs text-gray-500">
              ({serviceModels.filter(m => m.status === 'online').length}/{serviceModels.length} online)
            </span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {serviceModels.map((model) => {
              const modelStatus = getModelStatus(model.id);
              return (
                <div
                  key={model.id}
                  className={`p-3 border rounded-lg ${getStatusColor(model.status)}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {model.name}
                    </span>
                    {getStatusIcon(model.status)}
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-2">
                    {model.status === 'loading' ? 'Testing...' : model.status}
                  </div>

                  {modelStatus && (
                    <div className="space-y-1">
                      {modelStatus.responseTime && (
                        <div className="text-xs text-gray-500">
                          Response: {modelStatus.responseTime}ms
                        </div>
                      )}
                      {modelStatus.additionalInfo && (
                        <div className="text-xs text-gray-500">
                          {modelStatus.additionalInfo}
                        </div>
                      )}
                      {modelStatus.error && (
                        <div className="text-xs text-red-600 truncate" title={modelStatus.error}>
                          {modelStatus.error}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        Checked: {formatTime(modelStatus.lastChecked)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Service Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Total: {models.length} models
          </span>
          <div className="flex items-center space-x-4">
            <span className="text-green-600 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              {models.filter(m => m.status === 'online').length} online
            </span>
            <span className="text-yellow-600 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {models.filter(m => m.status === 'limited').length} limited
            </span>
            <span className="text-red-600 flex items-center">
              <XCircle className="w-3 h-3 mr-1" />
              {models.filter(m => m.status === 'offline').length} offline
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusTestPanel; 