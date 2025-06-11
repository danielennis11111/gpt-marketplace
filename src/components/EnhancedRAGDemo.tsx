import React, { useState } from 'react';
import { EnhancedRAGProcessor, MODEL_CAPABILITIES } from '../utils/enhancedRAGProcessor';
import { FileText, Image, Music, Video, Code, Database, Info } from 'lucide-react';

const EnhancedRAGDemo: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const processor = new EnhancedRAGProcessor(selectedModel);
  const capabilities = MODEL_CAPABILITIES[selectedModel] || MODEL_CAPABILITIES['llama3.1:8b'];

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'Documents': return <FileText className="w-5 h-5" />;
      case 'Images': return <Image className="w-5 h-5" />;
      case 'Audio': return <Music className="w-5 h-5" />;
      case 'Video': return <Video className="w-5 h-5" />;
      case 'Code': return <Code className="w-5 h-5" />;
      case 'Data': return <Database className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getSupportedFileTypes = () => {
    const types = [];
    if (capabilities.documents) types.push('Documents');
    if (capabilities.vision) types.push('Images');
    if (capabilities.audio) types.push('Audio');
    if (capabilities.video) types.push('Video');
    return types;
  };

  const getFileExtensionsByType = (type: string) => {
    const extensions = {
      'Documents': ['pdf', 'txt', 'md', 'doc', 'docx', 'rtf', 'odt'],
      'Images': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
      'Audio': ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'],
      'Video': ['mp4', 'avi', 'mov', 'mkv', 'webm'],
      'Code': ['js', 'ts', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'kt', 'swift', 'html', 'css', 'jsx', 'tsx', 'vue', 'svelte'],
      'Data': ['json', 'xml', 'csv', 'yaml', 'yml', 'toml', 'ini']
    };
    return extensions[type as keyof typeof extensions] || [];
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-[#FFC627] bg-opacity-20 rounded-lg">
          <Info className="w-6 h-6 text-[#FFC627]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Enhanced RAG File Support</h3>
          <p className="text-sm text-gray-600">Upload various file types based on your selected model's capabilities</p>
        </div>
      </div>

      {/* Model Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selected Model
        </label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC627] focus:border-transparent"
        >
          {Object.keys(MODEL_CAPABILITIES).map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      {/* Capabilities Overview */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Model Capabilities</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Documents', 'Images', 'Audio', 'Video'].map((type) => {
            const isSupported = getSupportedFileTypes().includes(type);
            return (
              <div
                key={type}
                className={`flex items-center gap-2 p-3 rounded-lg border ${
                  isSupported
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                {getFileTypeIcon(type)}
                <span className="text-sm font-medium">{type}</span>
                {isSupported && <span className="text-xs">✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Supported File Types */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Supported File Types ({capabilities.maxFileSize}MB max)
        </h4>
        <div className="space-y-3">
          {getSupportedFileTypes().map((type) => (
            <div key={type} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              {getFileTypeIcon(type)}
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">{type}</div>
                <div className="text-xs text-gray-600 flex flex-wrap gap-1">
                  {getFileExtensionsByType(type)
                    .filter(ext => capabilities.supportedFormats.includes(ext))
                    .map((ext) => (
                      <span
                        key={ext}
                        className="px-2 py-1 bg-white rounded text-gray-700 border border-gray-200"
                      >
                        .{ext}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Processing Methods */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Processing Methods</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>• <span className="font-medium">Documents:</span> Text extraction and parsing</div>
          {capabilities.vision && (
            <div>• <span className="font-medium">Images:</span> Base64 encoding with dimension analysis</div>
          )}
          {capabilities.audio && (
            <div>• <span className="font-medium">Audio:</span> Base64 encoding for audio processing</div>
          )}
          {capabilities.video && (
            <div>• <span className="font-medium">Video:</span> Base64 encoding for video analysis</div>
          )}
          <div>• <span className="font-medium">Code:</span> Syntax highlighting and structure preservation</div>
          <div>• <span className="font-medium">Data:</span> JSON/CSV parsing and formatting</div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedRAGDemo; 