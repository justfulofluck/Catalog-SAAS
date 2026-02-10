#!/bin/bash

echo "🎨 Catalog Studio SaaS - Docker + localhost.run Setup"
echo "======================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this in the catalogstudio-frontend directory."
    exit 1
fi

# Check if the app is already running locally
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  Warning: Port 3000 is already in use locally."
    echo "   Please stop your local app first: Ctrl+C your 'npm run dev' process"
    echo "   Then run this script again."
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 Building and starting Docker containers..."
echo "   This will create a public URL for your Catalog Studio app!"
echo ""

# Start the Docker services
docker-compose up --build -d

echo ""
echo "📊 Showing tunnel logs (Ctrl+C to exit log viewing):"
echo "   Your public URL will appear below in a few seconds..."
echo "   🌐 Share this URL with anyone to access your app!"
echo ""

# Wait a moment for containers to start
sleep 5

# Show logs
docker-compose logs -f tunnel