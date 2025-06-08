import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircleIcon,
  CpuChipIcon,
  PuzzlePieceIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  LinkIcon,
  TagIcon
} from '@heroicons/react/24/outline';

type ContributionType = 'ai-project' | 'extension' | 'local-model' | 'tutorial';

export const ContributePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<ContributionType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
    link: '',
    instructions: '',
    difficulty: 'beginner'
  });

  const contributionTypes = [
    {
      id: 'ai-project' as ContributionType,
      name: 'AI Project',
      description: 'Custom AI assistants built with MyAI Builder',
      icon: PlusCircleIcon,
      color: 'from-red-600 to-yellow-500',
      examples: ['Research assistant', 'Code helper', 'Data analyzer']
    },
    {
      id: 'extension' as ContributionType,
      name: 'Extension',
      description: 'Embeddable chatbots and website integrations',
      icon: PuzzlePieceIcon,
      color: 'from-blue-500 to-cyan-500',
      examples: ['Customer support chatbot', 'Website assistant', 'FAQ bot']
    },
    {
      id: 'local-model' as ContributionType,
      name: 'Local Model',
      description: 'Downloadable AI models for private deployment',
      icon: CpuChipIcon,
      color: 'from-purple-500 to-pink-500',
      examples: ['Fine-tuned Llama model', 'Custom Gemma variant', 'Specialized CodeLlama']
    },
    {
      id: 'tutorial' as ContributionType,
      name: 'Tutorial',
      description: 'Step-by-step guides and educational content',
      icon: AcademicCapIcon,
      color: 'from-green-500 to-teal-500',
      examples: ['API setup guide', 'Integration tutorial', 'Best practices']
    }
  ];

  const handleSubmit = () => {
    // In a real implementation, this would submit to an API
    console.log('Submitting contribution:', { type: selectedType, ...formData });
    
    // Simulate successful submission
    alert('Thank you for your contribution! It will be reviewed and added to the marketplace soon.');
    navigate('/marketplace');
  };

  const renderTypeSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contribute to Beta Land</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Share your extensions, local models, or tutorials with the ASU community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {contributionTypes.map((type) => {
          const Icon = type.icon;
          return (
            <div
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className="group cursor-pointer transform transition-all duration-200 hover:scale-105"
            >
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:border-gray-300 h-full">
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center mb-4 mx-auto`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                  {type.name}
                </h3>
                
                <p className="text-gray-600 text-center mb-4">
                  {type.description}
                </p>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Examples:</p>
                  {type.examples.map((example, index) => (
                    <p key={index} className="text-sm text-gray-400">• {example}</p>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-center">
                  <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg group-hover:bg-gray-200 transition-colors">
                    Contribute {type.name}
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderContributionForm = () => {
    const selectedTypeData = contributionTypes.find(t => t.id === selectedType)!;
    const Icon = selectedTypeData.icon;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setSelectedType(null)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowRightIcon className="w-5 h-5 rotate-180" />
          </button>
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${selectedTypeData.color} flex items-center justify-center mr-3`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contribute {selectedTypeData.name}</h1>
            <p className="text-gray-600">{selectedTypeData.description}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DocumentTextIcon className="w-4 h-4 inline mr-1" />
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={`My ${selectedTypeData.name}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder={`Describe your ${selectedTypeData.name.toLowerCase()}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select category</option>
                <option value="Productivity">Productivity</option>
                <option value="Development">Development</option>
                <option value="Analytics">Analytics</option>
                <option value="Education">Education</option>
                <option value="Research">Research</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TagIcon className="w-4 h-4 inline mr-1" />
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="ai, assistant, productivity"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {selectedType === 'tutorial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <LinkIcon className="w-4 h-4 inline mr-1" />
              {selectedType === 'ai-project' ? 'MyAI Builder Link' :
               selectedType === 'extension' ? 'Demo/GitHub Link' : 
               selectedType === 'local-model' ? 'Download/Repository Link' : 
               'Tutorial Link/Document'}
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder={selectedType === 'ai-project' ? 'https://myai.example.com/project/...' : 'https://...'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Setup Instructions
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={4}
              placeholder={`Provide step-by-step instructions for using your ${selectedTypeData.name.toLowerCase()}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setSelectedType(null)}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.description || !formData.category}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                formData.name && formData.description && formData.category
                  ? 'bg-red-800 text-white hover:bg-red-900'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Contribution
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {selectedType ? renderContributionForm() : renderTypeSelection()}
    </div>
  );
}; 