#!/bin/bash

# 🎭 Complete HuggingFace Avatar Setup for danielennis11111
# This script sets up everything needed for avatar interaction

echo "🎭 Complete HuggingFace Avatar Setup"
echo "======================================"
echo "Setting up avatar system for danielennis11111"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from your project root directory"
    exit 1
fi

# Step 1: Run the HuggingFace setup script
echo "📋 Step 1: HuggingFace Integration Setup"
echo "----------------------------------------"
if [ -f "scripts/setup-huggingface.sh" ]; then
    ./scripts/setup-huggingface.sh
else
    echo "❌ setup-huggingface.sh not found!"
    exit 1
fi

echo ""
echo "📋 Step 2: Testing HuggingFace Integration"
echo "----------------------------------------"

# Check if .env.local was created
if [ -f ".env.local" ]; then
    echo "✅ Environment file created"
    
    # Load environment variables
    source .env.local
    
    # Test with Python script
    if [ -f "scripts/test-huggingface.py" ]; then
        echo "🧪 Running comprehensive tests..."
        .venv/bin/python scripts/test-huggingface.py
    else
        echo "⚠️  Test script not found, skipping tests"
    fi
else
    echo "⚠️  .env.local not found, skipping tests"
fi

echo ""
echo "📋 Step 3: Final Setup"
echo "---------------------"

# Install additional dependencies if needed
echo "📦 Checking dependencies..."
if command -v npm &> /dev/null; then
    echo "✅ npm found"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing npm dependencies..."
        npm install
    else
        echo "✅ npm dependencies already installed"
    fi
else
    echo "⚠️  npm not found, please install Node.js"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "🚀 Your avatar system is ready! Here's what you can do:"
echo ""
echo "1️⃣  Start your development server:"
echo "   npm run dev"
echo ""
echo "2️⃣  Test your avatar system:"
echo "   .venv/bin/python scripts/test-huggingface.py"
echo ""
echo "3️⃣  Visit your HuggingFace profile:"
echo "   https://huggingface.co/danielennis11111"
echo ""
echo "4️⃣  Available Avatar Models:"
echo "   🎭 Hallo - Most realistic talking heads"
echo "   😭 SadTalker - Expressive facial animations"
echo "   💋 Wav2Lip - Fast lip-sync generation"
echo "   🎪 MuseTalk - Real-time conversation"
echo ""
echo "5️⃣  Features Ready:"
echo "   📸 Custom image upload"
echo "   🗣️  Text-to-speech generation"
echo "   🎬 Talking head video creation"
echo "   💬 Real-time conversation"
echo ""
echo "📚 Next Steps:"
echo "   - Upload a photo for your avatar"
echo "   - Type a message to generate speech"
echo "   - Watch your avatar come to life!"
echo ""
echo "🔧 Troubleshooting:"
echo "   - Check .env.local for your HuggingFace token"
echo "   - Ensure your token has 'read' permissions"
echo "   - Some models may take time to load (HuggingFace Spaces)"
echo ""
echo "🎭✨ Happy avatar creation! ✨🎭" 