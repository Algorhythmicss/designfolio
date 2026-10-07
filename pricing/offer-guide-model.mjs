// Offer decisions stay separate from the interface so every route can be checked.
const freeze = value => {
 if (value && typeof value === 'object') {
  for (const child of Object.values(value)) freeze(child);
  Object.freeze(value);
 }
 return value;
};

export const questions = freeze({
 start: {
  prompt: 'What are you working on?',
  hint: 'Start with where you are. You can change your answers or go straight to a conversation.',
  choices: [
   {id:'app',label:'An existing app',description:'Something has been built. It needs improving, preparing for launch or looking after.',next:'app-need'},
   {id:'idea',label:'A new product idea',description:'You want to turn an idea into its first working version.',next:'idea-need'},
   {id:'website',label:'A business website',description:'A clear place for people to understand your business and book or enquire.',next:'website-kind'}
  ]
 },
 'app-need': {
  prompt: 'What would help most right now?',
  hint: 'Choose the closest description. This suggests a starting point; we still agree the scope together.',
  choices: [
   {id:'launch',label:'Get it ready for people',description:'The look, important journeys and technical foundations need attention together.',next:'app-scope'},
   {id:'focused',label:'Fix one focused part',description:'The product broadly works; one specific area needs changing.',next:'app-focus'},
   {id:'ongoing',label:'Keep improving it',description:'You want support after launch or help working through new features.',next:'app-continuity'},
   {id:'unsure',label:'Find out what needs fixing',description:'You want a considered review and a plan before committing to a build.',offer:'product-review'},
   {id:'first-look',label:'Just give me a first impression',description:'A free, three-minute look at what a new user understands and where they hesitate.',offer:'first-impression'}
  ]
 },
 'app-focus': {
  prompt: 'Which part needs attention?',
  hint: 'A focused week is for one agreed area, with access and feedback ready.',
  choices: [
   {id:'look',label:'Its look and one existing flow',description:'Type, colour and interface style, applied to an agreed journey in code.',offer:'look-week'},
   {id:'foundations',label:'Auth, data access or error tracking',description:'An agreed set of technical fixes, with the changes and limits documented.',offer:'lockdown-week'},
   {id:'other',label:'Something else, or a bigger change',description:'Describe it first so I can suggest an honest scope.',offer:'conversation'}
  ]
 },
 'app-continuity': {
  prompt: 'How often do you need help?',
  hint: 'Regular building and occasional maintenance need different amounts of time.',
  choices: [
   {id:'regular',label:'Regular design and development',description:'A prioritised backlog, working updates and one request at a time.',offer:'monthly-partner'},
   {id:'occasional',label:'An occasional review and small fix',description:'One focused check-in each quarter, rather than ongoing development.',offer:'quarterly-checkin'}
  ]
 },
 'app-scope': {
  prompt: 'How much needs to change?',
  hint: 'The Sprint improves a working app. A major rebuild or regulated system needs a separate scope conversation.',
  choices: [
   {id:'key-journeys',label:'A few key journeys',description:'Up to three existing flows and around twelve screens, with the product otherwise working.',offer:'product-upgrade'},
   {id:'whole-app',label:'The whole app, or a large rebuild',description:'A broken foundation, large new features or more than a few important journeys.',offer:'conversation'},
   {id:'regulated',label:'Regulated health or financial data',description:'The fixed Sprint is not offered for these systems. Let’s establish what is appropriate first.',offer:'conversation'}
  ]
 },
 'idea-need': {
  prompt: 'Where is the idea now?',
  hint: 'A product review needs an existing product. For a new idea, we start with scope and a working first release.',
  choices: [
   {id:'first-release',label:'I’m ready to plan a first release',description:'Agree a small, useful version, then design, build and launch it.',offer:'first-product'},
   {id:'defining',label:'I’m still defining it',description:'Talk through the problem, audience and scope before choosing a paid project.',offer:'conversation'}
  ]
 },
 'website-kind': {
  prompt: 'What kind of business is it for?',
  hint: 'A focused website is ₹60,000 / $2,500. Pick the closest business type.',
  choices: [
   {id:'clinic',label:'A clinic',description:'Explain the practice and make booking or enquiries straightforward.',offer:'website-week',audience:'clinic'},
   {id:'studio',label:'A studio',description:'Show the work and make the right enquiries easier.',offer:'website-week',audience:'studio'},
   {id:'cafe',label:'A café',description:'Give the place its own look and make a visit or enquiry easier.',offer:'website-week',audience:'cafe'},
   {id:'other',label:'Another business',description:'The same focused website offer, with scope agreed for your business.',offer:'website-week'}
  ]
 }
});

const fixedPayment = 'For standalone fixed projects, half is paid up front and half at handover or launch. Scope, price and the reserved start are agreed first. Applicable taxes and third-party costs are itemised in the quote.';
const founding = 'If a founding-client place is available, the first three clients receive 30% off standalone service list prices with an agreed case study. What may be shared is agreed in advance; feedback never has to be positive. Availability is confirmed before booking.';
const readyStart = 'Timed promises require the agreed inputs and access at the reserved start, with consolidated replies within one day. Client-blocked days shift the agreed date.';
const checkCredit = 'The Check fee actually paid, less refunds, is credited once against the Sprint portion of a Sprint or Launch & Grow booked within 30 days of Check handover. Book within seven days and the Launch Kit—a landing-page hero section and social images—is free. Outside that window it is a separately quoted add-on; a refunded Check creates no credit.';

export const offers = freeze({
 'first-impression': {
  name:'Free first-impression video',time:'Three-minute video',price:'Free',international:'Free',
  summary:'See the first thing a new user understands, hesitates over or might leave because of.',
  fit:'A possible first step when you want a small, outside impression of an existing product.',
  includes:['A recorded first-use impression','Where I hesitate or lose the thread','The first thing I would change'],
  essential:'Needs a public product URL. I confirm fit and availability; this is not a full review or code check.',
  detail:['The video is a focused first impression of a public product, not a security audit, implementation project or promise of improved conversion.','Your enquiry prepares an editable email draft. It does not send a message or automatically reserve a slot.'],
  cta:'Request a free first impression',goal:'first-impression'
 },
 'product-review': {
  name:'3-Day Launch-Ready Check',time:'Three days',price:'₹20,000',international:'$500',
  summary:'Understand what needs changing before committing to a bigger piece of work.',
  fit:'A possible fit when you have an existing app but need a prioritised diagnosis and plan.',
  includes:['Recorded new-user walkthrough and ranked findings','One key screen rebuilt as a review prototype','Written 14-day plan and a 30-minute handover call'],
  essential:'Five actionable problems worth fixing, or the Check fee is refunded. The screen is a prototype; full integration is separate.',
  detail:['The first finding arrives within 24 hours of the reserved start, with access ready. The walkthrough covers agreed onboarding, core-task and payment journeys. Code and data-access checks are limited to agreed access and obvious risks; they are not a security audit or certification.',checkCredit,fixedPayment,founding],
  cta:'Review my product',goal:'product-review'
 },
 'product-upgrade': {
  name:'14-Day Launch-Ready Sprint',time:'Fourteen days',price:'₹2.5 lakh',international:'$6,000',
  summary:'Give a working app its own look, clearer journeys and agreed technical fixes, then launch.',
  fit:'A possible fit for several launch issues across up to three existing flows and around twelve screens.',
  includes:['New Look and up to three flows rebuilt in code','Agreed auth, data-access and payment fixes','Key-step analytics, error tracking and launch handover'],
  essential:'One visual redo; late credits capped at 10% of the agreed fee. Ready inputs and one-day replies are required. Not a full rebuild or regulated-data project.',
  detail:['The visual direction is reviewed on day five. If it misses the mark, I redo it once within the agreed scope. Conversations with three to five users inform the flows; you arrange introductions. About three hours of founder time are planned, with a progress video every two days.','The agreed priority fix ships in the first 48 hours with access ready. Account separation is tested with two accounts where relevant. If no priority security fix is needed, we agree another priority fix. Lockdown is scoped remediation, not a security audit, certification or complete-security promise.','₹5,000 / $150 is credited per Monday–Friday working day after the agreed launch date, capped at 10% of the agreed Sprint fee: ₹25,000 / $600 at list price. A reduction lowers the total fee; it is deducted from the balance and any overpayment is refunded.',readyStart,'The AI-readable style guide, User Voice report and a one-page distribution plan are included. Distribution advice draws on Leetify; audience growth is not promised. Defects in delivered, agreed scope are fixed for 30 days after launch; new features, client changes and third-party failures are excluded.',checkCredit,fixedPayment,founding],
  cta:'Plan my Launch-Ready Sprint',scopeHref:'launch-ready-sprint/',goal:'product-upgrade'
 },
 'monthly-partner': {
  name:'Ship Every Week',time:'Ongoing, billed monthly',price:'₹1.5 lakh / month',international:'$3,500 / month',
  summary:'Keep a product improving with someone who can design the work and ship it.',
  fit:'A possible fit for regular design and development on an existing product.',
  includes:['Up to 30 hours each month on an agreed backlog','One request and workstream at a time','Weekly call and a working update at the agreed checkpoint'],
  essential:'30 hours per month. New clients pay ₹25,000 / $500 onboarding, waived after a Sprint or with a three-month commitment. Billed in advance.',
  detail:['Two weeks’ notice stops renewal. Scope and priorities fit the reserved hours; unused hours do not roll over. Work beyond 30 hours requires a separate quote.','Once per engagement, report a paid month that was not worth it within seven days of its ending and the next consecutive reserved month is free: up to 30 hours on the same workstream. A free month cannot trigger another free month. If prepaid, its actual service fee is refunded; otherwise that charge is waived.','A prepaid quarter is ₹4.05 lakh / $9,450, reserving up to 30 hours each month and including a monthly analytics review and three recommendations. Renewal and end terms are agreed in the quote. A guaranteed free month uses the actual quarter service fee divided by three.','If a founding-client place is available, the 30% recurring discount applies to the first month only; later months are at list price. It does not stack with a bundle or prepaid-quarter rate, and the separate onboarding fee is not discounted. Applicable taxes and third-party costs are itemised in the quote.'],
  cta:'Keep shipping together',goal:'monthly-partner'
 },
 'first-product': {
  name:'Idea to Launch in 6 Weeks',time:'Six weeks, after scope is agreed',price:'From ₹6 lakh',international:'From $12,000',
  summary:'Turn an agreed, useful first version into a designed, working product.',
  fit:'A possible fit when there is no working app yet and you are ready to agree a first-release scope.',
  includes:['First-release flows and interface design','Frontend and backend built within the agreed scope','A working coded demo each week, launch and handover'],
  essential:'A scoped first release, not an unlimited build. A missed weekly coded demo credits one-sixth of the agreed fee, capped at the total fee.',
  detail:['The six-week plan is agreed before booking and covers the selected first-release scope. A working coded demo is due at each agreed weekly checkpoint, not merely a design file.','A missed weekly working demo credits one-sixth of the agreed build fee for the affected week, with total credits capped at the full agreed fee. Reductions lower the total fee, are deducted from the balance and any overpayment is refunded.',readyStart,fixedPayment,founding],
  cta:'Plan a first release',scopeHref:'idea-to-launch/',goal:'first-product'
 },
 'website-week': {
  name:'7-Day Website',time:'Seven days, with inputs ready',price:'₹60,000',international:'$2,500',
  summary:'Give your business a look of its own and a clear route to booking or enquiries.',
  fit:'A possible fit for a focused business website, rather than a custom software product.',
  includes:['Up to five pages with a business-specific look and copy help','Phone-friendly booking or enquiry route and SEO basics','Google Business Profile setup and three Instagram templates'],
  essential:'Up to five pages, with content and access ready. If the agreed launch is late, the total service fee is reduced by 50%.',
  detail:['The scope includes a booking or enquiry form, SEO basics, Google Business Profile setup and three Instagram templates. A WhatsApp button is included when the client authorises publishing their number; custom software, paid tools and larger integrations are scoped separately.','Live within seven days or the total agreed service fee is reduced by 50%. With half paid up front, the remaining half is waived; any overpayment is refunded. This is one fee reduction, not an additional refund on top of a waived balance.',readyStart,fixedPayment,founding],
  cta:'Plan my business website',goal:'website-week'
 },
 'launch-grow': {
  name:'Launch & Grow',time:'One Sprint and three following months',price:'₹6.5 lakh',international:'$15,000',
  summary:'Improve the app now and reserve the capacity to keep shipping after launch.',
  fit:'An optional continuation if the Sprint fits and you also want three months of ongoing work.',
  includes:['The fixed-scope Launch-Ready Sprint','Three months of Ship Every Week, up to 30 hours each month','Monthly analytics reviews and no post-Sprint onboarding fee'],
  essential:'Paid up front. The Sprint scope and following 90 hours are separate. Bundle and founding or quarter-prepayment discounts do not stack.',
  detail:['The bundle is a Launch-Ready Sprint followed by three months of Ship Every Week. The 90 ongoing hours are spread over those three months, separate from the Sprint’s fixed scope. One prioritised workstream is handled at a time.','Separately, with monthly billing, the services total ₹7 lakh / $16,500. The bundle quote itemises its Sprint and monthly component fees so the agreed guarantees use those component fees. The prepaid-quarter and founding discounts do not stack with this bundle.','The Sprint’s one visual redo and working-day late credits capped at 10% of the agreed Sprint component apply. The monthly guarantee applies once per engagement to the next consecutive reserved month, up to 30 hours on the same workstream. A prepaid guaranteed free month refunds its actual service fee.',readyStart,checkCredit,'Applicable taxes and third-party costs are itemised in the quote. Availability is confirmed on the same solo calendar as other services.'],
  cta:'Plan launch and what follows',scopeHref:'launch-ready-sprint/',goal:'launch-grow'
 },
 'lockdown-week': {
  name:'Lockdown Week',time:'One focused week',price:'₹1 lakh',international:'$2,500',
  summary:'Address an agreed set of auth and data-access risks, with clearer error reporting.',
  fit:'A possible fit when one defined technical area needs attention rather than a wider launch upgrade.',
  includes:['Agreed authentication and data-access fixes','Account-separation checks where relevant and error tracking','Written handover of changes and anything remaining'],
  essential:'One agreed remediation scope. This is not a security audit, certification or promise to close every vulnerability.',
  detail:['The week begins with agreed access ready. Changes are tested within the agreed scope, including account separation where relevant. Larger architecture work and full rewrites require a separate scope.',readyStart,fixedPayment,founding],
  cta:'Fix the foundations',goal:'lockdown-week'
 },
 'look-week': {
  name:'Look Week',time:'One focused week',price:'₹1.25 lakh',international:'$3,000',
  summary:'Give the interface a considered visual direction and rebuild one agreed existing flow.',
  fit:'A possible fit when the app broadly works and its look is the main change you need.',
  includes:['Type, colour and interface style for the agreed flow','One existing journey redesigned and rebuilt in code','One visual-direction redo if the first misses the mark'],
  essential:'One existing flow. Not a complete brand identity, new feature build or full Sprint. Access and consolidated feedback must be ready.',
  detail:['One visual-direction redo is included within the same agreed scope at no extra charge. The offer focuses on the selected existing flow, not a full brand identity, new product features or all screens.',readyStart,fixedPayment,founding],
  cta:'Give it its own look',goal:'look-week'
 },
 'quarterly-checkin': {
  name:'Quarterly Check-in',time:'Once a quarter',price:'₹40,000 / quarter',international:'$1,000 / quarter',
  summary:'Check how the product is doing and make one small, agreed improvement.',
  fit:'A possible fit when you need occasional attention rather than regular feature development.',
  includes:['One scoped product review each quarter','One small, agreed fix','A clear account of what changed and what needs separate scope'],
  essential:'One review and one small fix per quarter. This does not reserve continuous support or a development backlog.',
  detail:['Review scope, the small fix and the reserved check-in are agreed before booking. Larger changes need a separate quote.','Founding-client eligibility is confirmed in the quote. A founding discount does not stack with bundle or quarter-prepayment rates. Applicable taxes and third-party costs are itemised in the quote.'],
  cta:'Plan a quarterly check-in',goal:'quarterly-checkin'
 },
 conversation: {
  name:'A scope conversation first',time:'Before choosing a project',price:'Scope first',international:'Scope first',
  summary:'Describe the work so we can establish the right scope before choosing a paid offer.',
  fit:'A starting point when the idea is still forming or the work does not fit the defined packages.',
  includes:['Discuss the problem and what already exists','Identify the useful first scope and its constraints','Confirm fit, next steps and a quote if appropriate'],
  essential:'This is a conversation, not a paid product Check or a promise that a fixed package covers the work.',
  detail:['A broken app, full rewrite, large new features or work involving regulated health or financial data should not receive an automatic fixed Sprint recommendation. Fit and any specialist requirements must be established first.','Your enquiry opens an editable email draft. It does not send a message, reserve time or commit you to a paid project.'],
  cta:'Tell me what you need',goal:'conversation'
 }
});

const owns = (object, key) => typeof key === 'string' && Object.hasOwn(object,key);
const audiences = new Set(['clinic','studio','cafe']);

export function route(questionId, choiceId) {
 if (!owns(questions,questionId)) throw new Error('Unknown offer question.');
 const choice = questions[questionId].choices.find(item => item.id === choiceId);
 if (!choice) throw new Error('Unknown offer choice.');
 if (choice.next && owns(questions,choice.next)) return {next:choice.next};
 if (choice.offer && owns(offers,choice.offer)) return {offer:choice.offer,...(choice.audience?{audience:choice.audience}:{})};
 throw new Error('Invalid offer transition.');
}

export function offerFromHash(hash) {
 if (typeof hash !== 'string') return null;
 const id = hash.startsWith('#') ? hash.slice(1) : hash;
 return id !== 'conversation' && owns(offers,id) ? id : null;
}

export function enquiryHref(id, audience) {
 if (!owns(offers,id)) throw new Error('Unknown enquiry offer.');
 if (audience !== undefined && (id !== 'website-week' || !audiences.has(audience))) throw new Error('Invalid website audience.');
 const query = new URLSearchParams({offer:id,guided:'1'});
 if (audience !== undefined) query.set('audience',audience);
 return `../?${query.toString()}#contact`;
}
