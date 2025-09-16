<?php
/**
 * プロジェクトインポート API
 * ZIPアーカイブからプロジェクトデータとメディアファイルをインポート
 */

require_once '../../config.php';
require_once '../../src/Project.php';
require_once '../../src/Scene.php';

header('Content-Type: application/json');

// CORSヘッダー
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

/**
 * ZIPファイルからプロジェクトをインポート
 */
function importProject($uploadedFile) {
    try {
        // ファイルの検証
        if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('ファイルのアップロードに失敗しました');
        }
        
        $tempFile = $uploadedFile['tmp_name'];
        $fileName = $uploadedFile['name'];
        
        // ファイル拡張子の確認
        $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        if ($ext !== 'zip') {
            throw new Exception('ZIPファイルを選択してください');
        }
        
        // ZipArchiveクラスの存在確認
        if (!class_exists('ZipArchive')) {
            throw new Exception('ZipArchive拡張が有効になっていません。PHPのzip拡張をインストールしてください。');
        }
        
        $zip = new ZipArchive();
        if ($zip->open($tempFile) !== TRUE) {
            throw new Exception('ZIPファイルを開けませんでした');
        }
        
        // メタデータの読み込み
        $metadataContent = $zip->getFromName('metadata.json');
        if (!$metadataContent) {
            throw new Exception('有効なプロジェクトファイルではありません（metadata.jsonが見つかりません）');
        }
        
        $metadata = json_decode($metadataContent, true);
        if (!$metadata || !isset($metadata['project'])) {
            throw new Exception('メタデータの読み込みに失敗しました');
        }
        
        // 新しいプロジェクトを作成
        $project = new Project();
        $originalProject = $metadata['project'];
        
        // プロジェクト名に「（インポート）」を追加
        $projectName = $originalProject['name'] . '（インポート ' . date('Y-m-d H:i') . '）';
        
        $newProjectId = $project->create([
            'name' => $projectName,
            'description' => $originalProject['description'] ?? ''
        ]);
        
        if (!$newProjectId) {
            throw new Exception('プロジェクトの作成に失敗しました');
        }
        
        $projectDir = PROJECTS_DIR . '/' . $newProjectId;
        
        // config.jsonをコピー
        $configContent = $zip->getFromName('config.json');
        if ($configContent) {
            $configData = json_decode($configContent, true);
            if ($configData) {
                // プロジェクトIDを更新
                $configData['id'] = $newProjectId;
                $configData['name'] = $projectName;
                $configData['imported_at'] = date('Y-m-d H:i:s');
                $configData['original_id'] = $originalProject['id'];
                
                file_put_contents(
                    $projectDir . '/config.json',
                    json_encode($configData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
                );
            }
        }
        
        // scenes.jsonをコピー
        $scenesContent = $zip->getFromName('scenes.json');
        if ($scenesContent) {
            file_put_contents($projectDir . '/scenes.json', $scenesContent);
        }
        
        // メディアディレクトリを作成
        $mediaDir = $projectDir . '/media';
        $imagesDir = $mediaDir . '/images';
        $videosDir = $mediaDir . '/videos';
        
        if (!file_exists($imagesDir)) {
            mkdir($imagesDir, 0755, true);
        }
        if (!file_exists($videosDir)) {
            mkdir($videosDir, 0755, true);
        }
        
        // メディアファイルを抽出
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $filename = $zip->getNameIndex($i);
            
            // 画像ファイル
            if (strpos($filename, 'media/images/') === 0) {
                $imageName = basename($filename);
                if ($imageName && $imageName !== '') {
                    $content = $zip->getFromIndex($i);
                    if ($content) {
                        file_put_contents($imagesDir . '/' . $imageName, $content);
                    }
                }
            }
            
            // 動画ファイル
            if (strpos($filename, 'media/videos/') === 0) {
                $videoName = basename($filename);
                if ($videoName && $videoName !== '') {
                    $content = $zip->getFromIndex($i);
                    if ($content) {
                        file_put_contents($videosDir . '/' . $videoName, $content);
                    }
                }
            }
        }
        
        $zip->close();
        
        return [
            'success' => true,
            'project_id' => $newProjectId,
            'project_name' => $projectName,
            'message' => 'プロジェクトのインポートが完了しました'
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

// リクエスト処理
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['project_file'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'ファイルがアップロードされていません'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    $result = importProject($_FILES['project_file']);
    
    if ($result['success']) {
        echo json_encode($result, JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode($result, JSON_UNESCAPED_UNICODE);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ], JSON_UNESCAPED_UNICODE);
}