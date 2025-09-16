# 設計書

## 概要

ミュージックビデオ作成サポートツールは、ローカル環境で動作するWebアプリケーションです。PHPバックエンドとHTML/TailwindCSS/JavaScriptフロントエンドで構築され、データベースを使用せずにファイルベースでデータを管理します。プロジェクトごとにシーンを管理し、メディアライブラリを通じて画像・動画ファイルを効率的に扱います。

## アーキテクチャ

### システム構成

```
┌─────────────────────────────────────────┐
│              フロントエンド              │
│    HTML + TailwindCSS + JavaScript      │
├─────────────────────────────────────────┤
│               バックエンド               │
│                  PHP                    │
├─────────────────────────────────────────┤
│              データストレージ            │
│        ファイルシステム + JSON          │
└─────────────────────────────────────────┘
```

### ディレクトリ構造

```
music-video-creator/
├── public/                     # Webルート
│   ├── index.php              # メインエントリーポイント
│   ├── assets/                # 静的ファイル
│   │   ├── css/
│   │   └── js/
│   └── api/                   # API エンドポイント
│       ├── projects.php
│       ├── scenes.php
│       └── media.php
├── data/                      # データストレージ
│   ├── projects.json          # プロジェクト一覧
│   └── projects/              # プロジェクトデータ
│       └── {project_id}/
│           ├── config.json    # プロジェクト設定
│           ├── scenes.json    # シーンデータ
│           └── media/         # メディアファイル
├── src/                       # PHPクラス
│   ├── Project.php
│   ├── Scene.php
│   └── MediaLibrary.php
└── templates/                 # HTMLテンプレート
    ├── layout.php
    ├── project-list.php
    ├── scene-list.php
    └── media-library.php
```

## コンポーネントと インターフェース

### 1. フロントエンドコンポーネント

#### ProjectManager
- **責任**: プロジェクト一覧の表示・管理
- **機能**: 
  - プロジェクト作成・削除
  - プロジェクト選択・編集
  - サイドメニュー表示

#### SceneManager  
- **責任**: シーン一覧の表示・編集
- **機能**:
  - シーン追加・削除・並び替え
  - インライン編集（開始時間、歌詞、説明、プロンプト）
  - シーンファイルアップロード（テキスト/Excel）

#### MediaLibrary
- **責任**: メディアファイルの管理
- **機能**:
  - ドラッグ&ドロップアップロード
  - ファイル一覧表示・フィルタリング
  - ファイル選択・削除

#### SceneEditor
- **責任**: シーン詳細編集
- **機能**:
  - 画像・動画生成プロンプト編集
  - メディアライブラリからのファイル選択

### 2. バックエンドクラス

#### Project クラス
```php
class Project {
    private string $id;
    private string $name;
    private string $notes;
    private array $scenes;
    
    public function create(string $name, string $notes): string
    public function update(array $data): bool
    public function delete(): bool
    public function getScenes(): array
    public function addScene(Scene $scene): bool
}
```

#### Scene クラス
```php
class Scene {
    private string $id;
    private string $startTime;
    private string $lyrics;
    private string $description;
    private string $imagePrompt;
    private string $videoPrompt;
    private ?string $imageFileId;
    private ?string $videoFileId;
    
    public function save(): bool
    public function update(array $data): bool
    public function setMediaFile(string $type, string $fileId): bool
}
```

#### MediaLibrary クラス
```php
class MediaLibrary {
    private string $projectId;
    private string $mediaPath;
    
    public function uploadFile(array $file): string
    public function getFiles(string $filter = 'all'): array
    public function deleteFile(string $fileId): bool
    public function getFileInfo(string $fileId): array
}
```

### 3. API エンドポイント

#### /api/projects.php
- `GET /api/projects.php` - プロジェクト一覧取得
- `POST /api/projects.php` - プロジェクト作成
- `PUT /api/projects.php?id={id}` - プロジェクト更新
- `DELETE /api/projects.php?id={id}` - プロジェクト削除

#### /api/scenes.php
- `GET /api/scenes.php?project_id={id}` - シーン一覧取得
- `POST /api/scenes.php` - シーン作成
- `PUT /api/scenes.php?id={id}` - シーン更新
- `DELETE /api/scenes.php?id={id}` - シーン削除
- `POST /api/scenes.php/upload` - シーンファイルアップロード

#### /api/media.php
- `GET /api/media.php?project_id={id}&filter={type}` - メディア一覧取得
- `POST /api/media.php` - ファイルアップロード
- `DELETE /api/media.php?file_id={id}` - ファイル削除

## データモデル

### プロジェクトデータ構造

#### projects.json
```json
{
  "projects": [
    {
      "id": "proj_001",
      "name": "楽曲名",
      "notes": "備考",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### projects/{project_id}/config.json
```json
{
  "id": "proj_001",
  "name": "楽曲名",
  "notes": "備考",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

#### projects/{project_id}/scenes.json
```json
{
  "scenes": [
    {
      "id": "scene_001",
      "order": 1,
      "start_time": "0:00",
      "lyrics": "歌詞テキスト",
      "description": "シーン説明",
      "image_prompt": "画像生成プロンプト",
      "video_prompt": "動画生成プロンプト",
      "image_file_id": "img_001.jpg",
      "video_file_id": "vid_001.mp4",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### メディアファイル管理

#### ファイル命名規則
- 画像: `img_{timestamp}_{original_name}`
- 動画: `vid_{timestamp}_{original_name}`
- ファイルID: ファイル名をそのまま使用

#### メディアディレクトリ構造
```
data/projects/{project_id}/media/
├── images/
│   ├── img_20250101000000_sample.jpg
│   └── img_20250101000001_background.png
└── videos/
    ├── vid_20250101000000_scene1.mp4
    └── vid_20250101000001_scene2.mp4
```

## エラーハンドリング

### フロントエンド
- API通信エラーの表示
- ファイルアップロードエラーの処理
- バリデーションエラーの表示

### バックエンド
- ファイル操作エラーの処理
- JSON解析エラーの処理
- 不正なリクエストの処理

### エラーレスポンス形式
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ"
  }
}
```

## テスト戦略

### 単体テスト
- PHPクラスの各メソッドテスト
- JavaScriptコンポーネントのテスト

### 統合テスト
- API エンドポイントのテスト
- ファイルアップロード機能のテスト

### E2Eテスト
- プロジェクト作成から削除までの一連の流れ
- シーン管理の基本操作
- メディアライブラリの操作

## セキュリティ考慮事項

### ファイルアップロード
- 許可する拡張子の制限（画像: jpg, png, gif / 動画: mp4, mov, avi）
- ファイルサイズ制限
- ファイル名のサニタイズ

### データ保護
- ディレクトリトラバーサル攻撃の防止
- 不正なファイルアクセスの防止
- XSS攻撃の防止（入力値のエスケープ）

### ローカル環境での制約
- 認証機能なし（ローカル使用前提）
- HTTPS不要（ローカル環境）
- CORS設定不要（同一オリジン）