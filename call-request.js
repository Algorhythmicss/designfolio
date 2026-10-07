'use strict';

// Explicit evening choices avoid ambiguous or partly entered native time segments.
function assembleMeetTime(hour,minute){
 if(typeof hour!=='string'||!/^(1[7-9]|2[0-3])$/.test(hour)||typeof minute!=='string'||!/^[0-5]\d$/.test(minute))return '';
 return `${hour}:${minute}`;
}

// Dates and times on this form always describe Ayush's time zone, not the visitor's.
function validateMeetRequest(date,time,now=Date.now()){
 if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date))return {ok:false,field:'date',message:'Choose a valid date.'};
 if(typeof time!=='string'||!/^\d{2}:\d{2}$/.test(time))return {ok:false,field:'time',message:'Choose a valid time in IST.'};
 const [year,month,day]=date.split('-').map(Number),[hour,minute]=time.split(':').map(Number);
 if(month<1||month>12||day<1||day>31)return {ok:false,field:'date',message:'Choose a valid date.'};
 if(hour>23||minute>59)return {ok:false,field:'time',message:'Choose a valid time in IST.'};
 const instant=Date.parse(`${date}T${time}:00+05:30`),local=new Date(instant+330*60000);
 if(!Number.isFinite(instant)||local.getUTCFullYear()!==year||local.getUTCMonth()+1!==month||local.getUTCDate()!==day)return {ok:false,field:'date',message:'Choose a valid date.'};
 if(hour<17)return {ok:false,field:'time',message:'Choose a time from 5pm onwards (17:00 IST), or email me for an earlier time.'};
 if(!Number.isFinite(now)||instant<=now)return {ok:false,field:'date',message:'Choose a date and time that are still in the future in IST.'};
 return {ok:true,instant};
}

function meetTodayIST(now=Date.now()){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now));
 const get=type=>parts.find(part=>part.type===type).value;
 return `${get('year')}-${get('month')}-${get('day')}`;
}

(()=>{
 const dialog=document.getElementById('call-dialog'),trigger=document.getElementById('contact-booking');
 if(!dialog||!trigger||typeof dialog.showModal!=='function'||!String(trigger.href).startsWith('mailto:'))return;
 const form=document.getElementById('call-form'),result=document.getElementById('call-result'),name=document.getElementById('call-name'),email=document.getElementById('call-email'),date=document.getElementById('call-date'),hour=document.getElementById('call-hour'),minute=document.getElementById('call-minute'),context=document.getElementById('call-context'),draft=document.getElementById('call-draft'),openEmail=document.getElementById('call-open-email'),status=document.getElementById('call-status');
 const recipient='ayushhhudd@gmail.com';let returnFocus=null,subject='A Google Meet request for Ayush';
 function updateEmail(){openEmail.href=`mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft.value)}`;}
 function close(){dialog.close();}
 trigger.textContent='Request a Google Meet';
 trigger.addEventListener('click',event=>{
  event.preventDefault();returnFocus=event.currentTarget;date.min=meetTodayIST();
  if(!dialog.open)dialog.showModal();
  if(!draft.value)dialog.scrollTop=0;
 });
 document.getElementById('call-close').addEventListener('click',close);
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 dialog.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});});
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();});
 form.addEventListener('submit',event=>{
  event.preventDefault();date.min=meetTodayIST();date.setCustomValidity('');hour.setCustomValidity('');minute.setCustomValidity('');name.setCustomValidity(name.value.trim()?'':'Please enter your name.');
  const selectedTime=assembleMeetTime(hour.value,minute.value),slot=validateMeetRequest(date.value,selectedTime);
  if(!slot.ok){
   if(slot.field==='time'){
    const hourIsValid=!!assembleMeetTime(hour.value,'00');
    (hourIsValid?minute:hour).setCustomValidity(hourIsValid?'Choose the minutes for your request.':'Choose an hour from 5pm onwards.');
   }else date.setCustomValidity(slot.message);
  }
  if(!form.reportValidity())return;
  const displayDate=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',day:'numeric',month:'long',year:'numeric'}).format(new Date(slot.instant));
  const displayTime=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(slot.instant));
  subject=`Google Meet request — ${displayDate}, ${displayTime} IST`;
  draft.value=`Hi Ayush,\n\nI’m ${name.value.trim()}. I’d like to request a Google Meet on ${displayDate} at ${displayTime} IST (UTC+5:30).\n\nMy reply email: ${email.value.trim()}${context.value.trim()?'\n\n'+context.value.trim():''}\n\nPlease confirm whether this works and share the Meet link. I understand this time is a request, not a reserved slot.\n\n${name.value.trim()}`;
  updateEmail();form.hidden=true;result.hidden=false;status.textContent='Your draft is ready. Nothing has been sent or reserved.';result.querySelector('h3').focus({preventScroll:true});result.scrollIntoView({block:'start'});
 });
 document.getElementById('call-prepare').disabled=false;
 function clearFieldErrors(){for(const field of [name,date,hour,minute])field.setCustomValidity('');}
 for(const field of [name,date,hour,minute])for(const event of ['input','change'])field.addEventListener(event,clearFieldErrors);
 draft.addEventListener('input',()=>{updateEmail();status.textContent='Draft updated. Nothing has been sent or reserved.';});
 openEmail.addEventListener('click',()=>{status.textContent='Review and send in your email app. This page cannot confirm delivery or reserve a time.';});
 document.getElementById('call-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(draft.value);status.textContent=`Message copied. Paste it into an email to ${recipient}.`;}catch{draft.focus();draft.select();status.textContent='Select and copy the message, then paste it into your email app.';}});
 document.getElementById('call-edit').addEventListener('click',()=>{result.hidden=true;form.hidden=false;date.min=meetTodayIST();name.focus({preventScroll:true});form.scrollIntoView({block:'start'});});
})();
