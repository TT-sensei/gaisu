import {roundNearest,roundUp,roundDown,roundSignificant,formatYen} from "../js/core/rounding.js";
export const SHOPPING_MISSIONS=[
{id:"market-01",title:"ピクニックのお買い物",purpose:"合計のおよその金額を知りたい。",method:"nearest",methodLabel:"四捨五入",unit:100,budget:800,items:[{name:"ノート",price:248,quantity:1},{name:"えんぴつ",price:138,quantity:2},{name:"消しゴム",price:88,quantity:2}],explanation:"合計のおよその金額を知りたいときは、四捨五入が使えます。"},
{id:"market-02",title:"遠足の買い出し",purpose:"予算が足りなくならないよう、多めに見積もりたい。",method:"up",methodLabel:"切り上げ",unit:100,budget:1100,items:[{name:"サンドイッチ",price:248,quantity:2},{name:"飲み物",price:138,quantity:2},{name:"くだもの",price:178,quantity:1}],explanation:"予算不足を避けたいときは、少し多めに見積もる方法があります。"},
{id:"market-03",title:"お店の品物を比べよう",purpose:"大きな金額の規模を、すばやく大まかに比べたい。",method:"oneSig",methodLabel:"上から1けた",unit:1000,budget:3600,items:[{name:"リュック",price:1480,quantity:1},{name:"水とう",price:680,quantity:2},{name:"文房具セット",price:298,quantity:2}],explanation:"大きな金額の規模を簡単に比べたいときは、上から1けたの概数が便利です。"}
];
export function roundedItemPrice(price,mission){
if(mission.method==="nearest")return roundNearest(price,mission.unit);
if(mission.method==="up")return roundUp(price,mission.unit);
if(mission.method==="down")return roundDown(price,mission.unit);
if(mission.method==="oneSig")return roundSignificant(price,1);
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