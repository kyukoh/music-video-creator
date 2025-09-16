<?php

// Set content type to JSON
header('Content-Type: application/json');

// Enable CORS for local development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include required classes
require_once __DIR__ . '/../../src/MediaLibrary.php';
require_once __DIR__ . '/../../src/Project.php';
require_once __DIR__ . '/../../src/Scene.php';

/**
 * Send JSON response
 */
function sendResponse(bool $success, $data = null, string $error = '', int $httpCode = 200) {
    http_response_code($httpCode);
    
    $response = ['success' => $success];
    
    if ($success && $data !== null) {
        $response['data'] = $data;
    }
    
    if (!$success && !empty($error)) {
        $response['error'] = [
            'code' => 'API_ERROR',
            'message' => $error
        ];
    }
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    exit;
}

/**
 * Handle multiple file uploads
 */
function handleMultipleFileUploads(MediaLibrary $mediaLibrary): array {
    $results = [];
    $errors = [];
    
    // Handle multiple files
    if (isset($_FILES['files'])) {
        $fileCount = count($_FILES['files']['name']);
        
        for ($i = 0; $i < $fileCount; $i++) {
            $file = [
                'name' => $_FILES['files']['name'][$i],
                'type' => $_FILES['files']['type'][$i],
                'tmp_name' => $_FILES['files']['tmp_name'][$i],
                'error' => $_FILES['files']['error'][$i],
                'size' => $_FILES['files']['size'][$i]
            ];
            
            $result = $mediaLibrary->uploadFile($file);
            if ($result['success']) {
                $results[] = $result;
            } else {
                $errors[] = $file['name'] . ': ' . $result['error'];
            }
        }
    }
    // Handle single file
    elseif (isset($_FILES['file'])) {
        $result = $mediaLibrary->uploadFile($_FILES['file']);
        if ($result['success']) {
            $results[] = $result;
        } else {
            $errors[] = $result['error'];
        }
    }
    
    return [
        'uploaded' => $results,
        'errors' => $errors,
        'success_count' => count($results),
        'error_count' => count($errors)
    ];
}

/**
 * Associate media file with scene
 */
function associateFileWithScene(string $projectId, string $sceneId, string $fileId, string $fileType): bool {
    $scene = Scene::load($projectId, $sceneId);
    if (!$scene) {
        return false;
    }
    
    return $scene->setMediaFile($fileType, $fileId);
}

/**
 * Remove file association from scene
 */
function removeFileFromScene(string $projectId, string $sceneId, string $fileType): bool {
    $scene = Scene::load($projectId, $sceneId);
    if (!$scene) {
        return false;
    }
    
    return $scene->setMediaFile($fileType, null);
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get media files for a project
            $projectId = $_GET['project_id'] ?? null;
            if (!$projectId) {
                sendResponse(false, null, 'Project ID is required', 400);
            }
            
            // Verify project exists
            $project = Project::load($projectId);
            if (!$project) {
                sendResponse(false, null, 'Project not found', 404);
            }
            
            $mediaLibrary = new MediaLibrary($projectId);
            
            // Handle specific actions
            $action = $_GET['action'] ?? null;
            
            if ($action === 'info') {
                // Get file info
                $fileId = $_GET['file_id'] ?? null;
                if (!$fileId) {
                    sendResponse(false, null, 'File ID is required', 400);
                }
                
                $fileInfo = $mediaLibrary->getFileInfo($fileId);
                if (!$fileInfo) {
                    sendResponse(false, null, 'File not found', 404);
                }
                
                sendResponse(true, $fileInfo);
            } elseif ($action === 'usage') {
                // Get storage usage
                $usage = $mediaLibrary->getStorageUsage();
                sendResponse(true, $usage);
            } else {
                // Get file list with optional filtering
                $filter = $_GET['filter'] ?? 'all';
                $validFilters = ['all', 'image', 'video'];
                
                if (!in_array($filter, $validFilters)) {
                    sendResponse(false, null, 'Invalid filter. Allowed: ' . implode(', ', $validFilters), 400);
                }
                
                $files = $mediaLibrary->getFiles($filter);
                sendResponse(true, $files);
            }
            break;
            
        case 'POST':
            // Upload files or associate files with scenes
            $projectId = $_POST['project_id'] ?? null;
            if (!$projectId) {
                sendResponse(false, null, 'Project ID is required', 400);
            }
            
            // Verify project exists
            $project = Project::load($projectId);
            if (!$project) {
                sendResponse(false, null, 'Project not found', 404);
            }
            
            $action = $_POST['action'] ?? 'upload';
            
            if ($action === 'associate') {
                // Associate file with scene
                $sceneId = $_POST['scene_id'] ?? null;
                $fileId = $_POST['file_id'] ?? null;
                $fileType = $_POST['file_type'] ?? null;
                
                if (!$sceneId || !$fileId || !$fileType) {
                    sendResponse(false, null, 'Scene ID, File ID, and File Type are required', 400);
                }
                
                if (!in_array($fileType, ['image', 'video'])) {
                    sendResponse(false, null, 'File type must be "image" or "video"', 400);
                }
                
                if (associateFileWithScene($projectId, $sceneId, $fileId, $fileType)) {
                    sendResponse(true, ['message' => 'File associated with scene successfully']);
                } else {
                    sendResponse(false, null, 'Failed to associate file with scene', 500);
                }
            } elseif ($action === 'remove_association') {
                // Remove file association from scene
                $sceneId = $_POST['scene_id'] ?? null;
                $fileType = $_POST['file_type'] ?? null;
                
                if (!$sceneId || !$fileType) {
                    sendResponse(false, null, 'Scene ID and File Type are required', 400);
                }
                
                if (!in_array($fileType, ['image', 'video'])) {
                    sendResponse(false, null, 'File type must be "image" or "video"', 400);
                }
                
                if (removeFileFromScene($projectId, $sceneId, $fileType)) {
                    sendResponse(true, ['message' => 'File association removed successfully']);
                } else {
                    sendResponse(false, null, 'Failed to remove file association', 500);
                }
            } else {
                // Upload files
                $mediaLibrary = new MediaLibrary($projectId);
                
                if (empty($_FILES)) {
                    sendResponse(false, null, 'No files uploaded', 400);
                }
                
                $uploadResult = handleMultipleFileUploads($mediaLibrary);
                
                if ($uploadResult['success_count'] > 0) {
                    $message = $uploadResult['success_count'] . ' file(s) uploaded successfully';
                    if ($uploadResult['error_count'] > 0) {
                        $message .= ', ' . $uploadResult['error_count'] . ' file(s) failed';
                    }
                    
                    sendResponse(true, [
                        'message' => $message,
                        'uploaded_files' => $uploadResult['uploaded'],
                        'errors' => $uploadResult['errors'],
                        'success_count' => $uploadResult['success_count'],
                        'error_count' => $uploadResult['error_count']
                    ]);
                } else {
                    sendResponse(false, null, 'All uploads failed: ' . implode(', ', $uploadResult['errors']), 400);
                }
            }
            break;
            
        case 'DELETE':
            // Delete file
            $projectId = $_GET['project_id'] ?? null;
            $fileId = $_GET['file_id'] ?? null;
            
            if (!$projectId || !$fileId) {
                sendResponse(false, null, 'Project ID and File ID are required', 400);
            }
            
            // Verify project exists
            $project = Project::load($projectId);
            if (!$project) {
                sendResponse(false, null, 'Project not found', 404);
            }
            
            $mediaLibrary = new MediaLibrary($projectId);
            
            // Check if file exists
            if (!$mediaLibrary->fileExists($fileId)) {
                sendResponse(false, null, 'File not found', 404);
            }
            
            // Delete file (this will also remove associations from scenes)
            if ($mediaLibrary->deleteFile($fileId)) {
                sendResponse(true, ['message' => 'File deleted successfully']);
            } else {
                sendResponse(false, null, 'Failed to delete file', 500);
            }
            break;
            
        default:
            sendResponse(false, null, 'Method not allowed', 405);
            break;
    }
    
} catch (Exception $e) {
    error_log('Media API Error: ' . $e->getMessage());
    sendResponse(false, null, 'Internal server error', 500);
}