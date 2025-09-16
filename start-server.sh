#!/bin/bash

# Music Video Creator - Development Server with Proper Settings

PORT=${1:-8080}

echo "Starting Music Video Creator server on port $PORT..."
echo "Access the application at: http://localhost:$PORT"
echo "Press Ctrl+C to stop the server"
echo ""
echo "PHP Upload Settings:"
echo "  - Max file size: 100MB"
echo "  - Max POST size: 100MB"
echo ""

# Start PHP built-in server with custom settings
cd public
php -d upload_max_filesize=100M \
    -d post_max_size=100M \
    -d max_execution_time=300 \
    -d max_input_time=300 \
    -d memory_limit=256M \
    -d error_reporting=E_ALL \
    -d display_errors=On \
    -S localhost:$PORT