import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  VolumeX, 
  Volume2, 
  Send, 
  Upload, 
  BookOpen, 
  Code, 
  Lightbulb,
  Eye,
  Briefcase,
  Brain,
  Shield,
  Search,
  Zap,
  Users
} from 'lucide-react';

interface ConversationTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  systemPrompt: string;
  model: string;
  color: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  templateId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const conversationTemplates: ConversationTemplate[] = [
  {
    id: 'general',
    name: 'General Assistant',
    description: 'Your starting point for AI exploration',
    icon: <MessageCircle className="w-5 h-5" />,
    systemPrompt: 'You are a helpful AI assistant ready to help with any questions or tasks.',
    model: 'llama3.2:3b',
    color: 'bg-blue-500'
  },
  {
    id: 'creative',
    name: 'Creative Writing Lab',
    description: 'Advanced storytelling and content generation',
    icon: <Lightbulb className="w-5 h-5" />,
    systemPrompt: 'You are a creative writing assistant specialized in storytelling, poetry, and creative content.',
    model: 'llama3.1:8b',
    color: 'bg-purple-500'
  },
  {
    id: 'programming',
    name: 'Programming Mentor',
    description: 'Learn coding with expert AI guidance',
    icon: <Code className="w-5 h-5" />,
    systemPrompt: 'You are a programming mentor helping users learn to code and solve technical problems.',
    model: 'llama3.1:8b',
    color: 'bg-green-500'
  },
  {
    id: 'study',
    name: 'Study Companion',
    description: 'Adaptive learning partner for academic success',
    icon: <BookOpen className="w-5 h-5" />,
    systemPrompt: 'You are a study companion helping students learn and understand academic concepts.',
    model: 'llama3.2:3b',
    color: 'bg-orange-500'
  },
  {
    id: 'visual',
    name: 'Visual Analysis Lab',
    description: 'Explore image and document processing',
    icon: <Eye className="w-5 h-5" />,
    systemPrompt: 'You are a visual analysis expert helping with image and document analysis.',
    model: 'llama3.1:8b',
    color: 'bg-indigo-500'
  },
  {
    id: 'productivity',
    name: 'Productivity Lab',
    description: 'Optimize workflows and develop productive habits',
    icon: <Briefcase className="w-5 h-5" />,
    systemPrompt: 'You are a productivity consultant helping optimize workflows and habits.',
    model: 'llama3.2:3b',
    color: 'bg-teal-500'
  },
  {
    id: 'context',
    name: 'Long Context Explorer',
    description: 'Analyze massive documents and research',
    icon: <Search className="w-5 h-5" />,
    systemPrompt: 'You are specialized in analyzing large documents and maintaining context across long conversations.',
    model: 'llama3.1:8b',
    color: 'bg-cyan-500'
  },
  {
    id: 'advanced',
    name: 'Advanced AI Lab',
    description: 'Experience cutting-edge AI capabilities',
    icon: <Brain className="w-5 h-5" />,
    systemPrompt: 'You are an advanced AI assistant with cutting-edge capabilities.',
    model: 'llama3.1:8b',
    color: 'bg-red-500'
  },
  {
    id: 'safety',
    name: 'AI Safety Workshop',
    description: 'Learn responsible AI use and ethics',
    icon: <Shield className="w-5 h-5" />,
    systemPrompt: 'You are an AI ethics and safety expert teaching responsible AI use.',
    model: 'llama3.2:3b',
    color: 'bg-yellow-500'
  },
  {
    id: 'research',
    name: 'Research Lab',
    description: 'Advanced methodology and data analysis',
    icon: <Zap className="w-5 h-5" />,
    systemPrompt: 'You are a research assistant specialized in methodology and data analysis.',
    model: 'llama3.1:8b',
    color: 'bg-pink-500'
  },
  {
    id: 'visual-intelligence',
    name: 'Visual Intelligence Center',
    description: 'Professional visual analysis',
    icon: <Users className="w-5 h-5" />,
    systemPrompt: 'You are a professional visual intelligence analyst.',
    model: 'llama3.1:8b',
    color: 'bg-violet-500'
  }
];

export const RateLimiterWrapper: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ConversationTemplate | null>(null);
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState<Date | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rate limiting (15 requests per minute)
  const RATE_LIMIT = 15;
  const RATE_WINDOW = 60000; // 1 minute in ms

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  const checkRateLimit = (): boolean => {
    const now = new Date();
    if (!lastRequestTime || now.getTime() - lastRequestTime.getTime() > RATE_WINDOW) {
      setRequestCount(1);
      setLastRequestTime(now);
      return true;
    }
    
    if (requestCount < RATE_LIMIT) {
      setRequestCount(prev => prev + 1);
      return true;
    }
    
    return false;
  };

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const speakText = (text: string) => {
    if (synthesisRef.current && !isSpeaking) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      synthesisRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthesisRef.current && isSpeaking) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const createNewConversation = (template: ConversationTemplate) => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      templateId: template.id,
      title: `New ${template.name} Session`,
      messages: [],
      createdAt: new Date()
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
    setSelectedTemplate(template);
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentConversation || !selectedTemplate || !checkRateLimit()) {
      if (!checkRateLimit()) {
        alert('Rate limit exceeded. Please wait before sending another message.');
      }
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage]
    };

    setCurrentConversation(updatedConversation);
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversation.id ? updatedConversation : conv
    ));
    
    setMessage('');
    setIsLoading(true);

    try {
      // Simulate AI response (replace with actual Ollama API call)
      const response = await simulateAIResponse(message, selectedTemplate);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage]
      };

      setCurrentConversation(finalConversation);
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversation.id ? finalConversation : conv
      ));

      // Auto-speak response
      speakText(response);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAIResponse = async (userMessage: string, template: ConversationTemplate): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Generate contextual response based on template
    const responses = {
      general: `I understand you're asking about "${userMessage}". As your general AI assistant, I'm here to help with any questions or tasks you might have.`,
      creative: `What an interesting creative prompt about "${userMessage}"! Let me help you explore this creatively...`,
      programming: `Great coding question about "${userMessage}"! Let me break this down technically...`,
      study: `Excellent study topic regarding "${userMessage}". Let's approach this systematically for better understanding...`,
      visual: `I see you're interested in visual analysis of "${userMessage}". Let me help you examine this visually...`,
      productivity: `For productivity optimization around "${userMessage}", I recommend these strategies...`,
      context: `Analyzing the long-form context of "${userMessage}" across multiple dimensions...`,
      advanced: `Using advanced AI capabilities to address "${userMessage}" with cutting-edge techniques...`,
      safety: `From an AI safety and ethics perspective regarding "${userMessage}", it's important to consider...`,
      research: `From a research methodology standpoint on "${userMessage}", let's examine the data...`,
      'visual-intelligence': `Professional visual intelligence analysis of "${userMessage}" reveals...`
    };

    return responses[template.id as keyof typeof responses] || responses.general;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const getRemainingRequests = (): number => {
    if (!lastRequestTime) return RATE_LIMIT;
    const now = new Date();
    if (now.getTime() - lastRequestTime.getTime() > RATE_WINDOW) {
      return RATE_LIMIT;
    }
    return Math.max(0, RATE_LIMIT - requestCount);
  };

  const getTimeUntilReset = (): string => {
    if (!lastRequestTime) return '';
    const now = new Date();
    const timeSinceLastRequest = now.getTime() - lastRequestTime.getTime();
    const timeUntilReset = RATE_WINDOW - timeSinceLastRequest;
    
    if (timeUntilReset <= 0) return '';
    
    const minutes = Math.floor(timeUntilReset / 60000);
    const seconds = Math.floor((timeUntilReset % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Beta Land @ ASU 🚀
          </h1>
          <p className="text-xl text-gray-300 mb-4">AI Adventure Playground - Explore cutting-edge AI capabilities</p>
          
          {/* Rate Limit Status */}
          <div className="flex justify-center items-center gap-4 text-sm">
            <Badge variant={getRemainingRequests() > 5 ? "default" : "destructive"}>
              {getRemainingRequests()}/{RATE_LIMIT} requests remaining
            </Badge>
            {getTimeUntilReset() && (
              <Badge variant="outline">
                Reset in: {getTimeUntilReset()}
              </Badge>
            )}
          </div>
        </div>

        {/* Template Selection */}
        {!selectedTemplate && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {conversationTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 transition-all cursor-pointer transform hover:scale-105"
                onClick={() => createNewConversation(template)}
              >
                <CardHeader className="pb-3">
                  <div className={`w-10 h-10 rounded-lg ${template.color} flex items-center justify-center mb-2`}>
                    {template.icon}
                  </div>
                  <CardTitle className="text-lg text-white">{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm">{template.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Conversation Interface */}
        {selectedTemplate && currentConversation && (
          <div className="max-w-4xl mx-auto">
            {/* Conversation Header */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${selectedTemplate.color} flex items-center justify-center`}>
                  {selectedTemplate.icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{selectedTemplate.name}</h2>
                  <p className="text-gray-400 text-sm">{selectedTemplate.description}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTemplate(null);
                  setCurrentConversation(null);
                }}
              >
                New Adventure
              </Button>
            </div>

            {/* Messages */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-4 min-h-[400px] max-h-[500px] overflow-y-auto">
              {currentConversation.messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-20">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Start your AI adventure by sending a message!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-100'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-700 text-gray-100 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* File Upload Area */}
            {uploadedFiles.length > 0 && (
              <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
                <h4 className="text-sm font-medium mb-2">Uploaded Files:</h4>
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file, index) => (
                    <Badge key={index} variant="secondary">
                      {file.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message or use voice input..."
                    className="bg-gray-700 border-gray-600 text-white resize-none"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {/* Voice Controls */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={!recognitionRef.current}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant={isSpeaking ? "destructive" : "outline"}
                      onClick={isSpeaking ? stopSpeaking : () => {}}
                      disabled={!synthesisRef.current}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  {/* File Upload */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  
                  {/* Send Button */}
                  <Button
                    onClick={sendMessage}
                    disabled={!message.trim() || isLoading || getRemainingRequests() === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Conversation History Sidebar */}
        {conversations.length > 0 && (
          <div className="fixed right-4 top-4 w-64 bg-gray-800/90 rounded-lg p-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <h3 className="font-semibold mb-3">Recent Conversations</h3>
            <div className="space-y-2">
              {conversations.slice(0, 10).map((conv) => {
                const template = conversationTemplates.find(t => t.id === conv.templateId);
                return (
                  <div
                    key={conv.id}
                    className={`p-2 rounded cursor-pointer text-sm ${
                      currentConversation?.id === conv.id 
                        ? 'bg-blue-600' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => {
                      setCurrentConversation(conv);
                      setSelectedTemplate(template || conversationTemplates[0]);
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {template && (
                        <div className={`w-4 h-4 rounded ${template.color} flex items-center justify-center`}>
                          {React.cloneElement(template.icon as React.ReactElement, { className: 'w-2 h-2' })}
                        </div>
                      )}
                      <span className="font-medium truncate">{conv.title}</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {conv.messages.length} messages • {conv.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 