#!/bin/bash

# Music Video Creator - 起動スクリプト

echo "🎵 Music Video Creator を起動しています..."
echo ""

# PHPのバージョン確認
if ! command -v php &> /dev/null; then
    echo "❌ PHPがインストールされていません。"
    echo ""
    echo "インストール方法:"
    echo "Mac: brew install php"
    echo "Ubuntu: sudo apt install php"
    echo "Windows: choco install php"
    echo ""
    exit 1
fi

echo "✅ PHP $(php --version | head -n 1 | cut -d ' ' -f 2) が見つかりました"

# データディレクトリの作成
if [ ! -d "data" ]; then
    echo "📁 データディレクトリを作成しています..."
    mkdir -p data/projects
    chmod 755 data
    chmod 755 data/projects
fi

# publicディレクトリに移動
cd public

echo "🚀 サーバーを起動しています..."
echo ""
echo "ブラウザで以下のURLにアクセスしてください:"
echo "👉 http://localhost:8000"
echo ""
echo "停止するには Ctrl+C を押してください"
echo ""

# PHPサーバーを起動
php -S localhost:8000