#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting deployment process for CatalogStudio SaaS..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
# Use npm install since no package-lock.json is present yet. 
# In a CI environment with a lockfile, 'npm ci' would be preferred.
npm install

echo "🛠  Building the application..."
npm run build

if [ -d "dist" ]; then
    echo "✅ Build successful! The production build is located in the 'dist' directory."
    echo "   You can serve it using a static file server (e.g., nginx, serve, or upload to S3)."
else
    echo "❌ Build failed. 'dist' directory was not created."
    exit 1
fi
