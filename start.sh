#!/bin/bash
echo "Frontend is Starting..."
cd "$(dirname "$0")/frontend"

read -p "Enter frontend port number (default 3000): " FE_PORT
FE_PORT=${FE_PORT:-3000}

echo "Backend is starting..."
cd "$(dirname "$0")/backend"
nohup python manage.py runserver 0.0.0.0:8003 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started on 0.0.0.0:8003. PID: $BACKEND_PID"

cd "$(dirname "$0")/frontend"
nohup npm run dev -- --port $FE_PORT > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started on port $FE_PORT. PID: $FRONTEND_PID"

echo "All services started!"
