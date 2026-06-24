#!/bin/bash
# Kill Metro bundler port
kill $(lsof -ti:8081) 2>/dev/null

# Kill expo/node processes
pkill -f "expo start" 2>/dev/null
pkill -f "metro" 2>/dev/null

# Kill ngrok tunnel
pkill -f "ngrok" 2>/dev/null

echo "Done."
