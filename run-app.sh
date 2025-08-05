#!/bin/bash

# POS System Launcher Script
echo "🚀 Starting POS System..."

# Check if the application exists
if [ ! -f "./dist/linux-unpacked/pos-system" ]; then
    echo "❌ Application not found. Please build the application first:"
    echo "   npm run build:linux"
    exit 1
fi

# Run the application with sandbox disabled
echo "✅ Launching POS System..."
./dist/linux-unpacked/pos-system --no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage 