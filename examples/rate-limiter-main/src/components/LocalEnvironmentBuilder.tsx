import React, { useState, useRef, useEffect, useCallback } from 'react';
import LocalTTSService from '../services/LocalTTSService';
import { getUnifiedTTS } from '../services/UnifiedTTSService';

interface Project {
  id: string;
  name: string;
  description: string;
  type: 'tts' | 'llm' | 'vision' | 'avatar' | 'custom';
  status: 'setup' | 'running' | 'completed';
  components: ProjectComponent[];
  currentPath: string;
}

interface ProjectComponent {
  id: string;
  name: string;
  type: 'model' | 'service' | 'ui' | 'config';
  status: 'pending' | 'installing' | 'ready' | 'error';
  commands: Command[];
  files: string[];
}

interface Command {
  id: string;
  description: string;
  command: string;
  path: string;
  requiresApproval: boolean;
  status: 'pending' | 'approved' | 'running' | 'completed' | 'failed';
  output?: string;
}

interface LocalEnvironmentBuilderProps {
  currentWorkingDirectory: string;
}

export const LocalEnvironmentBuilder: React.FC<LocalEnvironmentBuilderProps> = ({
  currentWorkingDirectory = '/Users/danielennis/ai-apps/rate limit message'
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [projectIdea, setProjectIdea] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingCommands, setPendingCommands] = useState<Command[]>([]);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const localTTSService = useRef<LocalTTSService | null>(null);

  useEffect(() => {
    // Initialize Local TTS for voice feedback
    localTTSService.current = new LocalTTSService({ model: 'enhanced-system' });
    localTTSService.current.initialize().catch(console.warn);
  }, []);

  // Predefined project templates
  const projectTemplates: Partial<Project>[] = [
    {
      name: 'Local TTS Voice Assistant',
      description: 'Set up Bark/SpeechT5 TTS with custom voice profiles',
      type: 'tts',
      components: [
        {
          id: 'tts-models',
          name: 'TTS Models',
          type: 'model',
          status: 'pending',
          commands: [
            {
              id: 'install-transformers',
              description: 'Install Transformers.js for browser-based TTS',
              command: 'npm install @huggingface/transformers',
              path: currentWorkingDirectory,
              requiresApproval: true,
              status: 'pending'
            }
          ],
          files: ['src/services/LocalTTSService.ts']
        }
      ]
    },
    {
      name: 'Talking Head Avatar',
      description: 'Integrate ditto-talkinghead with local TTS',
      type: 'avatar',
      components: [
        {
          id: 'avatar-models',
          name: 'Avatar Models',
          type: 'model',
          status: 'pending',
          commands: [
            {
              id: 'setup-git-lfs',
              description: 'Install Git LFS for large model files',
              command: 'git lfs install',
              path: currentWorkingDirectory,
              requiresApproval: true,
              status: 'pending'
            },
            {
              id: 'clone-ditto',
              description: 'Download ditto-talkinghead model',
              command: 'git clone https://huggingface.co/digital-avatar/ditto-talkinghead models/ditto-talkinghead',
              path: currentWorkingDirectory,
              requiresApproval: true,
              status: 'pending'
            }
          ],
          files: ['models/ditto-talkinghead/']
        }
      ]
    },
    {
      name: 'Custom Local AI Extension',
      description: 'Create your own local AI tool or service',
      type: 'custom',
      components: []
    }
  ];

  const analyzeProjectIdea = async () => {
    if (!projectIdea.trim()) return;

    setIsAnalyzing(true);
    
    // Simulate AI analysis of the project idea
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate project setup based on idea
    const analyzedProject: Project = {
      id: Date.now().toString(),
      name: `Custom Project: ${projectIdea.substring(0, 30)}...`,
      description: projectIdea,
      type: 'custom',
      status: 'setup',
      currentPath: currentWorkingDirectory,
      components: [
        {
          id: 'setup',
          name: 'Project Setup',
          type: 'config',
          status: 'pending',
          commands: [
            {
              id: 'create-dir',
              description: `Create project directory`,
              command: `mkdir -p "${projectIdea.toLowerCase().replace(/\s+/g, '-')}"`,
              path: currentWorkingDirectory,
              requiresApproval: true,
              status: 'pending'
            }
          ],
          files: []
        }
      ]
    };

    setProjects(prev => [...prev, analyzedProject]);
    setActiveProject(analyzedProject);
    setIsAnalyzing(false);
    setProjectIdea('');

    // Voice feedback with enhanced TTS
    try {
      const unifiedTTS = getUnifiedTTS();
      await unifiedTTS.speakUserFeedback(
        `Great idea! I've analyzed your project and created a setup. You can review the commands and approve them when ready.`
      );
    } catch (error) {
      console.warn('Voice feedback failed:', error);
    }
  };

  const createProjectFromTemplate = (template: Partial<Project>) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: template.name!,
      description: template.description!,
      type: template.type!,
      status: 'setup',
      currentPath: currentWorkingDirectory,
      components: template.components || []
    };

    setProjects(prev => [...prev, newProject]);
    setActiveProject(newProject);
    setIsTerminalOpen(true);
  };

  const approveCommand = async (command: Command) => {
    setPendingCommands(prev => prev.filter(c => c.id !== command.id));
    
    // Add to terminal output
    setTerminalOutput(prev => [
      ...prev,
      `📁 Navigating to: ${command.path}`,
      `🚀 Running: ${command.command}`,
      '⏳ Executing...'
    ]);

    // Simulate command execution
    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev,
        '✅ Command completed successfully!'
      ]);
    }, 2000);
  };

  const approveAllCommands = () => {
    pendingCommands.forEach(command => {
      approveCommand(command);
    });
  };

  const getAllPendingCommands = useCallback(() => {
    if (!activeProject) return [];
    
    const commands: Command[] = [];
    activeProject.components.forEach(component => {
      component.commands.forEach(command => {
        if (command.status === 'pending') {
          commands.push(command);
        }
      });
    });
    return commands;
  }, [activeProject]);

  useEffect(() => {
    setPendingCommands(getAllPendingCommands());
  }, [activeProject, getAllPendingCommands]);

  const PathDisplay: React.FC<{ path: string }> = ({ path }) => (
    <div className="bg-gray-800 text-green-400 p-2 rounded font-mono text-sm">
      📁 Current Path: <span className="text-white">{path}</span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🛠️ Local Environment Builder
        </h1>
        <p className="text-gray-600">
          Setup and manage local AI extensions without technical complexity
        </p>
        <PathDisplay path={currentWorkingDirectory} />
      </div>

      {/* Project Idea Input */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">💡 Describe Your Project Idea</h2>
        <div className="flex gap-4">
          <textarea
            value={projectIdea}
            onChange={(e) => setProjectIdea(e.target.value)}
            placeholder="Describe what you want to build... (e.g., 'A voice assistant that helps with cooking recipes' or 'An AI that generates music from text')"
            className="flex-1 p-3 border border-gray-300 rounded-lg resize-none h-24"
          />
          <button
            onClick={analyzeProjectIdea}
            disabled={isAnalyzing || !projectIdea.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? '🤖 Analyzing...' : '🔍 Analyze & Setup'}
          </button>
        </div>
      </div>

      {/* Project Templates */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">🚀 Quick Start Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectTemplates.map((template, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
              onClick={() => createProjectFromTemplate(template)}
            >
              <h3 className="font-semibold text-gray-800 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {template.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Project */}
      {activeProject && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">{activeProject.name}</h2>
              <p className="text-gray-600">{activeProject.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              activeProject.status === 'completed' ? 'bg-green-100 text-green-800' :
              activeProject.status === 'running' ? 'bg-blue-100 text-blue-800' :
              activeProject.status === 'setup' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {activeProject.status}
            </span>
          </div>

          {/* Project Components */}
          <div className="space-y-4">
            {activeProject.components.map((component) => (
              <div key={component.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">{component.name}</h3>
                  <span className={`px-2 py-1 rounded text-sm ${
                    component.status === 'ready' ? 'bg-green-100 text-green-800' :
                    component.status === 'installing' ? 'bg-blue-100 text-blue-800' :
                    component.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {component.status}
                  </span>
                </div>

                {/* Commands */}
                <div className="space-y-2">
                  {component.commands.map((command) => (
                    <div key={command.id} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm">{command.description}</p>
                          <code className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                            {command.command}
                          </code>
                        </div>
                        {command.status === 'pending' && command.requiresApproval && (
                          <button
                            onClick={() => approveCommand(command)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            ✅ Approve
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">📁 Path: {command.path}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Batch Approval */}
          {pendingCommands.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-yellow-800">
                    {pendingCommands.length} Commands Awaiting Approval
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Review the commands above and approve them to proceed
                  </p>
                </div>
                <button
                  onClick={approveAllCommands}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  🚀 Approve All
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Embedded Terminal */}
      {isTerminalOpen && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">🖥️ Terminal Output</h2>
            <button
              onClick={() => setIsTerminalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div
            ref={terminalRef}
            className="bg-black text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm"
          >
            {terminalOutput.length === 0 ? (
              <div className="text-gray-500">Terminal ready... Approve commands to see output</div>
            ) : (
              terminalOutput.map((line, index) => (
                <div key={index} className="mb-1">
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Projects List */}
      {projects.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">📋 Your Projects</h2>
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  activeProject?.id === project.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setActiveProject(project)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'running' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'setup' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalEnvironmentBuilder; 