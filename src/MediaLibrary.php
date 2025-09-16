<?php

class MediaLibrary {
    private string $projectId;
    private string $mediaPath;
    private string $dataPath;
    
    // Allowed file extensions
    private const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];
    private const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi'];
    
    // Maximum file size (in bytes) - 100MB
    private const MAX_FILE_SIZE = 100 * 1024 * 1024;
    
    public function __construct(string $projectId) {
        $this->projectId = $projectId;
        $this->dataPath = __DIR__ . '/../data';
        $this->mediaPath = $this->dataPath . '/projects/' . $projectId . '/media';
        
        // Ensure media directories exist
        $this->ensureDirectories();
    }
    
    /**
     * Upload a file to the media library
     */
    public function uploadFile(array $file): array {
        // Validate file
        $validation = $this->validateFile($file);
        if (!$validation['valid']) {
            return [
                'success' => false,
                'error' => $validation['error']
            ];
        }
        
        $fileType = $validation['type'];
        $extension = $validation['extension'];
        
        // Generate unique filename
        $timestamp = date('YmdHis');
        $originalName = pathinfo($file['name'], PATHINFO_FILENAME);
        $sanitizedName = $this->sanitizeFilename($originalName);
        $prefix = $fileType === 'image' ? 'img_' : 'vid_';
        $newFilename = $prefix . $timestamp . '_' . $sanitizedName . '.' . $extension;
        
        // Determine target directory
        $targetDir = $this->mediaPath . '/' . ($fileType === 'image' ? 'images' : 'videos');
        $targetPath = $targetDir . '/' . $newFilename;
        
        // Move uploaded file
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            return [
                'success' => true,
                'file_id' => $newFilename,
                'file_type' => $fileType,
                'original_name' => $file['name'],
                'size' => $file['size']
            ];
        } else {
            return [
                'success' => false,
                'error' => 'Failed to save file'
            ];
        }
    }
    
    /**
     * Get list of files with optional filtering
     */
    public function getFiles(string $filter = 'all'): array {
        $files = [];
        
        if ($filter === 'all' || $filter === 'image') {
            $imageFiles = $this->getFilesFromDirectory('images', 'image');
            $files = array_merge($files, $imageFiles);
        }
        
        if ($filter === 'all' || $filter === 'video') {
            $videoFiles = $this->getFilesFromDirectory('videos', 'video');
            $files = array_merge($files, $videoFiles);
        }
        
        // Sort by modification time (newest first)
        usort($files, function($a, $b) {
            return $b['modified_time'] - $a['modified_time'];
        });
        
        return $files;
    }
    
    /**
     * Delete a file from the media library
     */
    public function deleteFile(string $fileId): bool {
        $filePath = $this->findFilePath($fileId);
        
        if (!$filePath || !file_exists($filePath)) {
            return false;
        }
        
        // Remove file associations from scenes
        $this->removeFileFromScenes($fileId);
        
        // Delete the file
        return unlink($filePath);
    }
    
    /**
     * Get file information
     */
    public function getFileInfo(string $fileId): ?array {
        $filePath = $this->findFilePath($fileId);
        
        if (!$filePath || !file_exists($filePath)) {
            return null;
        }
        
        $fileType = $this->getFileType($fileId);
        $fileSize = filesize($filePath);
        $modifiedTime = filemtime($filePath);
        
        return [
            'file_id' => $fileId,
            'file_type' => $fileType,
            'file_path' => $filePath,
            'size' => $fileSize,
            'size_formatted' => $this->formatFileSize($fileSize),
            'modified_time' => $modifiedTime,
            'modified_date' => date('Y-m-d H:i:s', $modifiedTime)
        ];
    }
    
    /**
     * Get file URL for web access
     */
    public function getFileUrl(string $fileId): ?string {
        $fileType = $this->getFileType($fileId);
        if (!$fileType) {
            return null;
        }
        
        $subdir = $fileType === 'image' ? 'images' : 'videos';
        return '/data/projects/' . $this->projectId . '/media/' . $subdir . '/' . $fileId;
    }
    
    /**
     * Check if file exists
     */
    public function fileExists(string $fileId): bool {
        $filePath = $this->findFilePath($fileId);
        return $filePath && file_exists($filePath);
    }
    
    /**
     * Get total storage usage for project
     */
    public function getStorageUsage(): array {
        $totalSize = 0;
        $fileCount = 0;
        
        $files = $this->getFiles('all');
        foreach ($files as $file) {
            $totalSize += $file['size'];
            $fileCount++;
        }
        
        return [
            'total_size' => $totalSize,
            'total_size_formatted' => $this->formatFileSize($totalSize),
            'file_count' => $fileCount
        ];
    }
    
    /**
     * Validate uploaded file
     */
    private function validateFile(array $file): array {
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return [
                'valid' => false,
                'error' => 'File upload error: ' . $this->getUploadErrorMessage($file['error'])
            ];
        }
        
        // Check file size
        if ($file['size'] > self::MAX_FILE_SIZE) {
            return [
                'valid' => false,
                'error' => 'File size exceeds maximum allowed size of ' . $this->formatFileSize(self::MAX_FILE_SIZE)
            ];
        }
        
        // Check file extension
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (in_array($extension, self::ALLOWED_IMAGE_EXTENSIONS)) {
            $fileType = 'image';
        } elseif (in_array($extension, self::ALLOWED_VIDEO_EXTENSIONS)) {
            $fileType = 'video';
        } else {
            $allowedExtensions = array_merge(self::ALLOWED_IMAGE_EXTENSIONS, self::ALLOWED_VIDEO_EXTENSIONS);
            return [
                'valid' => false,
                'error' => 'Invalid file type. Allowed extensions: ' . implode(', ', $allowedExtensions)
            ];
        }
        
        return [
            'valid' => true,
            'type' => $fileType,
            'extension' => $extension
        ];
    }
    
    /**
     * Sanitize filename for security
     */
    private function sanitizeFilename(string $filename): string {
        // Remove or replace dangerous characters
        $filename = preg_replace('/[^a-zA-Z0-9\-_\.]/', '_', $filename);
        
        // Remove multiple underscores
        $filename = preg_replace('/_+/', '_', $filename);
        
        // Trim underscores from start and end
        $filename = trim($filename, '_');
        
        // Limit length
        if (strlen($filename) > 50) {
            $filename = substr($filename, 0, 50);
        }
        
        return $filename ?: 'file';
    }
    
    /**
     * Get files from a specific directory
     */
    private function getFilesFromDirectory(string $subdir, string $fileType): array {
        $directory = $this->mediaPath . '/' . $subdir;
        $files = [];
        
        if (!is_dir($directory)) {
            return $files;
        }
        
        $items = scandir($directory);
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }
            
            $filePath = $directory . '/' . $item;
            if (is_file($filePath)) {
                $fileSize = filesize($filePath);
                $modifiedTime = filemtime($filePath);
                
                $files[] = [
                    'id' => $item,  // JavaScriptが期待するフィールド名
                    'file_id' => $item,
                    'name' => $item,  // ファイル名を追加
                    'type' => mime_content_type($filePath) ?: ($fileType === 'image' ? 'image/jpeg' : 'video/mp4'),
                    'file_type' => $fileType,
                    'size' => $fileSize,
                    'size_formatted' => $this->formatFileSize($fileSize),
                    'modified_time' => $modifiedTime,
                    'updated_at' => date('Y-m-d H:i:s', $modifiedTime),
                    'modified_date' => date('Y-m-d H:i:s', $modifiedTime),
                    'url' => $this->getFileUrl($item)
                ];
            }
        }
        
        return $files;
    }
    
    /**
     * Find the full path of a file by ID
     */
    private function findFilePath(string $fileId): ?string {
        $imagePath = $this->mediaPath . '/images/' . $fileId;
        $videoPath = $this->mediaPath . '/videos/' . $fileId;
        
        if (file_exists($imagePath)) {
            return $imagePath;
        } elseif (file_exists($videoPath)) {
            return $videoPath;
        }
        
        return null;
    }
    
    /**
     * Determine file type from file ID
     */
    private function getFileType(string $fileId): ?string {
        if (strpos($fileId, 'img_') === 0) {
            return 'image';
        } elseif (strpos($fileId, 'vid_') === 0) {
            return 'video';
        }
        
        return null;
    }
    
    /**
     * Remove file associations from all scenes
     */
    private function removeFileFromScenes(string $fileId): void {
        $scenesFile = $this->dataPath . '/projects/' . $this->projectId . '/scenes.json';
        
        if (!file_exists($scenesFile)) {
            return;
        }
        
        $data = json_decode(file_get_contents($scenesFile), true);
        if (!$data) {
            return;
        }
        
        $updated = false;
        foreach ($data['scenes'] as &$scene) {
            if ($scene['image_file_id'] === $fileId) {
                $scene['image_file_id'] = null;
                $scene['updated_at'] = date('c');
                $updated = true;
            }
            if ($scene['video_file_id'] === $fileId) {
                $scene['video_file_id'] = null;
                $scene['updated_at'] = date('c');
                $updated = true;
            }
        }
        
        if ($updated) {
            file_put_contents($scenesFile, json_encode($data, JSON_PRETTY_PRINT));
        }
    }
    
    /**
     * Ensure media directories exist
     */
    private function ensureDirectories(): void {
        $directories = [
            $this->mediaPath,
            $this->mediaPath . '/images',
            $this->mediaPath . '/videos'
        ];
        
        foreach ($directories as $dir) {
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
        }
    }
    
    /**
     * Format file size in human readable format
     */
    private function formatFileSize(int $bytes): string {
        $units = ['B', 'KB', 'MB', 'GB'];
        $unitIndex = 0;
        
        while ($bytes >= 1024 && $unitIndex < count($units) - 1) {
            $bytes /= 1024;
            $unitIndex++;
        }
        
        return round($bytes, 2) . ' ' . $units[$unitIndex];
    }
    
    /**
     * Get upload error message
     */
    private function getUploadErrorMessage(int $errorCode): string {
        switch ($errorCode) {
            case UPLOAD_ERR_INI_SIZE:
                return 'File exceeds upload_max_filesize directive';
            case UPLOAD_ERR_FORM_SIZE:
                return 'File exceeds MAX_FILE_SIZE directive';
            case UPLOAD_ERR_PARTIAL:
                return 'File was only partially uploaded';
            case UPLOAD_ERR_NO_FILE:
                return 'No file was uploaded';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'Missing temporary folder';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Failed to write file to disk';
            case UPLOAD_ERR_EXTENSION:
                return 'File upload stopped by extension';
            default:
                return 'Unknown upload error';
        }
    }
}