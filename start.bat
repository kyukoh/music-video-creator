@echo off
chcp 65001 >nul

echo 🎵 Music Video Creator を起動しています...
echo.

REM PHPのバージョン確認
php --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PHPがインストールされていません。
    echo.
    echo インストール方法:
    echo Windows: choco install php
    echo または https://www.php.net/downloads.php からダウンロード
    echo.
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('php --version ^| findstr /r "^PHP"') do (
    echo ✅ PHP %%i が見つかりました
    goto :found
)
:found

REM データディレクトリの作成
if not exist "data" (
    echo 📁 データディレクトリを作成しています...
    mkdir data\projects
)

REM publicディレクトリに移動
cd public

echo 🚀 サーバーを起動しています...
echo.
echo ブラウザで以下のURLにアクセスしてください:
echo 👉 http://localhost:8000
echo.
echo 停止するには Ctrl+C を押してください
echo.

REM PHPサーバーを起動
php -S localhost:8000