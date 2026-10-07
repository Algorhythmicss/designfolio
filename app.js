'use strict';
const emailAddress = 'ayushhhudd@gmail.com';
const offerNames=Object.freeze({
 'first-impression':'Free first-impression video',
 'product-review':'3-Day Launch-Ready Check',
 'product-upgrade':'14-Day Launch-Ready Sprint',
 'monthly-partner':'Ship Every Week',
 'first-product':'Idea to Launch in 6 Weeks',
 'website-week':'7-Day Website',
 'launch-grow':'Launch & Grow',
 'lockdown-week':'Lockdown Week',
 'look-week':'Look Week',
 'quarterly-checkin':'Quarterly Check-in'
});
const enquiryKinds=[...Object.values(offerNames),'Still figuring it out'];
const extraOfferChoices={'first-impression':'choice-first-impression','first-product':'first-product-choice','launch-grow':'choice-launch-grow','lockdown-week':'choice-lockdown-week','look-week':'choice-look-week','quarterly-checkin':'choice-quarterly-checkin'};
const websiteAudiences=Object.freeze({clinic:'7-Day Clinic Website',studio:'7-Day Studio Website',cafe:'7-Day Café Website'});
const businessOptions=Object.freeze({users:['No users yet','Has users','Prefer to discuss'],revenue:['Pre-revenue','Revenue-generating','Prefer to discuss'],funding:['Bootstrapped','Funded','Prefer to discuss']});
const businessLabels={users:'Users',revenue:'Revenue',funding:'Funding'};
function revealOfferChoice(kind){for(const [id,elementId] of Object.entries(extraOfferChoices)){if(offerNames[id]===kind){const choice=document.getElementById(elementId);if(choice)choice.hidden=false;}}}
function businessContext(fields){return Object.entries(businessOptions).filter(([key,values])=>values.includes(fields.get(key))).map(([key])=>`${businessLabels[key]}: ${fields.get(key)}`).join('\n');}
function projectUrl(value){try{const url=new URL(String(value||'').trim());return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password&&url.hostname?url.href:'';}catch{return '';}}
function callbackPhoneNumber(value){
 if(typeof value!=='string'||value.length>40)return '';
 const number=value.trim().replace(/[\s()-]/g,'');
 return /^\+[1-9]\d{7,14}$/.test(number)?number:'';
}

const enquiryBudgets=['₹20,000–₹60,000 / $500–$2,500','₹60,000–₹3,00,000 / $2,500–$6,000','₹3,00,000+ / $6,000+','Not sure yet'];
const contactConfig=window.AYUSH_CONTACT||{};
function formspreeUrl(value){try{const url=new URL(String(value||''));return url.protocol==='https:'&&url.hostname==='formspree.io'&&!url.port&&!url.username&&!url.password&&!url.search&&!url.hash&&/^\/f\/[a-z0-9]+\/?$/i.test(url.pathname)?url.href:'';}catch{return '';}}
function bookingUrl(value){try{const url=new URL(String(value||''));const googleBooking=url.hostname==='calendar.app.google'&&url.pathname.length>1||url.hostname==='calendar.google.com'&&/^\/calendar\/(?:u\/\d+\/)?appointments\/schedules\/.+/.test(url.pathname);return url.protocol==='https:'&&!url.port&&!url.username&&!url.password&&googleBooking?url.href:'';}catch{return '';}}
const formspreeEndpoint=formspreeUrl(contactConfig.formspreeEndpoint);
const whatsappNumber=String(contactConfig.whatsappNumber||'').replace(/[\s()+-]/g,'');
const callBookingUrl=bookingUrl(contactConfig.bookingUrl);
const contactOptions=document.getElementById('contact-options'),whatsappLink=document.getElementById('contact-whatsapp'),bookingLink=document.getElementById('contact-booking');
if(whatsappLink&&/^[1-9]\d{7,14}$/.test(whatsappNumber)){whatsappLink.href=`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Ayush, I’d like to talk about a project.')}`;whatsappLink.hidden=false;}
if(bookingLink){bookingLink.href=callBookingUrl||`mailto:${emailAddress}?subject=${encodeURIComponent('A Google Meet about my project')}`;bookingLink.textContent=callBookingUrl?'Book a Google Meet':'Arrange a Google Meet';bookingLink.hidden=false;if(callBookingUrl){bookingLink.target='_blank';bookingLink.rel='noopener noreferrer';}else bookingLink.removeAttribute('target');}
const enquiryBooking=document.getElementById('enquiry-booking');
if(enquiryBooking&&callBookingUrl){enquiryBooking.href=callBookingUrl;enquiryBooking.textContent='Book a Google Meet ↗';enquiryBooking.target='_blank';enquiryBooking.rel='noopener noreferrer';}
if(contactOptions)contactOptions.hidden=!(whatsappLink&&!whatsappLink.hidden||bookingLink&&!bookingLink.hidden);
const aboutDialog=document.getElementById('about-dialog');
let returnFocus=null;
function closeDialog(dialog,restore=true){dialog.close();if(restore&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
for(const dialog of [aboutDialog].filter(Boolean)){
 dialog.querySelector('[data-close]').addEventListener('click',()=>closeDialog(dialog));
 dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog);});
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog(dialog);});
}
document.getElementById('about-work')?.addEventListener('click',event=>{returnFocus=event.currentTarget;aboutDialog.showModal();});
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
function initialiseEnquiry(){
const form=document.getElementById('enquiry-form'),result=document.getElementById('enquiry-result'),draft=document.getElementById('email-draft'),openEmail=document.getElementById('open-email'),status=document.getElementById('draft-status');
if(!form||!result||!draft||!openEmail||!status){
 // Old shared links retain only the safe offer context, never arbitrary data.
 const entry=document.getElementById('contact-enquiry-link');
 if(entry&&window.location){
  const params=new URL(window.location.href).searchParams,offer=params.get('offer');
  if(Object.hasOwn(offerNames,offer)||offer==='conversation'){
   const target=new URL('contact/',window.location.href);target.searchParams.set('offer',offer);
   if(params.get('guided')==='1')target.searchParams.set('guided','1');
   const audience=params.get('audience');
   if(offer==='website-week'&&Object.hasOwn(websiteAudiences,audience))target.searchParams.set('audience',audience);
   window.location.replace(target.href);
  }
 }
 return;
}
const standalone=form.getAttribute?.('data-standalone')==='true';
let guidedEnquiry=standalone;
const callbackControl=form.elements.callbackRequested;
const callbackKeys=['callbackPhone','callbackDate','callbackHour','callbackMinute'];
const callbackErrors={callbackPhone:'enquiry-callback-phone-error',callbackDate:'enquiry-callback-date-error',callbackHour:'enquiry-callback-hour-error',callbackMinute:'enquiry-callback-minute-error'};
function updateCallbackContext(){
 if(!callbackControl)return;
 const requested=callbackControl.checked===true,fields=document.getElementById('enquiry-callback-fields');
 if(fields){fields.hidden=!requested;fields.disabled=!requested;}
 for(const key of callbackKeys){const field=form.elements[key];if(field){field.required=requested;field.disabled=!requested;if(!requested)clearFieldError(key);}}
 if(form.elements.callbackDate&&typeof meetTodayIST==='function')form.elements.callbackDate.min=meetTodayIST();
}
function currentCallback(){
 if(!callbackControl?.checked)return {requested:false,errors:{},message:''};
 const phone=callbackPhoneNumber(form.elements.callbackPhone.value),date=form.elements.callbackDate.value;
 const hour=form.elements.callbackHour.value,minute=form.elements.callbackMinute.value;
 const time=typeof assembleMeetTime==='function'?assembleMeetTime(hour,minute):'';
 const slot=typeof validateMeetRequest==='function'?validateMeetRequest(date,time):{ok:false,field:'time',message:'Please use email to arrange a phone call.'};
 const errors={};
 if(!phone)errors.callbackPhone='Include a country code, such as +91 98765 43210.';
 if(!slot.ok){
  if(slot.field==='date')errors.callbackDate=slot.message;
  else if(!time){
   const hourValid=typeof assembleMeetTime==='function'&&assembleMeetTime(hour,'00');
   errors[hourValid?'callbackMinute':'callbackHour']=hourValid?'Choose the minutes for your request.':'Choose an hour from 5pm onwards (IST).';
  }else errors.callbackHour=slot.message;
 }
 if(Object.keys(errors).length)return {requested:true,errors,message:''};
 const displayDate=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',day:'numeric',month:'long',year:'numeric'}).format(new Date(slot.instant));
 const displayTime=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(slot.instant));
 return {requested:true,errors:{},message:`Phone call request: Please call me on ${phone} on ${displayDate} at ${displayTime} IST (UTC+5:30).\nPlease confirm by email before calling. I understand this is a request, not a reserved time.`};
}

function updateOfferContext(){
 const free=form.elements.kind.value===offerNames['first-impression'];
 form.elements.homepage.required=free;form.elements.idea.required=!free;
 const note=document.getElementById('enquiry-homepage-note');if(note)note.textContent=free?(standalone?'(required)':'(required for the video)'):'(optional)';
 const freeNote=document.getElementById('first-impression-note');if(freeNote)freeNote.hidden=!free;
 const audienceNote=document.getElementById('enquiry-audience');if(audienceNote)audienceNote.hidden=!(form.elements.kind.value===offerNames['website-week']&&Object.hasOwn(websiteAudiences,form.elements.audience.value));
 if(guidedEnquiry)for(const radio of form.querySelectorAll('input[name="kind"]'))radio.closest('label').hidden=radio.value!==form.elements.kind.value;
 form.elements.idea.setCustomValidity('');form.elements.homepage.setCustomValidity('');
 if(standalone){
  const selected=document.getElementById('selected-offer-name'),guide=document.getElementById('enquiry-guide-link');
  const unsure=form.elements.kind.value==='Still figuring it out';
  if(selected)selected.textContent=unsure?'A first conversation':form.elements.kind.value;
  if(guide)guide.textContent=unsure?'Find a scope ↗':'Change ↗';
  const title=document.getElementById('enquiry-title'),introCopy=document.getElementById('enquiry-intro-copy');
  if(title)title.textContent=free?'Get a first impression.':'Start a project.';
  if(introCopy)introCopy.textContent=free?'Your name and a public product link. I’ll confirm availability for the free video.':'Tell me what you’d like to make or improve. A few lines are enough.';
  const primary=document.getElementById('enquiry-primary-fields'),extra=document.getElementById('enquiry-extra-fields');
  const ideaField=document.getElementById('enquiry-idea-field'),urlField=document.getElementById('enquiry-homepage-field');
  if(primary&&extra&&ideaField&&urlField){extra.prepend(free?ideaField:urlField);primary.append(free?urlField:ideaField);}
  const ideaNote=document.getElementById('enquiry-idea-note');if(ideaNote)ideaNote.hidden=!free;
  const ideaLabel=ideaField?.querySelector?.('.field-title');if(ideaLabel?.firstChild?.nodeType===3)ideaLabel.firstChild.textContent=free?'Anything you’d like me to look at? ':'What would you like to make or improve? ';
  const budgetTiming=document.getElementById('enquiry-budget-timing');if(budgetTiming)budgetTiming.hidden=free;
  const business=document.getElementById('enquiry-business');
  if(business)business.hidden=free||unsure||[offerNames['website-week'],offerNames['first-product']].includes(form.elements.kind.value);
 }
}
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
 const contactDetails=document.getElementById('contact-details');if(contactDetails)contactDetails.open=true;
 const fields=new FormData(form),name=String(fields.get('name')||'').trim(),kind=String(fields.get('kind')||''),idea=String(fields.get('idea')||'').trim(),budget=String(fields.get('budget')||'').trim(),timing=String(fields.get('timing')||'').trim(),homepage=projectUrl(fields.get('homepage'));
 subject=`${kind} — enquiry from ${name}`;
 const thinking=kind==='Still figuring it out'?'I’m still figuring out exactly what I need.':`I’m interested in your ${kind}.`;
 revealOfferChoice(kind);
 const business=businessContext(fields),audience=kind===offerNames['website-week']&&Object.hasOwn(websiteAudiences,fields.get('audience'))?websiteAudiences[fields.get('audience')]:'';
 const callback=currentCallback();if(Object.keys(callback.errors).length)throw new Error('Check the phone call request before preparing this draft.');
 draft.value=`Hi Ayush,\n\nI’m ${name}. ${thinking}${audience?'\nWebsite package: '+audience:''}${homepage?'\nProduct or website: '+homepage:''}${idea?'\n\n'+idea:''}${business?'\n\n'+business:''}${budget?'\n\nBudget: '+budget:''}${timing?'\nTiming: '+timing:''}${callback.message?'\n\n'+callback.message:''}\n\nI’d love to discuss whether this would be a good fit.\n\n${name}`;
 updateEmailLink();form.hidden=true;result.hidden=false;
 const intro=document.getElementById('enquiry-intro');if(standalone&&intro)intro.hidden=true;
 result.querySelector('h3').focus({preventScroll:true});result.scrollIntoView({behavior:motionPreference.matches?'auto':'smooth',block:'start'});
 return {recipient:emailAddress,subject,message:draft.value,sent:false};
}
function clearFieldError(key){
 const field=form.elements[key];field.setCustomValidity('');field.removeAttribute('aria-invalid');
 const note=document.getElementById(callbackErrors[key]||`enquiry-${key}-error`);if(note){note.hidden=true;note.textContent='';}
 const summary=document.getElementById('enquiry-error-summary');if(summary)summary.hidden=true;
}
form.addEventListener('submit',event=>{
 event.preventDefault();
 const free=form.elements.kind.value===offerNames['first-impression'],idea=form.elements.idea.value.trim();
 let homepage=form.elements.homepage.value.trim();
 // Let people paste an ordinary domain. Explicit schemes still go through the
 // same http/https and credential-free URL validation as the reviewed draft.
 if(standalone&&homepage&&!/^[a-z][a-z\d+.-]*:/i.test(homepage)&&/^[^\s/?#]+\.[^\s]+/.test(homepage)){
  const complete=projectUrl('https://'+homepage);if(complete){homepage=complete;form.elements.homepage.value=complete;}
 }
 updateCallbackContext();
 const callback=currentCallback();
 const errors={name:form.elements.name.value.trim()?'':'Please enter your name.',idea:(free&&!idea)||idea.length>=10?'':'A sentence about what you’d like to make or improve is enough.',homepage:(!homepage&&!free)||projectUrl(homepage)?'':'Add a public website link, such as example.com.'};
 if(callbackControl)for(const key of callbackKeys)errors[key]=callback.errors[key]||'';
 const invalid=[];
 for(const [key,message] of Object.entries(errors)){
  clearFieldError(key);const field=form.elements[key];field.setCustomValidity(message);
  if(message){invalid.push(field);if(standalone){field.setAttribute('aria-invalid','true');const note=document.getElementById(callbackErrors[key]||`enquiry-${key}-error`);if(note){note.textContent=message;note.hidden=false;}}}
 }
 if(standalone&&invalid.length){
  for(const field of invalid){const details=field.closest('details');if(details)details.open=true;}
  const summary=document.getElementById('enquiry-error-summary');if(summary){summary.textContent='Check the highlighted fields below. Your details are still here.';summary.hidden=false;}
  invalid[0].focus({preventScroll:true});invalid[0].scrollIntoView({block:'center',behavior:'instant'});return;
 }
 if(form.reportValidity())createDraft();
});
// The HTML button stays disabled until the submit interception above is registered.
form.querySelector('[type="submit"]').disabled=false;
// A pricing-page choice opens the enquiry, never prepares or sends it automatically.
const requestedOffer=window.location?new URL(window.location.href).searchParams.get('offer'):null;
const requestedKind=Object.hasOwn(offerNames,requestedOffer)?offerNames[requestedOffer]:requestedOffer==='conversation'?'Still figuring it out':null;
if(requestedKind){
 const kind=requestedKind;
 revealOfferChoice(kind);
 form.elements.kind.value=kind;document.getElementById('contact-details').open=true;
 const audience=new URL(window.location.href).searchParams.get('audience');
 if(kind===offerNames['website-week']&&Object.hasOwn(websiteAudiences,audience)){form.elements.audience.value=audience;const note=document.getElementById('enquiry-audience');if(note){note.textContent=websiteAudiences[audience];note.hidden=false;}}
 // A guided visitor has already chosen a relevant scope; do not ask them to
 // scan the entire service menu again. They can return to the guide to change it.
 if(new URL(window.location.href).searchParams.get('guided')==='1'){
  guidedEnquiry=true;
  const title=document.getElementById('enquiry-offer-title');if(title)title.textContent='Your starting point';
  const note=document.getElementById('enquiry-guide-note');if(note&&!standalone)note.hidden=false;
 }

 // Initial #contact scrolling otherwise wins after deferred scripts and leaves the form below the artwork.
 if(!standalone){
  const focusOffer=()=>{form.scrollIntoView({behavior:'instant',block:'start'});form.elements.name.focus({preventScroll:true});};
  if(document.readyState==='complete')focusOffer();else window.addEventListener('load',focusOffer,{once:true});
 }
}

updateOfferContext();form.addEventListener('change',updateOfferContext);
updateCallbackContext();
callbackControl?.addEventListener('change',updateCallbackContext);
for(const key of callbackKeys)if(form.elements[key])for(const event of ['input','change'])form.elements[key].addEventListener(event,()=>clearFieldError(key));
for(const key of ['name','idea','homepage'])form.elements[key].addEventListener('input',()=>clearFieldError(key));
draft.addEventListener('input',()=>{if(lastAcceptedDraft&&lastAcceptedDraft===draft.value){sendState='accepted';sendEnquiry.disabled=true;sendEnquiry.textContent='Enquiry accepted';sendStatus.textContent='This draft was already accepted. A copy is kept here.';}else if(sendState==='accepted'){sendState='idle';sendEnquiry.disabled=false;sendEnquiry.textContent='Send enquiry';sendStatus.textContent='You changed the draft. This version has not been sent.';}updateEmailLink();});
openEmail.addEventListener('click',()=>{status.textContent='Your email app can open this draft. Review it and press Send there; this page cannot confirm delivery.';});
editBrief.addEventListener('click',()=>{if(sendState==='sending')return;result.hidden=true;form.hidden=false;const intro=document.getElementById('enquiry-intro');if(standalone&&intro)intro.hidden=false;form.elements.name.focus({preventScroll:true});form.scrollIntoView({behavior:motionPreference.matches?'auto':'smooth'});});
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
 const budgets=enquiryBudgets;
 const tool={name:'prepare_project_enquiry',title:'Prepare a project enquiry',description:'Prepare an editable email draft to Ayush in this page. A free first-impression video requires a homepage URL; paid offers require a project description. A phone call request requires explicit callbackRequested:true, a country-code number, and a future date/time after 5pm IST. Does not open an email app, send a message, call anyone or reserve a time.',inputSchema:{type:'object',properties:{kind:{type:'string',enum:enquiryKinds},name:{type:'string',minLength:1,maxLength:80},idea:{type:'string',minLength:10,maxLength:1800},homepage:{type:'string',maxLength:1000},budget:{type:'string',enum:budgets},timing:{type:'string',maxLength:100},users:{type:'string',enum:businessOptions.users},revenue:{type:'string',enum:businessOptions.revenue},funding:{type:'string',enum:businessOptions.funding},audience:{type:'string',enum:Object.keys(websiteAudiences)},callbackRequested:{type:'boolean'},callbackPhone:{type:'string',maxLength:40},callbackDate:{type:'string',pattern:'^\\d{4}-\\d{2}-\\d{2}$'},callbackTime:{type:'string',pattern:'^\\d{2}:\\d{2}$'}},required:['kind','name'],additionalProperties:false,allOf:[{if:{properties:{callbackRequested:{const:true}},required:['callbackRequested']},then:{required:['callbackPhone','callbackDate','callbackTime']}}]},annotations:{readOnlyHint:false,untrustedContentHint:true},execute(input){
  // Reject before touching the saved form while its reviewed snapshot is sending.
  if(sendState==='sending')throw new Error('Please wait for the current enquiry submission before preparing another draft.');
  const kinds=enquiryKinds;
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['kind','name','idea','homepage','budget','timing','users','revenue','funding','audience','callbackRequested','callbackPhone','callbackDate','callbackTime'].includes(k))||!kinds.includes(input.kind))throw new Error('Choose a valid project type.');
  if(input.budget!==undefined&&!budgets.includes(input.budget))throw new Error('Choose a valid budget range.');
  for(const [key,values] of Object.entries(businessOptions))if(input[key]!==undefined&&!values.includes(input[key]))throw new Error('Choose a valid '+key+' answer.');
  if(input.audience!==undefined&&(input.kind!==offerNames['website-week']||!Object.hasOwn(websiteAudiences,input.audience)))throw new Error('Choose a valid website audience.');
  const free=input.kind===offerNames['first-impression'];
  if(input.homepage!==undefined&&(typeof input.homepage!=='string'||input.homepage.length>1000||input.homepage.trim()&&!projectUrl(input.homepage)))throw new Error('Add a complete http or https homepage URL.');
  if(free&&!projectUrl(input.homepage))throw new Error('A first-impression video needs a homepage URL.');
  for(const [key,min,max] of [['name',1,80],['idea',10,1800],['timing',0,100]]){const v=input[key];if(v===undefined&&(min===0||key==='idea'&&free))continue;if(typeof v!=='string'||v.trim().length<min||v.length>max)throw new Error('Invalid '+key+'.');}
  if(input.callbackRequested!==undefined&&typeof input.callbackRequested!=='boolean')throw new Error('Choose whether to request a phone call.');
  if(input.callbackRequested!==true&&['callbackPhone','callbackDate','callbackTime'].some(key=>input[key]!==undefined))throw new Error('A phone call needs an explicit callback request.');
  let callbackPhone='',callbackTime='';
  if(input.callbackRequested===true){
   if(!callbackControl||typeof assembleMeetTime!=='function'||typeof validateMeetRequest!=='function')throw new Error('Please use the contact page to request a phone call.');
   callbackPhone=callbackPhoneNumber(input.callbackPhone);
   if(!callbackPhone)throw new Error('Include a valid phone number with country code.');
   if(typeof input.callbackTime!=='string'||!/^\d{2}:\d{2}$/.test(input.callbackTime))throw new Error('Choose a valid time in IST.');
   callbackTime=assembleMeetTime(...input.callbackTime.split(':'));
   const slot=validateMeetRequest(input.callbackDate,callbackTime);
   if(!slot.ok)throw new Error(slot.message);
  }
  for(const key of ['kind','name','idea','homepage','budget','timing','users','revenue','funding','audience']){const el=form.elements[key];if(el instanceof RadioNodeList&&!input[key])el.forEach(r=>{r.checked=false;});else el.value=input[key]||'';}
  if(callbackControl){
   callbackControl.checked=input.callbackRequested===true;
   const timeParts=callbackTime.split(':');
   for(const [key,value] of Object.entries({callbackPhone,callbackDate:callbackControl.checked?input.callbackDate:'',callbackHour:timeParts[0]||'',callbackMinute:timeParts[1]||''})){form.elements[key].value=value;clearFieldError(key);}
   const disclosure=document.getElementById('enquiry-callback');if(disclosure&&callbackControl.checked)disclosure.open=true;
   updateCallbackContext();
  }
  updateOfferContext();
  form.elements.name.setCustomValidity('');form.elements.idea.setCustomValidity('');
  return createDraft();
 }};
 try{Promise.resolve(modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}

}
initialiseEnquiry();
