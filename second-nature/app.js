'use strict';
const projects={
 house:{title:'The Collected Home',category:'RESIDENTIAL INTERIORS / CONCEPT STUDY',image:'assets/room-after.jpg',alt:'The proposed furniture arrangement in an older living room',intro:'A room with good bones, waiting for a different way of living.',parts:[['The question','The original furniture occupied much of the room and crowded the window side. How could the same room feel easier to move through, without changing its structure?'],['The proposal','Replace the deep, heavy pieces with a lower sofa, a compact round table and a separate reading chair. Keep the windows, plaster, cornice and timber floor as the room’s framework.'],['The intention','Give gathering and reading their own places, and make the route across the room clearer. This is a furniture concept, illustrated with generated before-and-after views.']],target:'transformation',cta:'Explore the before & after'},
 workshop:{title:'The Open Workshop',category:'ADAPTIVE REUSE / CONCEPT STUDY',image:'assets/spatial-study.png',alt:'Architectural assembly drawing of a courtyard workshop',intro:'A former place of making, imagined as a place to gather.',parts:[['The question','An existing courtyard workshop has generous height, worn timber and a strong connection to its street. What could a public next chapter keep from its working past?'],['The proposal','A neighbourhood cafe and shared workshop around an open courtyard. The drawing explores retained masonry, a repaired roof and a flexible edge between making, sitting and meeting.'],['The intention','Let the building’s useful character lead the proposal. Feasibility, access, structure and servicing would need to be established before a real project could proceed.']],target:'enquiry',cta:'Tell us about a place like this'}
};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const compactScene=matchMedia('(max-height: 620px)');
const run=document.querySelector('.transformation-run');
const pin=document.querySelector('.transformation-pin');
const comparison=document.querySelector('.comparison');
const afterLayer=document.querySelector('.after-layer');
const roomHeading=document.querySelector('.room-heading');
const roomCaption=document.getElementById('comparison-caption');
const roomState=document.getElementById('room-state');
const roomInstruction=document.getElementById('room-instruction');
const roomToggle=document.getElementById('room-toggle');
const modeButton=document.getElementById('scroll-mode');
const clamp=value=>Math.max(0,Math.min(1,value));
const smooth=value=>{const t=clamp(value);return t*t*(3-2*t);};
let scrollMode=!(reduced.matches||compactScene.matches);
let reveal=scrollMode?0:100,displayedReveal=reveal,animationFrame=0,scrollFrame=0,lastTime=0,manualTween=null,copyPhase='';
function paintRoom(value){
 // Hold the original briefly, reveal it spatially, then leave time with the finished room.
 const progress=clamp((value-10)/74);
 const eased=smooth(progress);
 const edge=-14+128*eased;
 const mask=value<=0?'linear-gradient(transparent,transparent)':value>=100?'linear-gradient(#000,#000)':`linear-gradient(104deg,#000 ${edge-5}%,transparent ${edge+5}%)`;
 afterLayer.style.maskImage=mask;
 afterLayer.style.webkitMaskImage=mask;
 // Both photographs share one camera movement, preserving their alignment.
 comparison.style.transform=`scale(${(1+0.018*eased).toFixed(5)})`;
 const phase=progress<0.5?'before':'after';
 const captionOpacity=progress<0.5?1-smooth((progress-0.25)/0.16):smooth((progress-0.59)/0.17);
 if(copyPhase!==phase){
  copyPhase=phase;
  roomState.textContent=phase==='after'?'A different way to live':'The original room';
  roomCaption.textContent=phase==='after'?'A lower sofa. A place to read. Room to breathe.':'The windows. The old floor. The proportions worth keeping.';
 }
 roomCaption.style.opacity=String(captionOpacity);
 roomState.style.opacity=String(captionOpacity);
 roomCaption.style.transform=`translateY(${(1-captionOpacity)*7}px)`;
 const headingOpacity=1-smooth((progress-0.12)/0.32);
 roomHeading.style.opacity=String(headingOpacity);
 roomHeading.style.transform=`translateY(${-12*(1-headingOpacity)}px)`;
 const isAfter=reveal>=50;
 roomToggle.textContent=isAfter?'See original':'See reimagined';
 roomToggle.setAttribute('aria-label',isAfter?'See the original room':'See the reimagined room');
 roomInstruction.textContent=scrollMode?(value>84?'Same room. A new possibility.':'Keep scrolling. See what changes.'):'The room stays. The furniture changes.';
 modeButton.hidden=scrollMode||reduced.matches||compactScene.matches;
}
function animateRoom(time){
 animationFrame=0;
 if(document.hidden)return;
 if(manualTween){
  if(manualTween.started===null)manualTween.started=time;
  const t=clamp((time-manualTween.started)/1100);
  const ease=t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  displayedReveal=manualTween.from+(reveal-manualTween.from)*ease;
  if(t===1)manualTween=null;
 }else{
  const dt=lastTime?Math.min(64,time-lastTime):16;
  displayedReveal+=(reveal-displayedReveal)*(1-Math.exp(-dt/95));
 }
 lastTime=time;
 if(!manualTween&&Math.abs(reveal-displayedReveal)<0.03)displayedReveal=reveal;
 paintRoom(displayedReveal);
 if(manualTween||displayedReveal!==reveal)animationFrame=requestAnimationFrame(animateRoom);
 else lastTime=0;
}
function setReveal(value,manual=false,immediate=false){
 if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>100)throw new Error('Reveal must be a number from 0 to 100.');
 reveal=value;if(manual)scrollMode=false;
 manualTween=manual&&!reduced.matches&&!immediate?{from:displayedReveal,started:null}:null;
 if(reduced.matches||immediate){
  cancelAnimationFrame(animationFrame);animationFrame=0;lastTime=0;
  displayedReveal=reveal;paintRoom(displayedReveal);return;
 }
 if(!animationFrame)animationFrame=requestAnimationFrame(animateRoom);
}
function onScroll(){
 scrollFrame=0;if(!scrollMode||reduced.matches||compactScene.matches)return;
 const distance=Math.max(1,run.offsetHeight-pin.offsetHeight);
 const raw=clamp(-run.getBoundingClientRect().top/distance)*100;
 setReveal(raw,false,raw===0||raw===100);
}
window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(onScroll);},{passive:true});
window.addEventListener('resize',onScroll);
roomToggle.addEventListener('click',()=>setReveal(reveal>=50?0:100,true));
modeButton.addEventListener('click',()=>{scrollMode=true;manualTween=null;onScroll();});
function motionPreferenceChanged(){
 scrollMode=!(reduced.matches||compactScene.matches);
 if(!scrollMode)setReveal(100,true,true);else onScroll();
}
reduced.addEventListener('change',motionPreferenceChanged);
compactScene.addEventListener('change',motionPreferenceChanged);
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){cancelAnimationFrame(animationFrame);animationFrame=0;lastTime=0;}
 else{setReveal(reveal,false,true);onScroll();}
});
// Decode the second view before it is needed, rather than fetching on the first reveal.
comparison.querySelectorAll('img').forEach(img=>{img.loading='eager';img.decode?.().catch(()=>{});});
paintRoom(displayedReveal);onScroll();
let activeDialog=null,dialogTrigger=null;
function openDialog(id){const next=document.getElementById(id);if(!next||next===activeDialog)return;if(activeDialog)activeDialog.close();else dialogTrigger=document.activeElement;activeDialog=next;next.showModal();next.scrollTop=0;}
function closeDialog(){if(!activeDialog)return;activeDialog.close();activeDialog=null;dialogTrigger?.focus({preventScroll:true});dialogTrigger=null;}
function showProject(id){const p=projects[id];if(!p)throw new Error('Unknown project.');document.getElementById('project-detail').innerHTML=`<div class="project-detail-inner" data-study="${id}"><p class="eyebrow">${p.category}</p><h2 id="project-dialog-title">${p.title}</h2><p>${p.intro}</p><img src="${p.image}" alt="${p.alt}"><div class="study-copy">${p.parts.map(([title,body])=>`<div><h3>${title}</h3><p>${body}</p></div>`).join('')}</div><button class="text-link" data-go="${p.target}">${p.cta}</button></div>`;openDialog('project-dialog');}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.project)showProject(b.dataset.project);else if(b.dataset.open)openDialog(b.dataset.open);else if(b.hasAttribute('data-close'))closeDialog();else if(b.dataset.go){closeDialog();document.getElementById(b.dataset.go).scrollIntoView({behavior:'instant'});}});
document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('cancel',e=>{e.preventDefault();closeDialog();});d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();});});
const menuButton=document.querySelector('.mobile-menu'),menu=document.getElementById('mobile-nav');
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');}
menuButton.addEventListener('click',()=>{menu.hidden=!menu.hidden;menuButton.setAttribute('aria-expanded',String(!menu.hidden));});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();menuButton.focus();}});
const form=document.getElementById('brief-form'),result=document.getElementById('brief-result');
function showBrief(){
 for(const id of ['brief-name','brief-location','brief-goals']){const field=document.getElementById(id);field.setCustomValidity(field.value.trim()?'':'Please add a little detail here.');}
 if(!form.reportValidity())return false;
 const data=new FormData(form);const fields=[['Name',data.get('name').trim()],['Project',data.get('projectType')],['Location',data.get('location').trim()],['Your brief',data.get('goals').trim()],['Budget',data.get('budget')],['Timing',data.get('timing')]];
 const summary=document.getElementById('brief-summary');summary.replaceChildren();for(const [label,value] of fields){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);summary.append(row);}
 form.hidden=true;result.hidden=false;result.querySelector('h3').focus();return true;
}
form.addEventListener('submit',e=>{e.preventDefault();showBrief();});
form.querySelectorAll('input,textarea').forEach(input=>input.addEventListener('input',()=>input.setCustomValidity('')));
document.getElementById('edit-brief').addEventListener('click',()=>{result.hidden=true;form.hidden=false;document.getElementById('brief-name').focus();});
document.getElementById('new-brief').addEventListener('click',()=>{form.reset();form.querySelectorAll('input,textarea').forEach(i=>i.setCustomValidity(''));result.hidden=true;form.hidden=false;form.querySelector('input').focus();});
const context=document.modelContext;
if(context?.registerTool){
 const lifecycle=new AbortController();const register=t=>{try{Promise.resolve(context.registerTool(t,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
 register({name:'read_studio_projects',title:'Read studio project studies',description:'Read the fictional studio’s two concept projects and service scope. No enquiry is sent.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:input=>{if(input&&Object.keys(input).length)throw new Error('No input fields are accepted.');return{fictional:true,services:['Architecture','Interiors','Adaptive reuse'],projects:Object.entries(projects).map(([id,p])=>({id,title:p.title,category:p.category,intro:p.intro,story:p.parts}))};}});
 register({name:'set_room_comparison',title:'Set room comparison',description:'Set the room transformation progress. A soft spatial reveal moves across the room from original to reimagined; no percentage control is displayed. Switches to manual viewing. No data is saved.',inputSchema:{type:'object',properties:{revealPercent:{type:'number',minimum:0,maximum:100}},required:['revealPercent'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{if(!input||Object.keys(input).some(k=>k!=='revealPercent'))throw new Error('Use revealPercent only.');setReveal(input.revealPercent,true);document.querySelector('.transformation-run').scrollIntoView({behavior:'instant'});return{revealPercent:reveal,view:reveal>=50?'reimagined':'original',mode:'manual',conceptVisualisations:true};}});
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
