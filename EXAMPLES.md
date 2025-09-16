# Music Video Creator - 使用例とサンプル

## 基本的な使用例

### 例1: 新しい楽曲プロジェクトの作成

**シナリオ**: 「夏の思い出」という楽曲のミュージックビデオを制作する

#### 事前準備: アプリケーションの起動
```bash
cd music-video-creator/public
php -S localhost:8000
```
ブラウザで `http://localhost:8000` にアクセス

#### ステップ1: プロジェクト作成
1. 「新規プロジェクト」をクリック
2. 以下を入力：
   - **楽曲名**: 夏の思い出
   - **備考**: 青春をテーマにしたポップソング、3分30秒

#### ステップ2: シーンの手動追加
```
シーン1:
- 開始時間: 0:00
- 歌詞: 青い空に響く笑い声
- シーン説明: 海辺で友達と遊ぶシーン
- 英語プロンプト: Friends playing on a sunny beach, blue sky, joyful atmosphere

シーン2:
- 開始時間: 0:15
- 歌詞: 風に舞う髪が輝いて
- シーン説明: 主人公の髪が風になびくクローズアップ
- 英語プロンプト: Close-up of girl's hair flowing in ocean breeze, golden sunlight

シーン3:
- 開始時間: 0:30
- 歌詞: 君と過ごした夏の日々
- シーン説明: 二人で夕日を見つめるシーン
- 英語プロンプト: Couple watching sunset together, romantic silhouette, warm colors
```

### 例2: CSVファイルからの一括登録

**シナリオ**: 事前に準備したシーン構成をCSVファイルから一括登録

#### sample_scenes.csv
```csv
start_time,lyrics,description,image_prompt,video_prompt
0:00,青い空に響く笑い声,海辺で友達と遊ぶシーン,Friends playing on sunny beach with blue sky,Dynamic shot of friends running on beach laughing
0:15,風に舞う髪が輝いて,主人公の髪が風になびくクローズアップ,Close-up girl's hair in ocean breeze golden light,Slow motion hair flowing in wind with sunlight
0:30,君と過ごした夏の日々,二人で夕日を見つめるシーン,Couple silhouette watching sunset romantic,Camera slowly pans around couple at sunset
0:45,思い出は色褪せない,写真を見返すシーン,Hands holding old photographs memories,Close-up hands flipping through photo album
1:00,あの時の気持ちのまま,笑顔で振り返る主人公,Girl smiling while reminiscing happy memories,Portrait shot girl smiling with soft lighting
```

#### 使用方法
1. 上記内容をCSVファイルとして保存
2. 「ファイルアップロード」→「ファイルを選択」
3. CSVファイルを選択してアップロード
4. 5つのシーンが自動的に作成される

### 例3: メディアライブラリの活用

**シナリオ**: AI生成した画像と動画を管理・活用

#### 画像ファイルの管理
```
アップロードする画像例:
- beach_scene_01.jpg (海辺のシーン)
- girl_portrait_01.jpg (主人公のポートレート)
- sunset_couple_01.jpg (夕日のカップル)
- photo_album_01.jpg (写真アルバム)
- smile_closeup_01.jpg (笑顔のクローズアップ)
```

#### 動画ファイルの管理
```
アップロードする動画例:
- beach_friends_running.mp4 (友達が走るシーン)
- hair_in_wind_slowmo.mp4 (髪がなびくスローモーション)
- sunset_romantic_pan.mp4 (夕日のパンニング)
- photo_album_flip.mp4 (写真をめくる動作)
- portrait_smile.mp4 (笑顔のポートレート)
```

## 高度な使用例

### 例4: 複雑な楽曲構成の管理

**シナリオ**: 「時の流れ」- 過去・現在・未来を描く4分の楽曲

#### 構成例
```
【イントロ】(0:00-0:20)
- 時計の音、モノクロの世界

【Aメロ1】(0:20-0:50)
- 子供時代の回想シーン

【Bメロ1】(0:50-1:10)
- 成長していく過程

【サビ1】(1:10-1:40)
- 現在の自分、カラフルな世界

【間奏】(1:40-2:00)
- 時計の針が回るアニメーション

【Aメロ2】(2:00-2:30)
- 現在の悩みや葛藤

【Bメロ2】(2:30-2:50)
- 未来への希望

【サビ2】(2:50-3:20)
- 明るい未来のビジョン

【アウトロ】(3:20-4:00)
- 全ての時代が重なる幻想的なシーン
```

#### CSVファイル例（time_flow_scenes.csv）
```csv
start_time,lyrics,description,image_prompt,video_prompt
0:00,,時計の音が響くモノクロの世界,Vintage clock ticking in monochrome world,Close-up clock hands moving with echo sound
0:20,小さな手で描いた夢,子供が絵を描いているシーン,Child drawing dreams with crayons colorful,Time-lapse child creating artwork with joy
0:35,あの頃は何も怖くなかった,無邪気に遊ぶ子供たち,Children playing innocently in playground,Wide shot kids playing carefree in park
0:50,時は流れて,成長していく主人公のモンタージュ,Person growing up through different ages,Morphing transition showing aging process
1:10,今の僕は立っている,現在の主人公が街に立つ,Young adult standing confidently in city,Drone shot person standing in urban landscape
1:25,色とりどりの世界で,カラフルな現代の街並み,Vibrant colorful modern cityscape,Dynamic camera movement through colorful city
1:40,,時計の針が早回しで回る,Clock hands spinning rapidly time passage,Extreme close-up clock hands accelerating
2:00,迷いながらも歩いている,悩みながら歩く主人公,Person walking thoughtfully through crowd,Tracking shot following contemplative walk
2:15,答えはまだ見つからない,困惑した表情のクローズアップ,Close-up confused expression searching,Slow zoom on face showing inner conflict
2:30,でも信じてる明日を,希望に満ちた表情,Hopeful expression looking toward future,Portrait with warm lighting showing hope
2:50,輝く未来が待ってる,明るい未来の風景,Bright futuristic landscape full of light,Sweeping aerial view of bright future world
3:05,僕らしく生きていこう,自信に満ちた主人公,Confident person embracing their identity,360-degree shot person with arms spread wide
3:20,全ての時が重なって,過去現在未来が重なる幻想的シーン,Surreal scene past present future overlapping,Complex visual effects multiple timelines
3:40,永遠に続く物語,無限に続く道,Infinite road stretching to horizon,Long tracking shot endless road perspective
```

### 例5: プロンプトテンプレートの活用

**シナリオ**: 一貫したビジュアルスタイルを保つためのプロンプトテンプレート

#### 画像生成プロンプトのテンプレート
```
基本スタイル: "cinematic lighting, 4K resolution, professional photography"
色調: "warm golden hour lighting" または "cool blue hour atmosphere"
カメラ: "shot with Canon EOS R5, 85mm lens, shallow depth of field"
品質: "highly detailed, sharp focus, award-winning photography"

例:
"Young woman on beach, cinematic lighting, 4K resolution, professional photography, warm golden hour lighting, shot with Canon EOS R5, 85mm lens, shallow depth of field, highly detailed, sharp focus, award-winning photography"
```

#### 動画生成プロンプトのテンプレート
```
基本設定: "4K video, 24fps, cinematic quality"
カメラワーク: "smooth camera movement" または "handheld natural movement"
ライティング: "natural lighting, golden hour" または "soft studio lighting"
品質: "professional videography, color graded"

例:
"Friends running on beach, 4K video, 24fps, cinematic quality, smooth camera movement, natural lighting, golden hour, professional videography, color graded"
```

## 実践的なワークフロー例

### ワークフロー1: AI生成ツールとの連携

#### ステップ1: プロンプト作成
1. Music Video Creatorでシーン構成を作成
2. 各シーンの英語プロンプトを詳細に記述

#### ステップ2: AI画像生成
1. Midjourney、DALL-E、Stable Diffusionなどを使用
2. プロンプトをコピー&ペーストして画像生成
3. 生成された画像をダウンロード

#### ステップ3: 画像の管理
1. Music Video Creatorのメディアライブラリにアップロード
2. 各シーンに適切な画像を関連付け

#### ステップ4: 動画生成（オプション）
1. RunwayML、Pika Labsなどで動画生成
2. 画像と動画プロンプトを組み合わせて使用

### ワークフロー2: 編集ソフトとの連携

#### データのエクスポート
```javascript
// シーンデータの取得（開発者向け）
// ブラウザの開発者ツールで実行
const scenes = await API.get('api/scenes.php?project_id=' + AppState.currentProject.id);
console.log(JSON.stringify(scenes.data, null, 2));
```

#### 編集ソフトでの活用
1. **Adobe Premiere Pro**: XMLファイルとして書き出し
2. **DaVinci Resolve**: CSVファイルでタイムライン作成
3. **Final Cut Pro**: XMLファイルでプロジェクト作成

## サンプルファイル

### sample_lyrics.txt
```
青い空に響く笑い声
風に舞う髪が輝いて
君と過ごした夏の日々
思い出は色褪せない
あの時の気持ちのまま
今でも心に残ってる
```

### sample_detailed.csv
```csv
start_time,lyrics,description,image_prompt,video_prompt
0:00,青い空に響く笑い声,海辺で友達と遊ぶオープニング,Group of friends playing on sunny beach with blue sky and white clouds,Wide establishing shot of friends running and playing on beach with dynamic movement
0:15,風に舞う髪が輝いて,主人公の髪が風になびく美しいシーン,Close-up of young woman's hair flowing in ocean breeze with golden sunlight,Slow motion close-up of hair flowing in wind with warm backlighting
0:30,君と過ごした夏の日々,カップルが夕日を見つめるロマンチックなシーン,Silhouette of couple watching sunset together on beach romantic atmosphere,Slow pan around couple watching sunset with warm orange and pink sky
0:45,思い出は色褪せない,古い写真を見返す懐かしいシーン,Hands gently holding vintage photographs with soft lighting and memories,Close-up of hands slowly flipping through old photo album with nostalgic feel
1:00,あの時の気持ちのまま,笑顔で過去を振り返る主人公,Portrait of young woman smiling while reminiscing with soft warm lighting,Medium shot of woman smiling with gentle camera movement and soft focus background
```

## トラブルシューティング例

### よくある使用上の問題

#### 問題1: プロンプトが長すぎる
**症状**: AI生成ツールでエラーが発生
**解決策**: プロンプトを要素ごとに分割

```
長すぎる例:
"Beautiful young woman with long flowing hair standing on a beach during golden hour with waves crashing behind her while she looks pensively into the distance with a slight smile on her face wearing a white summer dress that flows in the ocean breeze"

改善例:
"Beautiful young woman, long flowing hair, beach golden hour, white summer dress, ocean breeze, pensive expression, slight smile"
```

#### 問題2: シーンの時間軸がずれる
**症状**: 音楽とシーンのタイミングが合わない
**解決策**: 実際の楽曲を聞きながら時間を調整

```
調整前: 0:00, 0:15, 0:30, 0:45
調整後: 0:00, 0:12, 0:28, 0:44 (実際の歌詞のタイミングに合わせる)
```

#### 問題3: 一貫性のないビジュアル
**症状**: シーンごとに画風が大きく異なる
**解決策**: 共通のスタイルプロンプトを使用

```
共通スタイル: "anime style, Studio Ghibli inspired, soft colors, dreamy atmosphere"

各シーンに追加:
シーン1: "anime style, Studio Ghibli inspired, soft colors, dreamy atmosphere, friends on beach"
シーン2: "anime style, Studio Ghibli inspired, soft colors, dreamy atmosphere, girl portrait"
```

---

これらの例を参考に、あなた独自のミュージックビデオ制作ワークフローを構築してください。