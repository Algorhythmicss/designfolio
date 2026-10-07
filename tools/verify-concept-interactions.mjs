// Network-free interaction regressions. Executes the published scripts, not a
// second implementation of their cart, reveal, validation or focus behavior.
// Run: node tools/verify-concept-interactions.mjs
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

let checks=0;
function check(condition,message){assert.ok(condition,message);checks++;}
const files=Object.fromEntries(await Promise.all(['side-note','second-nature'].map(async name=>[name,{
 html:await readFile(new URL(`../${name}/index.html`,import.meta.url),'utf8'),
 script:await readFile(new URL(`../${name}/app.js`,import.meta.url),'utf8')
}])));

function harness(name,{phone=false,reduced=false}={}){
 const elements={},documentListeners={},windowListeners={},timers=new Map(),frames=new Map(),tools=[],observers=[];
 let sequence=0,clock=0,requests=0;
 const document={hidden:false,activeElement:null};
 class Element{
  constructor(id='',tag='DIV'){this.id=id;this.tagName=tag.toUpperCase();this.attributes={};this.dataset={};this.style={};this.listeners={};this.children=[];this.selectors={};this.fields={};this.value='';this.defaultValue='';this.hidden=false;this.disabled=false;this.required=false;this.open=false;this.isConnected=true;this.validity='';this.focusCount=0;this.offsetHeight=100;this.scrollTop=0;}
  set textContent(value){this.text=String(value);}get textContent(){return this.text||'';}
  set innerHTML(value){this.markup=String(value);this.children=[];}get innerHTML(){return this.markup||'';}
  addEventListener(name,handler){(this.listeners[name]??=[]).push(handler);}
  dispatch(name,extra={}){const event={target:this,currentTarget:this,preventDefault(){this.prevented=true;},...extra};for(const fn of this.listeners[name]||[])fn(event);return event;}
  setAttribute(key,value){this.attributes[key]=String(value);if(key.startsWith('data-'))this.dataset[key.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(value);}
  getAttribute(key){return this.attributes[key]??null;}removeAttribute(key){delete this.attributes[key];}
  hasAttribute(key){return Object.hasOwn(this.attributes,key);}
  closest(selector){return selector==='button'&&this.tagName==='BUTTON'?this:null;}
  querySelector(selector){return this.selectors[selector]||null;}
  querySelectorAll(selector){return this.selectors[selector]||[];}
  focus(){document.activeElement=this;this.focusCount++;}
  scrollIntoView(options){this.lastScroll=options;}
  showModal(){this.open=true;}close(){this.open=false;}
  getBoundingClientRect(){return {top:0,left:0,right:100,bottom:100};}
  append(...children){this.children.push(...children);}replaceChildren(...children){this.children=[...children];this.markup='';}
  reset(){for(const field of Object.values(this.fields))field.value=field.defaultValue;}
  setCustomValidity(message){this.validity=message;}
  reportValidity(){
   if(this.tagName==='FORM')return Object.values(this.fields).every(field=>field.reportValidity());
   if(this.validity)return false;
   if(this.required&&!this.value)return false;
   if(this.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value))return false;
   if(this.pattern&&!new RegExp(`^(?:${this.pattern})$`).test(this.value))return false;
   return true;
  }
 }
 const html=files[name].html;
 for(const match of html.matchAll(/<([a-z][\w-]*)\b([^>]*\bid="([^"]+)"[^>]*)>/gi)){
  const [,tag,attrs,id]=match,node=elements[id]=new Element(id,tag);
  for(const attr of attrs.matchAll(/([\w-]+)="([^"]*)"/g))node.setAttribute(attr[1],attr[2]);
  node.required=/\srequired(?:\s|$)/.test(attrs);node.hidden=/\shidden(?:\s|$)/.test(attrs);node.disabled=/\sdisabled(?:\s|$)/.test(attrs);
  node.type=node.getAttribute('type');node.pattern=node.getAttribute('pattern');node.value=node.defaultValue=node.getAttribute('value')||'';
 }
 for(const match of html.matchAll(/<dialog\b([^>]*)>([\s\S]*?)<\/dialog>/g)){
  const id=match[1].match(/\bid="([^"]+)"/)?.[1];
  for(const inside of match[2].matchAll(/\bid="([^"]+)"/g))if(elements[inside[1]])elements[inside[1]].dialogParent=elements[id];
 }
 const synthetic=()=>new Element();
 const selectors={};
 if(name==='side-note'){
  const product=elements['product-form'];product.fields={size:new Element(),grind:elements['product-grind'],frequency:new Element()};
  product.fields.size.value=product.fields.size.defaultValue='250';product.fields.frequency.value=product.fields.frequency.defaultValue='once';
  const checkout=elements['checkout-form'];checkout.fields=Object.fromEntries(['name','email','address','city','pin'].map(key=>[key,elements[`customer-${key}`]]));checkout.selectors.input=Object.values(checkout.fields);
  elements['quiz-question'].selectors.legend=synthetic();elements['quiz-result'].selectors.h3=synthetic();elements['finder-form'].fields={answer:new Element()};
 }else{
  for(const selector of ['.transformation-run','.transformation-pin','.comparison','.after-layer','.room-heading'])selectors[selector]=synthetic();
  selectors['.comparison'].selectors.img=[];
  selectors['.transformation-run'].offsetHeight=1600;selectors['.transformation-pin'].offsetHeight=800;
  elements['brief-form'].selectors['[type=submit]']=synthetic();elements['brief-form'].selectors['input,textarea']=['brief-name','brief-location','brief-goals'].map(id=>elements[id]);elements['brief-form'].selectors.input=elements['brief-name'];
  elements['brief-result'].selectors.h3=synthetic();
  elements.transformation.selectors['h1,h2,h3']=elements['transformation-title'];
  elements.enquiry.selectors['h1,h2,h3']=elements['enquiry-title'];
 }
 const media=Object.fromEntries(['(prefers-reduced-motion: reduce)','(max-height: 620px)','(max-width: 650px)'].map(query=>[query,{matches:query.includes('reduced')?reduced:query.includes('width')?phone:false,listeners:[],addEventListener(_,handler){this.listeners.push(handler);},change(value){this.matches=value;for(const fn of this.listeners)fn();}}]));
 class IntersectionObserver{constructor(callback){this.callback=callback;observers.push(this);}observe(target){this.target=target;}disconnect(){this.disconnected=true;}intersect(){this.callback([{isIntersecting:true,target:this.target}]);}}
 class Fields{constructor(form){this.fields=form.fields;}get(name){return this.fields[name]?.value??null;}}
 const events=(map,key,handler)=>{(map[key]??=[]).push(handler);};
 Object.assign(document,{
  getElementById:id=>elements[id],querySelector:selector=>selector.startsWith('#')?elements[selector.slice(1)]:selectors[selector]||null,
  querySelectorAll:selector=>selector==='dialog'?Object.values(elements).filter(node=>node.tagName==='DIALOG'):[],
  createElement:tag=>new Element('',tag),addEventListener:(key,handler)=>events(documentListeners,key,handler),
  modelContext:{registerTool:tool=>tools.push(tool)}
 });
 const window={addEventListener:(key,handler)=>events(windowListeners,key,handler)};
 const context=vm.createContext({document,window,FormData:Fields,matchMedia:query=>media[query],IntersectionObserver,AbortController,
  setTimeout:(callback,delay)=>{const id=++sequence;timers.set(id,{callback,delay});return id;},clearTimeout:id=>timers.delete(id),
  requestAnimationFrame:callback=>{const id=++sequence;frames.set(id,callback);return id;},cancelAnimationFrame:id=>frames.delete(id),
  fetch:()=>{requests++;throw new Error('These concepts must not make provider requests.');}
 });
 // The shipped script guards feature availability via the window object.
 window.IntersectionObserver=IntersectionObserver;
 vm.runInContext(files[name].script,context,{filename:`${name}/app.js`});
 const dispatch=(key,target)=>{for(const fn of documentListeners[key]||[])fn({target,currentTarget:document,preventDefault(){}});};
 const click=target=>{target.focus();target.dispatch('click');dispatch('click',target);};
 const button=dataset=>{const node=new Element('', 'button');for(const [key,value] of Object.entries(dataset))node.setAttribute(`data-${key}`,value);return node;};
 const settle=()=>{for(let i=0;frames.size&&i<80;i++){clock+=50;const batch=[...frames.values()];frames.clear();for(const callback of batch)callback(clock);}check(frames.size===0,'Room animation settles without an endless frame loop.');};
 return {elements,selectors,media,timers,observers,tools,click,button,settle,dispatch,requests:()=>requests};
}

// An observer callback can already be queued when clearTimeout is called.
// Invoking that captured callback after a manual choice tests the stale race.
{
 const h=harness('second-nature',{phone:true});h.observers[0].intersect();
 check(h.timers.size===1,'Entering the phone room schedules exactly one automatic reveal.');
 const queued=[...h.timers.values()][0].callback;
 h.click(h.elements['room-toggle']);h.click(h.elements['room-toggle']);h.settle();
 check(h.timers.size===0,'A manual choice cancels the pending automatic reveal.');
 const mask=h.selectors['.after-layer'].style.maskImage;
 queued();h.settle();
 check(h.selectors['.after-layer'].style.maskImage===mask&&h.elements['room-toggle'].textContent==='See reimagined','An already-queued reveal cannot overwrite the manually chosen original room.');
 check(h.requests()===0,'Room viewing makes no provider requests.');
}
{
 const h=harness('second-nature',{phone:true}),queuedObserver=h.observers[0];
 h.click(h.elements['room-toggle']);h.click(h.elements['room-toggle']);h.settle();
 queuedObserver.intersect();
 check(h.timers.size===0&&h.elements['room-toggle'].textContent==='See reimagined','An already-queued observer notification cannot schedule a new automatic reveal after manual control.');
}
{
 const h=harness('second-nature',{phone:true});h.observers[0].intersect();
 const queued=[...h.timers.values()][0].callback;
 h.media['(prefers-reduced-motion: reduce)'].change(true);
 check(h.timers.size===0,'Changing motion preference cancels the delayed reveal.');
 h.click(h.elements['room-toggle']);queued();h.settle();
 check(h.elements['room-toggle'].textContent==='See reimagined','A stale callback does not replace the original chosen after enabling reduced motion.');
 const initial=harness('second-nature',{phone:true,reduced:true});
 check(initial.selectors['.after-layer'].style.maskImage==='linear-gradient(#000,#000)'&&initial.observers.length===0,'Reduced-motion phone starts with the finished view and no automatic observer.');
}
for(const [project,destination,title] of [['house','transformation','transformation-title'],['workshop','enquiry','enquiry-title']]){
 const h=harness('second-nature'),trigger=h.button({project});h.click(trigger);
 check(h.elements['project-dialog'].open,'Project study opens: '+project);
 h.click(h.button({go:destination}));
 check(!h.elements['project-dialog'].open&&h.elements[destination].lastScroll?.behavior==='instant','Project action closes and scrolls to its destination: '+project);
 check(h.elements[title].focusCount===1&&h.elements[title].getAttribute('tabindex')==='-1'&&trigger.focusCount===1,'Project action places focus at the destination, without refocusing the old trigger: '+project);
}

function stage(h,id='daybreak',quantity=1,frequency='once'){
 return h.tools.find(tool=>tool.name==='stage_demo_coffee_bag').execute({id,size:250,grind:'whole',frequency,quantity});
}
function checkout(h,overrides={}){
 const fields={name:'Sample Visitor',email:'visitor@example.com',address:'12 Sample Road',city:'Sample City',pin:'560001',...overrides};
 for(const [key,value] of Object.entries(fields)){const field=h.elements[`customer-${key}`];field.value=value;field.dispatch('input');}
 h.click(h.elements['checkout-start']);h.elements['checkout-form'].dispatch('submit');
}
{
 const h=harness('side-note');stage(h,'daybreak',8);
 h.click(h.button({product:'daybreak'}));h.elements['product-grind'].value='whole';h.elements['product-form'].dispatch('change');h.elements['product-form'].dispatch('submit');
 const error=h.elements['product-status'];
 check(!error.hidden&&error.textContent.includes('up to 8 bags')&&error.dialogParent===h.elements['product-dialog'],'Configuration-cap feedback is inside the open product dialog.');
 check(h.elements['product-dialog'].open&&error.focusCount===1&&h.elements['add-to-bag'].getAttribute('aria-describedby')==='product-status','The cap leaves the configuration open and makes its inline feedback reachable.');
 check(h.elements['bag-count'].textContent==='8','A rejected ninth bag does not mutate the cart.');
 h.elements['product-form'].fields.size.value='500';h.elements['product-form'].dispatch('change');
 check(error.hidden&&!error.textContent&&!h.elements['add-to-bag'].getAttribute('aria-describedby'),'Changing configuration clears the stale cap message.');
 h.elements['product-form'].dispatch('submit');
 check(h.elements['cart-dialog'].open&&h.elements['bag-count'].textContent==='9','A different valid configuration can be added after the rejected addition.');
 check(h.requests()===0,'Coffee configuration makes no provider requests.');
}
for(const key of ['name','address','city']){
 const h=harness('side-note');stage(h);checkout(h,{[key]:' \t '});
 check(!h.elements['checkout-view'].hidden&&h.elements['order-preview'].hidden&&h.elements[`customer-${key}`].validity,'Whitespace-only '+key+' is rejected before the order preview.');
 check(h.elements['customer-email'].value==='visitor@example.com'&&h.elements['bag-count'].textContent==='1','Invalid details preserve other fields and the bag.');
 h.elements[`customer-${key}`].value='Corrected detail';h.elements[`customer-${key}`].dispatch('input');h.elements['checkout-form'].dispatch('submit');
 check(!h.elements['order-preview'].hidden&&!h.elements[`customer-${key}`].validity,'Correcting '+key+' clears validation and permits the demo preview.');
}
{
 const h=harness('side-note');stage(h,'offbeat',1,'repeat');stage(h,'daybreak');checkout(h,{name:'  Sample Visitor  '});
 check(h.elements['checkout-summary'].innerHTML.includes('₹1,230')&&h.elements['checkout-summary'].innerHTML.includes('₹740 every 4 weeks'),'Mixed cart distinguishes the first total from repeat-only delivery.');
 check(h.elements['preview-details'].children[0].textContent.startsWith('Sample Visitor ·'),'Preview displays trimmed details.');
 h.click(h.elements['edit-order']);
 check(!h.elements['checkout-view'].hidden&&h.elements['customer-name'].value==='  Sample Visitor  ','Editing preserves original entered details.');
 h.elements['checkout-form'].dispatch('submit');h.click(h.elements['reset-bag']);
 check(!h.elements['bag-view'].hidden&&h.elements['order-preview'].hidden&&h.elements['cart-title'].focusCount===1&&h.elements['cart-title'].getAttribute('tabindex')==='-1','Starting a new bag focuses its visible heading rather than the now-hidden reset control.');
 check(h.elements['bag-count'].textContent==='0'&&!h.elements['preview-details'].children.length&&!h.elements['customer-name'].value,'Starting a new bag clears previous details and preview content.');
 check(h.requests()===0,'Demo preview and reset never send details or create an order.');
}
console.log(`${checks} concept interaction checks passed.`);
