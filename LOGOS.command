#!/bin/bash
cd "$(dirname "$0")"
echo "==============================================="
echo "  LOGOS — Classical Letterpress KJV Bible"
echo "==============================================="
echo ""

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
  echo ""
fi

echo "Starting dev server..."
echo "Open the URL shown below in your browser."
echo "Press Ctrl+C to stop."
echo ""
npm run dev
