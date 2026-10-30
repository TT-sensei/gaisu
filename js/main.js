import {GameEngine} from "./core/engine.js";
import {playSfx} from "./core/audio.js";
import {showAreaIntro,showComboEffect,showBadgeReward} from "./ui/effects.js";
import {renderHome,renderMap,renderQuiz,renderFeedback,renderResult,renderMarket,renderMarketDone,renderBadges,renderStats} from "./ui/render.js";
const screens=[...document.querySelectorAll("[data-screen]")],engine=new GameEngine();
let toastTimer=null;
function showScreen(name){
screens.forEach(screen=>{screen.hidden=screen.id!=="screen-"+name;});
window.scrollTo(0,0);updateHeader();
}
function updateHeader(){
document.querySelector("#header-coins").textContent=String(engine.getProfile().coins);
const button=document.querySelector("#sound-toggle"),enabled=engine.getSoundEnabled();
button.textContent=enabled?"音 ON":"音 OFF";button.setAttribute("aria-pressed",String(enabled));
}
function toast(message){
const el=document.querySelector("#app-toast");el.textContent=message;el.hidden=false;
window.clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>{el.hidden=true;},2400);
}
function showHome(){renderHome(document.querySelector("#home-content"),engine);showScreen("home");}
function showMap(){renderMap(document.querySelector("#map-content"),engine);showScreen("map");}
function showQuiz(){renderQuiz(document.querySelector("#quiz-content"),engine);showScreen("quiz");}
function showResults(){renderResult(document.querySelector("#result-content"),engine);showScreen("result");}
function showBadges(){renderBadges(document.querySelector("#badges-content"),engine);showScreen("badges");}
function showStats(){renderStats(document.querySelector("#stats-content"),engine);showScreen("stats");}
function showMarket(){renderMarket(document.querySelector("#market-content"),engine);showScreen("market");}
function showMarketDone(){renderMarketDone(document.querySelector("#market-done-content"),engine);showScreen("market-done");}
function startSession(mode,areaId){
if(!engine.startSession(mode,areaId)){
if(mode==="cave")toast("今のところ、まちがい直しはないよ。");
else if(mode==="volcano")toast("4つのエリアをクリアすると挑戦できるよ。");
else toast("この問題は準備中だよ。");return;
}
showQuiz();showAreaIntro(document.querySelector("#screen-quiz .quiz-meta span")?.textContent||engine.session?.modeName);playSfx("start",engine.getSoundEnabled());
}
document.addEventListener("click",event=>{
const button=event.target.closest("button[data-action]");if(!button||button.disabled)return;
const action=button.dataset.action;
if(action==="go-home"){showHome();return;}
if(action==="open-map"){showMap();return;}
if(action==="open-badges"){showBadges();return;}
if(action==="open-stats"){showStats();return;}
if(action==="continue"){
const next=engine.getNextArea();
if(next.id==="market"){if(engine.startMarket())showMarket();else showMap();}
else startSession("quest",next.id);
return;
}
if(action==="start-quest"){startSession("quest",button.dataset.area);return;}
if(action==="start-side"){startSession(button.dataset.mode);return;}
if(action==="answer"){
const value=decodeURIComponent(button.dataset.answer||""),result=engine.submitAnswer(value);
if(result){
renderQuiz(document.querySelector("#quiz-content"),engine);
updateHeader();
if(result.bonusCoins)playSfx("chest",engine.getSoundEnabled());
}return;
}
if(action==="show-hint"){engine.showHint();renderFeedback(document.querySelector("#feedback-area"),engine);playSfx("hint",engine.getSoundEnabled());return;}
if(action==="reveal-answer"){engine.revealAnswer();renderFeedback(document.querySelector("#feedback-area"),engine);playSfx("answer",engine.getSoundEnabled());return;}
if(action==="quiz-next"){
const ended=engine.advanceQuestion();
if(ended){showResults();const summary=engine.session?.summary;playSfx(summary?.firstClear?"clear":"practice",engine.getSoundEnabled());}else showQuiz();
updateHeader();return;
}
if(action==="start-market"){if(engine.startMarket())showMarket();else toast("4つのエリアをクリアすると、市場がひらくよ。");return;}
if(action==="market-answer"){
const result=engine.submitMarketAnswer(decodeURIComponent(button.dataset.answer||""));
if(result){document.querySelectorAll("#market-content [data-action='market-answer']").forEach(choice=>{choice.disabled=true;});showMarket();}
return;
}
if(action==="market-next"){
const ended=engine.advanceMarket();if(ended){showMarketDone();playSfx("clear",engine.getSoundEnabled());}else showMarket();return;
}
if(action==="sound-toggle"){
const enabled=engine.setSoundEnabled(!engine.getSoundEnabled());updateHeader();
if(enabled)playSfx("soundOn",true);else toast("効果音をオフにしたよ。");
}
});
document.addEventListener("edu:correct",()=>{
const card=document.querySelector("#question-card");
if(card){card.classList.remove("effect-correct-pop");void card.offsetWidth;card.classList.add("effect-correct-pop");}
playSfx("correct",engine.getSoundEnabled());
});
document.addEventListener("edu:wrong",()=>{
const card=document.querySelector("#question-card");
if(card){card.classList.remove("effect-wrong-shake");void card.offsetWidth;card.classList.add("effect-wrong-shake");}
playSfx("softFail",engine.getSoundEnabled());
});
document.addEventListener("edu:badge",event=>{
showBadgeReward(event.detail?.badge);
playSfx("badge",engine.getSoundEnabled());
});
document.addEventListener("edu:combo",event=>{
showComboEffect(event.detail?.current);
});
document.addEventListener("edu:unlock",event=>{
if(event.detail?.id)toast("新しいエリアがひらいたよ！");
playSfx("unlock",engine.getSoundEnabled());
});
document.addEventListener("edu:progress",updateHeader);
showHome();updateHeader();