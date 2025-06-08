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
ollama list

# Start the web application
echo "Starting Beta aiLand web application..."
npm run dev 