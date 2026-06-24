#!/bin/bash
kill $(lsof -ti:8081) 2>/dev/null
EXPO_UNSTABLE_HEADLESS=1 npx expo start --dev-client --tunnel
