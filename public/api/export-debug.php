<?php
/**
 * デバッグ版エクスポート - 最小限の実装
 */

// エラー表示
error_reporting(E_ALL);
ini_set('display_errors', 1);

// プロジェクトID
$projectId = $_GET['project_id'] ?? 'proj_68c868948fbb6';

// ベースディレクトリ
$baseDir = dirname(__DIR__, 2);
$projectDir = $baseDir . '/data/projects/' . $projectId;

if (!file_exists($projectDir)) {
    die("Project directory not found: $projectDir\n");
}

// 一時ファイル名
$tempFile = sys_get_temp_dir() . '/' . $projectId . '_' . date('YmdHis') . '.zip';
echo "Creating ZIP: $tempFile\n";

// ZIPアーカイブを作成
$zip = new ZipArchive();
$result = $zip->open($tempFile, ZipArchive::CREATE);

if ($result !== TRUE) {
    die("Failed to create ZIP: $result\n");
}

// ファイルを追加
$files = [
    'config.json' => $projectDir . '/config.json',
    'scenes.json' => $projectDir . '/scenes.json'
];

foreach ($files as $name => $path) {
    if (file_exists($path)) {
        echo "Adding: $name from $path\n";
        // ファイル名のみで追加（フォルダなし）
        if ($zip->addFile($path, $name)) {
            echo "  - Success\n";
        } else {
            echo "  - Failed\n";
        }
    } else {
        echo "File not found: $path\n";
    }
}

// アーカイブを閉じる
$numFiles = $zip->numFiles;
$zip->close();

echo "\nZIP created with $numFiles files\n";
echo "File size: " . filesize($tempFile) . " bytes\n";

// ZIPファイルの検証
echo "\nValidating ZIP:\n";
$zip = new ZipArchive();
if ($zip->open($tempFile) === TRUE) {
    echo "ZIP is valid, contains " . $zip->numFiles . " files:\n";
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $stat = $zip->statIndex($i);
        echo "  - " . $stat['name'] . " (" . $stat['size'] . " bytes)\n";
    }
    $zip->close();
} else {
    echo "ZIP validation failed\n";
}

// ダウンロード
$fileName = $projectId . '_debug.zip';
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . $fileName . '"');
header('Content-Length: ' . filesize($tempFile));
header('Cache-Control: no-cache');

readfile($tempFile);
unlink($tempFile);
?>