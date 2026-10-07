'use strict';
const emailAddress = 'ayushhhudd@gmail.com';
const contactConfig=window.AYUSH_CONTACT||{};
function formspreeUrl(value){try{const url=new URL(String(value||''));return url.protocol==='https:'&&url.hostname==='formspree.io'&&!url.port&&!url.username&&!url.password&&!url.search&&!url.hash&&/^\/f\/[a-z0-9]+\/?$/i.test(url.pathname)?url.href:'';}catch{return '';}}
function bookingUrl(value){try{const url=new URL(String(value||''));const googleBooking=url.hostname==='calendar.app.google'&&url.pathname.length>1||url.hostname==='calendar.google.com'&&/^\/calendar\/(?:u\/\d+\/)?appointments\/schedules\/.+/.test(url.pathname);return url.protocol==='https:'&&!url.port&&!url.username&&!url.password&&googleBooking?url.href:'';}catch{return '';}}
const formspreeEndpoint=formspreeUrl(contactConfig.formspreeEndpoint);
const whatsappNumber=String(contactConfig.whatsappNumber||'').replace(/[\s()+-]/g,'');
const callBookingUrl=bookingUrl(contactConfig.bookingUrl);
const contactOptions=document.getElementById('contact-options'),whatsappLink=document.getElementById('contact-whatsapp'),bookingLink=document.getElementById('contact-booking');
if(whatsappLink&&/^[1-9]\d{7,14}$/.test(whatsappNumber)){whatsappLink.href=`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Ayush, I’d like to talk about a project.')}`;whatsappLink.hidden=false;}
if(bookingLink){bookingLink.href=callBookingUrl||`mailto:${emailAddress}?subject=${encodeURIComponent('A Google Meet about my project')}`;bookingLink.textContent=callBookingUrl?'Book a Google Meet':'Arrange a Google Meet';bookingLink.hidden=false;if(callBookingUrl){bookingLink.target='_blank';bookingLink.rel='noopener noreferrer';}else bookingLink.removeAttribute('target');}
if(contactOptions)contactOptions.hidden=!(whatsappLink&&!whatsappLink.hidden||bookingLink&&!bookingLink.hidden);
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
const directForm=document.getElementById('direct-enquiry'),replyEmail=document.getElementById('reply-email'),sendEnquiry=document.getElementById('send-enquiry'),sendStatus=document.getElementById('send-status'),editBrief=document.getElementById('edit-brief');
let sendState='idle',lastAcceptedDraft='';
let subject='A project enquiry for Ayush';
function updateEmailLink(){
 openEmail.href=`mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft.value)}`;
 status.textContent=sendState==='sending'?'Your reviewed draft is being sent through Formspree.':sendState==='uncertain'?'Formspree’s receipt could not be confirmed. Your draft is still here.':sendState==='accepted'&&lastAcceptedDraft===draft.value?'Formspree accepted this draft. A copy is kept here.':'This version of your draft is ready. It has not been sent.';
}
function clearDelivery(){if(sendState==='sending')return;sendState='idle';lastAcceptedDraft='';if(sendStatus)sendStatus.textContent='';if(sendEnquiry){sendEnquiry.disabled=!formspreeEndpoint;sendEnquiry.textContent='Send enquiry';}}
function createDraft(){
 if(sendState==='sending')throw new Error('Please wait for the current enquiry submission before preparing another draft.');
 clearDelivery();
 document.getElementById('contact-details').open=true;
 const fields=new FormData(form),name=String(fields.get('name')||'').trim(),kind=String(fields.get('kind')||''),idea=String(fields.get('idea')||'').trim(),budget=String(fields.get('budget')||'').trim(),timing=String(fields.get('timing')||'').trim();
 subject=`${kind} — enquiry from ${name}`;
 const thinking=kind==='Still figuring it out'?'I’m still figuring out exactly what I need.':`I’m thinking about ${kind.toLowerCase()}.`;
 draft.value=`Hi Ayush,\n\nI’m ${name}. ${thinking}\n\n${idea}${budget?'\n\nBudget: '+budget:''}${timing?'\nTiming: '+timing:''}\n\nI’d love to discuss whether this would be a good fit.\n\n${name}`;
 updateEmailLink();form.hidden=true;result.hidden=false;result.querySelector('h3').focus({preventScroll:true});result.scrollIntoView({behavior:motionPreference.matches?'auto':'smooth',block:'start'});
 return {recipient:emailAddress,subject,message:draft.value,sent:false};
}
form.addEventListener('submit',event=>{event.preventDefault();form.elements.name.setCustomValidity(form.elements.name.value.trim()?'':'Please enter your name.');form.elements.idea.setCustomValidity(form.elements.idea.value.trim().length>=10?'':'Please tell me a little more about the project.');if(form.reportValidity())createDraft();});
// The HTML button stays disabled until the submit interception above is registered.
form.querySelector('[type="submit"]').disabled=false;
for(const field of [form.elements.name,form.elements.idea])field.addEventListener('input',()=>field.setCustomValidity(''));
draft.addEventListener('input',()=>{if(lastAcceptedDraft&&lastAcceptedDraft===draft.value){sendState='accepted';sendEnquiry.disabled=true;sendEnquiry.textContent='Enquiry accepted';sendStatus.textContent='This draft was already accepted. A copy is kept here.';}else if(sendState==='accepted'){sendState='idle';sendEnquiry.disabled=false;sendEnquiry.textContent='Send enquiry';sendStatus.textContent='You changed the draft. This version has not been sent.';}updateEmailLink();});
openEmail.addEventListener('click',()=>{status.textContent='Your email app can open this draft. Review it and press Send there; this page cannot confirm delivery.';});
editBrief.addEventListener('click',()=>{if(sendState==='sending')return;result.hidden=true;form.hidden=false;form.elements.name.focus({preventScroll:true});form.scrollIntoView({behavior:motionPreference.matches?'auto':'smooth'});});
document.getElementById('copy-brief').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(draft.value);status.textContent='Message copied. Paste it into an email to '+emailAddress+'.';}catch{draft.focus();draft.select();status.textContent='Select and copy the message, then paste it into your email app.';}});
if(directForm&&replyEmail&&sendEnquiry&&sendStatus&&formspreeEndpoint){
 directForm.addEventListener('submit',async event=>{
  event.preventDefault();
  if(sendState==='sending'||sendState==='accepted'&&lastAcceptedDraft===draft.value)return;
  replyEmail.value=replyEmail.value.trim();
  draft.setCustomValidity(draft.value.trim().length>=10?'':'Please include a little more detail in your message.');
  if(!directForm.reportValidity()||!draft.reportValidity())return;
  const message=draft.value,name=form.elements.name.value.trim(),email=replyEmail.value;
  const body=new FormData();body.append('email',email);body.append('name',name);body.append('_subject',subject);body.append('message',message);
  const controller=new AbortController(),timeout=window.setTimeout(()=>controller.abort(),20000);
  sendState='sending';sendEnquiry.disabled=true;sendEnquiry.textContent='Sending…';directForm.setAttribute('aria-busy','true');draft.disabled=true;replyEmail.disabled=true;editBrief.disabled=true;sendStatus.textContent='Sending your reviewed message…';updateEmailLink();
  try{
   const response=await fetch(formspreeEndpoint,{method:'POST',body,headers:{Accept:'application/json'},credentials:'omit',signal:controller.signal});
   if(response.ok){sendState='accepted';lastAcceptedDraft=message;sendEnquiry.textContent='Enquiry accepted';sendStatus.textContent='Formspree accepted your enquiry. Your draft stays here for your records.';}
   else if(response.status>=400&&response.status<500){sendState='rejected';sendEnquiry.textContent='Try sending again';sendStatus.textContent=response.status===429?'The form service is receiving too many requests. Try later, or use the email draft below. Your message is kept here.':'The form service could not accept this enquiry. Check your email address, try later, or use the email draft below. Your message is kept here.';}
   else{sendState='uncertain';sendEnquiry.textContent='Try sending again';sendStatus.textContent='I couldn’t confirm whether Formspree received it. Your draft is kept here. Trying again could send a duplicate; the email and copy options are still available.';}
  }catch{sendState='uncertain';sendEnquiry.textContent='Try sending again';sendStatus.textContent='I couldn’t confirm whether Formspree received it. Your draft is kept here. Trying again could send a duplicate; the email and copy options are still available.';}
  finally{window.clearTimeout(timeout);directForm.removeAttribute('aria-busy');draft.disabled=false;replyEmail.disabled=false;editBrief.disabled=false;sendEnquiry.disabled=sendState==='accepted';updateEmailLink();}
 });
 replyEmail.addEventListener('input',()=>{if(sendState==='accepted'){sendState='idle';lastAcceptedDraft='';sendEnquiry.disabled=false;sendEnquiry.textContent='Send enquiry';sendStatus.textContent='You changed the reply address. The previous enquiry was already accepted.';updateEmailLink();}});
 draft.addEventListener('input',()=>draft.setCustomValidity(''));
 directForm.hidden=false;sendEnquiry.disabled=false;
 const prepareNote=document.getElementById('prepare-note'),contactDisclosure=document.getElementById('contact-disclosure');
 if(prepareNote)prepareNote.textContent='You’ll review the message first. Then send it through Formspree, or open it in your email app.';
 if(contactDisclosure)contactDisclosure.textContent='This portfolio’s contact form prepares an editable email draft. If you choose Send enquiry, Formspree processes your reply address and message for delivery to Ayush. Preparing a draft or using the copy option does not submit it.';
}
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
