import React, { useState } from 'react';
import { UnifiedPromptSystem, type SystemPromptComponents } from '../utils/promptSystem';
import { ChevronDownIcon, ChevronRightIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface SystemPromptPreviewProps {
  template?: any;
  persona?: any;
  additionalInstructions?: any;
  ragDocuments?: any[];
  className?: string;
}

const SystemPromptPreview: React.FC<SystemPromptPreviewProps> = ({
  template,
  persona,
  additionalInstructions,
  ragDocuments = [],
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Build the unified system prompt
  const components: SystemPromptComponents = UnifiedPromptSystem.extractPromptComponents(
    template,
    persona,
    additionalInstructions,
    ragDocuments
  );

  const systemPrompt = UnifiedPromptSystem.buildSystemPrompt(components);
  const tokenCount = UnifiedPromptSystem.estimateSystemPromptTokens(components);
  const validation = UnifiedPromptSystem.validatePromptSize(components);

  const getSectionCount = () => {
    let count = 0;
    if (components.persona || components.baseTemplate) count++;
    if (components.additionalInstructions) count++;
    if (components.ragContext?.documents.length) count++;
    count++; // Always includes conversation flow
    return count;
  };

  const getSectionStatus = (section: string) => {
    switch (section) {
      case 'persona':
        return components.persona ? 'active' : components.baseTemplate ? 'base' : 'inactive';
      case 'instructions':
        return components.additionalInstructions ? 'active' : 'inactive';
      case 'rag':
        return components.ragContext?.documents.length ? 'active' : 'inactive';
      case 'flow':
        return 'always';
      default:
        return 'inactive';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'base': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'always': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-400 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'base': return 'Base';
      case 'always': return 'Always';
      default: return 'Inactive';
    }
  };

  return (
    <div className={`border border-gray-200 rounded-lg bg-white ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <InformationCircleIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Unified System Prompt ({getSectionCount()} sections active)
            </h3>
            <p className="text-xs text-gray-500">
              {tokenCount.toLocaleString()} tokens • 
              <span className={validation.valid ? 'text-green-600' : 'text-red-600'}>
                {validation.valid ? ' Valid' : ' Exceeds limit'}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {validation.warning && (
            <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              Warning
            </div>
          )}
          {isExpanded ? (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Section Overview */}
          <div className="p-4 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900 mb-3">System Components</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { key: 'persona', label: 'Persona', icon: '👤' },
                { key: 'instructions', label: 'Instructions', icon: '⚡' },
                { key: 'rag', label: 'Documents', icon: '📄' },
                { key: 'flow', label: 'Flow Rules', icon: '🔄' }
              ].map(({ key, label, icon }) => {
                const status = getSectionStatus(key);
                return (
                  <div
                    key={key}
                    className={`p-2 rounded-lg border text-xs font-medium transition-colors ${getStatusColor(status)}`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{icon}</span>
                      <span>{label}</span>
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      {getStatusLabel(status)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full System Prompt */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Complete System Prompt</h4>
              <button
                onClick={() => navigator.clipboard.writeText(systemPrompt)}
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
              >
                Copy
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-xs max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{systemPrompt}</pre>
            </div>
          </div>

          {/* Validation Info */}
          {validation.warning && (
            <div className="p-4 border-t border-gray-200 bg-amber-50">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-amber-200 rounded-full flex-shrink-0 mt-0.5"></div>
                <div>
                  <p className="text-sm font-medium text-amber-800">Optimization Suggestion</p>
                  <p className="text-xs text-amber-700 mt-1">{validation.warning}</p>
                </div>
              </div>
            </div>
          )}

          {/* Component Details */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Component Details</h4>
            
            {components.persona && (
              <div className="text-xs">
                <span className="font-medium text-green-700">Persona:</span> {components.persona.name}
              </div>
            )}
            
            {components.additionalInstructions && (
              <div className="text-xs">
                <span className="font-medium text-blue-700">Enhanced with:</span> {components.additionalInstructions.title}
              </div>
            )}
            
            {components.ragContext?.documents && components.ragContext.documents.length > 0 && (
              <div className="text-xs">
                <span className="font-medium text-purple-700">RAG Documents:</span>{' '}
                {components.ragContext.documents.map((doc, i) => doc.name).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemPromptPreview; 