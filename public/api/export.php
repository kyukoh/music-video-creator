<?php
/**
 * プロジェクトエクスポート API
 * プロジェクトデータとメディアファイルをZIPアーカイブとしてエクスポート
 */

require_once '../../config.php';
require_once '../../src/Project.php';
require_once '../../src/Scene.php';

// OPTIONSリクエストの処理
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET");
    header("Access-Control-Allow-Headers: Content-Type");
    exit;
}

/**
 * プロジェクトデータをZIPファイルとしてエクスポート
 */
function exportProject($projectId) {
    try {
        $project = Project::load($projectId);
        $projectData = $project ? $project->toArray() : null;
        
        if (!$projectData) {
            throw new Exception('プロジェクトが見つかりません');
        }
        
        $projectDir = PROJECTS_DIR . '/' . $projectId;
        if (!file_exists($projectDir)) {
            throw new Exception('プロジェクトディレクトリが見つかりません');
        }
        
        // 一時ファイル名を生成
        $tempFile = sys_get_temp_dir() . '/project_' . $projectId . '_' . date('YmdHis') . '.zip';
        
        // ZipArchiveクラスの存在確認
        if (!class_exists('ZipArchive')) {
            throw new Exception('ZipArchive拡張が有効になっていません。PHPのzip拡張をインストールしてください。');
        }
        
        $zip = new ZipArchive();
        $result = $zip->open($tempFile, ZipArchive::CREATE);
        if ($result !== TRUE) {
            throw new Exception('ZIPファイルの作成に失敗しました');
        }
        
        // プロジェクトフォルダ名
        $projectFolderName = basename($projectId);
        
        // プロジェクトメタデータを追加
        $metadata = [
            'exported_at' => date('Y-m-d H:i:s'),
            'version' => '1.0.0',
            'project' => $projectData
        ];
        $zip->addFromString($projectFolderName . '/metadata.json', json_encode($metadata, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        
        // config.jsonを追加
        $configFile = $projectDir . '/config.json';
        if (file_exists($configFile)) {
            $zip->addFile($configFile, $projectFolderName . '/config.json');
        }
        
        // scenes.jsonを追加
        $scenesFile = $projectDir . '/scenes.json';
        if (file_exists($scenesFile)) {
            $zip->addFile($scenesFile, $projectFolderName . '/scenes.json');
        }
        
        // メディアファイルを追加
        $mediaDir = $projectDir . '/media';
        if (file_exists($mediaDir)) {
            // 画像ファイル
            $imagesDir = $mediaDir . '/images';
            if (file_exists($imagesDir)) {
                $images = scandir($imagesDir);
                foreach ($images as $image) {
                    if ($image !== '.' && $image !== '..') {
                        $imagePath = $imagesDir . '/' . $image;
                        if (is_file($imagePath)) {
                            $zip->addFile($imagePath, $projectFolderName . '/media/images/' . $image);
                        }
                    }
                }
            }
            
            // 動画ファイル
            $videosDir = $mediaDir . '/videos';
            if (file_exists($videosDir)) {
                $videos = scandir($videosDir);
                foreach ($videos as $video) {
                    if ($video !== '.' && $video !== '..') {
                        $videoPath = $videosDir . '/' . $video;
                        if (is_file($videoPath)) {
                            $zip->addFile($videoPath, $projectFolderName . '/media/videos/' . $video);
                        }
                    }
                }
            }
        }
        
        $zip->close();
        
        // ファイル名を生成（プロジェクト名を使用）
        $fileName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $projectData['name']) . '_' . date('YmdHis') . '.zip';
        
        // ZIPファイルをダウンロード
        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="' . $fileName . '"');
        header('Content-Length: ' . filesize($tempFile));
        header('Cache-Control: no-cache, must-revalidate');
        header('Pragma: no-cache');
        
        readfile($tempFile);
        
        // 一時ファイルを削除
        unlink($tempFile);
        
        exit;
        
    } catch (Exception $e) {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// リクエスト処理
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $projectId = $_GET['project_id'] ?? null;
    
    if (!$projectId) {
        header('Content-Type: application/json');
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'プロジェクトIDが指定されていません'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    exportProject($projectId);
} else {
    header('Content-Type: application/json');
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ], JSON_UNESCAPED_UNICODE);
}