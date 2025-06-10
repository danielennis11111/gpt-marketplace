#!/bin/bash

# GitHub Pages Deployment Script for GPT Marketplace
# This script builds the app and deploys to gh-pages branch

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 GitHub Pages Deployment for GPT Marketplace${NC}"
echo "=================================================="

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  You're on branch '$CURRENT_BRANCH'. Switching to main...${NC}"
    git checkout main
fi

# Make sure we have the latest changes
echo -e "${BLUE}📥 Pulling latest changes...${NC}"
git pull origin main

# Clean any previous build
echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
rm -rf dist/

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci

# Set base path for GitHub Pages
echo -e "${BLUE}🔧 Setting base path for GitHub Pages...${NC}"
# Update vite.config.ts to include base path
if grep -q "base:" vite.config.ts; then
    echo -e "${GREEN}✅ Base path already configured${NC}"
else
    sed -i '' 's/plugins: \[react()\],/plugins: [react()],\n  base: "\/gpt-marketplace\/",/' vite.config.ts
    echo -e "${GREEN}✅ Base path configured${NC}"
fi

# Build for production
echo -e "${BLUE}🏗️  Building for production...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - no dist directory found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Deploy to gh-pages branch
echo -e "${BLUE}🚀 Deploying to gh-pages branch...${NC}"

# Save current commit hash
CURRENT_COMMIT=$(git rev-parse HEAD)

# Create or switch to gh-pages branch
if git show-ref --verify --quiet refs/heads/gh-pages; then
    git checkout gh-pages
else
    git checkout --orphan gh-pages
    git rm -rf .
fi

# Copy dist files
cp -r dist/* .

# Add all files
git add .

# Commit
git commit -m "Deploy from main branch (${CURRENT_COMMIT:0:7})"

# Push to gh-pages
git push origin gh-pages

# Switch back to main
git checkout main

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo "=================================================="
echo -e "${GREEN}✅ Site URL: https://danielennis11111.github.io/gpt-marketplace/${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Wait 1-2 minutes for GitHub Pages to update"
echo "2. Visit the site URL above"
echo "3. Check GitHub repository Settings > Pages for deployment status"
echo ""
echo -e "${YELLOW}💡 To update: Re-run this script after making changes${NC}" 