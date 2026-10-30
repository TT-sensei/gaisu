let context=null;
const recipesPromise=import("https://tt-sensei.github.io/sounds-recipe-/sounds.js")
.then(module=>Array.isArray(module.soundList)?module.soundList:[])
.catch(()=>[]);
export async function playSfx(id,enabled=true){
if(!enabled)return false;
try{
const AudioContextClass=window.AudioContext||window.webkitAudioContext;
if(!AudioContextClass)return false;
if(!context)context=new AudioContextClass();
// resume() is called before the first await so Safari/iPad can receive the
// user-activation signal from the tap that triggered this sound.
const resumeTask=context.state==="suspended"?context.resume():Promise.resolve();
const recipes=await recipesPromise;
await resumeTask;
if(context.state==="suspended")await context.resume();
const recipe=recipes.find(item=>item.id===id);
if(!recipe)return false;
recipe.play(context,.18);
return true;
}catch{return false;}
}