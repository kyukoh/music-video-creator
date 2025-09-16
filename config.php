<?php
/**
 * Music Video Creator - Configuration File
 * アプリケーション全体の設定を管理
 */

// アプリケーション設定
define('APP_NAME', 'Music Video Creator');
define('APP_VERSION', '1.0.0');
define('APP_DEBUG', true);

// ディレクトリパス設定
define('PROJECT_ROOT', __DIR__);
define('PUBLIC_DIR', PROJECT_ROOT . '/public');
define('DATA_DIR', PROJECT_ROOT . '/data');
define('SRC_DIR', PROJECT_ROOT . '/src');
define('TEMPLATES_DIR', PROJECT_ROOT . '/templates');

// データベース設定（ファイルベース）
define('PROJECTS_FILE', DATA_DIR . '/projects.json');
define('PROJECTS_DIR', DATA_DIR . '/projects');

// ファイルアップロード設定
define('MAX_FILE_SIZE', 100 * 1024 * 1024); // 100MB
define('ALLOWED_IMAGE_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif']);
define('ALLOWED_VIDEO_EXTENSIONS', ['mp4', 'mov', 'avi']);

// セキュリティ設定
define('UPLOAD_PATH_VALIDATION', true);
define('FILE_NAME_SANITIZATION', true);

// エラーハンドリング設定
if (APP_DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// 文字エンコーディング設定
ini_set('default_charset', 'UTF-8');
mb_internal_encoding('UTF-8');

// タイムゾーン設定
date_default_timezone_set('Asia/Tokyo');

// JSON設定
define('JSON_OPTIONS', JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

/**
 * ディレクトリ初期化関数
 */
function initializeDirectories() {
    $directories = [
        DATA_DIR,
        PROJECTS_DIR,
        PUBLIC_DIR . '/uploads'
    ];
    
    foreach ($directories as $dir) {
        if (!file_exists($dir)) {
            mkdir($dir, 0755, true);
        }
    }
    
    // プロジェクト一覧ファイルの初期化
    if (!file_exists(PROJECTS_FILE)) {
        file_put_contents(PROJECTS_FILE, json_encode(['projects' => []], JSON_OPTIONS));
    }
}

/**
 * オートローダー設定
 */
spl_autoload_register(function ($class) {
    $file = SRC_DIR . '/' . $class . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

// 初期化実行
initializeDirectories();