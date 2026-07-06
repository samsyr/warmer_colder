#!/bin/bash
# Start the Expo dev server. Every CLI argument is forwarded to `expo start`,
# e.g. ./script/start.sh --go
#      ./script/start.sh --tunnel --clear
#      ./script/start.sh --ios
exec npx expo start "$@"
