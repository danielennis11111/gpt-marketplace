import { AIModel, ModelStatus } from '../types/index';

export class ModelManager {
  private models: Map<string, AIModel> = new Map();
  private statusCache: Map<string, ModelStatus> = new Map();
  private statusCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeModels();
    this.startStatusMonitoring();
  }

  private initializeModels(): void {
    const defaultModels: AIModel[] = [
      // 🔥 Latest 2025 Models - Reasoning & Planning
      {
        id: 'o3',
        name: 'o3 (2025)',
        description: '🧠 Best for long-term planning, hard tasks, and deep reasoning',
        status: 'loading',
        capabilities: ['reasoning', 'planning', 'complex-tasks', 'problem-solving', 'analysis'],
        maxTokens: 200000,
        isMultimodal: false
      },
      {
        id: 'o4-mini',
        name: 'o4-mini (2025)',
        description: '⚡ Optimized for hard tasks and reasoning with efficiency',
        status: 'loading',
        capabilities: ['reasoning', 'planning', 'complex-tasks', 'fast-execution'],
        maxTokens: 128000,
        isMultimodal: false
      },
      
      // 🚀 Latest 2025 Models - Agentic Execution
      {
        id: 'gpt-4.1',
        name: 'GPT-4.1 (2025)',
        description: '🎯 Best for agentic execution and autonomous task completion',
        status: 'loading',
        capabilities: ['agentic-execution', 'task-completion', 'workflow-automation', 'reasoning'],
        maxTokens: 128000,
        isMultimodal: true
      },
      {
        id: 'gpt-4.1-mini',
        name: 'GPT-4.1-mini (2025)',
        description: '⚖️ Perfect balance of agentic capability and low latency',
        status: 'loading',
        capabilities: ['agentic-execution', 'balanced-performance', 'fast-response'],
        maxTokens: 128000,
        isMultimodal: false
      },
      {
        id: 'gpt-4.1-nano',
        name: 'GPT-4.1-nano (2025)',
        description: '⚡ Ultra-fast, best for low-latency applications',
        status: 'loading',
        capabilities: ['ultra-low-latency', 'real-time', 'quick-responses'],
        maxTokens: 64000,
        isMultimodal: false
      },

      // 📈 Current Generation Models
      {
        id: 'gpt-4o',
        name: 'GPT-4o (Current)',
        description: 'OpenAI\'s flagship multimodal model - 128K context, vision capable',
        status: 'loading',
        capabilities: ['text-generation', 'conversation', 'reasoning', 'vision', 'multimodal', 'code-generation'],
        maxTokens: 128000,
        isMultimodal: true
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Fast, cost-effective model - 128K context, excellent for most tasks',
        status: 'loading',
        capabilities: ['text-generation', 'conversation', 'reasoning', 'code-generation'],
        maxTokens: 128000,
        isMultimodal: false
      },
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        description: 'Google\'s lightning-fast multimodal model - real-time streaming',
        status: 'loading',
        capabilities: ['text-generation', 'conversation', 'multimodal', 'vision'],
        maxTokens: 1000000,
        isMultimodal: true
      },
      {
        id: 'llama3.2:3b',
        name: 'Llama 3.2 3B',
        description: 'Fast local model - instant responses',
        status: 'offline',
        capabilities: ['text-generation', 'conversation', 'reasoning'],
        maxTokens: 128000,
        isMultimodal: false
      },
      {
        id: 'llama3.1:8b',
        name: 'Llama 3.1 8B',
        description: 'Powerful local model - instant responses',
        status: 'offline',
        capabilities: ['text-generation', 'conversation', 'coding'],
        maxTokens: 128000,
        isMultimodal: false
      },
      
      // 🤗 Additional Hugging Face Local Models
      {
        id: 'mistral:7b',
        name: 'Mistral 7B',
        description: 'Fast European model - efficient and capable',
        status: 'offline',
        capabilities: ['text-generation', 'conversation', 'multilingual'],
        maxTokens: 32000,
        isMultimodal: false
      },
      {
        id: 'codellama:7b',
        name: 'CodeLlama 7B',
        description: 'Specialized coding assistant - local development',
        status: 'offline',
        capabilities: ['code-generation', 'debugging', 'programming'],
        maxTokens: 100000,
        isMultimodal: false
      },
      {
        id: 'vicuna:7b',
        name: 'Vicuna 7B',
        description: 'Enhanced conversation model - local chat',
        status: 'offline',
        capabilities: ['text-generation', 'conversation', 'instruction-following'],
        maxTokens: 32000,
        isMultimodal: false
      },
      {
        id: 'dolphin-mixtral:8x7b',
        name: 'Dolphin Mixtral 8x7B',
        description: 'Mixture of experts - powerful local reasoning',
        status: 'offline',
        capabilities: ['reasoning', 'text-generation', 'problem-solving'],
        maxTokens: 32000,
        isMultimodal: false
      },
      {
        id: 'wizardlm:7b',
        name: 'WizardLM 7B',
        description: 'Instruction-tuned model - local assistance',
        status: 'offline',
        capabilities: ['instruction-following', 'conversation', 'problem-solving'],
        maxTokens: 32000,
        isMultimodal: false
      },
      
      // 🕵️ Llama 4 Scout (Official Meta CLI) - Available locally
      {
        id: 'llama4-scout',
        name: 'Llama 4 Scout ✅',
        description: 'Advanced 17B parameter reconnaissance model via official Meta Llama CLI - locally available',
        status: 'offline',
        capabilities: ['advanced-reasoning', 'strategic-planning', 'analysis', 'conversation', 'problem-solving', 'local-processing'],
        maxTokens: 16384, // 16K tokens context window
        isMultimodal: false
      }
    ];

    defaultModels.forEach(model => {
      this.models.set(model.id, model);
    });
  }

  async checkModelStatus(modelId: string): Promise<ModelStatus> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    const startTime = Date.now();
    
    try {
      // Check different services based on model type
      if (this.isOpenAIModel(modelId)) {
        // Check OpenAI service (including new 2025 models)
        return await this.checkOpenAIStatus(modelId, startTime);
      } else if (modelId.startsWith('gemini')) {
        // Check Gemini service
        return await this.checkGeminiStatus(modelId, startTime);
      } else {
        // Check Llama CLI service
        return await this.checkLlamaStatus(modelId, startTime);
      }
    } catch (error) {
      const status: ModelStatus = {
        modelId,
        isRunning: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      const model = this.models.get(modelId);
      if (model) {
        model.status = 'offline';
      }
      this.statusCache.set(modelId, status);

      return status;
    }
  }

  /**
   * 🤖 Check if model is an OpenAI model (including 2025 models)
   */
  private isOpenAIModel(modelId: string): boolean {
    return modelId.startsWith('gpt-') || 
           modelId.startsWith('o1-') || 
           modelId.startsWith('o3') ||
           modelId.startsWith('o4-') ||
           modelId === 'o3' ||
           modelId === 'o4-mini';
  }

  private async checkOpenAIStatus(modelId: string, startTime: number): Promise<ModelStatus> {
    try {
      // OpenAI API keys not available in GitHub Pages deployment
      throw new Error('OpenAI service not available in GitHub Pages mode');
    } catch (error) {
      console.error(`❌ OpenAI ${modelId} status check failed:`, error);
      throw error;
    }
  }

  private async checkGeminiStatus(modelId: string, startTime: number): Promise<ModelStatus> {
    try {
      // Gemini API keys not available in GitHub Pages deployment
      throw new Error('Gemini service not available in GitHub Pages mode');
    } catch (error) {
      throw error;
    }
  }

  private async checkLlamaStatus(modelId: string, startTime: number): Promise<ModelStatus> {
    try {
      // Check for locally downloaded Llama CLI models
      if (await this.checkLocalLlamaModel(modelId)) {
        // Check if backend server is running for CLI models
        try {
          const backendResponse = await fetch('http://localhost:3001/api/health');
          const isBackendRunning = backendResponse.ok;
          
          const responseTime = Date.now() - startTime;
          const status: ModelStatus = {
            modelId,
            isRunning: isBackendRunning,
            lastChecked: new Date(),
            responseTime,
            additionalInfo: isBackendRunning ? 'Backend server and CLI model available' : 'CLI model available, backend server offline'
          };

          const model = this.models.get(modelId);
          if (model) {
            model.status = isBackendRunning ? 'online' : 'limited';
          }
          this.statusCache.set(modelId, status);

          console.log(`${isBackendRunning ? '✅' : '🟡'} Llama CLI ${modelId}: ${isBackendRunning ? 'online' : 'limited'} (${responseTime}ms)`);
          return status;
        } catch (backendError) {
          // CLI model exists but backend is not running
          const responseTime = Date.now() - startTime;
          const status: ModelStatus = {
            modelId,
            isRunning: false,
            lastChecked: new Date(),
            responseTime,
            additionalInfo: 'CLI model available, backend server not running'
          };

          const model = this.models.get(modelId);
          if (model) {
            model.status = 'limited';
          }
          this.statusCache.set(modelId, status);

          console.log(`🟡 Llama CLI ${modelId}: limited (${responseTime}ms) - Backend offline`);
          return status;
        }
      }

      // Model not found locally
      throw new Error('Llama CLI model not found');
    } catch (error) {
      console.error(`❌ Llama CLI ${modelId} status check failed:`, error);
      throw error;
    }
  }

  /**
   * Check if a Llama CLI model is locally available
   * Note: This runs client-side so we can't access filesystem directly
   */
  private async checkLocalLlamaModel(modelId: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking for local Llama model: ${modelId}`);
      
      // Check for known downloaded models based on user confirmation
      const knownLocalModels = [
        'llama4-scout' // Llama 4 Scout (17B) - confirmed downloaded via official Meta CLI
      ];
      
      const isAvailable = knownLocalModels.includes(modelId);
      
      if (isAvailable) {
        console.log(`✅ Local Llama model confirmed: ${modelId}`);
      } else {
        console.log(`❌ Local Llama model not found: ${modelId}`);
      }
      
      return isAvailable;
    } catch (error) {
      console.error('Error checking local Llama model:', error);
      return false;
    }
  }

  async checkAllModels(): Promise<ModelStatus[]> {
    const statusPromises = Array.from(this.models.keys()).map(
      modelId => this.checkModelStatus(modelId)
    );
    
    return Promise.all(statusPromises);
  }

  private startStatusMonitoring(): void {
    // Check status every 30 seconds
    this.statusCheckInterval = setInterval(() => {
      this.checkAllModels().catch(console.error);
    }, 30000);

    // Initial check
    this.checkAllModels().catch(console.error);
  }

  stopStatusMonitoring(): void {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
  }

  getModel(modelId: string): AIModel | undefined {
    return this.models.get(modelId);
  }

  getAllModels(): AIModel[] {
    return Array.from(this.models.values());
  }

  getOnlineModels(): AIModel[] {
    return this.getAllModels().filter(model => model.status === 'online');
  }

  getModelStatus(modelId: string): ModelStatus | undefined {
    return this.statusCache.get(modelId);
  }

  async refreshModelStatus(): Promise<void> {
    await this.checkAllModels();
  }

  addModel(model: AIModel): void {
    this.models.set(model.id, model);
  }

  removeModel(modelId: string): void {
    this.models.delete(modelId);
    this.statusCache.delete(modelId);
  }
} 