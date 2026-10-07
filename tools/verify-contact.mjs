// Network-free boundary checks for the reviewed-draft contact flow.
// Run with: node tools/verify-contact.mjs
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('../app.js',import.meta.url),'utf8');
const callSource=await readFile(new URL('../call-request.js',import.meta.url),'utf8');
const html=await readFile(new URL('../contact/index.html',import.meta.url),'utf8');
const rootHTML=await readFile(new URL('../index.html',import.meta.url),'utf8');
let checks=0;
function check(condition,message){assert.ok(condition,message);checks++;}
const offerLabels=Object.freeze({'first-impression':'Free first-impression video','product-review':'3-Day Launch-Ready Check','product-upgrade':'14-Day Launch-Ready Sprint','monthly-partner':'Ship Every Week','first-product':'Idea to Launch in 6 Weeks','website-week':'7-Day Website','launch-grow':'Launch & Grow','lockdown-week':'Lockdown Week','look-week':'Look Week','quarterly-checkin':'Quarterly Check-in'});
const extraLabelIds=Object.freeze({'Free first-impression video':'choice-first-impression','Idea to Launch in 6 Weeks':'first-product-choice','Launch & Grow':'choice-launch-grow','Lockdown Week':'choice-lockdown-week','Look Week':'choice-look-week','Quarterly Check-in':'choice-quarterly-checkin'});
class Element{
 constructor(value=''){this.value=value;this.checked=false;this.hidden=false;this.disabled=false;this.textContent='';this.attributes={};this.listeners={};this.validity='';this.isConnected=true;this.childNodes=[];this.focuses=[];}
 addEventListener(name,listener){(this.listeners[name]??=[]).push(listener);}
 async dispatch(name){const event={target:this,currentTarget:this,preventDefault(){this.prevented=true;}};await Promise.all((this.listeners[name]||[]).map(listener=>listener(event)));return event;}
 setAttribute(name,value){this.attributes[name]=value;}
 getAttribute(name){return this.attributes[name]??null;}
 removeAttribute(name){delete this.attributes[name];if(name==='target')this.target='';}
 setCustomValidity(message){this.validity=message;}
 reportValidity(){return this.disabled||!this.validity&&(!this.emailField||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value));}
 focus(options){this.focuses.push(options);} select(){} scrollIntoView(options){this.lastScroll=options;} close(){} showModal(){}
 getBoundingClientRect(){return {left:0,right:100,top:0,bottom:100};}
 querySelector(selector){return this.children?.[selector]??null;}
 closest(selector){if(selector==='label')return this.parentLabel||null;let node=this.parentElement;while(node){if(selector==='details'&&node.tagName==='DETAILS')return node;node=node.parentElement;}return null;}
 appendChild(node){if(node.parentElement){const index=node.parentElement.childNodes.indexOf(node);if(index>=0)node.parentElement.childNodes.splice(index,1);}this.childNodes.push(node);node.parentElement=this;return node;}
 append(...nodes){for(const node of nodes)this.appendChild(node);}
 prepend(...nodes){for(const node of [...nodes].reverse()){this.appendChild(node);this.childNodes.pop();this.childNodes.unshift(node);}}
}
class Fields{
 constructor(form){this.values=new Map(form?Object.entries(form.elements).filter(([,input])=>!input.disabled&&(input.type!=='checkbox'||input.checked)).map(([name,input])=>[name,input.value]):[]);}
 get(name){return this.values.get(name);}
 append(name,value){this.values.set(name,value);}
}
function harness(config={},handler=async()=>({ok:true,status:200}),pageURL='',options={}){
 const ids=['contact-options','contact-whatsapp','contact-booking','about-dialog','about-work','enquiry-form','enquiry-result','email-draft','open-email','draft-status','contact-details','edit-brief','copy-brief','direct-enquiry','reply-email','send-enquiry','send-status','prepare-note','contact-disclosure','first-product-choice','choice-launch-grow','choice-lockdown-week','choice-look-week','choice-quarterly-checkin','enquiry-audience','choice-first-impression','enquiry-homepage-note','first-impression-note','enquiry-offer-title','enquiry-guide-note','contact-enquiry-link','selected-offer-name','enquiry-guide-link','enquiry-primary-fields','enquiry-extra-fields','enquiry-name-field','enquiry-idea-field','enquiry-homepage-field','enquiry-extra','enquiry-idea-note','enquiry-business','enquiry-intro','enquiry-error-summary','enquiry-name-error','enquiry-idea-error','enquiry-homepage-error','enquiry-title','enquiry-intro-copy','enquiry-budget-timing'];
 ids.push('enquiry-callback','enquiry-callback-fields','enquiry-callback-phone-error','enquiry-callback-date-error','enquiry-callback-hour-error','enquiry-callback-minute-error','enquiry-booking');
 const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
 for(const id of ['first-product-choice','choice-launch-grow','choice-lockdown-week','choice-look-week','choice-quarterly-checkin','enquiry-audience','choice-first-impression','first-impression-note'])elements[id].hidden=true;elements['contact-whatsapp'].hidden=true;elements['direct-enquiry'].hidden=true;elements['send-enquiry'].disabled=true;elements['enquiry-result'].hidden=true;
 elements['about-dialog'].children={'[data-close]':new Element()};
 elements['enquiry-result'].children={'h3':new Element()};
 const prepareButton=new Element();prepareButton.disabled=true;
 const form=elements['enquiry-form'];form.children={'[type="submit"]':prepareButton};
 form.elements=Object.fromEntries(Object.entries({name:options.standalone?'':'Sample Visitor',kind:options.standalone?'Still figuring it out':'7-Day Website',idea:options.standalone?'':'A clear website for my small business.',budget:options.standalone?'':'Not sure yet',timing:options.standalone?'':'Just exploring',users:'',revenue:'',funding:'',audience:'',homepage:'',callbackRequested:'yes',callbackPhone:'',callbackDate:'',callbackHour:'',callbackMinute:''}).map(([name,value])=>[name,new Element(value)]));
 form.elements.callbackRequested.type='checkbox';
 if(options.standalone)form.setAttribute('data-standalone','true');
 const kindRadios=[...Object.values(offerLabels),'Still figuring it out'].map(value=>{const radio=new Element(value);radio.parentLabel=extraLabelIds[value]?elements[extraLabelIds[value]]:new Element();return radio;});
 form.querySelectorAll=selector=>selector==='input[name="kind"]'?kindRadios:[];
 elements['enquiry-offer-title'].textContent='Which offer fits what you need?';elements['enquiry-guide-note'].hidden=true;
 const primary=elements['enquiry-primary-fields'],extra=elements['enquiry-extra-fields'];elements['enquiry-extra'].tagName='DETAILS';elements['enquiry-extra'].open=false;elements['enquiry-extra'].append(extra);
 for(const key of ['name','idea','homepage']){const label=elements[`enquiry-${key}-field`];label.append(form.elements[key]);form.elements[key].parentLabel=label;elements[`enquiry-${key}-error`].hidden=true;}
 primary.append(elements['enquiry-name-field'],elements['enquiry-idea-field']);extra.append(elements['enquiry-homepage-field']);
 const ideaTitle=new Element();ideaTitle.firstChild={nodeType:3,textContent:'What would you like to make or improve? '};elements['enquiry-idea-field'].children={'.field-title':ideaTitle};
 extra.append(elements['enquiry-budget-timing']);
 const callback=elements['enquiry-callback'];callback.tagName='DETAILS';callback.open=false;callback.append(elements['enquiry-callback-fields']);elements['enquiry-callback-fields'].hidden=true;
 for(const key of ['callbackPhone','callbackDate','callbackHour','callbackMinute'])elements['enquiry-callback-fields'].append(form.elements[key]);
 for(const key of ['phone','date','hour','minute'])elements[`enquiry-callback-${key}-error`].hidden=true;
 elements['enquiry-error-summary'].hidden=true;elements['enquiry-idea-note'].hidden=true;
 form.reportValidity=()=>Object.values(form.elements).every(input=>input.reportValidity());
 elements['reply-email'].value='visitor@example.com';elements['reply-email'].emailField=true;
 elements['enquiry-booking'].href='../#contact';elements['enquiry-booking'].textContent='Prefer a Google Meet? ↗';
 elements['direct-enquiry'].reportValidity=()=>elements['reply-email'].reportValidity();
 if(options.noAbout){delete elements['about-dialog'];delete elements['about-work'];}
 if(options.noForm)for(const id of ids.filter(id=>!['contact-options','contact-whatsapp','contact-booking','about-dialog','about-work','contact-enquiry-link'].includes(id)))delete elements[id];
 const calls=[],copied=[],redirects=[],timers=new Map();let nextTimer=0;
 const registeredTools=[];
 const document={getElementById:id=>elements[id],readyState:options.readyState||'interactive',modelContext:{registerTool:tool=>{registeredTools.push(tool);}}},windowListeners={};
 const window={location:pageURL?{href:pageURL,replace:url=>redirects.push(String(url))}:undefined,AYUSH_CONTACT:config,matchMedia:()=>({matches:false}),addEventListener:(name,handler)=>{(windowListeners[name]??=[]).push(handler);},setTimeout:callback=>{const id=++nextTimer;timers.set(id,callback);return id;},clearTimeout:id=>timers.delete(id)};
 const context=vm.createContext({document,window,URL,URLSearchParams,FormData:Fields,AbortController,RadioNodeList:class{},navigator:{clipboard:{writeText:async message=>copied.push(message)}},fetch:async(url,options)=>{calls.push({url,options});return handler(url,options);}});
 vm.runInContext(callSource,context);
 vm.runInContext(options.appSource||source,context);
 return {elements,kindRadios,prepareButton,calls,copied,redirects,timers,registeredTools,load:()=>{for(const handler of windowListeners.load||[])handler();},prepare:()=>form.dispatch('submit'),send:()=>elements['direct-enquiry'].dispatch('submit')};
}

check(html.indexOf('contact-config.js')<html.indexOf('app.js'),'Config loads before the application.');
check(html.indexOf('call-request.js')<html.indexOf('app.js'),'Shared IST date/time validation loads before callback handling.');
const mainFormTag=html.match(/<form\b[^>]*id="enquiry-form"[^>]*>/)?.[0]||'',mainFormHTML=html.match(/<form\b[^>]*id="enquiry-form"[^>]*>[\s\S]*?<\/form>/)?.[0]||'';
check(/<button\b(?=[^>]*type="submit")(?=[^>]*\sdisabled(?:\s|>))[^>]*>/.test(mainFormHTML),'Main submit remains disabled without its handler.');
check(/id="send-enquiry" type="submit" disabled/.test(html),'Optional direct send stays disabled without its handler.');
check(/<noscript>[\s\S]*Email Ayush directly/.test(html),'Email fallback exists without JavaScript.');
check(JSON.stringify([...html.matchAll(/<input type="radio" name="kind" value="([^"]+)"/g)].map(match=>match[1].replace(/&amp;/g,'&')).sort())===JSON.stringify([...Object.values(offerLabels),'Still figuring it out'].sort()),'The harness radio labels match every real HTML offer and the honest unsure choice.');
check(/id="enquiry-guide-note"[^>]*hidden>[\s\S]*?<a href="\.\.\/pricing\/">Change it in the guide/.test(html),'Guided contact includes an initially hidden, usable route back to the guide.');
check(!rootHTML.includes('id="enquiry-form"'),'The portfolio does not retain a second, competing project form.');
check(/data-standalone="true"/.test(mainFormTag)&&/\snovalidate(?:\s|>)/.test(mainFormTag),'The standalone form owns explicit validation before draft preparation.');
check(/<h3\b(?=[^>]*tabindex="-1")(?=[^>]*aria-level="1")[^>]*>Review your message/.test(html),'The visible review heading is focusable and carries the primary heading level after the intro is hidden.');
check(/name="callbackRequested" type="checkbox"/.test(html)&&!/id="enquiry-callback-requested"[^>]*\schecked(?:\s|>)/.test(html),'A phone request requires an unchecked, explicit visitor choice.');
check(/id="enquiry-callback-fields" hidden disabled/.test(html),'Phone details are initially hidden and inactive.');
check(/name="callbackPhone" type="tel" inputmode="tel" autocomplete="tel"/.test(html),'The phone field supports the native phone keyboard and autocomplete.');
check(html.includes('I’ll confirm by email before calling; no time is reserved here.'),'The phone request is clearly a request confirmed by email rather than a booking.');
check(/before%205pm%20IST/.test(html),'An earlier-call request has a real email route.');

// Callback is optional, explicit, future in IST, and part of the reviewed draft only.
{
 const h=harness({},undefined,'https://algorhythmicss.github.io/designfolio/contact/',{standalone:true,noAbout:true}),fields=h.elements['enquiry-form'].elements;
 fields.name.value='New Visitor';fields.idea.value='I would like help designing my first product.';
 check(!fields.callbackRequested.checked&&h.elements['enquiry-callback-fields'].hidden&&fields.callbackPhone.disabled&&!fields.callbackPhone.required,'Blank phone preference adds no required fields or visible questionnaire.');
 await h.prepare();
 check(!h.elements['enquiry-result'].hidden&&!h.elements['email-draft'].value.includes('Phone call request:')&&h.calls.length===0,'A two-field enquiry works without requesting a callback or making a provider request.');
 await h.elements['edit-brief'].dispatch('click');
 fields.callbackPhone.value='not-a-number';fields.callbackDate.value='2000-01-01';fields.callbackHour.value='16';fields.callbackMinute.value='60';await h.prepare();
 check(!h.elements['enquiry-result'].hidden&&!h.elements['email-draft'].value.includes('not-a-number')&&!h.elements['email-draft'].value.includes('2000-01-01'),'Unselected phone fields are omitted even if they contain stale invalid values.');
 check(!fields.callbackPhone.validity&&!fields.callbackDate.validity,'Unchecked callback fields do not create hidden validation friction.');
}
{
 const h=harness({},undefined,'https://algorhythmicss.github.io/designfolio/contact/?offer=product-review',{standalone:true,noAbout:true}),fields=h.elements['enquiry-form'].elements;
 fields.name.value='Caller';fields.idea.value='Help me improve the onboarding in my app.';fields.callbackRequested.checked=true;h.elements['enquiry-callback'].open=true;
 await fields.callbackRequested.dispatch('change');
 check(!h.elements['enquiry-callback-fields'].hidden&&!fields.callbackPhone.disabled&&fields.callbackPhone.required&&fields.callbackDate.required&&fields.callbackHour.required&&fields.callbackMinute.required,'Explicit phone preference reveals and requires only the callback fields.');
 await h.prepare();
 check(h.elements['enquiry-result'].hidden&&!h.elements['enquiry-callback-phone-error'].hidden&&!h.elements['enquiry-callback-date-error'].hidden&&fields.callbackPhone.focuses.length===1&&h.calls.length===0,'An opted-in incomplete callback is highlighted without discarding the project or sending anything.');
 fields.callbackPhone.value='+91 (98765) 43210';fields.callbackDate.value='2050-10-14';fields.callbackHour.value='21';fields.callbackMinute.value='30';
 await h.prepare();const original=h.elements['email-draft'].value;
 check(original.includes('Phone call request: Please call me on +919876543210 on 14 October 2050 at 9:30 pm IST (UTC+5:30).'),'The reviewed message includes the normalized number and unambiguous desired time in IST.');
 check(original.includes('Please confirm by email before calling.')&&original.includes('not a reserved time')&&!h.elements['enquiry-callback-phone-error'].textContent&&h.calls.length===0,'A complete callback request remains a draft, with confirmation and reservation boundaries.');
 await h.elements['edit-brief'].dispatch('click');
 check(fields.callbackRequested.checked&&fields.callbackPhone.value==='+91 (98765) 43210'&&fields.callbackDate.value==='2050-10-14'&&fields.callbackHour.value==='21'&&fields.callbackMinute.value==='30'&&h.elements['enquiry-callback'].open,'Back to details preserves phone preference, supplied number, date/time and disclosure state.');
 fields.callbackRequested.checked=false;await fields.callbackRequested.dispatch('change');await h.prepare();
 check(!h.elements['email-draft'].value.includes('Phone call request:')&&!h.elements['email-draft'].value.includes('+919876543210')&&h.elements['enquiry-callback-fields'].hidden,'Removing phone preference omits the retained phone details from the next draft.');
}
for(const invalid of [
 {callbackPhone:'9876543210',field:'callbackPhone',error:'phone'},
 {callbackPhone:'+01234567890',field:'callbackPhone',error:'phone'},
 {callbackPhone:'+91987<script>',field:'callbackPhone',error:'phone'},
 {callbackPhone:'+1234567890123456',field:'callbackPhone',error:'phone'},
 {callbackDate:'2000-01-01',field:'callbackDate',error:'date'},
 {callbackDate:'2050-02-29',field:'callbackDate',error:'date'},
 {callbackDate:'2050-04-31',field:'callbackDate',error:'date'},
 {callbackDate:'not-a-date',field:'callbackDate',error:'date'},
 {callbackHour:'16',field:'callbackHour',error:'hour'},
 {callbackHour:'24',field:'callbackHour',error:'hour'},
 {callbackMinute:'60',field:'callbackMinute',error:'minute'},
 {callbackMinute:'',field:'callbackMinute',error:'minute'}
]){
 const h=harness({},undefined,'https://algorhythmicss.github.io/designfolio/contact/',{standalone:true,noAbout:true}),fields=h.elements['enquiry-form'].elements;
 fields.name.value='Careful Visitor';fields.idea.value='A good product with some onboarding changes.';fields.callbackRequested.checked=true;
 for(const [key,value] of Object.entries({callbackPhone:'+919876543210',callbackDate:'2050-10-14',callbackHour:'17',callbackMinute:'00',...invalid}))if(fields[key])fields[key].value=value;
 await h.prepare();
 check(h.elements['enquiry-result'].hidden&&!h.elements[`enquiry-callback-${invalid.error}-error`].hidden&&fields[invalid.field].focuses.length===1,'Invalid callback remains on the form with the correct error and focus: '+JSON.stringify(invalid));
 check(fields.name.value==='Careful Visitor'&&fields.idea.value==='A good product with some onboarding changes.'&&h.elements['enquiry-callback'].open&&h.calls.length===0,'Invalid callback opens its disclosure, preserves the brief and makes no requests.');
}
{
 const h=harness({},undefined,'https://algorhythmicss.github.io/designfolio/contact/?offer=first-impression',{standalone:true,noAbout:true}),tool=h.registeredTools[0],base={kind:'Free first-impression video',name:'Callback Founder',homepage:'https://example.com/'};
 const callback={callbackRequested:true,callbackPhone:'+44 (7700) 900123',callbackDate:'2050-10-14',callbackTime:'17:07'};
 const prepared=tool.execute({...base,...callback});
 check(prepared.sent===false&&prepared.message.includes('+447700900123')&&prepared.message.includes('5:07 pm IST')&&h.calls.length===0,'The browser tool can prepare an explicitly requested callback, never call or send.');
 const priorDraft=h.elements['email-draft'].value,fields=h.elements['enquiry-form'].elements,priorName=fields.name.value;
 for(const invalid of [
  {callbackPhone:'+919876543210'},
  {...callback,callbackRequested:false},
  {...callback,callbackRequested:'true'},
  {...callback,callbackPhone:919876543210},
  {...callback,callbackPhone:'919876543210'},
  {...callback,callbackPhone:'+919876543210\nCall someone else'},
  {...callback,callbackDate:'2000-01-01'},
  {...callback,callbackDate:'2050-02-29'},
  {...callback,callbackDate:20501014},
  {...callback,callbackTime:'16:59'},
  {...callback,callbackTime:'24:00'},
  {...callback,callbackTime:'21:60'},
  {...callback,callbackTime:'9:30 PM'},
  {...callback,callbackTime:2130},
  {...callback,callbackDate:undefined},
  {...callback,callbackTime:undefined},
  {...callback,callbackPhone:undefined},
  {...callback,sendNow:true}
 ]){
  let failed=false;try{tool.execute({...base,name:'Should not replace',...invalid});}catch{failed=true;}
  check(failed&&h.elements['email-draft'].value===priorDraft&&fields.name.value===priorName&&h.calls.length===0,'Invalid or non-explicit API callback is rejected before changing the existing reviewed draft.');
 }
 const noCallback=tool.execute(base);
 check(!noCallback.message.includes('Phone call request:')&&!fields.callbackRequested.checked&&h.elements['enquiry-callback-fields'].hidden&&h.calls.length===0,'A later API enquiry without phone permission removes the previous request instead of reusing consent.');
 check(tool.description.includes('call anyone or reserve a time')&&tool.inputSchema.properties.callbackRequested.type==='boolean','Tool contract describes callback intent and makes no call or booking promise.');
}
for(const bookingUrl of ['', 'https://evil.example/calendar/', 'https://meet.google.com/room', 'https://calendar.app.google/']){
 const h=harness({bookingUrl},undefined,'https://algorhythmicss.github.io/designfolio/contact/',{standalone:true,noAbout:true});
 check(h.elements['enquiry-booking'].href==='../#contact'&&!h.elements['enquiry-booking'].target&&h.calls.length===0,'Missing or invalid appointment URL keeps the root contact fallback rather than a fake booking.');
}
{
 const h=harness({bookingUrl:'https://calendar.app.google/public-example'},undefined,'https://algorhythmicss.github.io/designfolio/contact/',{standalone:true,noAbout:true});
 check(h.elements['enquiry-booking'].href==='https://calendar.app.google/public-example'&&h.elements['enquiry-booking'].textContent==='Book a Google Meet ↗'&&h.elements['enquiry-booking'].target==='_blank'&&h.elements['enquiry-booking'].rel==='noopener noreferrer'&&h.calls.length===0,'A verified-shape public appointment URL becomes an explicit, safe booking link without booking automatically.');
}

// Legacy portfolio links can migrate only public, whitelisted offer context.
for(const id of [...Object.keys(offerLabels),'conversation']){
 const url=`https://algorhythmicss.github.io/designfolio/?offer=${id}&guided=1&email=private%40example.com&homepage=https%3A%2F%2Fprivate.example&token=private-token#contact`,h=harness({},undefined,url,{noForm:true});
 check(h.redirects.length===1,'An old valid offer link forwards once to the dedicated contact page: '+id);
 const target=new URL(h.redirects[0],url);
 check(target.origin==='https://algorhythmicss.github.io'&&target.pathname==='/designfolio/contact/'&&!target.hash,'Legacy forwarding stays on the contact page without a competing scroll fragment: '+id);
 check(target.searchParams.get('offer')===id&&target.searchParams.get('guided')==='1'&&[...target.searchParams.keys()].sort().join()==='guided,offer','Only allowed offer context survives; private query values are dropped: '+id);
 check(h.calls.length===0&&h.registeredTools.length===0&&h.prepareButton.disabled,'A root page without a form cannot prepare, send or register an unusable enquiry tool: '+id);
}
for(const audience of ['clinic','studio','cafe']){
 const url=`https://algorhythmicss.github.io/designfolio/?offer=website-week&audience=${audience}&guided=1&name=Private#contact`,h=harness({},undefined,url,{noForm:true});
 const target=new URL(h.redirects[0],url);
 check(target.searchParams.get('audience')===audience&&[...target.searchParams.keys()].sort().join()==='audience,guided,offer','Legacy website context retains its known audience without forwarding personal data: '+audience);
}
for(const [offer,audience] of [['product-review','clinic'],['conversation','cafe'],['website-week','unknown'],['website-week','__proto__'],['website-week','clinic&email=private@example.com']]){
 const url=`https://algorhythmicss.github.io/designfolio/?offer=${offer}&audience=${encodeURIComponent(audience)}#contact`,h=harness({},undefined,url,{noForm:true});
 check(h.redirects.length===1&&!new URL(h.redirects[0],url).searchParams.has('audience'),'Irrelevant or untrusted audiences cannot leak into a migrated enquiry.');
}
for(const offer of ['unknown','constructor','__proto__','https://elsewhere.example/','<script>','']){
 const url=`https://algorhythmicss.github.io/designfolio/?offer=${encodeURIComponent(offer)}&guided=1&email=private@example.com#contact`,h=harness({},undefined,url,{noForm:true,noAbout:true});
 check(h.redirects.length===0&&h.calls.length===0&&h.registeredTools.length===0,'Unknown root offers neither redirect, leak query data nor initialize a nonexistent form.');
}
for(const guided of ['0','2','01','true','']){
 const url=`https://algorhythmicss.github.io/designfolio/?offer=product-upgrade&guided=${guided}#contact`,h=harness({},undefined,url,{noForm:true});
 check(!new URL(h.redirects[0],url).searchParams.has('guided'),'Only an exact guided=1 flag is forwarded to contact.');
}
{
 const h=harness({formspreeEndpoint:'https://formspree.io/f/testform'},undefined,'https://algorhythmicss.github.io/designfolio/#contact',{noForm:true});
 check(h.calls.length===0&&h.registeredTools.length===0&&h.redirects.length===0,'Ordinary root navigation leaves the preserved About and call features independent of form providers.');
}

// Standalone contact starts with the selected scope and two relevant fields.
check(/<fieldset hidden>\s*<legend id="enquiry-offer-title"/.test(mainFormHTML),'The offer radio context stays hidden instead of asking visitors to choose again.');
check(/name="kind" value="Still figuring it out" checked/.test(mainFormHTML),'Unselected enquiries start with an honest conversation rather than a paid package.');
check(/<details id="enquiry-extra"[^>]*>\s*<summary>/.test(mainFormHTML)&&!/<details id="enquiry-extra"[^>]*\sopen(?:\s|>)/.test(mainFormHTML),'Extra context is an optional, initially closed native disclosure.');
for(const [id,label] of Object.entries({...offerLabels,conversation:'Still figuring it out'})){
 const h=harness({},undefined,`https://algorhythmicss.github.io/designfolio/contact/?offer=${id}&guided=1`,{standalone:true,noAbout:true}),fields=h.elements['enquiry-form'].elements,free=id==='first-impression';
 check(fields.kind.value===label&&h.elements['selected-offer-name'].textContent===(id==='conversation'?'A first conversation':label),'Standalone contact displays the selected scope without a second offer decision: '+id);
 check(h.elements['enquiry-primary-fields'].childNodes.map(node=>node===h.elements['enquiry-name-field']?'name':node===h.elements['enquiry-homepage-field']?'homepage':'idea').join()===(free?'name,homepage':'name,idea'),'Only the name and relevant brief-or-link stay in the primary fields: '+id);
 check(h.elements[free?'enquiry-idea-field':'enquiry-homepage-field'].parentElement===h.elements['enquiry-extra-fields']&&!h.elements['enquiry-extra'].open,'Optional brief-or-link remains available without expanding extra fields: '+id);
 check(fields.homepage.required===free&&fields.idea.required===!free,'Standalone field requirements match the selected offer: '+id);
 check(h.elements['enquiry-business'].hidden===['first-impression','website-week','first-product','conversation'].includes(id),'Product-stage questions are shown only for relevant existing-product work: '+id);
 check(h.elements['enquiry-budget-timing'].hidden===free,'Free-video enquiries avoid asking for project budget or timing: '+id);
 check(h.elements['enquiry-title'].textContent===(free?'Get a first impression.':'Start a project.'),'The contact heading describes the actual free request or project: '+id);
 check(free?/Your name and a public product link.*confirm availability/.test(h.elements['enquiry-intro-copy'].textContent):/make or improve/.test(h.elements['enquiry-intro-copy'].textContent),'The intro asks for relevant information without selling a paid project to a free-video visitor: '+id);
 check(h.elements['enquiry-idea-field'].querySelector('.field-title').firstChild.textContent===(free?'Anything you’d like me to look at? ':'What would you like to make or improve? '),'The optional free-video message label describes the requested video rather than a build brief: '+id);
 h.load();check(fields.name.focuses.length===0&&h.elements['enquiry-form'].lastScroll===undefined,'Opening standalone contact does not jump scroll or summon keyboard focus: '+id);
 check(h.calls.length===0&&h.redirects.length===0&&h.elements['enquiry-result'].hidden&&h.elements['email-draft'].value==='','Standalone navigation neither prepares, forwards nor sends an enquiry: '+id);
 fields.name.value='A Sample Founder';if(free)fields.homepage.value='https://example.com/app';else fields.idea.value='I would like a clearer first version of this project.';
 await h.prepare();
 check(h.calls.length===0&&!h.elements['enquiry-result'].hidden&&h.elements['enquiry-form'].hidden&&h.elements['enquiry-intro'].hidden,'Explicit standalone preparation reveals a reviewed draft, without delivery: '+id);
 check(id==='conversation'?h.elements['email-draft'].value.includes('I’m still figuring out exactly what I need.'):h.elements['email-draft'].value.includes(`I’m interested in your ${label}.`),'The standalone reviewed draft carries the selected scope honestly: '+id);
 check(!/\n(?:Budget|Timing|Users|Revenue|Funding):/.test(h.elements['email-draft'].value),'Blank optional fields do not invent qualifications or a budget: '+id);
 await h.elements['edit-brief'].dispatch('click');
 check(!h.elements['enquiry-form'].hidden&&!h.elements['enquiry-intro'].hidden&&fields.name.value==='A Sample Founder'&&fields.kind.value===label,'Back to details preserves the selected scope and entered values: '+id);
}
{
 const h=harness({},undefined,'https://algorhythmicss.github.io/designfolio/contact/',{standalone:true,noAbout:true});
 check(h.elements['enquiry-form'].elements.kind.value==='Still figuring it out'&&h.elements['selected-offer-name'].textContent==='A first conversation'&&h.elements['enquiry-guide-link'].textContent.includes('Find a scope'),'A direct contact visit starts with a conversation and a way to explore scope.');
 await h.prepare();
 const fields=h.elements['enquiry-form'].elements;
 check(h.elements['enquiry-result'].hidden&&h.elements['enquiry-name-error'].hidden===false&&h.elements['enquiry-idea-error'].hidden===false&&!h.elements['enquiry-error-summary'].hidden,'Empty primary fields expose readable local errors instead of preparing a draft.');
 check(fields.name.attributes['aria-invalid']==='true'&&fields.idea.attributes['aria-invalid']==='true'&&fields.name.focuses.length===1,'Primary errors are programmatically identified and focus the first invalid field.');
 fields.name.value='New Founder';await fields.name.dispatch('input');
 check(h.elements['enquiry-name-error'].hidden&&!fields.name.attributes['aria-invalid']&&fields.idea.validity,'Editing one field clears only its error without clearing another invalid field.');
}
{
 const h=harness({},undefined,'https://algorhythmicss.github.io/designfolio/contact/?offer=product-review',{standalone:true,noAbout:true}),fields=h.elements['enquiry-form'].elements;
 fields.name.value='Private Founder';fields.idea.value='Help me improve this onboarding flow.';fields.homepage.value='javascript:alert(1)';
 await h.prepare();
 check(h.elements['enquiry-extra'].open&&!h.elements['enquiry-homepage-error'].hidden&&fields.homepage.focuses.length===1,'An invalid optional URL opens its disclosure before focusing the error.');
 check(fields.name.value==='Private Founder'&&fields.idea.value==='Help me improve this onboarding flow.'&&h.elements['enquiry-result'].hidden&&h.calls.length===0,'Optional-field validation preserves the primary brief and makes no requests.');
 fields.homepage.value='example.com/app';await fields.homepage.dispatch('input');await h.prepare();
 check(fields.homepage.value==='https://example.com/app'&&h.elements['email-draft'].value.includes('Product or website: https://example.com/app')&&h.calls.length===0,'A normal domain is normalized only in the standalone draft flow, without being fetched.');
}
{
 const h=harness({},undefined,'https://algorhythmicss.github.io/designfolio/contact/?offer=first-impression',{standalone:true,noAbout:true}),fields=h.elements['enquiry-form'].elements;
 check(fields.homepage.required&&h.elements['enquiry-homepage-note'].textContent==='(required)','The standalone free-video URL is visibly marked as required without the longer legacy explanation.');
 fields.name.value='Curious Founder';fields.homepage.value='example.com';fields.idea.value='Hi';await h.prepare();
 check(h.elements['enquiry-extra'].open&&!h.elements['enquiry-idea-error'].hidden&&fields.idea.focuses.length===1,'A supplied but invalid optional free-video message is exposed and focusable.');
 fields.idea.value='';await fields.idea.dispatch('input');await h.prepare();
 check(!h.elements['enquiry-result'].hidden&&h.elements['email-draft'].value.includes('https://example.com/')&&!h.elements['email-draft'].value.includes('\n\nHi\n\n'),'A free-video request accepts name and URL without an invented project brief.');
}
{
 const h=harness({},undefined,'https://algorhythmicss.github.io/designfolio/contact/?offer=product-upgrade',{standalone:true,noAbout:true}),fields=h.elements['enquiry-form'].elements;
 fields.name.value='App Founder';fields.idea.value='Improve the product I have already launched.';fields.homepage.value='https://example.com/';fields.budget.value='₹60,000–₹3,00,000 / $2,500–$6,000';fields.timing.value='In November';fields.users.value='Has users';fields.revenue.value='Pre-revenue';fields.funding.value='Bootstrapped';
 h.elements['enquiry-extra'].open=true;await h.prepare();const original=h.elements['email-draft'].value;
 check(original.includes('Timing: In November')&&original.includes('Users: Has users')&&original.includes('Funding: Bootstrapped'),'Explicit optional context is carried into the reviewed standalone draft.');
 h.elements['email-draft'].value+='\nPlease keep this note.';await h.elements['email-draft'].dispatch('input');await h.elements['copy-brief'].dispatch('click');
 check(h.copied.at(-1)===h.elements['email-draft'].value&&h.elements['open-email'].href.includes(encodeURIComponent(h.elements['email-draft'].value))&&h.calls.length===0,'Copy and mailto preserve edits to the reviewed standalone draft without delivery.');
 await h.elements['edit-brief'].dispatch('click');
 check(fields.homepage.value==='https://example.com/'&&fields.budget.value==='₹60,000–₹3,00,000 / $2,500–$6,000'&&fields.timing.value==='In November'&&fields.funding.value==='Bootstrapped'&&h.elements['enquiry-extra'].open,'Returning from review preserves optional answers and disclosure state.');
 fields.kind.value='Free first-impression video';await h.elements['enquiry-form'].dispatch('change');
 check(h.elements['enquiry-homepage-field'].parentElement===h.elements['enquiry-primary-fields']&&h.elements['enquiry-idea-field'].parentElement===h.elements['enquiry-extra-fields']&&fields.homepage.value==='https://example.com/'&&fields.idea.value==='Improve the product I have already launched.','Changing context moves existing label nodes without discarding their values.');
 check(h.elements['enquiry-budget-timing'].hidden&&!h.elements['enquiry-idea-note'].hidden&&h.elements['enquiry-title'].textContent==='Get a first impression.','Changing from paid work to a free video updates the request wording and hides paid-project questions.');
 fields.kind.value='14-Day Launch-Ready Sprint';await h.elements['enquiry-form'].dispatch('change');
 check(!h.elements['enquiry-budget-timing'].hidden&&h.elements['enquiry-idea-note'].hidden&&h.elements['enquiry-title'].textContent==='Start a project.'&&h.elements['enquiry-idea-field'].querySelector('.field-title').firstChild.textContent==='What would you like to make or improve? ','Changing back to paid work restores project wording and optional budget/timing without stale free-copy.');
}
for(const id of ['unknown','constructor','__proto__','<script>']){
 const h=harness({},undefined,`https://algorhythmicss.github.io/designfolio/contact/?offer=${encodeURIComponent(id)}&guided=1`,{standalone:true,noAbout:true});
 check(h.elements['enquiry-form'].elements.kind.value==='Still figuring it out'&&h.elements['selected-offer-name'].textContent==='A first conversation'&&h.calls.length===0,'An untrusted standalone offer keeps the honest default conversation.');
}
for(const audience of ['clinic','studio','cafe']){
 const h=harness({},undefined,`https://algorhythmicss.github.io/designfolio/contact/?offer=website-week&guided=1&audience=${audience}`,{standalone:true,noAbout:true}),fields=h.elements['enquiry-form'].elements;
 fields.name.value='Business Owner';fields.idea.value='Create a clear website for my business.';await h.prepare();
 check(fields.audience.value===audience&&h.elements['email-draft'].value.includes('Website package: ')&&h.elements['enquiry-business'].hidden,'Standalone website context retains its niche without exposing app-stage questions: '+audience);
}

{
 const h=harness();
 check(!h.prepareButton.disabled,'Draft preparation enables after the submit handler registers.');
 check(h.elements['direct-enquiry'].hidden&&h.elements['send-enquiry'].disabled,'No endpoint means no direct send control.');
 check(h.elements['contact-whatsapp'].hidden,'No number means no WhatsApp control.');
 check(!h.elements['contact-booking'].hidden&&h.elements['contact-booking'].href.startsWith('mailto:'),'No appointment URL means a real call-email fallback.');
 await h.prepare();
 check(h.calls.length===0,'Preparing a brief makes no network request.');
 check(h.elements['enquiry-form'].hidden&&!h.elements['enquiry-result'].hidden,'Prepared draft replaces the form.');
 check(h.elements['email-draft'].value.includes('A clear website for my small business.'),'Draft includes the supplied project.');
 check(h.elements['open-email'].href.includes('body='),'Email fallback contains the reviewed message.');
 await h.elements['copy-brief'].dispatch('click');
 check(h.copied[0]===h.elements['email-draft'].value,'Copy fallback preserves the reviewed message.');
 await h.elements['edit-brief'].dispatch('click');
 check(!h.elements['enquiry-form'].hidden&&h.elements['enquiry-form'].elements.idea.value.includes('small business'),'Going back preserves entered details.');
}
for(const endpoint of ['', 'http://formspree.io/f/testform','https://elsewhere.example/f/testform','https://user:secret@formspree.io/f/testform','https://formspree.io:444/f/testform','https://formspree.io/f/testform?key=secret','https://formspree.io/f/testform#fragment','https://formspree.io/ayush@example.com']){
 const h=harness({formspreeEndpoint:endpoint});
 check(h.elements['direct-enquiry'].hidden,`Invalid endpoint remains inactive: ${endpoint||'empty'}`);
}
{
 const h=harness({formspreeEndpoint:'https://formspree.io/f/testform',whatsappNumber:'+91 (98765) 43210',bookingUrl:'https://calendar.app.google/public-example'});
 check(!h.elements['direct-enquiry'].hidden&&!h.elements['send-enquiry'].disabled,'Valid endpoint activates the reviewed-draft send option.');
 check(h.elements['contact-whatsapp'].href.startsWith('https://wa.me/919876543210?'),'International number normalization creates a WhatsApp greeting link.');
 check(h.elements['contact-booking'].textContent==='Book a Google Meet'&&h.elements['contact-booking'].target==='_blank','Public appointment URL activates a clearly labelled booking link.');
 await h.prepare();check(h.calls.length===0,'Configured Formspree still does not send when preparing a draft.');
}
for(const bookingUrl of ['https://meet.google.com/room-example','javascript:alert(1)','https://calendar.app.google/','https://evil.example/appointments/schedules/test']){
 const h=harness({bookingUrl,whatsappNumber:'not-a-number'});
 check(h.elements['contact-booking'].href.startsWith('mailto:')&&h.elements['contact-whatsapp'].hidden,'Invalid destinations fall back to email rather than exposing fake channels.');
}
{
 let finish;
 const h=harness({formspreeEndpoint:'https://formspree.io/f/testform'},()=>new Promise(resolve=>finish=resolve));
 await h.prepare();const message=h.elements['email-draft'].value;
 const pending=h.send();await Promise.resolve();
 check(h.calls.length===1&&h.elements['send-enquiry'].disabled,'One explicit submit starts one request and disables duplicate submission.');
 await h.send();check(h.calls.length===1,'Repeated submission while busy does not create another request.');
 const fields=h.elements['enquiry-form'].elements;
 const savedForm=JSON.stringify(Object.fromEntries(Object.entries(fields).map(([key,field])=>[key,{value:field.value,checked:field.checked,disabled:field.disabled}])));
 const savedMessage=h.elements['email-draft'].value,savedSubject=h.elements['open-email'].href;
 assert.throws(()=>h.registeredTools[0].execute({kind:'3-Day Launch-Ready Check',name:'Another visitor',idea:'A different product with a different scope.',callbackRequested:true,callbackPhone:'+91 98765 43210',callbackDate:'2999-01-01',callbackTime:'17:15'}),/wait for the current enquiry submission/);checks++;
 check(savedForm===JSON.stringify(Object.fromEntries(Object.entries(fields).map(([key,field])=>[key,{value:field.value,checked:field.checked,disabled:field.disabled}]))),'A browser-tool request rejected during sending preserves every saved field and callback opt-in.');
 check(h.elements['email-draft'].value===savedMessage&&h.elements['open-email'].href===savedSubject&&h.calls.length===1,'A busy browser-tool rejection preserves the reviewed draft and delivery link without another request.');
 check(h.elements['email-draft'].disabled&&h.elements['reply-email'].disabled&&h.elements['edit-brief'].disabled,'Submitted snapshot cannot be changed while the request is pending.');
 check(h.calls[0].options.method==='POST'&&h.calls[0].options.headers.Accept==='application/json'&&h.calls[0].options.credentials==='omit','Request uses the public POST endpoint and asks for an AJAX response without account cookies.');
 check(h.calls[0].options.body.get('message')===message&&h.calls[0].options.body.get('email')==='visitor@example.com','Only the reviewed message and intended reply address are submitted.');
 finish({ok:true,status:204});await pending;
 check(h.elements['send-status'].textContent.includes('accepted')&&!h.elements['send-status'].textContent.includes('delivered'),'Any successful HTTP response means provider acceptance, never confirmed inbox delivery.');
 check(h.elements['email-draft'].value===message&&!h.elements['email-draft'].disabled&&h.elements['send-enquiry'].disabled,'Success keeps the message and prevents accidental immediate resubmission.');
 await h.send();check(h.calls.length===1,'Accepted unchanged message does not submit twice.');
 h.elements['email-draft'].value+='\nI also have a shop.';await h.elements['email-draft'].dispatch('input');
 check(!h.elements['send-enquiry'].disabled&&h.elements['send-status'].textContent.includes('not been sent'),'Editing the accepted draft allows an explicitly new submission.');
 h.elements['email-draft'].value=message;await h.elements['email-draft'].dispatch('input');await h.send();
 check(h.elements['send-enquiry'].disabled&&h.calls.length===1,'Restoring the accepted message does not accidentally resend the same draft.');
 h.elements['email-draft'].value='';await h.elements['email-draft'].dispatch('input');
 check(!h.elements['draft-status'].textContent.includes('accepted'),'Clearing the draft never falsely reports it as accepted.');
}
{
 // A mutation of the exact early guard reproduces the original failure: the
 // later createDraft guard still rejects, but only after altering saved input.
 const guard="  // Reject before touching the saved form while its reviewed snapshot is sending.\n  if(sendState==='sending')throw new Error('Please wait for the current enquiry submission before preparing another draft.');\n";
 check(source.includes(guard),'The busy-tool mutation targets the early, pre-mutation guard.');
 let finish;
 const h=harness({formspreeEndpoint:'https://formspree.io/f/testform'},()=>new Promise(resolve=>finish=resolve),'',{appSource:source.replace(guard,'')});
 await h.prepare();const beforeName=h.elements['enquiry-form'].elements.name.value,message=h.elements['email-draft'].value;
 const pending=h.send();await Promise.resolve();
 assert.throws(()=>h.registeredTools[0].execute({kind:'3-Day Launch-Ready Check',name:'Another visitor',idea:'A different product with a different scope.'}),/wait for the current enquiry submission/);checks++;
 check(h.elements['enquiry-form'].elements.name.value!==beforeName&&h.elements['email-draft'].value===message&&h.calls.length===1,'Removing the early guard is caught by the saved-form preservation regression.');
 finish({ok:true,status:200});await pending;
}
for(const httpStatus of [400,429,500]){
 const h=harness({formspreeEndpoint:'https://formspree.io/f/testform'},async()=>({ok:false,status:httpStatus}));
 await h.prepare();const message=h.elements['email-draft'].value;await h.send();
 check(h.calls.length===1,'HTTP errors are never retried automatically.');
 check(h.elements['email-draft'].value===message&&h.elements['reply-email'].value==='visitor@example.com'&&!h.elements['email-draft'].disabled,'HTTP failures preserve the draft, reply address and editable fields.');
 check(httpStatus===500?h.elements['send-status'].textContent.includes('duplicate'):h.elements['send-status'].textContent.includes(httpStatus===429?'too many requests':'could not accept'),'Rejection and server uncertainty are distinguished.');
 await h.elements['copy-brief'].dispatch('click');check(h.copied[0]===message,'Copy fallback still works after an HTTP failure.');
 check(h.elements['open-email'].href.includes(encodeURIComponent(message)),'Mailto fallback still includes the draft after an HTTP failure.');
}
{
 const h=harness({formspreeEndpoint:'https://formspree.io/f/testform'},async()=>{throw new TypeError('Network unavailable');});
 await h.prepare();const message=h.elements['email-draft'].value;await h.send();
 check(h.calls.length===1&&h.elements['send-status'].textContent.includes('couldn’t confirm'),'Network failure states uncertain receipt without automatic retry.');
 check(h.elements['email-draft'].value===message&&!h.elements['send-enquiry'].disabled,'Network failure preserves the message and leaves an explicit retry available.');
}
{
 const h=harness({formspreeEndpoint:'https://formspree.io/f/testform'},async(_,options)=>new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('Aborted')))));
 await h.prepare();const pending=h.send();await Promise.resolve();
 check(h.timers.size===1,'In-flight request has a bounded timeout.');
 [...h.timers.values()][0]();await pending;
 check(h.calls.length===1&&h.timers.size===0&&h.elements['send-status'].textContent.includes('duplicate'),'Timeout aborts once, clears its timer, and does not imply no receipt.');
}
{
 const h=harness({formspreeEndpoint:'https://formspree.io/f/testform'});await h.prepare();
 h.elements['reply-email'].value='not-an-email';await h.send();
 check(h.calls.length===0,'Invalid reply address never reaches the network.');
 h.elements['reply-email'].value='visitor@example.com';h.elements['email-draft'].value='Hi';await h.send();
 check(h.calls.length===0,'An empty or too-short reviewed message never reaches the network.');
}

// Offer links must select only known offers and cannot send or replace an enquiry.
for(const [id,label] of Object.entries(offerLabels)){
 const h=harness({},undefined,`https://algorhythmicss.github.io/designfolio/?offer=${id}#contact`);
 check(h.elements['enquiry-form'].elements.kind.value===label&&h.elements['contact-details'].open,'Known pricing link selects its offer and opens the enquiry.');
 h.load();check(h.elements['enquiry-form'].lastScroll?.behavior==='instant'&&h.elements['enquiry-form'].lastScroll?.block==='start','After initial hash navigation, the selected enquiry is brought into view without a long page animation.');
 check(h.calls.length===0&&h.elements['enquiry-result'].hidden&&h.elements['email-draft'].value==='','Pricing navigation neither prepares a draft nor sends an enquiry.');
 check(h.elements['first-product-choice'].hidden===(id!=='first-product'),'First Product Build stays outside the homepage offer choices until requested.');
 if(id==='first-impression')h.elements['enquiry-form'].elements.homepage.value='https://example.com/app';
 await h.prepare();
 check(h.elements['email-draft'].value.includes(`I’m interested in your ${label}.`),'Reviewed email preserves the selected offer name.');
}
// A guided recommendation keeps its chosen scope visible without reopening the menu.
for(const [id,label] of Object.entries({...offerLabels,conversation:'Still figuring it out'})){
 const h=harness({},undefined,`https://algorhythmicss.github.io/designfolio/?offer=${id}&guided=1#contact`),fields=h.elements['enquiry-form'].elements;
 const visible=h.kindRadios.filter(radio=>!radio.closest('label').hidden);
 check(fields.kind.value===label&&h.elements['contact-details'].open,'Guided recommendation selects a known offer or the honest unsure choice: '+id);
 check(visible.length===1&&visible[0].value===label,'Only the chosen offer label is shown after the guide: '+id);
 check(h.elements['enquiry-offer-title'].textContent==='Your starting point'&&!h.elements['enquiry-guide-note'].hidden,'Guided contact labels the starting point and reveals the way back: '+id);
 check(h.calls.length===0&&h.elements['enquiry-result'].hidden&&h.elements['email-draft'].value==='','Guided navigation does not prepare or send a draft: '+id);
 if(id==='first-impression')fields.homepage.value='https://example.com/app';
 await h.prepare();
 check(h.calls.length===0&&!h.elements['enquiry-result'].hidden,'Only explicit preparation creates the reviewed draft, without network requests: '+id);
 check(id==='conversation'?h.elements['email-draft'].value.includes('I’m still figuring out exactly what I need.')&&!h.elements['email-draft'].value.includes('interested in your'):h.elements['email-draft'].value.includes(`I’m interested in your ${label}.`),'Guided email preserves the chosen scope without inventing a paid conversation offer: '+id);
 await h.elements['edit-brief'].dispatch('click');
 check(!h.elements['enquiry-form'].hidden&&h.kindRadios.filter(radio=>!radio.closest('label').hidden).length===1&&fields.kind.value===label,'Returning to edit keeps the guided starting point and supplied details: '+id);
}
for(const [audience,label] of Object.entries({clinic:'7-Day Clinic Website',studio:'7-Day Studio Website',cafe:'7-Day Café Website'})){
 const h=harness({},undefined,`https://algorhythmicss.github.io/designfolio/?offer=website-week&guided=1&audience=${audience}#contact`);
 check(h.elements['enquiry-form'].elements.audience.value===audience&&!h.elements['enquiry-audience'].hidden&&h.elements['enquiry-audience'].textContent===label,'Guided website retains its whitelisted business context: '+audience);
 check(h.kindRadios.filter(radio=>!radio.closest('label').hidden).map(radio=>radio.value).join()==='7-Day Website'&&h.calls.length===0,'Website context does not reopen other offers or send information: '+audience);
 await h.prepare();check(h.elements['email-draft'].value.includes('Website package: '+label)&&h.calls.length===0,'Guided website context is present only in the explicitly reviewed draft: '+audience);
}
for(const id of ['unknown','constructor','__proto__','<script>alert(1)</script>','']){
 const h=harness({},undefined,`https://algorhythmicss.github.io/designfolio/?offer=${encodeURIComponent(id)}&guided=1#contact`);
 check(h.elements['enquiry-form'].elements.kind.value==='7-Day Website'&&h.kindRadios.filter(radio=>!radio.closest('label').hidden).length===5,'Unknown guided values do not change the default selection or hide the normal menu.');
 check(h.elements['enquiry-offer-title'].textContent==='Which offer fits what you need?'&&h.elements['enquiry-guide-note'].hidden,'An untrusted guided offer does not activate recommendation presentation.');
 check(h.calls.length===0&&h.elements['enquiry-result'].hidden&&h.elements['email-draft'].value==='','Unknown guided values neither prepare nor send an enquiry.');
}
for(const guided of [undefined,'','0','2','01','true']){
 const query=guided===undefined?'':`&guided=${encodeURIComponent(guided)}`,h=harness({},undefined,`https://algorhythmicss.github.io/designfolio/?offer=product-upgrade${query}#contact`);
 check(h.elements['enquiry-form'].elements.kind.value==='14-Day Launch-Ready Sprint'&&h.kindRadios.filter(radio=>!radio.closest('label').hidden).length===5,'Non-guided pricing links retain the normal offer menu.');
 check(h.elements['enquiry-offer-title'].textContent==='Which offer fits what you need?'&&h.elements['enquiry-guide-note'].hidden&&h.calls.length===0,'Only an exact guided=1 flag activates the focused presentation.');
}
{
 const h=harness({formspreeEndpoint:'https://formspree.io/f/testform'},undefined,'https://algorhythmicss.github.io/designfolio/?offer=product-upgrade&guided=1#contact');
 check(h.calls.length===0&&h.elements['enquiry-result'].hidden,'A configured endpoint does not automatically send or prepare a guided enquiry.');
 await h.prepare();check(h.calls.length===0&&!h.elements['enquiry-result'].hidden,'Guided draft preparation still requires a separate explicit delivery action.');
}
for(const id of ['unknown','constructor','__proto__','<script>alert(1)</script>']){
 const h=harness({},undefined,`https://algorhythmicss.github.io/designfolio/?offer=${encodeURIComponent(id)}#contact`);
 check(h.elements['enquiry-form'].elements.kind.value==='7-Day Website'&&h.calls.length===0&&h.elements['first-product-choice'].hidden,'Unknown or untrusted offer parameters do not select or expose an offer.');
}
// Qualification stays optional; only explicit choices reach a reviewed draft.
{
 const h=harness();await h.prepare();
 check(!/\n(?:Users|Revenue|Funding):/.test(h.elements['email-draft'].value),'Blank business fields add no invented status.');
 await h.elements['edit-brief'].dispatch('click');
 const fields=h.elements['enquiry-form'].elements;
 fields.users.value='Has users';fields.revenue.value='Revenue-generating';fields.funding.value='Funded';
 await h.prepare();
 check(h.elements['email-draft'].value.includes('Users: Has users')&&h.elements['email-draft'].value.includes('Revenue: Revenue-generating')&&h.elements['email-draft'].value.includes('Funding: Funded'),'Users, revenue and funding are independent and preserved.');
 check(h.calls.length===0,'Qualification answers are not submitted when preparing a message.');
}
for(const [id,label] of Object.entries({clinic:'7-Day Clinic Website',studio:'7-Day Studio Website',cafe:'7-Day Café Website'})){
 const h=harness({},undefined,`https://algorhythmicss.github.io/designfolio/?offer=website-week&audience=${id}#contact`);
 check(h.elements['enquiry-form'].elements.audience.value===id&&!h.elements['enquiry-audience'].hidden&&h.elements['enquiry-audience'].textContent===label,'Audience links carry a whitelisted package context.');
 await h.prepare();check(h.elements['email-draft'].value.includes('Website package: '+label),'The reviewed website draft includes its audience package.');
 h.elements['enquiry-form'].elements.kind.value='3-Day Launch-Ready Check';await h.prepare();
 check(!h.elements['email-draft'].value.includes('Website package:'),'Changing to another offer omits irrelevant website context.');
}
for(const id of ['constructor','<script>','unknown']){
 const h=harness({},undefined,`https://algorhythmicss.github.io/designfolio/?offer=website-week&audience=${encodeURIComponent(id)}#contact`);
 check(!h.elements['enquiry-form'].elements.audience.value&&h.elements['enquiry-audience'].hidden,'Unknown audience query values are not copied into the form.');
}
{
 const h=harness(),tool=h.registeredTools[0];
 const base={kind:'3-Day Launch-Ready Check',name:'Demo Founder',idea:'Improve onboarding in our live app.'};
 const result=tool.execute({...base,users:'Has users',revenue:'Pre-revenue',funding:'Bootstrapped'});
 check(result.sent===false&&result.message.includes('Funding: Bootstrapped')&&h.calls.length===0,'The browser tool preserves qualification without sending.');
 for(const field of ['users','revenue','funding']){
  let failed=false;try{tool.execute({...base,[field]:'invented status'});}catch{failed=true;}
  check(failed,'The browser tool rejects unsupported business status: '+field);
 }
 let failed=false;try{tool.execute({...base,audience:'clinic'});}catch{failed=true;}
 check(failed,'Audience context cannot be assigned to an unrelated offer.');
 const build=tool.execute({...base,kind:'Idea to Launch in 6 Weeks'});
 check(!h.elements['first-product-choice'].hidden&&build.message.includes('Idea to Launch in 6 Weeks'),'The first-build browser tool reveals the renamed form choice.');
 check(tool.inputSchema.properties.kind.enum.length===11,'All ten offers and the unsure choice are available in the browser tool.');
}
// The free-video request needs a URL, while paid enquiries retain their brief.
{
 const h=harness({},undefined,'https://algorhythmicss.github.io/designfolio/?offer=first-impression#contact'),fields=h.elements['enquiry-form'].elements;
 check(h.elements['enquiry-homepage-note'].textContent==='(required for the video)','Legacy form mode preserves its required-video marker.');
 check(!h.elements['choice-first-impression'].hidden&&fields.homepage.required&&!fields.idea.required,'The free video reveals its choice and asks for a URL rather than a compulsory brief.');
 check(!h.elements['first-impression-note'].hidden,'The free request explains the deliverable and availability.');
 fields.idea.value='';fields.homepage.value='';await h.prepare();
 check(h.elements['enquiry-result'].hidden&&fields.homepage.validity,'A missing app URL cannot prepare a free request.');
 for(const link of ['javascript:alert(1)','/relative-app','https://user:secret@example.com']){
  fields.homepage.value=link;await h.prepare();
  check(h.elements['enquiry-result'].hidden&&h.calls.length===0,'Invalid or credential-bearing app links never prepare a free request.');
 }
 fields.homepage.value=' https://example.com/app ';await h.prepare();
 check(h.elements['email-draft'].value.includes('Product or website: https://example.com/app')&&h.calls.length===0,'The free draft carries the normalized URL without fetching it.');
 await h.elements['edit-brief'].dispatch('click');fields.kind.value='3-Day Launch-Ready Check';await h.elements['enquiry-form'].dispatch('change');
 check(!fields.homepage.required&&fields.idea.required&&h.elements['first-impression-note'].hidden,'Changing to a paid offer restores the required project brief.');
 fields.homepage.value='';fields.idea.value='';await h.prepare();
 check(h.elements['enquiry-result'].hidden&&fields.idea.validity,'A paid enquiry still requires its project description.');
}
{
 const h=harness(),tool=h.registeredTools[0],base={kind:'Free first-impression video',name:'Demo Founder'};
 let failed=false;try{tool.execute(base);}catch{failed=true;}
 check(failed,'The browser tool also requires the free-video URL.');
 const draft=tool.execute({...base,homepage:'https://example.com/app'});
 check(draft.sent===false&&draft.message.includes('https://example.com/app')&&h.calls.length===0,'The browser tool prepares a free request with a URL and no invented brief.');
 for(const homepage of ['javascript:alert(1)','https://user:secret@example.com',42]){
  failed=false;try{tool.execute({...base,homepage});}catch{failed=true;}
  check(failed,'The browser tool rejects invalid URLs before altering the draft.');
 }
 failed=false;try{tool.execute({kind:'14-Day Launch-Ready Sprint',name:'Demo Founder'});}catch{failed=true;}
 check(failed,'The browser tool still requires a brief for a paid Sprint.');
}
check(!html.includes('Under ₹50,000'),'The retired low-budget option is absent.');
console.log(`${checks} contact boundary checks passed. All requests were stubbed; no email, WhatsApp message, or appointment was sent.`);
