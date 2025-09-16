<?php
// 最もシンプルなZIPファイルを作成してテスト
$tempFile = 'test_simple.zip';

// 既存のファイルを削除
if (file_exists($tempFile)) {
    unlink($tempFile);
}

$zip = new ZipArchive();
$result = $zip->open($tempFile, ZipArchive::CREATE);

if ($result !== TRUE) {
    die("Failed to create ZIP file: $result\n");
}

// シンプルなテキストファイルを追加
$zip->addFromString('test.txt', 'Hello World');
$zip->close();

echo "ZIP file created: $tempFile\n";
echo "File size: " . filesize($tempFile) . " bytes\n";

// hexdumpで最初の部分を確認
echo "\nFirst 100 bytes (hex):\n";
$handle = fopen($tempFile, "rb");
$contents = fread($handle, 100);
fclose($handle);
echo bin2hex($contents) . "\n";

// ZIPファイルの署名を確認（PKで始まるべき）
$handle = fopen($tempFile, "rb");
$signature = fread($handle, 4);
fclose($handle);
echo "\nZIP signature: " . bin2hex($signature) . " (should be 504b0304)\n";
?>