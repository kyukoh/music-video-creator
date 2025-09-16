# Music Video Creator - クイックスタートガイド

## 5分で始める！

### 必要なもの
- PHP（多くのコンピューターに既にインストール済み）
- Webブラウザ

### ステップ1: PHPの確認

ターミナル（コマンドプロンプト）を開いて以下を実行：

```bash
php --version
```

**結果例:**
```
PHP 8.1.0 (cli) (built: Nov 25 2021 23:21:43) ( NTS )
```

PHPがインストールされていない場合は、[こちら](#phpのインストール)を参照してください。

### ステップ2: アプリケーションの起動

```bash
# 1. プロジェクトフォルダに移動
cd music-video-creator/public

# 2. サーバーを起動
php -S localhost:8000
```

**成功メッセージ:**
```
PHP 8.1.0 Development Server (http://localhost:8000) started
```

### ステップ3: ブラウザでアクセス

ブラウザで以下のURLを開く：
```
http://localhost:8000
```

**完了！** Music Video Creatorが起動します。

## 最初の使い方

### 1. プロジェクトを作成

1. 「新規プロジェクト」ボタンをクリック
2. 楽曲名を入力（例：「夏の思い出」）
3. 備考を入力（例：「青春ポップソング」）
4. 「作成」ボタンをクリック

### 2. シーンを追加

1. 「シーン追加」ボタンをクリック
2. 各フィールドをクリックして編集：
   - **開始時間**: `0:00`
   - **歌詞**: `青い空に響く笑い声`
   - **シーン説明**: `海辺で友達と遊ぶシーン`
   - **英語プロンプト**: `Friends playing on sunny beach`

### 3. メディアファイルをアップロード

1. 「メディアライブラリ」ボタンをクリック
2. 画像や動画ファイルをドラッグ&ドロップ
3. ファイルが自動的にアップロードされます

## PHPのインストール

### Mac
```bash
# Homebrewを使用（推奨）
brew install php

# 確認
php --version
```

### Windows

**方法1: Chocolateyを使用（推奨）**
```bash
# 管理者権限でコマンドプロンプトを開く
choco install php

# 確認
php --version
```

**方法2: 公式サイトからダウンロード**
1. https://www.php.net/downloads.php にアクセス
2. Windows版をダウンロード
3. インストール後、環境変数PATHに追加

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install php php-json php-mbstring php-fileinfo

# 確認
php --version
```

## トラブルシューティング

### 「php: command not found」エラー

**原因**: PHPがインストールされていない、またはPATHが設定されていない

**解決方法**:
1. 上記の方法でPHPをインストール
2. ターミナルを再起動
3. `php --version` で確認

### 「Permission denied」エラー

**原因**: ディレクトリの権限が不足

**解決方法**:
```bash
# Mac/Linux
chmod 755 music-video-creator/data/

# Windows
# フォルダを右クリック → プロパティ → セキュリティ → 編集 → Everyone に フルコントロール を許可
```

### ブラウザで「このサイトにアクセスできません」

**原因**: サーバーが起動していない

**解決方法**:
1. ターミナルでサーバーが起動しているか確認
2. `Ctrl+C` でサーバーを停止後、再起動
3. URLが `http://localhost:8000` であることを確認

### ポート8000が使用中の場合

```bash
# 別のポートを使用
php -S localhost:8080

# ブラウザで http://localhost:8080 にアクセス
```

## 次のステップ

1. **詳細な使い方**: `README.md` を参照
2. **高度な設定**: `SETUP.md` を参照
3. **使用例**: `EXAMPLES.md` を参照

## よくある質問

**Q: サーバーを停止するには？**
A: ターミナルで `Ctrl+C` を押す

**Q: 他のコンピューターからアクセスできる？**
A: `php -S 0.0.0.0:8000` で起動すると、同じネットワーク内からアクセス可能

**Q: データはどこに保存される？**
A: `music-video-creator/data/` フォルダに保存されます

**Q: バックアップは必要？**
A: `data/` フォルダをコピーするだけでバックアップ完了

---

**これで準備完了です！** 楽しいミュージックビデオ制作を始めましょう！