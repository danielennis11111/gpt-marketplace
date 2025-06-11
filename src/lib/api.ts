// API response type
export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

// API endpoints
const API_ENDPOINTS = {
  LLAMA: {
    MODELS: "https://api.llama.com/v1/models",
    CHAT: "https://api.llama.com/v1/chat/completions",
    TEST: "https://api.llama.com/v1/models"
  },
  GEMINI: {
    GENERATE: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    TEST: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
  },
  OLLAMA: {
    GENERATE: "http://localhost:11434/api/generate",
    MODELS: "http://localhost:11434/api/tags",
    TEST: "http://localhost:11434/api/tags"
  }
};

// Local storage keys
const STORAGE_KEYS = {
  LLAMA_API_KEY: 'llama_api_key',
  GEMINI_API_KEY: 'gemini_api_key',
  PRIMARY_MODEL: 'primary_model',
  PRIMARY_MODEL_TYPE: 'primary_model_type' // 'llama', 'gemini', or 'ollama'
};

// Helper functions for API keys
function getLlamaApiKey(): string | null {
  return localStorage.getItem(STORAGE_KEYS.LLAMA_API_KEY);
}

function getGeminiApiKey(): string | null {
  return localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY);
}

export function saveLlamaApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEYS.LLAMA_API_KEY, key);
}

export function saveGeminiApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, key);
}

export function removeLlamaApiKey(): void {
  localStorage.removeItem(STORAGE_KEYS.LLAMA_API_KEY);
}

export function removeGeminiApiKey(): void {
  localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
}

export function hasLlamaApiKey(): boolean {
  return !!getLlamaApiKey();
}

export function hasGeminiApiKey(): boolean {
  return !!getGeminiApiKey();
}

// Primary model selection
export function setPrimaryModel(model: string, type: 'llama' | 'gemini' | 'ollama'): void {
  localStorage.setItem(STORAGE_KEYS.PRIMARY_MODEL, model);
  localStorage.setItem(STORAGE_KEYS.PRIMARY_MODEL_TYPE, type);
}

export function getPrimaryModel(): { model: string; type: 'llama' | 'gemini' | 'ollama' } | null {
  const model = localStorage.getItem(STORAGE_KEYS.PRIMARY_MODEL);
  const type = localStorage.getItem(STORAGE_KEYS.PRIMARY_MODEL_TYPE) as 'llama' | 'gemini' | 'ollama';
  return model && type ? { model, type } : null;
}

// API test functions
export async function testLlamaConnection(): Promise<ApiResponse> {
  try {
    const apiKey = getLlamaApiKey();
    if (!apiKey) {
      return {
        success: false,
        message: "No Llama API key found. Please add your API key in settings.",
        error: "API_KEY_MISSING"
      };
    }

    const response = await fetch(API_ENDPOINTS.LLAMA.TEST, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to connect to Llama API");
    }
    return await response.json();
  } catch (error) {
    console.error("Llama API test error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to connect to Llama API",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function testGeminiConnection(): Promise<ApiResponse> {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return {
        success: false,
        message: "No Gemini API key found. Please add your API key in settings.",
        error: "API_KEY_MISSING"
      };
    }

    const response = await fetch(API_ENDPOINTS.GEMINI.TEST, {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Test connection"
          }]
        }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to connect to Gemini API");
    }
    return await response.json();
  } catch (error) {
    console.error("Gemini API test error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to connect to Gemini API",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function testOllamaConnection(): Promise<ApiResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.OLLAMA.TEST);
    if (!response.ok) {
      throw new Error("Failed to connect to Ollama. Make sure Ollama is running locally.");
    }
    return await response.json();
  } catch (error) {
    console.error("Ollama test error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to connect to Ollama",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Model listing functions
export async function listLlamaModels(): Promise<ApiResponse> {
  try {
    const apiKey = getLlamaApiKey();
    if (!apiKey) {
      return {
        success: false,
        message: "No Llama API key found. Please add your API key in settings.",
        error: "API_KEY_MISSING"
      };
    }

    const response = await fetch(API_ENDPOINTS.LLAMA.MODELS, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to list Llama models");
    }
    return await response.json();
  } catch (error) {
    console.error("Llama models error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to list Llama models",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function listOllamaModels(): Promise<ApiResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.OLLAMA.MODELS);
    if (!response.ok) {
      throw new Error("Failed to list Ollama models. Make sure Ollama is running locally.");
    }
    return await response.json();
  } catch (error) {
    console.error("Ollama models error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to list Ollama models",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Chat generation functions
export async function generateLlamaResponse(prompt: string, model: string): Promise<ApiResponse> {
  try {
    const apiKey = getLlamaApiKey();
    if (!apiKey) {
      return {
        success: false,
        message: "No Llama API key found. Please add your API key in settings.",
        error: "API_KEY_MISSING"
      };
    }

    const response = await fetch(API_ENDPOINTS.LLAMA.CHAT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate response");
    }
    return await response.json();
  } catch (error) {
    console.error("Llama generation error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate response",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function generateGeminiResponse(prompt: string): Promise<ApiResponse> {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return {
        success: false,
        message: "No Gemini API key found. Please add your API key in settings.",
        error: "API_KEY_MISSING"
      };
    }

    const response = await fetch(API_ENDPOINTS.GEMINI.GENERATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate response");
    }
    return await response.json();
  } catch (error) {
    console.error("Gemini generation error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate response",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function generateOllamaResponse(prompt: string, model: string): Promise<ApiResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.OLLAMA.GENERATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error("Failed to generate response. Make sure Ollama is running locally.");
    }
    return await response.json();
  } catch (error) {
    console.error("Ollama generation error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate response",
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 