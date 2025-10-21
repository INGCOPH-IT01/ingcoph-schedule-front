#!/bin/bash

# Laravel Reverb Quick Fix Script
# This script creates the necessary .env file for frontend

echo "🔧 Laravel Reverb Quick Fix"
echo "============================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the frontend root directory"
    exit 1
fi

# Create .env file
echo "📝 Creating .env file..."
cat > .env.local << 'EOF'
# Laravel Echo / Reverb Configuration
# For local development

# Reverb App Credentials (must match backend)
VITE_REVERB_APP_KEY=kx677b9udp95kpffwpcg
VITE_REVERB_APP_ID=460626

# Local Development
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http

# API Base URL
VITE_API_BASE_URL=http://localhost:8010
EOF

if [ -f ".env.local" ]; then
    echo "✅ .env.local file created successfully!"
else
    echo "⚠️  Could not create .env.local, trying .env instead..."
    cat > .env << 'EOF'
# Laravel Echo / Reverb Configuration
# For local development

# Reverb App Credentials (must match backend)
VITE_REVERB_APP_KEY=kx677b9udp95kpffwpcg
VITE_REVERB_APP_ID=460626

# Local Development
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http

# API Base URL
VITE_API_BASE_URL=http://localhost:8010
EOF

    if [ -f ".env" ]; then
        echo "✅ .env file created successfully!"
    else
        echo "❌ Failed to create environment file"
        exit 1
    fi
fi

echo ""
echo "📋 Checking backend services..."
echo ""

# Check if Reverb is running
if pgrep -f "artisan reverb:start" > /dev/null; then
    echo "✅ Reverb server is running"
else
    echo "⚠️  Reverb server is NOT running!"
    echo "   Start it with: cd ../ingcoph-schedule-back && php artisan reverb:start"
fi

# Check if queue worker is running
if pgrep -f "queue:work" > /dev/null; then
    echo "✅ Queue worker is running"
else
    echo "⚠️  Queue worker is NOT running!"
    echo "   Start it with: cd ../ingcoph-schedule-back && php artisan queue:work"
fi

echo ""
echo "🎉 Configuration Complete!"
echo ""
echo "Next steps:"
echo "1. Restart your dev server (npm run dev)"
echo "2. Login to your application"
echo "3. Open browser console (F12)"
echo "4. Look for: '✅ Reverb: Connected successfully'"
echo ""
echo "📖 For detailed troubleshooting, see REVERB_SETUP.md"
echo ""
