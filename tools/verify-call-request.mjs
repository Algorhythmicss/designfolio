// Network-free checks for the separate, unreserved Google Meet request draft.
// Run: node tools/verify-call-request.mjs
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('../call-request.js',import.meta.url),'utf8');
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
let checks=0;
function check(value,message){assert.ok(value,message);checks++;}
class Element{
 constructor(value=''){this.value=value;this.hidden=false;this.disabled=false;this.open=false;this.isConnected=true;this.listeners={};this.validity='';this.focusCount=0;}
 addEventListener(type,listener){(this.listeners[type]??=[]).push(listener);}
 async dispatch(type,extra={}){const event={target:this,currentTarget:this,preventDefault(){this.prevented=true;},...extra};for(const listener of this.listeners[type]||[])await listener(event);return event;}
 setCustomValidity(message){this.validity=message;}
 reportValidity(){return !this.validity&&(!this.required||!!this.value)&&(!this.emailField||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value))&&(!this.min||this.value>=this.min);}
 focus(){this.focusCount++;}select(){this.selected=true;}scrollIntoView(){}
 showModal(){this.open=true;this.openCount=(this.openCount||0)+1;}
 close(){this.open=false;this.dispatch('close');}
 getBoundingClientRect(){return {left:10,right:110,top:10,bottom:110};}
 querySelector(selector){return this.children[selector];}
}
function harness({booking='mailto:ayushhhudd@gmail.com?subject=A%20Google%20Meet',now='2026-10-07T10:00:00Z',clipboardFails=false}={}){
 let clock=Date.parse(now),networkCalls=0,storageCalls=0;
 class ClockDate extends Date{constructor(...args){super(...(args.length?args:[clock]));}static now(){return clock;}}
 const ids=['call-dialog','contact-booking','call-form','call-result','call-name','call-email','call-date','call-hour','call-minute','call-context','call-draft','call-open-email','call-status','call-close','call-prepare','call-copy','call-edit','email-draft','enquiry-form'];
 const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
 elements['contact-booking'].href=booking;elements['contact-booking'].textContent='Arrange a Google Meet';elements['call-result'].hidden=true;elements['call-prepare'].disabled=true;
 for(const [id,value] of Object.entries({'call-name':'Sample Visitor','call-email':'visitor@example.com','call-date':'2026-10-08','call-hour':'17','call-minute':'00','call-context':'A website for my business.'})){elements[id].value=value;elements[id].required=id!=='call-context';}
 elements['call-email'].emailField=true;
 elements['call-form'].reportValidity=()=>['call-name','call-email','call-date','call-hour','call-minute'].every(id=>elements[id].reportValidity());
 elements['call-result'].children={'h3':new Element()};
 elements['email-draft'].value='An edited project draft, kept separately.';elements['enquiry-form'].hidden=true;
 const copied=[];
 const context=vm.createContext({Date:ClockDate,Intl,URL,console,document:{getElementById:id=>elements[id]},navigator:{clipboard:{writeText:async message=>{if(clipboardFails)throw new Error('Clipboard unavailable');copied.push(message);}}},fetch:()=>{networkCalls++;throw new Error('No network allowed');},localStorage:{setItem(){storageCalls++;throw new Error('No storage allowed');}}});
 vm.runInContext(source,context);
 return {elements,context,copied,get networkCalls(){return networkCalls;},get storageCalls(){return storageCalls;},setClock:value=>{clock=Date.parse(value);},validate:(date,time,now=clock)=>context.validateMeetRequest(date,time,now),prepare:()=>elements['call-form'].dispatch('submit')};
}

check(html.indexOf('app.js?v=16.2')<html.indexOf('call-request.js?v=16.3'),'Call handler runs after the existing contact configuration handler.');
check(/id="call-prepare"[^>]*type="submit" disabled/.test(html),'Call preparation stays disabled until its interception exists.');
check(!/<input[^>]*type="time"/.test(html),'Ambiguous native time segments are absent from the request form.');
for(const id of ['call-hour','call-minute'])check(new RegExp(`<select[^>]*id="${id}"[^>]*required><option value="">`).test(html),`Explicit required ${id} selection starts empty.`);
const optionValues=id=>[...html.match(new RegExp(`<select[^>]*id="${id}"[^>]*>(.*?)</select>`,'s'))[1].matchAll(/<option value="([^"]*)">/g)].map(match=>match[1]);
check(JSON.stringify(optionValues('call-hour'))===JSON.stringify(['',...Array.from({length:7},(_,i)=>String(i+17))]),'Only the seven evening hours are selectable.');
check(JSON.stringify(optionValues('call-minute'))===JSON.stringify(['',...Array.from({length:60},(_,i)=>String(i).padStart(2,'0'))]),'Every minute remains available without assuming an empty selection means 00.');
check(/role="group" aria-labelledby="call-time-label"/.test(html)&&/for="call-hour">Hour/.test(html)&&/for="call-minute">Minute/.test(html),'Time group and both native selectors have explicit accessible labels.');
check(/Need a time before 5pm\?[\s\S]*mailto:ayushhhudd@gmail.com\?subject=A%20Google%20Meet%20before/.test(html),'Earlier-time email fallback has the correct recipient.');
check(/No slot is reserved here/.test(html),'The visible introduction distinguishes a request from a booking.');

{
 const h=harness();
 check(!h.elements['call-prepare'].disabled&&h.elements['contact-booking'].textContent==='Request a Google Meet','Email fallback gets an enabled request panel.');
 check(h.context.assembleMeetTime('21','30')==='21:30','Explicit 9pm and minute 30 assemble to exactly 21:30.');
 for(const [hour,minute] of [['16','30'],['24','00'],['09','30'],['','30'],['21',''],['21','0'],['21','60'],['21','30:00'],['21',' 30'],[21,'30'],['21',30]])check(h.context.assembleMeetTime(hour,minute)==='',`Invalid or unselected time parts cannot assemble: ${hour} ${minute}`);
 check(!h.validate('2026-10-08','16:59').ok,'A request before 5pm IST is rejected.');
 check(h.validate('2026-10-08','17:00').ok,'A future request at 5pm IST is accepted.');
 check(h.validate('2026-10-08','23:59').ok,'No unrequested evening end time is imposed.');
 check(h.validate('2026-10-08','17:00').instant===Date.parse('2026-10-08T11:30:00Z'),'IST selection maps to the correct UTC instant.');
 for(const [date,time] of [['','17:00'],['2026-02-31','17:00'],['2026-02-29','17:00'],['2026-13-01','17:00'],['2026-10-08',''],['2026-10-08','24:00'],['2026-10-08','17:60'],['2026-10-08','5pm'],['2026-10-08T00:00','17:00']])check(!h.validate(date,time).ok,`Malformed or non-existent selection rejected: ${date} ${time}`);
 check(h.validate('2028-02-29','17:00').ok,'A valid future leap day is accepted.');
 check(!h.validate('2026-10-06','18:00').ok,'A past date is rejected.');
 h.setClock('2026-10-07T12:00:00Z');
 check(!h.validate('2026-10-07','17:00').ok&&h.validate('2026-10-07','18:00').ok,'Same-day requests compare against the present IST time.');
 check(!h.validate('2026-10-07','17:30').ok,'An instant equal to the current time is rejected.');
 h.setClock('2026-10-07T18:45:00Z');
 check(h.context.meetTodayIST()==='2026-10-08','The date minimum follows IST midnight, not UTC midnight.');
 h.setClock('2026-12-31T18:45:00Z');
 check(h.context.meetTodayIST()==='2027-01-01','The IST date minimum handles year rollover.');
}
{
 const h=harness();const projectDraft=h.elements['email-draft'].value;
 const click=await h.elements['contact-booking'].dispatch('click');
 check(click.prevented&&h.elements['call-dialog'].open&&h.elements['call-date'].min==='2026-10-07','Request link opens the modal and updates the IST date minimum.');
 check(h.elements['email-draft'].value===projectDraft&&h.elements['enquiry-form'].hidden,'Opening call controls preserves the existing project flow.');
 await h.prepare();
 check(h.elements['call-form'].hidden&&!h.elements['call-result'].hidden,'A valid request opens its own editable draft.');
 const draft=h.elements['call-draft'].value;
 check(draft.includes('8 October 2026')&&draft.includes('5:00 pm IST (UTC+5:30)')&&draft.includes('visitor@example.com'),'Draft includes the chosen date, explicitly labelled IST time and intended reply address.');
 check(draft.includes('not a reserved slot')&&h.elements['call-status'].textContent.includes('Nothing has been sent'),'Prepared draft never claims sending or booking.');
 check(h.elements['call-open-email'].href.startsWith('mailto:ayushhhudd@gmail.com?')&&h.elements['call-open-email'].href.includes(encodeURIComponent(draft)),'Email link contains the reviewed request and correct recipient.');
 check(h.networkCalls===0&&h.storageCalls===0,'Preparation transmits and persists nothing.');
 check(h.elements['email-draft'].value===projectDraft,'Preparing the call cannot replace an edited project draft.');
 h.elements['call-draft'].value+='\nI can also do Friday.';await h.elements['call-draft'].dispatch('input');
 check(h.elements['call-open-email'].href.includes(encodeURIComponent('I can also do Friday.')),'Email link follows edits to the call draft.');
 await h.elements['call-copy'].dispatch('click');
 check(h.copied[0]===h.elements['call-draft'].value,'Copy fallback preserves the edited call request.');
 await h.elements['call-close'].dispatch('click');
 check(!h.elements['call-dialog'].open&&h.elements['contact-booking'].focusCount===1,'Closing restores focus to the request link.');
 await h.elements['contact-booking'].dispatch('click');
 check(!h.elements['call-result'].hidden&&h.elements['call-draft'].value.endsWith('I can also do Friday.'),'Reopening preserves the reviewed draft.');
 await h.elements['call-dialog'].dispatch('cancel');
 check(!h.elements['call-dialog'].open&&h.elements['contact-booking'].focusCount===2,'Escape closes and restores focus.');
 await h.elements['contact-booking'].dispatch('click');
 await h.elements['call-dialog'].dispatch('click',{clientX:0,clientY:0});
 check(!h.elements['call-dialog'].open,'Clicking outside the dialog closes it.');
 await h.elements['contact-booking'].dispatch('click');
 await h.elements['call-dialog'].dispatch('click',{clientX:50,clientY:50});
 check(h.elements['call-dialog'].open,'Clicking the dialog surface does not close it.');
 await h.elements['call-edit'].dispatch('click');
 check(!h.elements['call-form'].hidden&&h.elements['call-name'].value==='Sample Visitor'&&h.elements['call-context'].value==='A website for my business.','Back to details preserves original entries.');
 h.setClock('2026-10-09T10:00:00Z');await h.prepare();
 check(!h.elements['call-form'].hidden&&!!h.elements['call-date'].validity,'Submission rechecks the current clock rather than trusting when the panel opened.');
}
for(const field of ['call-name','call-email','call-date','call-hour','call-minute']){
 const h=harness();h.elements[field].value=field==='call-name'?'   ':field==='call-email'?'not-an-email':'';await h.prepare();
 check(!h.elements['call-form'].hidden&&h.elements['call-result'].hidden,`Invalid required field never prepares a request: ${field}`);
}
{
 const h=harness();h.elements['call-date'].value='2026-10-14';h.elements['call-hour'].value='21';h.elements['call-minute'].value='30';await h.prepare();
 check(h.elements['call-form'].hidden&&h.elements['call-draft'].value.includes('14 October 2026 at 9:30 pm IST'),'The reported future 14 October 9:30pm request prepares the correctly timed draft.');
 check(h.networkCalls===0&&h.storageCalls===0,'The regression request creates no message delivery or reserved appointment.');
}
for(const [hour,minute] of [['16','30'],['21',''],['21','60'],['21','3'],['21','30:00']]){
 const h=harness();h.elements['call-hour'].value=hour;h.elements['call-minute'].value=minute;await h.prepare();
 check(!h.elements['call-form'].hidden&&h.elements['call-result'].hidden&&!h.elements['call-draft'].value,`Tampered or incomplete choices cannot create a draft: ${hour} ${minute}`);
 const field=hour==='16'?h.elements['call-hour']:h.elements['call-minute'];
 check(!!field.validity,'The invalid selector receives a meaningful correction prompt.');
 h.elements['call-hour'].value='21';h.elements['call-minute'].value='30';await field.dispatch('change');
 check(!h.elements['call-hour'].validity&&!h.elements['call-minute'].validity,'A native change event clears the prior time error.');
 await h.prepare();check(h.elements['call-form'].hidden&&h.elements['call-draft'].value.includes('9:30 pm IST'),'Correcting the selector recovers without closing or resetting the panel.');
}
{
 const h=harness({clipboardFails:true});await h.prepare();await h.elements['call-copy'].dispatch('click');
 check(h.elements['call-draft'].selected&&h.elements['call-status'].textContent.includes('Select and copy'),'Clipboard failure keeps manual copy available.');
}
{
 const h=harness({booking:'https://calendar.app.google/owner-booking'});
 const event=await h.elements['contact-booking'].dispatch('click');
 check(!event.prevented&&!h.elements['call-dialog'].open,'A configured real booking schedule is not intercepted.');
}
console.log(`${checks} call-request boundary checks passed. No message, appointment, network request or storage write was created.`);
