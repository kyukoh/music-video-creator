<?php
// エラー表示
error_reporting(E_ALL);
ini_set('display_errors', 1);

// テスト用のZIPファイル作成
$tempFile = sys_get_temp_dir() . '/test_' . date('YmdHis') . '.zip';

$zip = new ZipArchive();
$result = $zip->open($tempFile, ZipArchive::CREATE | ZipArchive::OVERWRITE);

if ($result !== TRUE) {
    die("Failed to create ZIP file: $result");
}

// テストファイルを追加
$testData = [
    'test' => true,
    'date' => date('Y-m-d H:i:s'),
    'message' => 'これはテストです'
];

// プロジェクトフォルダを作成
$projectFolder = 'test_project';

// JSONファイルを追加
$zip->addFromString($projectFolder . '/test.json', json_encode($testData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

// テキストファイルを追加
$zip->addFromString($projectFolder . '/readme.txt', "This is a test file.\nテストファイルです。");

// メディアフォルダ構造を作成
$zip->addEmptyDir($projectFolder . '/media');
$zip->addEmptyDir($projectFolder . '/media/images');
$zip->addEmptyDir($projectFolder . '/media/videos');

// サンプル画像データ（1x1の透明PNG）
$pngData = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
$zip->addFromString($projectFolder . '/media/images/sample.png', $pngData);

$zip->close();

// ファイル情報を表示
echo "ZIP file created: $tempFile\n";
echo "File size: " . filesize($tempFile) . " bytes\n\n";

// ZIPファイルの内容を確認
$zip = new ZipArchive();
if ($zip->open($tempFile) === TRUE) {
    echo "ZIP contents:\n";
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $stat = $zip->statIndex($i);
        echo "  - " . $stat['name'] . " (" . $stat['size'] . " bytes)\n";
    }
    $zip->close();
}

// ダウンロードリンクを表示
echo "\n";
echo "Download link: ";
echo "<a href='data:application/zip;base64," . base64_encode(file_get_contents($tempFile)) . "' download='test.zip'>Download test.zip</a>\n";

// 一時ファイルを削除
unlink($tempFile);
?>