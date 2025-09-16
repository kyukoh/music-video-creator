<?php

class Scene {
    private string $id;
    private string $projectId;
    private int $order;
    private string $startTime;
    private string $lyrics;
    private string $description;
    private string $imagePrompt;
    private string $videoPrompt;
    private ?string $imageFileId;
    private ?string $videoFileId;
    private string $createdAt;
    private string $updatedAt;
    private string $dataPath;
    
    public function __construct(string $projectId, string $id = '') {
        $this->projectId = $projectId;
        $this->id = $id ?: $this->generateId();
        $this->order = 0;
        $this->startTime = '0:00';
        $this->lyrics = '';
        $this->description = '';
        $this->imagePrompt = '';
        $this->videoPrompt = '';
        $this->imageFileId = null;
        $this->videoFileId = null;
        $this->createdAt = date('c');
        $this->updatedAt = date('c');
        $this->dataPath = __DIR__ . '/../data';
    }
    
    /**
     * Save scene to project's scenes file
     */
    public function save(): bool {
        $this->updatedAt = date('c');
        
        $projectDir = $this->dataPath . '/projects/' . $this->projectId;
        $scenesFile = $projectDir . '/scenes.json';
        
        // Ensure project directory exists
        if (!is_dir($projectDir)) {
            if (!mkdir($projectDir, 0755, true)) {
                return false;
            }
        }
        
        // Load existing scenes
        $scenes = $this->loadScenes();
        
        // Find if scene exists
        $found = false;
        foreach ($scenes['scenes'] as &$scene) {
            if ($scene['id'] === $this->id) {
                $scene = $this->toArray();
                $found = true;
                break;
            }
        }
        
        // If not found, add new scene
        if (!$found) {
            $this->order = count($scenes['scenes']) + 1;
            $scenes['scenes'][] = $this->toArray();
        }
        
        return file_put_contents($scenesFile, json_encode($scenes, JSON_PRETTY_PRINT)) !== false;
    }
    
    /**
     * Update scene data
     */
    public function update(array $data): bool {
        if (isset($data['start_time'])) {
            $this->startTime = $data['start_time'];
        }
        if (isset($data['lyrics'])) {
            $this->lyrics = $data['lyrics'];
        }
        if (isset($data['description'])) {
            $this->description = $data['description'];
        }
        if (isset($data['image_prompt'])) {
            $this->imagePrompt = $data['image_prompt'];
        }
        if (isset($data['video_prompt'])) {
            $this->videoPrompt = $data['video_prompt'];
        }
        if (isset($data['image_file_id'])) {
            // 空文字列の場合はnullに変換
            $this->imageFileId = $data['image_file_id'] === '' ? null : $data['image_file_id'];
        }
        if (isset($data['video_file_id'])) {
            // 空文字列の場合はnullに変換
            $this->videoFileId = $data['video_file_id'] === '' ? null : $data['video_file_id'];
        }
        if (isset($data['order'])) {
            $this->order = (int)$data['order'];
        }
        
        return $this->save();
    }
    
    /**
     * Set media file association
     */
    public function setMediaFile(string $type, ?string $fileId): bool {
        if ($type === 'image') {
            $this->imageFileId = $fileId;
        } elseif ($type === 'video') {
            $this->videoFileId = $fileId;
        } else {
            return false;
        }
        
        return $this->save();
    }
    
    /**
     * Delete scene from project
     */
    public function delete(): bool {
        $scenesFile = $this->dataPath . '/projects/' . $this->projectId . '/scenes.json';
        
        $scenes = $this->loadScenes();
        
        // Remove scene from array
        $scenes['scenes'] = array_filter($scenes['scenes'], function($scene) {
            return $scene['id'] !== $this->id;
        });
        
        // Re-index and update order
        $scenes['scenes'] = array_values($scenes['scenes']);
        foreach ($scenes['scenes'] as $index => &$scene) {
            $scene['order'] = $index + 1;
        }
        
        return file_put_contents($scenesFile, json_encode($scenes, JSON_PRETTY_PRINT)) !== false;
    }
    
    /**
     * Load scene by ID from project
     */
    public static function load(string $projectId, string $sceneId): ?Scene {
        $dataPath = __DIR__ . '/../data';
        $scenesFile = $dataPath . '/projects/' . $projectId . '/scenes.json';
        
        if (!file_exists($scenesFile)) {
            return null;
        }
        
        $data = json_decode(file_get_contents($scenesFile), true);
        if (!$data) {
            return null;
        }
        
        foreach ($data['scenes'] as $sceneData) {
            if ($sceneData['id'] === $sceneId) {
                return self::fromArray($projectId, $sceneData);
            }
        }
        
        return null;
    }
    
    /**
     * Get all scenes for a project
     */
    public static function getAllByProject(string $projectId): array {
        $dataPath = __DIR__ . '/../data';
        $scenesFile = $dataPath . '/projects/' . $projectId . '/scenes.json';
        
        if (!file_exists($scenesFile)) {
            return [];
        }
        
        $data = json_decode(file_get_contents($scenesFile), true);
        if (!$data) {
            return [];
        }
        
        $scenes = [];
        foreach ($data['scenes'] as $sceneData) {
            $scenes[] = self::fromArray($projectId, $sceneData);
        }
        
        // Sort by order
        usort($scenes, function($a, $b) {
            return $a->getOrder() - $b->getOrder();
        });
        
        return $scenes;
    }
    
    /**
     * Reorder scenes
     */
    public static function reorder(string $projectId, array $sceneIds): bool {
        $dataPath = __DIR__ . '/../data';
        $scenesFile = $dataPath . '/projects/' . $projectId . '/scenes.json';
        
        if (!file_exists($scenesFile)) {
            return false;
        }
        
        $data = json_decode(file_get_contents($scenesFile), true);
        if (!$data) {
            return false;
        }
        
        // Create a map of scenes by ID
        $sceneMap = [];
        foreach ($data['scenes'] as $scene) {
            $sceneMap[$scene['id']] = $scene;
        }
        
        // Reorder scenes according to provided IDs
        $reorderedScenes = [];
        foreach ($sceneIds as $index => $sceneId) {
            if (isset($sceneMap[$sceneId])) {
                $sceneMap[$sceneId]['order'] = $index + 1;
                $sceneMap[$sceneId]['updated_at'] = date('c');
                $reorderedScenes[] = $sceneMap[$sceneId];
            }
        }
        
        $data['scenes'] = $reorderedScenes;
        
        return file_put_contents($scenesFile, json_encode($data, JSON_PRETTY_PRINT)) !== false;
    }
    
    /**
     * Create scene from array data
     */
    public static function fromArray(string $projectId, array $data): Scene {
        $scene = new Scene($projectId, $data['id']);
        $scene->order = $data['order'] ?? 0;
        $scene->startTime = $data['start_time'] ?? '0:00';
        $scene->lyrics = $data['lyrics'] ?? '';
        $scene->description = $data['description'] ?? '';
        $scene->imagePrompt = $data['image_prompt'] ?? '';
        $scene->videoPrompt = $data['video_prompt'] ?? '';
        $scene->imageFileId = $data['image_file_id'] ?? null;
        $scene->videoFileId = $data['video_file_id'] ?? null;
        $scene->createdAt = $data['created_at'] ?? date('c');
        $scene->updatedAt = $data['updated_at'] ?? date('c');
        
        return $scene;
    }
    
    /**
     * Convert scene to array
     */
    public function toArray(): array {
        return [
            'id' => $this->id,
            'order' => $this->order,
            'start_time' => $this->startTime,
            'lyrics' => $this->lyrics,
            'description' => $this->description,
            'image_prompt' => $this->imagePrompt,
            'video_prompt' => $this->videoPrompt,
            'image_file_id' => $this->imageFileId,
            'video_file_id' => $this->videoFileId,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt
        ];
    }
    
    // Getters
    public function getId(): string { return $this->id; }
    public function getProjectId(): string { return $this->projectId; }
    public function getOrder(): int { return $this->order; }
    public function getStartTime(): string { return $this->startTime; }
    public function getLyrics(): string { return $this->lyrics; }
    public function getDescription(): string { return $this->description; }
    public function getImagePrompt(): string { return $this->imagePrompt; }
    public function getVideoPrompt(): string { return $this->videoPrompt; }
    public function getImageFileId(): ?string { return $this->imageFileId; }
    public function getVideoFileId(): ?string { return $this->videoFileId; }
    public function getCreatedAt(): string { return $this->createdAt; }
    public function getUpdatedAt(): string { return $this->updatedAt; }
    
    // Setters
    public function setOrder(int $order): void { $this->order = $order; }
    public function setStartTime(string $startTime): void { $this->startTime = $startTime; }
    public function setLyrics(string $lyrics): void { $this->lyrics = $lyrics; }
    public function setDescription(string $description): void { $this->description = $description; }
    public function setImagePrompt(string $imagePrompt): void { $this->imagePrompt = $imagePrompt; }
    public function setVideoPrompt(string $videoPrompt): void { $this->videoPrompt = $videoPrompt; }
    
    /**
     * Generate unique scene ID
     */
    private function generateId(): string {
        return 'scene_' . uniqid();
    }
    
    /**
     * Load scenes from file
     */
    private function loadScenes(): array {
        $projectDir = $this->dataPath . '/projects/' . $this->projectId;
        $scenesFile = $projectDir . '/scenes.json';
        
        // Ensure project directory exists
        if (!is_dir($projectDir)) {
            if (!mkdir($projectDir, 0755, true)) {
                return ['scenes' => []];
            }
        }
        
        if (!file_exists($scenesFile)) {
            return ['scenes' => []];
        }
        
        $data = json_decode(file_get_contents($scenesFile), true);
        return $data ?: ['scenes' => []];
    }
}