<?php
// エラー出力を完全に無効化
error_reporting(0);
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');

// Set content type to JSON
header('Content-Type: application/json');

// Enable CORS for local development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include required classes
require_once __DIR__ . '/../../src/Scene.php';
require_once __DIR__ . '/../../src/Project.php';

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
 * Get request body as JSON
 */
function getRequestBody(): array {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    return $data ?? [];
}

/**
 * Validate scene data
 */
function validateSceneData(array $data): array {
    $errors = [];
    
    if (isset($data['start_time']) && !preg_match('/^\d+:\d{2}$/', $data['start_time'])) {
        $errors[] = 'Start time must be in format M:SS or MM:SS';
    }
    
    return $errors;
}

/**
 * Parse scenes from text file (lyrics separated by line breaks)
 */
function parseScenesFromText(string $content): array {
    $lines = explode("\n", $content);
    $scenes = [];
    $order = 1;
    
    foreach ($lines as $line) {
        $line = trim($line);
        if (!empty($line)) {
            $scenes[] = [
                'lyrics' => $line,
                'order' => $order++,
                'start_time' => '0:00',
                'description' => '',
                'image_prompt' => '',
                'video_prompt' => ''
            ];
        }
    }
    
    return $scenes;
}

/**
 * Parse scenes from Excel/CSV file
 */
function parseScenesFromExcel(string $filePath): array {
    // For now, we'll implement basic CSV parsing
    // In a full implementation, you might use a library like PhpSpreadsheet
    $scenes = [];
    
    if (($handle = fopen($filePath, 'r')) !== false) {
        // CSVの区切り文字とエンクロージャー、エスケープ文字を明示的に指定
        $header = fgetcsv($handle, 0, ',', '"', '\\'); // Skip header row
        $order = 1;
        
        while (($data = fgetcsv($handle, 0, ',', '"', '\\')) !== false) {
            // 空の行や不完全な行はスキップ
            if (count($data) >= 2 && !empty(trim($data[1]))) {
                $scenes[] = [
                    'start_time' => isset($data[0]) ? trim($data[0]) : '0:00',
                    'lyrics' => isset($data[1]) ? trim($data[1]) : '',
                    'description' => isset($data[2]) ? trim($data[2]) : '',
                    'image_prompt' => isset($data[3]) ? trim($data[3]) : '',
                    'video_prompt' => isset($data[4]) ? trim($data[4]) : '',
                    'order' => $order++
                ];
            }
        }
        fclose($handle);
    }
    
    return $scenes;
}

/**
 * Handle file upload for scene batch import
 */
function handleSceneFileUpload(string $projectId): array {
    if (!isset($_FILES['file'])) {
        return ['success' => false, 'error' => 'No file field in upload'];
    }
    
    if ($_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive',
            UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive',
            UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'File upload stopped by extension',
        ];
        $errorCode = $_FILES['file']['error'];
        $errorMsg = isset($errorMessages[$errorCode]) ? $errorMessages[$errorCode] : 'Unknown upload error';
        return ['success' => false, 'error' => 'Upload error: ' . $errorMsg];
    }
    
    $file = $_FILES['file'];
    $fileName = $file['name'];
    $tmpPath = $file['tmp_name'];
    $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    // Validate file type
    $allowedExts = ['txt', 'csv', 'xlsx', 'xls'];
    if (!in_array($fileExt, $allowedExts)) {
        return ['success' => false, 'error' => 'Invalid file type. Allowed: txt, csv, xlsx, xls'];
    }
    
    // Read file content
    $content = file_get_contents($tmpPath);
    if ($content === false) {
        return ['success' => false, 'error' => 'Failed to read file'];
    }
    
    // Parse scenes based on file type
    $scenesData = [];
    if ($fileExt === 'txt') {
        $scenesData = parseScenesFromText($content);
    } elseif (in_array($fileExt, ['csv', 'xlsx', 'xls'])) {
        $scenesData = parseScenesFromExcel($tmpPath);
    }
    
    // Create scenes
    $createdScenes = [];
    $errors = [];
    
    foreach ($scenesData as $index => $sceneData) {
        try {
            $scene = new Scene($projectId);
            $scene->setStartTime($sceneData['start_time']);
            $scene->setLyrics($sceneData['lyrics']);
            $scene->setDescription($sceneData['description']);
            $scene->setImagePrompt($sceneData['image_prompt']);
            $scene->setVideoPrompt($sceneData['video_prompt']);
            $scene->setOrder($sceneData['order']);
            
            if ($scene->save()) {
                $createdScenes[] = $scene->toArray();
            } else {
                $errors[] = 'Failed to save scene at line ' . ($index + 2);
            }
        } catch (Exception $e) {
            $errors[] = 'Error at line ' . ($index + 2) . ': ' . $e->getMessage();
        }
    }
    
    if (empty($createdScenes)) {
        return ['success' => false, 'error' => 'No scenes were created. ' . implode('. ', $errors)];
    }
    
    return ['success' => true, 'scenes' => $createdScenes, 'warnings' => $errors];
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Handle file upload for batch scene creation
    if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'upload') {
        $projectId = $_POST['project_id'] ?? null;
        if (!$projectId) {
            sendResponse(false, null, 'Project ID is required', 400);
        }
        
        // Verify project exists
        $project = Project::load($projectId);
        if (!$project) {
            sendResponse(false, null, 'Project not found', 404);
        }
        
        $result = handleSceneFileUpload($projectId);
        if ($result['success']) {
            sendResponse(true, $result['scenes']);
        } else {
            sendResponse(false, null, $result['error'], 400);
        }
    }
    
    switch ($method) {
        case 'GET':
            // Get scenes for a project or specific scene
            $projectId = $_GET['project_id'] ?? null;
            $sceneId = $_GET['id'] ?? null;
            
            if (!$projectId) {
                sendResponse(false, null, 'Project ID is required', 400);
            }
            
            // Verify project exists
            $project = Project::load($projectId);
            if (!$project) {
                sendResponse(false, null, 'Project not found', 404);
            }
            
            if ($sceneId) {
                // Get specific scene
                $scene = Scene::load($projectId, $sceneId);
                if (!$scene) {
                    sendResponse(false, null, 'Scene not found', 404);
                }
                sendResponse(true, $scene->toArray());
            } else {
                // Get all scenes for project
                $scenes = Scene::getAllByProject($projectId);
                $scenesArray = array_map(function($scene) {
                    return $scene->toArray();
                }, $scenes);
                sendResponse(true, $scenesArray);
            }
            break;
            
        case 'POST':
            // Create new scene or reorder scenes
            $data = getRequestBody();
            
            if (isset($data['action']) && $data['action'] === 'reorder') {
                // Reorder scenes
                $projectId = $data['project_id'] ?? null;
                $sceneIds = $data['scene_ids'] ?? [];
                
                if (!$projectId || empty($sceneIds)) {
                    sendResponse(false, null, 'Project ID and scene IDs are required', 400);
                }
                
                if (Scene::reorder($projectId, $sceneIds)) {
                    sendResponse(true, ['message' => 'Scenes reordered successfully']);
                } else {
                    sendResponse(false, null, 'Failed to reorder scenes', 500);
                }
            } else {
                // Create new scene
                $projectId = $data['project_id'] ?? null;
                if (!$projectId) {
                    sendResponse(false, null, 'Project ID is required', 400);
                }
                
                // Verify project exists
                $project = Project::load($projectId);
                if (!$project) {
                    sendResponse(false, null, 'Project not found', 404);
                }
                
                // Validate input
                $errors = validateSceneData($data);
                if (!empty($errors)) {
                    sendResponse(false, null, implode(', ', $errors), 400);
                }
                
                // Create scene
                $scene = new Scene($projectId);
                if (isset($data['start_time'])) $scene->setStartTime($data['start_time']);
                if (isset($data['lyrics'])) $scene->setLyrics($data['lyrics']);
                if (isset($data['description'])) $scene->setDescription($data['description']);
                if (isset($data['image_prompt'])) $scene->setImagePrompt($data['image_prompt']);
                if (isset($data['video_prompt'])) $scene->setVideoPrompt($data['video_prompt']);
                
                if ($scene->save()) {
                    sendResponse(true, $scene->toArray(), '', 201);
                } else {
                    sendResponse(false, null, 'Failed to create scene', 500);
                }
            }
            break;
            
        case 'PUT':
            // Update existing scene
            $sceneId = $_GET['id'] ?? null;
            if (!$sceneId) {
                sendResponse(false, null, 'Scene ID is required', 400);
            }
            
            $data = getRequestBody();
            $projectId = $data['project_id'] ?? $_GET['project_id'] ?? null;
            
            if (!$projectId) {
                sendResponse(false, null, 'Project ID is required', 400);
            }
            
            // Validate input
            $errors = validateSceneData($data);
            if (!empty($errors)) {
                sendResponse(false, null, implode(', ', $errors), 400);
            }
            
            // Load and update scene
            $scene = Scene::load($projectId, $sceneId);
            if (!$scene) {
                sendResponse(false, null, 'Scene not found', 404);
            }
            
            if ($scene->update($data)) {
                sendResponse(true, $scene->toArray());
            } else {
                sendResponse(false, null, 'Failed to update scene. Check file permissions.', 500);
            }
            break;
            
        case 'DELETE':
            // Delete scene
            $sceneId = $_GET['id'] ?? null;
            $projectId = $_GET['project_id'] ?? null;
            
            if (!$sceneId || !$projectId) {
                sendResponse(false, null, 'Scene ID and Project ID are required', 400);
            }
            
            // Load and delete scene
            $scene = Scene::load($projectId, $sceneId);
            if (!$scene) {
                sendResponse(false, null, 'Scene not found', 404);
            }
            
            if ($scene->delete()) {
                sendResponse(true, ['message' => 'Scene deleted successfully']);
            } else {
                sendResponse(false, null, 'Failed to delete scene', 500);
            }
            break;
            
        default:
            sendResponse(false, null, 'Method not allowed', 405);
            break;
    }
    
} catch (Exception $e) {
    sendResponse(false, null, 'Internal server error: ' . $e->getMessage(), 500);
}