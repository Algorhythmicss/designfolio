// Network-free boundary checks for the reviewed-draft contact flow.
// Run with: node tools/verify-contact.mjs
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('../app.js',import.meta.url),'utf8');
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
let checks=0;
function check(condition,message){assert.ok(condition,message);checks++;}
const offerLabels=Object.freeze({'first-impression':'Free first-impression video','product-review':'3-Day Launch-Ready Check','product-upgrade':'14-Day Launch-Ready Sprint','monthly-partner':'Ship Every Week','first-product':'Idea to Launch in 6 Weeks','website-week':'7-Day Website','launch-grow':'Launch & Grow','lockdown-week':'Lockdown Week','look-week':'Look Week','quarterly-checkin':'Quarterly Check-in'});
const extraLabelIds=Object.freeze({'Free first-impression video':'choice-first-impression','Idea to Launch in 6 Weeks':'first-product-choice','Launch & Grow':'choice-launch-grow','Lockdown Week':'choice-lockdown-week','Look Week':'choice-look-week','Quarterly Check-in':'choice-quarterly-checkin'});
class Element{
 constructor(value=''){this.value=value;this.hidden=false;this.disabled=false;this.textContent='';this.attributes={};this.listeners={};this.validity='';this.isConnected=true;}
 addEventListener(name,listener){(this.listeners[name]??=[]).push(listener);}
 async dispatch(name){const event={target:this,currentTarget:this,preventDefault(){this.prevented=true;}};await Promise.all((this.listeners[name]||[]).map(listener=>listener(event)));return event;}
 setAttribute(name,value){this.attributes[name]=value;}
 removeAttribute(name){delete this.attributes[name];if(name==='target')this.target='';}
 setCustomValidity(message){this.validity=message;}
 reportValidity(){return !this.validity&&(!this.emailField||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value));}
 focus(){} select(){} scrollIntoView(options){this.lastScroll=options;} close(){} showModal(){}
 getBoundingClientRect(){return {left:0,right:100,top:0,bottom:100};}
 querySelector(selector){return this.children[selector];}
 closest(selector){return selector==='label'?this.parentLabel:null;}
}
class Fields{
 constructor(form){this.values=new Map(form?Object.entries(form.elements).map(([name,input])=>[name,input.value]):[]);}
 get(name){return this.values.get(name);}
 append(name,value){this.values.set(name,value);}
}
function harness(config={},handler=async()=>({ok:true,status:200}),pageURL=''){
 const ids=['contact-options','contact-whatsapp','contact-booking','about-dialog','about-work','enquiry-form','enquiry-result','email-draft','open-email','draft-status','contact-details','edit-brief','copy-brief','direct-enquiry','reply-email','send-enquiry','send-status','prepare-note','contact-disclosure','first-product-choice','choice-launch-grow','choice-lockdown-week','choice-look-week','choice-quarterly-checkin','enquiry-audience','choice-first-impression','enquiry-homepage-note','first-impression-note','enquiry-offer-title','enquiry-guide-note'];
 const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
 for(const id of ['first-product-choice','choice-launch-grow','choice-lockdown-week','choice-look-week','choice-quarterly-checkin','enquiry-audience','choice-first-impression','first-impression-note'])elements[id].hidden=true;elements['contact-whatsapp'].hidden=true;elements['direct-enquiry'].hidden=true;elements['send-enquiry'].disabled=true;elements['enquiry-result'].hidden=true;
 elements['about-dialog'].children={'[data-close]':new Element()};
 elements['enquiry-result'].children={'h3':new Element()};
 const prepareButton=new Element();prepareButton.disabled=true;
 const form=elements['enquiry-form'];form.children={'[type="submit"]':prepareButton};
 form.elements=Object.fromEntries(Object.entries({name:'Sample Visitor',kind:'7-Day Website',idea:'A clear website for my small business.',budget:'Not sure yet',timing:'Just exploring',users:'',revenue:'',funding:'',audience:'',homepage:''}).map(([name,value])=>[name,new Element(value)]));
 const kindRadios=[...Object.values(offerLabels),'Still figuring it out'].map(value=>{const radio=new Element(value);radio.parentLabel=extraLabelIds[value]?elements[extraLabelIds[value]]:new Element();return radio;});
 form.querySelectorAll=selector=>selector==='input[name="kind"]'?kindRadios:[];
 elements['enquiry-offer-title'].textContent='Which offer fits what you need?';elements['enquiry-guide-note'].hidden=true;
 form.reportValidity=()=>Object.values(form.elements).every(input=>input.reportValidity());
 elements['reply-email'].value='visitor@example.com';elements['reply-email'].emailField=true;
 elements['direct-enquiry'].reportValidity=()=>elements['reply-email'].reportValidity();
 const calls=[],copied=[],timers=new Map();let nextTimer=0;
 const registeredTools=[];
 const document={getElementById:id=>elements[id],readyState:'interactive',modelContext:{registerTool:tool=>{registeredTools.push(tool);}}},windowListeners={};
 const window={location:pageURL?{href:pageURL}:undefined,AYUSH_CONTACT:config,matchMedia:()=>({matches:false}),addEventListener:(name,handler)=>{(windowListeners[name]??=[]).push(handler);},setTimeout:callback=>{const id=++nextTimer;timers.set(id,callback);return id;},clearTimeout:id=>timers.delete(id)};
 const context=vm.createContext({document,window,URL,FormData:Fields,AbortController,RadioNodeList:class{},navigator:{clipboard:{writeText:async message=>copied.push(message)}},fetch:async(url,options)=>{calls.push({url,options});return handler(url,options);}});
 vm.runInContext(source,context);
 return {elements,kindRadios,prepareButton,calls,copied,timers,registeredTools,load:()=>{for(const handler of windowListeners.load||[])handler();},prepare:()=>form.dispatch('submit'),send:()=>elements['direct-enquiry'].dispatch('submit')};
}

check(html.indexOf('contact-config.js')<html.indexOf('app.js'),'Config loads before the application.');
check(/type="submit" disabled>Put it into an email/.test(html),'Main submit remains disabled without its handler.');
check(/id="send-enquiry" type="submit" disabled/.test(html),'Optional direct send stays disabled without its handler.');
check(/<noscript>[\s\S]*Email Ayush directly/.test(html),'Email fallback exists without JavaScript.');
check(JSON.stringify([...html.matchAll(/<input type="radio" name="kind" value="([^"]+)"/g)].map(match=>match[1].replace(/&amp;/g,'&')).sort())===JSON.stringify([...Object.values(offerLabels),'Still figuring it out'].sort()),'The harness radio labels match every real HTML offer and the honest unsure choice.');
check(/id="enquiry-guide-note"[^>]*hidden>[\s\S]*?<a href="pricing\/">Change it in the guide/.test(html),'Guided contact includes an initially hidden, usable route back to the guide.');

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
