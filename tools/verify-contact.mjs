// Network-free boundary checks for the reviewed-draft contact flow.
// Run with: node tools/verify-contact.mjs
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('../app.js',import.meta.url),'utf8');
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
let checks=0;
function check(condition,message){assert.ok(condition,message);checks++;}
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
}
class Fields{
 constructor(form){this.values=new Map(form?Object.entries(form.elements).map(([name,input])=>[name,input.value]):[]);}
 get(name){return this.values.get(name);}
 append(name,value){this.values.set(name,value);}
}
function harness(config={},handler=async()=>({ok:true,status:200}),pageURL=''){
 const ids=['contact-options','contact-whatsapp','contact-booking','about-dialog','about-work','enquiry-form','enquiry-result','email-draft','open-email','draft-status','contact-details','edit-brief','copy-brief','direct-enquiry','reply-email','send-enquiry','send-status','prepare-note','contact-disclosure','first-product-choice'];
 const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
 elements['first-product-choice'].hidden=true;elements['contact-whatsapp'].hidden=true;elements['direct-enquiry'].hidden=true;elements['send-enquiry'].disabled=true;elements['enquiry-result'].hidden=true;
 elements['about-dialog'].children={'[data-close]':new Element()};
 elements['enquiry-result'].children={'h3':new Element()};
 const prepareButton=new Element();prepareButton.disabled=true;
 const form=elements['enquiry-form'];form.children={'[type="submit"]':prepareButton};
 form.elements=Object.fromEntries(Object.entries({name:'Sample Visitor',kind:'Website in a Week',idea:'A clear website for my small business.',budget:'Not sure yet',timing:'Just exploring'}).map(([name,value])=>[name,new Element(value)]));
 form.reportValidity=()=>Object.values(form.elements).every(input=>input.reportValidity());
 elements['reply-email'].value='visitor@example.com';elements['reply-email'].emailField=true;
 elements['direct-enquiry'].reportValidity=()=>elements['reply-email'].reportValidity();
 const calls=[],copied=[],timers=new Map();let nextTimer=0;
 const document={getElementById:id=>elements[id],readyState:'interactive'},windowListeners={};
 const window={location:pageURL?{href:pageURL}:undefined,AYUSH_CONTACT:config,matchMedia:()=>({matches:false}),addEventListener:(name,handler)=>{(windowListeners[name]??=[]).push(handler);},setTimeout:callback=>{const id=++nextTimer;timers.set(id,callback);return id;},clearTimeout:id=>timers.delete(id)};
 const context=vm.createContext({document,window,URL,FormData:Fields,AbortController,RadioNodeList:class{},navigator:{clipboard:{writeText:async message=>copied.push(message)}},fetch:async(url,options)=>{calls.push({url,options});return handler(url,options);}});
 vm.runInContext(source,context);
 return {elements,prepareButton,calls,copied,timers,load:()=>{for(const handler of windowListeners.load||[])handler();},prepare:()=>form.dispatch('submit'),send:()=>elements['direct-enquiry'].dispatch('submit')};
}

check(html.indexOf('contact-config.js')<html.indexOf('app.js'),'Config loads before the application.');
check(/type="submit" disabled>Put it into an email/.test(html),'Main submit remains disabled without its handler.');
check(/id="send-enquiry" type="submit" disabled/.test(html),'Optional direct send stays disabled without its handler.');
check(/<noscript>[\s\S]*Email Ayush directly/.test(html),'Email fallback exists without JavaScript.');

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
for(const [id,label] of Object.entries({'product-review':'Product Review','product-upgrade':'Product Upgrade Sprint','monthly-partner':'Monthly Product Partner','first-product':'First Product Build','website-week':'Website in a Week'})){
 const h=harness({},undefined,`https://algorhythmicss.github.io/designfolio/?offer=${id}#contact`);
 check(h.elements['enquiry-form'].elements.kind.value===label&&h.elements['contact-details'].open,'Known pricing link selects its offer and opens the enquiry.');
 h.load();check(h.elements['enquiry-form'].lastScroll?.behavior==='instant'&&h.elements['enquiry-form'].lastScroll?.block==='start','After initial hash navigation, the selected enquiry is brought into view without a long page animation.');
 check(h.calls.length===0&&h.elements['enquiry-result'].hidden&&h.elements['email-draft'].value==='','Pricing navigation neither prepares a draft nor sends an enquiry.');
 check(h.elements['first-product-choice'].hidden===(id!=='first-product'),'First Product Build stays outside the homepage offer choices until requested.');
 await h.prepare();
 check(h.elements['email-draft'].value.includes(`I’m interested in your ${label}.`),'Reviewed email preserves the selected offer name.');
}
for(const id of ['unknown','constructor','__proto__','<script>alert(1)</script>']){
 const h=harness({},undefined,`https://algorhythmicss.github.io/designfolio/?offer=${encodeURIComponent(id)}#contact`);
 check(h.elements['enquiry-form'].elements.kind.value==='Website in a Week'&&h.calls.length===0&&h.elements['first-product-choice'].hidden,'Unknown or untrusted offer parameters do not select or expose an offer.');
}
check(!html.includes('Under ₹50,000'),'The retired low-budget option is absent.');
console.log(`${checks} contact boundary checks passed. All requests were stubbed; no email, WhatsApp message, or appointment was sent.`);
