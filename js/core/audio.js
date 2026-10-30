let context=null;
const soundModulePromise=import("https://tt-sensei.github.io/sounds-recipe-/sounds.js").catch(()=>null);
export async function playSfx(id,enabled=true){
if(!enabled)return false;
try{
const AudioContextClass=window.AudioContext||window.webkitAudioContext;
if(!AudioContextClass)return false;
if(!context)context=new AudioContextClass();
// Start resume() during the tap, before waiting for the shared sound module.
const resumeTask=context.state==="suspended"?context.resume():Promise.resolve();
const soundModule=await soundModulePromise;
if(!soundModule||typeof soundModule.playSound!=="function"||typeof soundModule.getSound!=="function")return false;
await resumeTask;
if(!soundModule.getSound(id))return false;
return await soundModule.playSound(context,id,.18);
}catch{return false;}
}