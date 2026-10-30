import {GROUP_IMAGES} from "../config.js";

let badgeQueue = [];
let badgeQueueBusy = false;

function getBadgeLayer(){
  let layer = document.querySelector("#quest-effect-layer");
  if(layer) return layer;
  layer = document.createElement("div");
  layer.id = "quest-effect-layer";
  layer.setAttribute("aria-live","polite");
  layer.setAttribute("aria-atomic","false");
  document.body.append(layer);
  return layer;
}

export function showAreaIntro(title){
  const scene = document.querySelector("#quiz-content .quiz-scene");
  if(!scene) return;
  scene.classList.remove("quest-scene-enter");
  void scene.offsetWidth;
  scene.classList.add("quest-scene-enter");

  scene.querySelector(".quest-area-intro")?.remove();
  const banner = document.createElement("div");
  banner.className = "quest-area-intro";
  banner.setAttribute("aria-hidden","true");

  const image = document.createElement("img");
  image.src = GROUP_IMAGES.adventure;
  image.alt = "";
  image.width = 52;
  image.height = 52;
  image.decoding = "async";

  const copy = document.createElement("div");
  copy.className = "quest-area-intro-copy";
  const label = document.createElement("span");
  label.className = "quest-area-intro-label";
  label.textContent = "冒険スタート";
  const name = document.createElement("strong");
  name.textContent = title || "エリアクエスト";
  const line = document.createElement("small");
  line.textContent = "ここから挑戦しよう！";
  copy.append(label,name,line);
  banner.append(image,copy);
  scene.prepend(banner);

  window.setTimeout(()=>banner.classList.add("is-leaving"),1550);
  window.setTimeout(()=>banner.remove(),2050);
}

export function showComboEffect(current){
  const milestone = Number(current);
  if(![3,5,10].includes(milestone)) return;
  window.requestAnimationFrame(()=>{
    const panel = document.querySelector("#quiz-content .quiz-aside .aside-stat:nth-child(2)");
    if(!panel) return;
    panel.querySelector(".quest-combo-burst")?.remove();
    panel.classList.remove("quest-combo-hit");
    void panel.offsetWidth;
    panel.classList.add("quest-combo-hit");
    const burst = document.createElement("span");
    burst.className = "quest-combo-burst";
    burst.textContent = milestone===10 ? "10連続！すごい！" : milestone+"連続正解！";
    panel.append(burst);
    window.setTimeout(()=>{
      panel.classList.remove("quest-combo-hit");
      burst.remove();
    },1550);
  });
}

function showNextBadge(){
  if(badgeQueueBusy || !badgeQueue.length) return;
  badgeQueueBusy = true;
  const badge = badgeQueue.shift();
  const layer = getBadgeLayer();

  const card = document.createElement("div");
  card.className = "quest-badge-reward";
  const imageWrap = document.createElement("div");
  imageWrap.className = "quest-badge-reward-image";
  if(badge.image){
    const image = document.createElement("img");
    image.src = badge.image;
    image.alt = "";
    image.width = 62;
    image.height = 62;
    image.loading = "eager";
    image.onerror = ()=>{image.remove();imageWrap.textContent=badge.icon||"🏅";};
    imageWrap.append(image);
  }else{
    imageWrap.textContent = badge.icon||"🏅";
  }

  const copy = document.createElement("div");
  copy.className = "quest-badge-reward-copy";
  const eyebrow = document.createElement("span");
  eyebrow.textContent = "NEW BADGE";
  const name = document.createElement("strong");
  name.textContent = badge.name||"新しいバッジ";
  const description = document.createElement("small");
  description.textContent = badge.description||"挑戦の記録が増えたよ。";
  copy.append(eyebrow,name,description);
  card.append(imageWrap,copy);
  layer.append(card);
  window.requestAnimationFrame(()=>card.classList.add("is-visible"));

  window.setTimeout(()=>{
    card.classList.remove("is-visible");
    window.setTimeout(()=>{
      card.remove();
      badgeQueueBusy = false;
      showNextBadge();
    },280);
  },2700);
}

export function showBadgeReward(badge){
  if(!badge || !badge.name) return;
  badgeQueue.push(badge);
  showNextBadge();
}
