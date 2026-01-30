#!/bin/bash

echo "========================================"
echo "   Starting CatalogStudio Frontend"
echo "========================================"

cd catalogstudio-frontend

# Check dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

npm run dev
