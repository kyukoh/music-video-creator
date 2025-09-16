<?php
/**
 * Debug script to check data directory permissions and structure
 */

echo "<h1>Music Video Creator - Debug Information</h1>";

$dataDir = __DIR__ . '/data';
$projectsDir = $dataDir . '/projects';

echo "<h2>Directory Status</h2>";

// Check data directory
echo "<h3>Data Directory: $dataDir</h3>";
if (is_dir($dataDir)) {
    echo "✅ Exists<br>";
    echo "Permissions: " . substr(sprintf('%o', fileperms($dataDir)), -4) . "<br>";
    echo "Writable: " . (is_writable($dataDir) ? "✅ Yes" : "❌ No") . "<br>";
} else {
    echo "❌ Does not exist<br>";
    if (mkdir($dataDir, 0755, true)) {
        echo "✅ Created successfully<br>";
    } else {
        echo "❌ Failed to create<br>";
    }
}

// Check projects directory
echo "<h3>Projects Directory: $projectsDir</h3>";
if (is_dir($projectsDir)) {
    echo "✅ Exists<br>";
    echo "Permissions: " . substr(sprintf('%o', fileperms($projectsDir)), -4) . "<br>";
    echo "Writable: " . (is_writable($projectsDir) ? "✅ Yes" : "❌ No") . "<br>";
} else {
    echo "❌ Does not exist<br>";
    if (mkdir($projectsDir, 0755, true)) {
        echo "✅ Created successfully<br>";
    } else {
        echo "❌ Failed to create<br>";
    }
}

// Check projects.json
$projectsFile = $dataDir . '/projects.json';
echo "<h3>Projects File: $projectsFile</h3>";
if (file_exists($projectsFile)) {
    echo "✅ Exists<br>";
    echo "Readable: " . (is_readable($projectsFile) ? "✅ Yes" : "❌ No") . "<br>";
    echo "Writable: " . (is_writable($projectsFile) ? "✅ Yes" : "❌ No") . "<br>";
    
    $content = file_get_contents($projectsFile);
    $data = json_decode($content, true);
    if ($data) {
        echo "Valid JSON: ✅ Yes<br>";
        echo "Projects count: " . count($data['projects'] ?? []) . "<br>";
    } else {
        echo "Valid JSON: ❌ No<br>";
    }
} else {
    echo "❌ Does not exist<br>";
    $initialData = ['projects' => []];
    if (file_put_contents($projectsFile, json_encode($initialData, JSON_PRETTY_PRINT))) {
        echo "✅ Created successfully<br>";
    } else {
        echo "❌ Failed to create<br>";
    }
}

// List existing projects
if (is_dir($projectsDir)) {
    $projects = scandir($projectsDir);
    $projects = array_filter($projects, function($item) use ($projectsDir) {
        return $item !== '.' && $item !== '..' && is_dir($projectsDir . '/' . $item);
    });
    
    echo "<h2>Existing Projects</h2>";
    if (empty($projects)) {
        echo "No projects found.<br>";
    } else {
        foreach ($projects as $project) {
            echo "<h3>Project: $project</h3>";
            $projectDir = $projectsDir . '/' . $project;
            
            // Check config.json
            $configFile = $projectDir . '/config.json';
            echo "Config file: " . (file_exists($configFile) ? "✅ Exists" : "❌ Missing") . "<br>";
            
            // Check scenes.json
            $scenesFile = $projectDir . '/scenes.json';
            echo "Scenes file: " . (file_exists($scenesFile) ? "✅ Exists" : "❌ Missing") . "<br>";
            
            if (file_exists($scenesFile)) {
                $scenesData = json_decode(file_get_contents($scenesFile), true);
                if ($scenesData) {
                    echo "Scenes count: " . count($scenesData['scenes'] ?? []) . "<br>";
                }
            }
            
            // Check media directory
            $mediaDir = $projectDir . '/media';
            echo "Media directory: " . (is_dir($mediaDir) ? "✅ Exists" : "❌ Missing") . "<br>";
        }
    }
}

echo "<h2>PHP Information</h2>";
echo "PHP Version: " . phpversion() . "<br>";
echo "JSON Extension: " . (extension_loaded('json') ? "✅ Loaded" : "❌ Not loaded") . "<br>";
echo "File Info Extension: " . (extension_loaded('fileinfo') ? "✅ Loaded" : "❌ Not loaded") . "<br>";

echo "<h2>Test Write Operation</h2>";
$testFile = $dataDir . '/test_write.txt';
$testContent = 'Test write operation at ' . date('Y-m-d H:i:s');

if (file_put_contents($testFile, $testContent)) {
    echo "✅ Write test successful<br>";
    if (file_exists($testFile)) {
        echo "✅ File exists after write<br>";
        $readContent = file_get_contents($testFile);
        if ($readContent === $testContent) {
            echo "✅ Read test successful<br>";
        } else {
            echo "❌ Read test failed<br>";
        }
        unlink($testFile); // Clean up
    } else {
        echo "❌ File does not exist after write<br>";
    }
} else {
    echo "❌ Write test failed<br>";
}

echo "<hr>";
echo "<p><a href='public/'>← Back to Application</a></p>";
?>