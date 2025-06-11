/**
 * Enhanced RAG File Processor
 * Supports multiple file formats including vision and audio based on model capabilities
 */

export interface DocumentContext {
  type: string;
  name: string;
  content: string;
  tokenCount: number;
  size: number;
  uploadedAt: Date;
}

export interface ModelCapabilities {
  vision: boolean;
  audio: boolean;
  video: boolean;
  documents: boolean;
  maxFileSize: number; // in MB
  supportedFormats: string[];
}

export interface ProcessedFile extends DocumentContext {
  id: string;
  fileType: 'document' | 'image' | 'audio' | 'video' | 'code' | 'data';
  processingMethod: string;
  base64Data?: string; // For images/audio that need to be sent as base64
  metadata: {
    dimensions?: { width: number; height: number };
    duration?: number; // for audio/video
    language?: string; // for code files
    encoding?: string;
    extractedText?: string; // for images with OCR
  };
}

// Model capabilities configuration
export const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
  'gemini-2.0-flash': {
    vision: true,
    audio: true,
    video: true,
    documents: true,
    maxFileSize: 50,
    supportedFormats: [
      // Documents
      'pdf', 'txt', 'md', 'doc', 'docx', 'rtf', 'odt',
      // Images (vision)
      'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg',
      // Audio
      'mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac',
      // Video
      'mp4', 'avi', 'mov', 'mkv', 'webm',
      // Code
      'js', 'ts', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'kt', 'swift',
      'html', 'css', 'scss', 'jsx', 'tsx', 'vue', 'svelte',
      // Data
      'json', 'xml', 'csv', 'yaml', 'yml', 'toml', 'ini'
    ]
  },
  'gemini-1.5-pro': {
    vision: true,
    audio: false,
    video: true,
    documents: true,
    maxFileSize: 50,
    supportedFormats: [
      'pdf', 'txt', 'md', 'doc', 'docx', 'rtf',
      'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp',
      'mp4', 'avi', 'mov', 'mkv',
      'js', 'ts', 'py', 'java', 'cpp', 'html', 'css', 'json', 'xml', 'csv', 'yaml'
    ]
  },
  'gemini-1.5-flash': {
    vision: true,
    audio: false,
    video: false,
    documents: true,
    maxFileSize: 20,
    supportedFormats: [
      'pdf', 'txt', 'md', 'doc', 'docx',
      'jpg', 'jpeg', 'png', 'gif', 'webp',
      'js', 'ts', 'py', 'java', 'html', 'css', 'json', 'csv'
    ]
  },
  // Ollama models (typically no vision/audio)
  'llama3.1:8b': {
    vision: false,
    audio: false,
    video: false,
    documents: true,
    maxFileSize: 10,
    supportedFormats: ['pdf', 'txt', 'md', 'doc', 'docx', 'json', 'csv', 'xml', 'yaml']
  },
  'llama3.2:latest': {
    vision: false,
    audio: false,
    video: false,
    documents: true,
    maxFileSize: 10,
    supportedFormats: ['pdf', 'txt', 'md', 'doc', 'docx', 'json', 'csv', 'xml', 'yaml']
  },
  // Llama API models
  'llama-3.2-90b-vision-instruct': {
    vision: true,
    audio: false,
    video: false,
    documents: true,
    maxFileSize: 25,
    supportedFormats: [
      'pdf', 'txt', 'md', 'doc', 'docx',
      'jpg', 'jpeg', 'png', 'gif', 'webp',
      'js', 'ts', 'py', 'java', 'html', 'css', 'json', 'csv'
    ]
  }
};

export class EnhancedRAGProcessor {
  private model: string;
  private capabilities: ModelCapabilities;

  constructor(model: string) {
    this.model = model;
    this.capabilities = this.getModelCapabilities(model);
  }

  private getModelCapabilities(model: string): ModelCapabilities {
    // Try exact match first
    if (MODEL_CAPABILITIES[model]) {
      return MODEL_CAPABILITIES[model];
    }

    // Try partial matches for Ollama models
    for (const [key, capabilities] of Object.entries(MODEL_CAPABILITIES)) {
      if (model.includes(key.split(':')[0])) {
        return capabilities;
      }
    }

    // Default fallback
    return MODEL_CAPABILITIES['llama3.1:8b'];
  }

  public getSupportedFormats(): string[] {
    return this.capabilities.supportedFormats;
  }

  public getAcceptString(): string {
    const formatGroups: Record<string, string[]> = {
      documents: ['.pdf', '.txt', '.md', '.doc', '.docx', '.rtf', '.odt'],
      images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'],
      audio: ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'],
      video: ['.mp4', '.avi', '.mov', '.mkv', '.webm'],
      code: ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.kt', '.swift', '.html', '.css', '.scss', '.jsx', '.tsx', '.vue', '.svelte'],
      data: ['.json', '.xml', '.csv', '.yaml', '.yml', '.toml', '.ini']
    };

    const acceptedExtensions: string[] = [];
    
    if (this.capabilities.documents) {
      acceptedExtensions.push(...formatGroups.documents, ...formatGroups.code, ...formatGroups.data);
    }
    if (this.capabilities.vision) {
      acceptedExtensions.push(...formatGroups.images);
    }
    if (this.capabilities.audio) {
      acceptedExtensions.push(...formatGroups.audio);
    }
    if (this.capabilities.video) {
      acceptedExtensions.push(...formatGroups.video);
    }

    return acceptedExtensions.join(',');
  }

  public isFileSupported(file: File): { supported: boolean; reason?: string } {
    const extension = this.getFileExtension(file.name);
    const fileSizeMB = file.size / (1024 * 1024);

    if (!this.capabilities.supportedFormats.includes(extension)) {
      return { 
        supported: false, 
        reason: `${extension.toUpperCase()} files are not supported by ${this.model}` 
      };
    }

    if (fileSizeMB > this.capabilities.maxFileSize) {
      return { 
        supported: false, 
        reason: `File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum (${this.capabilities.maxFileSize}MB) for ${this.model}` 
      };
    }

    return { supported: true };
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  private getFileType(extension: string): ProcessedFile['fileType'] {
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const audioFormats = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'];
    const videoFormats = ['mp4', 'avi', 'mov', 'mkv', 'webm'];
    const codeFormats = ['js', 'ts', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'kt', 'swift', 'html', 'css', 'scss', 'jsx', 'tsx', 'vue', 'svelte'];
    const dataFormats = ['json', 'xml', 'csv', 'yaml', 'yml', 'toml', 'ini'];

    if (imageFormats.includes(extension)) return 'image';
    if (audioFormats.includes(extension)) return 'audio';
    if (videoFormats.includes(extension)) return 'video';
    if (codeFormats.includes(extension)) return 'code';
    if (dataFormats.includes(extension)) return 'data';
    return 'document';
  }

  public async processFile(file: File): Promise<ProcessedFile> {
    const extension = this.getFileExtension(file.name);
    const fileType = this.getFileType(extension);
    
    // Validate file support
    const validation = this.isFileSupported(file);
    if (!validation.supported) {
      throw new Error(validation.reason || 'File not supported');
    }

    const processedFile: ProcessedFile = {
      id: this.generateId(file),
      type: extension,
      name: file.name,
      content: '',
      tokenCount: 0,
      size: file.size,
      uploadedAt: new Date(),
      fileType,
      processingMethod: '',
      metadata: {}
    };

    try {
      switch (fileType) {
        case 'image':
          await this.processImageFile(file, processedFile);
          break;
        case 'audio':
          await this.processAudioFile(file, processedFile);
          break;
        case 'video':
          await this.processVideoFile(file, processedFile);
          break;
        case 'code':
          await this.processCodeFile(file, processedFile);
          break;
        case 'data':
          await this.processDataFile(file, processedFile);
          break;
        default:
          await this.processDocumentFile(file, processedFile);
      }

      // Estimate token count based on content
      processedFile.tokenCount = this.estimateTokenCount(processedFile.content);

      return processedFile;
    } catch (error) {
      console.error(`Error processing ${fileType} file:`, error);
      throw new Error(`Failed to process ${fileType} file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processImageFile(file: File, processedFile: ProcessedFile): Promise<void> {
    // Convert to base64 for vision models
    const base64 = await this.fileToBase64(file);
    processedFile.base64Data = base64;
    processedFile.processingMethod = 'vision_analysis';
    
    // Try to get image dimensions
    try {
      const dimensions = await this.getImageDimensions(file);
      processedFile.metadata.dimensions = dimensions;
    } catch (error) {
      console.warn('Could not get image dimensions:', error);
    }

    // Start with basic file information
    let content = `## Image Analysis: ${file.name}\n\n`;
    content += `**File Details:**\n`;
    content += `- Type: ${file.type}\n`;
    content += `- Size: ${(file.size / 1024).toFixed(1)}KB\n`;
    
    if (processedFile.metadata.dimensions) {
      content += `- Dimensions: ${processedFile.metadata.dimensions.width}x${processedFile.metadata.dimensions.height}\n`;
    }

    // For models with vision capabilities, prepare for image analysis
    if (this.capabilities.vision && this.isGeminiModel()) {
      // Store placeholder content that will be processed when analyzing
      content += `\n**Visual Analysis:**\n[Image ready for AI analysis. Content will be generated when processed by the chat system.]\n`;
      content += `\n**Text Extraction:**\n[OCR analysis will be performed when processed by the chat system.]\n`;
      processedFile.processingMethod = 'gemini_vision_ready';
    } else {
      content += '\n[Note: This model cannot process images. Only file metadata is available.]';
    }

    processedFile.content = content;
  }

  private isGeminiModel(): boolean {
    return this.model.includes('gemini');
  }

  private async processAudioFile(file: File, processedFile: ProcessedFile): Promise<void> {
    if (this.capabilities.audio) {
      const base64 = await this.fileToBase64(file);
      processedFile.base64Data = base64;
      processedFile.processingMethod = 'base64_audio';
    }

    processedFile.content = `[Audio: ${file.name}] - ${file.type} audio file (${(file.size / (1024 * 1024)).toFixed(1)}MB)`;

    if (!this.capabilities.audio) {
      processedFile.content += '\n[Note: This model cannot process audio files. Only file metadata is available.]';
    }
  }

  private async processVideoFile(file: File, processedFile: ProcessedFile): Promise<void> {
    if (this.capabilities.video) {
      const base64 = await this.fileToBase64(file);
      processedFile.base64Data = base64;
      processedFile.processingMethod = 'base64_video';
    }

    processedFile.content = `[Video: ${file.name}] - ${file.type} video file (${(file.size / (1024 * 1024)).toFixed(1)}MB)`;

    if (!this.capabilities.video) {
      processedFile.content += '\n[Note: This model cannot process video files. Only file metadata is available.]';
    }
  }

  private async processCodeFile(file: File, processedFile: ProcessedFile): Promise<void> {
    const text = await this.fileToText(file);
    const extension = this.getFileExtension(file.name);
    
    processedFile.content = `\`\`\`${extension}\n${text}\n\`\`\``;
    processedFile.processingMethod = 'text_extraction';
    processedFile.metadata.language = extension;
    processedFile.metadata.encoding = 'utf-8';
  }

  private async processDataFile(file: File, processedFile: ProcessedFile): Promise<void> {
    const text = await this.fileToText(file);
    const extension = this.getFileExtension(file.name);
    
    // Format structured data nicely
    try {
      if (extension === 'json') {
        const parsed = JSON.parse(text);
        processedFile.content = `JSON Data from ${file.name}:\n\`\`\`json\n${JSON.stringify(parsed, null, 2)}\n\`\`\``;
      } else if (extension === 'csv') {
        processedFile.content = `CSV Data from ${file.name}:\n\`\`\`csv\n${text}\n\`\`\``;
      } else {
        processedFile.content = `${extension.toUpperCase()} Data from ${file.name}:\n\`\`\`${extension}\n${text}\n\`\`\``;
      }
    } catch (error) {
      // Fallback to raw text if parsing fails
      processedFile.content = `Data from ${file.name}:\n\`\`\`\n${text}\n\`\`\``;
    }
    
    processedFile.processingMethod = 'text_extraction';
    processedFile.metadata.encoding = 'utf-8';
  }

  private async processDocumentFile(file: File, processedFile: ProcessedFile): Promise<void> {
    const extension = this.getFileExtension(file.name);
    
    if (extension === 'pdf') {
      // For PDF files, we'd typically use a PDF parsing library
      processedFile.content = `[PDF Document: ${file.name}] - PDF file processing requires additional libraries. File size: ${(file.size / 1024).toFixed(1)}KB`;
      processedFile.processingMethod = 'pdf_placeholder';
    } else {
      // For text-based documents
      const text = await this.fileToText(file);
      processedFile.content = text;
      processedFile.processingMethod = 'text_extraction';
      processedFile.metadata.encoding = 'utf-8';
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix to get just the base64 data
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async fileToText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private estimateTokenCount(content: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(content.length / 4);
  }

  private generateId(file: File): string {
    return `${file.name}-${file.size}-${Date.now()}`;
  }

  public getCapabilitiesString(): string {
    const capabilities = [];
    if (this.capabilities.documents) capabilities.push('Documents');
    if (this.capabilities.vision) capabilities.push('Images');
    if (this.capabilities.audio) capabilities.push('Audio');
    if (this.capabilities.video) capabilities.push('Video');
    
    return `${this.model} supports: ${capabilities.join(', ')} (Max: ${this.capabilities.maxFileSize}MB)`;
  }
} 