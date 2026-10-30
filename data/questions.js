import {roundNearest,roundUp,roundDown,roundSignificant,significantUnit,formatNumber} from "../js/core/rounding.js";
function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function numberChoices(number,unit,answer){
const values=[answer,roundDown(number,unit),roundUp(number,unit),roundNearest(number,unit),answer-unit,answer+unit,answer-unit*2,answer+unit*2,answer+unit*3,answer-unit*3];
const wrong=[...new Set(values.filter(v=>Number.isFinite(v)&&v>=0&&v!==answer))];
return shuffle([answer,...wrong.slice(0,3)]).map(value=>({value,label:formatNumber(value)}));
}
function createNumericQuestion(data){
const unit=data.digits?significantUnit(data.number,data.digits):data.unit;
let answer;if(data.rule==="nearest")answer=roundNearest(data.number,unit);else if(data.rule==="up")answer=roundUp(data.number,unit);else if(data.rule==="down")answer=roundDown(data.number,unit);else answer=roundSignificant(data.number,data.digits||1);
let instruction="",hint="",explanation="";
if(data.rule==="nearest"){
instruction=formatNumber(unit)+"の位まで四捨五入";
hint="残す位のすぐ右の数字を見よう。0〜4ならそのまま、5〜9なら1大きくするよ。";
explanation="四捨五入では、残す位のすぐ右の数字を見ます。0〜4は切り捨て、5〜9は切り上げます。";
}else if(data.rule==="up"){
instruction=formatNumber(unit)+"の位まで切り上げ";
hint="残す位より右に0でない数字があれば、残す位を1大きくするよ。";
explanation="切り上げは、残す位より右にある数をまとめて、残す位を1大きくします。";
}else if(data.rule==="down"){
instruction=formatNumber(unit)+"の位まで切り捨て";
hint="残す位より右の数字を、まとめて0にしてみよう。";
explanation="切り捨ては、残す位より右の数字をすべて0にします。";
}else{
instruction="上から"+data.digits+"けたの概数";
hint="左から"+data.digits+"けたを残して、そのすぐ右の数字を見よう。";
explanation="上から"+data.digits+"けたを残し、そのすぐ右の数字で四捨五入します。";
}
return {id:data.id,areaId:data.areaId,type:"number",topic:data.topic,prompt:data.prompt||(formatNumber(data.number)+"を、"+instruction+"で表しましょう。"),number:data.number,unit,answer,choices:numberChoices(data.number,unit,answer),hint,explanation,answerLabel:formatNumber(answer)};
}
const forestData=[[3746,10],[5243,10],[2849,100],[6850,100],[8349,100],[4550,100],[19480,1000],[36700,1000],[52499,1000],[74500,1000],[8264,100],[98349,1000]];
const grasslandData=[[12431,100,"up"],[12431,100,"down"],[8760,1000,"up"],[8760,1000,"down"],[5201,10,"up"],[5201,10,"down"],[27101,100,"up"],[27101,100,"down"],[9999,1000,"up"],[9999,1000,"down"],[34501,1000,"up"],[34501,1000,"down"]];
const riverData=[[4752,1],[4752,2],[31847,2],[58219,2],[369450,1],[369450,2],[8431,1],[8431,2],[125678,3],[740850,2],[705318,2],[968245,2]];
const METHOD_CHOICES=[{value:"nearest",label:"四捨五入"},{value:"up",label:"切り上げ"},{value:"down",label:"切り捨て"},{value:"oneSig",label:"上から1けた"},{value:"twoSig",label:"上から2けた"}];
const methodData=[
["ruins-01","遠足の参加者は147人です。人数をだいたい何人か伝えたい。","nearest","人数をおよそで伝えるときは、四捨五入が使いやすいよ。"],
["ruins-02","工作で使う紙が2,341枚必要です。足りなくならないよう、多めに見積もりたい。","up","必要な数より少なくならないようにしたいときは、切り上げが向いています。"],
["ruins-03","箱に入る数を考えるため、実際より多くならないように数をまとめたい。","down","実際より多く見積もらないようにしたいときは、切り捨てを使います。"],
["ruins-04","2つの市の人口の規模を、まず大まかに比べたい。","oneSig","大きな数の規模を大まかに比べるときは、上から1けたにすると見やすいよ。"],
["ruins-05","工場Aと工場Bの生産数を、少し細かく比べたい。","twoSig","上から2けたなら、上から1けたよりも細かく比べられます。"],
["ruins-06","買い物で予算が足りなくならないよう、合計金額を多めに考えたい。","up","予算不足を避けたいときは、切り上げて多めに見積もる方法があります。"],
["ruins-07","運動会の参加人数を、百人くらいの大きさで知らせたい。","nearest","およその人数を伝えるなら、四捨五入で百の位まで表せます。"],
["ruins-08","集めたペットボトルの数を、実際より少なめに表したい。","down","実際より多くしないで表したいときは、切り捨てが使えます。"],
["ruins-09","2つの町の人口を、上から1けたの概数にして比べたい。","oneSig","問題の目的に合わせて、上から1けたの概数を選びます。"],
["ruins-10","大きな数の大きさを比べるが、1けたよりもう少し詳しく見たい。","twoSig","もう少し詳しく比べたいときは、上から2けたを使います。"],
["ruins-11","遠足のお金が足りるかを安全に確かめるため、合計を多めに見積もる。","up","足りないことを避けたい見積もりでは、切り上げが役立ちます。"],
["ruins-12","だいたいの人数をすばやく伝えたいが、細かい数までは必要ない。","oneSig","細かさが必要ないときは、上から1けたにすると簡潔です。"]
];
const METHOD_EXPLANATIONS={
nearest:"四捨五入は、およその大きさを表したいときに使いやすい方法です。",
up:"切り上げは、足りなくならないように多めに見積もりたいときに役立ちます。",
down:"切り捨ては、実際より多くならないように見積もりたいときに使えます。",
oneSig:"上から1けたは、大きな数の規模を大まかに比べたいときに便利です。",
twoSig:"上から2けたは、上から1けたよりも少し詳しく比べたいときに便利です."
};
function createMethodQuestion(data){
const correct=METHOD_CHOICES.find(x=>x.value===data[2]),options=shuffle(METHOD_CHOICES).slice(0,4);
if(!options.some(x=>x.value===data[2]))options[3]=correct;
return {id:data[0],areaId:"ruins",type:"method",topic:"使い分け",prompt:data[1],answer:data[2],choices:shuffle(options),hint:"何を知りたいのか考えよう。だいたいの大きさ？ 足りなくならないこと？ 少なめにすること？",explanation:data[3]+" "+METHOD_EXPLANATIONS[data[2]],answerLabel:correct.label};
}
export const QUESTION_BANKS={
forest:forestData.map((v,i)=>createNumericQuestion({id:"forest-"+String(i+1).padStart(2,"0"),areaId:"forest",topic:"四捨五入",number:v[0],unit:v[1],rule:"nearest"})),
grassland:grasslandData.map((v,i)=>createNumericQuestion({id:"grassland-"+String(i+1).padStart(2,"0"),areaId:"grassland",topic:v[2]==="up"?"切り上げ":"切り捨て",number:v[0],unit:v[1],rule:v[2]})),
riverbank:riverData.map((v,i)=>createNumericQuestion({id:"riverbank-"+String(i+1).padStart(2,"0"),areaId:"riverbank",topic:"上から何けた",number:v[0],digits:v[1],rule:"significant"})),
ruins:methodData.map(createMethodQuestion)
};
export const ALL_QUESTIONS=Object.values(QUESTION_BANKS).flat();