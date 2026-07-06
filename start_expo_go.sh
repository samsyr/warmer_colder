#!/bin/bash
# Convenience wrapper: start the Expo dev server targeting Expo Go.
# Any extra args are forwarded alongside --go.
exec "$(dirname "$0")/script/start.sh" --go "$@"
