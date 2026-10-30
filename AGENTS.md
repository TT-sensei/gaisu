# がい数クエスト — 開発ルール

この教材はedu-kitの設計原則に沿って、小学校4年生の「概数」を学ぶ静的Web教材です。

## 作業開始時に確認するもの
1. edu-kit/AGENTS.md
2. edu-kit/DESIGN-PRINCIPLES.md
3. edu-kit/AI-GUIDE.md
4. 該当するedu-kit Skills
5. 使用する共通資産のAI-GUIDE・実装・カタログ

## 守ること
- 学習内容・問題・考える操作を、キャラクター・報酬・演出より目立たせる。
- タブレット横向きで、問題・選択肢・現在地・主要操作を見やすく配置する。
- メインクエストは10問。正答率だけで進行を止めず、つまずきは復習へつなげる。
- 答えを見たことを正答として記録しない。
- まちがえた問題を保存し、次の練習と迷いの洞窟で再出題する。
- 保存namespaceは gaisu-quest-v1。StorageManagerを使い、localStorageを各所から直接操作しない。
- ロジックはedu-components、UIはedu-effects、効果音はsounds-recipe-、共通バッジ画像はedu-assets、背景とナビキャラはnavi-character-を正本とする。
- 画像・音・演出が失敗しても学習本体を止めない。
- BGM、外部API、APIキー、外部DB、外部フォント、ビルド工程、追加依存パッケージを前提にしない。
- 画像原本をコピー・加工せず、確認済みの軽量WebPを参照する。
- 問題、正答、選択肢、解説はdata/以下で編集できるよう分離する。
- 数の丸め処理はjs/core/rounding.jsに集約する。

## ファイルの役割
- data/areas.js：エリア・寄り道・進行順
- data/questions.js：エリア別の問題バンク
- data/shopping.js：買い物ミッションと見積もり
- data/badges.js：バッジの表示情報と定義
- js/core/rounding.js：概数の計算
- js/core/engine.js：edu-components接続、判定、進行、保存、報酬
- js/core/audio.js：任意の効果音
- js/config.js：共通素材の参照先
- js/ui/render.js：画面表示
- js/main.js：画面遷移と操作
- css/theme.css：色・デザイントークン
- css/app.css：教材固有レイアウト

## 検証
Node.jsがある環境では、追加パッケージなしで node scripts/verify.mjs を実行します。
ホーム→クエスト→正解・不正解→ヒント・答えを見る→次の問題→結果→地図→復習→市場を確認します。PC、タブレット横・縦、スマートフォンで文字切れ、横スクロール、タップ範囲を確認します。