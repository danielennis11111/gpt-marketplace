#!/usr/bin/env python3
"""
Generate a large PDF file (~50MB) for testing context optimization
This creates a comprehensive AI research document with multiple sections
"""

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
import os

def generate_large_content():
    """Generate large amounts of realistic AI research content"""
    
    sections = {
        "Introduction to Neural Networks": [
            "Neural networks are computational models inspired by biological neural networks. They consist of interconnected nodes (neurons) organized in layers.",
            "The fundamental building block is the perceptron, which performs a weighted sum of inputs followed by an activation function.",
            "Deep neural networks contain multiple hidden layers, enabling them to learn complex patterns and representations.",
            "Training involves forward propagation to compute outputs and backpropagation to update weights based on error gradients.",
        ],
        
        "Transformer Architectures": [
            "The Transformer architecture revolutionized natural language processing through the attention mechanism.",
            "Self-attention allows models to weigh the importance of different parts of the input sequence.",
            "Multi-head attention enables the model to focus on different representation subspaces simultaneously.",
            "Position encoding is crucial since Transformers lack inherent sequence order understanding.",
            "The encoder-decoder structure facilitates sequence-to-sequence tasks like translation and summarization.",
        ],
        
        "Optimization Algorithms": [
            "Gradient descent is the fundamental optimization algorithm for neural network training.",
            "Stochastic gradient descent (SGD) uses random batches to approximate the true gradient.",
            "Adam optimizer combines momentum and adaptive learning rates for improved convergence.",
            "Learning rate scheduling helps models converge more effectively during training.",
            "Regularization techniques like dropout and weight decay prevent overfitting.",
        ],
        
        "Computer Vision Applications": [
            "Convolutional Neural Networks (CNNs) are specifically designed for image processing tasks.",
            "Feature maps capture spatial hierarchies through convolution and pooling operations.",
            "ResNet introduced skip connections to address the vanishing gradient problem in deep networks.",
            "Object detection combines classification and localization using techniques like YOLO and R-CNN.",
            "Image segmentation provides pixel-level classification for detailed scene understanding.",
        ],
        
        "Natural Language Processing": [
            "Tokenization is the first step in processing text data for NLP models.",
            "Word embeddings like Word2Vec and GloVe capture semantic relationships between words.",
            "Recurrent Neural Networks (RNNs) and LSTMs were early solutions for sequence modeling.",
            "BERT introduced bidirectional context understanding through masked language modeling.",
            "GPT models demonstrate the power of autoregressive language generation.",
        ],
        
        "Reinforcement Learning": [
            "Reinforcement learning trains agents to make decisions through reward optimization.",
            "Q-learning uses a value function to estimate the expected return of state-action pairs.",
            "Policy gradient methods directly optimize the agent's decision-making policy.",
            "Actor-critic algorithms combine value estimation with policy optimization.",
            "Deep Q-Networks (DQN) brought deep learning to reinforcement learning.",
        ],
        
        "Machine Learning Ethics": [
            "Bias in AI systems can perpetuate and amplify societal inequalities.",
            "Fairness metrics help quantify and address discriminatory model behavior.",
            "Explainable AI techniques make model decisions more transparent and interpretable.",
            "Privacy-preserving methods like federated learning protect sensitive data.",
            "Responsible AI development requires consideration of societal impact.",
        ],
        
        "Model Deployment and Scaling": [
            "Model serving infrastructure must handle varying loads and latency requirements.",
            "Containerization with Docker enables consistent deployment across environments.",
            "Kubernetes orchestration manages scaling and resource allocation for ML workloads.",
            "Model monitoring tracks performance degradation and drift in production.",
            "A/B testing frameworks enable safe rollout of new model versions.",
        ]
    }
    
    return sections

def create_detailed_paragraphs(content_list, repetitions=300):
    """Expand content with detailed explanations and examples"""
    expanded = []
    
    for base_content in content_list:
        for i in range(repetitions):
            # Add variations and detailed examples with much more content
            detailed = f"{base_content} "
            detailed += f"This concept is fundamental to understanding modern AI systems and represents a significant breakthrough in computational approaches to machine learning. "
            detailed += f"Research from leading institutions including MIT, Stanford, Carnegie Mellon, UC Berkeley, and Google Research has shown that {base_content.lower()} "
            detailed += f"Implementation details vary significantly across different frameworks including TensorFlow 2.x, PyTorch 2.0, JAX with Flax, Hugging Face Transformers, and specialized libraries like FairSeq and AllenNLP. "
            detailed += f"Performance benchmarks conducted on diverse hardware configurations including NVIDIA A100, H100, V100 GPUs, TPU v4 pods, and AWS Trainium instances indicate substantial improvements when {base_content.lower()} "
            detailed += f"Industry applications span numerous domains including healthcare diagnostics, financial risk assessment, autonomous vehicle perception, robotics control systems, natural language understanding, computer vision, and drug discovery. "
            detailed += f"Future research directions encompass optimization strategies, model interpretability techniques, robustness enhancement methods, privacy-preserving approaches, federated learning architectures, and sustainable AI development practices. "
            detailed += f"Mathematical formulations underlying these concepts involve complex optimization problems, gradient-based learning algorithms, statistical learning theory, information theory principles, and computational complexity analysis. "
            detailed += f"Experimental validation requires comprehensive datasets, rigorous evaluation protocols, statistical significance testing, ablation studies, and reproducibility verification across multiple research groups and computational environments. "
            detailed += f"The implications for practical deployment include considerations for model serving infrastructure, real-time inference requirements, batch processing capabilities, monitoring and observability systems, A/B testing frameworks, and continuous learning pipelines. "
            
            expanded.append(detailed)
    
    return expanded

def generate_massive_research_sections():
    """Generate extensive research content with multiple detailed sections"""
    
    sections = {
        "Deep Learning Fundamentals and Mathematical Foundations": [
            "Neural networks are sophisticated computational models inspired by biological neural networks found in animal brains. They consist of interconnected processing nodes called neurons organized in hierarchical layers that enable complex pattern recognition and decision-making capabilities.",
            "The fundamental building block is the artificial neuron or perceptron, which performs a weighted linear combination of input features followed by a nonlinear activation function such as ReLU, sigmoid, or tanh to introduce necessary nonlinearity for complex function approximation.",
            "Deep neural networks contain multiple hidden layers between input and output layers, enabling them to learn hierarchical representations and complex patterns through the composition of simpler functions across different levels of abstraction.",
            "Training involves forward propagation to compute predictions and backpropagation to update network weights based on error gradients computed through the chain rule of calculus, enabling automatic differentiation and gradient-based optimization.",
            "Gradient descent optimization algorithms including SGD, Adam, AdaGrad, and RMSprop enable efficient parameter updates by following the negative gradient direction to minimize loss functions and improve model performance over training iterations.",
        ],
        
        "Advanced Transformer Architectures and Attention Mechanisms": [
            "The Transformer architecture represents a revolutionary breakthrough in sequence modeling that fundamentally changed natural language processing through the introduction of self-attention mechanisms that enable parallel computation and long-range dependency modeling.",
            "Self-attention mechanisms allow models to dynamically weight the importance of different positions in the input sequence, enabling the capture of complex relationships and dependencies without the sequential processing limitations of recurrent architectures.",
            "Multi-head attention enables the model to simultaneously attend to information from different representation subspaces at different positions, providing richer representations and improved modeling of complex linguistic phenomena.",
            "Position encoding schemes are crucial components since Transformers lack inherent understanding of sequence order, requiring explicit positional information through sinusoidal encodings, learned embeddings, or relative position representations.",
            "The encoder-decoder structure with cross-attention facilitates powerful sequence-to-sequence capabilities for tasks including machine translation, text summarization, question answering, and dialogue generation with state-of-the-art performance.",
        ],
        
        "Optimization Algorithms and Training Methodologies": [
            "Gradient descent serves as the fundamental optimization algorithm for neural network training, iteratively updating parameters in the direction that minimizes the loss function through first-order gradient information.",
            "Stochastic gradient descent introduces randomness by using mini-batches of training examples to approximate the true gradient, enabling efficient training on large datasets while providing regularization benefits through noise injection.",
            "Advanced optimizers like Adam combine momentum-based methods with adaptive learning rates, maintaining exponential moving averages of gradients and their squared values to achieve faster convergence and improved stability across diverse optimization landscapes.",
            "Learning rate scheduling strategies including cosine annealing, step decay, and warm-up phases help models converge more effectively by adjusting the learning rate throughout training to balance exploration and exploitation.",
            "Regularization techniques including dropout, weight decay, batch normalization, and layer normalization prevent overfitting and improve generalization by constraining model complexity and stabilizing training dynamics.",
        ],
        
        "Computer Vision Applications and Convolutional Architectures": [
            "Convolutional Neural Networks represent specialized architectures designed specifically for processing grid-like data such as images, leveraging translation equivariance and local connectivity patterns to efficiently extract hierarchical visual features.",
            "Feature maps generated through convolution operations capture spatial hierarchies and local patterns through learnable filters that detect edges, textures, shapes, and increasingly complex visual concepts across network depth.",
            "Residual Networks introduced skip connections to address the vanishing gradient problem in very deep networks, enabling the training of networks with hundreds of layers while maintaining gradient flow and representational capacity.",
            "Object detection systems combine classification and localization capabilities using architectures like YOLO, R-CNN, and SSD to simultaneously identify and locate multiple objects within images with high accuracy and real-time performance.",
            "Image segmentation provides pixel-level classification for detailed scene understanding, enabling applications in medical imaging, autonomous driving, and augmented reality through precise object boundary delineation.",
        ],
        
        "Natural Language Processing and Language Models": [
            "Tokenization represents the fundamental preprocessing step for text data, converting raw text into discrete tokens that can be processed by neural networks through various strategies including word-level, subword, and character-level approaches.",
            "Word embeddings such as Word2Vec, GloVe, and FastText capture semantic relationships between words in continuous vector spaces, enabling models to understand similarity, analogy, and contextual relationships between linguistic units.",
            "Recurrent Neural Networks and Long Short-Term Memory networks provided early solutions for sequence modeling by maintaining hidden states that capture temporal dependencies, though they suffered from vanishing gradients and sequential processing limitations.",
            "BERT introduced bidirectional context understanding through masked language modeling pretraining, enabling models to understand context from both directions and achieving significant improvements across numerous NLP benchmarks.",
            "Generative Pre-trained Transformers demonstrate the remarkable power of autoregressive language generation, scaling to billions of parameters and exhibiting emergent capabilities in reasoning, few-shot learning, and general language understanding.",
        ],
        
        "Reinforcement Learning and Decision Making": [
            "Reinforcement learning enables agents to learn optimal decision-making policies through interaction with environments, using reward signals to guide learning without requiring explicit supervision or labeled training data.",
            "Q-learning algorithms use action-value functions to estimate the expected cumulative reward of taking specific actions in given states, enabling model-free learning of optimal policies through temporal difference methods.",
            "Policy gradient methods directly optimize the agent's decision-making policy using gradient ascent on expected rewards, providing more direct optimization of the ultimate objective and handling continuous action spaces more naturally.",
            "Actor-critic algorithms combine the benefits of value estimation and policy optimization, using a critic network to estimate state values and an actor network to learn the policy, providing reduced variance and improved sample efficiency.",
            "Deep Q-Networks brought the power of deep learning to reinforcement learning by using neural networks to approximate Q-functions, enabling RL agents to handle high-dimensional state spaces like raw pixel observations.",
        ],
        
        "Machine Learning Ethics and Responsible AI": [
            "Bias in AI systems represents a critical challenge that can perpetuate and amplify existing societal inequalities, requiring careful attention to data collection, model development, and deployment practices to ensure fair and equitable outcomes.",
            "Fairness metrics provide quantitative measures for assessing discriminatory behavior in model predictions, including demographic parity, equalized odds, and individual fairness criteria that help identify and mitigate biased decision-making.",
            "Explainable AI techniques make model decisions more transparent and interpretable through methods like attention visualization, feature attribution, LIME, SHAP, and counterfactual explanations that help users understand model reasoning.",
            "Privacy-preserving methods including federated learning, differential privacy, and secure multi-party computation enable machine learning on sensitive data while protecting individual privacy and maintaining data utility.",
            "Responsible AI development requires consideration of broader societal impacts, including environmental sustainability, job displacement, security vulnerabilities, and the concentration of AI capabilities in large technology companies.",
        ],
        
        "Model Deployment and Production Systems": [
            "Model serving infrastructure must handle varying computational loads, latency requirements, and throughput demands while maintaining reliability, scalability, and cost-effectiveness in production environments.",
            "Containerization technologies like Docker enable consistent deployment across different computing environments by packaging models with their dependencies and runtime requirements in portable, lightweight containers.",
            "Kubernetes orchestration manages the scaling, deployment, and operation of containerized ML workloads, providing automated scaling, load balancing, service discovery, and fault tolerance for production AI systems.",
            "Model monitoring tracks performance degradation, data drift, and concept drift in production systems through comprehensive logging, alerting, and analysis of prediction quality, input distributions, and system performance metrics.",
            "A/B testing frameworks enable safe rollout of new model versions by comparing performance against baseline models on live traffic, providing statistical validation of improvements and minimizing risks during model updates.",
        ]
    }
    
    return sections

def generate_pdf():
    """Generate the large PDF document"""
    filename = "large_ai_research_document.pdf"
    
    # Create document
    doc = SimpleDocTemplate(filename, pagesize=letter,
                          rightMargin=72, leftMargin=72,
                          topMargin=72, bottomMargin=18)
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Create custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        textColor=colors.darkblue
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=12,
        textColor=colors.darkred
    )
    
    # Build content
    content = []
    
    # Title page
    content.append(Paragraph("Comprehensive AI Research Document", title_style))
    content.append(Spacer(1, 20))
    content.append(Paragraph("Advanced Machine Learning and Deep Learning Techniques", styles['Title']))
    content.append(Spacer(1, 20))
    content.append(Paragraph("A detailed exploration of neural networks, transformers, optimization, and applications", styles['Normal']))
    content.append(PageBreak())
    
    # Generate content sections - repeat multiple times to reach 50MB
    sections = generate_massive_research_sections()
    
    # Generate content multiple times to reach target size
    for repeat_cycle in range(20):  # Repeat sections 20 times
        for section_title, section_content in sections.items():
            # Section header with cycle number
            section_with_cycle = f"{section_title} - Volume {repeat_cycle + 1}"
            content.append(Paragraph(section_with_cycle, heading_style))
            content.append(Spacer(1, 12))
            
            # Expanded content with lots of detail
            detailed_paragraphs = create_detailed_paragraphs(section_content, repetitions=200)
            
            for para in detailed_paragraphs:
                content.append(Paragraph(para, styles['Normal']))
                content.append(Spacer(1, 6))
            
            # Add some tables and technical data
            table_data = [
                ['Metric', 'Baseline', 'Improved', 'Enhancement', 'Significance'],
                ['Accuracy', '87.2%', '94.7%', '+7.5%', 'p<0.001'],
                ['F1-Score', '0.832', '0.923', '+0.091', 'p<0.001'],
                ['Precision', '0.845', '0.935', '+0.090', 'p<0.001'],
                ['Recall', '0.819', '0.912', '+0.093', 'p<0.001'],
                ['Training Time', '24.3h', '18.7h', '-23.0%', 'p<0.01'],
                ['Memory Usage', '8.2GB', '6.8GB', '-17.1%', 'p<0.01'],
                ['Inference Speed', '45ms', '32ms', '-28.9%', 'p<0.001'],
                ['Energy Consumption', '120W', '95W', '-20.8%', 'p<0.05'],
            ]
            
            table = Table(table_data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            content.append(table)
            content.append(Spacer(1, 15))
            
            # Add detailed experimental results
            experimental_text = f"""
            Comprehensive experimental validation was conducted across {repeat_cycle + 5} different datasets 
            with rigorous cross-validation protocols. The results demonstrate consistent improvements across 
            all evaluation metrics with high statistical significance. Implementation details include 
            optimization strategies, distributed training approaches, and production deployment considerations. 
            The methodology encompasses data preprocessing, feature engineering, model architecture design, 
            hyperparameter optimization, and performance evaluation using industry-standard benchmarks.
            
            Advanced techniques employed include gradient clipping, learning rate scheduling, batch normalization, 
            dropout regularization, weight decay, early stopping, and ensemble methods. The computational 
            infrastructure utilized high-performance GPU clusters with efficient data loading pipelines 
            and distributed training frameworks for scalable machine learning workflows.
            
            Statistical analysis reveals significant improvements (p < 0.001) across all major evaluation 
            metrics with large effect sizes (Cohen's d > 1.2) indicating practical significance for 
            real-world deployment scenarios. Confidence intervals are narrow, demonstrating consistent 
            performance across different experimental conditions and random seeds.
            """.replace('\n            ', ' ').strip()
            
            content.append(Paragraph(experimental_text, styles['Normal']))
            content.append(Spacer(1, 10))
            content.append(PageBreak())
    
    # Build PDF
    doc.build(content)
    
    # Check file size
    file_size = os.path.getsize(filename)
    print(f"Generated PDF: {filename}")
    print(f"File size: {file_size / (1024*1024):.2f} MB")
    
    return filename

if __name__ == "__main__":
    # Install required package if not present
    try:
        from reportlab.lib.pagesizes import letter
    except ImportError:
        print("Installing reportlab...")
        os.system("pip install reportlab")
        from reportlab.lib.pagesizes import letter
    
    filename = generate_pdf()
    print(f"Large PDF generated successfully: {filename}") 