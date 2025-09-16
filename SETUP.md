# Music Video Creator - セットアップガイド

## 最も簡単なセットアップ（推奨）

### 必要なもの
- PHP 7.4以上
- Webブラウザ

### ステップ1: PHPのインストール確認

```bash
php --version
```

PHPがインストールされていない場合：

**Mac:**
```bash
# Homebrewを使用
brew install php

# または公式インストーラー
# https://www.php.net/downloads.php
```

**Windows:**
```bash
# Chocolateyを使用（推奨）
choco install php

# または公式サイトからダウンロード
# https://www.php.net/downloads.php
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install php php-json php-mbstring php-fileinfo
```

### ステップ2: アプリケーションの起動

```bash
# 1. プロジェクトディレクトリに移動
cd music-video-creator/public

# 2. PHPサーバーを起動
php -S localhost:8000

# 3. ブラウザで http://localhost:8000 にアクセス
```

**これだけで完了です！**

## 代替方法（XAMPP/MAMPを使用）

### Windows - XAMPPを使用

1. **XAMPPのダウンロード・インストール**
   ```
   https://www.apachefriends.org/jp/index.html
   ```

2. **プロジェクトファイルの配置**
   - `music-video-creator` フォルダを `C:\xampp\htdocs\` にコピー

3. **XAMPPの起動**
   - XAMPPコントロールパネルを起動
   - 「Apache」の「Start」ボタンをクリック

4. **アプリケーションの起動**
   - ブラウザで `http://localhost/music-video-creator/public/` にアクセス

### Mac - MAMPを使用

1. **MAMPのダウンロード・インストール**
   ```
   https://www.mamp.info/en/downloads/
   ```

2. **プロジェクトファイルの配置**
   - `music-video-creator` フォルダを `/Applications/MAMP/htdocs/` にコピー

3. **MAMPの起動**
   - MAMPアプリケーションを起動
   - 「Start Servers」をクリック

4. **アプリケーションの起動**
   - ブラウザで `http://localhost:8888/music-video-creator/public/` にアクセス

## 詳細セットアップ

### システム要件の確認

#### 必須要件
- PHP 7.4 以上
- Webサーバー（Apache, Nginx, または PHP内蔵サーバー）
- モダンWebブラウザ

#### PHP拡張機能の確認
以下の拡張機能が有効になっていることを確認してください：

```bash
php -m | grep -E "(json|fileinfo|mbstring)"
```

必要な拡張機能：
- `json` - JSONデータの処理
- `fileinfo` - ファイル形式の判定
- `mbstring` - 日本語文字列の処理

### ディレクトリ権限の設定

#### Linux/Mac の場合

```bash
# プロジェクトディレクトリに移動
cd music-video-creator

# データディレクトリの権限設定
chmod 755 data/
chmod 755 data/projects/

# 必要に応じて所有者を変更
sudo chown -R www-data:www-data data/
```

#### Windows の場合

1. `data` フォルダを右クリック
2. 「プロパティ」→「セキュリティ」タブ
3. 「編集」→「追加」
4. 「Everyone」を追加し、「フルコントロール」を許可

### Webサーバーの設定

#### Apache の場合

`.htaccess` ファイルが `public/` ディレクトリに配置されていることを確認：

```apache
# public/.htaccess
RewriteEngine On

# APIリクエストの処理
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ api/$1 [L]

# 静的ファイルの処理
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.*)$ index.php [QSA,L]
```

#### Nginx の場合

```nginx
server {
    listen 80;
    server_name localhost;
    root /path/to/music-video-creator/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

## 初期設定の確認

### 1. アプリケーションの動作確認

ブラウザでアプリケーションにアクセスし、以下を確認：

1. **メインページの表示**
   - プロジェクト一覧が表示される
   - 「新規プロジェクト」ボタンが表示される

2. **プロジェクト作成のテスト**
   - 「新規プロジェクト」をクリック
   - 楽曲名と備考を入力して作成
   - プロジェクト一覧に追加されることを確認

3. **ファイルアップロードのテスト**
   - 作成したプロジェクトを選択
   - 「メディアライブラリ」を開く
   - 画像ファイルをドラッグ&ドロップ
   - アップロードが成功することを確認

### 2. データディレクトリの確認

正常にセットアップされている場合、以下のディレクトリ構造が作成されます：

```
music-video-creator/
├── data/
│   ├── projects.json          # 作成される
│   └── projects/              # プロジェクト作成時に作成される
│       └── proj_xxxxx/
│           ├── config.json
│           ├── scenes.json
│           └── media/
│               ├── images/
│               └── videos/
```

## トラブルシューティング

### セットアップ時の一般的な問題

#### 1. "Permission denied" エラー

**症状**: ファイルの作成・保存ができない

**解決方法**:
```bash
# Linux/Mac
chmod -R 755 music-video-creator/data/
chown -R www-data:www-data music-video-creator/data/

# Windows
# データフォルダの権限を「Everyone」に「フルコントロール」で設定
```

#### 2. "500 Internal Server Error"

**症状**: アプリケーションにアクセスできない

**解決方法**:
1. PHPのエラーログを確認
2. `.htaccess` ファイルの構文を確認
3. PHP拡張機能が有効か確認

```bash
# エラーログの確認（Linux/Mac）
tail -f /var/log/apache2/error.log

# Windows（XAMPP）
# C:\xampp\apache\logs\error.log を確認
```

#### 3. "404 Not Found" エラー

**症状**: APIエンドポイントにアクセスできない

**解決方法**:
1. `.htaccess` ファイルが正しく配置されているか確認
2. Apache の `mod_rewrite` が有効か確認
3. URLが正しいか確認

```bash
# mod_rewriteの確認
apache2ctl -M | grep rewrite
```

#### 4. 日本語文字が文字化けする

**症状**: 日本語の入力・表示が正しくない

**解決方法**:
1. PHP の `mbstring` 拡張機能を有効化
2. ファイルの文字エンコーディングをUTF-8に設定

```bash
# mbstringの確認
php -m | grep mbstring
```

### パフォーマンスの最適化

#### PHP設定の調整

`php.ini` ファイルで以下の設定を調整：

```ini
# ファイルアップロードサイズの制限
upload_max_filesize = 100M
post_max_size = 100M
max_execution_time = 300

# メモリ制限
memory_limit = 256M

# 日本語処理
mbstring.language = Japanese
mbstring.internal_encoding = UTF-8
```

#### Apache設定の調整

```apache
# .htaccess または httpd.conf
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

## セキュリティ設定

### 本番環境での注意事項

このアプリケーションはローカル環境での使用を前提としていますが、本番環境で使用する場合は以下の設定を行ってください：

#### 1. ディレクトリアクセスの制限

```apache
# .htaccess
<Files "*.json">
    Order allow,deny
    Deny from all
</Files>

<Directory "data/">
    Order allow,deny
    Deny from all
</Directory>
```

#### 2. PHPエラー表示の無効化

```php
# config.php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);
```

#### 3. HTTPS の使用

```apache
# .htaccess
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## 開発環境のセットアップ

### 開発者向け追加設定

#### 1. デバッグモードの有効化

`public/index.php` でデバッグモードを有効化：

```php
// デバッグモード（開発時のみ）
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

#### 2. ログ出力の設定

```php
// ログファイルの設定
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');
```

#### 3. 開発用ツールの導入

```bash
# Composer（依存関係管理）
curl -sS https://getcomposer.org/installer | php
php composer.phar install

# PHPUnit（テスト）
./vendor/bin/phpunit tests/
```

---

**注意**: このセットアップガイドは基本的な設定を説明しています。特定の環境や要件に応じて、追加の設定が必要な場合があります。