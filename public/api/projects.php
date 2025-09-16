<?php

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
 * Validate project data
 */
function validateProjectData(array $data, bool $isUpdate = false): array {
    $errors = [];
    
    if (!$isUpdate && empty($data['name'])) {
        $errors[] = 'Project name is required';
    }
    
    if (isset($data['name']) && strlen(trim($data['name'])) === 0) {
        $errors[] = 'Project name cannot be empty';
    }
    
    return $errors;
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get all projects or specific project
            $projectId = $_GET['id'] ?? null;
            
            if ($projectId) {
                // Get specific project
                $project = Project::load($projectId);
                if (!$project) {
                    sendResponse(false, null, 'Project not found', 404);
                }
                sendResponse(true, $project->toArray());
            } else {
                // Get all projects
                $projects = Project::getAll();
                sendResponse(true, $projects);
            }
            break;
            
        case 'POST':
            // Create new project
            $data = getRequestBody();
            
            // Validate input
            $errors = validateProjectData($data);
            if (!empty($errors)) {
                sendResponse(false, null, implode(', ', $errors), 400);
            }
            
            // Create project
            $project = new Project();
            $projectId = $project->create($data['name'], $data['notes'] ?? '');
            
            if ($projectId) {
                sendResponse(true, $project->toArray(), '', 201);
            } else {
                sendResponse(false, null, 'Failed to create project', 500);
            }
            break;
            
        case 'PUT':
            // Update existing project
            $projectId = $_GET['id'] ?? null;
            if (!$projectId) {
                sendResponse(false, null, 'Project ID is required', 400);
            }
            
            $data = getRequestBody();
            
            // Validate input
            $errors = validateProjectData($data, true);
            if (!empty($errors)) {
                sendResponse(false, null, implode(', ', $errors), 400);
            }
            
            // Load and update project
            $project = Project::load($projectId);
            if (!$project) {
                sendResponse(false, null, 'Project not found', 404);
            }
            
            if ($project->update($data)) {
                sendResponse(true, $project->toArray());
            } else {
                sendResponse(false, null, 'Failed to update project', 500);
            }
            break;
            
        case 'DELETE':
            // Delete project
            $projectId = $_GET['id'] ?? null;
            if (!$projectId) {
                sendResponse(false, null, 'Project ID is required', 400);
            }
            
            // Load and delete project
            $project = Project::load($projectId);
            if (!$project) {
                sendResponse(false, null, 'Project not found', 404);
            }
            
            if ($project->delete()) {
                sendResponse(true, ['message' => 'Project deleted successfully']);
            } else {
                sendResponse(false, null, 'Failed to delete project', 500);
            }
            break;
            
        default:
            sendResponse(false, null, 'Method not allowed', 405);
            break;
    }
    
} catch (Exception $e) {
    error_log('Projects API Error: ' . $e->getMessage());
    sendResponse(false, null, 'Internal server error', 500);
}