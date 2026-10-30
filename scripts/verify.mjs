import assert from "node:assert/strict";
import {MAIN_AREAS,MARKET_AREA} from "../data/areas.js";
import {QUESTION_BANKS,ALL_QUESTIONS} from "../data/questions.js";
import {SHOPPING_MISSIONS,getMissionTotals} from "../data/shopping.js";
import {roundNearest,roundUp,roundDown,roundSignificant} from "../js/core/rounding.js";
import {BADGES} from "../data/badges.js";
assert.equal(roundNearest(3746,10),3750);
assert.equal(roundNearest(5243,10),5240);
assert.equal(roundNearest(6850,100),6900);
assert.equal(roundUp(12431,100),12500);
assert.equal(roundDown(12431,100),12400);
assert.equal(roundSignificant(4752,1),5000);
assert.equal(roundSignificant(4752,2),4800);
const ids=new Set();
for(const area of MAIN_AREAS){
const bank=QUESTION_BANKS[area.id];
assert.ok(Array.isArray(bank)&&bank.length>=20,area.id+" needs at least 10 questions");
for(const question of bank){
assert.ok(!ids.has(question.id),"duplicate question id: "+question.id);ids.add(question.id);
assert.equal(question.choices.length,4,question.id+" must have four choices");
assert.ok(question.choices.some(choice=>String(choice.value)===String(question.answer)),question.id+" answer missing from choices");
assert.equal(new Set(question.choices.map(choice=>String(choice.value))).size,4,question.id+" has duplicate choices");
}
}
assert.equal(ALL_QUESTIONS.length,80);
assert.equal(MARKET_AREA.id,"market");
assert.equal(BADGES.length,20);
assert.equal(SHOPPING_MISSIONS.length,6);
for(const mission of SHOPPING_MISSIONS){const totals=getMissionTotals(mission);assert.ok(totals.actualTotal>0);assert.ok(totals.estimatedTotal>0);assert.ok(mission.items.length>=3);}
console.log("がい数クエスト data verification passed.");
console.log("Areas:",MAIN_AREAS.length,"questions:",ALL_QUESTIONS.length,"badges:",BADGES.length,"market missions:",SHOPPING_MISSIONS.length);