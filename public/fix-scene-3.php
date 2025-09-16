<?php
require_once __DIR__ . '/../src/Scene.php';

// 3番目のシーンのimage_promptをクリア
$projectId = 'proj_68c868948fbb6';
$sceneId = 'scene_68c8689d1d8f7';

echo "Clearing image_prompt for scene #3\n";
echo "Project ID: $projectId\n";
echo "Scene ID: $sceneId\n\n";

$scene = Scene::load($projectId, $sceneId);

if ($scene) {
    $currentData = $scene->toArray();
    echo "Current image_prompt length: " . strlen($currentData['image_prompt']) . " characters\n";
    echo "Current image_file_id: " . ($currentData['image_file_id'] ?: 'null') . "\n\n";
    
    // image_promptをクリアして、テスト画像IDも削除
    $updateData = [
        'image_prompt' => '',
        'image_file_id' => ''  // nullではなく空文字列にする
    ];
    
    echo "Clearing image_prompt and image_file_id...\n";
    
    if ($scene->update($updateData)) {
        echo "Update successful!\n\n";
        
        // 再読み込みして確認
        $scene = Scene::load($projectId, $sceneId);
        $updatedData = $scene->toArray();
        echo "After update:\n";
        echo "  - image_prompt: '" . $updatedData['image_prompt'] . "'\n";
        echo "  - image_file_id: " . ($updatedData['image_file_id'] ?: 'null') . "\n";
    } else {
        echo "Update failed!\n";
    }
} else {
    echo "Failed to load scene\n";
}
?>