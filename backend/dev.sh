#!/bin/bash
# Script khởi động Backend Server thông minh
cd "$(dirname "$0")"

# Kiểm tra nếu chưa có node_modules thì tự cài đặt
if [ ! -d "node_modules" ]; then
    echo "📦 Đang cài đặt thư viện cho Backend (lần đầu)..."
    # Thử dùng đường dẫn trực tiếp của npm từ Homebrew
    /opt/homebrew/bin/npm install
    
    # Nếu lệnh trên thất bại, thử dùng npm mặc định
    if [ $? -ne 0 ]; then
        npm install
    fi
fi

echo "🚀 Khởi động Personal Calendar Backend (Port 5000)..."
node --watch src/server.js
