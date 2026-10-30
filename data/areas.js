export const MAIN_AREAS = [
{id:"forest",number:"01",name:"はじまりの森",topic:"四捨五入",subtitle:"残す位のとなりの数字を見よう",description:"十・百・千の位まで、四捨五入で概数にしよう。",background:"forest",clearBadge:"forest-clear"},
{id:"grassland",number:"02",name:"草原の道",topic:"切り上げ・切り捨て",subtitle:"目的に合わせて多め・少なめに",description:"切り上げと切り捨てで、見積もり方を使い分けよう。",background:"grassland",clearBadge:"grassland-clear"},
{id:"riverbank",number:"03",name:"水辺の数字道",topic:"上から何けた",subtitle:"大きな数をすっきり表そう",description:"上から1けた・2けたを残して、概数にしよう。",background:"riverbank",clearBadge:"riverbank-clear"},
{id:"ruins",number:"04",name:"古代遺跡",topic:"目的に応じた使い分け",subtitle:"何のために見積もるのか考えよう",description:"人数・材料・予算など、目的に合った方法を選ぼう。",background:"ruins",clearBadge:"ruins-clear"}
];
export const MARKET_AREA={id:"market",number:"05",name:"大きな市場",topic:"買い物と見積もり",subtitle:"概数を生活の中で使ってみよう",description:"買い物の合計を見積もり、予算と実際の金額を比べよう。",background:"town",clearBadge:"market-estimate"};
export const AREAS=[...MAIN_AREAS,MARKET_AREA];
export const SIDE_TRIPS=[
{id:"cave",name:"迷いの洞窟",subtitle:"まちがえた問題をもう一度",description:"まちがいを見直して、できる問題に変えよう。",icon:"🕯️",background:"cave",mode:"cave"},
{id:"training",name:"特訓の広場",subtitle:"苦手なところを5問",description:"今の自分に合った問題で、もう一度練習しよう。",icon:"🎯",background:"training-ground",mode:"training"},
{id:"inn",name:"旅人の宿",subtitle:"いろいろな問題を10問",description:"これまでに開いたエリアから、まぜこぜで出題。",icon:"⛺",background:"sea",mode:"inn"},
{id:"volcano",name:"火山の試練",subtitle:"使い分けの5問チャレンジ",description:"4つのエリアをクリアしたら挑戦できる特別問題。",icon:"🌋",background:"volcano",mode:"volcano"}
];
export const COMPLETION_BACKGROUND="sky-island";