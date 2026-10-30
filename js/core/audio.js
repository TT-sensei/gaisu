let context=null;let recipesPromise=null;
async function getRecipes(){
if(!recipesPromise)recipesPromise=import("https://tt-sensei.github.io/sounds-recipe-/sounds.js").then(module=>Array.isArray(module.soundList)?module.soundList:[]).catch(()=>[]);
return recipesPromise;
}
export async function playSfx(id,enabled=true){
if(!enabled)return false;
try{
const recipes=await getRecipes(),recipe=recipes.find(item=>item.id===id);
if(!recipe)return false;
const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(!AudioContextClass)return false;
if(!context)context=new AudioContextClass();
if(context.state==="suspended")await context.resume();
recipe.play(context,.18);return true;
}catch{return false;}
}