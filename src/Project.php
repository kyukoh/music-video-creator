<?php

class Project {
    private string $id;
    private string $name;
    private string $notes;
    private string $createdAt;
    private string $updatedAt;
    private string $dataPath;
    
    public function __construct(string $id = '', string $name = '', string $notes = '') {
        $this->id = $id ?: $this->generateId();
        $this->name = $name;
        $this->notes = $notes;
        $this->createdAt = date('c');
        $this->updatedAt = date('c');
        $this->dataPath = __DIR__ . '/../data';
    }
    
    /**
     * Create a new project
     */
    public function create(string $name, string $notes): string {
        $this->name = $name;
        $this->notes = $notes;
        $this->createdAt = date('c');
        $this->updatedAt = date('c');
        
        // Create project directory
        $projectDir = $this->dataPath . '/projects/' . $this->id;
        if (!is_dir($projectDir)) {
            mkdir($projectDir, 0755, true);
        }
        
        // Create media subdirectories
        mkdir($projectDir . '/media', 0755, true);
        mkdir($projectDir . '/media/images', 0755, true);
        mkdir($projectDir . '/media/videos', 0755, true);
        
        // Save project config
        $this->saveConfig();
        
        // Initialize empty scenes file
        $this->initializeScenes();
        
        // Add to projects list
        $this->addToProjectsList();
        
        return $this->id;
    }
    
    /**
     * Update project information
     */
    public function update(array $data): bool {
        if (isset($data['name'])) {
            $this->name = $data['name'];
        }
        if (isset($data['notes'])) {
            $this->notes = $data['notes'];
        }
        
        $this->updatedAt = date('c');
        
        return $this->saveConfig() && $this->updateProjectsList();
    }
    
    /**
     * Delete project and all associated data
     */
    public function delete(): bool {
        $projectDir = $this->dataPath . '/projects/' . $this->id;
        
        // Remove from projects list
        $this->removeFromProjectsList();
        
        // Delete project directory recursively
        return $this->deleteDirectory($projectDir);
    }
    
    /**
     * Load project by ID
     */
    public static function load(string $id): ?Project {
        $dataPath = __DIR__ . '/../data';
        $configFile = $dataPath . '/projects/' . $id . '/config.json';
        
        if (!file_exists($configFile)) {
            return null;
        }
        
        $config = json_decode(file_get_contents($configFile), true);
        if (!$config) {
            return null;
        }
        
        $project = new Project();
        $project->id = $config['id'];
        $project->name = $config['name'];
        $project->notes = $config['notes'];
        $project->createdAt = $config['created_at'];
        $project->updatedAt = $config['updated_at'];
        
        return $project;
    }
    
    /**
     * Get all projects
     */
    public static function getAll(): array {
        $dataPath = __DIR__ . '/../data';
        $projectsFile = $dataPath . '/projects.json';
        
        if (!file_exists($projectsFile)) {
            return [];
        }
        
        $data = json_decode(file_get_contents($projectsFile), true);
        return $data['projects'] ?? [];
    }
    
    /**
     * Get project data as array
     */
    public function toArray(): array {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'notes' => $this->notes,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt
        ];
    }
    
    // Getters
    public function getId(): string { return $this->id; }
    public function getName(): string { return $this->name; }
    public function getNotes(): string { return $this->notes; }
    public function getCreatedAt(): string { return $this->createdAt; }
    public function getUpdatedAt(): string { return $this->updatedAt; }
    
    /**
     * Generate unique project ID
     */
    private function generateId(): string {
        return 'proj_' . uniqid();
    }
    
    /**
     * Save project configuration to JSON file
     */
    private function saveConfig(): bool {
        $projectDir = $this->dataPath . '/projects/' . $this->id;
        $configFile = $projectDir . '/config.json';
        
        $config = $this->toArray();
        
        return file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT)) !== false;
    }
    
    /**
     * Initialize empty scenes file
     */
    private function initializeScenes(): bool {
        $projectDir = $this->dataPath . '/projects/' . $this->id;
        $scenesFile = $projectDir . '/scenes.json';
        
        $scenes = ['scenes' => []];
        
        return file_put_contents($scenesFile, json_encode($scenes, JSON_PRETTY_PRINT)) !== false;
    }
    
    /**
     * Add project to projects list
     */
    private function addToProjectsList(): bool {
        $projectsFile = $this->dataPath . '/projects.json';
        
        // Create projects.json if it doesn't exist
        if (!file_exists($projectsFile)) {
            if (!is_dir($this->dataPath)) {
                mkdir($this->dataPath, 0755, true);
            }
            file_put_contents($projectsFile, json_encode(['projects' => []], JSON_PRETTY_PRINT));
        }
        
        $data = json_decode(file_get_contents($projectsFile), true);
        if (!$data) {
            $data = ['projects' => []];
        }
        
        // Add project to list
        $data['projects'][] = $this->toArray();
        
        return file_put_contents($projectsFile, json_encode($data, JSON_PRETTY_PRINT)) !== false;
    }
    
    /**
     * Update project in projects list
     */
    private function updateProjectsList(): bool {
        $projectsFile = $this->dataPath . '/projects.json';
        
        if (!file_exists($projectsFile)) {
            return false;
        }
        
        $data = json_decode(file_get_contents($projectsFile), true);
        if (!$data) {
            return false;
        }
        
        // Find and update project
        foreach ($data['projects'] as &$project) {
            if ($project['id'] === $this->id) {
                $project = $this->toArray();
                break;
            }
        }
        
        return file_put_contents($projectsFile, json_encode($data, JSON_PRETTY_PRINT)) !== false;
    }
    
    /**
     * Remove project from projects list
     */
    private function removeFromProjectsList(): bool {
        $projectsFile = $this->dataPath . '/projects.json';
        
        if (!file_exists($projectsFile)) {
            return true;
        }
        
        $data = json_decode(file_get_contents($projectsFile), true);
        if (!$data) {
            return true;
        }
        
        // Remove project from list
        $data['projects'] = array_filter($data['projects'], function($project) {
            return $project['id'] !== $this->id;
        });
        
        // Re-index array
        $data['projects'] = array_values($data['projects']);
        
        return file_put_contents($projectsFile, json_encode($data, JSON_PRETTY_PRINT)) !== false;
    }
    
    /**
     * Recursively delete directory
     */
    private function deleteDirectory(string $dir): bool {
        if (!is_dir($dir)) {
            return true;
        }
        
        $files = array_diff(scandir($dir), ['.', '..']);
        
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            if (is_dir($path)) {
                $this->deleteDirectory($path);
            } else {
                unlink($path);
            }
        }
        
        return rmdir($dir);
    }
}