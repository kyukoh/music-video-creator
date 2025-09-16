<?php
/**
 * APIテストページ
 */

// エラー表示を有効化
ini_set('display_errors', 1);
error_reporting(E_ALL);

?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>API Test</title>
    <style>
        body { font-family: monospace; padding: 20px; }
        .test { margin: 20px 0; padding: 10px; border: 1px solid #ccc; }
        .success { background: #e7f5e7; }
        .error { background: #ffe7e7; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
        pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Music Video Creator - API Test</h1>
    
    <div class="test">
        <h2>1. PHP環境チェック</h2>
        <pre><?php 
            echo "PHP Version: " . phpversion() . "\n";
            echo "Current Directory: " . __DIR__ . "\n";
            echo "Config File: " . (file_exists('../config.php') ? '✓ Found' : '✗ Not Found') . "\n";
            echo "Data Directory: " . (file_exists('../data') ? '✓ Found' : '✗ Not Found') . "\n";
            
            // ディレクトリの書き込み権限チェック
            $dataDir = '../data';
            if (file_exists($dataDir)) {
                echo "Data Directory Writable: " . (is_writable($dataDir) ? '✓ Yes' : '✗ No') . "\n";
            }
            
            // projects.jsonの存在チェック
            $projectsFile = '../data/projects.json';
            if (file_exists($projectsFile)) {
                echo "projects.json: ✓ Found\n";
                $content = file_get_contents($projectsFile);
                echo "projects.json content: " . substr($content, 0, 100) . "...\n";
            } else {
                echo "projects.json: ✗ Not Found\n";
            }
        ?></pre>
    </div>
    
    <div class="test">
        <h2>2. API エンドポイントテスト</h2>
        <button onclick="testProjectsAPI()">Test Projects API</button>
        <button onclick="createTestProject()">Create Test Project</button>
        <button onclick="testAllAPIs()">Test All APIs</button>
        <div id="api-result"></div>
    </div>
    
    <div class="test">
        <h2>3. JavaScript コンソール</h2>
        <div id="console-output" style="background: #000; color: #0f0; padding: 10px; min-height: 100px; font-family: monospace; overflow-y: auto; max-height: 300px;"></div>
    </div>

    <script>
        // コンソール出力をページに表示
        const consoleOutput = document.getElementById('console-output');
        const originalLog = console.log;
        const originalError = console.error;
        
        console.log = function(...args) {
            originalLog.apply(console, args);
            consoleOutput.innerHTML += '<div style="color: #0f0;">&gt; ' + args.join(' ') + '</div>';
        };
        
        console.error = function(...args) {
            originalError.apply(console, args);
            consoleOutput.innerHTML += '<div style="color: #f00;">&gt; ERROR: ' + args.join(' ') + '</div>';
        };
        
        // API テスト関数
        async function testProjectsAPI() {
            console.log('Testing Projects API...');
            const resultDiv = document.getElementById('api-result');
            
            try {
                const response = await fetch('api/projects.php');
                const text = await response.text();
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers.get('content-type'));
                
                let data;
                try {
                    data = JSON.parse(text);
                    console.log('Parsed JSON:', data);
                } catch (e) {
                    console.error('Failed to parse JSON. Raw response:', text);
                    resultDiv.innerHTML = `<pre class="error">Failed to parse JSON:\n${text}</pre>`;
                    return;
                }
                
                if (response.ok) {
                    resultDiv.innerHTML = `<pre class="success">SUCCESS: Projects API\n${JSON.stringify(data, null, 2)}</pre>`;
                } else {
                    resultDiv.innerHTML = `<pre class="error">ERROR: ${response.status}\n${JSON.stringify(data, null, 2)}</pre>`;
                }
            } catch (error) {
                console.error('Fetch error:', error);
                resultDiv.innerHTML = `<pre class="error">FETCH ERROR: ${error.message}</pre>`;
            }
        }
        
        async function createTestProject() {
            console.log('Creating test project...');
            const resultDiv = document.getElementById('api-result');
            
            try {
                const response = await fetch('api/projects.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: 'Test Project ' + new Date().toISOString(),
                        description: 'This is a test project'
                    })
                });
                
                const text = await response.text();
                console.log('Response status:', response.status);
                
                let data;
                try {
                    data = JSON.parse(text);
                    console.log('Created project:', data);
                } catch (e) {
                    console.error('Failed to parse JSON. Raw response:', text);
                    resultDiv.innerHTML = `<pre class="error">Failed to parse JSON:\n${text}</pre>`;
                    return;
                }
                
                if (response.ok && data.success) {
                    resultDiv.innerHTML = `<pre class="success">Project created successfully!\n${JSON.stringify(data, null, 2)}</pre>`;
                } else {
                    resultDiv.innerHTML = `<pre class="error">Failed to create project:\n${JSON.stringify(data, null, 2)}</pre>`;
                }
            } catch (error) {
                console.error('Create project error:', error);
                resultDiv.innerHTML = `<pre class="error">CREATE ERROR: ${error.message}</pre>`;
            }
        }
        
        async function testAllAPIs() {
            console.log('Testing all API endpoints...');
            const endpoints = [
                { url: 'api/projects.php', method: 'GET' },
                { url: 'api/scenes.php?project_id=test', method: 'GET' },
                { url: 'api/media.php?project_id=test', method: 'GET' }
            ];
            
            const resultDiv = document.getElementById('api-result');
            let results = [];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint.url, { method: endpoint.method });
                    const text = await response.text();
                    
                    let data;
                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        data = { error: 'Invalid JSON', raw: text.substring(0, 100) };
                    }
                    
                    results.push({
                        endpoint: endpoint.url,
                        status: response.status,
                        success: response.ok,
                        data: data
                    });
                } catch (error) {
                    results.push({
                        endpoint: endpoint.url,
                        status: 'ERROR',
                        success: false,
                        error: error.message
                    });
                }
            }
            
            resultDiv.innerHTML = `<pre>${JSON.stringify(results, null, 2)}</pre>`;
        }
        
        // ページ読み込み時に基本チェック
        window.addEventListener('DOMContentLoaded', () => {
            console.log('Test page loaded');
            console.log('Window location:', window.location.href);
            console.log('Ready to test APIs');
        });
    </script>
</body>
</html>