/* The monitor is measured in the light-paper 1895 x 830 Leetify v6 scene.
   Coordinates run around the inner aperture and beneath the small tape tab.
   data-monitor-polygon and data-monitor-source on .work-scene expose the map. */
(() => {
 'use strict';
 const sourceSize=[1895,830];
 const sourcePolygon=[[1027,206],[1551,209],[1551,224],[1574,224],[1573,504],[1022,502]];
 let scheduled=0;
 function init(){
  const root=document.documentElement,stop=document.getElementById('leetify');
  const scene=stop?.querySelector('.work-scene'),screen=stop?.querySelector('.screen');
  if(!scene||!screen)return;
  if(!scene.dataset.monitorPolygon)scene.dataset.monitorPolygon=sourcePolygon.map(point=>point.join(',')).join(' ');
  if(!scene.dataset.monitorSource)scene.dataset.monitorSource=sourceSize.join(' ');
  function position(token,space){
   if(token==='left'||token==='top')return 0;
   if(token==='right'||token==='bottom')return space;
   if(token==='center')return space/2;
   const n=parseFloat(token);
   return Number.isFinite(n)?token.endsWith('%')?space*n/100:n:space/2;
  }
  function map(){
   scheduled=0;
   if(root.dataset.workLayout!=='original'||!scene.naturalWidth||!scene.naturalHeight)return;
   const width=scene.clientWidth,height=scene.clientHeight;
   if(!width||!height)return;
   let points=scene.dataset.monitorPolygon.trim().split(/\s+/).map(pair=>pair.split(',').map(Number));
   if(points.length<4||points.length>12||points.some(point=>point.length!==2||point.some(n=>!Number.isFinite(n))))points=sourcePolygon;
   let reference=scene.dataset.monitorSource.trim().split(/\s+/).map(Number);
   if(reference.length!==2||reference.some(n=>!Number.isFinite(n)||n<=0))reference=sourceSize;
   points=points.map(([x,y])=>[x*scene.naturalWidth/reference[0],y*scene.naturalHeight/reference[1]]);
   const x=Math.min(...points.map(point=>point[0])),y=Math.min(...points.map(point=>point[1]));
   const roiWidth=Math.max(...points.map(point=>point[0]))-x,roiHeight=Math.max(...points.map(point=>point[1]))-y;
   if(!roiWidth||!roiHeight)return;
   const scale=Math.max(width/scene.naturalWidth,height/scene.naturalHeight);
   const renderedWidth=scene.naturalWidth*scale,renderedHeight=scene.naturalHeight*scale;
   // Narrow frames crop the whole composition around its actual monitor.
   // The screenshot then follows that crop, rather than floating independently.
   if(window.matchMedia('(max-width:1100px)').matches&&renderedWidth>width){
    const proportion=(width/2-(x+roiWidth/2)*scale)/(width-renderedWidth);
    scene.style.setProperty('--monitor-scene-position',`${Math.max(0,Math.min(1,proportion))*100}%`);
   }else scene.style.removeProperty('--monitor-scene-position');
   const tokens=getComputedStyle(scene).objectPosition.split(/\s+/);
   const offsetX=position(tokens[0]||'50%',width-renderedWidth);
   const offsetY=position(tokens[1]||'50%',height-renderedHeight);
   const vars={
    '--scene-screen-left':`${scene.offsetLeft+offsetX+x*scale}px`,
    '--scene-screen-top':`${scene.offsetTop+offsetY+y*scale}px`,
    '--scene-screen-width':`${roiWidth*scale}px`,
    '--scene-screen-height':`${roiHeight*scale}px`,
    '--scene-screen-clip':`polygon(${points.map(([px,py])=>`${(px-x)/roiWidth*100}% ${(py-y)/roiHeight*100}%`).join(',')})`
   };
   for(const [name,value] of Object.entries(vars))screen.style.setProperty(name,value);
   stop.dataset.screenFit='ready';
  }
  function schedule(){if(!scheduled)scheduled=requestAnimationFrame(map);}
  scene.addEventListener('load',schedule);
  window.addEventListener('resize',schedule);
  const resize=new ResizeObserver(schedule);resize.observe(scene);resize.observe(scene.parentElement);
  const layoutChanges=new MutationObserver(schedule);layoutChanges.observe(root,{attributes:true,attributeFilter:['data-work-layout']});
  const assetChanges=new MutationObserver(schedule);assetChanges.observe(scene,{attributes:true,attributeFilter:['src','data-monitor-polygon','data-monitor-source']});
  schedule();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
