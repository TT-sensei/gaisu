import {AREAS,MAIN_AREAS,MARKET_AREA,SIDE_TRIPS,COMPLETION_BACKGROUND} from "../../data/areas.js";
import {BADGES} from "../../data/badges.js";
import {SHOPPING_MISSIONS,getMissionTotals,getEstimateChoices,roundedItemPrice} from "../../data/shopping.js";
import {BACKGROUND_URLS,GROUP_IMAGES,CLEAR_BADGE_IMAGE} from "../config.js";
import {formatNumber,formatYen} from "../core/rounding.js";
function esc(value){
return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
}
function sceneStyle(id){const url=BACKGROUND_URLS[id]||BACKGROUND_URLS.town;return "--scene:url('"+url+"')";}
function button(label,action,primary=false,extra=""){
return '<button type="button" class="'+(primary?"primary-action":"secondary-action")+'" data-action="'+action+'" '+extra+'>'+label+'</button>';
}
export function renderHome(element,engine){
const profile=engine.getProfile(),progress=engine.getProgress(),next=engine.getNextArea(),weak=engine.getWeakQuestions().length;
element.innerHTML=
'<section class="hero-panel edu-shell-hero" style="'+sceneStyle("town")+'"><div class="hero-copy">'+
'<p class="eyebrow">NUMBER ADVENTURE · 算数</p><h1>がい数<span>クエスト</span></h1>'+
'<p>数字の世界を旅しながら、概数の使い方を身につけよう。考えて、見積もって、たしかめて進もう！</p>'+
'<div class="hero-badges"><span>四捨五入</span><span>切り上げ・切り捨て</span><span>上から何けた</span></div>'+
button("冒険をつづける　→","continue",true)+
'</div><div class="hero-art"><img src="'+GROUP_IMAGES.town+'" alt="" decoding="async"></div></section>'+
'<div class="home-lower"><section class="info-card"><h2>冒険の記録</h2><div class="mini-stats">'+
'<div class="mini-stat"><span>エリア進行</span><strong>'+progress.completed+'/'+progress.total+'</strong></div>'+
'<div class="mini-stat"><span>正解した問題</span><strong>'+profile.totalCorrect+'</strong></div>'+
'<div class="mini-stat"><span>集めたコイン</span><strong>'+profile.coins+'</strong></div></div>'+
'<p>次の目的地：'+esc(next.name)+'　／　まちがい直し：'+weak+'問</p></section>'+
'<section class="side-card"><h2>寄り道メニュー</h2><div class="side-link-grid">'+
'<button class="side-link" data-action="open-map"><span>🗺️</span><span>旅の地図</span></button>'+
'<button class="side-link" data-action="start-side" data-mode="cave" '+(weak?"":"disabled")+'><span>🕯️</span><span>まちがい直し</span></button>'+
'<button class="side-link" data-action="start-side" data-mode="training"><span>🎯</span><span>特訓する</span></button>'+
'<button class="side-link" data-action="open-badges"><span>🏅</span><span>バッジ図鑑</span></button></div></section></div>';
}
export function renderMap(element,engine){
const cards=AREAS.map(area=>{
const status=engine.getAreaStatus(area.id),market=area.id==="market",disabled=!status.unlocked;
const label=status.completed?"クリア！":disabled?"まだ進めない":market?"最終ミッション":"挑戦できる";
return '<button type="button" class="route-card '+(disabled?"is-locked ":"")+(status.completed?"is-complete":"")+'" style="'+sceneStyle(area.background)+'" data-action="'+(market?"start-market":"start-quest")+'" data-area="'+area.id+'" '+(disabled?"disabled":"")+'>'+
'<span><span class="route-number">AREA '+area.number+'</span><strong>'+esc(area.name)+'</strong><small>'+esc(area.subtitle)+'</small></span><span class="route-status">'+label+'</span></button>';
}).join("");
const trips=SIDE_TRIPS.map(trip=>{
const weakLocked=trip.mode==="cave"&&engine.getWeakQuestions().length===0;
const volcanoLocked=trip.mode==="volcano"&&!MAIN_AREAS.every(area=>engine.progress.isCompleted(area.id));
return '<button type="button" class="trip-card" data-action="start-side" data-mode="'+trip.mode+'" '+(weakLocked||volcanoLocked?"disabled":"")+'>'+
'<span aria-hidden="true">'+trip.icon+'</span><strong>'+esc(trip.name)+'</strong><small>'+esc(trip.subtitle)+'</small></button>';
}).join("");
const progress=engine.getProgress();
element.innerHTML=
'<div class="page-heading"><div><p class="eyebrow">WORLD MAP</p><h1>旅の地図</h1><p class="lead">エリアを進むと、次の道がひらくよ。</p></div><button class="quiet-action" data-action="go-home">⌂ ホーム</button></div>'+
'<div class="edu-progress"><div class="edu-progress-head"><strong>冒険の進みぐあい</strong><span>'+progress.completed+' / '+progress.total+'</span></div>'+
'<div class="edu-progress-track"><div class="edu-progress-value" style="width:'+progress.percent+'%"></div></div></div>'+
'<div class="route-grid">'+cards+'</div><section class="info-card"><div class="page-heading"><div><h2>寄り道して力をつけよう</h2><p class="lead">メインの旅を止めずに、何度でも挑戦できるよ。</p></div></div><div class="side-trips">'+trips+'</div></section>';
}
export function renderQuiz(element,engine){
const session=engine.session,question=engine.getCurrentQuestion();if(!session||!question)return;
const total=session.questions.length,number=session.index+1,score=session.score.getResult(),combo=session.combo.getCurrent();
const area=AREAS.find(item=>item.id===session.areaId),title=session.mode==="quest"?(area?.name||"エリアクエスト"):session.modeName;
const visual=question.type==="number"?
'<div class="question-visual"><div><small>もとの数</small><strong>'+formatNumber(question.number)+'</strong></div></div>':
'<div class="question-visual"><div><small>考えるポイント</small><strong>目的に合う方法は？</strong></div></div>';
const answered=Boolean(session.answerState);
const choices=question.choices.map((choice,index)=>{
const selected=answered&&String(session.answerState.value)===String(choice.value);
return '<button type="button" class="answer-choice edu-btn edu-btn-secondary '+(selected?"is-selected":"")+'" data-action="answer" data-answer="'+encodeURIComponent(String(choice.value))+'" '+(answered?"disabled":"")+'><span class="choice-index">'+(index+1)+'</span>'+esc(choice.label)+'</button>';
}).join("");
element.innerHTML=
'<div class="quiz-topline"><button class="quiet-action" data-action="open-map">← 地図へ</button><div class="quiz-meta"><span>'+esc(title)+'</span><span>'+number+' / '+total+'問</span></div></div>'+
'<div class="progress-track" aria-label="問題の進みぐあい"><span style="width:'+(number/total*100)+'%"></span></div>'+
'<div class="quiz-grid"><section class="question-card edu-question" id="question-card">'+
'<div class="edu-question-head"><span class="edu-question-number"><strong>'+number+'</strong> QUESTION</span><span class="edu-badge edu-badge-primary">'+esc(question.topic)+'</span></div>'+
'<p class="question-prompt">'+esc(question.prompt)+'</p>'+visual+
'<div class="edu-answer-grid edu-answer-grid-2">'+choices+'</div><div id="feedback-area"></div></section>'+
'<aside class="quiz-aside"><div class="aside-stat"><span>今回の正解</span><strong>'+session.correctCount+'</strong></div>'+
'<div class="aside-stat"><span>連続正解</span><strong>'+combo+' <small>COMBO</small></strong></div>'+
'<div class="aside-stat"><span>今回の得点</span><strong>'+score.score+'</strong></div>'+
'<div class="aside-stat"><span>コイン</span><strong>🪙 '+engine.getProfile().coins+'</strong></div>'+
'<div class="info-card tip-card"><strong>考え方のヒント</strong><p>残す位と、その右の数字に注目しよう。何のために概数にするかも大切だよ。</p></div></aside></div>';
renderFeedback(element.querySelector("#feedback-area"),engine);
}
export function renderFeedback(element,engine){
if(!element||!engine.session||!engine.session.answerState)return;
const question=engine.getCurrentQuestion(),state=engine.session.answerState,correct=state.isCorrect;
const hint=engine.session.hintVisible?'<div class="hint-box"><strong>ヒント</strong><p>'+esc(question.hint)+'</p></div>':"";
const diagnosis=state.diagnosis?'<div class="diagnosis-box"><strong>えらんだ答えをチェック</strong><p>'+esc(state.diagnosis)+'</p></div>':"";
const revealed=state.revealed?'<p><strong>答え：</strong>'+esc(state.answerLabel)+'</p>':"";
const bonus=state.bonusCoins?'<div class="edu-reward"><span class="edu-reward-icon">🧰</span><strong>10問ごとの宝箱ボーナス！ +'+state.bonusCoins+'コイン</strong></div>':"";
const actions=correct?'<button class="primary-action" data-action="quiz-next">次の問題へ →</button>':
'<button class="small-action" data-action="show-hint">ヒントを見る</button><button class="small-action" data-action="reveal-answer">答えと考え方を見る</button><button class="primary-action" data-action="quiz-next">次へ進む →</button>';
element.innerHTML='<div class="feedback-box '+(correct?"is-correct effect-correct-pop":"is-wrong effect-wrong-shake")+'" aria-live="polite">'+
'<h3>'+(correct?"正解！その調子！":"おしい！ここから分かるよ。")+'</h3>'+diagnosis+'<p>'+esc(question.explanation)+'</p>'+bonus+revealed+hint+
'<div class="feedback-actions">'+actions+'</div></div>';
}
export function renderResult(element,engine){
const summary=engine.session?.summary;if(!summary)return;
const heading=summary.mode==="quest"?"エリアクエスト終了！":summary.modeName+" おつかれさま！";
const sub=summary.firstClear?"このエリアをクリア！次の道がひらいたよ。":summary.accuracy===100?"全問正解！すばらしい出来だよ。":(summary.mode==="quest"?"もう一度挑戦して、正解を増やしていこう。":"取り組んだ問題は、記録に残っているよ。");
const nextText=summary.wrong>0?"まちがえた問題 "+summary.wrong+"問は、迷いの洞窟に記録したよ。次のクエストにも少しずつ登場するよ。":"今回はまちがいがなかったよ。まちがえた問題が出たら、迷いの洞窟で見直していこう。";
const art=summary.firstClear||summary.mode==="volcano"?GROUP_IMAGES.celebration:GROUP_IMAGES.adventure;
const next=engine.getNextArea();
element.innerHTML='<section class="result-hero" style="'+sceneStyle(summary.firstClear?COMPLETION_BACKGROUND:"training-ground")+'">'+
'<div class="result-main"><div><p class="eyebrow">QUEST RESULT</p><h1>'+heading+'</h1><p>'+sub+'</p></div><img class="result-art" src="'+art+'" alt="" loading="lazy"></div></section>'+
'<div class="result-stats"><div class="result-stat"><span>正解</span><strong>'+summary.correct+' / '+summary.total+'</strong></div>'+
'<div class="result-stat"><span>正答率</span><strong>'+summary.accuracy+'%</strong></div><div class="result-stat"><span>最高コンボ</span><strong>'+summary.maxCombo+'</strong></div>'+
'<div class="result-stat"><span>今回のコイン</span><strong>🪙 '+summary.coinsEarned+'</strong></div></div>'+
'<section class="info-card"><h2>次にできること</h2><p>'+nextText+'</p>'+
'<div class="result-actions"><button class="primary-action" data-action="open-map">地図へもどる →</button>'+
'<button class="secondary-action" data-action="start-side" data-mode="cave" '+(summary.weakCount===0?"disabled":"")+'>まちがい直し</button>'+
'<button class="secondary-action" data-action="go-home">ホーム</button></div><p class="is-visually-muted">次の目的地：'+esc(next.name)+'</p></section>';
}
function renderMarketQuestion(mission,state){
const totals=getMissionTotals(mission);
if(state.phase===0){
const choices=[["nearest","四捨五入"],["up","切り上げ"],["down","切り捨て"],["oneSig","上から1けた"],["twoSig","上から2けた"]];
return '<h2>この買い物の目的に合う方法は？</h2><p>'+esc(mission.purpose)+'</p><div class="market-choice-grid">'+
choices.map(choice=>'<button class="answer-choice" data-action="market-answer" data-answer="'+choice[0]+'">'+choice[1]+'</button>').join("")+'</div>';
}
if(state.phase===1){
return '<h2>概数にして、合計を見積もろう。</h2><p>それぞれの品物の値段を「'+esc(mission.methodLabel)+'」で概数にしてから、合計しよう。</p>'+
'<div class="market-choice-grid">'+getEstimateChoices(mission).map(choice=>'<button class="answer-choice" data-action="market-answer" data-answer="'+choice.value+'">'+esc(choice.label)+'</button>').join("")+'</div>';
}
return '<h2>見積もった合計は、予算内におさまりそう？</h2><p>見積もり：<strong>'+formatYen(totals.estimatedTotal)+'</strong> ／ 予算：<strong>'+formatYen(mission.budget)+'</strong></p>'+
'<div class="market-choice-grid"><button class="answer-choice" data-action="market-answer" data-answer="yes">予算内におさまりそう</button><button class="answer-choice" data-action="market-answer" data-answer="no">予算をこえそう</button></div>';
}
function renderMarketFeedback(mission,state){
const totals=getMissionTotals(mission),last=state.last;
const phaseText=last.phase===0?"方法を選ぶ":last.phase===1?"合計を見積もる":"予算を考える";
let detail="";
if(last.phase===0)detail="この場面では「"+mission.methodLabel+"」を使います。"+mission.explanation;
else if(last.phase===1){
const lines=mission.items.map(item=>'<li>'+esc(item.name)+'：'+formatYen(item.price)+' → '+formatYen(roundedItemPrice(item.price,mission))+' × '+item.quantity+'こ</li>').join("");
detail='<p>品物ごとに概数にすると、次のようになるよ。</p><ul class="market-explain-list">'+lines+'</ul><p>見積もりの合計は '+formatYen(totals.estimatedTotal)+'。</p>';
}else{
const diff=totals.difference===0?"見積もりと実際の金額は同じです。":"見積もりと実際の金額には "+formatYen(totals.difference)+" の差があります。";
detail='<p>見積もり：'+formatYen(totals.estimatedTotal)+' ／ 実際の合計：'+formatYen(totals.actualTotal)+'</p>'+
'<p>予算は '+formatYen(mission.budget)+'。実際の合計は予算'+(totals.actualTotal<=mission.budget?"以内です。":"をこえています。")+'</p><p>'+diff+' 概数は目安なので、必要なときは実際の金額も確かめよう。</p>';
}
const nextLabel=last.phase<2?"次のステップへ →":state.missionIndex<SHOPPING_MISSIONS.length-1?"次の買い物へ →":"市場ミッションを終える →";
return '<div class="feedback-box '+(last.isCorrect?"is-correct":"is-wrong")+'"><h3>'+(last.isCorrect?"正解！":"ここを確認しよう")+' <span class="is-visually-muted">'+phaseText+'</span></h3>'+
(typeof detail==="string"&&detail.startsWith("<")?detail:'<p>'+esc(detail)+'</p>')+
'<div class="feedback-actions"><button class="primary-action" data-action="market-next">'+nextLabel+'</button></div></div>';
}
export function renderMarket(element,engine){
const mission=engine.getMarketMission(),state=engine.getMarketState();if(!mission||!state)return;
const phases=["方法を選ぶ","合計を見積もる","予算を確かめる"];
const items=mission.items.map(item=>'<div class="market-item"><strong>'+esc(item.name)+'</strong><span>'+formatYen(item.price)+' × '+item.quantity+'こ</span></div>').join("");
const content=state.last?renderMarketFeedback(mission,state):renderMarketQuestion(mission,state);
element.innerHTML='<div class="quiz-topline"><button class="quiet-action" data-action="open-map">← 地図へ</button><div class="quiz-meta"><span>大きな市場</span><span>買い物 '+(state.missionIndex+1)+' / '+SHOPPING_MISSIONS.length+'</span></div></div>'+
'<section class="market-scene" style="'+sceneStyle("town")+'"><p class="eyebrow">MARKET MISSION</p><h1>'+esc(mission.title)+'</h1><p class="lead">'+esc(mission.purpose)+'</p>'+
'<div class="market-items">'+items+'</div><div class="market-budget"><span>予算 '+formatYen(mission.budget)+'</span><span>ステップ '+(state.phase+1)+' / 3：'+phases[state.phase]+'</span></div>'+
'<div class="market-question"><div class="progress-track"><span style="width:'+((state.missionIndex*3+state.phase+1)/(SHOPPING_MISSIONS.length*3)*100)+'%"></span></div>'+content+'</div></section>';
}
export function renderMarketDone(element,engine){
const summary=engine.getMarketSummary();
element.innerHTML='<section class="result-hero" style="'+sceneStyle("sky-island")+'"><div class="result-main"><div><p class="eyebrow">FINAL MARKET RESULT</p><h1>市場ミッション達成！</h1><p>概数を使って見積もり、最後に実際の金額も確かめられたね。</p></div><img class="result-art" src="'+GROUP_IMAGES.celebration+'" alt="" loading="lazy"></div></section>'+
'<div class="result-stats"><div class="result-stat"><span>正解</span><strong>'+summary.correct+' / '+summary.total+'</strong></div>'+
'<div class="result-stat"><span>得点</span><strong>'+summary.score+'</strong></div><div class="result-stat"><span>買い物ミッション</span><strong>'+SHOPPING_MISSIONS.length+' / '+SHOPPING_MISSIONS.length+'</strong></div>'+
'<div class="result-stat"><span>獲得バッジ</span><strong>'+summary.badgesEarned+'</strong></div></div>'+
'<section class="info-card"><h2>旅のまとめ</h2><p>概数は、目的に合わせて使い方を選ぶことが大切。およその金額で判断したあと、必要に応じて正確な合計も確かめよう。</p>'+
'<div class="result-actions"><button class="primary-action" data-action="open-badges">バッジを見る</button><button class="secondary-action" data-action="open-map">地図へ</button><button class="secondary-action" data-action="go-home">ホーム</button></div></section>';
}
export function renderBadges(element,engine){
const badges=engine.getBadgeData(),earned=badges.filter(badge=>badge.earned).length;
const cards=badges.map(badge=>{
const image=badge.image?'<img src="'+esc(badge.image)+'" alt="" loading="lazy">':esc(badge.earned?badge.icon:"？");
return '<article class="badge-card '+(badge.earned?"is-earned":"is-locked")+'"><div class="badge-medal">'+image+'</div>'+
'<strong>'+esc(badge.earned?badge.name:"？？？")+'</strong><small>'+esc(badge.description)+'</small></article>';
}).join("");
element.innerHTML='<div class="page-heading"><div><p class="eyebrow">BADGE COLLECTION</p><h1>バッジ図鑑</h1><p class="lead">学んだこと、挑戦したことが形になって残るよ。</p></div><button class="quiet-action" data-action="go-home">⌂ ホーム</button></div>'+
'<section class="info-card"><div class="edu-row-between"><strong>集めたバッジ</strong><span>'+earned+' / '+badges.length+'</span></div><div class="progress-track"><span style="width:'+(earned/badges.length*100)+'%"></span></div></section><div class="badges-grid">'+cards+'</div>';
}
export function renderStats(element,engine){
const profile=engine.getProfile(),topics=Object.entries(profile.topicStats||{});
const rows=topics.length?topics.map(([name,stat])=>{
const rate=stat.total?Math.round(stat.correct/stat.total*100):0;
return '<div class="topic-row"><span>'+esc(name)+'</span><div class="progress-track"><span style="width:'+rate+'%"></span></div><strong>'+rate+'%</strong></div>';
}).join(""):'<p class="is-visually-muted">問題に挑戦すると、ここに記録がたまるよ。</p>';
element.innerHTML='<div class="page-heading"><div><p class="eyebrow">LEARNING RECORD</p><h1>冒険の記録</h1><p class="lead">前よりできるようになったことを見てみよう。</p></div><button class="quiet-action" data-action="go-home">⌂ ホーム</button></div>'+
'<div class="stats-grid"><section class="stats-panel"><h2>取り組み</h2><strong class="large-stat">'+profile.totalAnswers+'問</strong><p>正解 '+profile.totalCorrect+'問</p></section>'+
'<section class="stats-panel"><h2>正答率</h2><strong class="large-stat">'+(profile.totalAnswers?Math.round(profile.totalCorrect/profile.totalAnswers*100):0)+'%</strong><p>まちがい直し '+profile.mistakesFixed+'問</p></section>'+
'<section class="stats-panel"><h2>冒険</h2><strong class="large-stat">'+engine.getProgress().completed+' / '+engine.getProgress().total+'</strong><p>コイン '+profile.coins+'枚</p></section></div>'+
'<section class="stats-panel"><h2>分野ごとの正答率</h2>'+rows+'</section><div class="result-actions"><button class="secondary-action" data-action="open-map">地図へ</button><button class="secondary-action" data-action="open-badges">バッジ図鑑</button></div>';
}