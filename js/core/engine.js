import {EDU_EVENTS,QuestionPool,AnswerChecker,ScoreManager,ComboManager,StorageManager,ProgressManager,UnlockManager,AchievementManager,BadgeManager} from "https://tt-sensei.github.io/edu-components/index.js";
import {MAIN_AREAS,MARKET_AREA,AREAS} from "../../data/areas.js";
import {QUESTION_BANKS,ALL_QUESTIONS,diagnoseNumericChoice,diagnoseMethodChoice} from "../../data/questions.js";
import {BADGES} from "../../data/badges.js";
import {SHOPPING_MISSIONS,getMissionTotals} from "../../data/shopping.js";

const MODE_NAMES={quest:"エリアクエスト",cave:"まちがい直し",training:"特訓の広場",inn:"旅人の宿",volcano:"火山の試練"};
function shuffle(items){const list=[...items];for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;}
function takeRandom(items,count){return new QuestionPool(items).take(count);}
function defaultProfile(){return {version:1,coins:0,totalAnswers:0,totalCorrect:0,questAnswersCount:0,sessions:0,mistakesFixed:0,weakIds:[],topicStats:{},sound:true,marketCompleted:false};}

export class GameEngine{
constructor(){
this.storage=new StorageManager("gaisu-quest-v1",{eventTarget:document});
this.profile={...defaultProfile(),...this.storage.load("profile",{})};
if(!Array.isArray(this.profile.weakIds))this.profile.weakIds=[];
if(!this.profile.topicStats||typeof this.profile.topicStats!=="object")this.profile.topicStats={};
if(!Number.isFinite(this.profile.questAnswersCount))this.profile.questAnswersCount=0;
this.progress=new ProgressManager({storage:this.storage,storageKey:"area-progress",ids:AREAS.map(area=>area.id),eventTarget:document});
this.unlocks=new UnlockManager({storage:this.storage,storageKey:"area-unlocks",initialUnlocked:["forest"],eventTarget:document});
this.achievements=new AchievementManager({storage:this.storage,storageKey:"achievements",achievements:BADGES.map(badge=>({id:badge.id,name:badge.name,description:badge.description})),eventTarget:document});
this.badges=new BadgeManager({storage:this.storage,storageKey:"badges",badges:BADGES,eventTarget:document});
document.addEventListener(EDU_EVENTS.ACHIEVEMENT,event=>{const id=event.detail?.id;if(id)this.badges.award(id);});
this.session=null;this.market=null;this.restoreUnlocks();
}
restoreUnlocks(){
MAIN_AREAS.forEach((area,index)=>{if(this.progress.isCompleted(area.id)&&MAIN_AREAS[index+1])this.unlocks.unlock(MAIN_AREAS[index+1].id);});
if(MAIN_AREAS.every(area=>this.progress.isCompleted(area.id)))this.unlocks.unlock(MARKET_AREA.id);
}
saveProfile(){this.storage.save("profile",this.profile);}
award(id){this.achievements.achieve(id);}
getProfile(){return this.profile;}
getSoundEnabled(){return this.profile.sound!==false;}
setSoundEnabled(enabled){this.profile.sound=Boolean(enabled);this.saveProfile();return this.profile.sound;}
getProgress(){return {completed:this.progress.getCompletedCount(),total:this.progress.getTotal(),percent:this.progress.getPercent()};}
getAreaStatus(areaId){
const completed=this.progress.isCompleted(areaId);
const unlocked=this.unlocks.isUnlocked(areaId)||(areaId==="market"&&MAIN_AREAS.every(area=>this.progress.isCompleted(area.id)));
return {completed,unlocked};
}
getNextArea(){
const next=MAIN_AREAS.find(area=>!this.progress.isCompleted(area.id));
if(next)return next;
return MARKET_AREA;
}
getWeakQuestions(){const ids=new Set(this.profile.weakIds);return ALL_QUESTIONS.filter(question=>ids.has(question.id));}
getQuestionCount(){return this.profile.totalAnswers;}
getBadgeData(){return BADGES.map(badge=>({...badge,earned:this.badges.has(badge.id)}));}
getUnlockedAreas(){return MAIN_AREAS.filter(area=>this.getAreaStatus(area.id).unlocked);}
buildSessionQuestions(mode,areaId){
if(mode==="quest"){
const bank=QUESTION_BANKS[areaId]||[],weak=new Set(this.profile.weakIds);
const priority=takeRandom(bank.filter(q=>weak.has(q.id)),Math.min(3,bank.filter(q=>weak.has(q.id)).length));
const chosen=new Set(priority.map(q=>q.id));
const fresh=takeRandom(bank.filter(q=>!chosen.has(q.id)),10-priority.length);
return shuffle([...priority,...fresh]).slice(0,10);
}
if(mode==="cave")return takeRandom(this.getWeakQuestions(),Math.min(10,this.getWeakQuestions().length));
const unlocked=new Set(this.getUnlockedAreas().map(area=>area.id));
const available=ALL_QUESTIONS.filter(question=>unlocked.has(question.areaId));
if(mode==="training"){
const weak=this.getWeakQuestions();
const ranked=Object.entries(this.profile.topicStats).filter(([,stat])=>stat&&stat.total>0)
.sort((a,b)=>(a[1].correct/a[1].total)-(b[1].correct/b[1].total));
const weakest=ranked[0]?.[0];
const targeted=weak.length?weak:weakest?available.filter(q=>q.topic===weakest):available;
const chosen=takeRandom(targeted,5);
if(chosen.length<5){
const ids=new Set(chosen.map(q=>q.id));
chosen.push(...takeRandom(available.filter(q=>!ids.has(q.id)),5-chosen.length));
}
return shuffle(chosen);
}
if(mode==="volcano"){
const difficult=[...QUESTION_BANKS.ruins,...QUESTION_BANKS.riverbank.filter(q=>q.type==="number")];
const chosen=takeRandom(difficult,5);
if(chosen.length<5)return takeRandom(ALL_QUESTIONS,5);
return shuffle(chosen);
}
return takeRandom(available,10);
}
startSession(mode,areaId=null){
if(mode==="quest"&&!this.getAreaStatus(areaId).unlocked)return false;
if(mode==="volcano"&&!MAIN_AREAS.every(area=>this.progress.isCompleted(area.id)))return false;
const questions=this.buildSessionQuestions(mode,areaId);
if(!questions.length)return false;
this.session={mode,modeName:MODE_NAMES[mode]||"練習",areaId,questions,index:0,correctCount:0,wrongCount:0,coinsEarned:0,answerState:null,hintVisible:false,completed:false,score:new ScoreManager(),combo:new ComboManager({milestones:[3,5,10],eventTarget:document}),checker:new AnswerChecker({eventTarget:document}),summary:null};
return true;
}
getCurrentQuestion(){if(!this.session||this.session.completed)return null;return this.session.questions[this.session.index]||null;}
submitAnswer(value){
if(!this.session||this.session.completed||this.session.answerState)return null;
const question=this.getCurrentQuestion();if(!question)return null;
let bonusCoins=0;
const correct=this.session.checker.check(value,question.answer,{numeric:question.type==="number",detail:{question:question.id,type:question.type,areaId:question.areaId}});
if(correct){
this.session.correctCount++;this.session.score.correct(10);
const combo=this.session.combo.correct();
this.profile.totalCorrect++;
if(this.session.mode==="quest"){this.profile.coins+=2;this.session.coinsEarned+=2;}
if(combo===3)this.award("combo-three");if(combo===5)this.award("combo-five");
if(this.profile.totalCorrect===1)this.award("first-step");
if(this.profile.weakIds.includes(question.id)){
this.profile.weakIds=this.profile.weakIds.filter(id=>id!==question.id);
this.profile.mistakesFixed++;this.award("mistake-fixed");
if(this.profile.mistakesFixed>=5)this.award("weak-master");
}
}else{
this.session.wrongCount++;this.session.score.wrong();this.session.combo.wrong();
if(!this.profile.weakIds.includes(question.id))this.profile.weakIds.push(question.id);
}
this.profile.totalAnswers++;
if(this.session.mode==="quest"){
this.profile.questAnswersCount++;
if(this.profile.questAnswersCount%10===0){bonusCoins=5;this.profile.coins+=bonusCoins;this.session.coinsEarned+=bonusCoins;}
}
const topic=question.topic||"概数",stats=this.profile.topicStats[topic]||{total:0,correct:0};
stats.total++;if(correct)stats.correct++;this.profile.topicStats[topic]=stats;
if(this.profile.totalAnswers>=10)this.award("ten-answers");
if(this.profile.totalAnswers>=100)this.award("hundred-answers");
if(this.profile.coins>=100)this.award("coin-hunter");
this.session.answerState={isCorrect:correct,value,revealed:false,bonusCoins,answerLabel:question.answerLabel||String(question.answer),diagnosis:correct?null:question.type==="number"?diagnoseNumericChoice(question,value):question.type==="method"?diagnoseMethodChoice(question,value):null};
this.saveProfile();return this.session.answerState;
}
showHint(){if(!this.session||!this.session.answerState)return false;this.session.hintVisible=true;return true;}
revealAnswer(){if(!this.session||!this.session.answerState||this.session.answerState.isCorrect)return false;this.session.answerState.revealed=true;return true;}
advanceQuestion(){
if(!this.session||!this.session.answerState)return false;
if(this.session.index<this.session.questions.length-1){
this.session.index++;this.session.answerState=null;this.session.hintVisible=false;return false;
}
this.finishSession();return true;
}
finishSession(){
if(!this.session||this.session.completed)return this.session?.summary||null;
const session=this.session,total=session.questions.length,accuracy=total?Math.round(session.correctCount/total*100):0;
let firstClear=false;
if(session.mode==="quest"&&session.areaId){
firstClear=this.progress.complete(session.areaId);
const index=MAIN_AREAS.findIndex(area=>area.id===session.areaId);
if(index>=0&&MAIN_AREAS[index+1])this.unlocks.unlock(MAIN_AREAS[index+1].id);
if(MAIN_AREAS.every(area=>this.progress.isCompleted(area.id))){this.unlocks.unlock(MARKET_AREA.id);this.award("journey-clear");}
const area=MAIN_AREAS.find(item=>item.id===session.areaId);
if(firstClear&&area?.clearBadge){this.award(area.clearBadge);this.profile.coins+=5;session.coinsEarned+=5;}
}
if(accuracy>=80)this.award("accuracy-star");
if(total===10&&session.correctCount===10)this.award("perfect-ten");
if(session.mode==="training"&&session.correctCount>=4)this.award("training-clear");
if(session.mode==="inn"&&accuracy>=80)this.award("inn-master");
if(session.mode==="volcano"&&session.correctCount===5)this.award("volcano-clear");
session.completed=true;this.profile.sessions++;this.saveProfile();
session.summary={mode:session.mode,modeName:session.modeName,areaId:session.areaId,total,correct:session.correctCount,wrong:session.wrongCount,accuracy,score:session.score.getResult().score,maxCombo:session.combo.getMax(),coinsEarned:session.coinsEarned,weakCount:this.profile.weakIds.length,firstClear};
return session.summary;
}
startMarket(){
if(!this.getAreaStatus(MARKET_AREA.id).unlocked)return false;
this.market={missionIndex:0,phase:0,totalCorrect:0,totalAnswers:0,currentMissionCorrect:0,last:null,checker:new AnswerChecker({eventTarget:document}),score:new ScoreManager(),finished:false};
return true;
}
getMarketMission(){if(!this.market||this.market.finished)return null;return SHOPPING_MISSIONS[this.market.missionIndex]||null;}
getMarketState(){if(!this.market)return null;return {missionIndex:this.market.missionIndex,phase:this.market.phase,totalCorrect:this.market.totalCorrect,totalAnswers:this.market.totalAnswers,currentMissionCorrect:this.market.currentMissionCorrect,last:this.market.last,finished:this.market.finished};}
submitMarketAnswer(value){
if(!this.market||this.market.finished||this.market.last)return null;
const mission=this.getMarketMission();if(!mission)return null;
const totals=getMissionTotals(mission);let expected,numeric=false;
if(this.market.phase===0)expected=mission.method;
else if(this.market.phase===1){expected=totals.estimatedTotal;numeric=true;}
else expected=totals.estimatedTotal<=mission.budget?"yes":"no";
const correct=this.market.checker.check(value,expected,{numeric,detail:{question:mission.id+"-"+this.market.phase,type:"market"}});
this.market.totalAnswers++;if(correct){this.market.totalCorrect++;this.market.currentMissionCorrect++;this.market.score.correct(10);}else this.market.score.wrong();
this.market.last={phase:this.market.phase,value,expected,isCorrect:correct,estimatedTotal:totals.estimatedTotal,actualTotal:totals.actualTotal,difference:totals.difference};
return this.market.last;
}
advanceMarket(){
if(!this.market||!this.market.last)return false;
if(this.market.phase<2){this.market.phase++;this.market.last=null;return false;}
this.market.missionIndex++;this.market.last=null;this.market.phase=0;this.market.currentMissionCorrect=0;
if(this.market.missionIndex<SHOPPING_MISSIONS.length)return false;
this.market.finished=true;this.profile.marketCompleted=true;this.saveProfile();this.progress.complete(MARKET_AREA.id);
const totalPhases=SHOPPING_MISSIONS.length*3;
if(this.market.totalCorrect>=Math.ceil(totalPhases*2/3))this.award("market-estimate");
if(this.market.totalCorrect===totalPhases)this.award("market-master");
return true;
}
getMarketSummary(){if(!this.market)return null;const totalPhases=SHOPPING_MISSIONS.length*3;return {correct:this.market.totalCorrect,total:this.market.totalAnswers,score:this.market.score.getResult().score,perfect:this.market.totalCorrect===totalPhases,badgesEarned:(this.market.totalCorrect>=Math.ceil(totalPhases*2/3)?1:0)+(this.market.totalCorrect===totalPhases?1:0)};}
}