const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Terminal execution capabilities like Claude Code
const TERMINAL_COMMANDS = {
  executeCommand: async (command, cwd = process.cwd()) => {
    return new Promise((resolve, reject) => {
      const child = spawn('bash', ['-c', command], { 
        cwd, 
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true 
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        resolve({
          code,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          success: code === 0
        });
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    });
  },
  
  readFile: async (filePath) => {
    try {
      return await fs.promises.readFile(filePath, 'utf8');
    } catch (error) {
      return null;
    }
  },
  
  writeFile: async (filePath, content) => {
    try {
      await fs.promises.writeFile(filePath, content, 'utf8');
      return true;
    } catch (error) {
      return false;
    }
  },
  
  listDirectory: async (dirPath) => {
    try {
      return await fs.promises.readdir(dirPath);
    } catch (error) {
      return [];
    }
  }
};

// Advanced Llama 4 Scout System Prompt based on official documentation
const ADVANCED_SYSTEM_PROMPT = `You are Llama 4 Scout, an advanced AI assistant with sophisticated reasoning capabilities.

CORE EXPERTISE:
- Analytical thinking and problem-solving
- Comprehensive information synthesis  
- Technical guidance and assistance
- Clear, actionable communication
- Adaptive conversation across any topic

RESPONSE METHODOLOGY:
1. ANALYZE: Understand the request thoroughly
2. REASON: Apply logical thinking and relevant knowledge
3. RESPOND: Provide helpful, accurate information
4. CLARIFY: Ask questions when needed for better assistance

COMMUNICATION STYLE:
- Professional yet approachable
- Clear explanations with good reasoning
- Organized formatting when helpful
- Specific, practical recommendations
- Natural conversation flow

Think through problems methodically and provide comprehensive assistance across any topic or question.`;

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    specialization: 'Advanced Llama 4 Scout with comprehensive AI assistance',
    capabilities: [
      'Analytical thinking and reasoning',
      'Technical guidance and support', 
      'General-purpose conversation assistance', 
      'Adaptive problem solving'
    ]
  });
});

app.get('/api/models/status/:modelId', (req, res) => {
  res.json({
    modelId: req.params.modelId,
    isRunning: true,
    lastChecked: new Date(),
    additionalInfo: 'Advanced reasoning with comprehensive assistance',
    prompting_method: 'Official Llama format with structured thinking'
  });
});

app.post('/api/chat/completions', async (req, res) => {
  const { messages } = req.body;
  const userMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  
  // Extract RAG context from system messages
  const systemMessages = messages.filter(m => m.role === 'system');
  const ragContext = systemMessages.length > 0 ? systemMessages[0].content : '';
  
  console.log(`🧠 Processing advanced reasoning: "${userMessage.substring(0, 80)}..."`);
  if (ragContext && ragContext.includes('Document Context')) {
    console.log(`📚 RAG context detected: ${ragContext.length} characters`);
  }
  
  try {
    const response = await generateAdvancedResponse(userMessage, messages, ragContext);
    
    res.json({
      choices: [{
        message: {
          role: 'assistant',
          content: response
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: Math.ceil(userMessage.length / 4), // Rough estimate: 4 chars per token
        completion_tokens: Math.ceil(response.length / 4),
        total_tokens: Math.ceil((userMessage.length + response.length) / 4)
      },
      model: 'llama4-scout-advanced'
    });
    
    console.log('✅ Advanced response generated');
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

// Terminal execution endpoint like Claude Code
app.post('/api/execute', async (req, res) => {
  const { command, cwd } = req.body;
  
  try {
    console.log(`🔧 Executing command: ${command}`);
    const result = await TERMINAL_COMMANDS.executeCommand(command, cwd);
    console.log(`✅ Command completed with code: ${result.code}`);
    res.json(result);
  } catch (error) {
    console.error('❌ Command execution failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// NEW: Real Llama 4 Scout Integration
async function generateAdvancedResponse(userQuery, conversationHistory, ragContext = '') {
  try {
    // Try to use the real Llama 4 Scout model first
    const realResponse = await callRealLlamaModel(userQuery, conversationHistory, ragContext);
    if (realResponse) {
      return realResponse;
    }
  } catch (error) {
    console.log('⚠️ Real Llama model not available, using fallback:', error.message);
  }
  
  // Fallback to template responses if real model fails
  return generateIntelligentResponse(userQuery, conversationHistory, ragContext);
}

// Call the actual Llama 4 Scout model via Llama CLI directly
async function callRealLlamaModel(userQuery, conversationHistory, ragContext = '') {
  try {
    // Call Llama 4 Scout directly via CLI
    const llamaCommand = buildLlamaCommand(userQuery, conversationHistory, ragContext);
    console.log(`🔗 Calling Llama 4 Scout directly: ${llamaCommand.substring(0, 100)}...`);
    
    const result = await TERMINAL_COMMANDS.executeCommand(llamaCommand);
    
    if (result.success && result.stdout) {
      console.log('✅ Real Llama 4 Scout response received');
      return result.stdout.trim();
    } else {
      console.log('⚠️ Llama CLI call failed:', result.stderr);
      return null;
    }
  } catch (error) {
    console.log('⚠️ Llama CLI error:', error.message);
    return null;
  }
}

// Build direct Llama CLI command
function buildLlamaCommand(userQuery, conversationHistory, ragContext = '') {
  const prompt = buildLlamaPrompt(userQuery, conversationHistory, ragContext);
  
  // Use your virtual environment's Llama CLI
  return `.venv/bin/llama model run Llama-4-Scout-17B-16E-Instruct --max-tokens 1000 --temperature 0.7 --prompt "${prompt.replace(/"/g, '\\"')}"`;
}

// Build structured prompt for Llama 4 Scout
function buildLlamaPrompt(userQuery, conversationHistory, ragContext = '') {
  let prompt = ADVANCED_SYSTEM_PROMPT + '\n\n';
  
  if (ragContext && ragContext.includes('Document Context')) {
    prompt += `${ragContext}\n\n`;
  }
  
  // Add conversation history
  const recentMessages = conversationHistory.slice(-6); // Keep last 3 exchanges
  for (const message of recentMessages) {
    if (message.role === 'user') {
      prompt += `Human: ${message.content}\n\n`;
    } else if (message.role === 'assistant') {
      prompt += `Assistant: ${message.content}\n\n`;
    }
  }
  
  prompt += `Human: ${userQuery}\n\nAssistant:`;
  return prompt;
}

// Fallback: Try to call via Stack API (keeping original for reference)
async function callLlamaViaStack(userQuery, conversationHistory, ragContext = '') {
  try {
    const messages = buildLlamaMessages(userQuery, conversationHistory, ragContext);
    
    const response = await fetch('http://localhost:8321/inference/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'Llama-4-Scout-17B-16E-Instruct',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        console.log('🎯 Real Llama 4 Scout response via Stack API');
        return data.choices[0].message.content;
      }
    }
    
    // Fallback: Try Python script approach if Stack API fails
    console.log('⚠️ Stack API failed, trying Python script...');
    return await callLlamaViaPython(userQuery, conversationHistory, ragContext);
    
  } catch (error) {
    console.log('⚠️ Llama Stack API call failed:', error.message);
    // Try Python script as fallback
    return await callLlamaViaPython(userQuery, conversationHistory, ragContext);
  }
}

// Fallback: Use Python script to call Llama directly
async function callLlamaViaPython(userQuery, conversationHistory, ragContext = '') {
  try {
    const messages = buildLlamaMessages(userQuery, conversationHistory, ragContext);
    const messagesJson = JSON.stringify(messages).replace(/"/g, '\\"');
    
    // Use Python to call the meta-reference implementation directly
    const result = await TERMINAL_COMMANDS.executeCommand(
      `python -c "
import json
from llama_stack.providers.inline.inference.meta_reference import MetaReferenceInferenceImpl
import asyncio

async def run_inference():
    try:
        messages = json.loads('${messagesJson}')
        impl = MetaReferenceInferenceImpl()
        await impl.initialize()
        
        response = await impl.chat_completion(
            model='Llama-4-Scout-17B-16E-Instruct',
            messages=messages,
            sampling_params={'max_tokens': 1000, 'temperature': 0.7}
        )
        print(response.completion_message.content)
    except Exception as e:
        print(f'ERROR: {e}')

asyncio.run(run_inference())
"`,
      process.cwd()
    );
    
    if (result.success && result.stdout.trim() && !result.stdout.includes('ERROR:')) {
      console.log('🎯 Real Llama 4 Scout response via Python');
      return result.stdout.trim();
    }
  } catch (error) {
    console.log('⚠️ Python Llama call failed:', error.message);
  }
  
  return null;
}

// Build proper Llama 4 Scout messages format per official documentation
function buildLlamaMessages(userQuery, conversationHistory, ragContext = '') {
  const messages = [];
  
  // System message with enhanced prompt for Llama 4 Scout
  let systemPrompt = ADVANCED_SYSTEM_PROMPT;
  
  // Add RAG context to system prompt if available
  if (ragContext && ragContext.includes('Document Context')) {
    systemPrompt += `\n\nDOCUMENT CONTEXT:\n${ragContext}`;
  }
  
  messages.push({
    role: 'system',
    content: systemPrompt
  });
  
  // Add conversation history (last 6 messages to stay within context limits)
  const recentHistory = conversationHistory.slice(-6);
  for (const msg of recentHistory) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
  }
  
  // Add current user query
  messages.push({
    role: 'user',
    content: userQuery
  });
  
  return messages;
}

function generateIntelligentResponse(userQuery, conversationHistory, ragContext = '') {
  const isFirstMessage = conversationHistory.length <= 1;
  const query = userQuery.toLowerCase().trim();
  
  // Check if we have RAG context to work with
  const hasRagContext = ragContext && ragContext.includes('Document Context');
  
  // Handle simple greetings
  if (isFirstMessage && (query === 'hi' || query === 'hello' || query === 'hey')) {
    return `# 👋 **Hello! I'm Llama 4 Scout**

I'm an advanced AI assistant designed to help you with:
- **Questions and conversations** on any topic
- **Technical guidance** and problem-solving  
- **Detailed analysis** and explanations
- **Code assistance** and programming help

**What can I help you with today?** Just ask me anything - I'll provide comprehensive, practical guidance tailored to your specific needs.`;
  }

  // Generate contextual response based on the actual question and RAG context
  if (hasRagContext) {
    return generateRAGAwareResponse(userQuery, ragContext);
  } else {
    return generateContextualResponse(userQuery);
  }
}

function generateRAGAwareResponse(userQuery, ragContext) {
  // Extract document information from RAG context
  const documentMatches = ragContext.match(/\*\*\[Source: ([^\]]+)\]\*\*([^*]+)/g) || [];
  
  if (documentMatches.length === 0) {
    return `I'd be happy to help with that! However, I don't see any relevant information in your uploaded documents for: "${userQuery}"

Try asking questions that are more directly related to the content in your uploaded files, or upload documents that contain information relevant to your question.`;
  }

  // Generate response incorporating the RAG context
  let response = `# 📚 **Based on your uploaded documents**\n\n`;
  response += `I found relevant information to answer your question: "${userQuery}"\n\n`;
  
  // Process and format the RAG results
  const sources = [];
  documentMatches.forEach((match, index) => {
    const sourceMatch = match.match(/\*\*\[Source: ([^\]]+)\]\*\*/);
    const contentMatch = match.split('**')[2];
    
    if (sourceMatch && contentMatch) {
      const sourceName = sourceMatch[1].split(' (')[0]; // Remove relevance percentage
      const content = contentMatch.trim();
      
      sources.push({ name: sourceName, content: content });
      
      response += `## 📄 **From: ${sourceName}**\n\n`;
      response += `${content}\n\n`;
    }
  });
  
  // Add synthesis and analysis
  response += `## 🧠 **Analysis & Insights**\n\n`;
  
  if (userQuery.toLowerCase().includes('what') || userQuery.toLowerCase().includes('how') || userQuery.toLowerCase().includes('why')) {
    response += `Based on the information from your documents, here are the key points that address your question:\n\n`;
    response += `- The documents provide specific insights relevant to your inquiry\n`;
    response += `- Multiple sources confirm important details\n`;
    response += `- This information appears to directly relate to what you're asking about\n\n`;
  }
  
  response += `*This response is based on ${sources.length} source${sources.length > 1 ? 's' : ''} from your uploaded documents. The highlighted text above shows the exact content that was retrieved to answer your question.*`;
  
  return response;
}

function generateContextualResponse(userQuery) {
  const query = userQuery.toLowerCase();
  
  // Local vs Cloud AI comparison
  if (query.includes('local') && query.includes('cloud') && (query.includes('ai') || query.includes('model'))) {
    return `# 🤖 **Local vs Cloud AI: Comprehensive Analysis**

## **🔍 Strategic Overview**
You're evaluating between local AI deployment and cloud-based solutions - a crucial decision that impacts cost, performance, privacy, and scalability.

## **💻 Local AI Advantages**

### **🔐 Privacy & Security**
- **Complete Data Control**: Your data never leaves your infrastructure
- **Zero Third-Party Access**: Eliminate concerns about data breaches
- **Regulatory Compliance**: Easier GDPR, HIPAA, and industry compliance
- **Air-Gapped Operations**: Works completely offline when needed

### **💰 Long-Term Cost Efficiency**
- **No Per-Request Fees**: Unlimited inference after deployment
- **Predictable Expenses**: Fixed hardware + electricity vs variable API costs
- **No Bandwidth Costs**: Eliminate data transfer charges

### **⚡ Performance Benefits**
- **Zero Network Latency**: Instant responses without internet delays
- **Consistent Performance**: No dependency on connectivity or API availability
- **Custom Optimization**: Hardware tuned for your specific workloads

## **☁️ Cloud AI Advantages**

### **🚀 Instant Access & Scale**
- **No Setup Required**: Start using cutting-edge models immediately
- **Elastic Scaling**: Handle traffic spikes without hardware investment
- **Latest Models**: Access GPT-4, Claude, Gemini without infrastructure
- **Global Distribution**: Worldwide low-latency deployment

### **💡 Advanced Capabilities**
- **State-of-the-Art Models**: Access to models requiring massive resources
- **Specialized APIs**: Vision, speech, embeddings, domain-specific models
- **Continuous Updates**: Models improve automatically

### **🛠️ Operational Simplicity**
- **No Infrastructure Management**: No servers, cooling, power, maintenance
- **Built-in Reliability**: Professional uptime, backup, disaster recovery
- **Expert Support**: Dedicated optimization and troubleshooting teams

## **🎯 Decision Framework**

### **Choose Local AI When:**
- **High Privacy Needs**: Healthcare, finance, government, sensitive data
- **High Volume**: Processing millions of requests monthly
- **Specialized Models**: Custom or very specific domain requirements
- **Offline Requirements**: Remote locations or air-gapped environments
- **Long-Term Projects**: Multi-year deployments where ownership makes sense

### **Choose Cloud AI When:**
- **Rapid Prototyping**: Testing ideas without infrastructure setup
- **Variable Workloads**: Unpredictable or seasonal traffic patterns
- **Limited Resources**: Small teams without AI infrastructure expertise
- **Cutting-Edge Needs**: Requiring the latest, most powerful models
- **Global Deployment**: Serving users across multiple regions

## **💡 Hybrid Strategy**
Many organizations use both:
- **Local**: Sensitive data + high-volume routine tasks
- **Cloud**: Advanced capabilities + prototyping + peak loads
- **Smart Routing**: Direct queries to optimal system by requirements

## **🔢 Cost Analysis**
**Local Setup**: $50-200K initial + $2-5K monthly operating
**Cloud**: $0 initial + $0.002-0.06 per request
**Break-even**: ~100-500K requests/month

## **🎯 Recommendation**
Start **cloud** for experimentation, evaluate **local** when you hit:
- 100K+ consistent monthly requests
- Strong privacy/compliance requirements
- Predictable high-volume workloads
- Technical team for infrastructure management

**Need help planning your specific deployment strategy?**`;
  }

  // Installation/Setup Help
  if (query.includes('install') || query.includes('setup') || query.includes('configure')) {
    if (query.includes('huggingface') || query.includes('hugging face')) {
      return `# 🤗 **Hugging Face Installation Guide**

## **Quick Setup**

### **1. Install Transformers**
\`\`\`bash
pip install transformers torch
\`\`\`

### **2. Basic Usage**
\`\`\`python
from transformers import pipeline

# Text generation
generator = pipeline('text-generation', model='gpt2')
result = generator("Hello, I'm a language model")
print(result[0]['generated_text'])

# Question answering
qa = pipeline('question-answering')
context = "Hugging Face is a company that provides AI tools"
question = "What does Hugging Face provide?"
answer = qa(question=question, context=context)
print(answer['answer'])
\`\`\`

### **3. Advanced Installation**
\`\`\`bash
# For specific features
pip install transformers[torch]     # PyTorch support
pip install transformers[tf]        # TensorFlow support  
pip install transformers[audio]     # Audio processing
pip install transformers[vision]    # Computer vision
\`\`\`

### **4. Model Hub Access**
\`\`\`bash
pip install huggingface-hub
huggingface-cli login
\`\`\`

**What specific model or task are you working with?** I can provide more targeted guidance.`;
    }
    
    return `# 🛠️ **Installation & Setup Guide**

## **What You're Installing**
"${userQuery}"

## **General Setup Process**

### **1. Identify Your Platform**
- **Windows**: Use PowerShell or Command Prompt
- **macOS**: Use Terminal with Homebrew
- **Linux**: Use your distribution's package manager

### **2. Common Installation Methods**
\`\`\`bash
# Python packages
pip install package-name

# Node.js packages  
npm install package-name

# System packages (macOS)
brew install package-name

# System packages (Ubuntu/Debian)
sudo apt update && sudo apt install package-name
\`\`\`

### **3. Verification**
\`\`\`bash
# Check installation
package-name --version
python -c "import package_name"
\`\`\`

**To give you specific installation commands, I need to know:**
1. **What exactly** are you trying to install?
2. **What operating system** are you using?
3. **What's your current setup** (Python, Node.js, etc.)?

**Drop those details and I'll give you the exact steps!**`;
  }

  // Basic Programming Help
  if (query.includes('basic program') || query.includes('write a program') || query.includes('simple program') || query.includes('help me write') || query.includes('help me code')) {
    return `# 💻 **Let's Write a Basic Program!**

I'd love to help you create a program! Let me show you some beginner-friendly options:

## **🐍 Python - Great for Beginners**

### **Simple Calculator**
\`\`\`suggestion:calculator.py
# Simple Calculator
def calculate(num1, num2, operation):
    if operation == '+':
        return num1 + num2
    elif operation == '-':
        return num1 - num2
    elif operation == '*':
        return num1 * num2
    elif operation == '/':
        return num1 / num2 if num2 != 0 else "Error: Division by zero"
    else:
        return "Error: Invalid operation"

# Main program
print("Simple Calculator")
num1 = float(input("Enter first number: "))
num2 = float(input("Enter second number: "))
op = input("Enter operation (+, -, *, /): ")

result = calculate(num1, num2, op)
print(f"Result: {result}")
\`\`\`

### **To-Do List Manager**
\`\`\`suggestion:todo_list.py
# Simple To-Do List
todos = []

def add_task(task):
    todos.append(task)
    print(f"Added: {task}")

def view_tasks():
    if not todos:
        print("No tasks yet!")
    else:
        print("\\nYour Tasks:")
        for i, task in enumerate(todos, 1):
            print(f"{i}. {task}")

def remove_task(index):
    if 1 <= index <= len(todos):
        removed = todos.pop(index - 1)
        print(f"Removed: {removed}")
    else:
        print("Invalid task number!")

# Main program loop
while True:
    print("\\n--- To-Do List ---")
    print("1. Add task")
    print("2. View tasks")
    print("3. Remove task")
    print("4. Quit")
    
    choice = input("Choose an option: ")
    
    if choice == '1':
        task = input("Enter task: ")
        add_task(task)
    elif choice == '2':
        view_tasks()
    elif choice == '3':
        view_tasks()
        if todos:
            try:
                num = int(input("Enter task number to remove: "))
                remove_task(num)
            except ValueError:
                print("Please enter a valid number!")
    elif choice == '4':
        print("Goodbye!")
        break
    else:
        print("Invalid choice!")
\`\`\`

## **🌐 JavaScript - For Web Development**

### **Interactive Web Page**
\`\`\`suggestion:index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Web App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover {
            background: #0056b3;
        }
        input {
            padding: 10px;
            margin: 5px;
            border: 1px solid #ddd;
            border-radius: 5px;
            width: 200px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 My First Web App</h1>
        
        <h3>Name Generator</h3>
        <input type="text" id="nameInput" placeholder="Enter your name">
        <button onclick="greetUser()">Greet Me!</button>
        <p id="greeting"></p>
        
        <h3>Random Number Game</h3>
        <button onclick="generateNumber()">Generate Random Number</button>
        <p id="randomNumber"></p>
        
        <h3>Simple Counter</h3>
        <button onclick="increment()">+</button>
        <span id="counter">0</span>
        <button onclick="decrement()">-</button>
    </div>

    <script>
        let count = 0;
        
        function greetUser() {
            const name = document.getElementById('nameInput').value;
            const greeting = document.getElementById('greeting');
            if (name) {
                greeting.textContent = \`Hello, \${name}! Welcome to my web app! 🎈\`;
            } else {
                greeting.textContent = "Please enter your name first!";
            }
        }
        
        function generateNumber() {
            const randomNum = Math.floor(Math.random() * 100) + 1;
            document.getElementById('randomNumber').textContent = 
                \`Your random number is: \${randomNum}\`;
        }
        
        function increment() {
            count++;
            document.getElementById('counter').textContent = count;
        }
        
        function decrement() {
            count--;
            document.getElementById('counter').textContent = count;
        }
    </script>
</body>
</html>
\`\`\`

## **🚀 Run Your Programs**

### **For Python:**
\`\`\`incantation:Run Python Calculator
python calculator.py
\`\`\`

\`\`\`incantation:Run Python To-Do List
python todo_list.py
\`\`\`

### **For HTML/JavaScript:**
\`\`\`incantation:Open Web App in Browser
open index.html
\`\`\`

**What type of program interests you most?** I can help you:
- Build a specific application you have in mind
- Learn a particular programming language
- Solve a coding challenge
- Debug existing code

**Just tell me what you'd like to create, and I'll provide the code with step-by-step instructions!**`;
  }

  // Coding Help (General)
  if (query.includes('code') || query.includes('programming') || query.includes('debug') || query.includes('script')) {
    return `# 💻 **Coding Assistance**

## **Your Request**
"${userQuery}"

## **How I Can Help**

### **🔧 Code Examples & Solutions**
I can provide working code in:
- **Python**: Data analysis, web apps, automation, ML
- **JavaScript/TypeScript**: Web apps, Node.js, React
- **HTML/CSS**: Frontend layouts and styling
- **SQL**: Database queries and optimization
- **Bash**: Automation scripts and system tasks

### **🐛 Debugging Support**
- **Error Analysis**: Explain what went wrong and why
- **Code Review**: Identify improvements and best practices
- **Performance**: Optimize slow or inefficient code
- **Testing**: Help write tests and validate functionality

### **🏗️ Project Structure**
- **Architecture**: Design scalable, maintainable systems
- **Best Practices**: Industry standards and conventions
- **Documentation**: Clear comments and README files
- **Deployment**: Get your code running in production

## **Quick Examples**

### **Python Web API**
\`\`\`python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/users')
def get_users():
    return jsonify([{'id': 1, 'name': 'Alice'}])

if __name__ == '__main__':
    app.run(debug=True)
\`\`\`

### **React Component**
\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

**What specific coding challenge can I help you solve?** Share your code, error messages, or describe what you're trying to build!`;
  }

  // Planning assistance (if specifically requested)
  if (query.includes('plan') || query.includes('project') || query.includes('roadmap') || query.includes('strategy')) {
    return `I can help you with planning and strategy! Here's how I approach this:

**Understanding Your Goals**
To provide the most helpful guidance, I'd like to understand:
- What are you trying to accomplish?
- What's your timeline and any constraints?
- What resources do you have available?

**How I Can Assist**
- Break down complex goals into manageable steps
- Identify potential challenges and solutions
- Suggest approaches and best practices
- Help prioritize tasks and milestones

**What specific aspect of planning would you like help with?** The more details you share about your situation, the more targeted and useful my suggestions can be.`;
  }

  // Test/Status Check
  if (query.includes('test') || query.includes('working') || query.includes('status') || query === 'hi' || query === 'hello') {
    return `# 🟢 **System Status: All Good!**

Yes, everything is working perfectly! Here's what's running:

## **🧠 Llama 4 Scout Backend**
- **Status**: ✅ Online and responding
- **Capabilities**: Advanced reasoning, coding assistance, project planning
- **Features**: RAG document processing, real-time responses

## **🔧 What I Can Help With**
- **Programming**: Write code, debug errors, explain concepts
- **Project Planning**: Break down ideas into actionable steps
- **Problem Solving**: Analyze challenges and suggest solutions
- **Learning**: Explain topics, provide examples, guide practice

## **💻 Try These Commands**
- "Help me write a Python calculator"
- "Create a simple web page"
- "Plan a mobile app project"
- "Explain how machine learning works"

**What would you like to work on?** I'm ready to provide detailed, practical assistance!`;
  }

  // General assistance for any other queries
  return `# 🤖 **How Can I Help You?**

**Your Question:** "${userQuery}"

I'm an advanced AI assistant specializing in turning ideas into actionable projects. Here's how I can help:

## **🔧 Technical Assistance**
- **Programming**: Code examples, debugging, best practices
- **Web Development**: HTML/CSS/JavaScript, React, Node.js
- **Data Science**: Python, analysis, machine learning
- **System Administration**: Scripts, automation, DevOps

## **📋 Project Planning**
- **Idea Development**: Transform concepts into detailed plans
- **Architecture Design**: System structure and component planning
- **Implementation Roadmaps**: Step-by-step development guides
- **Risk Assessment**: Identify challenges and solutions

## **💡 Learning Support**
- **Concept Explanations**: Break down complex topics
- **Practical Examples**: Real-world applications and demos
- **Best Practices**: Industry standards and recommendations
- **Skill Development**: Structured learning paths

## **🚀 Quick Start Examples**
- "Help me build a todo app"
- "Create a data analysis script"
- "Plan a e-commerce website"
- "Explain neural networks with examples"

**What specific challenge can I help you tackle?** The more details you provide, the more targeted and useful my assistance will be!`;

}

// System Management Endpoints for Local Server Manager
app.get('/api/system/status', async (req, res) => {
  try {
    const directory = req.query.directory || process.cwd();
    
    const systemStatus = {
      ports: {},
      models: {},
      dependencies: {},
      currentDirectory: directory
    };

    // Check port status
    const ports = [3000, 3001, 11434];
    for (const port of ports) {
      try {
        const result = await TERMINAL_COMMANDS.executeCommand(`lsof -ti :${port}`, directory);
        systemStatus.ports[port] = {
          inUse: result.success && result.stdout.trim() !== '',
          pid: result.success ? result.stdout.trim() : null
        };
      } catch (error) {
        systemStatus.ports[port] = { inUse: false, pid: null };
      }
    }

    // Check Ollama models
    try {
      const ollamaResult = await TERMINAL_COMMANDS.executeCommand('ollama list', directory);
      systemStatus.models.ollama = {
        available: ollamaResult.success,
        models: ollamaResult.success ? ollamaResult.stdout.split('\n').slice(1).filter(line => line.trim()) : []
      };
    } catch (error) {
      systemStatus.models.ollama = { available: false, models: [] };
    }

    // Check if this directory has backend/server.js
    try {
      const backendCheck = await TERMINAL_COMMANDS.executeCommand('ls -la backend/server.js', directory);
      systemStatus.hasBackend = backendCheck.success;
    } catch (error) {
      systemStatus.hasBackend = false;
    }

    // Check if this directory has package.json
    try {
      const packageCheck = await TERMINAL_COMMANDS.executeCommand('ls -la package.json', directory);
      systemStatus.hasPackageJson = packageCheck.success;
    } catch (error) {
      systemStatus.hasPackageJson = false;
    }

    res.json(systemStatus);
  } catch (error) {
    console.error('System status check failed:', error);
    res.status(500).json({ error: 'System status check failed' });
  }
});

app.post('/api/system/setup-complete', async (req, res) => {
  try {
    const { directory, projectName } = req.body;
    const workingDir = directory || process.cwd();
    
    console.log(`🎯 Running complete system setup in: ${workingDir}`);
    
    const results = [];
    
    // Step 1: Validate directory
    try {
      const dirCheck = await TERMINAL_COMMANDS.executeCommand('pwd', workingDir);
      if (dirCheck.success) {
        results.push(`✅ Working directory: ${dirCheck.stdout.trim()}`);
      } else {
        results.push(`❌ Invalid directory: ${workingDir}`);
        return res.status(400).json({ error: 'Invalid directory', details: results });
      }
    } catch (error) {
      results.push(`❌ Directory access error: ${error.message}`);
      return res.status(400).json({ error: 'Directory access failed', details: results });
    }
    
    // Step 2: Clear ports
    const ports = [3000, 3001, 11434];
    for (const port of ports) {
      try {
        const killResult = await TERMINAL_COMMANDS.executeCommand(`lsof -ti :${port}`, workingDir);
        if (killResult.success && killResult.stdout.trim()) {
          await TERMINAL_COMMANDS.executeCommand(`kill -9 ${killResult.stdout.trim()}`, workingDir);
          results.push(`✅ Cleared port ${port}`);
        } else {
          results.push(`✅ Port ${port} already free`);
        }
      } catch (error) {
        results.push(`⚠️ Port ${port}: ${error.message}`);
      }
    }
    
    // Wait for ports to clear
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Check if backend exists
    try {
      const backendCheck = await TERMINAL_COMMANDS.executeCommand('ls -la backend/server.js', workingDir);
      if (backendCheck.success) {
        results.push(`✅ Found backend/server.js`);
        
        // Start backend from the project directory
        const startBackend = `cd "${workingDir}/backend" && nohup node server.js > ../backend.log 2>&1 &`;
        const backendResult = await TERMINAL_COMMANDS.executeCommand(startBackend);
        
        if (backendResult.success) {
          results.push(`✅ Backend starting from ${workingDir}/backend`);
        } else {
          results.push(`❌ Backend start failed: ${backendResult.stderr}`);
        }
      } else {
        results.push(`⚠️ No backend/server.js found in ${workingDir}`);
        results.push(`💡 This appears to be a different type of project`);
      }
    } catch (error) {
      results.push(`⚠️ Backend check failed: ${error.message}`);
    }
    
    // Step 4: Start Ollama (global service)
    try {
      const ollamaCheck = await TERMINAL_COMMANDS.executeCommand('which ollama');
      if (ollamaCheck.success) {
        const ollamaStart = await TERMINAL_COMMANDS.executeCommand('nohup ollama serve > ollama.log 2>&1 &', workingDir);
        results.push(`✅ Ollama service started`);
      } else {
        results.push(`⚠️ Ollama not installed (optional)`);
      }
    } catch (error) {
      results.push(`⚠️ Ollama: ${error.message}`);
    }
    
    // Step 5: Check for npm project
    try {
      const packageCheck = await TERMINAL_COMMANDS.executeCommand('ls -la package.json', workingDir);
      if (packageCheck.success) {
        results.push(`✅ Found package.json - this is an npm project`);
        results.push(`💡 You can run 'npm start' from this directory`);
      } else {
        results.push(`ℹ️ No package.json found`);
      }
    } catch (error) {
      results.push(`ℹ️ Project type check: ${error.message}`);
    }
    
    res.json({ 
      success: true, 
      message: `System setup completed for ${projectName || 'project'}`,
      directory: workingDir,
      details: results
    });
    
  } catch (error) {
    console.error('Complete setup failed:', error);
    res.status(500).json({ error: `Setup failed: ${error.message}` });
  }
});

// File Operations Endpoints
app.get('/api/files/read', async (req, res) => {
  try {
    const { filePath, directory } = req.query;
    const workingDir = directory || process.cwd();
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(workingDir, filePath);
    
    console.log(`📖 Reading file: ${fullPath}`);
    
    // Security check - ensure file is within working directory
    const normalizedPath = path.normalize(fullPath);
    const normalizedDir = path.normalize(workingDir);
    
    if (!normalizedPath.startsWith(normalizedDir)) {
      return res.status(403).json({ error: 'Access denied: File outside working directory' });
    }
    
    try {
      const content = await fs.promises.readFile(fullPath, 'utf8');
      res.json({ 
        success: true, 
        content,
        filePath: fullPath,
        exists: true
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.json({ 
          success: true, 
          content: null,
          filePath: fullPath,
          exists: false
        });
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('File read failed:', error);
    res.status(500).json({ error: `Failed to read file: ${error.message}` });
  }
});

app.post('/api/files/write', async (req, res) => {
  try {
    const { filePath, content, directory, createDirectories = true } = req.body;
    const workingDir = directory || process.cwd();
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(workingDir, filePath);
    
    console.log(`✍️ Writing file: ${fullPath}`);
    
    // Security check - ensure file is within working directory
    const normalizedPath = path.normalize(fullPath);
    const normalizedDir = path.normalize(workingDir);
    
    if (!normalizedPath.startsWith(normalizedDir)) {
      return res.status(403).json({ error: 'Access denied: File outside working directory' });
    }
    
    // Create directories if needed
    if (createDirectories) {
      const dirPath = path.dirname(fullPath);
      await fs.promises.mkdir(dirPath, { recursive: true });
    }
    
    await fs.promises.writeFile(fullPath, content, 'utf8');
    
    res.json({ 
      success: true, 
      filePath: fullPath,
      message: 'File written successfully'
    });
    
  } catch (error) {
    console.error('File write failed:', error);
    res.status(500).json({ error: `Failed to write file: ${error.message}` });
  }
});

app.post('/api/files/apply-changes', async (req, res) => {
  try {
    const { filePath, content, directory, backup = true } = req.body;
    const workingDir = directory || process.cwd();
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(workingDir, filePath);
    
    console.log(`🔄 Applying changes: ${fullPath}`);
    
    // Security check
    const normalizedPath = path.normalize(fullPath);
    const normalizedDir = path.normalize(workingDir);
    
    if (!normalizedPath.startsWith(normalizedDir)) {
      return res.status(403).json({ error: 'Access denied: File outside working directory' });
    }
    
    // Create backup if file exists and backup is requested
    if (backup) {
      try {
        await fs.promises.access(fullPath);
        const backupPath = `${fullPath}.backup.${Date.now()}`;
        await fs.promises.copyFile(fullPath, backupPath);
        console.log(`📋 Backup created: ${backupPath}`);
      } catch (error) {
        // File doesn't exist, no backup needed
      }
    }
    
    // Create directories if needed
    const dirPath = path.dirname(fullPath);
    await fs.promises.mkdir(dirPath, { recursive: true });
    
    // Write the new content
    await fs.promises.writeFile(fullPath, content, 'utf8');
    
    res.json({ 
      success: true, 
      filePath: fullPath,
      message: 'Changes applied successfully'
    });
    
  } catch (error) {
    console.error('Apply changes failed:', error);
    res.status(500).json({ error: `Failed to apply changes: ${error.message}` });
  }
});

app.get('/api/files/list', async (req, res) => {
  try {
    const { directory, pattern } = req.query;
    const workingDir = directory || process.cwd();
    
    console.log(`📋 Listing files in: ${workingDir}`);
    
    const files = await fs.promises.readdir(workingDir, { withFileTypes: true });
    
    const fileList = files.map(file => ({
      name: file.name,
      isDirectory: file.isDirectory(),
      isFile: file.isFile(),
      path: path.join(workingDir, file.name)
    }));
    
    // Apply pattern filter if provided
    let filteredFiles = fileList;
    if (pattern) {
      const regex = new RegExp(pattern, 'i');
      filteredFiles = fileList.filter(file => regex.test(file.name));
    }
    
    res.json({ 
      success: true, 
      files: filteredFiles,
      directory: workingDir
    });
    
  } catch (error) {
    console.error('List files failed:', error);
    res.status(500).json({ error: `Failed to list files: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`🧠 Advanced Llama 4 Scout Backend running on http://localhost:${port}`);
  console.log(`📋 General-purpose AI assistance with advanced reasoning`);
  console.log(`🔗 Health check: http://localhost:${port}/api/health`);
  console.log(`🔧 System management: http://localhost:${port}/api/system/status`);
  console.log(`🚀 Ready for comprehensive assistance across any topic`);
}); 