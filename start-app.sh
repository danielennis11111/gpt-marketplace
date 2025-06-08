#!/bin/bash

echo "Starting Beta aiLand Marketplace..."

# First, start Ollama server if it's not already running
if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "Starting Ollama server..."
    # Start Ollama server in the background
    ollama serve &
    
    # Wait for server to start
    echo "Waiting for Ollama server to start..."
    sleep 5
    
    # Check if server started successfully
    if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo "Ollama server started successfully!"
    else
        echo "Failed to start Ollama server. Please start it manually with 'ollama serve'"
        exit 1
    fi
else
    echo "Ollama server is already running."
fi

# List available models
echo "Available Ollama models:"
MODEL_COUNT=$(ollama list | grep -v "NAME" | wc -l)

if [ "$MODEL_COUNT" -eq 0 ]; then
    echo "No models found. To install a model, run one of the following commands:"
    echo "  ollama pull llama3:8b    (recommended for general use)"
    echo "  ollama pull gemma3:4b    (smaller but fast)"
    echo "  ollama pull mistral      (good for coding)"
    echo ""
    echo "For more models, visit: https://ollama.com/library"
else
    ollama list
fi

# Start the web application
echo "Starting Beta aiLand web application..."
npm run dev 