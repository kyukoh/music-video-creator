<!DOCTYPE html>
<html>
<head>
    <title>Scene Upload Test</title>
</head>
<body>
    <h1>シーンファイルアップロードテスト</h1>
    
    <form action="api/scenes.php?action=upload" method="POST" enctype="multipart/form-data">
        <div>
            <label>プロジェクトID:</label>
            <input type="text" name="project_id" value="proj_68c42ca6d0399" required>
        </div>
        <div>
            <label>ファイル:</label>
            <input type="file" name="file" accept=".txt,.csv" required>
        </div>
        <button type="submit">アップロード</button>
    </form>
    
    <hr>
    
    <h2>サンプルファイル</h2>
    <ul>
        <li><a href="sample-scenes.txt" download>sample-scenes.txt</a> - テキスト形式</li>
        <li><a href="sample-scenes.csv" download>sample-scenes.csv</a> - CSV形式</li>
    </ul>
</body>
</html>