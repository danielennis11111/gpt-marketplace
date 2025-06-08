/**
 * 🤖 Avatar Mode Service
 * 
 * Detects and manages locally installed avatar models like ditto-talkinghead
 * Provides avatar visualization capabilities when models are available
 */

export interface AvatarModel {
  id: string;
  name: string;
  path: string;
  type: 'talking-head' | 'full-body' | 'face-only';
  status: 'available' | 'loading' | 'error' | 'not-found';
  size?: number;
  features: {
    lipSync: boolean;
    emotionalExpressions: boolean;
    headMovements: boolean;
    eyeTracking: boolean;
  };
}

export interface AvatarConfig {
  enabled: boolean;
  selectedModel: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  size: 'small' | 'medium' | 'large';
  opacity: number;
  autoHide: boolean;
}

export class AvatarModeService {
  private availableModels: Map<string, AvatarModel> = new Map();
  private config: AvatarConfig;
  private isInitialized: boolean = false;
  private callbacks: Set<(enabled: boolean) => void> = new Set();

  // Well-known avatar model paths
  private readonly KNOWN_MODELS = [
    {
      id: 'ditto-talkinghead',
      name: 'Ditto Talking Head',
      path: 'models/ditto-talkinghead',
      type: 'talking-head' as const,
      features: {
        lipSync: true,
        emotionalExpressions: true,
        headMovements: true,
        eyeTracking: false
      }
    },
    {
      id: 'wav2lip',
      name: 'Wav2Lip Avatar',
      path: 'models/wav2lip',
      type: 'face-only' as const,
      features: {
        lipSync: true,
        emotionalExpressions: false,
        headMovements: false,
        eyeTracking: false
      }
    },
    {
      id: 'sadtalker',
      name: 'SadTalker Avatar',
      path: 'models/sadtalker',
      type: 'talking-head' as const,
      features: {
        lipSync: true,
        emotionalExpressions: true,
        headMovements: true,
        eyeTracking: false
      }
    }
  ];

  constructor() {
    this.config = {
      enabled: false,
      selectedModel: '',
      position: 'bottom-right',
      size: 'medium',
      opacity: 0.9,
      autoHide: false
    };

    this.loadConfig();
    this.detectAvailableModels();
  }

  /**
   * Initialize avatar mode service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🤖 Initializing Avatar Mode Service...');
    
    try {
      await this.detectAvailableModels();
      
      // Auto-enable if models are available and user hasn't explicitly disabled
      if (this.availableModels.size > 0 && !this.hasUserDisabledAvatars()) {
        await this.enableAvatarMode();
      }

      this.isInitialized = true;
      console.log(`🤖 Avatar Mode Service ready with ${this.availableModels.size} available models`);
      
    } catch (error) {
      console.warn('⚠️ Avatar Mode Service initialization failed:', error);
    }
  }

  /**
   * Detect locally available avatar models
   */
  private async detectAvailableModels(): Promise<void> {
    console.log('🔍 Scanning for local avatar models...');
    
    for (const modelDef of this.KNOWN_MODELS) {
      try {
        const isAvailable = await this.checkModelAvailability(modelDef.path);
        
        if (isAvailable) {
          const model: AvatarModel = {
            ...modelDef,
            status: 'available',
            size: await this.getModelSize(modelDef.path)
          };
          
          this.availableModels.set(model.id, model);
          console.log(`✅ Found ${model.name} at ${model.path}`);
        } else {
          console.log(`❌ ${modelDef.name} not found at ${modelDef.path}`);
        }
      } catch (error) {
        console.warn(`⚠️ Error checking ${modelDef.name}:`, error);
      }
    }

    // Auto-select first available model
    if (this.availableModels.size > 0 && !this.config.selectedModel) {
      const firstModel = Array.from(this.availableModels.keys())[0];
      this.config.selectedModel = firstModel;
      this.saveConfig();
    }
  }

  /**
   * Check if a model is available at the given path
   */
  private async checkModelAvailability(modelPath: string): Promise<boolean> {
    try {
      // In a browser environment, we'll simulate model detection
      // In a real implementation, this would check the file system
      
      // For now, we'll check if the user has manually indicated they have models
      const hasModels = localStorage.getItem('avatar-models-available');
      if (hasModels === 'true') {
        return true;
      }

      // Try to detect based on common indicators
      // This is a placeholder - real implementation would check actual files
      const checkPaths = [
        `${modelPath}/model.onnx`,
        `${modelPath}/model.pth`,
        `${modelPath}/config.json`,
        `${modelPath}/README.md`
      ];

      // Simulate async check
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // For demo purposes, return false unless explicitly enabled
      return false;

    } catch (error) {
      console.warn(`Error checking model availability at ${modelPath}:`, error);
      return false;
    }
  }

  /**
   * Get model size (placeholder implementation)
   */
  private async getModelSize(modelPath: string): Promise<number> {
    // Placeholder - would calculate actual model size
    return Math.random() * 2000 + 500; // Random size between 500MB - 2.5GB
  }

  /**
   * Enable avatar mode
   */
  async enableAvatarMode(modelId?: string): Promise<boolean> {
    if (this.availableModels.size === 0) {
      console.warn('⚠️ No avatar models available');
      return false;
    }

    const targetModel = modelId || this.config.selectedModel || Array.from(this.availableModels.keys())[0];
    const model = this.availableModels.get(targetModel);

    if (!model) {
      console.warn(`⚠️ Avatar model ${targetModel} not found`);
      return false;
    }

    try {
      console.log(`🤖 Enabling avatar mode with ${model.name}...`);
      
      // Update config
      this.config.enabled = true;
      this.config.selectedModel = targetModel;
      this.saveConfig();

      // Load the model
      await this.loadAvatarModel(model);

      // Notify listeners
      this.notifyListeners(true);

      console.log(`✅ Avatar mode enabled with ${model.name}`);
      return true;

    } catch (error) {
      console.error('❌ Failed to enable avatar mode:', error);
      return false;
    }
  }

  /**
   * Disable avatar mode
   */
  disableAvatarMode(): void {
    console.log('🤖 Disabling avatar mode...');
    
    this.config.enabled = false;
    this.saveConfig();
    
    // Cleanup any loaded models
    this.unloadCurrentModel();
    
    // Notify listeners
    this.notifyListeners(false);
    
    console.log('✅ Avatar mode disabled');
  }

  /**
   * Load an avatar model
   */
  private async loadAvatarModel(model: AvatarModel): Promise<void> {
    console.log(`📦 Loading ${model.name}...`);
    
    // Placeholder for model loading
    // Real implementation would load the actual model files
    model.status = 'loading';
    
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      model.status = 'available';
      console.log(`✅ ${model.name} loaded successfully`);
      
    } catch (error) {
      model.status = 'error';
      throw error;
    }
  }

  /**
   * Unload current model
   */
  private unloadCurrentModel(): void {
    // Cleanup model resources
    console.log('🗑️ Unloading avatar model...');
  }

  /**
   * Get current configuration
   */
  getConfig(): AvatarConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<AvatarConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  /**
   * Get available models
   */
  getAvailableModels(): AvatarModel[] {
    return Array.from(this.availableModels.values());
  }

  /**
   * Check if avatar mode is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled && this.availableModels.size > 0;
  }

  /**
   * Get current model
   */
  getCurrentModel(): AvatarModel | null {
    return this.availableModels.get(this.config.selectedModel) || null;
  }

  /**
   * Manually add a model (for user-installed models)
   */
  addModel(model: Omit<AvatarModel, 'status'>): void {
    const avatarModel: AvatarModel = {
      ...model,
      status: 'available'
    };
    
    this.availableModels.set(model.id, avatarModel);
    console.log(`➕ Added avatar model: ${model.name}`);
    
    // Auto-select if it's the first model
    if (!this.config.selectedModel) {
      this.config.selectedModel = model.id;
      this.saveConfig();
    }
  }

  /**
   * Register callback for avatar mode changes
   */
  onAvatarModeChange(callback: (enabled: boolean) => void): () => void {
    this.callbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(enabled: boolean): void {
    this.callbacks.forEach(callback => {
      try {
        callback(enabled);
      } catch (error) {
        console.warn('Avatar mode callback error:', error);
      }
    });
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('avatar-mode-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save avatar config:', error);
    }
  }

  /**
   * Load configuration from localStorage
   */
  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('avatar-mode-config');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.config = { ...this.config, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load avatar config:', error);
    }
  }

  /**
   * Check if user has explicitly disabled avatars
   */
  private hasUserDisabledAvatars(): boolean {
    return localStorage.getItem('avatar-mode-disabled') === 'true';
  }

  /**
   * Enable avatar models for demo/testing
   */
  enableDemoMode(): void {
    localStorage.setItem('avatar-models-available', 'true');
    console.log('🎭 Avatar demo mode enabled - refresh to detect models');
  }

  /**
   * Disable avatar models
   */
  disableDemoMode(): void {
    localStorage.removeItem('avatar-models-available');
    this.disableAvatarMode();
    console.log('🎭 Avatar demo mode disabled');
  }
}

// Global singleton instance
let avatarModeService: AvatarModeService | null = null;

export const getAvatarModeService = (): AvatarModeService => {
  if (!avatarModeService) {
    avatarModeService = new AvatarModeService();
  }
  return avatarModeService;
};

export default AvatarModeService; 