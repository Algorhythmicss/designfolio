import assert from 'node:assert/strict';
import {questions,offers,route,offerFromHash,enquiryHref} from '../pricing/offer-guide-model.mjs';

let checks=0;
const check=(name,run)=>{try{run();checks++;}catch(error){error.message=`${name}: ${error.message}`;throw error;}};
const offerIds=['first-impression','product-review','product-upgrade','monthly-partner','first-product','website-week','launch-grow','lockdown-week','look-week','quarterly-checkin','conversation'];

check('Latest menu is complete without retired offers',()=>assert.deepEqual(Object.keys(offers).sort(),offerIds.toSorted()));
check('Question set is bounded',()=>assert.deepEqual(Object.keys(questions).sort(),['start','app-need','app-focus','app-continuity','app-scope','idea-need','website-kind'].toSorted()));

const seenQuestions=new Set(),leafOffers=new Set(),paths=[];
function walk(id,path=[]){
 check(`No cycle at ${id}`,()=>assert.ok(!path.includes(id)));
 seenQuestions.add(id);
 const question=questions[id];
 for(const choice of question.choices){
  const transition=route(id,choice.id),nextPath=[...path,id];
  check(`Exactly one result for ${id}/${choice.id}`,()=>assert.equal(Number('next' in transition)+Number('offer' in transition),1));
  if(transition.next)walk(transition.next,nextPath);
  else {leafOffers.add(transition.offer);paths.push({path:[...nextPath,choice.id],offer:transition.offer,audience:transition.audience});check(`At most three decisions for ${id}/${choice.id}`,()=>assert.ok(nextPath.length<=3));}
 }
}
walk('start');
check('Every question is reachable',()=>assert.deepEqual([...seenQuestions].sort(),Object.keys(questions).sort()));
check('All primary offers are reachable; bundle is deliberate continuation',()=>assert.deepEqual([...leafOffers].sort(),offerIds.filter(id=>id!=='launch-grow').toSorted()));
check('Bundle does not become a forced first recommendation',()=>assert.ok(!leafOffers.has('launch-grow')));

const cases=[
 ['app-need','unsure',{offer:'product-review'}],
 ['app-need','first-look',{offer:'first-impression'}],
 ['app-scope','key-journeys',{offer:'product-upgrade'}],
 ['app-scope','whole-app',{offer:'conversation'}],
 ['app-scope','regulated',{offer:'conversation'}],
 ['app-focus','look',{offer:'look-week'}],
 ['app-focus','foundations',{offer:'lockdown-week'}],
 ['app-focus','other',{offer:'conversation'}],
 ['app-continuity','regular',{offer:'monthly-partner'}],
 ['app-continuity','occasional',{offer:'quarterly-checkin'}],
 ['idea-need','first-release',{offer:'first-product'}],
 ['idea-need','defining',{offer:'conversation'}],
 ['website-kind','clinic',{offer:'website-week',audience:'clinic'}],
 ['website-kind','studio',{offer:'website-week',audience:'studio'}],
 ['website-kind','cafe',{offer:'website-week',audience:'cafe'}],
 ['website-kind','other',{offer:'website-week'}]
];
for(const [question,choice,result] of cases)check(`Truthful route ${question}/${choice}`,()=>assert.deepEqual(route(question,choice),result));
check('No paid app Check or free walkthrough for an unbuilt idea',()=>assert.ok(questions['idea-need'].choices.every(choice=>!['product-review','first-impression'].includes(choice.offer))));
check('Business website does not route to app pricing',()=>assert.ok(questions['website-kind'].choices.every(choice=>choice.offer==='website-week')));

for(const value of ['unknown','__proto__','constructor','',null,undefined,{},1]){
 check(`Unknown question ${String(value)} rejects`,()=>assert.throws(()=>route(value,'app'),/Unknown offer question/));
 check(`Unknown choice ${String(value)} rejects`,()=>assert.throws(()=>route('start',value),/Unknown offer choice/));
 check(`Unknown enquiry ${String(value)} rejects`,()=>assert.throws(()=>enquiryHref(value),/Unknown enquiry offer/));
 check(`Unknown hash ${String(value)} is not a route`,()=>assert.equal(offerFromHash(value),null));
}
check('Valid choice in a different question cannot jump steps',()=>assert.throws(()=>route('start','regular'),/Unknown offer choice/));

for(const id of offerIds){
 const offer=offers[id];
 check(`${id} has display fields and three concrete inclusions`,()=>{
  for(const field of ['name','time','price','international','summary','fit','essential','cta','goal'])assert.ok(typeof offer[field]==='string'&&offer[field].length>0,field);
  assert.equal(offer.includes.length,3);
  assert.ok(offer.includes.every(item=>typeof item==='string'&&item.length>0));
  assert.ok(Array.isArray(offer.detail)&&offer.detail.length>0);
  assert.ok(offer.detail.every(item=>typeof item==='string'&&item.length>0));
 });
 check(`${id} recommendation is provisional`,()=>assert.match(offer.fit,/possible|starting point|optional continuation/i));
 check(`${id} goal is a whitelisted token`,()=>assert.equal(offer.goal,id));
 check(`${id} query is fixed and cannot change destination`,()=>assert.equal(enquiryHref(id),`../?offer=${id}&guided=1#contact`));
 check(`${id} legacy hash is safely resolved`,()=>assert.equal(offerFromHash(`#${id}`),id==='conversation'?null:id));
 check(`${id} bare fragment is safely resolved`,()=>assert.equal(offerFromHash(id),id==='conversation'?null:id));
 check(`${id} data is deeply immutable`,()=>{
  assert.ok(Object.isFrozen(offer)&&Object.isFrozen(offer.includes)&&Object.isFrozen(offer.detail));
  assert.throws(()=>{offer.price='Free';},TypeError);
 });
}
for(const audience of ['clinic','studio','cafe'])check(`Website context ${audience} retains correct price and safe enquiry`,()=>assert.equal(enquiryHref('website-week',audience),`../?offer=website-week&guided=1&audience=${audience}#contact`));
for(const audience of ['other','../','clinic&offer=first-product','<script>','',null,{},'https://example.com'])check(`Unrecognised audience ${String(audience)} rejects`,()=>assert.throws(()=>enquiryHref('website-week',audience),/Invalid website audience/));
for(const id of offerIds.filter(id=>id!=='website-week'))check(`Website audience cannot leak into ${id}`,()=>assert.throws(()=>enquiryHref(id,'clinic'),/Invalid website audience/));
for(const hash of ['#product-upgrade&offer=first-product','#%70roduct-upgrade','#conversation','#website-week?audience=clinic','#constructor','#//example.com','#product-upgrade#contact','javascript:alert(1)','https://example.com/#product-upgrade'])check(`Arbitrary hash ${hash} cannot become offer context`,()=>assert.equal(offerFromHash(hash),null));

const prices={
 'first-impression':['Free','Free'],
 'product-review':['₹20,000','$500'],
 'product-upgrade':['₹2.5 lakh','$6,000'],
 'monthly-partner':['₹1.5 lakh / month','$3,500 / month'],
 'first-product':['From ₹6 lakh','From $12,000'],
 'website-week':['₹60,000','$2,500'],
 'launch-grow':['₹6.5 lakh','$15,000'],
 'lockdown-week':['₹1 lakh','$2,500'],
 'look-week':['₹1.25 lakh','$3,000'],
 'quarterly-checkin':['₹40,000 / quarter','$1,000 / quarter']
};
for(const [id,price] of Object.entries(prices))check(`${id} retains the latest approved price`,()=>assert.deepEqual([offers[id].price,offers[id].international],price));
check('Free video requires an existing public product',()=>assert.match(offers['first-impression'].essential,/public product URL/));
check('Check guarantee does not promise integration',()=>{
 assert.match(offers['product-review'].essential,/Five actionable.*refunded/);
 assert.match(offers['product-review'].essential,/prototype.*integration is separate/);
});
check('Check credit uses retained payment, no double refunded credit',()=>{
 const text=offers['product-review'].detail.join(' ');assert.match(text,/actually paid, less refunds/);assert.match(text,/credited once/);assert.match(text,/30 days/);assert.match(text,/seven days.*Launch Kit/);assert.match(text,/refunded Check creates no credit/);
});
check('Sprint material cap and limits are initially visible',()=>{
 assert.match(offers['product-upgrade'].essential,/10%/);assert.match(offers['product-upgrade'].essential,/one-day replies/);assert.match(offers['product-upgrade'].essential,/Not a full rebuild or regulated-data/);assert.match(offers['product-upgrade'].fit,/three.*twelve/);
});
check('Sprint late-credit arithmetic and calendar stay exact',()=>{
 const text=offers['product-upgrade'].detail.join(' ');assert.match(text,/₹5,000 \/ \$150/);assert.match(text,/Monday–Friday/);assert.match(text,/₹25,000 \/ \$600/);assert.match(text,/Client-blocked days shift/);
});
check('Monthly real capacity and onboarding initially visible',()=>{
 const text=offers['monthly-partner'].essential;assert.match(text,/30 hours/);assert.match(text,/₹25,000 \/ \$500/);assert.match(text,/waived after a Sprint or with a three-month/);
});
check('Free month is bounded and does not recur automatically',()=>{
 const text=offers['monthly-partner'].detail.join(' ');assert.match(text,/Once per engagement/);assert.match(text,/seven days/);assert.match(text,/consecutive reserved month/);assert.match(text,/cannot trigger another/);assert.match(text,/₹4.05 lakh \/ \$9,450/);
});
check('Founding monthly discount is first month only',()=>assert.match(offers['monthly-partner'].detail.join(' '),/first month only; later months are at list price/));
check('Six-week promise requires code and caps credits',()=>{
 assert.match(offers['first-product'].essential,/coded demo.*one-sixth.*total fee/);assert.match(offers['first-product'].detail.join(' '),/not merely a design file/);
});
check('Website reduction does not double refund',()=>assert.match(offers['website-week'].detail.join(' '),/one fee reduction, not an additional refund/));
check('No security certification promise',()=>assert.match(offers['lockdown-week'].essential,/not a security audit, certification/));
check('Look scope is not quietly promoted to full identity',()=>assert.match(offers['look-week'].essential,/Not a complete brand identity/));
check('Quarterly is not ongoing support',()=>assert.match(offers['quarterly-checkin'].essential,/does not reserve continuous support/));
check('Quarterly does not invent first-month eligibility',()=>{
 const text=offers['quarterly-checkin'].detail.join(' ');assert.match(text,/eligibility is confirmed in the quote/);assert.doesNotMatch(text,/first month|whole prepaid quarter/);
});
check('Website price is visible before its context question',()=>assert.match(questions['website-kind'].hint,/₹60,000 \/ \$2,500/));
check('Conversation does not fabricate an offer or price',()=>{
 assert.equal(enquiryHref('conversation'),'../?offer=conversation&guided=1#contact');assert.match(offers.conversation.essential,/not a paid product Check/);assert.equal(offers.conversation.price,'Scope first');
});
check('Module does not revive the superseded design-led menu',()=>assert.doesNotMatch(JSON.stringify({questions,offers}),/Brand Lift|Brand Care|Brand Kit|Brand Lock|Brand & Launch Sprint/));
check('Scope-page links are local and whitelisted',()=>assert.deepEqual([...new Set(Object.values(offers).map(offer=>offer.scopeHref).filter(Boolean))].sort(),['idea-to-launch/','launch-ready-sprint/']));
check('Entire model is immutable',()=>{
 assert.ok(Object.isFrozen(questions)&&Object.isFrozen(offers));assert.ok(Object.isFrozen(questions.start.choices));assert.throws(()=>{questions.start.choices[0].next='app-scope';},TypeError);
});

console.log(`${checks} offer-guide checks passed. ${paths.length} complete paths, every recommendation reached in at most three decisions. No requests, messages or browser actions performed.`);
