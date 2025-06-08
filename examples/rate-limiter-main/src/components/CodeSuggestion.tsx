import React, { useState } from 'react';
import { Check, X, FileText, Download, Eye, EyeOff } from 'lucide-react';

interface CodeSuggestionProps {
  filePath: string;
  originalCode?: string;
  suggestedCode: string;
  description: string;
  onApprove: (filePath: string, code: string) => void;
  onDiscard: () => void;
  language?: string;
}

const CodeSuggestion: React.FC<CodeSuggestionProps> = ({
  filePath,
  originalCode,
  suggestedCode,
  description,
  onApprove,
  onDiscard,
  language = 'typescript'
}) => {
  const [showDiff, setShowDiff] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleApprove = async () => {
    setIsApplying(true);
    try {
      await onApprove(filePath, suggestedCode);
    } finally {
      setIsApplying(false);
    }
  };

  const renderDiff = () => {
    if (!originalCode) {
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
            New File: {filePath}
          </div>
          <pre className="bg-green-50 border-l-4 border-green-400 p-3 text-sm overflow-x-auto">
            <code className="text-green-800">{suggestedCode}</code>
          </pre>
        </div>
      );
    }

    // Simple diff - split by lines and compare
    const originalLines = originalCode.split('\n');
    const suggestedLines = suggestedCode.split('\n');
    const maxLines = Math.max(originalLines.length, suggestedLines.length);

    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
          Changes to: {filePath}
        </div>
        <div className="bg-gray-50 border rounded-lg overflow-hidden">
          <div className="grid grid-cols-2 divide-x">
            {/* Original */}
            <div className="p-3">
              <div className="text-xs font-medium text-red-600 mb-2">Before</div>
              <pre className="text-sm overflow-x-auto">
                <code className="text-red-700">
                  {originalLines.map((line, i) => (
                    <div key={i} className="hover:bg-red-100">
                      <span className="text-gray-400 mr-2">{i + 1}</span>
                      {line}
                    </div>
                  ))}
                </code>
              </pre>
            </div>
            
            {/* Suggested */}
            <div className="p-3">
              <div className="text-xs font-medium text-green-600 mb-2">After</div>
              <pre className="text-sm overflow-x-auto">
                <code className="text-green-700">
                  {suggestedLines.map((line, i) => (
                    <div key={i} className="hover:bg-green-100">
                      <span className="text-gray-400 mr-2">{i + 1}</span>
                      {line}
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border border-blue-200 rounded-lg bg-blue-50/30 p-4 my-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-900">{description}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDiff(!showDiff)}
            className="flex items-center space-x-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            {showDiff ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{showDiff ? 'Hide' : 'View'} Diff</span>
          </button>
        </div>
      </div>

      {/* File Path */}
      <div className="text-sm text-gray-600 font-mono bg-white px-2 py-1 rounded border mb-3">
        {filePath}
      </div>

      {/* Diff View */}
      {showDiff && (
        <div className="mb-4">
          {renderDiff()}
        </div>
      )}

      {/* Preview (collapsed) */}
      {!showDiff && (
        <div className="mb-4">
          <pre className="bg-white border rounded p-3 text-sm overflow-x-auto max-h-40">
            <code className="text-gray-700">
              {suggestedCode.length > 500 
                ? `${suggestedCode.substring(0, 500)}...` 
                : suggestedCode
              }
            </code>
          </pre>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleApprove}
          disabled={isApplying}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isApplying
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{isApplying ? 'Applying...' : 'Apply Changes'}</span>
        </button>
        
        <button
          onClick={onDiscard}
          disabled={isApplying}
          className="flex items-center space-x-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Discard</span>
        </button>
        
        <div className="text-xs text-gray-500">
          {originalCode ? 'Modify existing file' : 'Create new file'}
        </div>
      </div>
    </div>
  );
};

export default CodeSuggestion; 