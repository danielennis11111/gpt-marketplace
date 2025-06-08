import { Conversation, Message, ModelInfo } from '../types';

// Mock conversations for demo purposes
export const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'Help me understand what things typically break my focus, so I can think more clearly',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    tokenCount: 15420,
    compressionEnabled: false,
    messages: [
      {
        id: 'm1',
        content: 'Help me understand what things typically break my focus, so I can think more clearly',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isUser: true
      },
      {
        id: 'm2', 
        content: 'I can help you identify common focus blockers and strategies to maintain mental clarity. Common focus breakers include: digital distractions (notifications, social media), multitasking, lack of clear priorities, decision fatigue, environmental noise, and unresolved emotional stress. Would you like me to walk you through a personalized assessment of your specific focus challenges?',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30000),
        isUser: false
      }
    ]
  },
  {
    id: '2', 
    title: 'Help me understand what things typically break my...',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    tokenCount: 12800,
    compressionEnabled: false,
    messages: [
      {
        id: 'm3',
        content: 'Can you help me organize my thoughts for a presentation?',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isUser: true
      }
    ]
  },
  {
    id: '3',
    title: 'Walk me through using a Zoom recording transcript...',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    tokenCount: 8900,
    compressionEnabled: false,
    messages: []
  },
  {
    id: '4',
    title: 'can you tell me about yourself and what you can do',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    tokenCount: 5600,
    compressionEnabled: false,
    messages: []
  },
  {
    id: '5',
    title: 'can you tell me about what you understand about...',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    tokenCount: 7200,
    compressionEnabled: false,
    messages: []
  },
  {
    id: '6',
    title: 'Help me understand what things typically break my...',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    tokenCount: 11200,
    compressionEnabled: false,
    messages: []
  },
  {
    id: '7',
    title: 'Walk me through using a Zoom recording transcript...',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    tokenCount: 9800,
    compressionEnabled: false,
    messages: []
  },
  {
    id: '8',
    title: 'Help me understand what things typically break my...',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago (May)
    tokenCount: 13400,
    compressionEnabled: false,
    messages: []
  },
  {
    id: '9',
    title: 'Walk me through using a Zoom recording transcript...',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago (May)
    tokenCount: 6700,
    compressionEnabled: false,
    messages: []
  }
];

// Available AI models with different context windows
export const availableModels: ModelInfo[] = [
  // Llama 4 Models (newest and most powerful)
  {
    name: 'llama4-scout',
    maxContextTokens: 10485760, // Official: 10M tokens
    description: 'Official Llama 4 Scout via CLI interface - 10M token context window',
    costPer1kTokens: 0, // Local model
    supportsCompression: true,
    emergencyFallback: 'llama4-maverick'
  },
  {
    name: 'llama4-maverick', 
    maxContextTokens: 1048576, // Official: 1M tokens
    description: 'Official Llama 4 Maverick via Ollama API - 1M token context window',
    costPer1kTokens: 0, // Local model
    supportsCompression: true,
    emergencyFallback: 'Llama3.2-3B-Instruct'
  },
  
  // Llama 3.2 Models
  {
    name: 'Llama3.2-11B-Vision-Instruct',
    maxContextTokens: 128000,
    description: 'Multimodal Llama 3.2 with vision capabilities',
    costPer1kTokens: 0, // Local model
    supportsCompression: true,
    emergencyFallback: 'Llama3.2-3B-Instruct'
  },
  {
    name: 'Llama3.2-3B-Instruct',
    maxContextTokens: 128000,
    description: 'Fast, efficient Llama 3.2 for quick responses',
    costPer1kTokens: 0, // Local model
    supportsCompression: true,
    emergencyFallback: 'Gemini 2.0 Flash'
  },

  // Cloud Models (for comparison/fallback)
  {
    name: 'Gemini 2.0 Flash',
    maxContextTokens: 1000000,
    description: 'Latest multimodal model with 1M token context',
    costPer1kTokens: 0.00075,
    supportsCompression: true,
    emergencyFallback: 'Llama3.2-3B-Instruct'
  },
  {
    name: 'Gemini 1.5 Pro',
    maxContextTokens: 2000000,
    description: 'Advanced reasoning with 2M token context window',
    costPer1kTokens: 0.00125,
    supportsCompression: true,
    emergencyFallback: 'Llama3.2-3B-Instruct'
  },
  {
    name: 'GPT-4 Turbo',
    maxContextTokens: 128000,
    description: 'OpenAI model with 128K context window',
    costPer1kTokens: 0.01,
    supportsCompression: true,
    emergencyFallback: 'Llama3.2-3B-Instruct'
  }
];

// Simulate token counting (in real app, this would come from API)
export const estimateTokenCount = (text: string): number => {
  // Accurate estimation based on real tokenizer performance:
  // - GPT-4/GPT-3.5 (tiktoken): ~1 token per 3.3 characters for English
  // - Gemini (SentencePiece): ~1 token per 3.8 characters for English  
  // - Technical content: typically 10-15% less efficient
  // - Repeated content: can be 20-30% more efficient
  
  const baseRatio = 3.8; // Gemini tokenizer ratio
  let tokenCount = Math.ceil(text.length / baseRatio);
  
  // Adjust for content characteristics
  const lowerText = text.toLowerCase();
  
  // Technical content penalty (less efficient tokenization)
  const technicalTerms = ['neural', 'algorithm', 'transformer', 'attention', 'gradient', 'optimization', 'hyperparameter', 'architecture', 'convolution'];
  const technicalMatches = technicalTerms.reduce((count, term) => {
    return count + (lowerText.split(term).length - 1);
  }, 0);
  
  if (technicalMatches > 0) {
    tokenCount *= 1.15; // 15% penalty for technical content
  }
  
  // Repetition efficiency bonus
  const shortPhrases = text.match(/\b\w{1,6}\b/g) || [];
  const uniquePhrases = new Set(shortPhrases.map(p => p.toLowerCase()));
  const repetitionRatio = shortPhrases.length / uniquePhrases.size;
  
  if (repetitionRatio > 1.5) {
    tokenCount *= 0.85; // 15% efficiency bonus for repetitive content
  }
  
  return Math.max(1, Math.ceil(tokenCount));
};

// Generate mock conversation with high token count to trigger warning
export const generateHighTokenConversation = (): Conversation => {
  const messages: Message[] = [];
  let totalTokens = 0;
  
  // Generate enough messages to approach context limit
  for (let i = 0; i < 50; i++) {
    const userMessage = `This is user message ${i + 1}. I'm asking about something that requires a detailed response to help me understand the concept better.`;
    const assistantMessage = `This is a detailed response from the assistant for message ${i + 1}. I'm providing comprehensive information that includes multiple paragraphs, examples, and explanations to help you understand the topic thoroughly. This response is intentionally long to simulate how context windows fill up during extended conversations.`;
    
    const userTokens = estimateTokenCount(userMessage);
    const assistantTokens = estimateTokenCount(assistantMessage);
    
    totalTokens += userTokens + assistantTokens;
    
    messages.push({
      id: `user-${i}`,
      content: userMessage,
      timestamp: new Date(Date.now() - (50 - i) * 60000), // 1 minute intervals
      isUser: true
    });
    
    messages.push({
      id: `assistant-${i}`,
      content: assistantMessage, 
      timestamp: new Date(Date.now() - (50 - i) * 60000 + 30000), // 30 seconds after user
      isUser: false
    });
  }
  
  return {
    id: 'high-token-conversation',
    title: 'Extended conversation approaching context limit',
    createdAt: new Date(),
    tokenCount: totalTokens,
    compressionEnabled: false,
    messages
  };
};

// Generate massive conversation with PDF content to test compression at 99% capacity
export const generateMassiveTestConversation = (): Conversation => {
  const messages: Message[] = [];
  let totalTokens = 0;
  
  // Simulate a much larger PDF document (2000 pages with technical content)
  const pdfSection = `This comprehensive research paper covers advanced neural network architectures, transformer models, attention mechanisms, optimization algorithms, gradient descent variations, regularization techniques, batch normalization, dropout strategies, learning rate scheduling, hyperparameter tuning, model evaluation metrics, cross-validation methodologies, statistical significance testing, performance benchmarking, computational complexity analysis, memory optimization, distributed training, federated learning, privacy-preserving techniques, differential privacy, adversarial robustness, model interpretability, explainable AI, feature attribution, SHAP values, LIME explanations, causal inference, reinforcement learning, policy gradients, actor-critic methods, Q-learning, deep Q-networks, multi-agent systems, computer vision applications, convolutional neural networks, residual connections, attention mechanisms in vision, object detection, image segmentation, natural language processing, tokenization strategies, word embeddings, contextual representations, BERT variations, GPT models, language modeling, sequence-to-sequence tasks, machine translation, text summarization, question answering, information retrieval, knowledge graphs, semantic search, retrieval-augmented generation. `;
  
  const largePdfContent = pdfSection.repeat(5000); // Much larger content
  
  // Add initial PDF upload message with massive content
  messages.push({
    id: 'pdf-upload',
    content: `I've uploaded a comprehensive 2000-page research paper on "Advanced AI Systems, Deep Learning Architectures, and Enterprise Applications". This document represents the culmination of research from leading AI institutions worldwide. The paper provides an exhaustive analysis covering: ${largePdfContent}The document includes detailed mathematical formulations, experimental protocols, implementation guidelines, performance benchmarks, comparative studies, case studies from industry deployments, ethical considerations, regulatory compliance frameworks, and future research directions spanning the next decade of AI development.`,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isUser: true
  });
  
  totalTokens += estimateTokenCount(messages[0].content);
  
  // Generate much more extensive conversation (500 exchanges instead of 150)
  for (let i = 0; i < 500; i++) {
    const userQuestions = [
      `Can you provide a comprehensive analysis of section ${i + 1} regarding neural network architectures? I need detailed explanations of the mathematical foundations, implementation strategies, performance optimizations, memory management techniques, distributed training approaches, and practical considerations for production deployment. Please include specific examples from the research paper, comparative analysis with baseline methods, statistical significance of results, and implications for real-world applications in healthcare, finance, autonomous systems, and natural language processing.`,
      
      `What are the detailed implications of the methodology described in chapter ${i % 50 + 1}? I'm particularly interested in understanding how this relates to current industry practices, what are the theoretical foundations, what are the practical limitations, how does it compare to state-of-the-art approaches, what are the computational requirements, what are the memory constraints, how does it scale with data size, what are the training time considerations, and what are the specific implementation challenges that teams might encounter when deploying this in production environments?`,
      
      `I need you to provide an exhaustive summary and analysis of the technical details from pages ${i * 5 + 1}-${i * 5 + 5}. Please explain the experimental setup in detail, including data preparation procedures, preprocessing techniques, feature engineering approaches, model architecture decisions, hyperparameter selection strategies, training procedures, validation methodologies, evaluation metrics, statistical testing approaches, results interpretation, error analysis, ablation studies, and provide your expert analysis on the robustness of the conclusions, reproducibility considerations, and potential applications in various domains.`,
      
      `Looking at the comprehensive data analysis presented in figure ${i % 20 + 1} and the surrounding discussion, can you help me understand the statistical significance, effect sizes, confidence intervals, experimental design considerations, potential confounding variables, bias mitigation strategies, and what these results mean for practical applications? Please also discuss the implications for model selection, deployment strategies, monitoring approaches, and how these findings might influence future research directions in this area.`,
      
      `Can you extract, organize, and provide detailed explanations of all the key algorithms mentioned in this section? For each algorithm, please explain the mathematical foundations, computational complexity, implementation details, optimization strategies, parallelization opportunities, memory requirements, convergence properties, stability considerations, and provide comprehensive guidance on how they could be implemented in production environments using modern frameworks like TensorFlow, PyTorch, JAX, and distributed computing platforms like Ray, Horovod, and cloud-based solutions.`
    ];
    
    const aiResponses = [
      `Based on my comprehensive analysis of section ${i + 1}, the research presents groundbreaking findings regarding neural network architectures that represent significant advances in the field. The mathematical foundations rest on several key principles: gradient flow optimization through multi-layer perceptrons, backpropagation algorithms with adaptive learning rates, and regularization techniques that prevent overfitting while maintaining model expressivity. The transformer-based models demonstrated a remarkable 34% increase in accuracy compared to baseline CNN architectures, with particularly impressive performance on sequential data processing tasks. The attention mechanisms exhibit superior capability in capturing long-range dependencies, which is absolutely crucial for your specific use case requirements. The performance benchmarks reveal compelling insights: (1) Training efficiency improved by 42% through optimized attention computation using efficient attention variants like Flash Attention and Linear Attention, (2) Memory usage reduced by 28% via gradient checkpointing and activation recomputation strategies, (3) Inference latency decreased by 35% using advanced model distillation techniques, model pruning, and quantization approaches. When compared to baseline models including ResNet-50, ResNet-101, EfficientNet variants, LSTM networks, and GRU architectures, these new approaches show consistent improvements across multiple evaluation metrics including F1-score, precision, recall, AUC-ROC, computational efficiency, and memory utilization. The paper's methodology for hyperparameter optimization using Bayesian optimization, random search, and grid search techniques contributed significantly to these performance gains. Implementation strategies require careful consideration of distributed training approaches, including data parallelism, model parallelism, and pipeline parallelism for large-scale deployment scenarios.`,
      
      `The methodology presented in chapter ${i % 50 + 1} introduces a revolutionary approach to model training that has profound implications for industry adoption and represents a paradigm shift in how we approach deep learning optimization. The key innovation lies in the sophisticated hybrid training strategy that seamlessly combines supervised learning with reinforcement learning feedback, self-supervised pretraining, and contrastive learning techniques, resulting in dramatically more robust model behavior across diverse deployment scenarios. Current industry practices typically rely on single-objective optimization approaches with limited exploration of multi-modal training strategies, but this groundbreaking research demonstrates the substantial benefits of multi-objective approaches that optimize for multiple criteria simultaneously. The practical implications are far-reaching and include: (1) Reduced dependency on labeled training data by approximately 45%, which significantly decreases data acquisition costs and annotation requirements, (2) Improved model generalization across different domains and data distributions, reducing the need for domain-specific fine-tuning, (3) Enhanced robustness to adversarial inputs and out-of-distribution samples, (4) Better calibration of model confidence scores, making predictions more reliable for high-stakes decision-making scenarios. However, there are important limitations that must be carefully considered during implementation: the increased computational requirements during training (approximately 2.8x longer training times), the complexity of tuning multiple reward functions and objective weights, the need for domain expertise to design appropriate feedback mechanisms, and the challenges in debugging and monitoring multi-objective training processes. The paper also acknowledges significant challenges in scaling this approach to very large datasets exceeding 500M samples due to memory constraints and computational complexity. The theoretical foundations are rooted in multi-task learning theory, meta-learning principles, and optimization theory from convex and non-convex optimization literature.`,
      
      `The technical details from pages ${i * 5 + 1}-${i * 5 + 5} reveal an exceptionally sophisticated experimental setup that has been meticulously designed to validate the proposed algorithms under realistic and challenging conditions that closely mirror real-world deployment scenarios. The methodology employs a rigorous cross-validation framework with stratified sampling to ensure representative test sets that maintain the statistical properties of the original data distribution. Key aspects of the experimental design demonstrate exceptional attention to methodological rigor and include: (1) Comprehensive dataset preparation using both synthetic and real-world data sources from multiple domains including healthcare, finance, autonomous vehicles, and natural language processing, (2) Extensive baseline comparison with 15 state-of-the-art models including recent transformer variants, convolutional architectures, and hybrid approaches, (3) Rigorous statistical significance testing using paired t-tests, Wilcoxon signed-rank tests, permutation tests, and bootstrap confidence interval estimation, (4) Comprehensive ablation studies designed to isolate the contribution of individual components and architectural decisions, (5) Extensive hyperparameter sensitivity analysis to understand model robustness. The results validation process incorporates multiple evaluation metrics and includes confidence intervals for all reported measurements, effect size calculations, and power analysis to ensure statistical adequacy. The experimental setup carefully controls for potential confounding variables such as random initialization effects, training order dependencies, hardware variations across different GPU architectures, and dataset-specific biases. This comprehensive methodological approach significantly strengthens the validity of the conclusions and provides high confidence in the reproducibility of the results across different research groups and implementation environments. The authors also provide detailed computational requirements, including training time analysis, memory usage profiling, and energy consumption measurements.`,
      
      `Figure ${i % 20 + 1} presents exceptionally compelling statistical evidence with remarkably high significance levels (p < 0.0001) across all major comparisons, demonstrating robust and consistent improvements that extend well beyond mere statistical significance to practical significance. The comprehensive data analysis reveals a clear and substantial trend of improvement with the proposed method achieving an impressive 96.3% accuracy compared to 89.1% for the best baseline approach, representing a meaningful 7.2% absolute improvement that translates to significant real-world impact. The effect size calculations (Cohen's d = 1.47) indicate large practical significance that extends well beyond statistical significance, suggesting that these improvements will be noticeable and valuable in real deployment scenarios. For practical applications across various domains, this performance improvement translates to several critical advantages: (1) Approximately 8.2% reduction in false positive rates, which is crucial for high-stakes applications like medical diagnosis, financial fraud detection, and autonomous vehicle safety systems, (2) Significantly improved reliability in edge cases and out-of-distribution scenarios where traditional models often fail catastrophically, (3) Better calibration of confidence scores and uncertainty estimates, making the model more trustworthy for decision-making in critical applications, (4) Enhanced robustness to data distribution shifts and concept drift over time. The confidence intervals (95% CI: [95.1%, 97.5%]) are remarkably narrow, indicating highly consistent performance across different test conditions, random seeds, and evaluation protocols. This level of consistency suggests that the improvements are not due to cherry-picking or methodological artifacts but represent genuine advances that can be reliably reproduced. The statistical analysis also includes comprehensive sensitivity analysis, showing that the improvements remain significant across different evaluation metrics, data subsets, and experimental conditions. This level of improvement represents a meaningful advance that would clearly justify deployment in production systems, especially considering the relatively modest increase in computational overhead (approximately 18% increase in inference time and 23% increase in memory usage).`,
      
      `The algorithms described in this comprehensive section can be systematically categorized into four main types: optimization algorithms, regularization techniques, architectural innovations, and deployment strategies. Each category offers unique contributions to the overall framework and requires specific implementation considerations for successful production deployment. **Optimization Algorithms**: The advanced adaptive learning rate scheduler (Algorithm 4.3) represents a significant improvement over standard approaches and can be seamlessly integrated into existing training pipelines using modern frameworks like PyTorch, TensorFlow, and JAX. Implementation requires: (1) Custom learning rate decay functions with momentum tracking, (2) Gradient statistics monitoring and adaptive clipping, (3) Memory-efficient momentum calculations using exponential moving averages, (4) Dynamic batch size adjustment based on gradient variance. **Regularization Techniques**: The proposed advanced dropout variant (Section 5.2) involves sophisticated techniques including: (1) Modified attention masking during training with learnable dropout probabilities, (2) Scheduled dropout probability adjustment based on training progress, (3) Layer-specific regularization weights that adapt to layer sensitivity, (4) Gradient noise injection for improved generalization. **Architectural Innovations**: The revolutionary hybrid attention mechanism requires careful implementation including: (1) Custom CUDA kernels for efficient computation of sparse attention patterns, (2) Memory-optimized matrix operations using mixed precision arithmetic, (3) Gradient checkpointing for very large models to manage memory constraints, (4) Dynamic computation graphs for variable sequence lengths. **Production Considerations**: Successful deployment requires comprehensive infrastructure including: model serving architecture capable of handling varying loads and latency requirements, distributed inference systems for large models, comprehensive monitoring systems for tracking performance degradation and data drift, automated retraining pipelines, A/B testing frameworks for gradual rollout and performance comparison, robust error handling and fallback mechanisms. The estimated implementation timeline for an experienced ML engineering team is 12-16 weeks, including thorough testing, optimization, and deployment phases.`
    ];
    
    const userMessage = userQuestions[i % userQuestions.length];
    const aiMessage = aiResponses[i % aiResponses.length];
    
    messages.push({
      id: `user-${i}`,
      content: userMessage,
      timestamp: new Date(Date.now() - (499 - i) * 30000), // 30 seconds apart
      isUser: true
    });
    
    messages.push({
      id: `ai-${i}`,
      content: aiMessage,
      timestamp: new Date(Date.now() - (499 - i) * 30000 + 15000), // 15 seconds after user
      isUser: false
    });
    
    totalTokens += estimateTokenCount(userMessage) + estimateTokenCount(aiMessage);
  }
  
  console.log(`Massive conversation generated with ${totalTokens.toLocaleString()} tokens`);
  
  return {
    id: 'massive-test-conversation',
    title: 'AI Research Paper Analysis - Comprehensive Discussion',
    createdAt: new Date(),
    tokenCount: totalTokens, // Use actual calculated tokens
    compressionEnabled: false,
    messages
  };
};

// Add the massive test conversation to the beginning of the array for easy testing
mockConversations.unshift(generateMassiveTestConversation()); 