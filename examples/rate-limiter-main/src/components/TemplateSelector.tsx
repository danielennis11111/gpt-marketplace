import React from 'react';
import { ConversationTemplate, AIModel } from '../types/index';

interface TemplateSelectorProps {
  templates: ConversationTemplate[];
  models: AIModel[];
  onSelectTemplate: (templateId: string) => void;
  onClose: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ 
  templates, 
  models, 
  onSelectTemplate, 
  onClose 
}) => {
  const getModelStatus = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    return model?.status || 'offline';
  };

  const isTemplateAvailable = (template: ConversationTemplate) => {
    return getModelStatus(template.modelId) === 'online';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
                              <h2 className="text-2xl font-bold">Choose Your AI Adventure</h2>
              <p className="text-yellow-100 mt-1">Welcome to META aiLand @ ASU - Select your AI companion for exploration</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => {
              const isAvailable = isTemplateAvailable(template);
              const modelStatus = getModelStatus(template.modelId);
              
              return (
                <div
                  key={template.id}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                    ${isAvailable 
                      ? 'border-gray-200 hover:border-[#FFC627] hover:shadow-md bg-white' 
                      : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                    }
                  `}
                  onClick={() => isAvailable && onSelectTemplate(template.id)}
                >
                  {/* Status indicator */}
                  <div className="absolute top-2 right-2">
                    <div className={`w-3 h-3 rounded-full ${
                      modelStatus === 'online' ? 'bg-green-500' : 
                      modelStatus === 'loading' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  </div>

                  {/* Template content */}
                  <div className="text-center mb-3">
                    <div className="mb-2">
                {template.icon.startsWith('http') ? (
                  <img 
                    src={template.icon} 
                    alt={template.name}
                    className="w-16 h-16 rounded-full border-2 border-gray-200 object-cover mx-auto"
                  />
                ) : (
                  <div className="text-4xl">{template.icon}</div>
                )}
              </div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {template.capabilities.slice(0, 3).map((feature: string, index: number) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    {/* Model info */}
                    <div className="text-xs text-gray-500 flex items-center justify-between">
                      <span>Model: {models.find(m => m.id === template.modelId)?.name}</span>
                      <span className={`font-medium ${
                        modelStatus === 'online' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {modelStatus}
                      </span>
                    </div>
                  </div>

                  {/* Disabled overlay */}
                  {!isAvailable && (
                    <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl mb-1">⚠️</div>
                        <div className="text-sm font-medium text-gray-600">Model Offline</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              ✨ Explore advanced AI features: Voice interaction, visual analysis, and extended memory
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector; 