<?php
/**
 * Serve media files from protected directory
 */

require_once __DIR__ . '/../../config.php';

// Get parameters
$projectId = $_GET['project_id'] ?? null;
$type = $_GET['type'] ?? null;
$fileId = $_GET['file_id'] ?? null;

if (!$projectId || !$type || !$fileId) {
    http_response_code(400);
    die('Missing required parameters');
}

// Validate type
if (!in_array($type, ['image', 'video'])) {
    http_response_code(400);
    die('Invalid file type');
}

// Build file path
$subdir = $type === 'image' ? 'images' : 'videos';
$filePath = DATA_DIR . '/projects/' . $projectId . '/media/' . $subdir . '/' . $fileId;

// Check if file exists
if (!file_exists($filePath)) {
    http_response_code(404);
    die('File not found');
}

// Get MIME type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $filePath);
finfo_close($finfo);

// Validate MIME type
$allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'
];

if (!in_array($mimeType, $allowedMimeTypes)) {
    http_response_code(403);
    die('Invalid file type');
}

// Set headers
header('Content-Type: ' . $mimeType);
header('Content-Length: ' . filesize($filePath));
header('Cache-Control: public, max-age=31536000');
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');

// Handle range requests for video
if ($type === 'video' && isset($_SERVER['HTTP_RANGE'])) {
    $size = filesize($filePath);
    $range = $_SERVER['HTTP_RANGE'];
    
    list($param, $range) = explode('=', $range);
    if (strtolower(trim($param)) != 'bytes') {
        header('HTTP/1.1 400 Invalid Request');
        exit;
    }
    
    $range = explode(',', $range);
    $range = explode('-', $range[0]);
    
    if (count($range) != 2) {
        header('HTTP/1.1 400 Invalid Request');
        exit;
    }
    
    if ($range[0] === '') {
        $end = $size - 1;
        $start = $end - intval($range[1]);
    } elseif ($range[1] === '') {
        $start = intval($range[0]);
        $end = $size - 1;
    } else {
        $start = intval($range[0]);
        $end = intval($range[1]);
        if ($end >= $size) {
            $end = $size - 1;
        }
    }
    
    if ($start > $end) {
        header('HTTP/1.1 416 Requested Range Not Satisfiable');
        header('Content-Range: bytes */' . $size);
        exit;
    }
    
    header('HTTP/1.1 206 Partial Content');
    header('Content-Range: bytes ' . $start . '-' . $end . '/' . $size);
    header('Content-Length: ' . ($end - $start + 1));
    
    $fp = fopen($filePath, 'rb');
    fseek($fp, $start);
    $buffer = 1024 * 8;
    while (!feof($fp) && ($pos = ftell($fp)) <= $end) {
        if ($pos + $buffer > $end) {
            $buffer = $end - $pos + 1;
        }
        echo fread($fp, $buffer);
        flush();
    }
    fclose($fp);
} else {
    // Output file
    readfile($filePath);
}