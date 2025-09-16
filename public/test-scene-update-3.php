<?php
require_once __DIR__ . '/../src/Scene.php';

// テスト用のデータ
$projectId = 'proj_68c868948fbb6';
$sceneId = 'scene_68c8689d1d8f7';  // 3番目のシーン
$imageFileId = 'img_test_' . date('YmdHis') . '.jpg';

echo "Testing scene update for scene #3\n";
echo "Project ID: $projectId\n";
echo "Scene ID: $sceneId\n";
echo "Image File ID to set: $imageFileId\n\n";

// シーンを読み込み
$scene = Scene::load($projectId, $sceneId);

if ($scene) {
    echo "Scene loaded successfully\n";
    echo "Current data:\n";
    $currentData = $scene->toArray();
    echo "  - Order: " . $currentData['order'] . "\n";
    echo "  - Lyrics: " . $currentData['lyrics'] . "\n";
    echo "  - Current image_file_id: " . ($currentData['image_file_id'] ?: 'null') . "\n\n";
    
    // 画像ファイルIDを更新
    $updateData = [
        'image_file_id' => $imageFileId
    ];
    
    echo "Updating scene with image_file_id: $imageFileId\n";
    
    if ($scene->update($updateData)) {
        echo "Update successful!\n\n";
        
        // 再読み込みして確認
        $scene = Scene::load($projectId, $sceneId);
        $updatedData = $scene->toArray();
        echo "After update:\n";
        echo "  - image_file_id: " . ($updatedData['image_file_id'] ?: 'null') . "\n";
        
        // JSONファイルを直接確認
        $jsonFile = __DIR__ . "/../data/projects/$projectId/scenes.json";
        if (file_exists($jsonFile)) {
            $jsonContent = json_decode(file_get_contents($jsonFile), true);
            foreach ($jsonContent['scenes'] as $s) {
                if ($s['id'] === $sceneId) {
                    echo "\nDirect JSON check:\n";
                    echo "  - image_file_id in JSON: " . ($s['image_file_id'] ?: 'null') . "\n";
                    break;
                }
            }
        }
    } else {
        echo "Update failed!\n";
        
        // エラーの詳細を確認
        $jsonFile = __DIR__ . "/../data/projects/$projectId/scenes.json";
        echo "\nChecking file permissions:\n";
        echo "  - File exists: " . (file_exists($jsonFile) ? 'Yes' : 'No') . "\n";
        echo "  - File writable: " . (is_writable($jsonFile) ? 'Yes' : 'No') . "\n";
        echo "  - Directory writable: " . (is_writable(dirname($jsonFile)) ? 'Yes' : 'No') . "\n";
    }
} else {
    echo "Failed to load scene\n";
}
?>