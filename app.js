'use strict';
const emailAddress = 'ayushhhudd@gmail.com';
const projects = {
 'elsewhere': {
  name:'Elsewhere', category:'Festival website · Self-initiated concept', title:'From “I wish I was there” to finding a pass.',
  intro:'A music and arts festival needs to sell a feeling. It also needs to answer the questions that decide whether someone actually goes.',
  image:'assets/elsewhere-chorus.webp', alt:'A red and black urban print collage from Elsewhere', art:'festival',
  question:'How do you create a sense of escape without making the practical information hard to find?',
  decisions:[['Let the place set the mood.','Full-bleed city collages turn the page into a small unfamiliar world. Short, concrete copy explains what the two-day festival is.'],['Help people find their version of the day.','Programme filters combine day and activity type. Each artist detail leads to the right day pass; travel, access and policies are available when needed.'],['Keep the booking decision clear.','Visitors can compare day and weekend passes, adjust guest numbers and see the total before completing a demo ticket. Selections survive trips back to the programme or the policy.']],
  boundary:'An invented event with generated imagery and working frontend interactions. Checkout creates a demo ticket only; there is no payment, reservation or email. No sales or conversion results are claimed.',
  url:'elsewhere/', link:'Open the festival website', prompt:'I’m interested in a website with an immersive visual direction and a clear booking or enquiry flow.'
 },
 'second-nature': {
  name:'Second Nature', category:'Architecture & interiors · Self-initiated concept', title:'Show the possibility. Make the first conversation easier.',
  intro:'For someone considering an interior project, “we design beautiful spaces” doesn’t explain what could change in their own home.',
  image:'assets/room-after.webp', alt:'The proposed room with an oxblood sofa, a blue reading chair and a round coffee table', art:'room',
  question:'How can a studio make an unfamiliar design process feel tangible before a prospective client gets in touch?',
  decisions:[['Make the change visible.','The website transforms one room as you scroll, keeping its architecture while replacing the furniture. Direct controls and a reduced-motion option make the comparison accessible in different contexts.'],['Explain what was considered.','Two project studies connect the existing space to a proposal. Drawings and collected-object artwork carry the visual language beyond a conventional image grid.'],['Give the conversation a useful starting point.','The enquiry flow asks about the place, desired changes, budget and timing, then creates an editable brief preview.']],
  boundary:'A fictional studio and concept furniture proposal, shown with generated artwork. These are not completed commissions or verified architectural plans. The studio brief is a local preview and is not delivered to a business.',
  url:'second-nature/', link:'Open the studio website', prompt:'I’m interested in a website that explains my work clearly and helps prospective clients enquire.'
 },
 'side-note': {
  name:'Side Note', category:'Coffee brand & e-commerce · Self-initiated concept', title:'Find a coffee that fits the morning you already have.',
  intro:'People cannot taste coffee through a screen. The useful question is not just what a bag tastes like, but whether it suits their equipment and everyday habits.',
  image:'assets/side-note-coffees.webp', alt:'Three concept Side Note coffee packs: Daybreak, Slow Morning and Offbeat', art:'coffee',
  question:'How do you make a specialist product feel approachable without taking away its character?',
  decisions:[['Start with the familiar ritual.','Warm colour, printed-paper artwork and handwritten details build a friendly identity. Product differences are described in everyday terms.'],['Translate preferences into a choice.','A three-question finder uses equipment, milk and taste preferences to explain its recommendation. It passes the suggested grind into product configuration.'],['Make the order understandable.','Size, grind and one-time or repeat purchase are explicit. The bag separates today’s total from any future recurring total before the demo order preview.']],
  boundary:'A fictional shop with a rules-based finder and working cart demo. No payment, real order or subscription is created, and checkout information is not sent to a server. The recommendation has not been validated as a taste-matching system.',
  url:'side-note/', link:'Open the shop', prompt:'I’m interested in a distinctive online shop that helps customers find the right product and understand their order.'
 }
};
const caseDialog=document.getElementById('case-dialog');
const aboutDialog=document.getElementById('about-dialog');
let returnFocus=null;
function openCase(key,trigger){
 const p=projects[key];if(!p)return;
 returnFocus=trigger||document.activeElement;
 const cover=p.art==='room'?`<div class="room-comparison" id="room-comparison"><img src="assets/room-before.webp" alt="The original room with bulky brown furniture, before the concept redesign" width="1536" height="1024" aria-hidden="true"><img class="room-proposed" id="case-image" src="${p.image}" alt="${p.alt}" width="1536" height="1024"></div><button class="case-room-toggle" id="room-preview-toggle" aria-pressed="false">See the original room</button>`:`<img id="case-image" src="${p.image}" alt="${p.alt}" ${p.art==='coffee'?'width="2170" height="725"':'width="1536" height="1024"'}>`;
 const decisionMarkup=p.decisions.map(([title,body])=>`<li><h4>${title}</h4><p>${body}</p></li>`).join('');
 document.getElementById('case-body').innerHTML=`<article class="case-content"><header class="case-heading"><p>${p.category}</p><h2 id="case-title">${p.title}</h2><p class="case-intro">${p.intro}</p></header><figure class="case-cover" data-art="${p.art}">${cover}</figure><div class="case-copy"><h3>The question</h3><p>${p.question}</p><h3>How the website responds</h3><ul class="decisions">${decisionMarkup}</ul><p class="case-boundary">${p.boundary}</p><div class="case-actions"><a href="${p.url}" target="_blank" rel="noopener">${p.link}</a><button id="similar-project">Discuss a project like this</button></div></div></article>`;
 caseDialog.showModal();caseDialog.scrollTop=0;
 document.getElementById('similar-project').addEventListener('click',()=>{
  closeDialog(caseDialog,false);document.getElementById('contact-details').open=true;result.hidden=true;form.hidden=false;if(!form.elements.kind.value)form.elements.kind.value=key==='side-note'?'An online shop':'A brand website';document.getElementById('contact').scrollIntoView({behavior:motionPreference.matches?'auto':'smooth'});
  const idea=form.elements.idea;if(!idea.value)idea.value=p.prompt;idea.focus({preventScroll:true});
 });
 const toggle=document.getElementById('room-preview-toggle');
 if(toggle){let original=false;const comparison=document.getElementById('room-comparison');const [before,after]=comparison.querySelectorAll('img');toggle.addEventListener('click',()=>{original=!original;comparison.classList.toggle('is-original',original);before.setAttribute('aria-hidden',String(!original));after.setAttribute('aria-hidden',String(original));toggle.textContent=original?'See the proposed room':'See the original room';toggle.setAttribute('aria-pressed',String(original));});}
}
function closeDialog(dialog,restore=true){dialog.close();if(restore&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
for(const button of document.querySelectorAll('[data-case]'))button.addEventListener('click',()=>openCase(button.dataset.case,button));
for(const dialog of [caseDialog,aboutDialog]){
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
 draft.value=`Hi Ayush,\n\nI’m ${name}. I’m thinking about ${kind.toLowerCase()}.\n\n${idea}${budget?'\n\nBudget: '+budget:''}${timing?'\nTiming: '+timing:''}\n\nI’d love to discuss whether this would be a good fit.\n\n${name}`;
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
 const tool={name:'prepare_project_enquiry',title:'Prepare a project enquiry',description:'Prepare an editable email draft to Ayush in this page. Does not open an email app or send a message.',inputSchema:{type:'object',properties:{kind:{type:'string',enum:['A brand website','An online shop','A web app','Still figuring it out']},name:{type:'string',minLength:1,maxLength:80},idea:{type:'string',minLength:10,maxLength:1800},budget:{type:'string',maxLength:100},timing:{type:'string',maxLength:100}},required:['kind','name','idea'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute(input){
  const kinds=['A brand website','An online shop','A web app','Still figuring it out'];
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['kind','name','idea','budget','timing'].includes(k))||!kinds.includes(input.kind))throw new Error('Choose a valid project type.');
  for(const [key,min,max] of [['name',1,80],['idea',10,1800],['budget',0,100],['timing',0,100]]){const v=input[key];if(v===undefined&&min===0)continue;if(typeof v!=='string'||v.trim().length<min||v.length>max)throw new Error('Invalid '+key+'.');}
  for(const key of ['kind','name','idea','budget','timing'])form.elements[key].value=input[key]||'';
  form.elements.name.setCustomValidity('');form.elements.idea.setCustomValidity('');
  return createDraft();
 }};
 try{Promise.resolve(modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
