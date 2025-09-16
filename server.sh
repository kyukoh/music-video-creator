#!/bin/bash

# Music Video Creator - Development Server

PORT=${1:-8080}

echo "Starting Music Video Creator server on port $PORT..."
echo "Access the application at: http://localhost:$PORT"
echo "Press Ctrl+C to stop the server"
echo ""

# Start PHP built-in server with custom php.ini
cd public
php -c php.ini -S localhost:$PORT