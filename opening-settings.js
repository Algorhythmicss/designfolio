// Shared settings for the local opening workshop.
(() => {
 const controls=[
  {key:'titleScale',label:'I design and build',min:60,max:150,step:5,default:70,css:'--opening-title-scale',factor:.01,unit:'%',primary:true},
  {key:'promiseScale',label:'products people use.',min:60,max:160,step:5,default:120,css:'--opening-promise-scale',factor:.01,unit:'%',primary:true},
  {key:'headingWeight',label:'Heading weight',group:'Typography',min:400,max:800,step:50,default:600,css:'--opening-heading-weight',unit:''},
  {key:'headingTracking',label:'Heading letter spacing',group:'Typography',min:-80,max:0,step:5,default:-65,css:'--opening-heading-tracking',factor:.001,unit:'em'},
  {key:'headingLeading',label:'Heading line spacing',group:'Typography',min:95,max:135,step:5,default:110,css:'--opening-heading-leading',factor:.01,unit:''},
  {key:'blueLeading',label:'Blue line spacing',group:'Typography',min:100,max:140,step:2,default:112,css:'--opening-blue-leading',factor:.01,unit:''},
  {key:'bioSize',label:'Bio text size',group:'Typography',min:16,max:22,step:.5,default:19,css:'--opening-bio-size',unit:'px'},
  {key:'bioLeading',label:'Bio line spacing',group:'Typography',min:130,max:180,step:1,default:134,css:'--opening-bio-leading',factor:.01,unit:''},
  {key:'summarySize',label:'More… text size',group:'Typography',min:20,max:32,step:1,default:25,css:'--opening-summary-size',unit:'px'},
  {key:'summaryWeight',label:'More… text weight',group:'Typography',min:400,max:800,step:50,default:400,css:'--opening-summary-weight',unit:''},
  {key:'headingWidth',label:'Heading width',group:'Spacing & shape',min:520,max:840,step:20,default:660,css:'--opening-heading-width',unit:'px'},
  {key:'bioWidth',label:'Bio width',group:'Spacing & shape',min:380,max:580,step:10,default:430,css:'--opening-bio-width',unit:'px'},
  {key:'lineGap',label:'Gap between heading lines',group:'Spacing & shape',min:0,max:30,step:1,default:1,css:'--opening-line-gap',unit:'px'},
  {key:'bioGap',label:'Gap before bio',group:'Spacing & shape',min:12,max:60,step:1,default:21,css:'--opening-bio-gap',unit:'px'},
  {key:'paragraphGap',label:'Gap between paragraphs',group:'Spacing & shape',min:8,max:32,step:1,default:11,css:'--opening-paragraph-gap',unit:'px'},
  {key:'summaryGap',label:'Gap before More…',group:'Spacing & shape',min:8,max:36,step:1,default:13,css:'--opening-summary-gap',unit:'px'},
  {key:'topOffset',label:'Move text up / down',group:'Spacing & shape',min:-30,max:60,step:2,default:0,css:'--opening-top-offset',unit:'px'},
  {key:'artScale',label:'Art scale',group:'Artwork',min:90,max:110,step:1,default:103,css:'--opening-art-scale',factor:.01,unit:'%'},
  {key:'artX',label:'Move art left / right',group:'Artwork',min:-5,max:5,step:.5,default:0,css:'--opening-art-x',unit:'%'},
  {key:'artY',label:'Move art up / down',group:'Artwork',min:-30,max:30,step:2,default:-30,css:'--opening-art-y',unit:'px'}
 ];
 const defaults=Object.fromEntries(controls.map(c=>[c.key,c.default]));
 function value(control,input){const n=Number(input);return input!==null&&input!==undefined&&input!==''&&Number.isFinite(n)?Math.min(control.max,Math.max(control.min,n)):control.default;}
 function read(source){return Object.fromEntries(controls.map(c=>[c.key,value(c,source instanceof URLSearchParams?source.get(c.key):source[c.key]) ]));}
 function query(values,type,align){const q=new URLSearchParams({type,align,v:'5'});for(const c of controls)if(c.primary||values[c.key]!==c.default)q.set(c.key,values[c.key]);return q;}
 function apply(root,values,type){
  for(const c of controls){
   // Unchanged settings retain the existing responsive defaults.
   if(values[c.key]===c.default){root.style.removeProperty(c.css);continue;}
   const number=values[c.key]*(c.factor||1),unit=c.factor?'':c.unit;
   root.style.setProperty(c.css,`${number}${unit}`);
  }
  root.style.setProperty('--opening-title-scale',values.titleScale/100);
  root.style.setProperty('--opening-promise-scale',values.promiseScale/100);
  root.style.setProperty('--opening-heading-tracking',`${values.headingTracking/1000}em`);
  root.style.setProperty('--opening-heading-weight',type==='delicate'?400:values.headingWeight);
  root.toggleAttribute('data-opening-scaled',values.titleScale!==100||values.promiseScale!==100);
 }
 window.OpeningSettings={controls,defaults,value,read,query,apply};
})();
