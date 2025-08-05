#!/bin/bash

# Fix Chrome Sandbox Permissions Script
echo "🔧 Fixing Chrome sandbox permissions..."

# Check if the application exists
if [ ! -f "./dist/linux-unpacked/pos-system" ]; then
    echo "❌ Application not found. Please build the application first:"
    echo "   npm run build:linux"
    exit 1
fi

# Check if chrome-sandbox exists
if [ ! -f "./dist/linux-unpacked/chrome-sandbox" ]; then
    echo "❌ chrome-sandbox not found. Please rebuild the application:"
    echo "   npm run build:linux"
    exit 1
fi

# Fix permissions (requires sudo)
echo "🔐 Setting proper permissions for chrome-sandbox..."
sudo chown root:root ./dist/linux-unpacked/chrome-sandbox
sudo chmod 4755 ./dist/linux-unpacked/chrome-sandbox

echo "✅ Sandbox permissions fixed!"
echo "🚀 You can now run the application normally:"
echo "   ./run-app.sh" 