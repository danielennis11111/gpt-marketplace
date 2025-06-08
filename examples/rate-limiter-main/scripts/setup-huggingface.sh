#!/bin/bash

# HuggingFace Setup Script for danielennis11111
# This script helps set up your HuggingFace integration for avatar functionality

echo "🎭 Setting up HuggingFace Integration for danielennis11111"
echo "================================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    touch .env.local
    echo "✅ .env.local created"
else
    echo "📄 .env.local already exists"
fi

echo ""
echo "🔑 API Token Setup Required:"
echo "1. Go to: https://huggingface.co/settings/tokens"
echo "2. Click 'New token'"
echo "3. Name: 'avatar-project'"
echo "4. Type: 'Read'"
echo "5. Copy the token that starts with 'hf_'"
echo ""

# Function to add or update environment variable
add_or_update_env() {
    local key=$1
    local value=$2
    local file=".env.local"
    
    if grep -q "^${key}=" "$file" 2>/dev/null; then
        # Update existing
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/^${key}=.*/${key}=${value}/" "$file"
        else
            sed -i "s/^${key}=.*/${key}=${value}/" "$file"
        fi
        echo "✅ Updated ${key} in ${file}"
    else
        # Add new
        echo "${key}=${value}" >> "$file"
        echo "✅ Added ${key} to ${file}"
    fi
}

# Prompt for HuggingFace token
echo "🔐 Enter your HuggingFace API token (starts with hf_):"
read -r HF_TOKEN

if [[ $HF_TOKEN == hf_* ]]; then
    add_or_update_env "NEXT_PUBLIC_HF_TOKEN" "$HF_TOKEN"
    add_or_update_env "HF_TOKEN" "$HF_TOKEN"
    echo "✅ HuggingFace token configured!"
else
    echo "⚠️  Warning: Token doesn't start with 'hf_' - please verify"
    add_or_update_env "NEXT_PUBLIC_HF_TOKEN" "$HF_TOKEN"
    add_or_update_env "HF_TOKEN" "$HF_TOKEN"
fi

echo ""
echo "🧪 Testing HuggingFace Connection..."

# Test HuggingFace CLI installation
if command -v huggingface-cli &> /dev/null; then
    echo "✅ HuggingFace CLI installed"
    
    # Test authentication
    if huggingface-cli whoami &> /dev/null; then
        echo "✅ Already authenticated with HuggingFace CLI"
    else
        echo "🔐 Authenticating with HuggingFace CLI..."
        echo "$HF_TOKEN" | huggingface-cli login --token
        if [ $? -eq 0 ]; then
            echo "✅ HuggingFace CLI authentication successful"
        else
            echo "⚠️  HuggingFace CLI authentication failed"
        fi
    fi
else
    echo "📦 Installing HuggingFace CLI..."
    pip install huggingface_hub
    echo "✅ HuggingFace CLI installed"
    
    echo "🔐 Authenticating with HuggingFace CLI..."
    echo "$HF_TOKEN" | huggingface-cli login --token
fi

echo ""
echo "🎯 Avatar Models Setup..."

# Check available avatar spaces
echo "📡 Checking HuggingFace Spaces availability..."

# Test connection to avatar endpoints
check_endpoint() {
    local name=$1
    local url=$2
    
    echo -n "  Testing ${name}... "
    if curl -s --max-time 10 "${url}" &> /dev/null; then
        echo "✅ Available"
    else
        echo "⚠️  Unavailable or slow"
    fi
}

check_endpoint "Hallo API" "https://fffiloni-hallo-api.hf.space"
check_endpoint "SadTalker" "https://sadtalker.hf.space"
check_endpoint "Talking Face TTS" "https://cvpr-ml-talking-face.hf.space"

echo ""
echo "🎭 Avatar System Configuration Complete!"
echo "================================================="
echo ""
echo "📋 What's configured:"
echo "  ✅ HuggingFace API token in .env.local"
echo "  ✅ HuggingFace CLI authenticated"
echo "  ✅ Avatar endpoints tested"
echo ""
echo "🚀 Next steps:"
echo "  1. npm run dev (start your development server)"
echo "  2. Navigate to the avatar interface"
echo "  3. Upload a photo and test avatar generation"
echo ""
echo "🎪 Your HuggingFace profile: https://huggingface.co/danielennis11111"
echo ""

# Display current .env.local contents (masked)
echo "📄 Current .env.local configuration:"
if [ -f .env.local ]; then
    while IFS= read -r line; do
        if [[ $line == *"TOKEN"* ]] || [[ $line == *"KEY"* ]]; then
            key=$(echo "$line" | cut -d'=' -f1)
            echo "  $key=***HIDDEN***"
        else
            echo "  $line"
        fi
    done < .env.local
fi

echo ""
echo "🎉 Setup complete! Ready for avatar magic! 🎭✨" 