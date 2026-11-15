/* TRUCKIN' & DRIVIN' — the road map.
   The world is an endless chain of SEGMENTS (3000 units each). A segment belongs to a BIOME (city, urban, country, highway) and is one of
   10 authored VARIANTS of that biome. Segments are joined in a shuffled order that never repeats a biome back to back, and every run starts
   at a different segment, so the route is never the same.  Every segment starts and ends on its biome's plain layout and blends smoothly from
   the previous segment (no square ends).

   Across the road there are always five lane slots (the truck's five positions, world x = 54 + 78 * lane). A slot is either DRIVABLE
   (road / bus lane / oncoming lane) or something else (closed for works, water, parked cars, central reservation, bridge parapet, verge ...).
   FEATURES (road works, bus lanes, a lake, a dual carriageway, parking, a bridge ...) change what the slots are over a stretch of road,
   with long tapers so a closing lane narrows like a real one. The model only ever sees the drivable bands, so everything that already
   works (hazard placement, pickups, fines, contact) keeps working.  */
const SEG=3900,RAMP_START=330;
const BIOMES=['city','urban','country','highway'];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
export function hash(n,seed=1){let x=Math.imul((n|0)^(seed|0),0x45d9f3b);x=Math.imul(x^(x>>>16),0x45d9f3b);return (x^(x>>>16))>>>0;}
const mulberry=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
export const LANE_W=78;
export const LANE_X0=15;
export const laneCentre=k=>54+78*k;

/* ----- lane states.  {drv,rk,fk}: drivable?, road kind (road|bus|oncoming) and what it looks like when it is not drivable ----- */
const R=()=>({drv:true,rk:'road',fk:'grass'});
const V=fk=>({drv:false,rk:'road',fk});
const BASE={city:[R(),R(),R(),R(),R()],urban:[R(),R(),R(),R(),R()],highway:[R(),R(),R(),R(),R()],country:[V('verge'),R(),R(),R(),V('verge')]};
const FARSIDE={city:'pavement',urban:'pavement',highway:'shoulder',country:'verge'};

/* ----- features ----- */
const edgeLanes=(side,n)=>Array.from({length:n},(_,i)=>side<0?i:4-i);
function makeFeature(type,side,rng,biome){
 const f={t:type,side,lanes:[],T:null,len:600,r:300,deco:type};
 const between=(a,b)=>a+Math.floor(rng()*(b-a+1));
 switch(type){
  case 'works':{const n=biome==='country'?1:between(1,2);f.lanes=edgeLanes(side,n);f.T=V('closed');f.len=between(380,620);f.r=n>1?340:270;break;}
  case 'bus':f.lanes=edgeLanes(side,1);f.T={drv:true,rk:'bus',fk:'grass'};f.len=between(450,720);f.r=70;break;
  case 'parking':f.lanes=edgeLanes(side,1);f.T=V('parked');f.len=between(380,600);f.r=220;break;
  case 'oncoming':{const n=biome==='country'||biome==='highway'?1:between(1,2);f.lanes=biome==='country'?[side<0?1:3]:edgeLanes(side,n);f.T={drv:true,rk:'oncoming',fk:'grass'};f.len=between(420,700);f.r=90;break;}
  case 'dual':f.lanes=[2];f.T=V('median');f.extra=[{lanes:edgeLanes(side,2),T:{drv:true,rk:'oncoming',fk:'grass'}}];f.len=between(450,720);f.r=150;break;
  case 'lake':{const n=between(2,3);f.lanes=edgeLanes(side,n+(biome==='country'?0:0));f.T=V('water');f.len=between(520,720);f.r=320;
   if(n===3)f.extra=[{lanes:[side<0?4:0],T:{drv:true,rk:'oncoming',fk:'verge'}}];else f.extra=[{lanes:[side<0?4:0],T:{drv:true,rk:'road',fk:'verge'}}];break;}
  case 'bridge':f.lanes=[0,4];f.T=V('barrier');f.len=between(380,520);f.r=180;break;
  case 'widen':f.lanes=[side<0?0:4];f.T={drv:true,rk:'road',fk:'verge'};f.len=between(400,560);f.r=260;break;
  case 'narrow':f.lanes=[side<0?1:3];f.T=V('hedge');f.len=between(400,560);f.r=240;break;
  case 'zebra':f.len=60;f.r=0;break;
  case 'junction':f.len=150;f.r=0;break;
 }
 return f;
}
const PALETTE={
 city:['bus','works','parking','dual','zebra','junction','oncoming','bridge','works','bus'],
 urban:['bus','works','parking','oncoming','zebra','junction','bridge','widen','works','bus'],
 country:['works','lake','oncoming','bridge','widen','narrow','lake','works','widen','narrow'],
 highway:['works','dual','oncoming','bridge','works','dual','works','bridge','dual','oncoming']
};
const recipeCache=new Map();
/* The authored layouts: variant v (0-9) of a biome is always the same stretch of road. */
export function recipe(biome,v){
 const key=biome+v;if(recipeCache.has(key))return recipeCache.get(key);
 const rng=mulberry(hash(BIOMES.indexOf(biome)*97+v*13+5,0xA11CE)),list=[];let z=560+Math.floor(rng()*160);
 const pal=PALETTE[biome],want=4+Math.floor(rng()*3);
 let last='';
 for(let i=0;i<want*2&&list.length<want;i++){
  let type=pal[Math.floor(rng()*pal.length)];if(type===last)type=pal[(pal.indexOf(type)+3)%pal.length];
  const side=rng()<.5?-1:1,f=makeFeature(type,side,rng,biome);
  const total=f.len+f.r*2;if(z+total>SEG-340)break;
  f.a=z+f.r;f.b=f.a+f.len;list.push(f);last=type;z+=total+30+Math.floor(rng()*150);
  // cosmetic crossings between the bigger features
  if(rng()<.55&&(biome==='city'||biome==='urban')&&z+260<SEG-420){const c=makeFeature(rng()<.5?'zebra':'junction',rng()<.5?-1:1,rng,biome);c.a=z;c.b=z+c.len;list.push(c);z+=c.len+260;}
 }
 const out={biome,v,features:list};recipeCache.set(key,out);return out;
}
const segCache=new Map();
export function segInfo(n,seed=1){
 n=Math.max(0,n|0);const key=seed+':'+n;if(segCache.has(key))return segCache.get(key);
 const cycle=Math.floor(n/4),bag=BIOMES.slice();
 for(let i=3;i>0;i--){const j=hash(cycle*31+i,seed)%(i+1);[bag[i],bag[j]]=[bag[j],bag[i]];}
 if(cycle>0){const prev=segInfo(cycle*4-1,seed).biome;if(bag[0]===prev)[bag[0],bag[1]]=[bag[1],bag[0]];}
 const biome=bag[n%4],variant=hash(n*7+BIOMES.indexOf(biome),seed^0x5bd1e995)%10,rc=recipe(biome,variant);
 const s={id:n,start:n*SEG,end:(n+1)*SEG,biome,variant,features:rc.features};
 segCache.set(key,s);if(segCache.size>400)segCache.delete(segCache.keys().next().value);return s;
}
/* Each run starts on the first plain stretch of a different segment, so the route is not the same twice. */
const offsetOf=seed=>(hash(seed,0xC0FFEE)%48)*SEG;

function blendLane(B,T,w){ // B base state, T target state, w 0..1 -> {o,rk,fk}
 if(B.drv&&T.drv)return {o:1,rk:w>.5?T.rk:B.rk,fk:B.fk};
 if(B.drv&&!T.drv)return {o:1-w,rk:B.rk,fk:T.fk};
 if(!B.drv&&T.drv)return {o:w,rk:T.rk,fk:B.fk};
 return {o:0,rk:'road',fk:w>.5?T.fk:B.fk};
}
export function lanesAt(zw,seed=1){
 const n=Math.floor(zw/SEG),s=segInfo(n,seed),lz=zw-s.start,base=BASE[s.biome];
 const lanes=base.map(b=>({o:b.drv?1:0,rk:b.rk,fk:b.fk}));
 // blend in from the previous segment's plain layout
 if(n>0&&lz<RAMP_START){const pb=BASE[segInfo(n-1,seed).biome],w=smooth(lz/RAMP_START);for(let k=0;k<5;k++)lanes[k]=blendLane(pb[k],base[k],w);}
 const active=[];
 for(const f of s.features){
  const w=f.r>0?smooth((lz-(f.a-f.r))/f.r)*smooth((f.b+f.r-lz)/f.r):(lz>=f.a&&lz<=f.b?1:0);
  if(w<=0||!f.T)continue;active.push(f);
  const apply=(lanesList,T)=>{for(const k of lanesList)if(base[k]&&(T.drv||base[k].drv||true)){const cur=lanes[k];const B=base[k];lanes[k]=blendLane(B,T,w);if(cur.o!==undefined&&B.drv===false&&!T.drv)lanes[k].fk=w>.5?T.fk:B.fk;}};
  apply(f.lanes,f.T);for(const e of f.extra||[])apply(e.lanes,e.T);
 }
 return {lanes,seg:s,lz,active};
}
const GAP=.02;
function bandsFrom(lanes){
 const bands=[];let k=0;
 while(k<5){
  if(lanes[k].o<=GAP){k++;continue;}
  const rk=lanes[k].rk;let j=k;while(j+1<5&&lanes[j+1].o>.999&&lanes[j+1].rk===rk)j++;
  const sl=LANE_X0+LANE_W*k,sr=LANE_X0+LANE_W*(j+1);
  bands.push({left:sl+LANE_W*(1-lanes[k].o),right:sr-LANE_W*(1-lanes[j].o),surface:'asphalt',rule:rk==='bus'?'bus':rk==='oncoming'?'oncoming':'',branch:'main',rk,lanes:[k,j]});
  k=j+1;
 }
 return bands;
}
const mapCache=new Map();
/* Everything the game needs to know about the road at distance z (same shape as the old route-world roadAt, plus the map). */
export function mapAt(z,seed=1){
 z=Math.max(0,z);const zw=z+offsetOf(seed),q=Math.round(zw*4)/4,key=seed+':'+q;
 let r=mapCache.get(key);if(r)return r;
 const {lanes,seg,lz,active}=lanesAt(zw,seed),bands=bandsFrom(lanes);
 r={id:Math.floor(zw/SEG)-Math.floor(offsetOf(seed)/SEG),worldId:seg.id,start:z-lz,end:z-lz+SEG,motif:'map',biome:seg.biome,variant:seg.variant,side:0,restricted:'',prizeSide:'',signZ:-1e9,decisionZ:-1e9,
  p:lz,gate:0,bands,sign:null,lanes,features:active.map(f=>f.t),zw};
 mapCache.set(key,r);if(mapCache.size>5000)mapCache.delete(mapCache.keys().next().value);return r;
}
/* What is under the wheel at world x: {kind,onRoad,rk,beyond}. kind = the surface or obstacle there. */
export function terrainAt(x,z,seed=1){
 const r=mapAt(z,seed);
 for(const b of r.bands)if(x>=b.left&&x<=b.right)return {kind:b.rk,onRoad:true,rule:b.rule,beyond:0,route:r};
 const k=clamp(Math.floor((x-LANE_X0)/LANE_W),0,4),l=r.lanes[k];
 let edgeDist=Infinity;for(const b of r.bands)edgeDist=Math.min(edgeDist,x<b.left?b.left-x:x-b.right);
 return {kind:l.fk,onRoad:false,rule:'',beyond:edgeDist,route:r};
}
export const segLength=SEG;
export const biomeAt=(z,seed=1)=>mapAt(z,seed).biome;

/* ----- roadside ----- */
const STYLE={
 city:['tower','shops','flats','tower','shops'],
 urban:['terrace','terrace','semi','semi','terrace','flats','park'],
 country:['hedge','hedge','field','cottage','hedge','wood','barn','wall'],
 highway:['embank','wood','noise','embank','embank','wood']
};
const PAVE={city:50,urban:58,country:22,highway:64};
export function sideStyle(zw,side,seed=1){
 const n=Math.floor(zw/SEG),s=segInfo(n,seed),lz=zw-s.start;let biome=s.biome;
 if(lz<RAMP_START&&n>0&&hash(Math.floor(zw/110),seed+side)%100<(1-lz/RAMP_START)*100)biome=segInfo(n-1,seed).biome;   // suburban fringe: the old biome fades out
 const lanes=lanesAt(zw,seed).lanes,outer=lanes[side<0?0:4],second=lanes[side<0?1:3];
 const cell=Math.floor(zw/380);
 if(outer.fk==='water'&&outer.o<.5)return {biome,style:'shore',pave:20};
 if(outer.fk==='barrier'&&outer.o<.5)return {biome,style:'river',pave:20};
 const opts=STYLE[biome],style=opts[hash(cell*5+(side>0?3:1),seed^0x77)%opts.length];
 return {biome,style,pave:PAVE[biome]};
}
const CELL=192;
/* Building and tree lots along both sides: deterministic, each facing the road. */
export function lotsAt(z0,z1,seed=1){
 const off=offsetOf(seed),out=[];
 for(let n=Math.floor((z0+off)/CELL);n<=Math.ceil((z1+off)/CELL);n++){
  if(n<0)continue;
  for(const side of[-1,1]){
   const zw=n*CELL,st=sideStyle(zw+CELL/2,side,seed),h=hash(n*13+(side>0?7:3),seed^0x91);
   const v=h%7,tall=st.style==='tower'?280+(h>>>3)%140:st.style==='flats'?190+(h>>>3)%50:st.style==='barn'?130:st.style==='noise'?90:st.style==='wall'?40:st.style==='hedge'?52:st.style==='embank'?54:st.style==='cottage'?118+(h>>>4)%24:st.style==='shops'?150+(h>>>3)%36:st.style==='semi'?138+(h>>>5)%22:150+(h>>>5)%30;
   const setback=st.style==='semi'||st.style==='terrace'?30:0;
   const gap=['terrace','shops','tower','flats','hedge','wall','noise','embank'].includes(st.style)?0:20+(h>>>9)%40;
   out.push({id:n+':'+side,z:zw-off+gap/2,len:CELL-gap,side,style:st.style,biome:st.biome,v,h:tall,
    x:side<0?LANE_X0-st.pave-setback:LANE_X0+LANE_W*5+st.pave+setback,pave:st.pave,hs:h});
  }
 }
 return out;
}
/* Painted-in road dressing: cones along closures, parked cars, bus shelters, crossings. */
export function decoAt(z0,z1,seed=1){
 const off=offsetOf(seed),out=[];
 for(let n=Math.floor((z0+off)/SEG);n<=Math.floor((z1+off)/SEG);n++){
  if(n<0)continue;const s=segInfo(n,seed);
  for(const f of s.features){
   const a=s.start+f.a-f.r-off,b=s.start+f.b+f.r-off;if(b<z0||a>z1)continue;
   const sideX=f.side<0?LANE_X0:LANE_X0+LANE_W*5;
   if(f.t==='works'){
    const a0=s.start+f.a-f.r-off,b0=s.start+f.b+f.r-off;
    for(let z=Math.ceil(a0/40)*40;z<=b0;z+=40){const r=mapAt(z,seed),L=r.bands.length?Math.min(...r.bands.map(b=>b.left)):LANE_X0,Rr=r.bands.length?Math.max(...r.bands.map(b=>b.right)):LANE_X0+LANE_W*5;
     out.push({type:'cone',x:f.side<0?L:Rr,z,id:Math.round(z)});}
    const mz=s.start+f.a+f.len*.45-off,cl=f.lanes.reduce((a,k)=>a+laneCentre(k),0)/f.lanes.length;out.push({type:'digger',x:cl,z:mz,id:Math.round(mz)});
    out.push({type:'barrier',x:cl,z:s.start+f.a-off+30,id:Math.round(mz)+1});
   }else if(f.t==='parking'){
    for(let z=Math.ceil((s.start+f.a-off)/66)*66;z<=s.start+f.b-off;z+=66){const hh=hash(Math.round(z),seed);if(hh%5===0)continue;out.push({type:'car',x:laneCentre(f.lanes[0]),z,id:hh,parked:true});}
   }else if(f.t==='bus'){
    out.push({type:'busstop',x:f.side<0?LANE_X0-24:LANE_X0+LANE_W*5+24,z:s.start+f.a+f.len*.55-off,id:f.a,side:f.side});
   }else if(f.t==='zebra'||f.t==='junction'){
    out.push({type:f.t,x:f.side<0?LANE_X0:LANE_X0+LANE_W*5,z:s.start+f.a-off,len:f.len,id:f.a,side:f.side});
   }
  }
 }
 return out;
}
