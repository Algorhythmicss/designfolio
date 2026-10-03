"use strict";
const artists = [
 {id:'asha',name:'Asha Vale',day:'sat',type:'music',kind:'ALT-SOUL / LIVE',time:'17:00—18:00',stage:'The Courtyard',feeling:'For the moment the sun starts to slip away.',bio:'An intimate voice against warm bass, loose drums and a little space between the notes. Asha brings a full band to the courtyard for an unhurried sunset set.'},
 {id:'soft',name:'Soft Current',day:'sat',type:'music',kind:'LIVE ELECTRONICS',time:'18:30—19:30',stage:'The Shed',feeling:'A slow pulse that turns into a room full of movement.',bio:'A live electronic duo building tracks from field recordings, wandering synth lines and broken rhythms. Come close enough to see the sounds being made.'},
 {id:'koi',name:'Koi Radio',day:'sat',type:'music',kind:'GLOBAL GROOVES / DJ',time:'20:00—22:00',stage:'The Courtyard',feeling:'Music from everywhere. A dance floor right here.',bio:'A wide-ranging selection of disco, house and unexpected records, connected by warm percussion. Two hours to let a new favourite find you.'},
 {id:'cyan',name:'Cyan Field',day:'sat',type:'art',kind:'LIGHT / INSTALLATION',time:'14:00—22:00',stage:'The Garden',feeling:'An ordinary corner, quietly becoming something else.',bio:'Walk through suspended colour and shifting shadows. This open installation changes with the daylight; return after sunset and it becomes a different experience. No reservation needed.'},
 {id:'mira',name:'Mira Sol',day:'sun',type:'music',kind:'JAZZ / LEFTFIELD POP',time:'16:30—17:30',stage:'The Courtyard',feeling:'A Sunday afternoon with the windows wide open.',bio:'Mira folds conversational songwriting into nimble jazz arrangements. Bring a friend, find a patch of shade and settle into the afternoon.'},
 {id:'parallel',name:'Parallel Lines',day:'sun',type:'music',kind:'INDIE / LIVE BAND',time:'18:00—19:00',stage:'The Courtyard',feeling:'Guitars for getting wonderfully carried away.',bio:'A four-piece moving between spacious melodies and restless, driving rhythms. A live set made for the shift from late afternoon into evening.'},
 {id:'oru',name:'Oru',day:'sun',type:'music',kind:'PERCUSSIVE HOUSE / DJ',time:'20:00—22:00',stage:'The Shed',feeling:'One last dance, and then another.',bio:'Interlocking percussion, deep bass and patient builds. Oru closes the weekend with a set that moves between gentle focus and shared release.'},
 {id:'paper',name:'Paper Club',day:'sun',type:'art',kind:'PRINT / OPEN WORKSHOP',time:'14:00—17:00',stage:'The Garden',feeling:'Something made by you, to take a little of this home.',bio:'Drop in, choose a shape, ink a block and make a small print. All materials are included; no experience needed. Allow 20–30 minutes. Places at the table open as people finish.'}
];
const passes={sat:{name:'Saturday pass',date:'Saturday, 06 February 2027',short:'06 FEBRUARY / SATURDAY',price:2400},sun:{name:'Sunday pass',date:'Sunday, 07 February 2027',short:'07 FEBRUARY / SUNDAY',price:2400},weekend:{name:'The whole weekend',date:'06–07 February 2027',short:'06 + 07 FEBRUARY / BOTH DAYS',price:3900}};
const money=n=>'₹'+n.toLocaleString('en-IN');
let programmeDay='all',programmeType='all',selectedPass='weekend',quantity=1;
const grid=document.getElementById('artist-grid');
const bookingDialog=document.getElementById('booking-dialog');
let activeSurface=null,rootTrigger=null,hasBookingDraft=false;
const surfaceStack=[];
function openSurface(id,keepCurrent=false){
 const next=document.getElementById(id);if(!next||next===activeSurface)return;
 // Return to an existing parent instead of adding a circular navigation entry.
 const parentIndex=surfaceStack.findIndex(entry=>entry.dialog===next);
 if(parentIndex>=0&&!keepCurrent){
  activeSurface?.close();const entry=surfaceStack[parentIndex];surfaceStack.splice(parentIndex);activeSurface=next;next.showModal();next.scrollTop=entry.scroll;entry.trigger?.focus({preventScroll:true});return;
 }
 if(activeSurface){surfaceStack.push({dialog:activeSurface,trigger:document.activeElement,scroll:activeSurface.scrollTop});activeSurface.close();}
 else rootTrigger=document.activeElement;
 activeSurface=next;next.showModal();next.scrollTop=0;
}
function closeSurface(exitAll=false){
 if(!activeSurface)return;activeSurface.close();activeSurface=null;
 if(!exitAll&&surfaceStack.length){const entry=surfaceStack.pop();activeSurface=entry.dialog;activeSurface.showModal();activeSurface.scrollTop=entry.scroll;entry.trigger?.focus({preventScroll:true});}
 else{surfaceStack.length=0;hasBookingDraft=false;if(['#programme','#visit'].includes(location.hash))history.replaceState(null,'',location.pathname+location.search);const target=rootTrigger?.isConnected&&!rootTrigger.closest('dialog')?rootTrigger:document.querySelector('.floating-header button');target.focus({preventScroll:true});rootTrigger=null;}
}
function showTickets(){
 if(activeSurface)closeSurface(true);
 history.replaceState(null,'',location.pathname+location.search+'#tickets');
 document.getElementById('tickets').scrollIntoView({behavior:'instant',block:'start'});
 document.getElementById('tickets-title').focus({preventScroll:true});
}
function filteredArtists(){return artists.filter(a=>(programmeDay==='all'||a.day===programmeDay)&&(programmeType==='all'||a.type===programmeType));}
function renderProgramme(){
 const visible=filteredArtists();
 grid.innerHTML=visible.map(a=>`<button class="artist-row" data-artist="${a.id}" aria-label="Explore ${a.name}, ${a.day==='sat'?'Saturday':'Sunday'}, ${a.kind.toLowerCase()}"><span class="artist-name">${a.name}</span><span class="artist-kind">${a.kind}</span><span class="artist-time">${a.day==='sat'?'SAT 06':'SUN 07'} · ${a.time}<small>${a.stage}</small></span><span class="artist-arrow" aria-hidden="true">↗</span></button>`).join('');
 document.getElementById('programme-count').textContent=`${visible.length} ${visible.length===1?'encounter':'encounters'} ${programmeDay==='all'?'across the weekend':programmeDay==='sat'?'on Saturday':'on Sunday'}`;
 document.querySelectorAll('[data-day]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.day===programmeDay)));
 document.getElementById('type-filter').value=programmeType;
}
function showArtist(id){
 const a=artists.find(a=>a.id===id);if(!a)return;
 document.getElementById('artist-detail').innerHTML=`<p class="whisper">${a.kind}</p><h2 id="artist-dialog-title">${a.name}</h2><div class="detail-meta">${a.day==='sat'?'SATURDAY 06':'SUNDAY 07'} FEBRUARY · ${a.time} IST<br>${a.stage.toUpperCase()}</div><p class="detail-feeling">${a.feeling}</p><p>${a.bio}</p><p>Included with the ${a.day==='sat'?'Saturday':'Sunday'} pass and weekend pass.</p><button class="quiet-link" data-artist-pass="${a.day}">Choose this day’s pass ↗</button>`;
 openSurface('artist-dialog');
}
function updateBooking(){
 const p=passes[selectedPass];
 document.getElementById('summary-days').textContent=p.short;
 document.getElementById('summary-name').textContent=p.name;
 document.getElementById('summary-quantity').textContent=`${quantity} ${quantity===1?'pass':'passes'} × ${money(p.price)}`;
 document.getElementById('summary-total').textContent=money(p.price*quantity);
 document.getElementById('quantity-output').textContent=String(quantity);
 document.getElementById('quantity-minus').disabled=quantity===1;document.getElementById('quantity-plus').disabled=quantity===6;
}
function startBooking(passId,count=1){
 if(!Object.hasOwn(passes,passId)||!Number.isInteger(count)||count<1||count>6)throw new Error('Choose a valid pass and 1–6 guests.');
 selectedPass=passId;if(!hasBookingDraft)quantity=count;hasBookingDraft=true;
 document.getElementById('booking-form').hidden=false;document.getElementById('booking-success').hidden=true;
 updateBooking();openSurface('booking-dialog');
}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-tickets'))showTickets();
 else if(b.hasAttribute('data-open'))openSurface(b.dataset.open);
 else if(b.hasAttribute('data-close'))closeSurface();
 else if(b.hasAttribute('data-exit'))closeSurface(true);
 else if(b.hasAttribute('data-pass'))startBooking(b.dataset.pass);
 else if(b.hasAttribute('data-artist'))showArtist(b.dataset.artist);
 else if(b.hasAttribute('data-artist-pass'))startBooking(b.dataset.artistPass);
});
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('cancel',e=>{e.preventDefault();closeSurface();}));
document.querySelectorAll('[data-day]').forEach(b=>b.addEventListener('click',()=>{programmeDay=b.dataset.day;renderProgramme();}));
document.getElementById('type-filter').addEventListener('change',e=>{programmeType=e.target.value;renderProgramme();});
document.getElementById('quantity-minus').addEventListener('click',()=>{quantity=Math.max(1,quantity-1);updateBooking();});
document.getElementById('quantity-plus').addEventListener('click',()=>{quantity=Math.min(6,quantity+1);updateBooking();});
document.getElementById('change-pass').addEventListener('click',()=>{openSurface('passes-dialog',true);});
document.getElementById('read-terms').addEventListener('click',()=>openSurface('policy-dialog'));
document.getElementById('booking-form').addEventListener('submit',e=>{
 e.preventDefault();const nameInput=document.getElementById('guest-name');nameInput.setCustomValidity(nameInput.value.trim()?'':'Please enter your name.');if(!e.currentTarget.reportValidity())return;
 document.getElementById('success-name').textContent=`Made for ${nameInput.value.trim()}.`;
 document.getElementById('success-pass').textContent=passes[selectedPass].name;
 document.getElementById('success-dates').textContent=passes[selectedPass].date+' · 2 pm—10 pm';
 document.getElementById('success-quantity').textContent=`${quantity} ${quantity===1?'guest':'guests'} · ${money(passes[selectedPass].price*quantity)} total (demo)`;
 e.currentTarget.hidden=true;document.getElementById('booking-success').hidden=false;document.querySelector('#booking-success h3').focus();
});
document.getElementById('guest-name').addEventListener('input',e=>e.target.setCustomValidity(''));
function applyHash(){const mapping={'#programme':'programme-dialog','#visit':'visit-dialog'};if(mapping[location.hash])openSurface(mapping[location.hash]);else {if(activeSurface)closeSurface(true);if(location.hash==='#top')document.getElementById('experience').scrollIntoView();}}
window.addEventListener('hashchange',applyHash);
const scenes=[...document.querySelectorAll('[data-scene]')],worlds=[...document.querySelectorAll('[data-world]')];
let scrollScheduled=false;
function updateWorld(){const middle=innerHeight*.28;let current=0;scenes.forEach((scene,i)=>{if(scene.getBoundingClientRect().top<=middle)current=Number(scene.dataset.scene);});worlds.forEach((world,i)=>world.classList.toggle('is-active',i===current));scrollScheduled=false;}
window.addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(updateWorld);}},{passive:true});window.addEventListener('resize',updateWorld);
document.getElementById('change-pass-options').append(document.querySelector('#tickets .pass-list').cloneNode(true));
renderProgramme();updateWorld();applyHash();
// Browser agents use the same visible programme and demo checkout as visitors.
const context=document.modelContext;
if(context?.registerTool){
 const lifecycle=new AbortController();
 const register=tool=>{try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
 register({name:'read_festival_programme',title:'Read festival programme',description:'Read the fictional festival programme and pass prices. Does not book or reserve anything.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:input=>{if(input&&Object.keys(input).length)throw new Error('This tool accepts no fields.');return{artists,passes,fictional:true};}});
 register({name:'stage_demo_ticket',title:'Choose a demo ticket',description:'Open the demo checkout with a pass and guest count. Does not submit details, take payment, reserve tickets or send email.',inputSchema:{type:'object',properties:{pass:{type:'string',enum:['sat','sun','weekend']},guests:{type:'integer',minimum:1,maximum:6}},required:['pass','guests'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{if(!input||typeof input!=='object'||Object.keys(input).some(k=>!['pass','guests'].includes(k)))throw new Error('Use only pass and guests.');startBooking(input.pass,input.guests);quantity=input.guests;updateBooking();return{pass:selectedPass,guests:quantity,total:passes[selectedPass].price*quantity,currency:'INR',status:'demo_checkout_open',bookingCreated:false};}});
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
