<?php
require_once '../src/Scene.php';

// テスト用のデータ
$projectId = 'proj_68c42ca6d0399';
$sceneId = 'scene_68c5c6213c74c';
$imageFileId = 'img_20250915181328_Whisk_45248baf79.jpg';

echo "Testing scene update with image_file_id\n";
echo "Project ID: $projectId\n";
echo "Scene ID: $sceneId\n";
echo "Image File ID: $imageFileId\n\n";

// シーンを読み込み
$scene = Scene::load($projectId, $sceneId);

if ($scene) {
    echo "Scene loaded successfully\n";
    echo "Current image_file_id: " . ($scene->getImageFileId() ?: 'null') . "\n\n";
    
    // 画像ファイルIDを更新
    $updateData = [
        'image_file_id' => $imageFileId,
        'image_prompt' => 'Test image prompt'
    ];
    
    echo "Updating scene with data:\n";
    print_r($updateData);
    
    if ($scene->update($updateData)) {
        echo "\nUpdate successful!\n";
        
        // 再読み込みして確認
        $scene = Scene::load($projectId, $sceneId);
        echo "After update - image_file_id: " . ($scene->getImageFileId() ?: 'null') . "\n";
        echo "Scene data:\n";
        print_r($scene->toArray());
    } else {
        echo "\nUpdate failed!\n";
    }
} else {
    echo "Failed to load scene\n";
}
?>