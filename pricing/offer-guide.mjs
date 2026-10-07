import {questions,offers,route,offerFromHash,enquiryHref} from './offer-guide-model.mjs?v=21';

const byId=id=>document.getElementById(id);
const app=byId('guide-app'),catalog=byId('all-offers');
const title=byId('guide-title'),hint=byId('guide-hint'),choices=byId('guide-choices');
const result=byId('guide-result'),back=byId('guide-back'),reset=byId('guide-reset');
let view={question:'start'},trail=[],history=[];

// Preserve complete terms, with useful headings when someone asks for detail.
const detailHeadings={
 'first-impression':['What the video covers','How to request it'],
 'product-review':['The review','If you continue to a Sprint','Payment','Founding clients'],
 'product-upgrade':['The look and user journeys','Technical fixes','The late-launch credit','What I need from you','Handover and support','The Check credit','Payment','Founding clients'],
 'monthly-partner':['Reserved time','The monthly promise','Three months at a time','Founding clients'],
 'first-product':['Your first release','The weekly-demo promise','What I need from you','Payment','Founding clients'],
 'website-week':['The website scope','The seven-day promise','What I need from you','Payment','Founding clients'],
 'launch-grow':['The combined scope','Price and payment','The promises','What I need from you','The Check credit','Costs and availability'],
 'lockdown-week':['The technical scope','What I need from you','Payment','Founding clients'],
 'look-week':['The visual direction','What I need from you','Payment','Founding clients'],
 'quarterly-checkin':['The review and fix','Price and eligibility'],
 conversation:['Establishing the scope','The next step']
};
const actionLabels={
 'first-impression':'Request the video','product-review':'Start with a Check',
 'product-upgrade':'Plan the Sprint','monthly-partner':'Talk about monthly work',
 'first-product':'Plan a first release','website-week':'Plan my website',
 'launch-grow':'Plan Launch & Grow','lockdown-week':'Fix the foundations',
 'look-week':'Plan a Look Week','quarterly-checkin':'Plan a check-in',conversation:'Let’s talk'
};

function element(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
function setTitle(text){title.replaceChildren();for(const part of text.split(/(Launch-Ready)/))title.append(part==='Launch-Ready'?element('span',part,'keep-together'):document.createTextNode(part));}
function saveView(){history.push({view:{...view},trail:[...trail]});}
function resetGuide(){catalog.open=false;view={question:'start'};trail=[];history=[];render(true);}
function showOffer(id,label){if(!Object.hasOwn(offers,id))return;catalog.open=false;saveView();view={offer:id};if(label)trail.push(label);render(true);}
function offerButton(label,id){const button=element('button',label);button.type='button';button.dataset.offer=id;button.addEventListener('click',()=>showOffer(id,label));return button;}
function disclosure(label,copy,actions){const detail=element('details');detail.append(element('summary',label),element('p',copy));const links=element('div');for(const [text,id] of actions)links.append(offerButton(text,id));detail.append(links);return detail;}

function followups(id){
 const target=byId('guide-followups');target.replaceChildren();
 if(id==='product-upgrade')target.append(disclosure('Could you help after launch, too?','If you want the Sprint followed by three months of ongoing work, compare the combined scope before reserving time.',[['See Launch & Grow','launch-grow']]));
 if(['product-upgrade','look-week','lockdown-week','monthly-partner'].includes(id))target.append(disclosure('Prefer a smaller first step?','A paid Check gives you a diagnosis, a coded screen and a plan. The free video is only a first-use impression; it does not include a rebuild or code checks.',[['The Check · ₹20,000 / $500','product-review'],['A free first-impression video','first-impression']]));
 if(id==='product-review'){
  target.append(disclosure('What happens when I’m ready to make the changes?','The Check fee actually retained comes off the Sprint when booked within 30 days. Book within seven days and the Launch Kit is included free. We confirm the larger scope before you commit.',[['Explore the Sprint','product-upgrade']]));
  target.append(disclosure('Just want a first impression?','For a small outside look at a public app, the free video can be enough. It is not the three-day diagnosis or screen rebuild.',[['See the free video','first-impression']]));
 }
 if(id==='first-impression')target.append(disclosure('Want a deeper diagnosis?','The three-day Check adds ranked findings, a coded screen prototype and a written plan.',[['See the Check · ₹20,000 / $500','product-review']]));
 if(id==='monthly-partner'){
  target.append(disclosure('Reserve three months?','A prepaid quarter is ₹4.05 lakh / $9,450: up to 30 hours each month, onboarding waived, plus a monthly analytics review and three recommendations. Renewal and end terms are agreed in the quote.',[]));
  target.append(disclosure('Only need occasional attention?','A quarterly review and one small agreed fix is a lighter scope; it does not reserve ongoing development.',[['See the Quarterly Check-in','quarterly-checkin']]));
 }
 if(id==='quarterly-checkin')target.append(disclosure('Need someone to keep building?','Regular design and code uses a monthly backlog and reserved hours.',[['See Ship Every Week','monthly-partner']]));
 if(id==='launch-grow')target.append(disclosure('Only need the launch upgrade?','The Sprint can stand alone. You do not need to reserve three following months.',[['See the Sprint on its own','product-upgrade']]));
 if(['first-product','website-week'].includes(id))target.append(disclosure('Not sure the scope fits yet?','Tell me what you want to make before committing to a fixed project.',[['Start with a scope conversation','conversation']]));
 target.hidden=!target.childElementCount;
}

function renderResult(){
 const offer=offers[view.offer];
 setTitle(offer.name);hint.textContent=offer.summary;
 byId('guide-time').textContent=offer.time;byId('guide-time').hidden=false;
 choices.hidden=true;result.hidden=false;
 const [amount,period]=offer.price.split(' / ');
 byId('guide-price').replaceChildren(element('span',amount,'price-amount'));
 if(period)byId('guide-price').append(element('span',` / ${period}`,'price-period'));
 byId('guide-international').textContent=view.offer==='first-impression'?'':view.offer==='conversation'?'Price agreed after we understand the work.':`International ${offer.international}`;
 byId('guide-essential').textContent=offer.essential;
 const enquiry=byId('guide-enquiry');
 const arrow=element('span','↗','action-arrow');arrow.setAttribute('aria-hidden','true');
 enquiry.replaceChildren(element('span',actionLabels[view.offer]||offer.cta),arrow);enquiry.href=enquiryHref(view.offer,view.audience);
 const list=byId('guide-includes');list.replaceChildren(...offer.includes.map(text=>element('li',text)));
 const detail=byId('guide-detail');detail.open=false;
 byId('guide-detail-copy').replaceChildren(...offer.detail.map((text,index)=>{
  const section=element('section',undefined,'guide-term');
  const heading=detailHeadings[view.offer]?.[index];
  if(heading)section.append(element('h3',heading));
  section.append(element('p',text));return section;
 }));
 const scope=byId('guide-scope-link');scope.hidden=!offer.scopeHref;
 if(offer.scopeHref){scope.href=offer.scopeHref;scope.textContent=view.offer==='launch-grow'?'Read the Sprint plan ↗':'Read the complete plan ↗';}else scope.removeAttribute('href');
 const proof=byId('guide-proof');proof.replaceChildren();
 const website=view.offer==='website-week';
 const example=element('a',website?'See a website concept ↗':'Leetify, designed & built solo ↗');
 example.href=website?(view.audience==='cafe'?'../work/side-note/':'../work/second-nature/'):'../leetify/';
 proof.append(example,element('span',website?'Self-initiated work for a fictional business.':'A real, shipped product.'));proof.hidden=false;
 followups(view.offer);
}

function render(focus=false){
 back.hidden=!history.length&&!view.offer;reset.hidden=!history.length&&!view.offer;
 app.dataset.view=view.offer?'result':'question';
 app.dataset.offer=view.offer||'';
 byId('guide-trail').textContent=trail.at(-1)||'';
 if(view.offer)renderResult();
 else{
  const question=questions[view.question];
  setTitle(question.prompt);hint.textContent=question.hint;
  byId('guide-time').hidden=true;result.hidden=true;choices.hidden=false;choices.replaceChildren();
  byId('guide-proof').hidden=true;
  for(const choice of question.choices){
   const button=element('button',undefined,'guide-choice');button.type='button';button.dataset.choice=choice.id;
   const text=element('span');text.append(element('span',choice.label,'choice-label'),element('span',choice.description,'choice-description'));
   const arrow=element('span','↗','choice-arrow');arrow.setAttribute('aria-hidden','true');button.append(text,arrow);
   button.addEventListener('click',()=>{
    const next=route(view.question,choice.id);catalog.open=false;saveView();trail.push(choice.label);
    view=next.offer?{offer:next.offer,...(next.audience?{audience:next.audience}:{})}:{question:next.next};
    render(true);
   });choices.append(button);
  }
 }
 if(focus){title.focus({preventScroll:true});app.scrollIntoView({behavior:'instant',block:'start'});}
}

back.addEventListener('click',()=>{catalog.open=false;const previous=history.pop();if(previous){view=previous.view;trail=previous.trail;render(true);}else resetGuide();});
reset.addEventListener('click',resetGuide);
byId('guide-all-offers').addEventListener('click',event=>{event.preventDefault();catalog.open=true;catalog.scrollIntoView({behavior:'instant',block:'start'});catalog.querySelector('summary').focus({preventScroll:true});});

function openDirectOffer(){const id=offerFromHash(location.hash);if(!id)return false;catalog.open=false;view={offer:id};trail=[];history=[];render(true);return true;}
render();app.hidden=false;byId('guide-fallback').hidden=true;
// Existing pricing links still reveal their exact offer without requiring the guide.
if(offerFromHash(location.hash)){
 if(document.readyState==='complete')openDirectOffer();else window.addEventListener('load',openDirectOffer,{once:true});
}
// Native catalog anchors have their own namespace. Legacy offer hashes belong
// to the guide even if the browser has opened a containing details element.
window.addEventListener('hashchange',openDirectOffer);
if(location.hash==='#all-offers')catalog.open=true;
