#!/bin/bash
# Build and serve the STATIC web export for manual testing in a browser.
#
# Why not `expo start --web`? The dev server's bundle uses eval() for
# fast-refresh (HMR) and lazy module loading. Browsers/extensions that enforce a
# strict Content-Security-Policy (no 'unsafe-eval') block that. This production
# export has no HMR and no lazy loading, so it runs eval-free under any CSP.
#
# Trade-off: no fast refresh. Re-run this script after changing code.
#
# Usage: ./serve_web.sh [port]   (default port 8080)
set -e
cd "$(dirname "$0")"

PORT="${1:-8080}"

echo "==> Exporting web build to dist/ ..."
npx expo export -p web

echo "==> Serving dist/ at http://localhost:${PORT}  (Ctrl+C to stop)"
exec npx expo serve --port "${PORT}"
