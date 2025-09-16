# UI設計書

## 概要

ミュージックビデオ作成サポートツールのユーザーインターフェース設計書です。レスポンシブデザインでTailwindCSSを使用し、直感的で効率的な操作を可能にするUI/UXを提供します。

## 全体レイアウト構成

### 基本レイアウト構造

```
┌─────────────────────────────────────────────────────────┐
│                    ヘッダーバー                          │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│  サイドメニュー │            メインコンテンツエリア          │
│              │                                          │
│  プロジェクト   │                                          │
│  一覧         │                                          │
│              │                                          │
│              │                                          │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

### レスポンシブ対応

- **デスクトップ（1024px以上）**: サイドメニュー固定表示、折りたたみ機能あり
- **タブレット（768px-1023px）**: サイドメニュー折りたたみ可能、デフォルト折りたたみ状態
- **モバイル（767px以下）**: サイドメニューオーバーレイ表示

## 画面別詳細設計

### 1. ヘッダーバー

#### レイアウト
```
┌─────────────────────────────────────────────────────────┐
│ [≡] Music Video Creator    [プロジェクト名]    [設定] │
└─────────────────────────────────────────────────────────┘
```

#### 構成要素
- **ハンバーガーメニュー**: モバイル時のサイドメニュー開閉
- **アプリケーションタイトル**: "Music Video Creator"
- **現在のプロジェクト名**: 選択中のプロジェクト表示
- **設定ボタン**: 将来の拡張用

#### TailwindCSSクラス例
```html
<header class="bg-gray-800 text-white p-4 flex justify-between items-center">
  <div class="flex items-center space-x-4">
    <button class="md:hidden">☰</button>
    <h1 class="text-xl font-bold">Music Video Creator</h1>
  </div>
  <div class="text-sm text-gray-300">プロジェクト: 楽曲名</div>
</header>
```

### 2. サイドメニュー（プロジェクト一覧）

#### レイアウト

**基本幅（展開状態）**:
```
┌──────────────┐
│ [≡] プロジェクト一覧 │
├──────────────┤
│ [+ 新規作成]   │
├──────────────┤
│ □ 楽曲A       │
│   備考テキスト  │
├──────────────┤
│ ■ 楽曲B       │
│   備考テキスト  │
├──────────────┤
│ □ 楽曲C       │
│   備考テキスト  │
└──────────────┘
```

**最小幅（折りたたみ状態）**:
```
┌──┐
│≡ │
├──┤
│+ │
├──┤
│□ │
├──┤
│■ │
├──┤
│□ │
└──┘
```

#### 構成要素
- **折りたたみアイコン**: サイドメニュー上部に配置（≡）
- **基本幅**: 256px（w-64）- プロジェクト名と備考が表示
- **最小幅**: 64px（w-16）- アイコンのみ表示
- **新規プロジェクト作成ボタン**: 
  - 展開時: 「+ 新規プロジェクト作成」
  - 折りたたみ時: 「+」アイコンのみ
- **プロジェクト項目**: 
  - 展開時: 楽曲名 + 備考テキスト
  - 折りたたみ時: 選択状態アイコンのみ
  - ホバー時: ツールチップで楽曲名表示

#### TailwindCSSクラス例
```html
<!-- 展開状態 -->
<aside class="w-64 bg-gray-100 h-full overflow-y-auto transition-all duration-300" id="sidebar">
  <div class="p-4 border-b">
    <div class="flex items-center justify-between">
      <button class="p-2 hover:bg-gray-200 rounded" onclick="toggleSidebar()">
        <svg class="w-5 h-5">≡</svg>
      </button>
      <span class="font-semibold sidebar-text">プロジェクト一覧</span>
    </div>
  </div>
  <div class="p-4">
    <button class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 sidebar-text">
      + 新規プロジェクト作成
    </button>
    <button class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 sidebar-icon hidden">
      +
    </button>
  </div>
  <div class="space-y-2 p-2">
    <div class="bg-white p-3 rounded shadow cursor-pointer hover:bg-gray-50 border-l-4 border-blue-500 relative group">
      <div class="font-semibold sidebar-text">楽曲名</div>
      <div class="text-sm text-gray-600 sidebar-text">備考テキスト</div>
      <div class="sidebar-icon hidden w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
        <div class="w-3 h-3 bg-white rounded"></div>
      </div>
      <!-- ツールチップ -->
      <div class="absolute left-full ml-2 px-2 py-1 bg-black text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity sidebar-tooltip hidden">
        楽曲名
      </div>
    </div>
  </div>
</aside>

<!-- 折りたたみ状態 -->
<aside class="w-16 bg-gray-100 h-full overflow-y-auto transition-all duration-300" id="sidebar-collapsed">
  <div class="p-2 border-b">
    <button class="p-2 hover:bg-gray-200 rounded w-full" onclick="toggleSidebar()">
      <svg class="w-5 h-5 mx-auto">≡</svg>
    </button>
  </div>
  <div class="p-2">
    <button class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
      +
    </button>
  </div>
  <div class="space-y-2 p-2">
    <div class="w-12 h-12 bg-blue-500 rounded flex items-center justify-center cursor-pointer hover:bg-blue-600 relative group">
      <div class="w-3 h-3 bg-white rounded"></div>
      <!-- ツールチップ -->
      <div class="absolute left-full ml-2 px-2 py-1 bg-black text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        楽曲名
      </div>
    </div>
  </div>
</aside>
```

#### JavaScript制御例
```javascript
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const isCollapsed = sidebar.classList.contains('w-16');
  
  if (isCollapsed) {
    // 展開
    sidebar.classList.remove('w-16');
    sidebar.classList.add('w-64');
    document.querySelectorAll('.sidebar-text').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.sidebar-icon').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.sidebar-tooltip').forEach(el => el.classList.add('hidden'));
  } else {
    // 折りたたみ
    sidebar.classList.remove('w-64');
    sidebar.classList.add('w-16');
    document.querySelectorAll('.sidebar-text').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.sidebar-icon').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.sidebar-tooltip').forEach(el => el.classList.remove('hidden'));
  }
}

### 3. シーン一覧画面

#### レイアウト
```
┌─────────────────────────────────────────────────────────┐
│ シーン一覧                              [メディアライブラリ] │
├─────────────────────────────────────────────────────────┤
│ [サムネ] [時間] [歌詞]      [説明]      [プロンプト]      │
├─────────────────────────────────────────────────────────┤
│ [img]   0:00   歌詞テキスト  シーン説明   英語プロンプト    │
│ [img]   0:15   歌詞テキスト  シーン説明   英語プロンプト    │
│ [img]   0:30   歌詞テキスト  シーン説明   英語プロンプト    │
├─────────────────────────────────────────────────────────┤
│ [+]     [時間] [歌詞入力]   [説明入力]   [プロンプト入力]  │
└─────────────────────────────────────────────────────────┘
```

#### 構成要素

**ヘッダー部分**:
- **タイトル**: "シーン一覧"
- **メディアライブラリボタン**: 右上に配置

**テーブルヘッダー**:
- サムネイル（60px幅）
- 開始時間（80px幅）
- 歌詞（可変幅、最小200px）
- シーン説明（可変幅、最小150px）
- 英語プロンプト（可変幅、最小200px）

**シーン行**:
- **サムネイル**: 50x50pxの画像またはプレースホルダー
- **開始時間**: "分:秒"形式、クリックで編集
- **歌詞**: テキスト、クリックで編集
- **シーン説明**: テキスト、クリックで編集
- **英語プロンプト**: テキスト、クリックで編集
- **行クリック**: 入力欄以外の部分をクリックすると詳細編集画面に遷移

**新規追加行**:
- プラスアイコン
- 各項目の入力フィールド

#### TailwindCSSクラス例
```html
<div class="p-6">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-2xl font-bold">シーン一覧</h2>
    <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
      メディアライブラリ
    </button>
  </div>
  
  <div class="overflow-x-auto">
    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 p-2 w-16">サムネ</th>
          <th class="border border-gray-300 p-2 w-20">時間</th>
          <th class="border border-gray-300 p-2 min-w-48">歌詞</th>
          <th class="border border-gray-300 p-2 min-w-36">説明</th>
          <th class="border border-gray-300 p-2 min-w-48">プロンプト</th>
        </tr>
      </thead>
      <tbody>
        <tr class="hover:bg-gray-50 cursor-pointer" onclick="openSceneDetail(sceneId)">
          <td class="border border-gray-300 p-2">
            <img src="thumbnail.jpg" class="w-12 h-12 object-cover rounded">
          </td>
          <td class="border border-gray-300 p-2" onclick="event.stopPropagation()">
            <input type="text" value="0:00" class="w-full bg-transparent border-none outline-none">
          </td>
          <td class="border border-gray-300 p-2" onclick="event.stopPropagation()">
            <textarea class="w-full bg-transparent border-none outline-none resize-none">歌詞テキスト</textarea>
          </td>
          <td class="border border-gray-300 p-2" onclick="event.stopPropagation()">
            <textarea class="w-full bg-transparent border-none outline-none resize-none">シーン説明</textarea>
          </td>
          <td class="border border-gray-300 p-2" onclick="event.stopPropagation()">
            <textarea class="w-full bg-transparent border-none outline-none resize-none">英語プロンプト</textarea>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### 4. シーン詳細編集画面

#### レイアウト
```
┌─────────────────────────────────────────────────────────┐
│ シーン詳細編集                    [保存] [キャンセル]     │
├─────────────────────────────────────────────────────────┤
│ 基本情報                                                │
│ 開始時間: [0:00    ]                                   │
│ 歌詞:                                                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│ シーン説明:                                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ 画像設定                                                │
│ ┌─────────────────┬───────────────────────────────────┐ │
│ │ 画像生成プロンプト: │ 画像ファイル:                     │ │
│ │ ┌─────────────┐ │ [メディアライブラリから選択]       │ │
│ │ │             │ │ ┌─────────────────────────────┐ │ │
│ │ │             │ │ │                             │ │ │
│ │ │             │ │ │     設定された画像を表示      │ │ │
│ │ │             │ │ │                             │ │ │
│ │ └─────────────┘ │ └─────────────────────────────┘ │ │
│ └─────────────────┴───────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ 動画設定                                                │
│ ┌─────────────────┬───────────────────────────────────┐ │
│ │ 動画生成プロンプト: │ 動画ファイル:                     │ │
│ │ ┌─────────────┐ │ [メディアライブラリから選択]       │ │
│ │ │             │ │ ┌─────────────────────────────┐ │ │
│ │ │             │ │ │                             │ │ │
│ │ │             │ │ │  設定された動画を表示・再生   │ │ │
│ │ │             │ │ │      [▶️] [⏸️] [🔊]          │ │ │
│ │ └─────────────┘ │ └─────────────────────────────┘ │ │
│ └─────────────────┴───────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### 構成要素

**ヘッダー部分**:
- タイトル: "シーン詳細編集"
- 保存ボタン（青色）
- キャンセルボタン（グレー）

**基本情報セクション**:
- 開始時間入力フィールド
- 歌詞テキストエリア（3行）
- シーン説明テキストエリア（3行）
- ※サムネイル表示は削除

**画像設定セクション**（横並びレイアウト）:
- **左側**: 画像生成プロンプトテキストエリア（4行、幅50%）
- **右側**: 画像ファイル設定エリア（幅50%）
  - メディアライブラリ選択ボタン
  - **設定された画像の表示エリア**（300x200px）
  - 画像が設定されている場合: 実際の画像を表示
  - 画像が未設定の場合: 「画像が設定されていません」プレースホルダー

**動画設定セクション**（横並びレイアウト）:
- **左側**: 動画生成プロンプトテキストエリア（4行、幅50%）
- **右側**: 動画ファイル設定エリア（幅50%）
  - メディアライブラリ選択ボタン
  - **設定された動画の表示・再生エリア**（400x300px）
  - 動画が設定されている場合: 動画プレーヤーを表示
  - 再生/一時停止ボタン、音量調整
  - 動画が未設定の場合: 「動画が設定されていません」プレースホルダー

#### TailwindCSSクラス例
```html
<div class="p-6 max-w-4xl mx-auto">
  <!-- ヘッダー -->
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-2xl font-bold">シーン詳細編集</h2>
    <div class="space-x-2">
      <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">保存</button>
      <button class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">キャンセル</button>
    </div>
  </div>

  <!-- 基本情報 -->
  <div class="bg-white p-6 rounded-lg shadow mb-6">
    <h3 class="text-lg font-semibold mb-4">基本情報</h3>
    <div class="grid grid-cols-1 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">開始時間</label>
        <input type="text" class="w-32 px-3 py-2 border border-gray-300 rounded" placeholder="0:00">
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">歌詞</label>
        <textarea class="w-full px-3 py-2 border border-gray-300 rounded h-20" placeholder="歌詞を入力"></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">シーン説明</label>
        <textarea class="w-full px-3 py-2 border border-gray-300 rounded h-20" placeholder="シーン説明を入力"></textarea>
      </div>
    </div>
  </div>

  <!-- 画像設定 -->
  <div class="bg-white p-6 rounded-lg shadow mb-6">
    <h3 class="text-lg font-semibold mb-4">画像設定</h3>
    <div class="grid grid-cols-2 gap-6">
      <!-- 左側: プロンプト -->
      <div>
        <label class="block text-sm font-medium mb-2">画像生成プロンプト</label>
        <textarea class="w-full px-3 py-2 border border-gray-300 rounded h-32" placeholder="画像生成プロンプトを入力"></textarea>
      </div>
      <!-- 右側: 画像ファイル -->
      <div>
        <label class="block text-sm font-medium mb-2">画像ファイル</label>
        <div class="space-y-3">
          <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            メディアライブラリから選択
          </button>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <!-- 画像が設定されている場合 -->
            <div class="image-preview hidden">
              <img src="" alt="設定された画像" class="max-w-full h-32 object-contain mx-auto rounded">
              <p class="text-center text-sm text-gray-600 mt-2">filename.jpg</p>
            </div>
            <!-- 画像が未設定の場合 -->
            <div class="image-placeholder text-center py-8 text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
              </svg>
              <p class="text-sm">画像が設定されていません</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 動画設定 -->
  <div class="bg-white p-6 rounded-lg shadow">
    <h3 class="text-lg font-semibold mb-4">動画設定</h3>
    <div class="grid grid-cols-2 gap-6">
      <!-- 左側: プロンプト -->
      <div>
        <label class="block text-sm font-medium mb-2">動画生成プロンプト</label>
        <textarea class="w-full px-3 py-2 border border-gray-300 rounded h-32" placeholder="動画生成プロンプトを入力"></textarea>
      </div>
      <!-- 右側: 動画ファイル -->
      <div>
        <label class="block text-sm font-medium mb-2">動画ファイル</label>
        <div class="space-y-3">
          <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            メディアライブラリから選択
          </button>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <!-- 動画が設定されている場合 -->
            <div class="video-preview hidden">
              <video class="max-w-full h-40 mx-auto rounded" controls>
                <source src="" type="video/mp4">
                お使いのブラウザは動画タグをサポートしていません。
              </video>
              <p class="text-center text-sm text-gray-600 mt-2">filename.mp4</p>
            </div>
            <!-- 動画が未設定の場合 -->
            <div class="video-placeholder text-center py-12 text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM5 8a1 1 0 011-1h1a1 1 0 010 2H6a1 1 0 01-1-1zm6 1a1 1 0 100 2h3a1 1 0 100-2h-3z"></path>
              </svg>
              <p class="text-sm">動画が設定されていません</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 5. メディアライブラリ画面

#### レイアウト
```
┌─────────────────────────────────────────────────────────┐
│ メディアライブラリ                        [閉じる]       │
├─────────────────────────────────────────────────────────┤
│ [全て] [画像のみ] [動画のみ]                             │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │          ファイルをドロップしてアップロード            │ │
│ │                    または                           │ │
│ │                [ファイル選択]                        │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                │
│ │img│ │img│ │vid│ │img│ │vid│ │img│                │
│ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘                │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐                            │
│ │img│ │vid│ │img│ │vid│                            │
│ └───┘ └───┘ └───┘ └───┘                            │
├─────────────────────────────────────────────────────────┤
│ 選択中: filename.jpg                    [削除]         │
└─────────────────────────────────────────────────────────┘
```

#### 構成要素

**ヘッダー部分**:
- タイトル: "メディアライブラリ"
- 閉じるボタン

**フィルタータブ**:
- 全て表示（デフォルト選択）
- 画像のみ
- 動画のみ

**アップロードエリア**:
- ドラッグ&ドロップゾーン（点線枠）
- ファイル選択ボタン
- アップロード進捗表示

**ファイル一覧エリア**:
- グリッドレイアウト（6列）
- ファイルアイコン（100x100px）
- 画像はサムネイル表示
- 動画は再生アイコン付きサムネイル
- 選択状態の視覚的表示

**フッター部分**:
- 選択中ファイル名表示
- 削除ボタン

#### TailwindCSSクラス例
```html
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg w-4/5 h-4/5 flex flex-col">
    <!-- ヘッダー -->
    <div class="flex justify-between items-center p-4 border-b">
      <h2 class="text-xl font-bold">メディアライブラリ</h2>
      <button class="text-gray-500 hover:text-gray-700">✕</button>
    </div>
    
    <!-- フィルター -->
    <div class="flex space-x-2 p-4 border-b">
      <button class="px-4 py-2 bg-blue-500 text-white rounded">全て</button>
      <button class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">画像のみ</button>
      <button class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">動画のみ</button>
    </div>
    
    <!-- アップロードエリア -->
    <div class="p-4 border-b">
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400">
        <p class="text-gray-600">ファイルをドロップしてアップロード</p>
        <p class="text-sm text-gray-500 mt-2">または</p>
        <button class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          ファイル選択
        </button>
      </div>
    </div>
    
    <!-- ファイル一覧 -->
    <div class="flex-1 p-4 overflow-y-auto">
      <div class="grid grid-cols-6 gap-4">
        <div class="border-2 border-blue-500 rounded cursor-pointer">
          <img src="image.jpg" class="w-full h-24 object-cover rounded">
          <p class="text-xs p-1 truncate">image.jpg</p>
        </div>
      </div>
    </div>
    
    <!-- フッター -->
    <div class="flex justify-between items-center p-4 border-t bg-gray-50">
      <span class="text-sm text-gray-600">選択中: image.jpg</span>
      <button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">削除</button>
    </div>
  </div>
</div>
```

## インタラクション設計

### 1. プロジェクト管理フロー

```
プロジェクト一覧 → 新規作成ボタン → 作成フォーム → 保存 → シーン一覧画面
                ↓
              既存選択 → シーン一覧画面
```

### 2. シーン編集フロー

```
シーン一覧 → インライン編集 → 自動保存
          ↓
        行クリック（入力欄以外） → 詳細編集画面 → 保存/キャンセル → シーン一覧
```

### 3. メディア管理フロー

```
メディアライブラリ → ファイルアップロード → 一覧更新
                  ↓
                ファイル選択 → シーン関連付け
```

## レスポンシブ対応

### ブレークポイント
- **sm**: 640px以上
- **md**: 768px以上  
- **lg**: 1024px以上
- **xl**: 1280px以上

### モバイル対応
- サイドメニューをオーバーレイ表示
- テーブルを横スクロール対応
- タッチ操作に適したボタンサイズ（44px以上）
- フォントサイズの調整

## アクセシビリティ

### キーボード操作
- Tab順序の適切な設定
- Enter/Spaceキーでの操作
- Escapeキーでのモーダル閉じる

### スクリーンリーダー対応
- 適切なaria-label設定
- セマンティックなHTML構造
- フォーカス管理

### 色彩・コントラスト
- WCAG 2.1 AA準拠のコントラスト比
- 色だけに依存しない情報伝達
- ダークモード対応（将来拡張）

## 状態管理

### ローディング状態
- API通信中のスピナー表示
- ファイルアップロード進捗
- ボタンの無効化

### エラー状態
- エラーメッセージの表示位置
- フォームバリデーションエラー
- 通信エラーの処理

### 成功状態
- 操作完了の通知
- 自動保存の表示
- 一時的な成功メッセージ