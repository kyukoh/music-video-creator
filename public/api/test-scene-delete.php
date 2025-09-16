<?php
/**
 * シーン削除のテストページ
 */

require_once '../config.php';
require_once '../src/Scene.php';

// エラー表示を有効化
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Scene Delete Test</title>
    <style>
        body { font-family: monospace; padding: 20px; }
        .test { margin: 20px 0; padding: 10px; border: 1px solid #ccc; }
        .success { background: #e7f5e7; }
        .error { background: #ffe7e7; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
        input { padding: 5px; margin: 5px; width: 200px; }
        pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Scene Delete Test</h1>
    
    <div class="test">
        <h2>Test Scene Deletion</h2>
        <div>
            <label>Project ID: <input type="text" id="project-id" placeholder="Enter project ID"></label><br>
            <label>Scene ID: <input type="text" id="scene-id" placeholder="Enter scene ID"></label><br>
            <button onclick="testSceneDelete()">Test Delete</button>
            <button onclick="listScenes()">List Scenes</button>
        </div>
        <div id="result"></div>
    </div>

    <script>
        async function testSceneDelete() {
            const projectId = document.getElementById('project-id').value;
            const sceneId = document.getElementById('scene-id').value;
            
            if (!projectId || !sceneId) {
                alert('Please enter both Project ID and Scene ID');
                return;
            }
            
            const resultDiv = document.getElementById('result');
            
            try {
                // Test with DELETE method
                const response = await fetch(`../api/scenes.php?id=${sceneId}&project_id=${projectId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const text = await response.text();
                console.log('Response:', text);
                
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    resultDiv.innerHTML = `<pre class="error">Failed to parse JSON:\n${text}</pre>`;
                    return;
                }
                
                if (response.ok && data.success) {
                    resultDiv.innerHTML = `<pre class="success">Scene deleted successfully!\n${JSON.stringify(data, null, 2)}</pre>`;
                } else {
                    resultDiv.innerHTML = `<pre class="error">Delete failed:\n${JSON.stringify(data, null, 2)}</pre>`;
                }
                
            } catch (error) {
                resultDiv.innerHTML = `<pre class="error">Error: ${error.message}</pre>`;
            }
        }
        
        async function listScenes() {
            const projectId = document.getElementById('project-id').value;
            
            if (!projectId) {
                alert('Please enter Project ID');
                return;
            }
            
            const resultDiv = document.getElementById('result');
            
            try {
                const response = await fetch(`../api/scenes.php?project_id=${projectId}`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    let html = '<h3>Scenes in project:</h3><ul>';
                    data.data.forEach(scene => {
                        html += `<li>ID: ${scene.id} - ${scene.lyrics || 'No lyrics'} 
                                 <button onclick="document.getElementById('scene-id').value='${scene.id}'">Select</button></li>`;
                    });
                    html += '</ul>';
                    resultDiv.innerHTML = html;
                } else {
                    resultDiv.innerHTML = `<pre class="error">Failed to load scenes:\n${JSON.stringify(data, null, 2)}</pre>`;
                }
            } catch (error) {
                resultDiv.innerHTML = `<pre class="error">Error: ${error.message}</pre>`;
            }
        }
    </script>
</body>
</html>