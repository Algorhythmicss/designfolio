'use strict';
const emailAddress = 'ayushhhudd@gmail.com';
const aboutDialog=document.getElementById('about-dialog');
let returnFocus=null;
function closeDialog(dialog,restore=true){dialog.close();if(restore&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
for(const dialog of [aboutDialog]){
 dialog.querySelector('[data-close]').addEventListener('click',()=>closeDialog(dialog));
 dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog);});
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog(dialog);});
}
document.getElementById('about-work').addEventListener('click',event=>{returnFocus=event.currentTarget;aboutDialog.showModal();});
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
const form=document.getElementById('enquiry-form'),result=document.getElementById('enquiry-result'),draft=document.getElementById('email-draft'),openEmail=document.getElementById('open-email'),status=document.getElementById('draft-status');
let subject='A project enquiry for Ayush';
function updateEmailLink(){openEmail.href=`mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft.value)}`;status.textContent='Your draft is ready. It has not been sent.';}
function createDraft(){
 document.getElementById('contact-details').open=true;
 const fields=new FormData(form),name=String(fields.get('name')||'').trim(),kind=String(fields.get('kind')||''),idea=String(fields.get('idea')||'').trim(),budget=String(fields.get('budget')||'').trim(),timing=String(fields.get('timing')||'').trim();
 subject=`${kind} — enquiry from ${name}`;
 const thinking=kind==='Still figuring it out'?'I’m still figuring out exactly what I need.':`I’m thinking about ${kind.toLowerCase()}.`;
 draft.value=`Hi Ayush,\n\nI’m ${name}. ${thinking}\n\n${idea}${budget?'\n\nBudget: '+budget:''}${timing?'\nTiming: '+timing:''}\n\nI’d love to discuss whether this would be a good fit.\n\n${name}`;
 updateEmailLink();form.hidden=true;result.hidden=false;result.querySelector('h3').focus({preventScroll:true});result.scrollIntoView({behavior:motionPreference.matches?'auto':'smooth',block:'start'});
 return {recipient:emailAddress,subject,message:draft.value,sent:false};
}
form.addEventListener('submit',event=>{event.preventDefault();form.elements.name.setCustomValidity(form.elements.name.value.trim()?'':'Please enter your name.');form.elements.idea.setCustomValidity(form.elements.idea.value.trim().length>=10?'':'Please tell me a little more about the project.');if(form.reportValidity())createDraft();});
for(const field of [form.elements.name,form.elements.idea])field.addEventListener('input',()=>field.setCustomValidity(''));
draft.addEventListener('input',updateEmailLink);
openEmail.addEventListener('click',()=>{status.textContent='Your email app can open this draft. Review it and press Send there; this page cannot confirm delivery.';});
document.getElementById('edit-brief').addEventListener('click',()=>{result.hidden=true;form.hidden=false;form.elements.name.focus({preventScroll:true});form.scrollIntoView({behavior:motionPreference.matches?'auto':'smooth'});});
document.getElementById('copy-brief').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(draft.value);status.textContent='Message copied. Paste it into an email to '+emailAddress+'.';}catch{draft.focus();draft.select();status.textContent='Select and copy the message, then paste it into your email app.';}});
const modelContext=typeof document==='undefined'?undefined:document.modelContext;
if(modelContext?.registerTool){
 const lifecycle=new AbortController();
 const budgets=['Under ₹50,000 ($1,500)','₹50,000 to ₹1,50,000 ($1,500 to $4,000)','Above ₹1,50,000 ($4,000)','Not sure yet'];
 const tool={name:'prepare_project_enquiry',title:'Prepare a project enquiry',description:'Prepare an editable email draft to Ayush in this page. Does not open an email app or send a message.',inputSchema:{type:'object',properties:{kind:{type:'string',enum:['A landing page','A website or shop','A product or app','Still figuring it out']},name:{type:'string',minLength:1,maxLength:80},idea:{type:'string',minLength:10,maxLength:1800},budget:{type:'string',enum:budgets},timing:{type:'string',maxLength:100}},required:['kind','name','idea'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute(input){
  const kinds=['A landing page','A website or shop','A product or app','Still figuring it out'];
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['kind','name','idea','budget','timing'].includes(k))||!kinds.includes(input.kind))throw new Error('Choose a valid project type.');
  if(input.budget!==undefined&&!budgets.includes(input.budget))throw new Error('Choose a valid budget range.');
  for(const [key,min,max] of [['name',1,80],['idea',10,1800],['timing',0,100]]){const v=input[key];if(v===undefined&&min===0)continue;if(typeof v!=='string'||v.trim().length<min||v.length>max)throw new Error('Invalid '+key+'.');}
  for(const key of ['kind','name','idea','budget','timing']){const el=form.elements[key];if(el instanceof RadioNodeList&&!input[key])el.forEach(r=>{r.checked=false;});else el.value=input[key]||'';}
  form.elements.name.setCustomValidity('');form.elements.idea.setCustomValidity('');
  return createDraft();
 }};
 try{Promise.resolve(modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
