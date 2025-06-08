#!/bin/bash

echo "🎯 Starting Llama 4 Scout Backend Setup..."

# Kill any existing processes on ports 3001 and 11434
echo "🔪 Clearing ports..."
lsof -ti :3001 | xargs -r kill -9 2>/dev/null || true
lsof -ti :11434 | xargs -r kill -9 2>/dev/null || true

# Wait for ports to clear
sleep 2

# Navigate to backend directory
cd backend

echo "🚀 Starting Llama 4 Scout Backend..."
# Start backend server
nohup node server.js > ../backend.log 2>&1 &
BACKEND_PID=$!

echo "✅ Backend started with PID: $BACKEND_PID"

# Start Ollama if available
if command -v ollama &> /dev/null; then
    echo "🦙 Starting Ollama service..."
    nohup ollama serve > ../ollama.log 2>&1 &
    OLLAMA_PID=$!
    echo "✅ Ollama started with PID: $OLLAMA_PID"
else
    echo "⚠️ Ollama not installed (optional)"
fi

# Wait a bit and check if backend is responding
sleep 3

echo "🔍 Checking backend health..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend is responding!"
    echo "🌐 Backend: http://localhost:3001/api/health"
    echo "🔧 System Status: http://localhost:3001/api/system/status"
    echo ""
    echo "🎉 Setup complete! Your local Llama 4 Scout is ready."
    echo "💡 Now you can use the 'Run Complete Setup' button in the frontend."
else
    echo "❌ Backend not responding"
    echo "📋 Check backend.log for details"
    exit 1
fi 