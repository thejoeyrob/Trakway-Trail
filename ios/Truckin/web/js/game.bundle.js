(function(){'use strict';const modules={"./route-atlas.js":function(module,exports,require){
/* Generated atlas crop metadata; coordinates are source pixels. */
const ROUTE_ATLAS={"surfaces":{"size":[1254,1254],"rects":[[0,0,314,314],[314,0,313,314],[627,0,313,314],[940,0,314,314],[0,314,314,313],[314,314,313,313],[627,314,313,313],[940,314,314,313],[0,627,314,313],[314,627,313,313],[627,627,313,313],[940,627,314,313],[0,940,314,314],[314,940,313,314],[627,940,313,314],[940,940,314,314]]},"props":{"size":[1254,1254],"rects":[[37,23,243,276],[325,24,293,272],[667,19,233,280],[1043,14,115,290],[76,330,175,289],[322,427,296,98],[639,350,286,246],[953,372,289,203],[13,651,287,274],[323,666,291,241],[638,688,288,199],[947,692,300,191],[27,974,259,263],[349,974,244,256],[675,981,217,247],[950,1032,293,136]]},"trucks":{"size":[1774,887],"rects":[[122,14,222,413],[566,13,222,414],[1010,13,221,414],[1480,11,144,425],[134,462,177,407],[575,468,182,388],[918,616,381,103],[1391,549,324,213]]},"showroom":{"size":[1774,887],"rects":[[139,32,170,362],[487,43,353,349],[900,154,413,153],[1377,76,344,305],[150,470,147,374],[498,508,345,316],[900,591,418,154],[1362,495,368,331]]},"scenery":{"size":[1774,887],"rects":[[30,31,388,405],[463,69,405,367],[903,112,410,301],[1346,30,415,399],[17,508,415,339],[499,480,335,375],[915,486,388,369],[1355,551,388,274]]}};

module.exports={ROUTE_ATLAS};

},
"./propart.js":function(module,exports,require){
/* Hand-drawn top-down props (no image files): cow, tractor, hay bale, ice-cream van, geese, lucky horseshoe.
   Each draws centred on (0,0) inside a w x h box, lit from the top-left like the painted atlas art. t = seconds, for tail swish, beacons, etc. */
const TAU=Math.PI*2;
function shadow(c,w,h,a=.28){c.save();c.fillStyle='rgba(8,18,14,'+a+')';c.beginPath();c.ellipse(w*.06,h*.05,w*.5,h*.5,0,0,TAU);c.fill();c.restore();}
function blob(c,x,y,rx,ry,fill,rot=0){c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,rot,0,TAU);c.fill();}
function rr(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
function glowSpot(c,x,y){const g=c.createRadialGradient(x,y,1,x,y,14);g.addColorStop(0,'#ffcf5acc');g.addColorStop(1,'#ffcf5a00');c.fillStyle=g;c.fillRect(x-14,y-14,28,28);}
function grad(c,x0,y0,x1,y1,a,b){const g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
const ART={
 cow(c,w,h,t){
  shadow(c,w*.95,h*.8);
  const sw=Math.sin(t*3)*3;
  // tail, legs
  c.strokeStyle='#d8d2c4';c.lineWidth=2.4;c.lineCap='round';c.beginPath();c.moveTo(0,-h*.32);c.quadraticCurveTo(sw*1.4,-h*.45,sw*2,-h*.5);c.stroke();blob(c,sw*2,-h*.5,2.6,3.4,'#2a2622');
  for(const [x,y] of [[-.27,-.2],[.27,-.2],[-.27,.14],[.27,.14]])blob(c,x*w,y*h,w*.07,h*.06,'#27231f');
  // body
  c.fillStyle=grad(c,-w*.4,0,w*.4,0,'#fbf8ef','#e1dccd');rr(c,-w*.37,-h*.34,w*.74,h*.62,w*.3);c.fill();
  c.fillStyle='#262320';
  c.beginPath();c.ellipse(-w*.14,-h*.15,w*.17,h*.12,.4,0,TAU);c.fill();c.beginPath();c.ellipse(w*.16,h*.02,w*.2,h*.1,-.3,0,TAU);c.fill();c.beginPath();c.ellipse(-w*.1,h*.15,w*.1,h*.07,0,0,TAU);c.fill();
  c.strokeStyle='#bdb7a6';c.lineWidth=1.3;c.beginPath();c.moveTo(0,-h*.32);c.lineTo(0,h*.26);c.stroke();
  // head, facing the truck (down the screen)
  blob(c,0,h*.36,w*.22,h*.15,'#f0ebde');blob(c,-w*.08,h*.34,w*.1,h*.07,'#262320');
  blob(c,0,h*.43,w*.15,h*.07,'#f3b3b0');blob(c,-w*.05,h*.44,1.6,1.4,'#7a3b3b');blob(c,w*.05,h*.44,1.6,1.4,'#7a3b3b');
  blob(c,-w*.12,h*.33,2.4,2.6,'#101010');blob(c,w*.12,h*.33,2.4,2.6,'#101010');
  blob(c,-w*.3,h*.31,w*.09,h*.04,'#e8e2d2',-.4);blob(c,w*.3,h*.31,w*.09,h*.04,'#e8e2d2',.4);
  c.strokeStyle='#e9d9a5';c.lineWidth=2.4;c.beginPath();c.moveTo(-w*.16,h*.28);c.lineTo(-w*.2,h*.24);c.moveTo(w*.16,h*.28);c.lineTo(w*.2,h*.24);c.stroke();
 },
 tractor(c,w,h,t){
  shadow(c,w*1.05,h*.95);
  // rear wheels, front wheels
  for(const s of[-1,1]){c.fillStyle='#1d1f1d';rr(c,s*w*.5-w*.13+(s>0?0:0),h*.04,w*.26,h*.34,5);c.fill();c.fillStyle='#e8c53a';rr(c,s*w*.5-w*.04,h*.14,w*.08,h*.14,2);c.fill();
   c.fillStyle='#1d1f1d';rr(c,s*w*.38-w*.07,-h*.34,w*.14,h*.17,3);c.fill();}
  // chassis + bonnet + cab
  c.fillStyle='#37403c';rr(c,-w*.11,-h*.4,w*.22,h*.8,3);c.fill();
  c.fillStyle=grad(c,-w*.3,0,w*.3,0,'#d6402f','#9f2a20');rr(c,-w*.26,-h*.45,w*.52,h*.42,9);c.fill();
  c.fillStyle='#ffffff30';rr(c,-w*.2,-h*.43,w*.1,h*.34,4);c.fill();
  c.fillStyle='#2b2f2d';c.beginPath();c.arc(w*.12,-h*.38,3,0,TAU);c.fill();c.fillRect(w*.115,-h*.5,1.8,h*.14);
  c.fillStyle=grad(c,-w*.3,0,w*.3,0,'#e5e0cf','#bdb7a4');rr(c,-w*.3,-h*.02,w*.6,h*.4,6);c.fill();
  c.fillStyle='#51606a';rr(c,-w*.24,h*.0,w*.48,h*.1,3);c.fill();rr(c,-w*.24,h*.27,w*.48,h*.08,3);c.fill();
  c.fillStyle='#ffffff55';c.fillRect(-w*.22,h*.14,w*.44,2);
  // amber beacon
  const on=Math.sin(t*9)>0;c.fillStyle=on?'#ffc23a':'#a8721a';c.beginPath();c.arc(0,h*.3,4,0,TAU);c.fill();if(on){const g=c.createRadialGradient(0,h*.3,1,0,h*.3,16);g.addColorStop(0,'#ffcf5acc');g.addColorStop(1,'#ffcf5a00');c.fillStyle=g;c.fillRect(-18,h*.3-18,36,36);}
 },
 haybale(c,w,h,t){
  shadow(c,w*.95,h*.95);
  c.fillStyle=grad(c,-w*.4,-h*.4,w*.4,h*.4,'#f0cf6e','#c79a35');rr(c,-w*.42,-h*.4,w*.84,h*.8,h*.2);c.fill();
  c.strokeStyle='#a97b22';c.lineWidth=1.1;for(let i=-4;i<=4;i++){c.beginPath();c.moveTo(-w*.4,i*h*.085);c.lineTo(w*.4,i*h*.085+Math.sin(i)*2);c.stroke();}
  c.strokeStyle='#d9692a';c.lineWidth=3;for(const x of[-w*.2,w*.2]){c.beginPath();c.moveTo(x,-h*.4);c.lineTo(x,h*.4);c.stroke();}
  c.strokeStyle='#ffe9a0aa';c.lineWidth=1.4;for(let i=0;i<9;i++){const x=((i*37)%80-40)/40*w*.35,y=((i*53)%80-40)/40*h*.32;c.beginPath();c.moveTo(x,y);c.lineTo(x+5,y-4);c.stroke();}
 },
 icecream(c,w,h,t){
  shadow(c,w*1.05,h*.95);
  c.fillStyle='#181c1c';for(const y of[-.28,.26])for(const s of[-1,1]){rr(c,s*w*.47-w*.06,h*y-h*.06,w*.12,h*.12,3);c.fill();}
  c.fillStyle=grad(c,-w*.4,0,w*.4,0,'#fff4e2','#e3d6bd');rr(c,-w*.4,-h*.46,w*.8,h*.92,w*.2);c.fill();
  c.fillStyle='#f2639b';rr(c,-w*.4,h*.02,w*.8,h*.1,3);c.fill();c.fillStyle='#38c3d1';rr(c,-w*.4,h*.12,w*.8,h*.07,3);c.fill();
  c.fillStyle='#43565c';rr(c,-w*.32,-h*.4,w*.64,h*.17,5);c.fill();c.fillStyle='#ffffff45';c.fillRect(-w*.28,-h*.38,w*.56,2);
  // roof: giant cone from above, loudspeaker
  blob(c,0,-h*.1,w*.27,w*.27,'#f6c06a');c.strokeStyle='#d9983a';c.lineWidth=1.2;for(let i=0;i<8;i++){const a=i/8*TAU;c.beginPath();c.moveTo(0,-h*.1);c.lineTo(Math.cos(a)*w*.27,-h*.1+Math.sin(a)*w*.27);c.stroke();}
  blob(c,0,-h*.1,w*.2,w*.2,'#ff9fc4');blob(c,-w*.04,-h*.13,w*.1,w*.1,'#ffd1e3');blob(c,0,-h*.1,w*.045,w*.045,'#d8466f');
  c.fillStyle='#2d3436';rr(c,-w*.2,h*.27,w*.4,h*.1,3);c.fill();
  const on=Math.sin(t*6)>0;c.fillStyle=on?'#ffe14a':'#9c8a2e';c.beginPath();c.arc(-w*.3,-h*.44,2.6,0,TAU);c.arc(w*.3,-h*.44,2.6,0,TAU);c.fill();
 },
 geese(c,w,h,t){
  shadow(c,w*.9,h*.8,.2);
  const pos=[[-.28,-.2,.3],[.22,-.28,-.2],[-.05,.08,.1],[.3,.2,-.4],[-.3,.28,.5]];
  for(const [x,y,r] of pos){c.save();c.translate(x*w,y*h);c.rotate(r+Math.sin(t*4+x*9)*.08);
   blob(c,0,0,w*.11,h*.15,'#fbfaf5');blob(c,-w*.09,0,w*.05,h*.1,'#d9d8cf',.3);blob(c,w*.09,0,w*.05,h*.1,'#d9d8cf',-.3);
   c.fillStyle='#2f2f2f';c.beginPath();c.ellipse(0,h*.14,w*.03,h*.05,0,0,TAU);c.fill();
   c.strokeStyle='#fbfaf5';c.lineWidth=3;c.beginPath();c.moveTo(0,-h*.12);c.lineTo(0,-h*.22);c.stroke();blob(c,0,-h*.23,w*.04,h*.04,'#fbfaf5');
   c.fillStyle='#f08a24';c.beginPath();c.moveTo(-2.5,-h*.25);c.lineTo(2.5,-h*.25);c.lineTo(0,-h*.32);c.fill();c.restore();}
 },
 morris(c,w,h,t){
  shadow(c,w*.95,h*.85,.2);
  const pos=[[-.3,-.22],[.3,-.22],[0,0],[-.3,.24],[.3,.24]];
  pos.forEach(([x,y],i)=>{c.save();c.translate(x*w,y*h);const sw=Math.sin(t*6+i*1.3);
   blob(c,0,0,w*.15,h*.1,'#f6f4ec');                                   // white shirt shoulders
   c.strokeStyle=i%2?'#c63a3a':'#2e8a4b';c.lineWidth=3;c.beginPath();c.moveTo(-w*.1,-h*.07);c.lineTo(w*.1,h*.07);c.stroke(); // baldric
   for(const s2 of[-1,1]){c.strokeStyle='#f6f4ec';c.lineWidth=3.2;c.lineCap='round';c.beginPath();c.moveTo(s2*w*.12,0);c.lineTo(s2*(w*.22+sw*3),-h*.12+sw*4);c.stroke();blob(c,s2*(w*.22+sw*3),-h*.12+sw*4,2.6,2.6,i%2?'#d94a4a':'#fff');}
   blob(c,0,0,w*.075,w*.075,'#e7b48f');                                 // head
   blob(c,0,-1,w*.1,w*.09,'#2b2b33');blob(c,w*.05,-2,2.6,2.6,'#ff6fa5');blob(c,-w*.04,-3,2.2,2.2,'#ffd23a');   // hat with flowers
   c.restore();});
 },
 cyclists(c,w,h,t){
  shadow(c,w*.8,h*.9,.2);
  const pos=[[-.2,-.28,'#e8402f'],[.2,-.18,'#2f7be8'],[-.18,.14,'#f2c21a'],[.22,.26,'#31b36b']];
  pos.forEach(([x,y,col])=>{c.save();c.translate(x*w,y*h);const sw=Math.sin(t*9+x*20)*1.2;
   c.strokeStyle='#1d2124';c.lineWidth=2.2;c.beginPath();c.moveTo(0,-h*.17);c.lineTo(0,h*.17);c.stroke();                              // bike
   c.fillStyle='#14181a';c.fillRect(-w*.07,-h*.19,w*.14,3);c.fillRect(-w*.05,h*.15,w*.1,3);                                               // wheels
   blob(c,0,-h*.01,w*.11,h*.06,col);blob(c,sw,-h*.05,w*.06,w*.06,'#f2f2f2');blob(c,sw,-h*.05,w*.045,w*.045,col);                      // lycra, helmet
   c.strokeStyle=col;c.lineWidth=2.6;c.beginPath();c.moveTo(-w*.07,-h*.02);c.lineTo(-w*.03,-h*.14);c.moveTo(w*.07,-h*.02);c.lineTo(w*.03,-h*.14);c.stroke();
   c.restore();});
 },
 caravan(c,w,h,t){
  shadow(c,w*1.05,h*.95);
  // little blue hatchback up front, cream caravan behind it
  const ch=h*.3,cy=-h*.5+ch/2+2;
  c.fillStyle=grad(c,-w*.35,0,w*.35,0,'#4a7fd0','#2c56a0');rr(c,-w*.34,cy-ch/2,w*.68,ch,9);c.fill();
  c.fillStyle='#2a3a52';rr(c,-w*.26,cy-ch*.1,w*.52,ch*.32,4);c.fill();rr(c,-w*.26,cy-ch*.42,w*.52,ch*.22,4);c.fill();
  c.strokeStyle='#4b5257';c.lineWidth=2.4;c.beginPath();c.moveTo(0,cy+ch/2);c.lineTo(0,cy+ch/2+h*.07);c.stroke();                             // tow bar
  const by=cy+ch/2+h*.07,bh=h-(by+h/2)-2;
  c.fillStyle=grad(c,-w*.4,0,w*.4,0,'#fbf4e2','#ddd2b8');rr(c,-w*.4,by,w*.8,bh,10);c.fill();
  c.fillStyle='#c9ced2';rr(c,-w*.13,by+bh*.28,w*.26,bh*.18,3);c.fill();rr(c,-w*.2,by+bh*.62,w*.4,bh*.12,3);c.fill();                            // roof vents
  c.strokeStyle='#e9a73a';c.lineWidth=3;c.beginPath();c.moveTo(-w*.4,by+bh*.45);c.lineTo(w*.4,by+bh*.45);c.stroke();                           // stripe
  c.fillStyle='#d33';c.fillRect(-w*.3,by+bh-3,5,3);c.fillRect(w*.3-5,by+bh-3,5,3);
 },
 binlorry(c,w,h,t){
  shadow(c,w*1.05,h*.95);
  c.fillStyle='#161a1a';for(const y of[.22,.38])for(const s2 of[-1,1]){rr(c,s2*w*.47-w*.06,h*y-h*.07,w*.12,h*.14,3);c.fill();}
  c.fillStyle=grad(c,-w*.4,0,w*.4,0,'#2f8f55','#1d6038');rr(c,-w*.4,-h*.2,w*.8,h*.68,9);c.fill();                                              // body
  c.fillStyle='#173f2a';rr(c,-w*.3,h*.05,w*.6,h*.36,6);c.fill();c.strokeStyle='#8fd0a5';c.lineWidth=1.4;for(let i=0;i<5;i++){c.beginPath();c.moveTo(-w*.28,h*.1+i*h*.06);c.lineTo(w*.28,h*.1+i*h*.06);c.stroke();}   // hopper
  c.fillStyle=grad(c,-w*.3,0,w*.3,0,'#f4f1e6','#cfc9b6');rr(c,-w*.34,-h*.49,w*.68,h*.3,8);c.fill();c.fillStyle='#43565c';rr(c,-w*.26,-h*.46,w*.52,h*.12,4);c.fill();   // cab
  const on=Math.sin(t*8)>0;c.fillStyle=on?'#ffb52e':'#8a5d12';c.beginPath();c.arc(-w*.2,-h*.2,3.4,0,TAU);c.arc(w*.2,-h*.2,3.4,0,TAU);c.fill();
  if(on){glowSpot(c,-w*.2,-h*.2);glowSpot(c,w*.2,-h*.2);}
  c.fillStyle='#fff';c.font='900 '+Math.round(w*.13)+'px sans-serif';c.textAlign='center';c.fillText('BIN',0,h*.3);
  for(const s2 of[-1,1]){c.fillStyle='#2b6dd0';rr(c,s2*w*.58-w*.07,h*.28,w*.14,h*.12,2);c.fill();c.fillStyle='#1d3f78';rr(c,s2*w*.58-w*.07,h*.28,w*.14,h*.04,1);c.fill();}   // wheelie bins
 },
 horseshoe(c,w,h,t){
  const pulse=1+Math.sin(t*5)*.06;c.save();c.scale(pulse,pulse);
  const g=c.createRadialGradient(0,0,2,0,0,w*.75);g.addColorStop(0,'#fff0a8cc');g.addColorStop(1,'#ffe06b00');c.fillStyle=g;c.fillRect(-w*.8,-w*.8,w*1.6,w*1.6);
  c.lineCap='round';c.strokeStyle='#8a5a12';c.lineWidth=w*.19;c.beginPath();c.arc(0,-w*.02,w*.27,Math.PI*.18,Math.PI*.82,true);c.stroke();
  c.strokeStyle=grad(c,-w*.3,-w*.3,w*.3,w*.3,'#ffe27a','#d49a1a');c.lineWidth=w*.15;c.beginPath();c.arc(0,-w*.02,w*.27,Math.PI*.18,Math.PI*.82,true);c.stroke();
  c.fillStyle='#7a4e0e';for(let i=0;i<6;i++){const a=Math.PI*(.28+i*.088);c.beginPath();c.arc(Math.cos(a+Math.PI)*0,0,0,0,0);}
  for(let i=0;i<5;i++){const a=Math.PI*(1.23+i*.135)-Math.PI;const x=Math.cos(a)*w*.27,y=-w*.02-Math.sin(a)*w*.27;c.beginPath();c.arc(x,y,1.6,0,TAU);c.fill();}
  c.restore();
 }
};
const HAS_ART=Object.keys(ART);
function drawProp(c,kind,w,h,t=0){const f=ART[kind];if(!f)return false;c.save();f(c,w,h,t);c.restore();return true;}

module.exports={HAS_ART,drawProp};

},
"./route-world.js":function(module,exports,require){
/* Route World 2.0. Distances and polygons are the shared source of truth for
 * artwork, signs, spawning and wheel contact. Five INPUT positions are retained;
 * they are fixed across the screen, not five permanently open road lanes. */
const {roadTheme}=require("./geometry.js");
const ROUTE_VERSION=2;
const CHUNK_LENGTH=2600;
const MOTIFS=['s-bend','farm-fork','estate-fork','roadworks','village','contraflow','river-bend'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
function hash(n,seed=1){let x=Math.imul((n|0)^(seed|0),0x45d9f3b);x=Math.imul(x^(x>>>16),0x45d9f3b);return (x^(x>>>16))>>>0;}
function steeringX(lane){return 54+78*lane;}
const routeCache=new Map();
function routeSpec(index,seed=1){
 index=Math.max(0,index|0);const key=seed+':'+index;
 if(routeCache.has(key))return routeCache.get(key);
 // A shuffled bag per seven sections: no fixed loop and no adjacent repeats.
 const cycle=Math.floor(index/MOTIFS.length),bag=MOTIFS.slice();
 for(let i=bag.length-1;i>0;i--){const j=hash(cycle*19+i,seed)%(i+1);[bag[i],bag[j]]=[bag[j],bag[i]];}
 if(cycle===0){const first=bag.indexOf('s-bend');[bag[0],bag[first]]=[bag[first],bag[0]];}
 if(cycle>0){const prev=routeSpec(cycle*MOTIFS.length-1,seed).motif;if(bag[0]===prev)[bag[0],bag[1]]=[bag[1],bag[0]];}
 const motif=bag[index%bag.length];
 const side=hash(index+103,seed)%2?1:-1;
 const restricted=hash(index+401,seed)%2?'left':'right';
 const s={id:index,start:index*CHUNK_LENGTH,end:(index+1)*CHUNK_LENGTH,motif,side,restricted,
  prizeSide:restricted,signZ:index*CHUNK_LENGTH+330,decisionZ:index*CHUNK_LENGTH+760};
 routeCache.set(key,s);if(routeCache.size>256)routeCache.delete(routeCache.keys().next().value);
 return s;
}
function roadAt(z,seed=1){
 z=Math.max(0,z);const s=routeSpec(Math.floor(z/CHUNK_LENGTH),seed),p=z-s.start;
 const gate=smooth((p-500)/440)*smooth((2480-p)/440),wave=Math.sin((p-500)/1900*Math.PI*2);
 const band=(centre,width,surface='asphalt',rule='',branch='main')=>({left:centre-width/2,right:centre+width/2,surface,rule,branch});
 let bands=[],sign=null;
 switch(s.motif){
  case 'farm-fork':case 'estate-fork':case 'contraflow':{
   for(const branch of ['left','right']){const side=branch==='left'?-1:1,restricted=branch===s.restricted;
    const rule=restricted?(s.motif==='estate-fork'?'access':s.motif==='contraflow'?'oneway':''):'';
    const surface=restricted&&s.motif==='farm-fork'?'mud':'asphalt';
    bands.push(band(210+side*110*gate,mix(368,140,gate),gate>.65?surface:'asphalt',gate>.82?rule:'',branch));
   }
   sign={left:s.restricted==='left'?(s.motif==='farm-fork'?'MUD • BONUS':s.motif==='estate-fork'?'ACCESS • £90':'NO ENTRY • £120'):'MAIN ROAD',right:s.restricted==='right'?(s.motif==='farm-fork'?'MUD • BONUS':s.motif==='estate-fork'?'ACCESS • £90':'NO ENTRY • £120'):'MAIN ROAD'};
   break;
  }
  case 'roadworks':bands=[band(210+s.side*76*gate,mix(368,218,gate))];sign={text:s.side<0?'WORKS • KEEP LEFT':'WORKS • KEEP RIGHT'};break;
  case 'village':bands=[band(210+s.side*65*gate,mix(368,228,gate))];sign={text:'VILLAGE • NARROW ROAD'};break;
  case 'river-bend':bands=[band(210+s.side*70*gate,mix(368,224,gate))];sign={text:s.side<0?'RIVER BEND • LEFT':'RIVER BEND • RIGHT'};break;
  default:bands=[band(210+wave*64*gate,mix(368,236,gate))];sign={text:'BENDS • FOLLOW THE ROAD'};
 }
 return {...s,p,gate,bands,sign};
}
function surfaceAt(x,z,seed=1,halfWidth=0){
 const r=roadAt(z,seed),matches=r.bands.filter(b=>x-halfWidth>=b.left&&x+halfWidth<=b.right);
 if(!matches.length)return {surface:'verge',rule:'',branch:'outside',onRoad:false,route:r};
 const b=matches.find(b=>!b.rule&&b.surface==='asphalt')||matches[0];
 return {...b,onRoad:true,route:r};
}
function routeLanes(z,seed=1,{legal=false,margin=23}={}){
 return [0,1,2,3,4].filter(l=>{const x=steeringX(l),s=surfaceAt(x,z,seed,margin),r=s.route;
  const approachingRestriction=legal&&['estate-fork','contraflow'].includes(r.motif)&&r.gate>.1&&(r.restricted==='left'?x<210:x>210);
  return s.onRoad&&(!legal||!s.rule)&&!approachingRestriction;
 });
}
function laneCorridor(z0,z1,seed=1,legal=false){
 return [0,1,2,3,4].filter(l=>{for(let z=z0;z<=z1;z+=45)if(!routeLanes(z,seed,{legal}).includes(l))return false;return routeLanes(z1,seed,{legal}).includes(l);});
}
function nearestLane(z,preferred=2,seed=1,legal=true){
 const lanes=routeLanes(z,seed,{legal});return lanes.sort((a,b)=>Math.abs(a-preferred)-Math.abs(b-preferred))[0]??2;
}
/* Plan reward trails backwards from the finish. A greedy next pickup could
 * otherwise lead into the wrong branch just as a restriction starts. */
function rewardPath(positions,startLane,seed=1,rng=()=>.5){
 const valid=positions.map(z=>routeLanes(z,seed,{legal:true})),viable=valid.map(()=>[]);
 viable[viable.length-1]=valid.at(-1);
 for(let i=positions.length-2;i>=0;i--)viable[i]=valid[i].filter(l=>viable[i+1].some(n=>Math.abs(n-l)<=1));
 let lane=startLane;return viable.map((choices,i)=>{let possible=choices.filter(l=>Math.abs(l-lane)<=1);if(!possible.length)possible=choices.length?choices:valid[i];
  possible.sort((a,b)=>Math.abs(a-lane)-Math.abs(b-lane));const near=possible.filter(l=>Math.abs(l-lane)<=1);lane=(near.length?near:possible)[Math.floor(rng()*(near.length||possible.length))]??nearestLane(positions[i],lane,seed);return lane;
 });
}
/* A cheap, deterministic reachability check. Dynamic traffic is reserved as a
 * whole corridor. Includes a 150-unit trailer clearance and steering lead time. */
function reachableCorridor(items,z0,z1,seed=1,start=[0,1,2,3,4],maxSpeed=530){
 const step=150;let reachable=new Set(start);
 for(let z=z0;z<=z1;z+=step){const open=routeLanes(z,seed,{legal:true}).filter(l=>!items.some(e=>!e.done&&!e.collectible&&e.lane===l&&e.z-80<=z&&e.z+(e.length||45)+150>=z));
  const next=new Set(open.filter(l=>[...reachable].some(p=>Math.abs(p-l)<=1&&step/maxSpeed>=.22)));
  if(!next.size)return false;reachable=next;
 }
 return true;
}
function routeWarning(distance,seed=1){const index=Math.floor(Math.max(0,distance)/CHUNK_LENGTH),r=roadAt(index*CHUNK_LENGTH+900,seed);if(distance-r.start<1100)return {...r.sign,distance:Math.max(0,Math.round((r.decisionZ-distance)/10)),id:r.id};return null;}
/* Outermost edge of the road on one side over the whole length of a prop, so a prop never overhangs the carriageway on a bend. */
function roadEdge(z,side,seed=1,span=62){let o=side<0?Infinity:-Infinity;for(const dz of[-span,-span/2,0,span/2,span]){const a=roadAt(z+dz,seed),v=side<0?Math.min(...a.bands.map(b=>b.left)):Math.max(...a.bands.map(b=>b.right));o=side<0?Math.min(o,v):Math.max(o,v);}return o;}
/* Side of the road with water at a river bend (props are not placed on the water). */
const waterSide=a=>a.motif==='river-bend'&&a.gate>.4?-a.side:0;
function sceneryProps(z0,z1,seed=1){
 const props=[];for(let n=Math.floor(z0/210);n<=Math.ceil(z1/210);n++){
  if(n<0)continue;const z=n*210+hash(n+123,seed)%70,a=roadAt(z,seed),stage=roadTheme(z);
  for(const side of [-1,1]){if(waterSide(a)===side)continue;const outer=roadEdge(z,side,seed);
   const sprite=stage===0||stage===2?(hash(n+side,seed)%3===0?1:0):stage===3?[4,7,2][hash(n+side,seed)%3]:1;
   const width=sprite===1?92:91,height=sprite===0?109:sprite===4?125:87;
   const variant=hash(n+side+880,seed)%4;
   const detailed=stage===1?variant===3:variant!==0&&sprite!==1;
   const scenic=stage===0?[0,7,0,1][variant]:stage===1?2:stage===2?3:[4,1,4,1][variant];
   props.push({id:n+':'+side,x:outer+side*(width*.51+12),z,sprite:detailed?scenic:sprite,sheet:detailed?'routeScenery':'routeProps',width,height,hitWidth:sprite===0?60:38,hitHeight:sprite===0?70:45,effect:stage===1&&detailed?'house':sprite===0||sprite===2?'house':'fine'});
  }
  if(a.bands.length===2&&a.bands[1].left-a.bands[0].right>60)props.push({id:n+':island',x:210,z,sprite:a.motif==='estate-fork'?0:5,sheet:a.motif==='estate-fork'?'routeProps':'routeScenery',width:67,height:83,hitWidth:44,hitHeight:56,effect:a.motif==='estate-fork'?'house':'fine'});
 }
 return props;
}

/* Decorative scenery for the extra width on iPads and the tall-phone preview: further rows of the same painted houses, trees and
   hedges, set back from the verge. No collision; purely to carry the world out to the screen edges. */
function sideProps(z0,z1,seed=1,pad=0){
 const props=[];if(pad<2)return props;
 const cols=Math.ceil(pad/118);
 for(let n=Math.floor(z0/260);n<=Math.ceil(z1/260);n++){if(n<0)continue;
  for(const side of[-1,1])for(let col=0;col<cols;col++){
   const h=hash(n*7+col*131+(side>0?977:13),seed+51),z=n*260+(h%140);
   const a=roadAt(z,seed),stage=roadTheme(z),outer=roadEdge(z,side,seed,70);if(waterSide(a)===side)continue;
   const roll=h>>>8&7;if(col>0&&roll<2)continue;   // gaps, so the rows look natural
   const treeish=roll>=5||stage===1;
   const sprite=treeish?1:stage===3?[4,7,2][roll%3]:0,sheet='routeProps';
   const width=sprite===1?96:sprite===0?91:95,height=sprite===0?109:sprite===4?125:90;
   const detailed=!treeish&&roll===3,scenic=stage===0?[0,7,0,1][roll%4]:stage===2?3:stage===3?4:2;
   props.push({id:n+':'+side+':'+col,x:outer+side*(60+col*118+(h>>>12&15)),z,sprite:detailed?scenic:sprite,sheet:detailed?'routeScenery':sheet,width,height});
  }
 }
 return props;
}

module.exports={ROUTE_VERSION,CHUNK_LENGTH,MOTIFS,hash,steeringX,routeSpec,roadAt,surfaceAt,routeLanes,laneCorridor,nearestLane,rewardPath,reachableCorridor,routeWarning,roadEdge,waterSide,sceneryProps,sideProps};

},
"./route-hazards.js":function(module,exports,require){
/* Sprite footprint and collision footprint are authored together. World-space
 * metres are deliberately arcade units. No road pixels determine collision. */
const HAZARD_SPECS={
 car:{width:42,height:68,hitWidth:34,hitHeight:54,effect:'crash',sprite:4,sheet:'sprites'},
 cone:{width:54,height:50,hitWidth:32,hitHeight:30,effect:'fine',sprite:6,sheet:'sprites'},
 barrier:{width:64,height:34,hitWidth:52,hitHeight:24,effect:'fine',sprite:5,sheet:'routeProps'},
 works:{width:68,height:88,hitWidth:46,hitHeight:65,effect:'fine',sprite:4,sheet:'routeProps'},
 pit:{width:70,height:82,hitWidth:48,hitHeight:60,effect:'fine',sprite:6,sheet:'routeProps'},
 mud:{width:72,height:146,hitWidth:60,hitHeight:120,effect:'grip',sprite:8,sheet:'routeProps'},
 oil:{width:65,height:87,hitWidth:46,hitHeight:62,effect:'crash',sprite:9,sheet:'routeProps'},
 house:{width:80,height:110,hitWidth:60,hitHeight:78,effect:'crash',sprite:0,sheet:'routeProps'},
 footpath:{width:69,height:112,hitWidth:54,hitHeight:82,effect:'fine',sprite:10,sheet:'routeProps'},
 lowbridge:{width:77,height:148,hitWidth:58,hitHeight:45,effect:'crash',sprite:0,sheet:'terrain'},
 weakbridge:{width:77,height:148,hitWidth:58,hitHeight:90,effect:'crash',sprite:1,sheet:'terrain'},
 narrow:{width:72,height:145,hitWidth:52,hitHeight:60,effect:'fine',sprite:4,sheet:'terrain'},
 bus:{width:72,height:160,hitWidth:58,hitHeight:120,effect:'fine',sprite:2,sheet:'terrain'},
 noentry:{width:72,height:160,hitWidth:58,hitHeight:120,effect:'fine',sprite:3,sheet:'terrain'},
 grass:{width:72,height:145,hitWidth:60,hitHeight:100,effect:'grip-fine',sprite:8,sheet:'routeProps'},
 // Hand-drawn (see propart.js). Cow and ice-cream van end the shift; honking shoos cows and geese away in time.
 cow:{width:60,height:96,hitWidth:46,hitHeight:70,effect:'crash',draw:'cow',sheet:'draw'},
 tractor:{width:62,height:108,hitWidth:50,hitHeight:88,effect:'fine',draw:'tractor',sheet:'draw'},
 haybale:{width:64,height:58,hitWidth:52,hitHeight:46,effect:'fine',draw:'haybale',sheet:'draw'},
 icecream:{width:60,height:112,hitWidth:48,hitHeight:94,effect:'crash',draw:'icecream',sheet:'draw'},
 geese:{width:68,height:64,hitWidth:54,hitHeight:48,effect:'fine',draw:'geese',sheet:'draw'},
 morris:{width:70,height:62,hitWidth:56,hitHeight:50,effect:'fine',draw:'morris',sheet:'draw'},
 cyclists:{width:66,height:76,hitWidth:52,hitHeight:60,effect:'fine',draw:'cyclists',sheet:'draw'},
 caravan:{width:60,height:156,hitWidth:50,hitHeight:132,effect:'fine',draw:'caravan',sheet:'draw'},
 binlorry:{width:64,height:132,hitWidth:52,hitHeight:112,effect:'crash',draw:'binlorry',sheet:'draw'}
};
const PICKUP_SPECS={hitch:{sprite:13,sheet:'routeProps',width:45,height:45},prize:{sprite:12,sheet:'routeProps',width:40,height:40},shield:{draw:'horseshoe',width:46,height:46}};
function sweptOverlap(a0,a1,half,e0,e1){return Math.max(a0,a1)+half>=e0&&Math.min(a0,a1)-half<=e1;}

module.exports={HAZARD_SPECS,PICKUP_SPECS,sweptOverlap};

},
"./route-render.js":function(module,exports,require){
const {roadAt,hash,steeringX,CHUNK_LENGTH,surfaceAt,sceneryProps,sideProps}=require("./route-world.js");
const {roadTheme}=require("./geometry.js");
const {ROUTE_ATLAS}=require("./route-atlas.js");
const {HAZARD_SPECS,PICKUP_SPECS}=require("./route-hazards.js");
const {drawProp}=require("./propart.js");
const mod=(n,m)=>((n%m)+m)%m;
class RoutePainter{
 constructor(renderer){this.r=renderer;this.patterns=[];this.makePatterns();}
 /* Seamless ground textures. The atlas cells have a bright 1-2 px border and are not tileable, so each cell is cropped inward and made
    periodic by cross-fading it with a half-tile-shifted copy (no mirroring, so no kaleidoscope pattern or seam line every 256 px). */
 makePatterns(){const img=this.r.images.routeSurfaces;if(!img)return;const N=256,inset=12;
  // Raised-cosine alpha mask (generated, never read back), so the whole thing works with images loaded from local files on iOS.
  const mask=document.createElement('canvas');mask.width=mask.height=N;{const mx=mask.getContext('2d'),md=mx.createImageData(N,N);
   for(let y=0;y<N;y++){const wy=.5-.5*Math.cos(2*Math.PI*y/N);for(let x=0;x<N;x++){const wx=.5-.5*Math.cos(2*Math.PI*x/N),i=(y*N+x)*4;md.data[i+3]=Math.round(255*wx*wy);}}mx.putImageData(md,0,0);}
  for(const rect of ROUTE_ATLAS.surfaces.rects){
   const A=document.createElement('canvas');A.width=A.height=N;const ax=A.getContext('2d');ax.drawImage(img,rect[0]+inset,rect[1]+inset,rect[2]-2*inset,rect[3]-2*inset,0,0,N,N);
   const out=document.createElement('canvas');out.width=out.height=N;const ox=out.getContext('2d');
   // B: the tile shifted by half a tile in both directions (wrapped)
   for(const dx of[-N/2,N/2])for(const dy of[-N/2,N/2])ox.drawImage(A,dx,dy);
   // A, faded out towards its edges by the mask, laid over B
   const Am=document.createElement('canvas');Am.width=Am.height=N;const amx=Am.getContext('2d');amx.drawImage(A,0,0);amx.globalCompositeOperation='destination-in';amx.drawImage(mask,0,0);
   ox.drawImage(Am,0,0);this.patterns.push(this.r.ctx.createPattern(out,'repeat'));
  }
 }
 atlas(sheet,id,x,y,w,h,angle=0,alpha=1){const r=this.r,c=r.ctx,key=sheet.replace('route','').toLowerCase(),meta=ROUTE_ATLAS[key],img=r.images[sheet],rect=meta?.rects[id];if(!img||!rect)return;
  c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=alpha;c.drawImage(img,...rect,-w/2,-h/2,w,h);c.restore();
 }
 paint(id,x,y,w,h,offset){const c=this.r.ctx,p=this.patterns[id];if(!p)return;p.setTransform(new DOMMatrix().translate(0,offset));c.fillStyle=p;c.fillRect(x,y,w,h);}
 road(g){const r=this.r,c=r.ctx,scale=r.worldScale,offset=mod(r.playerY+g.distance*scale,256);
  const topZ=g.distance+r.playerY/scale,bottomZ=g.distance+(r.playerY-r.H)/scale;
  this.paint([7,3,12,11][roadTheme(bottomZ)],-r.pad,0,420+2*r.pad,r.H,offset);
  const boundary=(Math.floor(bottomZ/5400)+1)*5400,by=r.playerY-(boundary-g.distance)*scale;
  if(by>0&&by<r.H){c.save();c.beginPath();c.rect(-r.pad,0,420+2*r.pad,by);c.clip();this.paint([7,3,12,11][roadTheme(boundary+1)],-r.pad,0,420+2*r.pad,r.H,offset);c.restore();}
  const samples=[];for(let y=-8;y<=r.H+8;y+=4)samples.push({y,z:g.distance+(r.playerY-y)/scale,a:roadAt(g.distance+(r.playerY-y)/scale,g.seed)});
  const polygon=(rows,getBand,expand=0)=>{const path=new Path2D();if(!rows.length)return path;
   rows.forEach((row,i)=>{const b=getBand(row);const x=b.left-expand;i?path.lineTo(x,row.y):path.moveTo(x,row.y);});
   for(let i=rows.length-1;i>=0;i--){const b=getBand(rows[i]);path.lineTo(b.right+expand,rows[i].y);}path.closePath();return path;};
  const fills=(path,id)=>{c.save();c.clip(path);this.paint(id,-r.pad,0,420+2*r.pad,r.H,offset);c.restore();};
  const river=samples.filter(row=>row.a.motif==='river-bend'&&row.a.gate>.04),bank=g=>{const t=Math.max(0,Math.min(1,(g-.04)/.5));return t*t*(3-2*t);};
  if(river.length)fills(polygon(river,row=>{const t=bank(row.a.gate);if(row.a.side<0){const l=row.a.bands[0].right+20;return {left:l,right:l+(420+r.pad-l)*t};}const rt=row.a.bands[0].left-20;return {left:rt-(rt+r.pad)*t,right:rt};}),14);
  // Each complete road ribbon is filled once. Scanline rectangles leave tiny
  // antialias seams on high-DPI screens, so they are deliberately not used.
  const all=new Path2D(),shoulders=new Path2D();
  for(let branch=0;branch<2;branch++){
   let run=[];const flush=()=>{if(run.length){all.addPath(polygon(run,r=>r.a.bands[branch]));shoulders.addPath(polygon(run,r=>r.a.bands[branch],8));run=[];}};
   for(const row of samples){if(row.a.bands[branch])run.push(row);else flush();}flush();
  }
  fills(shoulders,2);fills(all,0);
  for(let branch=0;branch<2;branch++){let mud=[];const flush=()=>{if(mud.length){fills(polygon(mud,r=>r.a.bands[branch]),5);mud=[];}};
   for(const row of samples){if(row.a.bands[branch]?.surface==='mud')mud.push(row);else flush();}flush();}
  // Soft entry into the mud: faded slices just before the surface turns to mud, so there is no hard cut across the lane.
  for(let branch=0;branch<2;branch++){const fade=samples.filter(row=>row.a.motif==='farm-fork'&&row.a.bands[branch]&&row.a.bands[branch].branch===row.a.restricted&&row.a.gate>.4&&row.a.bands[branch].surface!=='mud');
   for(let i=0;i+1<fade.length;i++){if(fade[i+1].y-fade[i].y>8)continue;const t=Math.max(0,Math.min(1,(fade[i].a.gate-.4)/.25)),k=t*t*(3-2*t);c.save();c.globalAlpha=k;fills(polygon([fade[i],fade[i+1]],r=>r.a.bands[branch]),5);c.restore();}}
  // Only the outside boundary is stroked while branches overlap. Once they
  // separate, the island gains its own continuous pair of edge markings.
  c.save();c.strokeStyle='#eeeaddb0';c.lineWidth=1.5;
  for(const edge of ['outerLeft','outerRight','innerLeft','innerRight']){c.beginPath();let active=false;
   for(const row of samples){const b=row.a.bands,gap=b.length===2&&b[0].right<b[1].left;let x;
    if(edge==='outerLeft')x=b[0].left+2;else if(edge==='outerRight')x=b.at(-1).right-2;else if(gap)x=edge==='innerLeft'?b[0].right-2:b[1].left+2;
    if(x===undefined){active=false;continue;}if(active)c.lineTo(x,row.y);else c.moveTo(x,row.y);active=true;
   }c.stroke();}
  // Lane dividers: a wide road is painted as 4-5 proper lanes (about 74 units each); narrower roads and fork branches get 2-3.
  c.strokeStyle='#eee5ccaa';c.lineWidth=1.5;
  for(let branch=0;branch<2;branch++)for(let k=1;k<=4;k++){c.beginPath();let active=false,prevN=0;for(const row of samples){let b=row.a.bands,split=b.length===2&&b[0].right<b[1].left;
    if(!split)b=[{left:b[0].left,right:b.at(-1).right,surface:'asphalt'}];const lane=b[branch];
    const w=lane?lane.right-lane.left:0,n=w>=340?5:Math.max(1,Math.round(w/74));
    if(!lane||lane.surface==='mud'||n<=k||mod(row.z,100)>43){active=false;continue;}
    const lw=Math.min(78,w/n),x=(lane.left+lane.right)/2+(k-n/2)*lw;if(n!==prevN)active=false;prevN=n;active?c.lineTo(x,row.y):c.moveTo(x,row.y);active=true;}c.stroke();}
  c.restore();
  // Roadside props are anchored in world coordinates and never drift relative
  // to the road. Their footprints stay outside the driveable asphalt.
  for(const p of sceneryProps(g.distance+(r.playerY-r.H)/scale-150,g.distance+r.playerY/scale+150,g.seed))this.atlas(p.sheet||'routeProps',p.sprite,p.x,r.playerY-(p.z-g.distance)*scale,p.width,p.height*scale,0,.98);
  for(const p of sideProps(g.distance+(r.playerY-r.H)/scale-150,g.distance+r.playerY/scale+150,g.seed,r.pad))this.atlas(p.sheet,p.sprite,p.x,r.playerY-(p.z-g.distance)*scale,p.width,p.height*scale,0,.98);
  this.signs(g);
 }
 /* Signs stand on the verge beside the road, never on it, and only where the driver has a decision to make (forks and roadworks). */
 post(x,y,lines,tone){const c=this.r.ctx,w=42,h=lines.length>1?30:22;c.save();c.fillStyle='#0b1c1fcc';c.fillRect(x-1.2,y+h/2,2.4,16);c.fillStyle=tone;c.strokeStyle='#f3f6e6';c.lineWidth=1.6;c.beginPath();c.roundRect(x-w/2,y-h/2,w,h,3);c.fill();c.stroke();
  c.fillStyle='#fbfcef';c.font='800 6.6px -apple-system,sans-serif';c.textAlign='center';lines.forEach((t,i)=>c.fillText(t,x,y+(lines.length>1?-2.5+i*9:2.5)));c.restore();}
 signs(g){const r=this.r,c=r.ctx,start=Math.max(0,Math.floor(g.distance/CHUNK_LENGTH)-1),end=start+2;
  for(let i=start;i<=end;i++){const a=roadAt(i*CHUNK_LENGTH+900,g.seed),y=r.playerY-(a.signZ-g.distance)*r.worldScale;if(y< -50||y>r.H+50)continue;
   if(a.sign.left){this.post(13,y,a.sign.left.split(' • '),a.sign.left==='MAIN ROAD'?'#1d5b3a':'#7a2a1e');this.post(407,y,a.sign.right.split(' • '),a.sign.right==='MAIN ROAD'?'#1d5b3a':'#7a2a1e');}
   else if(a.motif==='roadworks'){const t=a.sign.text.split(' • ');this.post(a.side<0?407:13,y,t,'#b8651a');}
  }
  // Arrows belong to the road. No-entry branch points toward the driver.
  for(let z=Math.floor((g.distance-300)/340)*340;z<g.distance+r.playerY/r.worldScale;z+=340){const a=roadAt(z,g.seed);if(a.gate<.97||a.bands.length<2)continue;
   for(const b of a.bands){const x=(b.left+b.right)/2,y=r.playerY-(z-g.distance)*r.worldScale;c.save();c.translate(x,y);if(b.rule==='oneway')c.rotate(Math.PI);c.fillStyle=b.rule?'#ffdfc3a0':'#e9eddca0';c.beginPath();c.moveTo(0,-17);c.lineTo(10,-4);c.lineTo(4,-4);c.lineTo(4,13);c.lineTo(-4,13);c.lineTo(-4,-4);c.lineTo(-10,-4);c.closePath();c.fill();c.restore();}
  }
 }
 hazards(g){const r=this.r,c=r.ctx;this.leaving(g);for(const e of g.items){if(e.done)continue;const spec=HAZARD_SPECS[e.type];if(!spec)continue;const x=steeringX(e.lane),y=r.playerY-(e.z-g.distance)*r.worldScale;if(y< -160||y>r.H+160)continue;
   const h=spec.height*r.worldScale+(e.length||0)*r.worldScale;
   if(spec.draw){c.save();c.translate(x,y);c.scale(1,r.worldScale);drawProp(c,spec.draw,spec.width,spec.height,r.time+e.id);c.restore();}
   else if(spec.sheet.startsWith('route'))this.atlas(spec.sheet,spec.sprite,x,y-(e.length||0)*r.worldScale/2,spec.width,h,e.oncoming?Math.PI:0);
   else r.sprite(spec.sprite,x,y-(e.length||0)*r.worldScale/2,spec.width,h,e.oncoming?Math.PI:0,1,spec.sheet);
   if(e.honkable&&e.z-g.distance>60&&e.z-g.distance<620)r.label('HONK!',x,y-h/2-6,'#fff0a8',9);
   if(e.oncoming){r.label('ONCOMING',x,y-43,'#ffd1aa',7);}
   if(['lowbridge','weakbridge','bus','footpath'].includes(e.type)){const labels={lowbridge:'LOW BRIDGE',weakbridge:'WEIGHT LIMIT',bus:'BUS ONLY',footpath:'PUBLIC PATH'};r.label(labels[e.type],x,y-h/2-8,'#ffebb5',7);}
   if(r.settings.hitboxes){c.save();c.strokeStyle='#ff4bcc';c.lineWidth=1;c.strokeRect(x-spec.hitWidth/2,y-(e.length||0)*r.worldScale-spec.hitHeight*r.worldScale/2,spec.hitWidth,(spec.hitHeight+(e.length||0))*r.worldScale);c.restore();}
  }
 }
 pickup(e,x,y){const spec=PICKUP_SPECS[e.type];if(!spec)return false;const c=this.r.ctx;if(spec.draw){c.save();c.translate(x,y);drawProp(c,spec.draw,spec.width,spec.height,this.r.time+e.id);c.restore();}else this.atlas(spec.sheet,spec.sprite,x,y,spec.width,spec.height);const L={hitch:['HITCH UP','#a3ffd0'],prize:['£85 BONUS','#ffe7a2'],shield:['LUCKY SHOE','#fff0a8']}[e.type];this.r.label(L[0],x,y-29,L[1],8);return true;}
 /* Cows and geese you've honked away trot off to the side and fade. */
 leaving(g){const r=this.r,c=r.ctx;for(const d of g.leaving||[]){const spec=HAZARD_SPECS[d.type];if(!spec)continue;const y=r.playerY-(d.z-g.distance)*r.worldScale,x=steeringX(d.lane)+d.dir*d.age*130;c.save();c.globalAlpha=Math.max(0,1-d.age/1.4);c.translate(x,y);c.scale(1,r.worldScale);c.rotate(d.dir*.5*Math.min(1,d.age*3));drawProp(c,spec.draw,spec.width,spec.height,r.time*3);c.restore();}}
}

module.exports={RoutePainter};

},
"./showroom.js":function(module,exports,require){
const {ROUTE_ATLAS}=require("./route-atlas.js");
const TAU=Math.PI*2;
function showroomFrame(angle){return ((Math.round(angle/(TAU/8))%8)+8)%8;}
function drawShowroom(r,pv,angle,cx,cy,R,pop=0){
 const c=r.ctx,img=r.images.routeShowroom,frame=showroomFrame(angle),rect=ROUTE_ATLAS.showroom.rects[frame];
 if(!img||!rect)return;
 // Eight distinct camera views. The body is never rotated as a flat card.
 const width=R*1.83,height=Math.min(r.H*.72,R*1.52),scale=Math.min(width/rect[2],height/rect[3])*(1+pop*.025),w=rect[2]*scale,h=rect[3]*scale;
 c.save();c.translate(cx,cy-8);c.shadowColor='#0009';c.shadowBlur=13;c.shadowOffsetY=9;
 const hue=pv.truck===2?'hue-rotate(193deg) saturate(1.25)':pv.truck===3?'hue-rotate(100deg) saturate(1.18)':'none';
 c.filter=hue;c.drawImage(img,...rect,-w/2,-h/2,w,h);c.filter='none';c.shadowBlur=0;c.shadowOffsetY=0;
 // Body-mounted decorations use view-specific anchors. Rear views hide cab
 // accessories, avoiding impossible floating lights over the trailer doors.
 const mount=[{x:0,y:.00,s:1},{x:-.29,y:.13,s:.8},{x:-.37,y:-.23,s:.6},null,null,null,{x:.38,y:-.23,s:.6},{x:.29,y:.13,s:.8}][frame];
 const u=pv.upgrades||{};
 if(mount){const x=mount.x*w,y=mount.y*h;
  if(u.lights){r.world.atlas('routeTrucks',6,x,y-15*mount.s,42*mount.s,8*mount.s);}
  if(u.exhaust){r.world.atlas('routeTrucks',5,x,y+10*mount.s,48*mount.s,30*mount.s);}
  if(u.washroom||u.bunk)r.world.atlas('routeTrucks',7,x,y-5*mount.s,19*mount.s,10*mount.s);
 }
 if(pv.decal){const side=[null,{x:.1,y:-.04,s:.7},{x:.13,y:.02,s:1},{x:.05,y:.14,s:.62},null,{x:-.05,y:.14,s:.62},{x:-.13,y:.02,s:1},{x:-.1,y:-.04,s:.7}][frame];
  if(side)r.sprite(pv.decal+3,side.x*w,side.y*h,58*side.s,36*side.s,0,1,'extras');
 }
 c.restore();
 c.save();c.textAlign='center';c.fillStyle='#b3cec9';c.font='700 9px -apple-system,sans-serif';c.fillText(['FRONT','FRONT QUARTER','RIGHT SIDE','REAR QUARTER','REAR','REAR QUARTER','LEFT SIDE','FRONT QUARTER'][frame],cx,cy+R*.78);c.restore();
}

module.exports={showroomFrame,drawShowroom};

},
"./atlas.js":function(module,exports,require){
const SPRITE_RECTS=[[59, 16, 203, 287], [394, 4, 151, 310], [678, 16, 203, 287], [990, 16, 203, 287], [71, 329, 175, 285], [382, 330, 175, 281], [662, 362, 235, 221], [960, 386, 268, 141], [42, 638, 244, 302], [335, 642, 273, 298], [652, 637, 263, 303], [981, 655, 228, 234], [70, 940, 172, 265], [316, 940, 310, 275], [693, 940, 247, 293], [940, 951, 295, 266]];
const HAZARD_RECTS=[[16, 84, 428, 306], [444, 13, 359, 425], [978, 12, 272, 419], [1423, 50, 254, 368], [59, 474, 336, 388], [495, 474, 339, 389], [901, 454, 414, 394], [1361, 455, 383, 417]];

const TERRAIN_RECTS=[[105, 1, 279, 511], [384, 1, 369, 511], [810, 3, 239, 509], [1152, 1, 271, 511], [106, 512, 278, 504], [384, 512, 357, 503], [787, 512, 365, 503], [1152, 512, 321, 501]];

const EXTRAS_RECTS=[[55, 46, 307, 310], [362, 50, 362, 299], [724, 20, 307, 342], [1119, 40, 296, 313], [24, 410, 338, 238], [362, 388, 362, 336], [724, 388, 347, 336], [1091, 464, 325, 260], [28, 741, 334, 252], [362, 724, 362, 295], [724, 724, 302, 326], [1098, 724, 321, 298]];

module.exports={SPRITE_RECTS,HAZARD_RECTS,TERRAIN_RECTS,EXTRAS_RECTS};

},
"./geometry.js":function(module,exports,require){
// Rolling road patch v1.5 — same atlas boundaries as the five-lane rendered road.
const THEME_SEQUENCE=[0,1,2,3];
function roadTheme(z){const sector=Math.floor(Math.max(0,z)/5400);for(let n=THEME_SEQUENCE.length;n<=sector;n++){let x=Math.imul(n^0x9e3779b9,0x85ebca6b)>>>0;x=(x^(x>>>16))>>>0;THEME_SEQUENCE.push((THEME_SEQUENCE[n-1]+1+x%3)%4);}return THEME_SEQUENCE[sector];}
// Road geometry is now independent from the five fixed steering positions.
function roadShape(z){return {width:368/.56,stage:roadTheme(z)};}
function roadCurve(z){return 0;}
function laneX(lane,z){return 54+78*lane;}
/* The rig is drawn 1.3x bigger than the first build so it sits properly on the wider roads.
   RIG holds the shared size + collision numbers (collision is a touch smaller than the art, so it stays fair). */
const RIG={S:1.3,cabW:64,cabL:119,trailerW:61,trailerL:151,flatW:60,flatL:138,cabHX:21,cabHZ:28,trHX:22,trHZ:64};
function rigPose(x,y,cabAngle,trailerAngle,rearAngle){
 const S=RIG.S,back=(p,d,a)=>({x:p.x-Math.sin(a)*d,y:p.y+Math.cos(a)*d});
 // 5th wheel is behind, not inside the tractor cab; both trailers rotate about connected hitches.
 const hitch=back({x,y},34*S,cabAngle);
 const trailer={...back(hitch,38*S,trailerAngle),angle:trailerAngle};
 const rearHitch=back(hitch,101*S,trailerAngle);
 const rear={...back(rearHitch,45*S,rearAngle),angle:rearAngle};
 return {hitch,trailer,rearHitch,rear};
}

module.exports={roadTheme,roadShape,roadCurve,laneX,RIG,rigPose};

},
"./rigart.js":function(module,exports,require){
/* The rig, drawn properly: ChatGPT's painted cab + trailer plates are recoloured per paint, wrapped with vector
   decals (clipped to the metalwork so they sit on the roofs), then every garage upgrade is drawn on top as a
   visible part. Used by BOTH the game and the garage preview, so what you see in the garage is what you drive. */
const {ROUTE_ATLAS}=require("./route-atlas.js");
const {rigPose,RIG}=require("./geometry.js");
const TAU=Math.PI*2;
/* paint id -> cab sprite (+ hue/sat/light tweak) and trailer tint */
const PAINTS={
 0:{cab:{sprite:0},tint:'#1fb0b0'},
 1:{cab:{sprite:0,sat:.05,white:1,warm:1},tint:null},
 2:{cab:{sprite:1},tint:'#ee8428'},
 3:{cab:{sprite:2},tint:'#7b3fcf'},
 4:{cab:{sprite:0,hue:172,sat:1.05},tint:'#cf3329'},
 5:{cab:{sprite:0,hue:-44,sat:.95},tint:'#2f9a4d'}
};
const cache=new Map();
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;}return[h,s,l];}
function hsl2rgb(h,s,l){h=((h%360)+360)%360/360;if(!s)return[l*255,l*255,l*255];const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q,f=t=>{t=(t+1)%1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};return[f(h+1/3)*255,f(h)*255,f(h-1/3)*255];}
function crop(img,rect){const c=mk(rect[2],rect[3]);c.getContext('2d').drawImage(img,...rect,0,0,rect[2],rect[3]);return c;}
function hueShift(c,o){const x=c.getContext('2d'),d=x.getImageData(0,0,c.width,c.height),p=d.data;
 for(let i=0;i<p.length;i+=4){if(!p[i+3])continue;let[h,s,l]=rgb2hsl(p[i],p[i+1],p[i+2]);
  // only strongly coloured paint moves; chrome, tyres, glass and lamps keep their colours
  const paint=s>.28&&l>.1&&l<.85&&!(h>5&&h<60&&s>.8);
  if(!paint)continue;
  h+=o.hue||0;s=Math.min(1,s*(o.sat??1));l=o.white?Math.min(.97,.64+l*.5):Math.min(.97,l+(o.light||0)*(1-Math.abs(l-.5)*.6));
  const[r,g,b]=hsl2rgb(h,s,l);p[i]=r+(o.warm?6:0);p[i+1]=g+(o.warm?3:0);p[i+2]=b;}
 x.putImageData(d,0,0);return c;}
function tintBody(c,tint){const x=c.getContext('2d'),d=x.getImageData(0,0,c.width,c.height),p=d.data,T=[parseInt(tint.slice(1,3),16),parseInt(tint.slice(3,5),16),parseInt(tint.slice(5,7),16)];
 for(let i=0;i<p.length;i+=4){if(!p[i+3])continue;const mx=Math.max(p[i],p[i+1],p[i+2]),mn=Math.min(p[i],p[i+1],p[i+2]),lum=(.3*p[i]+.59*p[i+1]+.11*p[i+2])/255,sat=mx?(mx-mn)/mx:0;
  if(lum<.42||sat>.4)continue;const k=Math.min(1.12,lum*1.18),m=Math.min(1,(lum-.42)*3.2);
  p[i]+=(T[0]*k-p[i])*m;p[i+1]+=(T[1]*k-p[i+1])*m;p[i+2]+=(T[2]*k-p[i+2])*m;}
 x.putImageData(d,0,0);return c;}
/* ---- vector decals, painted inside a zone of the roof. part = 'cab' | 'trailer' ---- */
const GOLD='#e9bd4a',GOLD2='#a67a1a';
/* The original painted emblems (gold wings, hot-rod flames, crowned sheep), now sized and aligned to the roofs: one big badge on the
   trailer roof, a matching badge on the cab roof's front strip, flames pointing up the road. */
const EMBLEM={1:{rect:[24,410,332,238],rot:0,m:1},2:{rect:[386,388,334,300],rot:-Math.PI/4,m:1.3},3:{rect:[738,388,333,292],rot:0,m:1.12}};
function emblem(id){return(c,x,y,w,h,part,r)=>{const img=r?.images?.extras,e=EMBLEM[id];if(!img)return;const[sx,sy,sw,sh]=e.rect,cs=Math.abs(Math.cos(e.rot)),sn=Math.abs(Math.sin(e.rot)),rw=sw*cs+sh*sn,rh=sw*sn+sh*cs;
  const box=part==='cab'?[w*.86,h*.96]:[w*.98,h*.62],k=Math.min(box[0]/rw,box[1]/rh)*(part==='cab'?1:e.m),cx=x+w/2,cy=part==='cab'?y+h*.5:y+h*.5;
  c.save();c.translate(cx,cy);c.rotate(e.rot);c.shadowColor='#0007';c.shadowBlur=3;c.drawImage(img,sx,sy,sw,sh,-sw*k/2,-sh*k/2,sw*k,sh*k);c.restore();};}
const DECAL_PAINT={1:emblem(1),2:emblem(2),3:emblem(3)};
const ZONE={cab:[26,14,170,50],trailer:[16,12,112,330]};
function composed(r,kind,paint,decal){
 const key=kind+':'+paint+':'+decal,hit=cache.get(key);if(hit)return hit;
 const P=PAINTS[paint]||PAINTS[0],img=r.images.routeTrucks;if(!img)return null;
 const rect=ROUTE_ATLAS.trucks.rects[kind==='cab'?P.cab.sprite:3];let c=crop(img,rect);
 // Pixel recolouring needs readable pixels. If a platform blocks that, fall back to the unpainted sprite rather than failing.
 try{if(kind==='cab'&&(P.cab.hue||P.cab.sat!==undefined||P.cab.light||P.cab.white))hueShift(c,P.cab);
 if(kind==='trailer'&&P.tint)tintBody(c,P.tint);}catch(e){c=crop(img,rect);}
 const dp=DECAL_PAINT[decal];
 if(dp){const x=c.getContext('2d'),z=ZONE[kind];x.save();x.globalCompositeOperation='source-atop';x.globalAlpha=.94;x.beginPath();x.rect(...z);x.clip();dp(x,z[0],z[1],z[2],z[3],kind,r);x.restore();
  // put the original panel ribbing and lighting back over the graphic so it reads as paint, not a sticker
  x.save();x.globalCompositeOperation='soft-light';x.globalAlpha=.35;x.drawImage(crop(img,rect),0,0);x.restore();}
 cache.set(key,c);return c;
}
const chrome=(c,x0,x1)=>{const g=c.createLinearGradient(x0,0,x1,0);g.addColorStop(0,'#6f7a80');g.addColorStop(.35,'#f4f8fa');g.addColorStop(.7,'#a9b4ba');g.addColorStop(1,'#555f66');return g;};
const dot=(c,x,y,r,fill)=>{c.fillStyle=fill;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();};
function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,color.slice(0,7)+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
/* ---- upgrade parts, drawn in cab-local px (origin = cab centre, front is up) ---- */
function cabParts(r,c,u,st,t,under){
 const L=u||{};
 if(under){ // beams and bull bar sit under the bodywork
  if(L.lights){const reach=70+34*L.lights;const g=c.createLinearGradient(0,-56,0,-56-reach);g.addColorStop(0,'rgba(255,248,205,.32)');g.addColorStop(1,'rgba(255,248,205,0)');c.fillStyle=g;for(const s of[-1,1]){c.beginPath();c.moveTo(s*14,-56);c.lineTo(s*(22+L.lights*3),-56-reach);c.lineTo(s*(2),-56-reach);c.closePath();c.fill();}}
  return;}
 if(L.insurance){const n=L.insurance;c.strokeStyle=chrome(c,-30,30);c.lineCap='round';c.lineWidth=3.4;c.beginPath();c.moveTo(-24,-52);c.lineTo(-27,-62);c.lineTo(27,-62);c.lineTo(24,-52);c.stroke();
  if(n>=2){c.lineWidth=2.6;c.beginPath();c.moveTo(-14,-62);c.lineTo(-14,-68);c.lineTo(14,-68);c.lineTo(14,-62);c.stroke();}
  if(n>=3){c.fillStyle='#14181a';c.beginPath();c.moveTo(-8,-71);c.lineTo(8,-71);c.lineTo(8,-63);c.lineTo(0,-58);c.lineTo(-8,-63);c.closePath();c.fill();c.fillStyle=GOLD;c.beginPath();c.moveTo(-6.4,-69.5);c.lineTo(6.4,-69.5);c.lineTo(6.4,-63.6);c.lineTo(0,-59.8);c.lineTo(-6.4,-63.6);c.closePath();c.fill();c.fillStyle='#14181a';c.fillRect(-1,-68,2,6);c.fillRect(-4,-65.4,8,1.6);}}
 if(L.lights){const w=30+9*L.lights;r.world.atlas('routeProps',15,0,-51,w,w/2.15);
  if(L.lights>=2)for(const s of[-1,1]){dot(c,s*29,-55,3,'#fffbe4');glow(c,s*29,-55,11,'#fff6c8aa');}
  if(L.lights>=3)for(let i=-3;i<=3;i++)dot(c,i*7,-32,1.5,'#ffb52e');}
 if(L.steering){const n=L.steering,reach=6+n*2.4;for(const s of[-1,1]){c.strokeStyle=chrome(c,-40,40);c.lineWidth=2.1;c.lineCap='round';c.beginPath();c.moveTo(s*30,-30);c.lineTo(s*(30+reach),-35);c.stroke();
   c.fillStyle=n>=3?'#171b1d':chrome(c,-40,40);c.beginPath();c.roundRect(s*(30+reach)-2.6+(s>0?1:-1),-43,5.2,14,2.3);c.fill();c.fillStyle='#8cc7ee';c.fillRect(s*(30+reach)-1+(s>0?1.3:-1.3),-41,2,10);
   const turning=Math.abs(st.lane-st.x)>.15&&Math.sign(st.lane-st.x)===s,on=turning&&Math.floor(t*8)%2===0;dot(c,s*(30+reach)+s*.5,-30,1.8,on?'#ffb12b':'#8a5a16');if(on)glow(c,s*(30+reach),-30,8,'#ffb12baa');}}
 if(L.washroom){const w=9+3.4*L.washroom;r.world.atlas('routeTrucks',7,0,-14,w,w/1.52);}
 if(L.bunk){const n=L.bunk;c.save();c.translate(0,-32);c.scale(.72,.72);c.fillStyle='#1b2a3d';c.beginPath();c.roundRect(-11,-7.5,22,15,3.5);c.fill();const g=c.createLinearGradient(-9,-6,9,6);g.addColorStop(0,'#3d6a9e');g.addColorStop(.5,'#9fcbf0');g.addColorStop(1,'#35608f');c.fillStyle=g;c.beginPath();c.roundRect(-9.5,-6,19,12,2.6);c.fill();c.strokeStyle='#ffffffaa';c.lineWidth=1;c.beginPath();c.moveTo(-6,4);c.lineTo(2,-4.5);c.stroke();
  if(n>=2){c.strokeStyle='#ffd88a';c.lineWidth=1.3;c.strokeRect(-9.5,-6,19,12);glow(c,0,0,15,'#ffcf7066');}
  if(n>=3){c.fillStyle='#fff7d6';c.beginPath();c.arc(3,-.5,3.7,.55*Math.PI,1.55*Math.PI+TAU*0,false);c.arc(4.6,-1.4,3,1.35*Math.PI,.65*Math.PI,true);c.fill();}
  c.restore();}
 if(L.horn){const n=L.horn+1,lens=[14,19,23,17].slice(0,n),gap=4.6,x0=-(n-1)*gap/2;
  c.fillStyle='#0c1214aa';c.beginPath();c.roundRect(x0-4,-8,(n-1)*gap+8,5,2);c.fill();
  lens.forEach((len,i)=>{const x=x0+i*gap;c.save();c.translate(x,-5);const g=c.createLinearGradient(-2.6,0,2.6,0);g.addColorStop(0,'#59646a');g.addColorStop(.4,'#f6fafc');g.addColorStop(1,'#7b878d');c.fillStyle=g;c.beginPath();c.moveTo(-1.5,0);c.lineTo(1.5,0);c.lineTo(2.7,-len);c.lineTo(-2.7,-len);c.closePath();c.fill();c.fillStyle='#10171a';c.beginPath();c.ellipse(0,-len,2.7,1.2,0,0,TAU);c.fill();c.strokeStyle='#ffffffcc';c.lineWidth=.7;c.beginPath();c.ellipse(0,-len,2.7,1.2,0,0,TAU);c.stroke();c.restore();});
  if(st.hornAge<.35){c.save();c.strokeStyle='rgba(255,246,190,'+(1-st.hornAge/.35)*.8+')';c.lineWidth=2;for(let k=0;k<3;k++){const rr=22+k*14+st.hornAge*80;c.beginPath();c.arc(0,-24,rr,-Math.PI*.8,-Math.PI*.2);c.stroke();}c.restore();}}
}
function stacks(r,c,u,st,t){const n=u?.exhaust||0;if(!n)return;
 for(const s of[-1,1]){const rad=2.3+n*.9,h=10+n*4;c.save();c.translate(s*(RIG.cabW/2-2),9);
  // a tall chrome stack seen from above and slightly in front: body, shadow on the deck, and a dark mouth
  c.fillStyle='rgba(8,14,14,.35)';c.beginPath();c.ellipse(3,h*.55,rad+1.5,h*.55+2,0,0,TAU);c.fill();
  const g=c.createLinearGradient(-rad,0,rad,0);g.addColorStop(0,'#5a666c');g.addColorStop(.35,'#ffffff');g.addColorStop(.7,'#aebbc1');g.addColorStop(1,'#46525a');c.fillStyle=g;c.beginPath();c.moveTo(-rad,0);c.lineTo(-rad,h);c.arc(0,h,rad,Math.PI,0,true);c.lineTo(rad,0);c.closePath();c.fill();
  if(n>=2){c.strokeStyle='#37434a';c.lineWidth=.9;c.beginPath();c.moveTo(-rad,h*.45);c.lineTo(rad,h*.45);c.stroke();}
  if(n>=3){c.fillStyle='#d9c36a';c.fillRect(-rad,h*.7,rad*2,1.6);}
  c.fillStyle=g;c.beginPath();c.ellipse(0,0,rad,rad*.9,0,0,TAU);c.fill();c.fillStyle='#0a0d0e';c.beginPath();c.ellipse(0,0,rad*.62,rad*.55,0,0,TAU);c.fill();c.strokeStyle='#f4f8fa';c.lineWidth=.9;c.beginPath();c.ellipse(0,0,rad,rad*.9,0,0,TAU);c.stroke();
  if(st.boost>0){const f=.6+Math.sin(t*40+s)*.3,len=(10+n*4)*f*1.8,g2=c.createLinearGradient(0,0,0,len);g2.addColorStop(0,'rgba(255,200,110,.9)');g2.addColorStop(.5,'rgba(255,120,60,.5)');g2.addColorStop(1,'rgba(255,100,40,0)');c.fillStyle=g2;c.beginPath();c.moveTo(-rad*.5,h);c.lineTo(rad*.5,h);c.lineTo(0,h+len);c.closePath();c.fill();}
  c.restore();}}
function trailerParts(r,c,u,st,t){
 const L=u||{},W=RIG.trailerW,H=RIG.trailerL;
 if(L.suspension){const n=L.suspension;for(const s of[-1,1])for(let i=0;i<n;i++){const y=H*(.2+.085*i)+3;c.save();c.translate(s*(W/2+4.4),y);c.fillStyle='#14181a';c.beginPath();c.roundRect(-2.6,-4,5.2,8,2.2);c.fill();c.strokeStyle='#4a5a62';c.lineWidth=.8;for(const yy of[-1.6,0,1.6]){c.beginPath();c.moveTo(-2.6,yy);c.lineTo(2.6,yy);c.stroke();}c.fillStyle='#bfc9ce';c.fillRect(-3,-4.6,6,1.4);c.fillRect(-3,3.2,6,1.4);dot(c,0,0,.9,'#4fa3ff');c.restore();}}
 if(L.stability){const n=L.stability,y0=-H/2+4;for(const s of[-1,1]){c.save();c.translate(s*(W/2-9),y0);c.strokeStyle=chrome(c,-30,30);c.lineWidth=2.6;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.lineTo(s*-4,15);c.stroke();c.strokeStyle='#f1b72b';c.lineWidth=2;c.beginPath();for(let k=0;k<6;k++)c.lineTo((k%2?-2.6:2.6)+s*-1.5,3+k*2);c.stroke();dot(c,0,0,2.4,'#aab4ba');dot(c,s*-4,15,2,'#aab4ba');c.restore();}
  if(n>=2){c.strokeStyle='#58ffa8';c.lineWidth=2;c.globalAlpha=.85;c.beginPath();c.moveTo(-W/2+4,-H/2+1.5);c.lineTo(W/2-4,-H/2+1.5);c.stroke();c.globalAlpha=1;glow(c,0,-H/2+2,26,'#58ffa855');}
  if(n>=3){for(const s of[-1,1]){c.strokeStyle='#58ffa8';c.lineWidth=1.8;c.globalAlpha=.7+Math.sin(t*5)*.2;c.beginPath();c.moveTo(s*(W/2-1),-H/2+14);c.lineTo(s*(W/2-1),H*.12);c.stroke();c.globalAlpha=1;}}}
 if(L.insurance>=3){c.save();c.translate(W/2-13,-H/2+20);c.fillStyle='#14181a';c.beginPath();c.moveTo(-6,-6);c.lineTo(6,-6);c.lineTo(6,2);c.lineTo(0,8);c.lineTo(-6,2);c.closePath();c.fill();c.fillStyle=GOLD;c.beginPath();c.moveTo(-4.5,-4.5);c.lineTo(4.5,-4.5);c.lineTo(4.5,1.4);c.lineTo(0,5.8);c.lineTo(-4.5,1.4);c.closePath();c.fill();c.restore();}
}
/* st: {truck,decal,trailerPaint,trailerDecal,upgrades,lane,x,angle,trailer,rear,hasTrailer,job,grip,boost,shield,hornAge}
   scale: extra magnification (garage). ys: vertical squash (the game camera is tilted). */
function drawRig(r,st,px,py,alpha=1,scale=1,ys=.72,time=0){
 const c=r.ctx,u=st.upgrades||{},angle=Math.max(-.2,Math.min(.2,((st.lane??2)-(st.x??2))*.16)),clampv=(v,a,b)=>Math.max(a,Math.min(b,v));
 const pose=rigPose(0,0,angle,st.angle||0,clampv(((st.trailer??2)-(st.rear??2))*.55,-.8,.8)),has=st.hasTrailer!==false;
 const cab=composed(r,'cab',st.truck??0,st.decal??0),tr=composed(r,'trailer',st.trailerPaint??1,st.trailerDecal??st.decal??0);
 c.save();c.translate(px,py);c.scale(scale,scale*ys);c.globalAlpha=alpha;
 const img=(im,x,y,w,h,a)=>{if(!im)return;c.save();c.translate(x,y);c.rotate(a||0);c.drawImage(im,-w/2,-h/2,w,h);c.restore();};
 const soft=(x,y,w,h,a)=>{c.save();c.translate(x+5,y+7);c.rotate(a||0);c.fillStyle='rgba(6,14,12,.30)';c.beginPath();c.roundRect(-w/2,-h/2,w,h,9);c.fill();c.restore();};
 soft(0,0,RIG.cabW-6,RIG.cabL-8,angle);if(has){soft(pose.trailer.x,pose.trailer.y,RIG.trailerW-4,RIG.trailerL-4,pose.trailer.angle);if(st.job?.double)soft(pose.rear.x,pose.rear.y,RIG.flatW-4,RIG.flatL-4,pose.rear.angle);}
 c.save();c.rotate(angle);cabParts(r,c,u,st,time,true);c.restore();
 if(has&&st.job?.double)r.world.atlas('routeTrucks',4,pose.rear.x,pose.rear.y,RIG.flatW,RIG.flatL,pose.rear.angle,alpha);
 img(cab,0,0,RIG.cabW,RIG.cabL,angle);
 if(has){img(tr,pose.trailer.x,pose.trailer.y,RIG.trailerW,RIG.trailerL,pose.trailer.angle);c.save();c.translate(pose.trailer.x,pose.trailer.y);c.rotate(pose.trailer.angle);trailerParts(r,c,u,st,time);c.restore();}
 c.save();c.rotate(angle);stacks(r,c,u,st,time);cabParts(r,c,u,st,time,false);c.restore();
 if(st.grip>0){c.globalAlpha=Math.min(.3,st.grip*.07);c.fillStyle='#91704d';for(const side of[-1,1])c.fillRect(side*24-3,46,6,18);c.globalAlpha=alpha;}
 if(st.shield){c.save();const pulse=.5+.5*Math.sin(time*6),cx=0,cy=has?60:0,ry=has?150:80;const g=c.createRadialGradient(cx,cy,20,cx,cy,ry);g.addColorStop(0,'rgba(255,238,150,0)');g.addColorStop(.8,'rgba(255,230,120,'+(.12+.1*pulse)+')');g.addColorStop(1,'rgba(255,240,170,.5)');c.fillStyle=g;c.beginPath();c.ellipse(cx,cy,60,ry,0,0,TAU);c.fill();c.restore();}
 c.restore();
}
function drawTrailerOnly(r,paint,decal,x,y,w,h,angle,alpha){const t=composed(r,'trailer',paint,decal);if(!t)return;const c=r.ctx;c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(angle);c.drawImage(t,-w/2,-h/2,w,h);c.restore();}

/* Little upright thumbnails for the garage cards (cab or trailer, with paint + roof graphic). Cached data URLs. */
const thumbs=new Map();
function thumb(r,kind,paint,decal){const key=kind+':'+paint+':'+decal;if(thumbs.has(key))return thumbs.get(key);
 const src=composed(r,kind,paint,decal);if(!src)return '';const c=mk(Math.round(src.width*.55),Math.round(src.height*.55));c.getContext('2d').drawImage(src,0,0,c.width,c.height);
 let url='';try{url=c.toDataURL('image/png');}catch(e){url='';}thumbs.set(key,url);return url;}

module.exports={PAINTS,DECAL_PAINT,drawRig,drawTrailerOnly,thumb};

},
"./road-events.js":function(module,exports,require){
/* Deterministic lane-specific rolling road encounters. No static pre-scripted sequence.
   Scenarios change with the seeded session; at least two of five lanes remain open.
   All world positions are measured in the same units as Drive.items. */
const choice=(rng,values)=>values[Math.floor(rng()*values.length)];
const SCENARIO_NAMES=['narrow','split','contraflow','oneway','works','bus','chicane'];
function chooseRoadScenario(rng,z,previous='',difficulty=0){
 const allowed=difficulty>=.18?SCENARIO_NAMES:SCENARIO_NAMES.filter(n=>n!=='chicane');
 const options=allowed.filter(n=>n!==previous);
 const name=choice(rng,options);
 const side=rng()<.5?0:4;
 const fromEdge=side===0?[0,1]:[4,3];
 const width=rng()<.6?1:2;
 const p=[];
 const section=(type,lane,at=z,length=340)=>p.push({type,lane,z:at,length,warning:620});
 const vehicle=(lane,at=z+175)=>p.push({type:'car',lane,z:at,oncoming:true});
 switch(name){
  case 'narrow':section('grass',0);section('grass',4);break;
  case 'split':section('works',2);section('noentry',rng()<.5?1:3);break;
  case 'contraflow':section('noentry',side);vehicle(side);if(width===2)section('noentry',fromEdge[1]);break;
  case 'oneway':for(const lane of fromEdge)section('noentry',lane);break;
  case 'works':section('works',choice(rng,[1,2,3]));section('narrow',side,z+95,175);break;
  case 'bus':section('bus',side);if(width===2)section('noentry',fromEdge[1],z+115,190);break;
  case 'chicane':{
   const pivot=choice(rng,[1,2,3]);section('works',pivot,z,170);
   const next= pivot===1?3:pivot===3?1:choice(rng,[0,4]);
   section('narrow',next,z+210,170);break;
  }
 }
 // Never emit a complete full-width blockade, even at max difficulty.
 const lanes=new Set(p.filter(e=>e.length).map(e=>e.lane));
 if(lanes.size>3)throw Error('Scenario blocks too many lanes');
 return {name,items:p};
}

module.exports={SCENARIO_NAMES,chooseRoadScenario};

},
"./upgrades.js":function(module,exports,require){
const CATALOG=[
 ['stability','STEADY EDDIE','Trailer stabiliser: sway settles 20% faster per level.',350,10],
 ['suspension','AIR-RIDE','Air suspension: 8% less trailer angle per level.',450,10],
 ['steering','QUICK HANDS','Better wheel: steering response 12% quicker per level.',400,9],
 ['lights','SEE EWE LATER','LED lightbar: 65 metres more visibility per level.',500,7],
 ['exhaust','BIG PIPES','Chrome stacks: 5% more coin earnings per level.',550,2],
 ['washroom','ENSUITE SUITE','Sleeper washroom: +£20 per taco break per level.',650,3],
 ['bunk','SLEEP LIKE A LOG','Better bunk: rested handling and 3% delivery bonus per level.',550,8],
 ['insurance','MATES’ RATES','Damage insurance: 12% smaller fines per level. Level 3 adds a once-per-shift bail-out from a crash (£400 excess).',350,11],
 ['horn','THE BIG TOOT','Air horn: 0.16 second more sheep-reaction time per level.',350,0]
].map(([id,name,description,cost,icon])=>({id,name,description,cost,icon}));
const defaults=()=>Object.fromEntries(CATALOG.map(u=>[u.id,0]));
const normalize=(v={})=>Object.fromEntries(CATALOG.map(u=>[u.id,Math.min(3,Math.max(0,Math.floor(Number(v?.[u.id])||0)))]));
/* Paint styles are shared by the cab and the trailer: unlock one and either can wear it (or both). Trailer default is white. */
const TRUCKS=[
 {id:1,name:'ARCTIC WHITE',desc:'Clean, crisp and entirely forgettable. The trailer’s factory colour.',cost:0,bonus:0},
 {id:0,name:'THE OLD FAITHFUL',desc:'Your trusty turquoise mile muncher.',cost:0,bonus:0},
 {id:2,name:'THE TANGERINE DREAM',desc:'Sunset paint · +2% delivery earnings.',cost:1200,bonus:2},
 {id:3,name:'THE NIGHT SHIFT',desc:'Midnight purple · +4% delivery earnings.',cost:2800,bonus:4},
 {id:4,name:'POST HASTE',desc:'Pillar-box red. Stops traffic and fits through letterboxes. Not really.',cost:1600,bonus:2},
 {id:5,name:'RACING GREEN',desc:'Proper British green · for drivers with taste and a flat cap.',cost:2000,bonus:3}
];
/* Roof graphics, drawn as vector art clipped to the cab and trailer roofs (see rigart.js). */
const DECALS=[
 {id:0,name:'FACTORY',cost:0},
 {id:1,name:'GOLD WINGS',cost:700},
 {id:2,name:'HOT HAUL',cost:900},
 {id:3,name:'FLOCK ROYALTY',cost:1100}
];
const DECAL_TAGS=['Factory finish. Honest and humble.','Golden wings for a golden driver. +2% on deliveries.','Flames on a lorry. Speed not included. +2% on deliveries.','Flock Royalty: the sheep approve. +2% on deliveries.'];
const PAINT_IDS=TRUCKS.map(t=>t.id);
const DECAL_IDS=DECALS.map(d=>d.id);
const deliveryBonus=(u,truck,decal)=>u.bunk*.03+((TRUCKS.find(t=>t.id===truck)?.bonus)||0)/100+(decal>0?.02:0);
const STATS={
 stability:{label:'SWAY SETTLES',f:l=>l?l*20+'% faster':'stock'},
 suspension:{label:'TRAILER ANGLE',f:l=>l?l*8+'% less':'stock'},
 steering:{label:'STEERING SNAP',f:l=>l?l*12+'% quicker':'stock'},
 lights:{label:'NIGHT VISION',f:l=>l?'+'+l*65+' m':'stock'},
 exhaust:{label:'COIN PAY',f:l=>l?'+'+l*5+'%':'stock'},
 washroom:{label:'TACO BREAK PAY',f:l=>'£'+(100+l*20)},
 bunk:{label:'DELIVERY BONUS',f:l=>l?'+'+l*3+'%':'stock'},
 insurance:{label:'FINES',f:l=>l?l*12+'% smaller'+(l>=3?' + bail-out':''):'full price'},
 horn:{label:'HORN WINDOW',f:l=>(.75+l*.16).toFixed(2)+' s'}
};

module.exports={CATALOG,defaults,normalize,TRUCKS,DECALS,DECAL_TAGS,PAINT_IDS,DECAL_IDS,deliveryBonus,STATS};

},
"./model.js":function(module,exports,require){
const {laneX,rigPose,roadTheme,RIG}=require("./geometry.js");
const {chooseRoadScenario}=require("./road-events.js");
const {ROUTE_VERSION,CHUNK_LENGTH,roadAt,surfaceAt,routeLanes,laneCorridor,nearestLane,reachableCorridor,steeringX,sceneryProps,rewardPath}=require("./route-world.js");
const {HAZARD_SPECS,sweptOverlap}=require("./route-hazards.js");
const {normalize,deliveryBonus}=require("./upgrades.js");
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const themes=['THE TOWN RUN','COUNTRY MILES','SUBURBAN SHORTCUT','HARD HAT HAUL'];
const ROAD_TYPES=['lowbridge','weakbridge','bus','noentry','narrow','grass','house','works'];
/* Hazards that end the shift outright, each with its own comic vignette (see COMICS in game.js) and result-sheet line. */
const CRASHES={car:'Not a bumper car.',lowbridge:'Height restriction. Not a suggestion.',weakbridge:'Weight limit: less than you.',oil:'Slick move, driver.',house:'Planning permission denied.',sheep:'Ewe had one job.',cow:'Holy cow. Literally.',icecream:'Chocolate flake-ing disaster.',binlorry:'Bin there, done that.'};
const PICKUPS=['job','crumb','finish','taco','coin','night','boost','hitch','prize','shield'];
/* Weighted hazard mix per scenery stage. Every hazard type in route-hazards.js appears somewhere, so the road never feels empty or samey. */
const MIX=[
 [['car',4],['cone',3],['bus',2],['noentry',2],['lowbridge',1.5],['barrier',2],['narrow',1.5],['pit',1.5],['geese',1]],
 [['mud',3],['car',2],['weakbridge',1.5],['grass',2],['haybale',2.5],['pit',1],['oil',1],['lowbridge',1],['geese',1.5]],
 [['car',3],['footpath',2.5],['cone',2],['noentry',1.5],['narrow',2],['barrier',1.5],['lowbridge',1.5],['oil',1]],
 [['works',3],['pit',2.5],['oil',2],['barrier',2.5],['cone',2],['lowbridge',1],['weakbridge',1.5],['mud',1.5],['noentry',1]]
];
/* The funny stuff: every kind turns up in rotation (a shuffled bag), about every 1,500-2,200 units, so none of them is a rarity. */
const FUNNY=['cow','icecream','morris','cyclists','geese','tractor','caravan','binlorry'];
const FUNNY_PAY={cow:[60,'MOO-VE ALONG!'],geese:[35,'SHOOED!'],morris:[45,'JIG’S UP!'],cyclists:[40,'PELOTON PARTED!']};
const pickWeighted=(list,r)=>{let t=list.reduce((a,b)=>a+b[1],0)*r;for(const [k,w] of list){t-=w;if(t<=0)return k;}return list[0][0];};
function seeded(seed){const fn=()=>{seed|=0;seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;fn.state=seed;return((t^t>>>14)>>>0)/4294967296;};fn.state=seed;return fn;}
function jobPath(lane,rng,count=10){const p=[];for(let i=0;i<count;i++){if(i%2)lane=clamp(lane+(rng()>.5?1:-1),0,4);p.push(lane);}return p;}
function biomeAt(z){return roadTheme(z);}
function hazardKinds(z){return [['car','cone','bus','noentry','lowbridge'],['grass','weakbridge','oil','lowbridge','narrow'],['house','car','noentry','narrow'],['barrier','cone','oil','works']][biomeAt(z)];}
class Drive {
 constructor(options={}){
  this.seed=options.seed??Date.now();this.routeVersion=ROUTE_VERSION;this.hasTrailer=true;this.grip=0;this.offroad=0;this.surface='asphalt';this.dropCooldown=0;this.detached=[];this.routeFines={};this.routeChoice={};this.nextHitch=0;this.nearIds=[];this.sceneryHits={};this.rng=seeded(this.seed);
  this.mode=options.mode||'endless';this.upgrades=normalize(this.mode==='daily'?{}:options.upgrades);
  this.truck=this.mode==='daily'?0:(options.truck||0);this.decal=this.mode==='daily'?0:(options.decal||0);this.trailerPaint=this.mode==='daily'?1:(options.trailerPaint??1);this.trailerDecal=this.mode==='daily'?0:(options.trailerDecal||0);this.hornAt=-10;
  this.events=[];this.items=[];this.distance=0;this.time=0;this.money=500;this.earned=0;this.fines=0;this.jobs=0;this.crumbs=0;this.horns=0;this.near=0;
  this.lane=2;this.x=2;this.trailer=2;this.rear=2;this.sway=0;this.angle=0;this.rapid=0;this.lastMove=-10;this.invulnerable=0;this.speed=180;
  this.lastScenario='';this.cruise=240;this.row=900;this.nextJob=600;this.nextSheep=6500;this.nextNight=5600;this.nextBoost=1700;this.nextFunny=1500;this.funnyBag=[];this.nextShield=3600;this.shield=0;this.leaving=[];this.night=null;this.nights=0;this.boost=0;this.rested=this.upgrades.bunk?20+8*this.upgrades.bunk:0;
  this.job=null;this.sheep=null;this.finished=false;this.endReason='';this.stage=0;this.slow=0;this.multiplier=1;this.id=0;this.sheepFail=0;this.combo=0;this.crashKind='';this.lives=this.upgrades.insurance>=3?1:0;
 }
 snapshot(){const d={...this,rngState:this.rng.state};delete d.rng;d.events=[];return d;}
 static restore(data){if(!data||data.finished||!Number.isFinite(data.distance)||data.distance<0||!Array.isArray(data.items)||data.items.length>600||!Number.isFinite(data.money))return null;const g=new Drive();for(const k of Object.keys(g))if(k!=='rng'&&k!=='events'&&Object.hasOwn(data,k))g[k]=data[k];g.upgrades=normalize(g.upgrades);g.rng=seeded(data.rngState||1);g.events=[];if(data.routeVersion!==ROUTE_VERSION){g.items=[];g.job=null;g.night=null;g.sheep=null;g.row=g.distance+900;g.nextJob=g.distance+700;g.nextNight=g.distance+5500;g.lane=g.x=g.trailer=g.rear=nearestLane(g.distance,2,g.seed);g.emit('hint',{text:'Road upgrade loaded. Your shift balance is safe.'});}g.routeVersion=ROUTE_VERSION;return g;}
 emit(type,data={}){this.events.push({type,...data});}
 add(type,z,lane,props={}){const road=ROAD_TYPES.includes(type),spec=HAZARD_SPECS[type];const e={id:++this.id,type,z,lane,done:false,collectible:PICKUPS.includes(type),...(road?{road:true,length:['bus','noentry','works'].includes(type)?310:190,warning:390}:{}),...props};if(spec){e.hitWidth=spec.hitWidth;e.hitHeight=spec.hitHeight;}this.items.push(e);return e;}
 dropTrailer(){
  if(this.finished||!this.hasTrailer||this.dropCooldown>0)return false;
  const lost=this.job?.pay||0;this.hasTrailer=false;this.dropCooldown=1.5;
  this.detached.push({x:laneX(this.x,this.distance),z:this.distance-72,angle:this.angle,age:0,double:!!this.job?.double});
  this.job=null;this.multiplier=1;this.sway=0;this.rapid=0;this.angle=0;this.trailerLost=true;
  this.items=this.items.filter(e=>!['crumb','finish'].includes(e.type));
  this.nextHitch=this.distance+1050;this.nextJob=Math.min(this.nextJob,this.distance+1500);this.row=Math.max(this.row,this.distance+600);
  this.emit('trailerDrop',{lost});return true;
 }
 hitchTrailer(){if(this.hasTrailer)return;this.hasTrailer=true;this.trailer=this.rear=this.x;this.angle=this.rapid=this.sway=0;this.dropCooldown=1.5;this.emit('trailerHitch');}
 move(direction){if(this.finished)return;const next=clamp(this.lane+direction,0,4);if(next===this.lane)return;this.rapid=clamp(this.rapid+(this.time-this.lastMove<.2?.3:.07),0,1.5);this.lastMove=this.time;this.lane=next;this.emit('steer');}
 horn(){if(this.finished)return;this.hornAt=this.time;this.emit('horn');
  /* A honk shoos cows, geese, Morris dancers and cyclists off the road if they are close enough to hear it (but not so close it is too late). */
  for(const e of this.items){if(e.honkable&&!e.done&&!e.cleared){const d=e.z-this.distance;if(d>70&&d<500){e.cleared=true;e.done=true;this.leaving.push({type:e.type,lane:e.lane,z:e.z,dir:e.lane<2?-1:e.lane>2?1:(this.rng()<.5?-1:1),age:0});this.horns++;const pay=FUNNY_PAY[e.type]||[35,'SHOOED!'];this.award(pay[0],pay[1]);this.emit('shoo',{kind:e.type});}}}
  if(!this.sheep||this.sheep.cleared)return;
  // Sheep: any honk from the baa until they are almost on you clears them (it used to be a 0.75 s window that expired well before impact).
  // A honk up to a quarter-second before the baa (more with a better horn) also counts, so quick fingers are rewarded, not punished.
  const s=this.sheep,ahead=s.z-this.distance,trigger=Math.max(375,this.speed*1.5),lead=.25+this.upgrades.horn*.16;
  if(s.baa?ahead>35:ahead<trigger+this.speed*lead){s.cleared=true;this.horns++;this.award(75,'WOOL DONE!');this.emit('sheepClear');}else this.emit('hint',{text:'Wait for the BAA…'});}
 award(value,label){this.money+=value;this.earned+=value;this.emit('cash',{value,label});}
 fine(value,label){if(this.invulnerable>0)return;value=Math.round(value*(1-.12*this.upgrades.insurance));this.money-=value;this.fines+=value;this.combo=0;this.invulnerable=1.3;this.slow=.8;this.emit('loss',{value,label});if(this.money<=0)this.end('The float has floated away.');}
 jobValue(value){return Math.round(value*this.multiplier*(1+deliveryBonus(this.upgrades,this.truck,this.decal)));}
 startJob(item){if(this.job||this.night)return;this.hitchTrailer();this.multiplier=item.double?2:1;this.job={label:item.double?'THE DOUBLE TROUBLE':'SUPERMARKET SWEEP',pay:this.jobValue(150),count:0,total:10,double:!!item.double,end:item.z+1780};this.items=this.items.filter(e=>e===item||e.z+(e.length||0)<item.z-240||e.z>this.job.end+650);
  const positions=Array.from({length:10},(_,i)=>item.z+160*(i+1));positions.push(this.job.end);const p=rewardPath(positions,item.lane,this.seed,this.rng);
  positions.forEach((z,i)=>this.add(i===10?'finish':'crumb',z,p[i]));
  // Two authored obstacles sit beside the trail where the road has room. They
  // cannot consume the selected pickup lane or the escape corridor.
  for(const i of [3,7]){const z=positions[i],other=laneCorridor(z-100,z+200,this.seed,true).filter(l=>l!==p[i]&&Math.abs(l-p[i])>0);if(other.length>=2)this.add('cone',z,other[0]);}
  this.row=Math.max(this.row,this.job.end+650);this.nextJob=this.job.end+1000;this.emit('job',{label:this.job.label,double:this.job.double});}
 startNight(item){if(this.job||this.sheep||this.night)return;const end=item.z+4200;this.night={start:item.z,end};this.nights++;this.items=this.items.filter(e=>e===item||e.z+(e.length||0)<item.z-235||e.z>end+600);const positions=Array.from({length:40},(_,i)=>item.z+(i+1)*100),path=rewardPath(positions,item.lane,this.seed,this.rng);
  for(let i=0;i<40;i++){this.add('coin',positions[i],path[i],{nightCoin:true});if(i%10===7){const other=laneCorridor(positions[i]-100,positions[i]+180,this.seed,true).filter(l=>l!==path[i]);if(other.length>=2)this.add('cone',positions[i],other[0]);}}
  this.row=Math.max(this.row,end+650);this.nextJob=Math.max(this.nextJob,end+760);this.nextSheep=Math.max(this.nextSheep,end+1100);this.nextNight=end+4300;this.emit('night');}
 collect(e){if(e.done)return;e.done=true;if(!PICKUPS.includes(e.type))this.lastHit={type:e.type,lane:e.lane,z:e.z,item:e};switch(e.type){
  case 'hitch':this.hitchTrailer();break;case 'shield':this.shield=1;this.emit('shield');break;
  case 'cow':case 'icecream':case 'binlorry':this.crash(e.type);break;case 'morris':this.fine(90,'Morris dancers: bells and bruises.');break;case 'cyclists':this.fine(80,'Lycra everywhere. Sorry, peloton.');break;case 'caravan':this.fine(120,'Caravan of regret. £120.');break;case 'tractor':this.fine(110,'Slow lane. Slower tractor.');break;case 'haybale':this.fine(60,'Hay fever. £60.');break;case 'geese':this.fine(75,'Goose bumps. £75.');break;case 'prize':this.award(85,'RISK REWARDED');this.emit('prize');break;
  case 'mud':this.grip=Math.max(this.grip,4.8);this.emit('mud');break;case 'pit':this.fine(95,'That pothole has ambition.');break;case 'footpath':this.fine(90,'Public path. Private embarrassment.');break;
  case 'job':this.startJob(e);break;case 'night':this.startNight(e);break;
  case 'boost':this.boost=7+this.upgrades.exhaust;this.emit('boost');break;
  case 'crumb':if(this.job){this.job.count++;this.crumbs++;this.combo++;const v=this.jobValue(25);this.job.pay+=v;this.emit('crumb',{value:v});}break;
  case 'finish':if(this.job){const pay=this.job.pay,dbl=this.job.double;this.jobs++;this.award(pay,'DELIVERY BANKED');this.emit('delivery',{pay,perfect:this.job.count===10,double:dbl});this.job=null;this.multiplier=1;}break;
  case 'taco':this.award(100+20*this.upgrades.washroom,'TACO BREAK. PAID.');this.slow=2.4;this.emit('taco');break;
  case 'coin':this.award(Math.round(15*(this.night?2:1)*(1+.05*this.upgrades.exhaust)),this.night?'DOUBLE BUBBLE':'ROAD BONUS');break;
  case 'car':case 'lowbridge':case 'weakbridge':case 'oil':case 'house':this.crash(e.type);break;case 'cone':case 'barrier':case 'works':this.fine(70,'Cones are not a slalom.');break;
  case 'narrow':this.fine(80,'Mirrors are wider than optimism.');break;case 'bus':this.fine(90,'You are not a bus.');break;
  case 'noentry':this.fine(120,'Sat-nav says… absolutely not.');break;
  case 'grass':this.grip=Math.max(this.grip,4.8);this.fine(65,'Lawn care: £65.');break;
 }}
 crash(kind){if(this.finished)return;
  if(this.shield>0){this.shield=0;this.invulnerable=2.2;this.slow=.6;this.emit('shieldSave',{kind});return;}
  if(this.lives>0){this.lives--;this.money-=400;this.fines+=400;this.combo=0;this.invulnerable=2.6;this.slow=1.2;this.rapid=0;this.emit('bailout',{kind,value:400});if(this.money<=0)this.end('The float has floated away.');return;}
  this.crashKind=kind;this.emit('crash',{kind});this.end(CRASHES[kind]);}
 end(reason){if(this.finished)return;this.finished=true;this.endReason=reason;this.emit('end',{reason});}
 /* ---- lane occupancy: hazards, pickups and oncoming traffic are never placed on top of each other ---- */
 laneBusy(lane,z0,z1,pad=110){return this.items.some(e=>{if(e.done||e.lane!==lane)return false;const art=e.collectible?0:(HAZARD_SPECS[e.type]?.height||0)/2;return e.z-art-pad<z1&&e.z+art+(e.length||40)+(e.reserve||0)+pad>z0;});}
 openLanes(z0,z1,pad=60){return [0,1,2,3,4].filter(l=>!this.laneBusy(l,z0,z1,pad));}
 shuffled(){const a=[0,1,2,3,4];for(let i=4;i>0;i--){const j=Math.floor(this.rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 /* One row of 1-3 hazards. At least two lanes stay open and one of them is reachable (one swipe per ~0.34s) from the lanes that were open just before. Returns the row's length. */
 makeRow(z,gapSec){
  const route=roadAt(z,this.seed),corridor=laneCorridor(z-100,z+240,this.seed,true);
  if(corridor.length<2)return 160;
  const r=this.ramp(),busy=!!(this.job||this.night);
  // 1-3 hazards per row. Always at least two open lanes in the corridor, and the reachability test below keeps one of them steerable.
  let count=1+(this.rng()<.32+.4*r?1:0)+(this.rng()<.08+.34*r?1:0);
  count=Math.min(count,Math.max(1,corridor.length-2),busy?2:3);
  const biome=biomeAt(z),mix=route.motif==='roadworks'?[['works',3],['pit',2],['barrier',3],['cone',2]]:MIX[biome];
  const order=corridor.slice();for(let i=order.length-1;i>0;i--){const j=Math.floor(this.rng()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  const placed=[];
  for(const lane of order){
   if(placed.length>=count)break;
   const kind=pickWeighted(mix,this.rng()),spec=HAZARD_SPECS[kind],reserve=kind==='tractor'?620:0,
    candidate={type:kind,lane,z,length:0,reserve,done:false,collectible:false};
   if(this.laneBusy(lane,z-150,z+200+reserve,90))continue;
   const hazards=this.items.filter(e=>!e.collectible&&!e.done);
   if(!reachableCorridor([...hazards,candidate],z-500,z+650,this.seed))continue;
   const props={length:0,road:ROAD_TYPES.includes(kind),warning:430};
   if(kind==='tractor'){props.drift=95;props.reserve=reserve;}
   if(kind==='cow'||kind==='geese')props.honkable=true;
   placed.push(this.add(kind,z+(placed.length?(this.rng()-.5)*70:0),lane,props));
  }
  const taken=new Set(placed.map(e=>e.lane)),safe=corridor.filter(l=>!taken.has(l));
  if(safe.length){let l=safe[Math.floor(this.rng()*safe.length)];
   // Reward is beside, never inside, the collision footprint. The next row is kept beyond a trailer-length recovery window.
   for(let k=0;k<3;k++){const at=z-90+k*145;l=nearestLane(at,l,this.seed);if(!this.laneBusy(l,at,at,95))this.add(k===1&&this.rng()<.24?'taco':'coin',at,l);}
  }
  return 150;
 }
 spawnEncounter(z){
  const r=roadAt(z,this.seed);if(!['farm-fork','estate-fork','contraflow'].includes(r.motif)||r.gate<.96)return false;
  const branch=r.bands.find(b=>b.branch===r.restricted),lane=branch.branch==='left'?1:3,legal=lane===1?3:1;
  if(this.laneBusy(lane,z-250,z+700,160))return false;
  if(r.motif==='contraflow'){
   // The car never crosses into another route: it follows a fixed lane only
   // through this signed branch, and despawns before the junction merges.
   const stopZ=r.start+1050,spawnZ=Math.min(r.end-650,z+380);
   if(spawnZ<=stopZ+180)return false;
   this.add('car',spawnZ,lane,{oncoming:true,traffic:true,stopZ,speed:150,length:0});
   this.add('prize',z-130,legal,{});
  }else if(!this.laneBusy(legal,z-100,z+100,100))this.add('prize',z,legal,{});
  this.lastScenario=r.motif;return true;
 }
 /* A clear lane for a pickup near z: the closest legal lane with no hazard footprint on it. null = try again next frame. */
 freeLane(z,pref=2){const lanes=routeLanes(z,this.seed,{legal:true}).sort((a,b)=>Math.abs(a-pref)-Math.abs(b-pref));return lanes.find(l=>!this.laneBusy(l,z-170,z+170,100))??null;}
 /* One funny encounter, taken from the shuffled bag. Honkable ones can be shooed; cow, ice-cream van and bin lorry end the shift if you hit them. */
 spawnFunny(z){
  if(!this.funnyBag.length){const a=FUNNY.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(this.rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}this.funnyBag=a;}
  const kind=this.funnyBag[0],spec=HAZARD_SPECS[kind],reserve=kind==='tractor'||kind==='caravan'?650:0;
  const corridor=laneCorridor(z-100,z+260,this.seed,true);if(corridor.length<3)return false;
  const order=corridor.slice();for(let i=order.length-1;i>0;i--){const j=Math.floor(this.rng()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  for(const lane of order){
   if(this.laneBusy(lane,z-220,z+260+reserve,100))continue;
   const cand={type:kind,lane,z,length:0,reserve,done:false,collectible:false};
   if(!reachableCorridor([...this.items.filter(e=>!e.collectible&&!e.done),cand],z-500,z+650,this.seed))continue;
   const props={length:0,warning:430};if(kind==='tractor'||kind==='caravan'){props.drift=kind==='caravan'?85:95;props.reserve=reserve;}if(['cow','geese','morris','cyclists'].includes(kind))props.honkable=true;
   this.add(kind,z,lane,props);this.funnyBag.shift();return true;}
  return false;
 }
 spawn(){const busy=this.job||this.sheep||this.night,pending=this.items.some(e=>['job','night'].includes(e.type)&&!e.done);
  if(!busy&&!pending){if(this.distance>this.nextNight-1100){const l=this.freeLane(this.distance+700,2);if(l!==null){this.add('night',this.distance+700,l);this.nextNight=this.distance+6500;}}else if(this.distance>this.nextJob-1100){const z=Math.max(this.nextJob,this.distance+700),l=this.freeLane(z,2);if(l!==null){this.add('job',z,l,{double:this.jobs>0&&this.rng()>.5});this.nextJob+=3300;}}}
  if(!busy&&this.distance>this.nextBoost-700){const l=this.freeLane(this.distance+550,Math.floor(this.rng()*5));if(l!==null){this.add('boost',this.distance+550,l);this.nextBoost=this.distance+3300;}}
  if(!busy&&!this.shield&&this.distance>this.nextShield-700&&!this.items.some(e=>e.type==='shield'&&!e.done)){const z=this.distance+620,l=nearestLane(z,Math.floor(this.rng()*5),this.seed);if(!this.laneBusy(l,z-100,z+100,100)){this.add('shield',z,l);this.nextShield=this.distance+6200+this.rng()*2500;}}
  if(!this.hasTrailer&&this.nextHitch&&this.distance>this.nextHitch-700&&!this.items.some(e=>e.type==='hitch'&&!e.done)){const z=this.distance+650,lane=nearestLane(z,this.lane,this.seed);if(!this.laneBusy(lane,z-100,z+100,100)){this.add('hitch',z,lane);this.nextHitch=z+1500;}}
  if(!this.sheep&&!this.night&&this.distance>this.nextFunny-1300){const z=Math.max(this.nextFunny,this.distance+900);if(this.spawnFunny(z))this.nextFunny=z+1250+this.rng()*750-this.ramp()*300;else this.nextFunny=this.distance+200;}
  while(this.row<this.distance+1300){
   const r=this.ramp(),gapSec=Math.max(.5,.9-.38*r);
   const nearJob=this.items.some(e=>['job','night'].includes(e.type)&&!e.done&&Math.abs(e.z-this.row)<520);
   if(this.sheep||nearJob){this.row+=this.cruise*(gapSec+this.rng()*.4);continue;}
   if(this.spawnEncounter(this.row)){this.row+=600+this.cruise*(.9+this.rng()*.5);continue;}
   this.row+=this.makeRow(this.row,gapSec)+this.cruise*(gapSec+this.rng()*.4);}
  if(this.distance>this.nextSheep-850&&!busy&&!this.items.some(e=>e.type==='night'&&!e.done)){this.sheep={z:this.distance+850,baa:false,baaAt:Infinity,cleared:false};this.emit('sheepWarning');for(const e of this.items)if(e.type==='job'&&!e.done&&e.z>this.distance)e.z=this.sheep.z+900;this.items=this.items.filter(e=>e.type==='job'||e.z+(e.length||0)<this.sheep.z-450||e.z>this.sheep.z+400);this.nextSheep=this.distance+5200;}
 }
 /* 0 at the depot gate -> 1 after ~7 miles: hazards bunch up and the rig gets quicker so long shifts end on skill, not boredom */
 ramp(){return clamp(this.distance/48000,0,1);}
 tick(dt){if(this.finished)return;dt=clamp(dt,0,.05);this.time+=dt;for(const d of this.leaving)d.age+=dt;this.leaving=this.leaving.filter(d=>d.age<1.4);
  for(const k of ['invulnerable','slow','boost','rested','grip','dropCooldown'])this[k]=Math.max(0,this[k]-dt);
  const base=250+Math.min(80,this.time*.8)+95*this.ramp();this.cruise=base;this.speed=Math.min(560,base*(this.slow>0?.65:this.boost>0?1.3:1)*(this.hasTrailer?1:1.38)*(this.grip>0?.92:1));const oldDistance=this.distance,oldX=this.x;this.distance+=this.speed*dt;this.stage=biomeAt(this.distance);
  this.rapid=Math.max(0,this.rapid-dt*(this.job?.double?.19:.43)*(1+.2*this.upgrades.stability)*(this.rested>0?1.2:1));
  this.x+=(this.lane-this.x)*(1-Math.exp(-dt*(this.grip>0?6.2:11)*(this.hasTrailer?1:1.3)*(1+.12*this.upgrades.steering)));
  this.trailer+=(this.x-this.trailer)*(1-Math.exp(-dt*(this.job?.double?2.2:4)));
  this.rear+=(this.trailer-this.rear)*(1-Math.exp(-dt*1.7));
  this.angle=clamp((this.x-this.trailer)*.62*(1-.08*this.upgrades.suspension),-.85,.85);
  this.sway=this.hasTrailer?clamp(Math.abs(this.x-this.trailer)*.3+this.rapid*(this.job?.double?.72:.32)+(this.grip>0?.12:0),0,1):0;
  if(this.sway>.98&&this.job?.double){this.fine(260,'JACKKNIFE! Double trouble.');this.emit('jackknife');this.items=this.items.filter(e=>!['crumb','finish'].includes(e.type));this.job=null;this.multiplier=1;this.rapid=0;}
  if(this.night&&this.distance>this.night.end){this.night=null;this.emit('dawn');}this.spawn();
  if(this.sheep){const s=this.sheep,ahead=s.z-this.distance;if(ahead<Math.max(375,this.speed*1.5)&&!s.baa){s.baa=true;s.baaAt=this.time;this.emit('baa');}if(ahead<65&&!s.cleared){this.sheepFail=1;this.crashKind='sheep';this.emit('sheepFail');this.end(CRASHES.sheep);}if(ahead< -200&&s.cleared)this.sheep=null;}
  // Contraflow traffic approaches against the scrolling road; same collision rules as cars.
  for(const e of this.items)if(!e.done&&e.drift)e.z+=e.drift*dt;
  for(const e of this.items)if(!e.done&&e.oncoming){e.previousZ=e.z;e.z-=(e.speed||this.speed*.55)*dt;if(e.stopZ&&e.z<e.stopZ)e.done=true;}
  const pose=rigPose(laneX(this.x,this.distance),0,clamp((this.lane-this.x)*.16,-.2,.2),this.angle,clamp((this.trailer-this.rear)*.55,-.8,.8));
  // Wheel contact uses the same bands as the rendered asphalt; leaving the
  // road has a short grace interval, so merely brushing a painted edge is fair.
  const contact=surfaceAt(laneX(this.x,this.distance),this.distance,this.seed,16);this.surface=contact.surface;
  const trailerContact=this.hasTrailer?surfaceAt(pose.trailer.x,this.distance-pose.trailer.y,this.seed,15):contact;
  if(contact.surface==='mud'||trailerContact.surface==='mud'){if(this.grip<.1)this.emit('mud');this.grip=4.8;}
  if(!contact.onRoad||!trailerContact.onRoad){this.offroad+=dt;if(this.offroad>.55){this.fine(35,'Keep it on the road.');if([1,3].includes(this.stage))this.grip=Math.max(this.grip,2.5);this.offroad=-1.7;}}else this.offroad=Math.max(0,this.offroad-dt*2);
  if(contact.rule&&!this.routeFines[contact.route.id]){this.routeFines[contact.route.id]=true;this.fine(contact.rule==='oneway'?120:90,contact.rule==='oneway'?'One way. The other way.':'Residents and public access only.');}
  if(contact.route.gate>.97&&!this.routeChoice[contact.route.id]){this.routeChoice[contact.route.id]=contact.branch;this.emit('routeChoice',{branch:contact.branch,motif:contact.route.motif});}
  for(const key of Object.keys(this.routeFines))if(+key<contact.route.id-2)delete this.routeFines[key];
  for(const key of Object.keys(this.routeChoice))if(+key<contact.route.id-2)delete this.routeChoice[key];
  for(const d of this.detached)d.age+=dt;this.detached=this.detached.filter(d=>d.age<3);
  // Buildings and foliage are actual scenery collisions, using the very same
  // placements and authored footprints as the painter. They sit off-road.
  for(const p of sceneryProps(this.distance-240,this.distance+100,this.seed)){
   if(this.sceneryHits[p.id]||this.invulnerable>0)continue;
   const hit=(x,z,hw,hh)=>Math.abs(x-p.x)<hw+p.hitWidth/2&&Math.abs(z-p.z)<hh+p.hitHeight/2;
   if(hit(laneX(this.x,this.distance),this.distance,RIG.cabHX,RIG.cabHZ)||(this.hasTrailer&&hit(pose.trailer.x,this.distance-pose.trailer.y,RIG.trHX,RIG.trHZ))){this.sceneryHits[p.id]=p.z;if(p.effect==='house'){this.lastHit={type:'house',x:p.x,z:p.z};this.crash('house');}else this.fine(55,'Scenery is not a shortcut.');}
  }
  for(const key of Object.keys(this.sceneryHits))if(this.sceneryHits[key]<this.distance-400)delete this.sceneryHits[key];
  for(const e of this.items){if(e.done)continue;const delta=e.z-this.distance,length=e.length||0,hazard=!PICKUPS.includes(e.type),spec=HAZARD_SPECS[e.type];
   const halfX=hazard?(spec?.hitWidth||40)/2:18,halfZ=hazard?(spec?.hitHeight||40)/2:18;
   const ex=laneX(e.lane,e.z),cabX=laneX(this.x,this.distance),oldCabX=laneX(oldX,oldDistance);
   const cabHit=sweptOverlap(oldDistance,this.distance,RIG.cabHZ,e.z-halfZ,e.z+length+halfZ)&&sweptOverlap(oldCabX,cabX,hazard?RIG.cabHX:15,ex-halfX,ex+halfX);
   const trailHit=hazard&&this.hasTrailer&&Math.abs(ex-pose.trailer.x)<halfX+RIG.trHX&&delta< -pose.trailer.y+RIG.trHZ+halfZ&&delta+length> -pose.trailer.y-RIG.trHZ-halfZ;
   const rearHit=hazard&&this.hasTrailer&&this.job?.double&&Math.abs(ex-pose.rear.x)<halfX+RIG.trHX&&delta< -pose.rear.y+RIG.trHZ+halfZ&&delta+length> -pose.rear.y-RIG.trHZ-halfZ;
   if((cabHit||trailHit||rearHit)&&(!hazard||this.invulnerable<=0))this.collect(e);
   else if(delta+length<(hazard?-240:-42)){e.done=true;if(e.type==='finish'&&this.job){this.emit('missedJob');this.job=null;this.multiplier=1;}else if(e.type==='crumb')this.combo=0;}
   if(this.finished)break;
  }
  this.items=this.items.filter(e=>e.z+(e.length||0)>this.distance-325);
  if(this.mode==='daily'&&this.time>=120)this.end('Two minutes. One mighty shift.');
 }
}

module.exports={clamp,themes,ROAD_TYPES,CRASHES,PICKUPS,MIX,FUNNY,seeded,jobPath,biomeAt,hazardKinds,Drive};

},
"./audio.js":function(module,exports,require){
class Sound {
 constructor(settings){this.settings=settings;this.ctx=null;this.buffers={};this.active=[];this.ready=false;this.loading=null;this.music=null;this.musicOffset=0;this.musicStarted=0;this.suspended=false;this.menuWanted=false;this.menu=null;this.revSrc=null;this.timers=[];}
 init(){if(this.ctx)return;this.ctx=new (window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=.8;const comp=this.ctx.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=3;this.master.connect(comp);comp.connect(this.ctx.destination);this.musicGain=this.ctx.createGain();this.musicGain.connect(this.master);}
 /* Create the context and decode everything before the first tap, so the ignition fires the instant the player taps. */
 preload(){try{this.init();if(!this.loading)this.loading=this.load();}catch{}return this.loading;}
 /* iOS treats Web Audio as "ambient" and mutes it when the silent switch is on. Declaring a playback session (Safari 16.4+) and running a silent <audio> element (older iOS) makes it behave like a media app. Must run inside a tap. */
 bypassMute(){try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch{}try{if(!this.keepAlive){const a=document.createElement('audio');a.setAttribute('playsinline','');a.setAttribute('x-webkit-airplay','deny');a.loop=true;a.preload='auto';a.src='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';this.keepAlive=a;}this.keepAlive.play()?.catch(()=>{});}catch{}}
 async unlock(){try{this.bypassMute();this.init();const resumed=this.ctx.resume();if(!this.loading)this.loading=this.load();await resumed;await this.loading;return true;}catch{return false;}}
 async load(){await Promise.all(['roadtrip','menumusic','ignition','idle','rev','cash','crumb','pickup','delivery','horn','sheep','flush','brake','click','scatter','bonus','jweds-jingle'].map(async name=>{try{let bytes;if(window.TRUCKIN_AUDIO_DATA?.[name]){let b=atob(window.TRUCKIN_AUDIO_DATA[name]);bytes=Uint8Array.from(b,c=>c.charCodeAt(0)).buffer;}else{let r=await fetch('./audio/'+name+(['roadtrip','menumusic','jweds-jingle'].includes(name)?'.mp3':'.wav'));if(!r.ok)return;bytes=await r.arrayBuffer();}this.buffers[name]=await this.ctx.decodeAudioData(bytes);}catch{}}));this.ready=true;}
 play(name,volume=1){if(!this.ctx||!this.buffers[name]||this.settings.sfx<=0||this.suspended)return;let gains={ignition:.55,rev:.42,'jweds-jingle':.7,cash:.45,crumb:.16,pickup:.48,delivery:.48,horn:.4,sheep:.60,flush:.46,brake:.52,click:.28,scatter:.45,bonus:.4};const s=this.ctx.createBufferSource();s.buffer=this.buffers[name];const g=this.ctx.createGain();g.gain.value=(gains[name]||.4)*this.settings.sfx*volume;s.connect(g);g.connect(this.master);s.start();this.active.push(s);s.onended=()=>{this.active=this.active.filter(x=>x!==s);s.disconnect();g.disconnect();};}
 duck(){if(!this.musicGain||!this.ctx)return;const t=this.ctx.currentTime;this.musicGain.gain.cancelScheduledValues(t);this.musicGain.gain.setValueAtTime(this.settings.music*.07,t);this.musicGain.gain.setTargetAtTime(this.settings.music*.26,t+.9,.15);}
 musicOn(){if(this.music||!this.ctx||!this.buffers.roadtrip||this.suspended)return;this.music=this.ctx.createBufferSource();this.music.buffer=this.buffers.roadtrip;this.music.loop=true;this.music.loopEnd=32;this.music.connect(this.musicGain);this.musicGain.gain.value=this.settings.music*.26;this.musicStarted=this.ctx.currentTime;this.music.start(0,this.musicOffset%32);}
 musicOff(){if(this.music){this.musicOffset+=(this.ctx.currentTime-this.musicStarted);this.music.stop();this.music.disconnect();this.music=null;}}
 update(){if(this.musicGain)this.musicGain.gain.setTargetAtTime(this.settings.music*.26,this.ctx.currentTime,.1);if(this.menu?.music)this.menu.music.g.gain.setTargetAtTime(this.settings.music*.27,this.ctx.currentTime,.1);}

 /* ---- depot / menu: ignition -> idle ticking + lounge music, rev on every swipe, soft honk on select ---- */
 _ramp(g,to,secs){const t=this.ctx.currentTime;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(to,t+secs);}
 _loop(name,gain,to,fade,offset=0){const src=this.ctx.createBufferSource();src.buffer=this.buffers[name];src.loop=true;const g=this.ctx.createGain();g.gain.value=0;src.connect(g);g.connect(this.master);src.start(0,offset);this._ramp(g,to,fade);return {src,g};}
 menuOn(ignite=false){if(!this.ctx||this.suspended)return;this.menuWanted=true;if(this.menu)return;const m=this.menu={music:null,idle:null};
  const musicLevel=this.settings.music*.27,idleLevel=this.settings.sfx*.16;
  const start=()=>{if(this.menu!==m||!this.buffers.menumusic)return;m.music=this._loop('menumusic',0,musicLevel,ignite?3:1.4);m.idle=this.buffers.idle?this._loop('idle',0,idleLevel,.5):null;};
  if(ignite&&this.buffers.ignition&&this.settings.sfx>0){this.play('ignition');this.timers.push(setTimeout(start,1500));}else start();}
 menuOff(fade=.7){this.menuWanted=false;this.timers.forEach(clearTimeout);this.timers=[];const m=this.menu;this.menu=null;if(!m||!this.ctx)return;
  for(const k of ['music','idle'])if(m[k]){this._ramp(m[k].g,0,fade);const {src,g}=m[k];setTimeout(()=>{try{src.stop();}catch{}src.disconnect();g.disconnect();},fade*1000+80);}}
 rev(dir=1){if(!this.ctx||!this.buffers.rev||this.settings.sfx<=0||this.suspended)return;
  if(this.revSrc){const {s,g}=this.revSrc;this._ramp(g,0,.09);setTimeout(()=>{try{s.stop();}catch{}},120);}
  const s=this.ctx.createBufferSource();s.buffer=this.buffers.rev;s.playbackRate.value=.94+Math.random()*.14+(dir>0?.02:-.02);const g=this.ctx.createGain();g.gain.value=.4*this.settings.sfx;s.connect(g);g.connect(this.master);s.start();this.revSrc={s,g};s.onended=()=>{if(this.revSrc?.s===s)this.revSrc=null;s.disconnect();g.disconnect();};}
 honk(){this.play('horn',.6);}
 gameStop(){this.musicOff();this.active.forEach(s=>{try{s.stop();}catch{}});this.active=[];}
 pause(){const wanted=this.menuWanted;this.menuOff(.01);this.menuWanted=wanted;this.musicOff();this.active.forEach(s=>{try{s.stop();}catch{}});this.active=[];this.suspended=true;}
 resume(){this.suspended=false;this.ctx?.resume();if(this.menuWanted)this.menuOn(false);else this.musicOn();}
}

module.exports={Sound};

},
"./render.js":function(module,exports,require){
const {RoutePainter}=require("./route-render.js");
const {drawRig,drawTrailerOnly}=require("./rigart.js");
const {HAZARD_SPECS}=require("./route-hazards.js");
const {clamp,ROAD_TYPES,PICKUPS}=require("./model.js");
const {rigPose,roadShape,roadCurve,laneX,roadTheme,RIG}=require("./geometry.js");
const {SPRITE_RECTS,HAZARD_RECTS,TERRAIN_RECTS,EXTRAS_RECTS}=require("./atlas.js");
const SPR={truck:0,trailer:1,orange:2,purple:3,car:4,redcar:5,cone:6,barrier:7,taco:8,job:9,finish:10,coin:11,sheep:12,face:13,flatbed:14,oil:15,crumb:11};
const HAZ={lowbridge:0,weakbridge:1,bus:2,noentry:3,narrow:4,sheepWarning:5,house:6,grass:7};
const LABELS={lowbridge:'LOW BRIDGE',weakbridge:'WEAK BRIDGE',bus:'BUS LANE',noentry:'NO ENTRY',house:'MIND THE HOUSE',grass:'KEEP OFF',narrow:'NARROW PASS'};
class Renderer {
 constructor(canvas,images,settings,opts={}){this.opts=opts;this.pad=0;this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.images=images;this.settings=settings;this.W=420;this.H=800;this.fx=[];this.shake=0;this.time=0;this.resize();this.world=new RoutePainter(this);}
 /* The road column is always 420 world units wide and at least 747 tall (iPhone SE proportions). A taller phone just shows more road.
    A wider screen (iPad) or the "tall phone preview" shrinks the world to fit and the spare width becomes side scenery (this.pad on each side). */
 resize(){const r=this.canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
  let k,pad=0;
  if(this.opts.fixedWidth){k=r.width/420;this.H=420*r.height/r.width;}
  else{const hreq=this.settings.tall?909:747;k=Math.min(r.width/420,r.height/hreq);const Wc=r.width/k;pad=Math.max(0,(Wc-420)/2);this.H=r.height/k;}
  this.k=k;this.pad=pad;this.cssCol=420*k;this.actualTall=420*r.height/r.width>=830;
  this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);this.scale=k*dpr;
  this.ctx.setTransform(this.scale,0,0,this.scale,this.scale*pad,0);this.ctx.imageSmoothingEnabled=true;
  this.playerY=this.opts.fixedWidth?this.H*.66:493+Math.max(0,this.H-747)*.36;this.worldScale=.72;}
 shape(z){return roadShape(z);}
 curve(z){return roadCurve(z);}
 x(lane,z){return laneX(lane,z);}
 sprite(id,x,y,w,h=w,angle=0,alpha=1,sheet='sprites'){const img=this.images[sheet];if(!img)return;let cols=4,rows=sheet==='extras'?3:sheet==='terrain'||sheet==='restrictions'?2:4;let cw=img.width/cols,ch=img.height/rows;const c=this.ctx;c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(angle);const rect=(sheet==='extras'?EXTRAS_RECTS:sheet==='terrain'?TERRAIN_RECTS:sheet==='restrictions'?HAZARD_RECTS:SPRITE_RECTS)[id]||[(id%4)*cw,Math.floor(id/4)*ch,cw,ch];c.drawImage(img,...rect,-w/2,-h/2,w,h);c.restore();}
 label(text,x,y,color='#fff5cd',size=10){const c=this.ctx;c.save();c.textAlign='center';c.font='900 '+size+'px -apple-system, sans-serif';c.lineWidth=4;c.strokeStyle='#173235';c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y);c.restore();}
 effect(kind,x,y,text){for(let i=0;i<(this.settings.motion?9:3);i++)this.fx.push({kind,x,y,life:.7+Math.random()*.5,age:0,vx:(Math.random()-.5)*140,vy:-40-Math.random()*110,rot:Math.random()*6});if(text)this.fx.push({kind:'text',x,y:y-20,life:1,age:0,vy:-42,vx:0,text});}
 road(g){this.world.road(g);}
 /* The painted road only has one centre dash, but steering is five-position. Draw the five lanes: soft dashed dividers that scroll and curve with the road,
    plus a faint glow in the lane the truck is heading for. Hazards, pickups and breadcrumbs all share these lane centres. */
 laneGuides(g){const c=this.ctx;c.save();c.fillStyle='#9dffe117';c.fillRect(this.x(g.lane,g.distance)-31,120,62,this.playerY-120);c.restore();}
 terrain(g){this.world.hazards(g);}
 rig(g,truckIndex,px,py,alpha){drawRig(this,{truck:g.truck,decal:g.decal,trailerPaint:g.trailerPaint,trailerDecal:g.trailerDecal,upgrades:g.upgrades,lane:g.lane,x:g.x,angle:g.angle,trailer:g.trailer,rear:g.rear,hasTrailer:g.hasTrailer!==false,job:g.job,grip:g.grip,boost:g.boost,shield:g.shield,hornAge:g.time-(g.hornAt??-10)},px,py,alpha,1,this.worldScale||.72,this.time);}
 nightLight(g){if(!g.night)return;const c=this.ctx,px=this.x(g.x,g.distance),reach=230+(g.upgrades.lights||0)*65;
  const full=Math.ceil(420+2*this.pad);if(!this.dark)this.dark=document.createElement('canvas');
  if(this.dark.width!==full)this.dark.width=full;if(this.dark.height!==Math.ceil(this.H))this.dark.height=Math.ceil(this.H);
  const m=this.dark.getContext('2d');m.clearRect(0,0,full,this.H);m.fillStyle='rgba(5,12,33,.78)';m.fillRect(0,0,full,this.H);
  m.save();m.translate(this.pad,0);m.globalCompositeOperation='destination-out';
  for(const dir of [-1,1]){m.save();m.translate(px+dir*15,this.playerY-36-reach*.37);m.scale(.45,1);
   const gr=m.createRadialGradient(0,0,10,0,0,reach*.70);gr.addColorStop(0,'rgba(0,0,0,.98)');gr.addColorStop(.60,'rgba(0,0,0,.81)');gr.addColorStop(1,'rgba(0,0,0,0)');
   m.fillStyle=gr;m.beginPath();m.arc(0,0,reach*.70,0,Math.PI*2);m.fill();m.restore();}
  m.globalCompositeOperation='source-over';m.restore();c.drawImage(this.dark,-this.pad,0,full,this.H);
 }
 draw(g,dt,truckIndex){const c=this.ctx;this.time+=dt;c.save();if(this.shake>0&&this.settings.motion){c.translate((Math.random()-.5)*this.shake,(Math.random()-.5)*this.shake);this.shake*=Math.exp(-dt*12);}this.road(g);if(this.settings.guides===true)this.laneGuides(g);this.terrain(g);
 for(const e of g.items){if(e.done||HAZARD_SPECS[e.type])continue;const y=this.playerY-(e.z-g.distance)*this.worldScale,x=this.x(e.lane,e.z);if(y< -100||y>this.H+100)continue;const collectible=PICKUPS.includes(e.type);const bob=collectible&&this.settings.motion?Math.sin(this.time*5+e.id)*5:0;let w=e.type==='crumb'?23:e.type==='coin'?31:e.type==='car'?46:e.type==='finish'?58:e.type==='job'?54:49;let h=e.type==='car'?68:w;
 if(this.world.pickup(e,x,y+bob))continue;
 if(collectible){c.save();c.shadowBlur=e.type==='crumb'?13:24;c.shadowColor=e.type==='job'?(e.double?'#d89bff':'#55ffda'):e.type==='finish'?'#55ffae':'#ffe69a';this.sprite(e.type==='night'?0:e.type==='boost'?1:SPR[e.type],x,y+bob,w,h,0,1,['night','boost'].includes(e.type)?'extras':'sprites');c.restore();if(e.type==='job')this.label(e.double?'DOUBLE ×2':'JOB',x,y-39,e.double?'#e4b9ff':'#a5ffe3',9);if(e.type==='night')this.label('NIGHT ×2',x,y-38,'#bde0ff',10);if(e.type==='boost')this.label('TURBO',x,y-38,'#ffe59a',10);if(e.type==='finish')this.label('CASH OUT',x,y-40,'#a5ffe3',9);}
 else if(HAZ[e.type]!==undefined){w=e.type.includes('bridge')?64:55;this.sprite(HAZ[e.type],x,y,w,w,0,1,'restrictions');if(LABELS[e.type])this.label(LABELS[e.type],x,y-34,'#fff2d2',7);}
 else this.sprite(SPR[e.type]??6,x,y,w,h,e.oncoming?Math.PI:0);
 }
 if(g.sheep){const s=g.sheep,y=this.playerY-(s.z-g.distance)*this.worldScale;for(let i=0;i<5;i++){let x=this.x(i,s.z),rot=Math.sin(this.time*5+i)*.12;let sy=y+Math.sin(i*3)*17;if(s.cleared){const move=Math.max(0,(g.time-s.baaAt-.3))*120;x+=(i<2?-1:1)*move;rot=i<2?-1.5:1.5;sy+=Math.sin(this.time*20+i)*5;}this.sprite(12,x,sy,50,52,rot);}}
 for(const d of g.detached||[])drawTrailerOnly(this,g.trailerPaint??1,g.trailerDecal??0,d.x,this.playerY-(d.z-g.distance)*this.worldScale,RIG.trailerW,RIG.trailerL*this.worldScale,d.angle,Math.max(0,1-d.age/3));
 const px=this.x(g.x,g.distance);let alpha=g.invulnerable>0&&Math.floor(this.time*13)%2===0?.55:1;this.nightLight(g);this.rig(g,truckIndex,px,this.playerY,alpha);
 for(const f of this.fx){f.age+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.kind!=='text')f.vy+=190*dt;let a=clamp(1-f.age/f.life,0,1);if(f.kind==='text'){c.save();c.globalAlpha=a;this.label(f.text,f.x,f.y,'#fff0ad',17);c.restore();}else this.sprite(f.kind==='loss'?11:11,f.x,f.y,13,13,f.rot+f.age*7,a);}
 this.fx=this.fx.filter(f=>f.age<f.life);
 if(this.highlight){const h=this.highlight,t=this.time-h.t0,pulse=1+Math.sin(t*9)*.08,x=h.x,y=h.y;
  if(h.item)this.world.hazards({items:[{...h.item,done:false}],distance:g.distance,leaving:[]});   // the thing you hit, drawn on top so it's plainly visible
  c.save();c.strokeStyle='#ff4b3a';c.lineWidth=4;c.shadowColor='#ff4b3a';c.shadowBlur=14;c.beginPath();c.ellipse(x,y,h.rx*pulse,h.ry*pulse,0,0,Math.PI*2);c.stroke();c.shadowBlur=0;
  c.font='900 15px -apple-system,sans-serif';c.textAlign='center';const w=c.measureText(h.label).width+26,ly=Math.max(30,y-h.ry-30);c.fillStyle='#1c0b0b';c.strokeStyle='#ff4b3a';c.lineWidth=2.5;c.beginPath();c.roundRect(Math.min(420-w/2-8,Math.max(w/2+8,x))-w/2,ly-17,w,28,9);c.fill();c.stroke();c.fillStyle='#fff3e0';c.fillText(h.label,Math.min(420-w/2-8,Math.max(w/2+8,x)),ly+3);c.restore();}
 c.restore();}
}
async function loadImages(){const names=['sprites','roads','restrictions','cover','terrain','extras'];const extra={routeSurfaces:'surfaces',routeProps:'props',routeTrucks:'trucks',routeShowroom:'showroom',routeScenery:'scenery'};let result={};await Promise.all([...names,...Object.keys(extra)].map(n=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>{result[n]=i;res();};i.onerror=()=>rej(new Error(n));i.src=(window.TRUCKIN_IMAGE_DATA&&window.TRUCKIN_IMAGE_DATA[n])||('./assets/'+(extra[n]?'route-v2/'+extra[n]:n)+'.webp');})));return result;}

module.exports={SPR,Renderer,loadImages};

},
"./wheel.js":function(module,exports,require){
/* Infinite swipe wheel: the focused item sits proud in the middle, neighbours shrink away either side and the
   list wraps round forever. Used by the home menu and the garage. No dependencies.
   opts: items[], render(item,i)->html, spacing(width)->px, scales[], onStep(index,dir), onSelect(index), onSettle(index) */
class Wheel {
 constructor(el,opts){
  this.el=el;this.opts=opts;this.items=opts.items;this.scales=opts.scales||[1,.58,.4,.3];
  this.pos=opts.start||0;this.target=this.pos;this.last=Math.round(this.pos);this.drag=null;this.raf=0;this.t0=0;this.enabled=true;
  this.build();
  el.addEventListener('pointerdown',e=>this.down(e));
  el.addEventListener('pointermove',e=>this.move(e));
  el.addEventListener('pointerup',e=>this.up(e));
  el.addEventListener('pointercancel',e=>this.up(e,true));
  el.addEventListener('wheel',e=>{if(!this.enabled)return;const d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(Math.abs(d)<12)return;e.preventDefault();if(performance.now()-this.t0>180){this.t0=performance.now();this.step(d>0?1:-1);}},{passive:false});
  this.layout();
 }
 get n(){return this.items.length;}
 get index(){return ((Math.round(this.pos)%this.n)+this.n)%this.n;}
 build(){this.el.innerHTML='';this.nodes=this.items.map((it,i)=>{const d=document.createElement('div');d.className='wheel-item';d.dataset.i=i;d.innerHTML=this.opts.render(it,i);this.el.appendChild(d);return d;});}
 setItems(items,keep=true){const at=keep?this.index:0;this.items=items;this.build();this.pos=this.target=at;this.last=at;this.layout();}
 refresh(){this.nodes.forEach((d,i)=>{d.innerHTML=this.opts.render(this.items[i],i);});this.layout();}
 spacing(){return this.opts.spacing?this.opts.spacing(this.el.clientWidth):this.el.clientWidth*.37;}
 layout(){
  const S=this.spacing(),n=this.n,focus=Math.round(this.pos);
  this.nodes.forEach((node,i)=>{
   let d=((i-this.pos)%n+n)%n;if(d>n/2)d-=n;const a=Math.abs(d);
   const x=Math.sign(d)*(a<=1?a*S:S+(a-1)*S*.6);
   const sc=this.scales,s=a<1?sc[0]+(sc[1]-sc[0])*a:a<2?sc[1]+(sc[2]-sc[1])*(a-1):a<3?sc[2]+(sc[3]-sc[2])*(a-2):sc[3];
   const f=Math.max(0,1-a*1.25);
   node.style.transform='translate3d(calc(-50% + '+x.toFixed(1)+'px),0,0) scale('+s.toFixed(3)+')';
   node.style.opacity=a>2.6?0:String(Math.max(0,1-a*.2));
   node.style.zIndex=String(100-Math.round(a*10));
   node.style.setProperty('--f',f.toFixed(3));
   node.classList.toggle('focus',((focus%n)+n)%n===i);
   node.style.pointerEvents=a>2.2?'none':'auto';
  });
 }
 tick(now){
  const dt=Math.min(.05,(now-this.lastT)/1000||.016);this.lastT=now;
  if(!this.drag){this.pos+=(this.target-this.pos)*(1-Math.exp(-dt*11));if(Math.abs(this.target-this.pos)<.002){this.pos=this.target;}}
  this.emitStep();this.layout();
  if(this.drag||this.pos!==this.target)this.raf=requestAnimationFrame(t=>this.tick(t));
  else{this.raf=0;this.opts.onSettle?.(this.index);}
 }
 kick(){if(!this.raf){this.lastT=performance.now();this.raf=requestAnimationFrame(t=>this.tick(t));}}
 emitStep(){const r=Math.round(this.pos);if(r!==this.last){const dir=r>this.last?1:-1;this.last=r;this.opts.onStep?.(this.index,dir);}}
 step(dir){if(!this.enabled)return;this.target=Math.round(this.target)+dir;this.kick();}
 goTo(i){const n=this.n;let d=((i-this.index)%n+n)%n;if(d>n/2)d-=n;this.target=Math.round(this.target)+d;this.kick();}
 select(){this.opts.onSelect?.(this.index);}
 down(e){if(!this.enabled)return;this.drag={id:e.pointerId,x:e.clientX,start:this.pos,moved:false,at:performance.now(),lx:e.clientX,lt:performance.now(),v:0,target:e.target};this.el.setPointerCapture?.(e.pointerId);this.kick();}
 move(e){const d=this.drag;if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.x;if(Math.abs(dx)>8)d.moved=true;
  if(d.moved){this.pos=d.start-dx/this.spacing();this.target=this.pos;const now=performance.now(),dtm=Math.max(1,now-d.lt);d.v=(e.clientX-d.lx)/dtm;d.lx=e.clientX;d.lt=now;}}
 up(e,cancel){const d=this.drag;if(!d||d.id!==e.pointerId)return;this.drag=null;
  if(!d.moved&&!cancel&&performance.now()-d.at<350){const node=d.target?.closest?.('.wheel-item');if(node){const i=Number(node.dataset.i);if(i===this.index)this.select();else this.goTo(i);}return this.kick();}
  const flick=-d.v/this.spacing()*90;this.target=Math.round(this.pos+Math.max(-1.6,Math.min(1.6,flick)));this.kick();}
}

module.exports={Wheel};

},
"./jokes.js":function(module,exports,require){
/* Trucker's Tales: UK-flavoured lorry, road and roadside-cafe gags for the scrolling ticker on tall screens.
   Written for this game. Add a line to the array to add a joke; keep each to one breath. */
const JOKES=[
 "Why did the lorry driver get promoted? He always went the extra mile. Slowly. Behind a caravan.",
 "I told my sat-nav I wanted the scenic route. It took me through a Tesco car park.",
 "What do you call a lorry full of cheese? Gouda for nothing, driver.",
 "The M25 isn't a motorway, it's a very long car park with ambition.",
 "Why was the cone so calm? It had seen worse roadworks.",
 "A trucker walks into a lay-by and asks for a full English. The lay-by says: 'I'm a lay-by.'",
 "Never trust a roundabout. It'll make you go in circles and take the blame.",
 "I'd tell you a joke about the A303, but you'd be waiting three hours for the punchline.",
 "What's a lorry's favourite biscuit? A Rich Tea. Because of all the tea breaks.",
 "My trailer and I have an understanding: I steer, it overtakes me on the bends.",
 "Why don't lorries play hide and seek? Because nobody can ever lose a 44-tonner.",
 "How does a trucker take their tea? Strong enough to hold the spoon up and the lorry steady.",
 "Height limit 14'6\". Driver's ambition: 15'. Bridge's opinion: BONK.",
 "What do you call a driver who never gets lost? Someone who hasn't tried the Hemel Hempstead magic roundabout.",
 "The sheep weren't crossing the road to get to the other side. They'd heard you were coming and wanted to see.",
 "Why did the bacon butty cross the road? It was on its way to the cab. It never makes it to the end of the shift.",
 "Roadworks: because nothing says 'welcome back' like a three-mile contraflow with nobody working.",
 "What's the difference between a lorry and a pub quiz? One has a trailer, the other has a tie-break.",
 "I asked the traffic cone for directions. It just stood there looking orange.",
 "A pothole is just a speed bump that's been digging in.",
 "The motorway services sandwich was so dry the driver asked for a side of rain.",
 "Always check your mirrors. Especially the one telling you the trailer's gone for a walk.",
 "How do you stop a lorry on a hill? You say 'Mind the sheep' in a very firm voice.",
 "Why don't lorries ever get lonely? They've always got a cab, a chat and a Greggs.",
 "Which part of the lorry gossips the most? The CB. It's always on channel nine… ish.",
 "What do you call a lorry in a hurry? A speed-bump with delusions.",
 "My lorry's air horn is so loud the Highways Agency sent a thank-you card. And a bill.",
 "Why did the driver quit the diet? He spotted a roadside burger van marked 'LAST ONE FOR 40 MILES'.",
 "On the A1, 'overtaking' is a sport. 'Pulling in' is a fairy tale.",
 "Is a double trailer a job? Only if you can see where you're going. Otherwise it's a hobby.",
 "A good lorry driver has three rules: coffee, patience and never reversing in Waitrose.",
 "Where do lorries go for a holiday? Weigh-bridge-on-sea.",
 "Detour signs: the roadside version of 'it's not you, it's me'.",
 "What's the best way to travel through a village? Slowly, politely and with your mirrors tucked in.",
 "Why did the sat-nav get embarrassed? It said 'turn left' and the driver took it literally. Into a hedge.",
 "How many drivers does it take to change a tyre? Just one, but twelve to stand around and say 'you need a bigger jack'.",
 "The only thing slower than a tractor on a country lane is the cyclist ahead of it.",
 "What do you call a lorry that tells jokes? A pun-ishing load.",
 "Weight limit 7.5 tonnes. Your lorry: 'That's cute.'",
 "Never argue with a cattle grid. It always has the last bar.",
 "I stopped at a lay-by for forty winks. Woke up at a different postcode.",
 "Brake early, brake gently, brake into a cuppa.",
 "Knock knock. Who's there? Lorry. Lorry who? Lorry in the lounge, please sign for delivery.",
 "A cow, a tractor and a cyclist walk onto a B-road. You're stuck for forty minutes. That's not a joke, it's Tuesday.",
 "What do you call it when two lorries hold hands? A convoy of affection.",
 "Where do truckers keep their savings? In a lay-bye bank.",
 "What do you call a flock of sheep in the road? A wool-ly obstruction. Beep them politely.",
 "Where do truckers like to eat? Anywhere that has parking for 44 feet and room for a pudding."
];
function jokeOrder(seed=Date.now()){const a=JOKES.map((_,i)=>i);let s=seed|0;for(let i=a.length-1;i>0;i--){s=(Math.imul(s,1664525)+1013904223)|0;const j=((s>>>8)%(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

module.exports={JOKES,jokeOrder};

},
"./garage.js":function(module,exports,require){
const {Wheel}=require("./wheel.js");
const {CATALOG,DECALS,TRUCKS,DECAL_TAGS,STATS}=require("./upgrades.js");
const {Renderer}=require("./render.js");
const {drawRig,thumb}=require("./rigart.js");
const {RIG}=require("./geometry.js");
const LOCK="<svg class='padlock' viewBox='0 0 24 24' aria-hidden='true'><path d='M7 10V7a5 5 0 0 1 10 0v3' fill='none' stroke='currentColor' stroke-width='2.6' stroke-linecap='round'/><rect x='4.5' y='10' width='15' height='11' rx='3' fill='currentColor'/><circle cx='12' cy='15.5' r='1.7' fill='#10343a'/></svg>";
/* Garage: the preview is the real in-game view (same camera, same road, same drawing code as the game), so what you see is what you drive.
   Paints and roof graphics preview even when you can't afford them; only buying/fitting is locked. Cab and trailer are separate, and any
   style you own can be fitted to either or both. */
class Garage{
 constructor(o){Object.assign(this,o);this.tab='trucks';this.target='both';this.idx={trucks:0,trailers:0,livery:0,upgrades:0};this.pop=0;this.running=false;this.spark=[];this.sway=0;
  const q=s=>this.root.querySelector(s);this.q=q;this.canvas=q('#showroom');
  q('#garageBack').onclick=()=>this.close();
  q('#garageTabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b&&b.dataset.tab!==this.tab){this.sound.play('click');this.sound.rev(1);this.setTab(b.dataset.tab);}});
  q('#gTarget').addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(b){this.target=b.dataset.t;this.sound.play('click');this.update();}});
  q('#gAction').onclick=()=>this.act();q('#gBoth').onclick=()=>this.act(true);
  const c=this.canvas;c.addEventListener('pointerdown',()=>{this.sound.honk();this.bump();});
  document.addEventListener('keydown',e=>{if(!this.running)return;if(e.key==='ArrowLeft'){this.wheel.step(-1);e.preventDefault();}else if(e.key==='ArrowRight'){this.wheel.step(1);e.preventDefault();}else if(e.key==='Escape'){this.close();e.preventDefault();}});
 }
 items(tab=this.tab){
  if(tab==='trucks')return TRUCKS.map(t=>({kind:'truck',id:t.id,name:t.name,desc:t.desc,cost:t.cost}));
  if(tab==='trailers')return TRUCKS.map(t=>({kind:'trailer',id:t.id,name:t.name,desc:t.desc.replace('The trailer’s factory colour.','Trailer factory colour.'),cost:t.cost}));
  if(tab==='livery')return DECALS.map(d=>({kind:'decal',id:d.id,name:d.name,desc:DECAL_TAGS[d.id],cost:d.cost}));
  return CATALOG.map(u=>({kind:'upgrade',id:u.id,name:u.name,desc:u.description,cost:u.cost,icon:u.icon}));
 }
 st(it){const p=this.profile,w=p.wallet;
  if(it.kind==='truck'||it.kind==='trailer'){const owned=p.owned.includes(it.id),sel=it.kind==='truck'?p.truck===it.id:p.trailerPaint===it.id;return {owned,selected:sel,price:it.cost,locked:!owned&&w<it.cost};}
  if(it.kind==='decal'){const owned=p.ownedDecals.includes(it.id),t=this.target,sel=t==='cab'?p.decal===it.id:t==='trailer'?p.trailerDecal===it.id:p.decal===it.id&&p.trailerDecal===it.id;return {owned,selected:sel,price:it.cost,locked:!owned&&w<it.cost};}
  const lv=p.upgrades[it.id],maxed=lv>=3,price=maxed?0:it.cost*(lv+1);return {lv,maxed,price,owned:lv>0,locked:!maxed&&w<price};
 }
 art(it){
  if(it.kind==='truck')return "<img class='paint-thumb cab' alt='' draggable='false' src='"+thumb(this.images_r,'cab',it.id,0)+"'>";
  if(it.kind==='trailer')return "<img class='paint-thumb trailer' alt='' draggable='false' src='"+thumb(this.images_r,'trailer',it.id,0)+"'>";
  if(it.kind==='decal')return it.id?"<img class='paint-thumb trailer' alt='' draggable='false' src='"+thumb(this.images_r,'trailer',1,it.id)+"'>":"<span class='factory-dash'>FACTORY</span>";
  return "<span class='extra' data-extra='"+it.icon+"'></span>";}
 card(it){const s=this.st(it);let meta;
  if(it.kind==='upgrade')meta=Array.from({length:3},(_,i)=>"<i class='pip "+(i<s.lv?'on':'')+"'></i>").join('');
  else meta=s.selected?'ON THE ROAD':s.owned?'OWNED':this.money(s.price);
  return "<div class='gcard "+(s.locked?'locked':'')+" "+(s.selected?'equipped':'')+"'>"+this.art(it)+(s.locked?"<b class='lockbadge'>"+LOCK+"</b>":'')+"<span class='gname'>"+it.name.replace(/^THE /,'')+"</span><span class='gmeta'>"+meta+"</span></div>";}
 open(){this.root.classList.remove('hidden');this.root.classList.add('opening');setTimeout(()=>this.root.classList.remove('opening'),600);this.running=true;
  this.preview=new Renderer(this.canvas,this.images,this.profile.settings,{fixedWidth:true});this.images_r=this.preview;
  this.setTab(this.tab,true);this.last=performance.now();const loop=t=>{if(!this.running)return;this.draw((t-this.last)/1000);this.last=t;requestAnimationFrame(loop);};requestAnimationFrame(loop);}
 close(){this.running=false;this.root.classList.add('hidden');this.sound.play('click');this.onExit?.();}
 setTab(tab,first){this.tab=tab;const items=this.items();
  this.root.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  const p=this.profile;let start=0;if(tab==='trucks')start=items.findIndex(i=>i.id===p.truck);else if(tab==='trailers')start=items.findIndex(i=>i.id===p.trailerPaint);else if(tab==='livery')start=items.findIndex(i=>i.id===p.decal);else start=this.idx.upgrades;
  start=Math.max(0,start);
  const el=this.q('#garageWheel');
  if(this.wheel){this.wheel.setItems(items,false);this.wheel.pos=this.wheel.target=start;this.wheel.last=start;this.wheel.layout();}
  else this.wheel=new Wheel(el,{items,start,render:it=>this.card(it),spacing:w=>Math.min(w*.3,128),scales:[1,.66,.5,.4],
   onStep:(i,dir)=>{this.sound.rev(dir);this.haptic();this.update();},onSettle:i=>{this.idx[this.tab]=i;this.update();},onSelect:()=>this.tapCenter()});
  this.update();}
 cur(){return this.wheel.items[this.wheel.index];}
 /* What the preview shows: the current setup with the highlighted item tried on (owned or not). */
 pv(){const p=this.profile,it=this.cur(),pv={truck:p.truck,decal:p.decal,trailerPaint:p.trailerPaint,trailerDecal:p.trailerDecal,upgrades:{...p.upgrades}};
  if(it.kind==='truck')pv.truck=it.id;else if(it.kind==='trailer')pv.trailerPaint=it.id;
  else if(it.kind==='decal'){if(this.target!=='trailer')pv.decal=it.id;if(this.target!=='cab')pv.trailerDecal=it.id;}
  else pv.upgrades[it.id]=Math.min(3,p.upgrades[it.id]+(p.upgrades[it.id]<3?1:0));return pv;}
 update(){const it=this.cur(),s=this.st(it),q=this.q,p=this.profile;
  q('#garageWallet').textContent=this.money(p.wallet);
  q('#gName').textContent=it.name;q('#gDesc').textContent=it.desc;
  q('#gTarget').classList.toggle('hidden',it.kind!=='decal');q('#gTarget').querySelectorAll('[data-t]').forEach(b=>b.classList.toggle('active',b.dataset.t===this.target));
  let stat='';
  if(it.kind==='upgrade'){const S=STATS[it.id],now=S.f(s.lv),nxt=s.maxed?null:S.f(s.lv+1);
   stat="<div class='statrow'><span>"+S.label+"</span><span class='pips'>"+[1,2,3].map(i=>"<i class='pip "+(i<=s.lv?'on':!s.maxed&&i===s.lv+1?'next':'')+"'></i>").join('')+"</span><b>"+now+(nxt?" <em>→ "+nxt+"</em>":" <em>MAX</em>")+"</b></div>";}
  else{const bonus=it.kind==='decal'?(it.id>0?2:0):(TRUCKS.find(t=>t.id===it.id)?.bonus||0);stat="<div class='statrow'><span>DELIVERY PAY</span><span class='pips'>"+[1,2,3,4].map(i=>"<i class='pip "+(i<=bonus/1?'on':'')+"'></i>").join('')+"</span><b>"+(bonus?'+'+bonus+'%':'standard')+"</b></div>";}
  q('#gStats').innerHTML=stat;
  const a=q('#gAction'),note=q('#gNote'),badge=q('#stageBadge'),both=q('#gBoth');a.className='big-button';a.disabled=false;note.textContent='';badge.className='stage-badge hidden';both.classList.add('hidden');
  const part=it.kind==='truck'?'CAB':it.kind==='trailer'?'TRAILER':this.target==='cab'?'CAB':this.target==='trailer'?'TRAILER':'CAB + TRAILER';
  const gap=Math.max(0,s.price-p.wallet);
  if(s.locked){a.className='big-button locked';a.innerHTML=LOCK+"<span>KEEP TRUCKIN’ · "+this.money(gap)+" TO GO</span>";
   note.textContent='Preview only — look, but no touching. Earn '+this.money(gap)+' more and it’s yours.';badge.className='stage-badge lock';badge.innerHTML=LOCK+"<span>PREVIEW ONLY</span>";}
  else if(it.kind==='upgrade'){if(s.maxed){a.className='big-button done';a.innerHTML="<span>FULLY LOADED ✓</span>";a.disabled=true;}else{a.innerHTML="<span>UPGRADE · "+this.money(s.price)+"</span><b>➜</b>";badge.className='stage-badge try';badge.innerHTML="<span>NEXT LEVEL</span>";}}
  else if(s.selected){a.className='big-button done';a.innerHTML="<span>ON THE ROAD ✓ · "+part+"</span>";a.disabled=true;}
  else if(s.owned){a.innerHTML="<span>FIT TO "+part+"</span><b>➜</b>";}
  else{a.innerHTML="<span>BUY · "+this.money(s.price)+" · "+part+"</span><b>➜</b>";badge.className='stage-badge try';badge.innerHTML="<span>TRYING IT ON</span>";}
  // "Match both": an owned paint can be fitted to the cab and the trailer in one go.
  if((it.kind==='truck'||it.kind==='trailer')&&s.owned&&!(p.truck===it.id&&p.trailerPaint===it.id)){both.classList.remove('hidden');both.textContent='FIT TO CAB + TRAILER';}
  this.locked=!!s.locked;this.wheel.refresh();
 }
 tapCenter(){const it=this.cur(),s=this.st(it);if(it.kind!=='upgrade'&&s.owned&&!s.selected)this.act();else{this.sound.honk();this.bump();}}
 bump(){this.pop=1;}
 act(both){const it=this.cur(),s=this.st(it),p=this.profile;
  if(s.locked){this.sound.play('flush',.6);this.bump();this.root.classList.add('shake');setTimeout(()=>this.root.classList.remove('shake'),400);this.haptic('heavy');return;}
  const buy=(list)=>{if(!s.owned){p.wallet-=s.price;list.push(it.id);this.celebrate();}else this.sound.honk();};
  if(it.kind==='upgrade'){if(s.maxed)return;p.wallet-=s.price;p.upgrades[it.id]++;this.celebrate();}
  else if(it.kind==='truck'||it.kind==='trailer'){buy(p.owned);if(both){p.truck=it.id;p.trailerPaint=it.id;}else if(it.kind==='truck')p.truck=it.id;else p.trailerPaint=it.id;}
  else{buy(p.ownedDecals);if(this.target!=='trailer')p.decal=it.id;if(this.target!=='cab')p.trailerDecal=it.id;}
  this.save();this.onChange?.();this.update();}
 celebrate(){this.sound.play('cash');this.sound.honk();this.sound.rev(1);this.haptic('heavy');this.bump();
  for(let i=0;i<46;i++){const a=Math.random()*6.283,v=70+Math.random()*190;this.spark.push({x:0,y:0,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.8+Math.random()*.7,age:0,r:2+Math.random()*4});}
  this.root.classList.add('flash');setTimeout(()=>this.root.classList.remove('flash'),500);}
 draw(dt){const r=this.preview,c=r.ctx,W=420,H=r.H;if(!W||!H||!isFinite(H))return;dt=Math.min(.05,Math.max(0,dt||0));
  r.time+=dt;this.pop=Math.max(0,this.pop-dt*2.4);
  // The in-game road, scrolling slowly so the lamps, flames and decals feel alive.
  const off=(r.time*60)%256;r.world.paint(0,0,0,W,H,off);
  c.fillStyle='#0003';c.fillRect(0,0,W,H);
  c.strokeStyle='#eeeaddb0';c.lineWidth=2;for(const x of[44,376]){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}
  c.strokeStyle='#eee5ccaa';c.lineWidth=2;c.setLineDash([26,34]);c.lineDashOffset=-off;for(const x of[132,210,288]){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}c.setLineDash([]);
  const vg=c.createRadialGradient(W/2,H*.5,H*.2,W/2,H*.5,H*.8);vg.addColorStop(0,'#0000');vg.addColorStop(1,'#000a');c.fillStyle=vg;c.fillRect(0,0,W,H);
  const pv=this.pv(),ys=r.worldScale||.72,span=RIG.cabL/2+RIG.S*34+RIG.S*38+RIG.trailerL/2+RIG.cabL/2,s=Math.min(H*.84/(span*ys),W*.5/(RIG.cabW))*(1+this.pop*.035);
  const t=r.time;this.sway=Math.sin(t*.9)*.9;const x=2+this.sway*.18,lane=2+Math.sin(t*.9+.35)*.18;
  const top=-RIG.cabL/2,cy=H/2-(span/2-RIG.cabL/2)*s*ys;
  drawRig(r,{...pv,lane,x,angle:Math.sin(t*.9-.5)*.08,trailer:2+Math.sin(t*.9-.3)*.14,rear:2,hasTrailer:true,job:null,grip:0,boost:Math.max(0,Math.sin(t*.7)*3),shield:false,hornAge:this.pop>0?(1-this.pop)*.35:9},W/2,cy,1,s,ys,t);
  if(this.locked){c.save();c.fillStyle='#8ff3ff1c';const off2=(r.time*28)%6;for(let y=off2;y<H;y+=6)c.fillRect(0,y,W,2);c.restore();}
  c.save();c.translate(W/2,H/2);for(const sp of this.spark){sp.age+=dt;sp.x+=sp.vx*dt;sp.y+=sp.vy*dt;sp.vy+=140*dt;const a=Math.max(0,1-sp.age/sp.life);c.globalAlpha=a;c.fillStyle='#fff3b0';c.beginPath();c.moveTo(sp.x,sp.y-sp.r*2);c.lineTo(sp.x+sp.r*.6,sp.y-sp.r*.6);c.lineTo(sp.x+sp.r*2,sp.y);c.lineTo(sp.x+sp.r*.6,sp.y+sp.r*.6);c.lineTo(sp.x,sp.y+sp.r*2);c.lineTo(sp.x-sp.r*.6,sp.y+sp.r*.6);c.lineTo(sp.x-sp.r*2,sp.y);c.lineTo(sp.x-sp.r*.6,sp.y-sp.r*.6);c.closePath();c.fill();}c.restore();this.spark=this.spark.filter(sp=>sp.age<sp.life);
 }
}

module.exports={Garage};

},
"./game.js":function(module,exports,require){
const {routeWarning,roadAt,routeLanes}=require("./route-world.js");
const {CATALOG,DECALS,PAINT_IDS,DECAL_IDS,defaults : defaultUpgrades,normalize : normalizeUpgrades}=require("./upgrades.js");
const {Drive,clamp,themes,CRASHES}=require("./model.js");
const {HAZARD_SPECS}=require("./route-hazards.js");
const {Renderer,loadImages}=require("./render.js");
const {Sound}=require("./audio.js");
const {Wheel}=require("./wheel.js");
const {Garage}=require("./garage.js");
const {JOKES,jokeOrder}=require("./jokes.js");
const $=id=>document.getElementById(id),money=v=>'£'+Math.max(0,Math.round(v)).toLocaleString('en-GB');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='truckin-save-v1';
const defaults={version:1,name:'',player:globalThis.crypto?.randomUUID?.()||'driver-'+Date.now()+'-'+Math.random().toString(36).slice(2),wallet:0,best:0,truck:0,trailerPaint:1,owned:[0,1],upgrades:defaultUpgrades(),decal:0,trailerDecal:0,ownedDecals:[0],scores:[],stats:{jobs:0,horns:0,tacos:0,doubles:0},settings:{music:.7,sfx:.8,haptics:true,tall:false,motion:!matchMedia('(prefers-reduced-motion: reduce)').matches},tutorial:false};
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}');}catch{}
const profile={...defaults,...saved,upgrades:normalizeUpgrades(saved.upgrades),settings:{...defaults.settings,...saved.settings},stats:{...defaults.stats,...saved.stats}};
profile.wallet=clamp(Number(profile.wallet)||0,0,1e9);profile.best=clamp(Number(profile.best)||0,0,1e9);
profile.scores=Array.isArray(profile.scores)?profile.scores.slice(0,30):[];
profile.owned=Array.isArray(profile.owned)?profile.owned.filter(v=>PAINT_IDS.includes(v)):[0];for(const id of [0,1])if(!profile.owned.includes(id))profile.owned.push(id);if(!profile.owned.includes(profile.truck))profile.truck=0;if(!profile.owned.includes(profile.trailerPaint))profile.trailerPaint=1;
profile.ownedDecals=Array.isArray(profile.ownedDecals)?profile.ownedDecals.filter(v=>DECAL_IDS.includes(v)):[0];if(!profile.ownedDecals.includes(0))profile.ownedDecals.push(0);if(!profile.ownedDecals.includes(profile.decal))profile.decal=0;if(!profile.ownedDecals.includes(profile.trailerDecal))profile.trailerDecal=0;
let storageWarning=false;function save(){if(game&&!game.finished&&['playing','paused','countdown'].includes(state)){profile.active={data:game.snapshot(),id:onlineId};}else if(game?.finished){delete profile.active;}try{localStorage.setItem(KEY,JSON.stringify(profile));bridge('saveProgress',{data:JSON.stringify(profile)});}catch{storageWarning=true;}}
const sound=new Sound(profile.settings);sound.preload();let renderer,game=null,state='home',activeSheet='',lastTime=0,toastUntil=0,onlineId=null,runRequest=null,runSerial=0,ending=false,scoreMode='all',leaderTimer=null,wasFocus=null,lastHorn=-10,comicTimer=null,countdownTimer=null;
const native=()=>!!window.webkit?.messageHandlers?.truckin;
let backendUp=true;/* flips false after the first failed /api call so static hosts don't spam 404s */
function bridge(action,data={}){if(native())window.webkit.messageHandlers.truckin.postMessage({action,...data});}
function haptic(type='light'){if(!profile.settings.haptics)return;if(native())bridge('haptic',{style:type});else navigator.vibrate?.(type==='heavy'?[25,30,20]:12);}
function updateHome(){if(menuWheel)refreshMenu();$('menuStats').textContent='PERSONAL BEST '+money(profile.best)+'  ·  GARAGE WALLET '+money(profile.wallet);}
function toast(text,detail='',seconds=2){$('floatingToast').innerHTML=escape(text)+(detail?'<small>'+escape(detail)+'</small>':'');$('floatingToast').classList.remove('hidden');toastUntil=performance.now()+seconds*1000;}
function openSheet(title,eyebrow,body,name){activeSheet=name;wasFocus=document.activeElement;$('sheetTitle').textContent=title;$('sheetEyebrow').textContent=eyebrow;$('sheetBody').innerHTML=body;$('sheet').classList.remove('hidden');$('closeSheet').classList.remove('hidden');setTimeout(()=>$('closeSheet').focus(),10);}
function closeSheet(){if(activeSheet==='pause'){resume();return;}if(activeSheet==='result'){home();return;}clearInterval(leaderTimer);leaderTimer=null;$('sheet').classList.add('hidden');activeSheet='';if(wasFocus?.isConnected)wasFocus.focus();}
function home(){clearTimeout(crashComicTimer);$('app').classList.remove('playing');setTimeout(resize,30);runSerial++;clearTimeout(comicTimer);clearTimeout(countdownTimer);ending=false;state='home';game=null;onlineId=null;$('comic').classList.add('hidden');$('hud').classList.add('hidden');$('home').classList.remove('hidden');$('sheet').classList.add('hidden');activeSheet='';clearInterval(leaderTimer);sound.gameStop();sound.suspended=false;updateHome();if(homeMode==='menu')enterMenu(false);}
function askStart(mode){sound.unlock();if(mode==='endless'&&profile.active){restoreShift();return;}if(!profile.name){openSheet('YOUR SHIFT STARTS HERE','SIGN THE TACHO',"<p class='sheet-copy'>A full tank, a £500 float, and a sat-nav with questionable judgement. Let’s make a living.</p><label class='field-label' for='driverName'>DRIVER NAME</label><input id='driverName' type='text' maxlength='16' autocomplete='nickname' placeholder='Road legend' value=''><p class='status-note'>Your name appears on the leaderboard. Game earnings are fictional.</p><button class='big-button' id='nameGo'>LET’S GET TRUCKIN’ <b>➜</b></button>",'name');$('nameGo').onclick=()=>{profile.name=$('driverName').value.replace(/[^a-zA-Z0-9 _.-]/g,'').trim().slice(0,16)||'Road legend';save();begin(mode);};$('driverName').onkeydown=e=>{if(e.key==='Enter')$('nameGo').click();};}else begin(mode);}
function restoreShift(){const restored=Drive.restore(profile.active?.data);if(!restored){delete profile.active;save();begin();return;}$('app').classList.add('playing');resize();game=restored;onlineId=profile.active.id||null;runRequest=null;runSerial++;ending=false;state='playing';$('home').classList.add('hidden');$('hud').classList.remove('hidden');$('tutorialHint').classList.add('hidden');renderer.draw(game,0,profile.truck);updateHud();sound.suspended=false;sound.menuOff(.6);sound.unlock().then(()=>{if(state==='playing')sound.musicOn();});toast('WELCOME BACK, DRIVER','Right where you parked it.',2);}
function begin(mode='endless'){delete profile.active;if(!renderer)return;clearTimeout(crashComicTimer);$('app').classList.add('playing');resize();clearInterval(leaderTimer);clearTimeout(comicTimer);ending=false;lastHorn=-10;const stamp=Date.now();const seed=mode==='daily'?Number(new Date().toISOString().slice(0,10).replace(/-/g,'')):stamp;game=new Drive({seed,mode,upgrades:profile.upgrades,truck:profile.truck,decal:profile.decal,trailerPaint:profile.trailerPaint,trailerDecal:profile.trailerDecal});onlineId=null;const serial=++runSerial;state='countdown';$('home').classList.add('hidden');$('sheet').classList.add('hidden');$('comic').classList.add('hidden');$('hud').classList.remove('hidden');$('jobBox').classList.add('hidden');$('sheepWarning').classList.add('hidden');$('tutorialHint').classList.toggle('hidden',profile.tutorial);activeSheet='';sound.suspended=false;sound.menuOff(.8);sound.rev(1);sound.unlock().then(()=>{if(serial===runSerial&&state!=='paused'&&state!=='home')sound.musicOn();});if(!native()&&backendUp){runRequest=fetch('/api/run',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({player:profile.player,mode}),signal:AbortSignal.timeout(8000)}).then(r=>r.ok?r.json():null).then(d=>{if(!d)backendUp=false;if(serial===runSerial)onlineId=d?.id||null;return d?.id||null;}).catch(()=>{backendUp=false;return null;});}else runRequest=null;toast('SHINY SIDE UP!',mode==='daily'?'120 seconds · same route · stock handling':'£500 float · swipe one position at a time',1.5);renderer.fx=[];renderer.shake=0;renderer.highlight=null;renderer.draw(game,0,profile.truck);updateHud();countdownTimer=setTimeout(()=>{if(state==='countdown'){state='playing';$('road').focus();}},1100);}
function pause(){if(!['playing','countdown'].includes(state))return;clearTimeout(countdownTimer);state='paused';save();sound.pause();openSheet('PARKED UP','TAKE A BREATHER',"<p class='sheet-copy'>Your truck is safe here. The clock and the road are stopped.</p><button class='big-button' id='resumeButton'>BACK ON THE ROAD <b>➜</b></button><button class='secondary' id='finishShift'>Finish shift & bank earnings</button><p class='status-note'>An unfinished delivery won’t be paid.</p>",'pause');$('resumeButton').onclick=resume;$('finishShift').onclick=()=>{if(game){game.end('Clocked off. Kettle on.');handleEvents();}};}
function resume(){if(!game||game.finished)return;state='playing';$('sheet').classList.add('hidden');activeSheet='';lastTime=performance.now();sound.resume();$('road').focus();}
function honk(){if(state!=='playing'||!game)return;let now=performance.now()/1000;if(now-lastHorn<.18)return;lastHorn=now;game.horn();haptic();handleEvents();}
const IMG=n=>"<img src='./assets/comic/"+n+".webp' alt='' draggable='false'>";
/* One vignette per shift-ending hazard: art stage, catchphrase, deadpan sub-line, sound. Add a key here + a CRASHES line in model.js for a new one. */
const COMICS={
 sheep:{art:"<span class='sprite' data-sprite='13'></span>",title:'OH, FLOCK!',sub:'NO SHEEP WERE HARMED.<br>YOUR PRIDE, HOWEVER…',sfx:['brake']},
 car:{art:"<div class='stage'><i class='burst'>CRUNCH!</i><span class='part cab'>"+IMG('cab')+"</span><span class='part carb'>"+IMG('car-blue')+"</span></div>",title:'OH, BUMPER!',sub:'NO ONE WAS HURT.<br>YOUR NO-CLAIMS BONUS, HOWEVER…',sfx:['horn','brake']},
 lowbridge:{art:"<div class='stage'><span class='part arch'>"+IMG('bridge-low')+"</span><i class='burst'>BONK!</i></div>",title:'SUNROOF!',sub:'FACTORY-FIT. NO EXTRA CHARGE.<br>THE BRIDGE SENDS ITS THANKS.',sfx:['brake','flush']},
 weakbridge:{art:"<div class='stage'><span class='part half l'>"+IMG('bridge-weak')+"</span><span class='part half r'>"+IMG('bridge-weak')+"</span><span class='part cab'>"+IMG('cab')+"</span><i class='burst'>SPLASH!</i></div>",title:'PLANK YOU!',sub:'NOT RATED FOR YOUR DINNER.<br>THE RIVER SENDS ITS REGARDS.',sfx:['brake','flush']},
 oil:{art:"<div class='stage'><span class='part slick'>"+IMG('oil')+"</span><span class='part cab'>"+IMG('cab')+"</span><i class='dizzy'>★ ✦ ★</i></div>",title:'SPIN CYCLE!',sub:'WASH. RINSE. JACKKNIFE.<br>COLOURS MAY RUN.',sfx:['brake','scatter']},
 cow:{art:"<div class='stage'><span class='emo b'>🐄</span><span class='emo a'>🚛</span><i class='burst'>MOOOO!</i></div>",title:'MOO-VE OVER!',sub:'HOLY COW. LITERALLY.<br>YOU SHOULD HAVE HONKED.',sfx:['horn','brake','scatter']},
 binlorry:{art:"<div class='stage'><span class='emo b'>🗑️</span><span class='emo a'>🚛</span><i class='burst'>CLANG!</i></div>",title:'BIN THERE, DONE THAT!',sub:'REFUSE TO LOOK WHERE YOU’RE GOING.<br>COLLECTION: ONE LORRY.',sfx:['horn','brake','scatter']},
 icecream:{art:"<div class='stage'><span class='emo b'>🍦</span><span class='emo a'>🚛</span><i class='burst'>SPLAT!</i></div>",title:'99 PROBLEMS!',sub:'ONE FLAKE-ING DISASTER.<br>NO SPRINKLES. NO REFUNDS.',sfx:['brake','flush','scatter']},
 house:{art:"<div class='stage'><span class='part home'>"+IMG('house')+"</span><span class='part cab'>"+IMG('cab')+"</span><i class='burst'>DING-DONG!</i></div>",title:'KNOCK, KNOCK!',sub:'WHO’S THERE? A LORRY.<br>IN THE LOUNGE.',sfx:['horn','brake','flush']}
};
let comicAt=0,comicDelayed=false,crashComicTimer=0;
function showComic(kind){const c=COMICS[kind]||COMICS.sheep,el=$('comic');el.className='comic-'+kind;el.innerHTML=c.art+'<strong>'+c.title+'</strong><small>'+c.sub+'</small><em>TAP TO CONTINUE</em>';comicAt=performance.now();c.sfx.forEach((n,i)=>setTimeout(()=>sound.play(n),i*260));if(kind!=='sheep'){renderer.shake=profile.settings.motion?16:0;haptic('heavy');}}
window.truckinPreviewComic=showComic;/* QA hook: truckinPreviewComic('car'|'lowbridge'|'weakbridge'|'oil'|'sheep') */
function handleEvents(){if(!game)return;for(const e of game.events.splice(0)){const px=renderer.x(game.x,game.distance),py=renderer.playerY;
 switch(e.type){
 case'trailerDrop':sound.play('click');toast('CAB ONLY · +16% SPEED',e.lost?'Delivery abandoned · '+money(e.lost)+' unbanked pay lost':'Collect a green hitch to haul again.',2.5);haptic();break;
 case'shoo':sound.play('scatter');{const T={cow:['MOO-VE ALONG!','+£60 · Cow relocated with dignity.'],geese:['SHOOED!','+£35 · Geese: unimpressed.'],morris:['JIG’S UP!','+£45 · Bells silenced. Hankies lowered.'],cyclists:['PELOTON PARTED!','+£40 · Lycra scattered politely.']}[e.kind]||['SHOOED!','+£35'];toast(T[0],T[1],1.6);}haptic();break;
 case'shield':sound.play('pickup');toast('LUCKY HORSESHOE!','Your next crash is on the house.',2);haptic();break;
 case'shieldSave':sound.play('flush');renderer.shake=profile.settings.motion?10:0;toast('HORSESHOE SAVED YOU!','Phew. One life used.',2.2);haptic('heavy');break;
 case'trailerHitch':sound.play('pickup');toast('TRAILER LOCKED','Back in the haulage business.',1.8);haptic();break;
 case'mud':toast('MUD ON THE TYRES','Grip will return on clean tarmac.',1.5);break;
 case'prize':sound.play('bonus');haptic();break;
 case'steer':haptic();break;
 case'horn':sound.play('horn');break;
 case'cash':sound.play('cash');renderer.effect('cash',px,py,'+'+money(e.value));break;
 case'loss':sound.play('flush');renderer.effect('loss',px,py,'−'+money(e.value));renderer.shake=profile.settings.motion?10:0;toast(e.label,'−'+money(e.value),2);haptic('heavy');break;
 case'crumb':sound.play('crumb');renderer.effect('cash',px,py);break;
 case'job':sound.play('pickup');toast(e.double?'DOUBLE TROUBLE!':'YOU’RE ON THE JOB',e.double?'Double pay. Twice the trailer.':'Follow the golden trail. Hit the finish flag.',2.2);break;
 case'delivery':sound.play('delivery');profile.stats.jobs++;if(e.double)profile.stats.doubles++;toast(e.perfect?'PERFECT DROP!':'DELIVERY BANKED',money(e.pay)+' · '+['Lovely jubbly.','Pallets in. Payday out.','Proof of delivery: smug grin.'][game.jobs%3],2.5);haptic();save();break;
 case'taco':sound.play('bonus');profile.stats.tacos++;save();break;
 case'sheepWarning':break;
 case'baa':sound.play('sheep');sound.duck();haptic();break;
 case'night':sound.play('bonus');toast('NIGHT SHIFT · DOUBLE BUBBLE','Coins are worth twice as much.',1.5);break;
 case'dawn':toast('HERE COMES THE SUN','Night rate clocked off.',1.4);break;
 case'boost':sound.play('pickup');toast('THERMOS TURBO!','A little extra go.',1.2);break;
 case'sheepClear':sound.play('scatter');profile.stats.horns++;save();break;
 case'hint':toast(e.text,'',1.2);break;
 case'crash':{
  // Freeze on the impact with a red ring and a plain-English label, so you can see exactly what you hit; then the comic.
  const h=game.lastHit,NAMES={car:'CAR',lowbridge:'LOW BRIDGE',weakbridge:'WEAK BRIDGE',oil:'OIL SLICK',house:'HOUSE',cow:'COW',icecream:'ICE-CREAM VAN',binlorry:'BIN LORRY'};
  if(h&&e.kind!=='sheep'){const spec=HAZARD_SPECS[h.type],x=h.x??renderer.x(h.lane,h.z),y=renderer.playerY-(h.z-game.distance)*renderer.worldScale;
   renderer.highlight={x,y,rx:Math.max(34,(spec?.width||70)*.62),ry:Math.max(30,(spec?.height||80)*renderer.worldScale*.62),label:'YOU HIT: '+(NAMES[e.kind]||e.kind.toUpperCase()),t0:renderer.time,item:h.item};renderer.shake=profile.settings.motion?14:0;haptic('heavy');sound.play('brake');renderer.draw(game,0,profile.truck);
   clearTimeout(crashComicTimer);crashComicTimer=setTimeout(()=>{if(state==='ended')showComic(e.kind);},1900);comicDelayed=true;}
  else showComic(e.kind);break;}
 case'bailout':sound.play('flush');renderer.shake=profile.settings.motion?12:0;haptic('heavy');toast('MATES’ RATES TO THE RESCUE','−£400 excess · '+({car:'Car park shuffle.',lowbridge:'Roof: mostly intact.',weakbridge:'Bridge: mostly intact.',oil:'Slick recovery.'}[e.kind]||'Phew.'),2.6);break;
 case'jackknife':sound.play('brake');renderer.shake=12;break;
 case'missedJob':toast('MISSED YOUR DROP','The pallet’s going back to the depot.',2);break;
 case'sheepFail':showComic('sheep');break;
 case'end':finish(e.reason,game.crashKind||'');break;
 }
 }}
function updateHud(){if(!game)return;$('money').textContent=money(game.money);$('distance').textContent=game.mode==='daily'?Math.max(0,120-Math.floor(game.time))+'s':(game.distance/9000).toFixed(2);$('distanceLabel').textContent=game.mode==='daily'?'SHIFT TIME LEFT':'MILES ON THE CLOCK';$('zone').textContent=themes[game.stage];$('jobs').textContent=game.night?'☾ NIGHT ×2':game.boost>0?'TURBO '+Math.ceil(game.boost)+'s':game.rested>0?'RESTED':' '+game.jobs+' DROPS';$('swayFill').style.width=game.sway*100+'%';$('swayFill').style.background=game.sway>.75?'#ff886f':'#60dfd4';$('swayLabel').textContent=game.grip>0?'TYRE GRIP RECOVERING':!game.hasTrailer?'CAB ONLY · +16% SPEED':game.job?.double?'DOUBLE TRAILER SWAY':'TRAILER SWAY';if(game.grip>0){$('swayFill').style.width=(1-game.grip/4.8)*100+'%';$('swayFill').style.background='#dcb976';}$('drivingHint').textContent=game.grip>0?'Gentle steering until the tyres clear.':!game.hasTrailer?'Green hitch or a new job attaches a trailer.':game.sway>.7?'Steady! Let it settle.':game.job?.double?'Double pay. Easy on the wheel.':'Easy does it, driver.';$('jobBox').classList.toggle('hidden',!game.job);if(game.job){$('jobTitle').textContent=game.job.label;$('jobMoney').textContent=money(game.job.pay);$('jobCount').textContent=game.job.count+' / 10 crumbs';$('jobProgress').style.width=game.job.count*10+'%';}
 $('sheepWarning').classList.toggle('hidden',!game.sheep);const honkNear=game.items.some(e=>e.honkable&&!e.done&&e.z-game.distance>70&&e.z-game.distance<520);$('hornButton').classList.toggle('alert',(!!game.sheep&&game.sheep.baa&&!game.sheep.cleared)||honkNear);if(game.sheep){let s=game.sheep;$('sheepWarning').classList.toggle('now',s.baa&&!s.cleared);$('sheepWarning').classList.toggle('cleared',s.cleared);$('sheepText').textContent=s.cleared?'WOOL DONE!':s.baa?'BEEP THE SHEEP!':'BEEP THE SHEEP!';$('sheepHint').textContent=s.cleared?'Cheers, driver!':s.baa?'BAA! DOUBLE TAP!':'Wait for the baa…';}
 const w=routeWarning(game.distance,game.seed),warning=$('routeDecision');warning.classList.toggle('hidden',!w);if(w){$('routeDecisionMain').textContent=w.left?'← '+w.left+'     '+w.right+' →':w.text;$('routeDecisionDistance').textContent=w.distance>0?w.distance+' m · CHOOSE YOUR ROUTE':'FOLLOW YOUR CHOSEN ROAD';}
 const drop=$('trailerButton');drop.disabled=!game.hasTrailer||game.dropCooldown>0;drop.querySelector('b').textContent=game.hasTrailer?'DROP TRAILER':'CAB ONLY';drop.querySelector('small').textContent=game.hasTrailer?(game.job?'LOSE '+money(game.job.pay)+' LOAD':'GAIN SPEED'):'FIND GREEN HITCH';
 if(game.time>8){$('tutorialHint').classList.add('hidden');if(!profile.tutorial){profile.tutorial=true;save();}}if(performance.now()>toastUntil)$('floatingToast').classList.add('hidden');}
async function finish(reason,kind=''){if(ending)return;ending=true;state='ended';sound.musicOff();const result={score:Math.max(0,Math.round(game.earned-game.fines)),earned:game.earned,fines:game.fines,distance:Math.floor(game.distance/10),jobs:game.jobs,horns:game.horns,time:Math.floor(game.time),mode:game.mode,date:new Date().toISOString(),name:profile.name};
 result.newBest=result.score>profile.best;profile.best=Math.max(profile.best,result.score);profile.wallet+=result.score;profile.scores.unshift(result);profile.scores=profile.scores.slice(0,30);save();updateHome();if(native()&&result.score>0)bridge('submitScore',{score:result.score,mode:result.mode});
 const show=()=>{if(state!=='ended')return;$('comic').classList.add('hidden');openSheet('SHIFT COMPLETE',reason,"<div class='result-score'>"+(result.newBest?"<span class='badge'>NEW PERSONAL BEST</span>":'')+"<span class='eyebrow'>NET EARNINGS</span><strong>"+money(result.score)+"</strong></div><div class='result-grid'><div><strong>"+result.jobs+"</strong><small>DELIVERIES</small></div><div><strong>"+(result.distance/900).toFixed(2)+"</strong><small>MILES</small></div><div><strong>"+result.horns+"</strong><small>FLOCKS SAVED</small></div></div><div class='receipt'><span>Jobs & rewards</span><b>"+money(result.earned)+"</b></div><div class='receipt'><span>Fines & damage</span><b class='negative'>−"+money(result.fines)+"</b></div><div class='receipt'><span>Added to garage wallet</span><b>"+money(result.score)+"</b></div><p class='status-note' id='saveStatus'>"+(native()?'Saved on this iPhone. Game Center submits when signed in.':'Saved on this device. Updating leaderboard…')+"</p><button class='big-button' id='againButton'>ONE MORE SHIFT <b>➜</b></button><button class='secondary' id='shareButton'>Share your shift</button><details class='taco-fact'><summary>🇺🇸 <span class='sprite' data-sprite='8'></span> WHY TACOS?</summary><p>In Britain, a <b>tachograph</b> records a lorry driver’s driving and rest. Drivers shorten it to <b>tacho</b>, which sounds just like taco. American drivers commonly use an <b>ELD</b>—Electronic Logging Device—to record driving hours.</p><p>So yes, the taco break is a tacho-break joke. Lettuce rest!</p></details><button class='quiet' id='homeButton'>Back to the depot</button>",'result');$('againButton').onclick=()=>begin(result.mode);$('homeButton').onclick=home;$('shareButton').onclick=async()=>{const text='I banked '+money(result.score)+' in Truckin’ & Drivin’ — '+result.jobs+' deliveries, '+result.horns+' flocks politely relocated. Keep it shiny side up!';if(native())bridge('share',{text});else{try{if(navigator.share)await navigator.share({title:'Truckin’ & Drivin’',text});else{await navigator.clipboard.writeText(text);$('shareButton').textContent='Shift copied!';}}catch{$('shareButton').textContent='Share cancelled — try again';}};};};
 if(kind){$('comic').onclick=()=>{if(performance.now()-comicAt>900){clearTimeout(comicTimer);show();}};comicTimer=setTimeout(show,comicDelayed?5400:3200);comicDelayed=false;}else show();
 if(!native()&&backendUp){let id=onlineId||await runRequest;let msg='Saved on this device. Online board is unavailable.';if(id){try{const r=await fetch('/api/leaderboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,player:profile.player,nickname:profile.name,score:result.score,distance:result.distance,jobs:result.jobs}),signal:AbortSignal.timeout(8000)});msg=r.ok?'Your shift is on the live leaderboard.':'Saved on this device. This run could not be posted.';}catch{}}const waitStatus=()=>{if(activeSheet==='result'&&$('saveStatus'))$('saveStatus').textContent=msg;};waitStatus();if(kind)setTimeout(waitStatus,3300);}
}
function guide(){openSheet('DRIVER’S GUIDE','KEEP IT SHINY SIDE UP',"<div class='guide-row'><span class='guide-symbol'>‹ ›</span><div><b>One swipe. One position.</b><p>One swipe moves one step across the view. Follow the bends; fewer positions fit on narrow roads. Read both signs before a fork. Swipe left or right. Keyboard: arrow keys or A / D.</p></div></div><div class='guide-row'><span class='sprite' data-sprite='4'></span><div><b>It’s not just the sheep.</b><p>Cars, low bridges, weak bridges, oil slicks and garden-path shortcuts (houses) end your shift on the spot. Cones, bus lanes, no-entry signs and the rest only cost a fine. Mates’ Rates insurance level 3 bails you out of one crash per shift.</p></div></div><div class='guide-row'><span class='sprite' data-sprite='9'></span><div><b>Green glow? Get that job.</b><p>Drive into the pallet. Every golden breadcrumb adds £25. Collect the finish flag to bank the whole job.</p></div></div><div class='guide-row'><span class='sprite' data-sprite='8'></span><div><b>A very important taco break.</b><p>Grab a shiny taco for £100 and a short breather. The tacho joke practically wrote itself.</p></div></div><div class='guide-row'><span class='sprite' data-sprite='12'></span><div><b>Wait for BAA. Then honk!</b><p>Double-tap, use HONK or press Space within the short yellow warning window. Early horns don’t count.</p></div></div><div class='guide-row'><span class='sprite' data-sprite='14'></span><div><b>Double trailer. Double trouble.</b><p>Purple jobs pay double. Rapid swerves can jackknife the outfit. Let the sway settle between moves.</p></div></div><div class='guide-row'><span class='guide-symbol'>↗</span><div><b>Choose your road.</b><p>Forks split around scenery. Main roads are free. No-entry roads cost £120; access roads and public paths cost £90. Mud slows you and reduces steering response until the tyres clear. A gold special pays £85, but the risky route can cost more than the prize.</p></div></div><div class='guide-row'><span class='guide-symbol'>🐄</span><div><b>Moo-ve it! Honk the herd.</b><p>Cows and geese on the road? HONK before you reach them and they’ll trot off (+£60 cow, +£35 geese). Morris dancers and cyclists can be honked off too. Hit a cow and your shift ends. Ice-cream vans and bin lorries end it too. Tractors, caravans, hay bales and geese just cost a fine. Grab a gold horseshoe and your next crash is on the house.</p></div></div><div class='guide-row'><span class='guide-symbol'>📱</span><div><b>Tall phone? Tall view.</b><p>On a tall phone, a joke ticker fills the top and the scenery stretches out sideways. On a smaller phone or iPad, switch on Tall-phone view in the cab settings to preview it. Untick it for normal play.</p></div></div><div class='guide-row'><span class='guide-symbol'>⛓</span><div><b>Drop it. Run light.</b><p>Tap DROP TRAILER or press X for 16% extra speed and quicker steering. Any unbanked delivery is abandoned. Collect a green hitch or a new job to attach a trailer again.</p></div></div><p class='sheet-copy'>Warnings appear on the lane ahead of actual rolling-road features: low bridges, weak bridges, bus lanes, no-entry sections, gardens and roadworks. Change position early—and keep your trailer clear. Fines eat your £500 float. Bank your shift from Pause whenever you like.</p><div class='guide-row'><span class='extra' data-extra='0'></span><div><b>Night shift. Double bubble.</b><p>Pick up the glowing moon. Follow a dimly lit trail of coins worth twice as much; lighting upgrades improve your view.</p></div></div><div class='guide-row'><span class='extra' data-extra='1'></span><div><b>Thermos turbo!</b><p>Coffee means a burst of speed; tacos slow things down. Garage equipment improves earnings, comfort and control.</p></div></div><button class='secondary' id='guideDone'>Got it. Let’s roll.</button>",'guide');$('guideDone').onclick=closeSheet;}
function settings(){openSheet('IN THE CAB','JUST HOW YOU LIKE IT',"<div class='setting'><label for='musicVolume'>Road-trip music</label><input id='musicVolume' type='range' min='0' max='1' step='.05' value='"+profile.settings.music+"'></div><div class='setting'><label for='sfxVolume'>Sound effects</label><input id='sfxVolume' type='range' min='0' max='1' step='.05' value='"+profile.settings.sfx+"'></div><div class='setting'><label for='hapticSetting'>Haptic feedback</label><input id='hapticSetting' type='checkbox' "+(profile.settings.haptics?'checked':'')+"></div><div class='setting'><label for='motionSetting'>Extra motion & screen shake</label><input id='motionSetting' type='checkbox' "+(profile.settings.motion?'checked':'')+"></div><div class='setting'><label for='tallSetting'>Tall-phone view (preview)</label><input id='tallSetting' type='checkbox' "+(profile.settings.tall?'checked':'')+"></div><p class='status-note' style='margin:-4px 0 8px'>Shows the game as it looks on a tall phone: a joke ticker on top, the road shifted up and the scenery extended at the sides. Untick for normal play.</p><div class='setting'><label for='guideSetting'>Highlight steering target</label><input id='guideSetting' type='checkbox' "+(profile.settings.guides!==false?'checked':'')+"></div><label class='field-label' for='editName'>DRIVER NAME</label><input id='editName' type='text' maxlength='16' value='"+escape(profile.name)+"' placeholder='Road legend'><button class='secondary' id='saveSettings'>Save settings</button><button class='quiet' id='privacyButton'>Privacy & your progress</button><p class='status-note'>v2.1.0 · Original art & music · No ads or in-app purchases</p>",'settings');$('musicVolume').oninput=e=>{profile.settings.music=Number(e.target.value);sound.update();};$('sfxVolume').oninput=e=>{profile.settings.sfx=Number(e.target.value);sound.play('click');};$('hapticSetting').onchange=e=>profile.settings.haptics=e.target.checked;$('motionSetting').onchange=e=>profile.settings.motion=e.target.checked;$('guideSetting').onchange=e=>profile.settings.guides=e.target.checked;$('tallSetting').onchange=e=>{profile.settings.tall=e.target.checked;save();resize();};$('saveSettings').onclick=()=>{profile.name=$('editName').value.replace(/[^a-zA-Z0-9 _.-]/g,'').trim().slice(0,16)||'Road legend';save();closeSheet();};$('privacyButton').onclick=privacy;}
function privacy(){openSheet('YOUR DATA','SMALL PRINT. SHORT VERSION.',"<p class='sheet-copy'>Your truck unlocks, upgrades, settings and recent shifts are stored on this device. Clearing website data or removing the app can remove that progress.</p><p class='sheet-copy'>The online board stores your chosen driver name and submitted run results with an app-specific player ID. Never use a real name if you don’t want it shown. No advertising, analytics, location tracking, payments or contact permissions are used by this game.</p><p class='sheet-copy'>On iPhone, Game Center is optional and uses your Apple gaming profile. You can play offline without it.</p><p class='status-note'>"+(storageWarning?'This browser could not save progress. Check available storage and private browsing settings.':'Progress is saved after each finished shift and garage purchase.')+"</p>",'privacy');}
async function refreshScores(){if(activeSheet!=='leaderboard')return;const target=$('scores');try{if(!backendUp)throw Error();let r=await fetch('/api/leaderboard?mode='+scoreMode,{signal:AbortSignal.timeout(6000)});if(!r.ok)throw Error();let d=await r.json();if(activeSheet!=='leaderboard')return;target.innerHTML=d.scores.length?d.scores.map((s,i)=>"<div class='score-row'><span class='rank'>"+(i+1)+"</span><span class='name'>"+escape(s.nickname)+"</span><b>"+money(s.score)+"</b></div>").join(''):"<div class='empty'>A clear road ahead.<br>Finish a shift to set the first score.</div>";$('boardStatus').textContent='LIVE · best shift per driver · refreshes every 15 seconds';}catch{backendUp=false;if(activeSheet!=='leaderboard')return;$('sheetEyebrow').textContent='YOUR BEST SHIFTS';const list=profile.scores.filter(s=>s.score>0&&(scoreMode!=='daily'||(s.mode==='daily'&&s.date.slice(0,10)===new Date().toISOString().slice(0,10)))).sort((a,b)=>b.score-a.score).slice(0,10);target.innerHTML=list.length?list.map((s,i)=>"<div class='score-row'><span class='rank'>"+(i+1)+"</span><span class='name'>"+escape(s.name)+"</span><b>"+money(s.score)+"</b></div>").join(''):"<div class='empty'>No shifts saved on this device yet.<br>Time to get truckin’.</div>";$('boardStatus').textContent='ON THIS DEVICE · the online board isn’t connected';}}
function leaderboard(){if(native()){bridge('leaderboard',{mode:scoreMode});return;}openSheet('ROAD LEGENDS','THE LIVE LEADERBOARD',"<div class='score-tabs'><button id='allScores' class='"+(scoreMode==='all'?'active':'')+"'>All time</button><button id='dailyScores' class='"+(scoreMode==='daily'?'active':'')+"'>Daily dispatch</button></div><div id='scores'><div class='empty'>Checking the dispatch board…</div></div><p class='status-note' id='boardStatus'>Best net earnings wins. No invented drivers.</p>",'leaderboard');$('allScores').onclick=()=>{scoreMode='all';leaderboard();};$('dailyScores').onclick=()=>{scoreMode='daily';leaderboard();};clearInterval(leaderTimer);refreshScores();leaderTimer=setInterval(refreshScores,15000);}
window.truckinNativeMessage=(message)=>{if(message==='scoreSubmitted'&&$('saveStatus'))$('saveStatus').textContent='Your shift is on Game Center.';if(message==='pause')pause();if(message==='gameCenterUnavailable')openSheet('ROAD LEGENDS','LEADERBOARD',"<p class='sheet-copy'>Online leaderboards aren’t available on this device right now (on iPhone, sign in to Game Center in Settings). Your best shift is safely saved on this device.</p><div class='result-score'><span class='eyebrow'>PERSONAL BEST</span><strong>"+money(profile.best)+"</strong></div>",'nativeboard');};
$('trailerButton').onclick=()=>{if(state==='playing'&&game){game.dropTrailer();handleEvents();updateHud();}};
$('pauseButton').onclick=pause;$('hornButton').onclick=honk;$('closeSheet').onclick=closeSheet;
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{sound.unlock();sound.play('click');({garage,leaderboard,guide,settings,intro:()=>{$('intro').classList.remove('hidden');setTimeout(()=>$('intro').classList.add('hidden'),2500);}})[b.dataset.action]?.();});
/* JW EDS intro. If public/audio/jweds-jingle.mp3 exists the intro waits for a tap (browsers need one to allow sound) and plays it. */
let introTimer=setTimeout(()=>$('intro').classList.add('hidden'),2400),jinglePending=false;
sound.preload()?.then(()=>{if(sound.buffers['jweds-jingle']&&!$('intro').classList.contains('hidden')){clearTimeout(introTimer);jinglePending=true;$('intro').querySelector('small').textContent='TAP TO START';}});
$('intro').onclick=async()=>{clearTimeout(introTimer);if(jinglePending){jinglePending=false;await sound.unlock();sound.play('jweds-jingle');setTimeout(()=>$('intro').classList.add('hidden'),2600);}else{$('intro').classList.add('hidden');sound.unlock();}};

/* ---------- Home: tap to start -> ignition -> swipe wheel ---------- */
let homeMode='splash',menuWheel=null,menuBusy=false,garageUI=null;
const menuItems=()=>[
 {id:'start',art:'keys',name:profile.active?'RESUME SHIFT':'START SHIFT',tag:profile.active?'Right where you parked it.':'Keys in. Common sense out.',run:()=>askStart('endless')},
 {id:'daily',art:'daily',name:'DAILY DISPATCH',tag:'120 seconds. One brew’s worth.',run:()=>askStart('daily')},
 {id:'garage',art:'garage',name:'THE GARAGE',tag:'Pimp your haulage.',run:()=>openGarage()},
 {id:'board',art:'trophy',name:'LEADERBOARD',tag:'Glory. Mostly sheep-based.',run:leaderboard},
 {id:'guide',art:'guide',name:'DRIVER’S GUIDE',tag:'The sat-nav says “good luck”.',run:guide},
 {id:'cab',art:'settings',name:'IN THE CAB',tag:'Spanners out. Volume up. Or down.',run:settings}];
function menuText(i){const it=menuWheel.items[i];if(!it)return;const n=$('menuName'),t=$('menuTag');if(n.textContent===it.name&&t.textContent===it.tag)return;n.textContent=it.name;t.textContent=it.tag;const l=document.querySelector('.menu-label');l.classList.remove('swap');void l.offsetWidth;l.classList.add('swap');}
function buildMenu(){menuWheel=new Wheel($('menuWheel'),{items:menuItems(),start:0,render:it=>"<div class='micon'><img src='./assets/menu/"+it.art+".webp' alt='"+it.name+"' draggable='false'></div>",spacing:w=>Math.min(w*.4,170),scales:[1,.56,.38,.28],
 onStep:(i,dir)=>{sound.rev(dir);haptic();menuText(i);},onSettle:menuText,onSelect:chooseMenu});menuText(0);}
function refreshMenu(){menuWheel.items=menuItems();menuText(menuWheel.index);}
function enterMenu(ignite){homeMode='menu';$('home').classList.add('menu-on');$('menu').setAttribute('aria-hidden','false');$('tapPrompt').classList.add('hidden');if(!menuWheel)buildMenu();else refreshMenu();menuWheel.layout();updateHome();sound.menuOn(ignite);}
function chooseMenu(i){const it=menuWheel.items[i];if(menuBusy||!it)return;menuBusy=true;sound.honk();haptic('heavy');$('menu').classList.add('chosen');setTimeout(()=>{$('menu').classList.remove('chosen');menuBusy=false;it.run();},it.id==='start'||it.id==='daily'?430:280);}
function openGarage(){sound.rev(1);if(!garageUI)garageUI=new Garage({root:$('garage'),profile,images:renderer.images,sound,money,save,haptic,onChange:updateHome,onExit:()=>{updateHome();}});garageUI.open();}
$('tapPrompt').onclick=async()=>{if(homeMode!=='splash')return;$('tapPrompt').disabled=true;await sound.unlock();enterMenu(true);};
let pointer=null,lastTap=0,lastTapPoint=null;
$('road').addEventListener('pointerdown',e=>{if(state!=='playing')return;e.preventDefault();$('road').setPointerCapture(e.pointerId);pointer={id:e.pointerId,x:e.clientX,y:e.clientY,at:performance.now(),moved:false};});
$('road').addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId||state!=='playing')return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(!pointer.moved&&Math.abs(dx)>Math.max(23,$('road').clientWidth*.06)&&Math.abs(dx)>Math.abs(dy)*.65){game.move(Math.sign(dx));pointer.moved=true;lastTap=0;handleEvents();}});
$('road').addEventListener('pointerup',e=>{if(!pointer||pointer.id!==e.pointerId)return;const now=performance.now(),dist=Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y);if(!pointer.moved&&dist<18&&now-pointer.at<260){if(now-lastTap<320&&lastTapPoint&&Math.hypot(e.clientX-lastTapPoint.x,e.clientY-lastTapPoint.y)<80){honk();lastTap=0;}else{lastTap=now;lastTapPoint={x:e.clientX,y:e.clientY};}}pointer=null;});
$('road').addEventListener('pointercancel',()=>pointer=null);
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;if(e.key==='Escape'){e.preventDefault();if(activeSheet)closeSheet();else pause();return;}if(e.key==='Tab'&&activeSheet){const focus=[...$('sheet').querySelectorAll('button:not(:disabled),input')].filter(el=>el.offsetParent!==null);if(e.shiftKey&&document.activeElement===focus[0]){e.preventDefault();focus.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===focus.at(-1)){e.preventDefault();focus[0]?.focus();}}if(state==='home'&&!activeSheet&&!garageUI?.running){if(homeMode==='splash'&&['Enter',' '].includes(e.key)){e.preventDefault();$('tapPrompt').click();return;}if(homeMode==='menu'&&menuWheel){if(['ArrowLeft','a','A'].includes(e.key)){e.preventDefault();menuWheel.step(-1);}else if(['ArrowRight','d','D'].includes(e.key)){e.preventDefault();menuWheel.step(1);}else if(['Enter',' '].includes(e.key)){e.preventDefault();menuWheel.select();}return;}}if(state!=='playing')return;if(['ArrowLeft','a','A','ArrowRight','d','D',' ','p','P','x','X'].includes(e.key))e.preventDefault();if(e.repeat)return;if(['ArrowLeft','a','A'].includes(e.key))game.move(-1);if(['ArrowRight','d','D'].includes(e.key))game.move(1);if(e.key===' ')honk();if(e.key.toLowerCase()==='x')game.dropTrailer();if(e.key.toLowerCase()==='p')pause();handleEvents();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();sound.pause();if(game)save();}else if(state==='home'&&homeMode==='menu'){sound.suspended=false;sound.ctx?.resume();sound.menuOn(false);}});window.addEventListener('pagehide',()=>{pause();if(game)save();});
function layoutApp(){if(!renderer)return;const app=$('app'),col=renderer.cssCol;app.style.setProperty('--colw',col+'px');app.style.setProperty('--colx',Math.max(0,(app.clientWidth-col)/2)+'px');const tall=!!profile.settings.tall||renderer.actualTall;app.classList.toggle('tall',tall);app.classList.toggle('wide',renderer.pad>1);if(tall&&!jokeStarted)startJokes();}
let jokeStarted=false,jokeQ=jokeOrder(),jokeI=0;
function nextJoke(){const t=$('jokeText'),track=t.parentElement;t.textContent=JOKES[jokeQ[jokeI++%jokeQ.length]];const tw=track.clientWidth||300;t.style.setProperty('--tw',tw+'px');const dist=t.offsetWidth+tw;t.style.animation='none';void t.offsetWidth;t.style.animation='jokeScroll '+Math.max(9,dist/48)+'s linear 1 both';t.onanimationend=nextJoke;}
function startJokes(){jokeStarted=true;requestAnimationFrame(nextJoke);}
function resize(){renderer?.resize();layoutApp();if(window.innerWidth>window.innerHeight&&window.innerHeight<550)pause();if(game)renderer?.draw(game,0,profile.truck);}
window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);
let hudAccumulator=0,checkpointClock=0;function frame(now){const dt=clamp((now-lastTime)/1000,0,.04);lastTime=now;if(game&&state==='playing'){game.tick(dt);handleEvents();checkpointClock+=dt;if(checkpointClock>5){save();checkpointClock=0;}renderer.draw(game,dt,profile.truck);hudAccumulator+=dt;if(hudAccumulator>.05){updateHud();hudAccumulator=0;}}else if(game&&renderer?.highlight)renderer.draw(game,dt,profile.truck);requestAnimationFrame(frame);}
updateHome();
loadImages().then(images=>{renderer=new Renderer($('road'),images,profile.settings);layoutApp();$('tapPrompt').disabled=false;$('tapLabel').textContent='TAP TO START';updateHome();requestAnimationFrame(frame);}).catch(()=>$('loadError').classList.remove('hidden'));
if('serviceWorker'in navigator&&location.protocol.startsWith('http')&&!native())navigator.serviceWorker.register('./sw.js').catch(()=>{});

// Read-only QA surface on localhost; no extra players, scores or network endpoints.
if(['localhost','127.0.0.1'].includes(location.hostname))window.truckinQA={get game(){return game;},get profile(){return profile;},get renderer(){return renderer;},get state(){return state;},begin,pause,resume,openGarage,home};

module.exports={};

}};const cache={};function require(n){if(cache[n])return cache[n].exports;if(!modules[n])throw new Error('Missing '+n);const m={exports:{}};cache[n]=m;modules[n](m,m.exports,require);return m.exports;}require('./game.js');})();