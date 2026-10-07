import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
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

// Exercise the rendering boundary without a browser, network or style snapshots.
// The fixture models only the native DOM operations used by this controller.
const guideHTML=await readFile(new URL('../pricing/index.html',import.meta.url),'utf8');
const guideController=await readFile(new URL('../pricing/offer-guide.mjs',import.meta.url),'utf8');
class GuideNode {
 constructor(tag,id=''){this.tagName=tag.toUpperCase();this.id=id;this.children=[];this.dataset={};this.attributes={};this.listeners={};this.hidden=false;this.open=false;this._text='';this.focuses=[];this.scrolls=[];}
 get textContent(){return this._text+this.children.map(node=>node.textContent).join('');}
 set textContent(value){this._text=String(value);this.children=[];}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this._text='';this.children=[...nodes];}
 get childElementCount(){return this.children.filter(node=>node.tagName!=='#TEXT').length;}
 setAttribute(name,value){this.attributes[name]=String(value);}
 removeAttribute(name){delete this.attributes[name];delete this[name];}
 addEventListener(name,handler){(this.listeners[name]??=[]).push(handler);}
 click(){for(const handler of this.listeners.click||[])handler({currentTarget:this,target:this,preventDefault(){}});}
 focus(options){this.focuses.push(options);}
 scrollIntoView(options){this.scrolls.push(options);}
 querySelector(tag){return findGuideNode(this,node=>node!==this&&node.tagName===tag.toUpperCase());}
}
function findGuideNode(parent,predicate){if(predicate(parent))return parent;for(const node of parent.children){const match=findGuideNode(node,predicate);if(match)return match;}return null;}
function guideHarness(hash='',readyState='complete',nativeCatalogOpen=false,controllerSource=guideController){
 const nodes={};
 for(const match of guideHTML.matchAll(/<([a-z][a-z0-9]*)\b[^>]*\bid="([^"]+)"[^>]*>/gi)){
  const node=new GuideNode(match[1],match[2]);node.hidden=/\shidden(?:\s|>)/.test(match[0]);nodes[node.id]=node;
 }
 const summary=new GuideNode('summary','catalog-summary');nodes['all-offers'].append(summary);nodes['all-offers'].open=nativeCatalogOpen;
 const windowHandlers={};
 const location={hash};
 const document={readyState,getElementById:id=>nodes[id],createElement:tag=>new GuideNode(tag),createTextNode:text=>{const node=new GuideNode('#text');node.textContent=text;return node;}};
 const window={addEventListener:(name,handler)=>{(windowHandlers[name]??=[]).push(handler);}};
 const context=vm.createContext({document,window,location,questions,offers,route,offerFromHash,enquiryHref});
 vm.runInContext(controllerSource.replace(/^import[^\n]+\n/,''),context);
 const choose=id=>{const choice=nodes['guide-choices'].children.find(node=>node.dataset.choice===id);assert.ok(choice,`Missing choice ${id}`);choice.click();};
 const follow=id=>{const button=findGuideNode(nodes['guide-followups'],node=>node.dataset.offer===id);assert.ok(button,`Missing follow-up ${id}`);button.click();};
 const dispatch=name=>{for(const handler of windowHandlers[name]||[])handler();};
 return {nodes,location,choose,follow,dispatch,summary};
}

{
 const h=guideHarness(),n=h.nodes;
 check('Controller reveals only the first question after successful initialisation',()=>{
  assert.equal(n['guide-app'].hidden,false);assert.equal(n['guide-fallback'].hidden,true);assert.equal(n['guide-app'].dataset.view,'question');assert.equal(n['guide-app'].dataset.offer,'');assert.equal(n['guide-title'].textContent,questions.start.prompt);assert.equal(n['guide-result'].hidden,true);assert.equal(n['guide-choices'].hidden,false);
 });
 check('Questions have native, non-submit choice buttons',()=>assert.ok(n['guide-choices'].children.every(node=>node.tagName==='BUTTON'&&node.type==='button')));
 check('Choice arrows are decorative rather than extra spoken labels',()=>assert.ok(n['guide-choices'].children.every(node=>node.children.find(child=>child.className==='choice-arrow')?.attributes['aria-hidden']==='true')));
 check('Decorative art does not reveal unrelated proof during questions',()=>assert.equal(n['guide-proof'].hidden,true));
 h.choose('app');h.choose('launch');h.choose('key-journeys');
 check('Rendering follows decisions into the correct recommendation',()=>{
  assert.equal(n['guide-app'].dataset.view,'result');assert.equal(n['guide-app'].dataset.offer,'product-upgrade');assert.equal(n['guide-title'].textContent,offers['product-upgrade'].name);assert.equal(n['guide-result'].hidden,false);assert.equal(n['guide-choices'].hidden,true);
 });
 check('The compact trail carries the latest answer without the full path',()=>assert.equal(n['guide-trail'].textContent,questions['app-scope'].choices[0].label));
 check('A decision focuses its heading so the changed content is discoverable',()=>assert.ok(n['guide-title'].focuses.length>=3));
 check('Offer detail and continuation require a separate request',()=>{
  assert.equal(n['guide-detail'].open,false);assert.ok(n['guide-followups'].children.every(node=>node.tagName==='DETAILS'&&!node.open));
 });
 h.nodes['guide-back'].click();
 check('Back restores the preceding question and hides old proof',()=>{
  assert.equal(n['guide-title'].textContent,questions['app-scope'].prompt);assert.equal(n['guide-result'].hidden,true);assert.equal(n['guide-proof'].hidden,true);assert.equal(n['guide-app'].dataset.offer,'');
 });
 n['guide-all-offers'].click();
 check('Catalogue escape opens the native disclosure and moves focus there',()=>{assert.equal(n['all-offers'].open,true);assert.equal(h.summary.focuses.length,1);});
 n['guide-reset'].click();
 check('Reset clears history, closes the catalogue and returns to the first question',()=>{
  assert.equal(n['all-offers'].open,false);assert.equal(n['guide-title'].textContent,questions.start.prompt);assert.equal(n['guide-trail'].textContent,'');assert.equal(n['guide-back'].hidden,true);assert.equal(n['guide-reset'].hidden,true);assert.equal(n['guide-proof'].hidden,true);
 });
}

for(const id of offerIds.filter(id=>id!=='conversation')){
 const h=guideHarness(`#${id}`,'complete',true),n=h.nodes,offer=offers[id];
 check(`${id} direct fragment closes the native ancestor and renders exactly that offer`,()=>{
  assert.equal(n['all-offers'].open,false);assert.equal(n['guide-app'].dataset.offer,id);assert.equal(n['guide-title'].textContent,offer.name);assert.equal(n['guide-result'].hidden,false);
 });
 check(`${id} displays its actual price, material conditions and safe enquiry`,()=>{
  assert.equal(n['guide-price'].textContent,offer.price);assert.equal(n['guide-essential'].textContent,offer.essential);assert.equal(n['guide-enquiry'].href,enquiryHref(id));
  assert.equal(n['guide-international'].textContent,id==='first-impression'?'':`International ${offer.international}`);
 });
 check(`${id} primary CTA retains readable text and a separately hidden decorative arrow`,()=>{
  const children=n['guide-enquiry'].children;assert.ok(children[0]?.textContent.length);assert.equal(children.find(node=>node.className==='action-arrow')?.attributes['aria-hidden'],'true');
 });
 check(`${id} retains exactly its concrete inclusions`,()=>assert.deepEqual(n['guide-includes'].children.map(node=>node.textContent),offer.includes));
 check(`${id} retains every approved term under a meaningful heading`,()=>{
  const sections=n['guide-detail-copy'].children;assert.equal(sections.length,offer.detail.length);
  sections.forEach((section,index)=>{
   assert.equal(section.tagName,'SECTION');assert.ok(section.children.some(node=>node.tagName==='H3'&&node.textContent.length));
   assert.equal(section.children.find(node=>node.tagName==='P').textContent,offer.detail[index]);
  });
 });
 check(`${id} proof caption is revealed only for the recommendation`,()=>{
  assert.equal(n['guide-proof'].tagName,'FIGCAPTION');assert.equal(n['guide-proof'].hidden,false);assert.ok(n['guide-proof'].children.some(node=>node.tagName==='A'&&node.href));
 });
 check(`${id} complete-plan link is only available where a real plan exists`,()=>{
  assert.equal(n['guide-scope-link'].hidden,!offer.scopeHref);
  if(offer.scopeHref)assert.equal(n['guide-scope-link'].href,offer.scopeHref);else assert.equal(n['guide-scope-link'].href,undefined);
 });
 check(`${id} disclosure is closed on initial recommendation`,()=>assert.equal(n['guide-detail'].open,false));
}

{
 const h=guideHarness('#monthly-partner'),sections=h.nodes['guide-detail-copy'].children;
 check('Monthly headings distinguish hours, guarantee, prepaid term and first-month discount',()=>{
  assert.deepEqual(sections.map(section=>section.children.find(node=>node.tagName==='H3').textContent),['Reserved time','The monthly promise','Three months at a time','Founding clients']);
  assert.match(sections[0].textContent,/unused hours do not roll over/i);assert.match(sections[1].textContent,/Once per engagement/);assert.match(sections[2].textContent,/₹4.05 lakh \/ \$9,450/);assert.match(sections[3].textContent,/first month only/);
 });
 const quarter=findGuideNode(h.nodes['guide-followups'],node=>node.tagName==='DETAILS'&&node.textContent.startsWith('Reserve three months?'));
 check('Monthly prepaid option stays an optional disclosure, not a new primary price',()=>{assert.ok(quarter&&!quarter.open);assert.equal(h.nodes['guide-price'].textContent,offers['monthly-partner'].price);});
}
{
 const h=guideHarness('#product-upgrade'),n=h.nodes;
 n['guide-detail'].open=true;h.follow('launch-grow');
 check('Optional bundle resets detail, reveals its own fee and preserves the standalone return',()=>{
  assert.equal(n['guide-app'].dataset.offer,'launch-grow');assert.equal(n['guide-price'].textContent,offers['launch-grow'].price);assert.equal(n['guide-detail'].open,false);assert.equal(n['guide-scope-link'].textContent,'Read the Sprint plan ↗');assert.ok(findGuideNode(n['guide-followups'],node=>node.dataset.offer==='product-upgrade'));
 });
 n['guide-back'].click();
 check('Back from optional bundle restores the prior Sprint without reopening terms',()=>{assert.equal(n['guide-app'].dataset.offer,'product-upgrade');assert.equal(n['guide-detail'].open,false);});
}
for(const [audience,proof] of [['clinic','../work/second-nature/'],['studio','../work/second-nature/'],['cafe','../work/side-note/'],['other','../work/second-nature/']]){
 const h=guideHarness();h.choose('website');h.choose(audience);const n=h.nodes;
 check(`Website ${audience} context remains in the guided enquiry and honest concept caption`,()=>{
  assert.equal(n['guide-enquiry'].href,enquiryHref('website-week',audience==='other'?undefined:audience));
  assert.equal(n['guide-proof'].children.find(node=>node.tagName==='A').href,proof);assert.match(n['guide-proof'].textContent,/Self-initiated work for a fictional business/);
 });
}
{
 const h=guideHarness();h.choose('idea');h.choose('defining');const n=h.nodes;
 check('Conversation remains honest after rendering, without a fabricated paid offer',()=>{
  assert.equal(n['guide-title'].textContent,offers.conversation.name);assert.equal(n['guide-price'].textContent,'Scope first');assert.equal(n['guide-enquiry'].href,enquiryHref('conversation'));assert.match(n['guide-international'].textContent,/after we understand the work/);
 });
}
{
 const h=guideHarness('#product-upgrade','interactive',true);
 check('Deferred direct fragment waits for native loading before closing its ancestor',()=>assert.equal(h.nodes['guide-app'].dataset.view,'question'));
 h.dispatch('load');
 check('Load reveals the exact direct recommendation despite native catalogue opening',()=>{assert.equal(h.nodes['all-offers'].open,false);assert.equal(h.nodes['guide-app'].dataset.offer,'product-upgrade');});
 h.location.hash='#product-review';h.dispatch('hashchange');
 check('A later recognised fragment switches recommendation and resets detail',()=>{assert.equal(h.nodes['guide-app'].dataset.offer,'product-review');assert.equal(h.nodes['guide-detail'].open,false);});
 h.location.hash='#unknown';h.dispatch('hashchange');
 check('An unknown fragment does not substitute another offer',()=>assert.equal(h.nodes['guide-app'].dataset.offer,'product-review'));
}

function assertOpenedCatalogueLegacyRecovery(h,reset=false){
 if(reset)h.nodes['guide-reset'].click();
 // Fragment navigation can open a native details ancestor before hashchange.
 h.nodes['all-offers'].open=true;h.location.hash='#quarterly-checkin';h.dispatch('hashchange');
 const n=h.nodes;
 assert.equal(n['guide-app'].dataset.offer,'quarterly-checkin');assert.equal(n['guide-app'].dataset.view,'result');
 assert.equal(n['guide-result'].hidden,false);assert.equal(n['guide-choices'].hidden,true);assert.equal(n['all-offers'].open,false);
 assert.equal(n['guide-title'].textContent,offers['quarterly-checkin'].name);assert.equal(n['guide-price'].textContent,offers['quarterly-checkin'].price);
 assert.equal(n['guide-enquiry'].href,enquiryHref('quarterly-checkin'));
}
check('A valid legacy fragment wins even if the native catalogue opened before hashchange',()=>assertOpenedCatalogueLegacyRecovery(guideHarness()));
check('After Reset, a legacy fragment replaces stale hidden Sprint data and closes the catalogue',()=>assertOpenedCatalogueLegacyRecovery(guideHarness('#product-upgrade'),true));
check('Regression test rejects the old catalogue-open hashchange guard',()=>{
 const mutant=guideController.replace(/window\.addEventListener\('hashchange',openDirectOffer\);/,"window.addEventListener('hashchange',()=>{if(!catalog.open)openDirectOffer();});");
 assert.notEqual(mutant,guideController,'Expected the unconditional hash listener to be present.');
 assert.throws(()=>assertOpenedCatalogueLegacyRecovery(guideHarness('#product-upgrade','complete',false,mutant),true),assert.AssertionError);
});
for(const id of offerIds.filter(id=>id!=='conversation')){
 check(`${id} native catalogue anchor is separate from the legacy guide fragment`,()=>{
  assert.match(guideHTML,new RegExp(`\\bid="catalog-${id}"`));assert.doesNotMatch(guideHTML,new RegExp(`\\bid="${id}"`));
  assert.equal(offerFromHash(`#catalog-${id}`),null);
 });
}
{
 const h=guideHarness('#product-upgrade'),n=h.nodes;h.nodes['guide-all-offers'].click();
 const before={offer:n['guide-app'].dataset.offer,title:n['guide-title'].textContent,price:n['guide-price'].textContent,scrolls:n['guide-app'].scrolls.length};
 h.location.hash='#catalog-quarterly-checkin';h.dispatch('hashchange');
 check('An explicit catalogue anchor preserves the native catalogue and does not replace the guide',()=>{
  assert.equal(n['all-offers'].open,true);assert.equal(n['guide-app'].dataset.offer,before.offer);assert.equal(n['guide-title'].textContent,before.title);assert.equal(n['guide-price'].textContent,before.price);assert.equal(n['guide-app'].scrolls.length,before.scrolls);
 });
 h.location.hash='#unknown';h.dispatch('hashchange');
 check('Unknown fragments leave an intentionally open catalogue and the recommendation unchanged',()=>{
  assert.equal(n['all-offers'].open,true);assert.equal(n['guide-app'].dataset.offer,before.offer);assert.equal(n['guide-price'].textContent,before.price);assert.equal(n['guide-app'].scrolls.length,before.scrolls);
 });
}
{
 const h=guideHarness('#catalog-quarterly-checkin','complete',true);
 check('A native catalogue fragment on load remains a catalogue visit, not a disguised recommendation',()=>{
  assert.equal(h.nodes['all-offers'].open,true);assert.equal(h.nodes['guide-app'].dataset.view,'question');assert.equal(h.nodes['guide-app'].dataset.offer,'');
 });
}
check('The direct all-offers fragment keeps the native catalogue escape usable',()=>assert.equal(guideHarness('#all-offers').nodes['all-offers'].open,true));
check('No-JavaScript fallback and native catalogue remain in source',()=>{
 assert.match(guideHTML,/<div id="guide-fallback" class="guide-fallback">/);assert.match(guideHTML,/<div id="guide-app" hidden>/);assert.match(guideHTML,/<details id="all-offers" class="offer-catalog">\s*<summary>/);
});
check('The changed heading is natively focusable and decorative art has no required copy',()=>{
 assert.match(guideHTML,/<h1 id="guide-title" tabindex="-1"><\/h1>/);assert.match(guideHTML,/<img class="guide-art"[^>]*alt="" aria-hidden="true">/);
});
check('Decision content precedes the linked proof caption in document reading order',()=>{
 const content=guideHTML.indexOf('<div class="guide-content">'),figure=guideHTML.indexOf('<figure class="guide-illustration">'),proof=guideHTML.indexOf('id="guide-proof"');
 assert.ok(content>=0&&content<figure&&figure<proof);assert.ok(guideHTML.indexOf('id="guide-enquiry"',content)<proof);
});

console.log(`${checks} offer-guide checks passed. ${paths.length} complete paths, every recommendation reached in at most three decisions. Model and controller exercised; no requests, messages or browser actions performed.`);
