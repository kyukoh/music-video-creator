<?php
/**
 * Music Video Creator - Main Entry Point
 * ローカル環境で動作するミュージックビデオ作成サポートツール
 */

// エラー表示設定（開発環境用）
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 文字エンコーディング設定
ini_set('default_charset', 'UTF-8');
mb_internal_encoding('UTF-8');

// タイムゾーン設定
date_default_timezone_set('Asia/Tokyo');

// プロジェクトルートパスの設定
define('PROJECT_ROOT', dirname(__DIR__));
define('DATA_DIR', PROJECT_ROOT . '/data');
define('SRC_DIR', PROJECT_ROOT . '/src');
define('TEMPLATES_DIR', PROJECT_ROOT . '/templates');

// オートローダーの設定
spl_autoload_register(function ($class) {
    $file = SRC_DIR . '/' . $class . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

// データディレクトリの初期化
if (!file_exists(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

if (!file_exists(DATA_DIR . '/projects')) {
    mkdir(DATA_DIR . '/projects', 0755, true);
}

// プロジェクト一覧ファイルの初期化
$projectsFile = DATA_DIR . '/projects.json';
if (!file_exists($projectsFile)) {
    file_put_contents($projectsFile, json_encode(['projects' => []], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// メインページの表示
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Video Creator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="assets/css/style.css">
    <script>
        // TailwindCSS カスタム設定
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: '#eff6ff',
                            100: '#dbeafe',
                            500: '#3b82f6',
                            600: '#2563eb',
                            700: '#1d4ed8'
                        }
                    },
                    animation: {
                        'fade-in': 'fadeIn 0.3s ease-in-out',
                        'slide-up': 'slideUp 0.3s ease-out',
                        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    },
                    keyframes: {
                        fadeIn: {
                            '0%': { opacity: '0' },
                            '100%': { opacity: '1' }
                        },
                        slideUp: {
                            '0%': { transform: 'translateY(10px)', opacity: '0' },
                            '100%': { transform: 'translateY(0)', opacity: '1' }
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50 min-h-screen font-sans antialiased">
    <!-- メインコンテナ -->
    <div class="flex h-screen overflow-hidden">
        <!-- サイドバー -->
        <div id="sidebar" class="w-64 bg-white shadow-xl border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out lg:w-64 md:w-64 sm:w-0 sm:overflow-hidden">
            <!-- サイドバーヘッダー -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-primary-600">
                <h1 class="text-xl font-bold text-white truncate">Music Video Creator</h1>
                <button id="sidebar-toggle" class="lg:hidden md:hidden sm:block text-white hover:text-gray-200 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <!-- プロジェクト管理セクション -->
            <div class="flex-1 overflow-y-auto">
                <div class="p-4">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">プロジェクト</h2>
                        <button id="new-project-btn" class="inline-flex items-center px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            新規
                        </button>
                    </div>
                    
                    <!-- インポート/エクスポートボタン -->
                    <div class="flex space-x-2 mb-4">
                        <button id="import-project-btn" class="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            インポート
                        </button>
                        <button id="export-project-btn" class="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                            </svg>
                            エクスポート
                        </button>
                    </div>
                    <div id="project-list" class="space-y-2">
                        <!-- プロジェクト一覧がここに表示される -->
                        <div class="text-center text-gray-400 py-8">
                            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                            <p class="text-sm">プロジェクトがありません</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- メインコンテンツエリア -->
        <div class="flex-1 flex flex-col min-w-0">
            <!-- ヘッダー -->
            <header class="bg-white shadow-sm border-b border-gray-200">
                <div class="flex items-center justify-between px-6 py-4">
                    <div class="flex items-center">
                        <button id="mobile-menu-btn" class="lg:hidden md:hidden sm:block mr-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                        <h2 id="page-title" class="text-xl font-semibold text-gray-800">プロジェクトを選択してください</h2>
                    </div>
                    <div class="flex items-center space-x-3">
                        <!-- ステータスインジケーター -->
                        <div id="status-indicator" class="hidden items-center text-sm text-gray-500">
                            <div class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                            <span>準備完了</span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- メインコンテンツ -->
            <main id="main-content" class="flex-1 overflow-y-auto bg-gray-50">
                <div class="p-6">
                    <!-- ウェルカムメッセージ -->
                    <div id="welcome-screen" class="text-center py-20">
                        <div class="max-w-md mx-auto">
                            <div class="mb-8">
                                <svg class="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <h3 class="text-2xl font-semibold text-gray-800 mb-4">ミュージックビデオ作成ツール</h3>
                            <p class="text-gray-600 mb-8 leading-relaxed">
                                左のメニューからプロジェクトを選択するか、<br>
                                新しいプロジェクトを作成して始めましょう。
                            </p>
                            <button id="get-started-btn" class="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                新しいプロジェクトを作成
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <!-- モーダル・オーバーレイ用コンテナ -->
    <div id="modal-container" class="hidden fixed inset-0 z-50 overflow-y-auto">
        <!-- モーダルコンテンツがここに動的に挿入される -->
    </div>

    <!-- 通知コンテナ -->
    <div id="notification-container" class="fixed bottom-4 left-4 z-40 space-y-2 max-w-md" style="max-height: 200px;">
        <!-- 通知メッセージがここに表示される -->
    </div>

    <!-- ローディングオーバーレイ -->
    <div id="loading-overlay" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
            <svg class="animate-spin w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-700 font-medium">読み込み中...</span>
        </div>
    </div>

    <!-- JavaScript -->
    <script src="assets/js/app.js"></script>
</body>
</html>