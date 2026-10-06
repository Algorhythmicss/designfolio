// Local workshop settings affect only the opening.
(() => {
 const schema=window.OpeningSettings,params=new URLSearchParams(location.search),root=document.documentElement;
 const type=params.get('type'),align=params.get('align');
 root.dataset.openingType=['editorial','delicate','modern'].includes(type)?type:'modern';
 root.dataset.openingAlign=['left','center','justify'].includes(align)?align:'center';
 if(params.get('study')==='1')root.dataset.openingStudy='';
 let values=schema.read(params);
 const apply=()=>schema.apply(root,values,root.dataset.openingType);
 apply();
 document.addEventListener('DOMContentLoaded',()=>{
  const hero=document.querySelector('.making'),copy=document.querySelector('.making-copy'),scope=document.querySelector('.scope-note'),art=document.querySelector('.making-art');
  let baseHeight=0,baseCopyBottom=0,baseArtHeight=0;
  function copyBottom(){return copy.getBoundingClientRect().bottom-hero.getBoundingClientRect().top;}
  function publish(){
   window.parent.postMessage({type:'opening:size-readout',title:parseFloat(getComputedStyle(document.querySelector('.making-title')).fontSize),promise:parseFloat(getComputedStyle(document.querySelector('.making-promise')).fontSize)},location.origin);
  }
  function updateLinks(){
   if(params.get('study')!=='1')return;
   for(const link of document.querySelectorAll('.header-contact,.work-invitation')){
    link.href=`index.html?${schema.query(values,root.dataset.openingType,root.dataset.openingAlign)}${link.hash}`;link.target='_top';
   }
  }
  function fitArt(){
   if(baseHeight){
    const copyGrowth=Math.max(0,copyBottom()-baseCopyBottom);
    const artGrowth=Math.max(0,art.getBoundingClientRect().height-baseArtHeight)*.35+Math.max(0,-values.artY);
    hero.style.minHeight=`${Math.ceil(baseHeight+copyGrowth+artGrowth)}px`;
   }
   // Center the invitation on the paper ribbon and leave a clear gap below the biography.
   const imageRect=art.getBoundingClientRect(),heroRect=hero.getBoundingClientRect();
   hero.style.setProperty('--invitation-x',`${imageRect.left-heroRect.left+imageRect.width*.50}px`);
   const invitationY=Math.max(imageRect.top-heroRect.top+imageRect.height*.83,copyBottom()+44);
   hero.style.setProperty('--invitation-y',`${invitationY}px`);
   publish();updateLinks();
  }
  function calibrate(){
   // Keep the approved composition as the baseline, then make space for each adjustment.
   const open=scope.open;scope.open=false;hero.style.removeProperty('min-height');
   schema.apply(root,schema.defaults,root.dataset.openingType);
   baseHeight=hero.offsetHeight;baseCopyBottom=copyBottom();baseArtHeight=art.getBoundingClientRect().height;
   scope.open=open;apply();fitArt();
  }
  calibrate();
  new ResizeObserver(fitArt).observe(copy);
  window.addEventListener('resize',calibrate);
  document.fonts.ready.then(calibrate);
  art.addEventListener('load',calibrate);
  window.addEventListener('message',event=>{
   if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='opening:set-settings')return;
   values=schema.read(event.data.values);apply();fitArt();
  });
 });
})();
