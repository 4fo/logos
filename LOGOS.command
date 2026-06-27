#!/bin/bash
cd "$(dirname "$0")"

echo "==================================="
echo "  LOGOS — KJV Bible Search (V2)"
echo "==================================="
echo ""

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
  echo ""
fi

echo "Starting dev server..."
npm run dev &
VITE_PID=$!

for i in $(seq 1 30); do
  if curl -s http://localhost:5173 > /dev/null 2>&1; then
    open http://localhost:5173
    break
  fi
  sleep 0.5
done

echo ""
echo "Press Ctrl+C to stop the server."
wait $VITE_PID
