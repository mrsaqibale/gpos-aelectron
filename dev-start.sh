#!/bin/bash

# Development startup script for POS System
echo "🚀 Starting POS System Development Environment..."

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping development servers..."
    kill $VITE_PID $ELECTRON_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start Vite dev server
echo "📦 Starting Vite dev server..."
npm run dev &
VITE_PID=$!

# Wait for Vite to start
echo "⏳ Waiting for Vite dev server to start..."
sleep 5

# Start Electron app
echo "🖥️ Starting Electron app..."
npm run electron &
ELECTRON_PID=$!

echo "✅ Development environment started!"
echo "📱 Vite dev server: http://localhost:5173 (or next available port)"
echo "🖥️ Electron app: Running"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for background processes
wait 