import {roundNearest,roundUp,roundDown,roundSignificant,formatYen} from "../js/core/rounding.js";
export const SHOPPING_MISSIONS=[
{id:"market-01",title:"ピクニックのお買い物",purpose:"合計のおよその金額を知りたい。",method:"nearest",methodLabel:"四捨五入",unit:100,budget:800,items:[{name:"ノート",price:248,quantity:1},{name:"えんぴつ",price:138,quantity:2},{name:"消しゴム",price:88,quantity:2}],explanation:"合計のおよその金額を知りたいときは、四捨五入が使えます。"},
{id:"market-02",title:"遠足の買い出し",purpose:"予算が足りなくならないよう、多めに見積もりたい。",method:"up",methodLabel:"切り上げ",unit:100,budget:1100,items:[{name:"サンドイッチ",price:248,quantity:2},{name:"飲み物",price:138,quantity:2},{name:"くだもの",price:178,quantity:1}],explanation:"予算不足を避けたいときは、少し多めに見積もる方法があります。"},
{id:"market-03",title:"お店の品物を比べよう",purpose:"大きな金額の規模を、すばやく大まかに比べたい。",method:"oneSig",methodLabel:"上から1けた",unit:1000,budget:3600,items:[{name:"リュック",price:1480,quantity:1},{name:"水とう",price:680,quantity:2},{name:"文房具セット",price:298,quantity:2}],explanation:"大きな金額の規模を簡単に比べたいときは、上から1けたの概数が便利です。"},
{id:"market-04",title:"入学準備のお買い物",purpose:"大きな金額を、少し細かく比べて見積もりたい。",method:"twoSig",methodLabel:"上から2けた",unit:100,budget:10500,items:[{name:"ランドセル",price:4980,quantity:1},{name:"体操服",price:2480,quantity:1},{name:"上履き",price:1280,quantity:2}],explanation:"少し細かく比べたいときは、上から2けたの概数が使えます。"},
{id:"market-05",title:"発表会の買い出し",purpose:"予算が足りなくならないよう、多めに見積もりたい。",method:"up",methodLabel:"切り上げ",unit:1000,budget:9000,items:[{name:"衣装",price:1850,quantity:2},{name:"小道具",price:960,quantity:3},{name:"お花",price:1240,quantity:1}],explanation:"予算不足を避けたいときは、切り上げて多めに見積もる方法があります。"},
{id:"market-06",title:"おこづかい帳の記録",purpose:"使ったお金を、実際より多くならないよう少なめに見積もって記録したい。",method:"down",methodLabel:"切り捨て",unit:100,budget:1500,items:[{name:"ノート",price:348,quantity:2},{name:"ペン",price:268,quantity:1},{name:"シール",price:189,quantity:2}],explanation:"実際より多くならないようにしたいときは、切り捨てて少なめに見積もります。"}
];
export function roundedItemPrice(price,mission){
if(mission.method==="nearest")return roundNearest(price,mission.unit);
if(mission.method==="up")return roundUp(price,mission.unit);
if(mission.method==="down")return roundDown(price,mission.unit);
if(mission.method==="oneSig")return roundSignificant(price,1);
if(mission.method==="twoSig")return roundSignificant(price,2);
return roundSignificant(price,2);
}
export function getMissionTotals(mission){
const actualTotal=mission.items.reduce((sum,item)=>sum+item.price*item.quantity,0);
const estimatedTotal=mission.items.reduce((sum,item)=>sum+roundedItemPrice(item.price,mission)*item.quantity,0);
return {actualTotal,estimatedTotal,difference:Math.abs(actualTotal-estimatedTotal)};
}
export function getEstimateChoices(mission){
const estimate=getMissionTotals(mission).estimatedTotal,step=mission.method==="oneSig"?1000:mission.unit;
const candidates=[estimate,estimate-step,estimate+step,estimate+step*2,estimate-step*2].filter(v=>v>=0);
const unique=[...new Set(candidates)];while(unique.length<4)unique.push(estimate+step*(unique.length+1));
return unique.slice(0,4).sort(()=>Math.random()-.5).map(value=>({value,label:formatYen(value)}));
}