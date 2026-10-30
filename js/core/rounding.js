export function roundNearest(value,unit){
const n=Number(value),u=Number(unit);if(!Number.isFinite(n)||!Number.isFinite(u)||u<=0)throw new TypeError("数と位を正しく指定してください。");
return Math.floor(n/u)*u+(n%u>=u/2?u:0);
}
export function roundUp(value,unit){
const n=Number(value),u=Number(unit);if(!Number.isFinite(n)||!Number.isFinite(u)||u<=0)throw new TypeError("数と位を正しく指定してください。");
return Math.ceil(n/u)*u;
}
export function roundDown(value,unit){
const n=Number(value),u=Number(unit);if(!Number.isFinite(n)||!Number.isFinite(u)||u<=0)throw new TypeError("数と位を正しく指定してください。");
return Math.floor(n/u)*u;
}
export function significantUnit(value,digits=1){
const n=Math.abs(Math.trunc(Number(value)));if(!Number.isFinite(n))throw new TypeError("数を正しく指定してください。");
const count=String(n).length,kept=Math.max(1,Math.min(count,Math.floor(Number(digits)||1)));
return 10**Math.max(0,count-kept);
}
export function roundSignificant(value,digits=1){return roundNearest(value,significantUnit(value,digits));}
export function formatNumber(value){return Number(value).toLocaleString("ja-JP");}
export function formatYen(value){return formatNumber(value)+"円";}