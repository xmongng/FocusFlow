#!/bin/bash
# Script khởi động dev server (dùng thay cho "npm run dev" khi npm bị lỗi)
cd "$(dirname "$0")"
echo "🚀 Starting Personal Calendar Dev Server..."
./node_modules/.bin/vite "$@"
