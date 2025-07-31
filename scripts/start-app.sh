#!/bin/bash

# Start script for 16BitFit App
echo "🚀 Starting 16BitFit App..."

# Check if Metro is running
if ! lsof -i :8081 > /dev/null; then
    echo "⚠️  Metro bundler is not running. Start it first with: npx react-native start --reset-cache"
    exit 1
fi

echo "✅ Metro bundler is running"

# Ask which platform
echo ""
echo "Which platform would you like to run?"
echo "1) iOS"
echo "2) Android"
echo "3) Both"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "📱 Starting iOS app..."
        npx react-native run-ios
        ;;
    2)
        echo "🤖 Starting Android app..."
        npx react-native run-android
        ;;
    3)
        echo "📱🤖 Starting both platforms..."
        npx react-native run-ios &
        npx react-native run-android
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac