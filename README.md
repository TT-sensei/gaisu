# がい数クエスト

小学校4年生の「概数」を、ファンタジーの旅を通して学ぶ静的Web教材です。

## 学習の道筋
1. はじまりの森：四捨五入
2. 草原の道：切り上げ・切り捨て
3. 水辺の数字道：上から1けた・2けた
4. 古代遺跡：目的に応じた方法の使い分け
5. 大きな市場：買い物の合計を見積もり、予算と実際の金額を比べる

メインクエストは1回10問です。まちがえた問題は記録され、次のクエストに少し混ぜて再出題します。迷いの洞窟ではまちがい直し、特訓の広場では苦手分野、旅人の宿では混合問題、火山の試練では使い分け問題に挑戦できます。

エリアは10問取り組むと先へ進めます。正答率だけで進行を止めず、復習や再挑戦で自分のペースで力をつけられる設計です。答えを表示しただけでは正解として記録しません。

## 技術構成
- HTML / CSS / JavaScript Modules
- GitHub Pagesで直接動作（ビルド不要）
- localStorageによる端末内保存
- APIキー、外部API、外部DB、バックエンドなし
- BGMなし。効果音のみ（画面からON/OFF可能）
- タブレット横向き優先。スマートフォンにも対応

## ファイル構成
    index.html
    css/theme.css
    css/app.css
    data/areas.js
    data/questions.js
    data/shopping.js
    data/badges.js
    js/config.js
    js/core/rounding.js
    js/core/engine.js
    js/core/audio.js
    js/ui/render.js
    js/main.js
    scripts/verify.mjs
    AGENTS.md

問題文・正答・選択肢・解説は data/questions.js、エリア構成は data/areas.js、買い物問題は data/shopping.js、バッジは data/badges.js を編集します。数の丸め方は js/core/rounding.js に集約しています。

## EDU-KIT共通基盤
- edu-kit：設計原則と作業プロトコル
- edu-components：QuestionPool、AnswerChecker、ScoreManager、ComboManager、StorageManager、ProgressManager、UnlockManager、AchievementManager、BadgeManager
- edu-effects：基本UI、問題画面、正誤、達成、タッチ反応、画面シェル
- sounds-recipe-：正解・不正解・ヒント・達成などの短い効果音
- edu-assets：確認済みのクリアバッジ画像
- navi-character-：ファンタジー背景10種、集合画像3種

共通資産は公開済みの正本を参照し、素材をこのリポジトリに複製していません。画像は軽量WebPを使用します。

## 開発時の確認
追加パッケージなしで、Node.jsからデータと計算の整合性を確認できます。
    node scripts/verify.mjs

## ライセンス・利用条件
参照する共通基盤・素材には、それぞれのリポジトリに定められた利用条件が適用されます。現在確認できる範囲では、edu-components / edu-effects / sounds-recipe- はPolyForm Noncommercial、navi-character- / edu-assetsの画像はCC BY-NC 4.0です。この構成での利用は非営利の教育利用を前提とします。将来、商用利用する場合は、各権利者から別途許諾を得るか、利用条件を確認したうえで差し替えてください。

Copyright © 2026 TT-sensei.