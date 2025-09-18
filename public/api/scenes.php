<?php
// エラー出力を完全に無効化
error_reporting(0);
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');

// Set default content type to JSON (can be overridden later)
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
 * Send CSV download response
 */
function sendCsvDownload(string $filename, array $rows): void {
    header('Content-Type: text/csv; charset=UTF-8', true);
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('Pragma: no-cache');

    $output = fopen('php://output', 'w');
    if ($output === false) {
        sendResponse(false, null, 'Failed to prepare download stream', 500);
    }

    foreach ($rows as $row) {
        fputcsv($output, $row);
    }

    fclose($output);
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

    if (array_key_exists('start_time', $data)) {
        $startTime = trim((string)$data['start_time']);
        if ($startTime !== '' && !preg_match('/^\d+:\d{2}$/', $startTime)) {
            $errors[] = 'Start time must be in format M:SS or MM:SS';
        }
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
                'camera_direction' => '',
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
        $headerRow = fgetcsv($handle, 0, ',', '"', '\\');
        $defaultMap = [
            'start_time' => 0,
            'lyrics' => 1,
            'description' => 2,
            'camera_direction' => 3,
            'image_prompt' => 4,
            'video_prompt' => 5
        ];

        $columnMap = $defaultMap;
        $firstDataRow = null;

        if ($headerRow !== false && !empty(array_filter($headerRow, fn($value) => trim((string)$value) !== ''))) {
            $aliases = [
                'start_time' => ['start_time', 'start time', '開始時間'],
                'lyrics' => ['lyrics', 'lyric', '歌詞'],
                'description' => ['description', 'scene description', 'scenedescription', 'シーン説明', '説明'],
                'camera_direction' => ['camera_direction', 'camera direction', 'cameradirection', 'カメラ/演出', 'カメラ演出', '演出'],
                'image_prompt' => ['image_prompt', 'image prompt', 'imageprompt', '英語生成プロンプト', '英語プロンプト', '英語生成'],
                'video_prompt' => ['video_prompt', 'video prompt', 'videoprompt', '動画生成プロンプト', '動画プロンプト', '動画生成']
            ];

            $resolvedMap = array_fill_keys(array_keys($defaultMap), null);
            foreach ($headerRow as $index => $columnName) {
                $trimmed = trim((string)$columnName);
                $lower = strtolower($trimmed);

                foreach ($aliases as $field => $aliasList) {
                    foreach ($aliasList as $alias) {
                        $aliasLower = strtolower($alias);
                        if ($lower === $aliasLower || $trimmed === $alias) {
                            $resolvedMap[$field] = $index;
                            break 2;
                        }
                    }
                }
            }

            $matchedCount = count(array_filter($resolvedMap, fn($value) => $value !== null));

            if ($matchedCount >= 2) {
                foreach ($resolvedMap as $field => $index) {
                    if ($index !== null) {
                        $columnMap[$field] = $index;
                    }
                }
            } else {
                // Header row was actually data; treat it as the first data row
                $firstDataRow = $headerRow;
            }
        }

        $order = 1;
        $rows = [];

        if ($firstDataRow !== null) {
            $rows[] = $firstDataRow;
        }

        while (($data = fgetcsv($handle, 0, ',', '"', '\\')) !== false) {
            $rows[] = $data;
        }

        fclose($handle);

        foreach ($rows as $data) {
            if (!is_array($data)) {
                continue;
            }

            // 空の行や不完全な行はスキップ
            $nonEmptyValues = array_filter($data, fn($value) => trim((string)$value) !== '');
            if (count($data) < 2 || empty($nonEmptyValues) || trim((string)$data[$columnMap['lyrics'] ?? 1] ?? '') === '') {
                continue;
            }

            $sceneData = [
                'start_time' => trim((string)($data[$columnMap['start_time']] ?? '')) ?: '0:00',
                'lyrics' => trim((string)($data[$columnMap['lyrics']] ?? '')),
                'description' => trim((string)($data[$columnMap['description']] ?? '')),
                'camera_direction' => trim((string)($data[$columnMap['camera_direction']] ?? '')),
                'image_prompt' => trim((string)($data[$columnMap['image_prompt']] ?? '')),
                'video_prompt' => trim((string)($data[$columnMap['video_prompt']] ?? '')),
                'order' => $order++
            ];

            $scenes[] = $sceneData;
        }
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
            $action = $_GET['action'] ?? null;
            
            if (!$projectId) {
                sendResponse(false, null, 'Project ID is required', 400);
            }
            
            // Verify project exists
            $project = Project::load($projectId);
            if (!$project) {
                sendResponse(false, null, 'Project not found', 404);
            }

            if ($action === 'export') {
                $scenes = Scene::getAllByProject($projectId);
                $rows = [
                    ['start_time', 'lyrics', 'description', 'camera_direction', 'image_prompt', 'video_prompt'],
                ];

                foreach ($scenes as $scene) {
                    $rows[] = [
                        $scene->getStartTime(),
                        $scene->getLyrics(),
                        $scene->getDescription(),
                        $scene->getCameraDirection(),
                        $scene->getImagePrompt(),
                        $scene->getVideoPrompt(),
                    ];
                }

                $safeName = preg_replace('/[^A-Za-z0-9\-_]+/', '_', $project->getName());
                $safeName = trim($safeName, '_');
                if ($safeName === '') {
                    $safeName = 'project';
                }
                $filename = sprintf('%s_scenes_%s.csv', $safeName, date('Ymd_His'));

                sendCsvDownload($filename, $rows);
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

                // Determine insertion point relative to an existing scene (if provided)
                $referenceSceneId = $data['reference_scene_id'] ?? null;
                $position = strtolower($data['position'] ?? 'after');
                if (!in_array($position, ['before', 'after'], true)) {
                    $position = 'after';
                }

                if ($referenceSceneId) {
                    $referenceScene = Scene::load($projectId, $referenceSceneId);
                    if (!$referenceScene) {
                        sendResponse(false, null, 'Reference scene not found', 404);
                    }

                    $targetOrder = max(1, $referenceScene->getOrder());
                    $insertOrder = $position === 'before' ? $targetOrder : $targetOrder + 1;
                    $scene->setOrder($insertOrder);
                } elseif (isset($data['order'])) {
                    $scene->setOrder(max(1, (int)$data['order']));
                }

                if (isset($data['start_time'])) $scene->setStartTime($data['start_time']);
                if (isset($data['lyrics'])) $scene->setLyrics($data['lyrics']);
                if (isset($data['description'])) $scene->setDescription($data['description']);
                if (isset($data['camera_direction'])) $scene->setCameraDirection($data['camera_direction']);
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
