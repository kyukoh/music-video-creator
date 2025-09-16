<?php
header('Content-Type: text/plain; charset=utf-8');

// CSVファイルを直接パースしてテスト
$csvFile = '/Users/tohru/Downloads/MV - シート1.csv';

if (!file_exists($csvFile)) {
    echo "File not found: $csvFile\n";
    exit;
}

echo "Testing CSV parsing for: $csvFile\n";
echo "File size: " . filesize($csvFile) . " bytes\n\n";

// ファイルの最初の部分を表示
echo "First 500 bytes of file:\n";
echo "=====================================\n";
$content = file_get_contents($csvFile, false, null, 0, 500);
echo $content;
echo "\n=====================================\n\n";

// CSVとしてパース
echo "Parsing as CSV:\n";
echo "=====================================\n";

if (($handle = fopen($csvFile, 'r')) !== false) {
    $lineNum = 0;
    while (($data = fgetcsv($handle, 0, ',', '"', '\\')) !== false) {
        $lineNum++;
        echo "Line $lineNum: " . count($data) . " columns\n";
        
        if ($lineNum <= 5) { // 最初の5行を詳細表示
            foreach ($data as $i => $value) {
                $displayValue = mb_substr($value, 0, 50);
                if (mb_strlen($value) > 50) {
                    $displayValue .= '...';
                }
                echo "  [$i]: " . json_encode($displayValue, JSON_UNESCAPED_UNICODE) . "\n";
            }
        }
    }
    fclose($handle);
    
    echo "\nTotal lines: $lineNum\n";
} else {
    echo "Failed to open file\n";
}

// 改行文字のチェック
echo "\n=====================================\n";
echo "Checking line endings:\n";
$content = file_get_contents($csvFile);
$crlfCount = substr_count($content, "\r\n");
$lfCount = substr_count($content, "\n") - $crlfCount;
$crCount = substr_count($content, "\r") - $crlfCount;

echo "CRLF (\\r\\n): $crlfCount\n";
echo "LF (\\n): $lfCount\n";
echo "CR (\\r): $crCount\n";
?>