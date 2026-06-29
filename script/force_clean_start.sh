#!/bin/bash
set -e
cd "$(dirname "$0")/.."   # repo root (script lives in script/)

echo "==> Killing running servers..."

# Kill processes on Expo/Metro ports
for port in 8081 19000 19001 19002; do
  lsof -ti:"$port" | xargs kill -9 2>/dev/null || true
done

# Kill expo/metro/ngrok processes by name
pkill -9 -f "expo start"   2>/dev/null || true
pkill -9 -f "metro"        2>/dev/null || true
pkill -9 -f "ngrok"        2>/dev/null || true
pkill -9 -f "react-native" 2>/dev/null || true

# Clear watchman state so Metro doesn't get stale file-watch data
if command -v watchman &>/dev/null; then
  watchman watch-del-all 2>/dev/null || true
fi

echo "==> Wiping dependencies and caches..."
rm -rf node_modules
rm -rf .expo
npm cache clean --force

echo "==> Installing dependencies..."
npm install
npx expo install --fix

echo "==> Starting..."
# Forwards any args to expo start (e.g. pass --go for Expo Go).
exec ./script/start.sh "$@"
