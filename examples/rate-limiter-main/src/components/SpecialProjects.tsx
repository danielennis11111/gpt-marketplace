import React from 'react';
import { Cpu, GraduationCap, Sparkles } from 'lucide-react';
import ServiceLogo from './ServiceLogo';
import { specialProjects } from '../data/specialProjects';
import { ConversationTemplate } from '../types/index';

interface SpecialProjectsProps {
  onSelectProject: (template: ConversationTemplate) => void;
}

const SpecialProjects: React.FC<SpecialProjectsProps> = ({ onSelectProject }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent mb-4">
          Superhuman AI Experiences
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Discover the incredible potential of AI at ASU. These curated experiences showcase just the 
          <span className="font-bold text-purple-600"> tip of the iceberg</span> of what's possible when 
          human creativity meets artificial intelligence.
        </p>
      </div>

      {/* Featured Introduction */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl p-8 mb-12 border-2 border-purple-100">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Transform Into a Superhuman
        </h2>
        <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
          Each experience is designed to multiply your capabilities by 10x or more. These aren't just AI tools - 
          they're <span className="font-bold text-purple-700">cognitive amplifiers</span> that turn ordinary students 
          into extraordinary innovators, researchers, creators, and problem-solvers.
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {specialProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectProject(project)}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className={`${project.color} rounded-3xl p-1`}>
              <div className="bg-white rounded-3xl p-6 h-full">
                {/* Project Header */}
                <div className="flex items-center mb-4">
                  <img
                    src={project.icon}
                    alt={project.persona}
                    className="w-12 h-12 rounded-full mr-4 border-2 border-white shadow-lg"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600">{project.persona}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {project.description}
                </p>

                {/* Capabilities Preview */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Superhuman Capabilities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.capabilities.slice(0, 3).map((capability, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-xs rounded-full border border-purple-200"
                      >
                        {capability}
                      </span>
                    ))}
                    {project.capabilities.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{project.capabilities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Model Badge */}
                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                  <ServiceLogo modelId={project.modelId} variant="light" size="sm" />
                  <span className="text-sm font-medium text-gray-600">
                    {project.modelId.toUpperCase()}
                  </span>
                </div>
                </div>

                {/* Hover Effect Indicator */}
                <div className="mt-4 text-center">
                  <span className="text-sm text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to activate superhuman mode →
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl p-8 border-2 border-yellow-200">
          <GraduationCap className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Become Superhuman?
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            These experiences represent just a glimpse of the AI revolution happening at ASU. 
            Join us in exploring the infinite possibilities when human potential meets artificial intelligence.
          </p>
          <div className="mt-6">
            <p className="text-sm text-orange-700 font-medium flex items-center justify-center">
              <Sparkles className="w-4 h-4 mr-1" />
              Click any project above to begin your transformation
              <Sparkles className="w-4 h-4 ml-1" />
            </p>
          </div>
        </div>
      </div>

      {/* Technical Innovation Note */}
      <div className="mt-12 text-center">
        <div className="inline-block bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl px-8 py-4">
          <p className="text-sm">
            <span className="text-yellow-400 font-bold flex items-center">
              <Cpu className="w-4 h-4 mr-1" />
              Innovation Lab:
            </span> 
            {" "}Powered by OpenAI's most advanced models including GPT-4o, o1-preview, and GPT-4 Turbo
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpecialProjects; 