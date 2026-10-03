'use strict';
const $ = (selector, parent = document) => parent.querySelector(selector);
const money = value => '₹' + value.toLocaleString('en-IN');
const products = {
  daybreak: { name:'Daybreak', color:'daybreak', roast:'Medium–dark', taste:'Chocolatey. Round. Comforting.', description:'A rich, familiar cup for slow breakfasts and busy mornings. Especially lovely with milk.', caption:'a familiar kind of lovely.', body:'Full & rounded', brightness:'Gentle', price:{250:550,500:1040}, cropX:210 },
  'slow-morning': { name:'Slow Morning', color:'slow-morning', roast:'Medium', taste:'Caramel. Roasted nuts. Easygoing.', description:'A mellow, balanced coffee that feels easy to come back to. Drink it black or add a little milk.', caption:'nothing to rush here.', body:'Soft & balanced', brightness:'Mellow', price:{250:620,500:1180}, cropX:820 },
  offbeat: { name:'Offbeat', color:'offbeat', roast:'Light–medium', taste:'Citrus. Berries. A little unexpected.', description:'A brighter cup with a fruity character. Try it black first to explore those lighter notes.', caption:'a pleasant little surprise.', body:'Light & lively', brightness:'Bright & fruity', price:{250:680,500:1290}, cropX:1430 }
};
const grinds = {whole:'Whole bean',french:'French press grind',pour:'Pour-over grind',moka:'Moka pot grind',espresso:'Espresso grind'};
const cart = [];
let activeProduct = 'daybreak';
let returnFocus = null;
let activeDialog = null;
let statusTimer;
function announce(message) {
  clearTimeout(statusTimer); $('#shop-status').textContent = message;
  statusTimer = setTimeout(() => { $('#shop-status').textContent = ''; }, 4000);
}
function openDialog(id) {
  const dialog = document.getElementById(id);
  if (activeDialog === dialog) return;
  if (!activeDialog) returnFocus = document.activeElement;
  if (activeDialog?.open) activeDialog.close();
  activeDialog = dialog;
  dialog.showModal(); dialog.scrollTop = 0;
}
function closeDialog() {
  if (activeDialog?.open) activeDialog.close();
  activeDialog = null;
  if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
}
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('cancel', event => {event.preventDefault(); closeDialog();});
});
function openProduct(id, grind = '') {
  const product = products[id]; if (!product) return;
  activeProduct = id;
  $('#product-title').textContent = product.name;
  $('#detail-roast').textContent = product.roast.toUpperCase() + ' / ROASTED COFFEE';
  $('#detail-taste').textContent = product.taste;
  $('#detail-description').textContent = product.description;
  $('#detail-caption').textContent = product.caption;
  $('#detail-image').innerHTML = '<svg class="pack-art" viewBox="' + product.cropX + ' 0 540 725" role="img" aria-label="Side Note ' + product.name + ' coffee pouch"><defs><clipPath id="pack-detail" clipPathUnits="userSpaceOnUse"><rect x="' + product.cropX + '" y="0" width="540" height="725"/></clipPath></defs><image href="assets/coffee-bags.webp" width="2170" height="725" clip-path="url(#pack-detail)"/></svg>';
  $('#detail-profile').innerHTML = '<div><dt>How it feels</dt><dd>' + product.body + '</dd></div><div><dt>How it tastes</dt><dd>' + product.brightness + '</dd></div>';
  $('#product-form').reset();
  $('#product-grind').value = grinds[grind] ? grind : '';
  updateConfiguration(); openDialog('product-dialog');
}
function configuration() {
  const form = new FormData($('#product-form'));
  return { id:activeProduct, size:Number(form.get('size')), grind:form.get('grind'), frequency:form.get('frequency') };
}
function updateConfiguration() {
  const choice = configuration(); const price = products[choice.id].price[choice.size];
  $('#configuration-summary').textContent = money(price) + (choice.frequency === 'repeat' ? ' per bag, every 4 weeks' : ' · one-time purchase');
  $('#add-to-bag').textContent = 'Add to bag · ' + money(price);
  $('#grind-help').textContent = choice.grind === 'whole' ? 'You’ll need a grinder and a coffee brewer.' : choice.grind === 'espresso' ? 'A starting grind for espresso. Your machine may need a finer adjustment.' : choice.grind ? 'Ground to suit your ' + ({french:'French press',pour:'pour-over',moka:'moka pot'}[choice.grind] || 'brewer') + '.' : 'Ground coffee needs a brewer. This isn’t instant coffee.';
}
$('#product-form').addEventListener('change', updateConfiguration);
function validateItem(item) {
  if (!item || typeof item !== 'object' || !Object.hasOwn(products,item.id) || ![250,500].includes(item.size) || !Object.hasOwn(grinds,item.grind) || !['once','repeat'].includes(item.frequency) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 8) throw new Error('Choose a listed coffee, size, grind, delivery option and 1–8 bags.');
}
function addToCart(item) {
  validateItem(item);
  const key = [item.id,item.size,item.grind,item.frequency].join(':');
  const existing = cart.find(row=>row.key===key);
  if (existing && existing.quantity + item.quantity > 8) throw new Error('This demo supports up to 8 bags of each configuration.');
  if (existing) existing.quantity += item.quantity;
  else cart.push({...item,key});
  renderCart(); openCart();
}
$('#product-form').addEventListener('submit', event=>{
  event.preventDefault();
  try {addToCart({...configuration(),quantity:1});} catch(error) {announce(error.message);}
});
function totals() {
  const subtotal = cart.reduce((n,row)=>n+products[row.id].price[row.size]*row.quantity,0);
  const delivery = subtotal === 0 || subtotal >= 1000 ? 0 : 60;
  const recurringSubtotal = cart.filter(row=>row.frequency==='repeat').reduce((n,row)=>n+products[row.id].price[row.size]*row.quantity,0);
  const recurringDelivery = recurringSubtotal === 0 || recurringSubtotal >= 1000 ? 0 : 60;
  return {subtotal,delivery,total:subtotal+delivery,recurringSubtotal,recurringDelivery,recurringTotal:recurringSubtotal+recurringDelivery};
}
function totalsMarkup() {
  const t = totals();
  return '<div class="totals"><div><span>Coffee</span><span>'+money(t.subtotal)+'</span></div><div><span>Delivery · India</span><span>'+(t.delivery?money(t.delivery):'Included')+'</span></div><div class="grand-total"><span>First order total</span><span>'+money(t.total)+'</span></div><p class="small-copy">All taxes included. '+(t.subtotal<1000?'Free delivery from ₹1,000.':'Free delivery applies.')+'</p></div>'+(t.recurringSubtotal?'<p class="recurring-notice"><strong>Then '+money(t.recurringTotal)+' every 4 weeks</strong> for your repeat items, including '+(t.recurringDelivery?money(t.recurringDelivery)+' delivery':'delivery')+'. One-time items will not repeat. Pause or cancel before the next dispatch. No subscription is created in this demo.</p>':'<p class="small-copy">One-time order. Nothing repeats.</p>');
}
function renderCart() {
  $('#bag-count').textContent = cart.reduce((n,row)=>n+row.quantity,0);
  const items = $('#cart-items');
  if (!cart.length) {
    items.innerHTML = '<div class="cart-empty"><p>Your bag is taking a little breather.</p><button class="button outline" data-close>Find your first coffee</button></div>';
    $('#cart-totals').innerHTML = ''; $('#cart-controls').hidden = true; return;
  }
  $('#cart-controls').hidden = false;
  items.innerHTML = cart.map((row,index)=>{
    const product = products[row.id];
    return '<article class="cart-row"><div><h3>'+product.name+'</h3><p>'+row.size+' g · '+grinds[row.grind]+'</p><p class="'+(row.frequency==='repeat'?'repeat-label':'')+'">'+(row.frequency==='repeat'?'Repeats every 4 weeks':'One-time purchase')+'</p><div class="cart-quantity" role="group" aria-label="Quantity for '+product.name+'"><button data-quantity="'+index+'" data-delta="-1" aria-label="Remove one '+product.name+' bag" '+(row.quantity===1?'disabled':'')+'>−</button><output aria-live="polite">'+row.quantity+'</output><button data-quantity="'+index+'" data-delta="1" aria-label="Add one '+product.name+' bag" '+(row.quantity===8?'disabled':'')+'>+</button></div><button class="remove-item" data-remove="'+index+'">Remove '+product.name+'</button></div><div class="cart-price">'+money(product.price[row.size]*row.quantity)+'</div></article>';
  }).join('');
  $('#cart-totals').innerHTML = totalsMarkup();
  $('#checkout-summary').innerHTML = totalsMarkup();
}
function cartView(view) {
  ['bag-view','checkout-view','order-preview'].forEach(id=>document.getElementById(id).hidden = id !== view);
  $('#cart-dialog').setAttribute('aria-labelledby',view === 'bag-view'?'cart-title':view === 'checkout-view'?'checkout-title':'preview-title');
  $('#cart-dialog').scrollTop = 0;
}
function openCart() {renderCart(); cartView('bag-view'); openDialog('cart-dialog');}
$('#checkout-start').addEventListener('click',()=>{
  if (!cart.length) return; cartView('checkout-view'); $('#checkout-title').focus({preventScroll:true});
});
$('#back-to-bag').addEventListener('click',()=>{cartView('bag-view');$('#checkout-start').focus({preventScroll:true});});
$('#checkout-form').addEventListener('submit',event=>{
  event.preventDefault(); if (!cart.length) return;
  const target = $('#preview-details'); target.replaceChildren();
  const address = document.createElement('p'); address.className='preview-line';
  address.textContent = $('#customer-name').value.trim()+' · '+$('#customer-email').value.trim()+' · '+$('#customer-address').value.trim()+', '+$('#customer-city').value.trim()+' '+$('#customer-pin').value;
  target.append(address);
  cart.forEach(row=>{
    const p=document.createElement('p');p.className='preview-line';
    const title=document.createElement('strong');title.textContent=row.quantity+' × '+products[row.id].name;
    const detail=document.createElement('span');detail.textContent=row.size+' g · '+grinds[row.grind]+' · '+(row.frequency==='repeat'?'Every 4 weeks':'One-time');
    p.append(title,detail);target.append(p);
  });
  const price = document.createElement('div');price.innerHTML=totalsMarkup();target.append(price);
  cartView('order-preview');$('#preview-title').focus({preventScroll:true});
});
$('#edit-order').addEventListener('click',()=>{cartView('checkout-view');$('#checkout-title').focus({preventScroll:true});});
$('#reset-bag').addEventListener('click',()=>{cart.length=0;$('#checkout-form').reset();renderCart();cartView('bag-view');});
document.addEventListener('click',event=>{
  const button = event.target.closest('button'); if (!button) return;
  if (button.hasAttribute('data-close')) closeDialog();
  else if (button.dataset.product) openProduct(button.dataset.product);
  else if (button.hasAttribute('data-open-cart')) openCart();
  else if (button.hasAttribute('data-concept')) openDialog('concept-dialog');
  else if (button.hasAttribute('data-quantity')) {
    const index=Number(button.dataset.quantity),delta=Number(button.dataset.delta),row=cart[index];
    if(!row || row.quantity+delta<1 || row.quantity+delta>8)return;
    row.quantity+=delta;renderCart();
    const sameButton=$('[data-quantity="'+index+'"][data-delta="'+delta+'"]');
    const fallback=$('[data-quantity="'+index+'"][data-delta="'+(-delta)+'"]');
    (sameButton?.disabled?fallback:sameButton)?.focus({preventScroll:true});
  } else if (button.hasAttribute('data-remove')) {
    cart.splice(Number(button.dataset.remove),1);renderCart();
    ($('#cart-items button:not(:disabled)') || $('#cart-dialog [data-close]')).focus({preventScroll:true});
  }
});
const questions = [
 {key:'brew',title:'How do you make your coffee?',options:[['french','French press'],['pour','Pour-over / filter'],['moka','Moka pot'],['espresso','Espresso machine'],['whole','I grind my own beans'],['none','No brewer yet']]},
 {key:'milk',title:'How do you like to drink it?',options:[['milk','With milk'],['black','Black'],['both','A little of both']]},
 {key:'taste',title:'What sounds like your kind of cup?',options:[['comfort','Chocolatey & comforting'],['mellow','Smooth & mellow'],['fruit','Bright & fruity'],['unsure','Help me discover']]}
];
let quizStep=0;const answers={};
function renderQuestion() {
  const question=questions[quizStep];
  $('#quiz-progress').textContent=(quizStep+1)+' / 3';
  $('#quiz-progress').setAttribute('aria-label','Question '+(quizStep+1)+' of 3');
  $('#quiz-question').innerHTML='<legend tabindex="-1">'+question.title+'</legend><div class="quiz-options">'+question.options.map(([value,label])=>'<label class="quiz-option"><input type="radio" name="answer" value="'+value+'" required '+(answers[question.key]===value?'checked':'')+'><span class="choice-mark" aria-hidden="true"></span><span class="choice-label">'+label+'</span></label>').join('')+'</div>';
  $('#quiz-back').hidden=quizStep===0;
  $('#quiz-next').textContent=quizStep===2?'Find my coffee':'Next';
}
function recommendation(input) {
  const id = input.taste==='comfort'?'daybreak':input.taste==='fruit'?'offbeat':input.taste==='mellow'?'slow-morning':input.milk==='milk'?'daybreak':'slow-morning';
  const reason=input.taste==='comfort'?'You chose chocolatey and comforting, so start with Daybreak’s rounded, darker-roast character.':input.taste==='fruit'?'You chose bright and fruity, so Offbeat gives you a lighter-roast starting point.':input.taste==='mellow'?'You chose smooth and mellow, so Slow Morning is your balanced starting point.':input.milk==='milk'?'You’re open to discovery and drink your coffee with milk. Daybreak is a comforting place to begin.':'You’re open to discovery. Slow Morning offers a mellow place to start before exploring brighter or darker coffees.';
  return {id,reason,grind:input.brew==='none'?'':input.brew};
}
function showRecommendation() {
  const result=recommendation(answers),product=products[result.id];
  const milkNote=result.id==='offbeat' && answers.milk==='milk'?'You also chose milk. Try a small splash first; this coffee’s brighter notes will taste different with it.':'';
  $('#finder-form').hidden=true;$('#quiz-result').hidden=false;
  $('#quiz-result').innerHTML='<p class="eyebrow">A GOOD PLACE TO START</p><h3 class="result-name" tabindex="-1">'+product.name+'</h3><p class="result-note">'+product.taste+'</p><div class="result-explanation"><strong>Why this coffee?</strong>'+result.reason+(milkNote?' '+milkNote:'')+'</div>'+(answers.brew==='none'?'<p class="result-no-brewer"><strong>You’ll need a brewer first.</strong><br>This coffee does not dissolve like instant. A French press or pour-over is one way to start; choose your equipment before selecting a grind.</p>':'<p class="result-note">Your format: <strong>'+grinds[result.grind]+'</strong>.</p>')+'<button class="button paper" id="use-recommendation">Explore '+product.name+'</button><button class="text-link" id="restart-quiz">Try different answers</button><p class="small-copy">A starting point based on your preferences, not a taste guarantee.</p>';
  $('#use-recommendation').addEventListener('click',()=>openProduct(result.id,result.grind));
  $('#restart-quiz').addEventListener('click',()=>{quizStep=0;$('#finder-form').hidden=false;$('#quiz-result').hidden=true;renderQuestion();$('#quiz-question legend').focus({preventScroll:true});});
  $('#quiz-result h3').focus({preventScroll:true});
}
$('#finder-form').addEventListener('submit',event=>{
  event.preventDefault();const value=new FormData(event.currentTarget).get('answer');
  if (!questions[quizStep].options.some(option=>option[0]===value))return;
  answers[questions[quizStep].key]=value;
  if (quizStep<2){quizStep++;renderQuestion();$('#quiz-question legend').focus({preventScroll:true});}else showRecommendation();
});
$('#quiz-back').addEventListener('click',()=>{const value=new FormData($('#finder-form')).get('answer');if(value)answers[questions[quizStep].key]=value;quizStep=Math.max(0,quizStep-1);renderQuestion();$('#quiz-question legend').focus({preventScroll:true});});
renderQuestion();renderCart();
// Tools stage the same demo bag as the visible controls; they never complete a purchase.
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  const register = tool => {
    try {Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
  };
  register({name:'read_coffee_catalog',title:'Read Side Note coffees',description:'Read the fictional coffee range, grind choices and demo prices. Does not change the bag.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>({coffees:Object.entries(products).map(([id,p])=>({id,name:p.name,taste:p.taste,roast:p.roast,pricesINR:p.price})),grinds,delivery:'India: ₹60, free from ₹1,000; taxes included',demo:true})});
  register({name:'stage_demo_coffee_bag',title:'Add coffee to the demo bag',description:'Add a coffee configuration to the visible demo bag. Opens the bag; does not buy, charge, subscribe or send information.',inputSchema:{type:'object',properties:{id:{type:'string',enum:Object.keys(products)},size:{type:'integer',enum:[250,500]},grind:{type:'string',enum:Object.keys(grinds)},frequency:{type:'string',enum:['once','repeat']},quantity:{type:'integer',minimum:1,maximum:8}},required:['id','size','grind','frequency','quantity'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{validateItem(input);addToCart(input);return{bags:cart.reduce((n,row)=>n+row.quantity,0),firstTotalINR:totals().total,repeatTotalINR:totals().recurringTotal,orderCreated:false};}});
}
