#!/bin/bash

# Build the project
npm run build

# Fix paths in index.html
sed -i '' 's|src="/assets/|src="/gpt-marketplace/assets/|g; s|href="/assets/|href="/gpt-marketplace/assets/|g' dist/index.html

# Make sure dist/assets exists
mkdir -p dist/assets

# Copy all image assets to the dist/assets directory
cp -f src/assets/*.png dist/assets/ 2>/dev/null || :
cp -f src/assets/*.svg dist/assets/ 2>/dev/null || :
cp -f src/assets/*.jpg dist/assets/ 2>/dev/null || :

# Deploy to GitHub Pages
npx gh-pages -d dist 