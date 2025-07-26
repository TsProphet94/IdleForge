#!/bin/bash

# Local Test Server for IdleForge PWA
# Test your changes before deploying

echo "🧪 Starting IdleForge Local Test Server..."
echo "============================================"

# Check for Python
if command -v python3 &> /dev/null; then
    echo "✅ Using Python 3 server"
    echo "🌐 Local URL: http://localhost:8000"
    echo "📱 Mobile URL: http://$(ipconfig getifaddr en0 2>/dev/null || hostname -I | awk '{print $1}' 2>/dev/null):8000"
    echo ""
    echo "💡 Tips:"
    echo "   • Test PWA features require HTTPS in production"
    echo "   • Use browser dev tools to simulate mobile"
    echo "   • Check 'Application' tab for service worker status"
    echo ""
    echo "🛑 Press Ctrl+C to stop server"
    echo "============================================"
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ Using Python 2 server"
    echo "🌐 Local URL: http://localhost:8000"
    python -m SimpleHTTPServer 8000
else
    echo "❌ Python not found. Please install Python to run local server."
    exit 1
fi
