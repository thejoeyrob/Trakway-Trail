/* Behind-the-truck camera ("chase cam"). A pseudo-3D road drawn row by row, using exactly the same game (Drive model, route-world road bands, hazards,
   pickups, collisions) as the top-down view. Only the camera changes. The truck is ChatGPT's rear-above sprite from the showroom sheet. */
import {Renderer} from './render.js';
import {roadAt} from './route-world.js';
import {lotsAt,decoAt,mapAt} from './route-map.js';
import {facadeTexture} from './facades.js';
import {roadTheme,laneX} from './geometry.js';
import {ROUTE_ATLAS} from './route-atlas.js';
import {PAINTS,hueShift,tintBody,DECAL_PAINT} from './rigart.js';
import {HAZARD_SPECS} from './route-hazards.js';
import {PAINTED} from './chase-atlas.js';
import {ART,SIZE} from './chaseart.js';
import {ChaseFinishPro} from './chase-finish-pro.js';
import {ChaseDetailPro} from './chase-detail-pro.js';
import {ChaseWorldPro} from './chase-world-pro.js';
const CAMBACK=260,FAR=2400,TAU=Math.PI*2;
const GCOL={city:[168,162,152],urban:[96,160,70],country:[88,150,62],highway:[80,140,62]},GPAT={city:7,urban:12,country:3,highway:3},PAVE={city:50,urban:58,country:22,highway:64},NOFACADE=['park','wood','field','shore','river'];
const GROUND_PAT=[7,3,12,11],ASPHALT=0,MUD=5,WATER=14,LANE=78,L0=15;   // surface-atlas cells used for the ground, road, mud and river
const CAB_COL=['#d6dde2','#f2f2ee','#e0601c','#6a2fb8','#b02a24','#2a8a44'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const rgb=c=>'rgb('+c[0]+','+c[1]+','+c[2]+')';
const THEME_GROUND=[[160,154,144],[82,158,58],[92,170,66],[201,166,107]];   // town paving, country grass, suburban lawn, building-site sand
const HAZE=[222,233,226];
const FLAT={pit:1,mud:1,oil:1,grass:1};
export class ChaseRenderer extends Renderer{
 maxDpr=1.5;
 resize(){super.resize();this.yT=this.H*(this.yTf||.8);this.playerY=this.yT-120;this.worldScale=.72;this.camX=this.camX||210;}
 /* screen x of a lane at the truck's depth (used for cash pop-ups and night lights) */
 x(lane){return 210+(54+78*lane-(this.camX||210));}
 project(lane,z,rawX){const g=this.g,zr=z-(g.distance-CAMBACK),sc=CAMBACK/zr,wx=rawX??(54+78*lane);return {x:210+(wx-this.camX)*sc,y:this.y0+this.A/zr,s:sc};}
 billboard(c,key,w,h,t,id=0){
  const variants={car:['car','carBlue','carVan'],house:['house','cottage'],shop:['shop','pub'],
   garage:['garage','barn'],tree:['tree','poplar']};
  const options=variants[key];
  const variant=options?options[hash2(id)%options.length]:key;
  const rect=PAINTED[variant];
  const image=rect&&this.images[rect[0]];
  if(!image){ART[key]?.(c,w,h,t,{id});return false;}
  const [,sx,sy,sw,sh]=rect;
  const scale=Math.min(w/sw,h/sh);
  const width=sw*scale,height=sh*scale;
  c.drawImage(image,sx,sy,sw,sh,-width/2,-height,width,height);
  if(key==='lowbridge'||key==='weakbridge'){
   c.font='800 '+Math.max(3,height*.065)+'px sans-serif';
   c.textAlign='center';
   c.fillStyle='#221912';
   c.fillText(key==='lowbridge'?'3.9m':'7.5t',0,-height*.88);
  }
  return true;
 }
 truckSprite(g){
  const key=[g.truck,g.trailerPaint,g.decal,g.trailerDecal].join(':');if(this._ts&&this._ts.key===key)return this._ts.c;
  const img=this.images.routeShowroom,rect=ROUTE_ATLAS.showroom.rects[4];if(!img)return null;
  let c=document.createElement('canvas');c.width=rect[2];c.height=rect[3];c.getContext('2d').drawImage(img,...rect,0,0,rect[2],rect[3]);
  try{const P=PAINTS[g.truck]||PAINTS[0];if(P.cab.hue||P.cab.sat!==undefined||P.cab.white)hueShift(c,P.cab);
   else if(P.cab.sprite===1||P.cab.sprite===2){hueShift(c,{hue:P.cab.sprite===1?-150:100,sat:1});}
   const TP=PAINTS[g.trailerPaint??1];
   if(TP?.tint){
    const body=document.createElement('canvas');
    body.width=c.width;body.height=c.height-35;
    const ctx=body.getContext('2d');
    ctx.drawImage(c,0,35,c.width,body.height,0,0,c.width,body.height);
    tintBody(body,TP.tint);
    const target=c.getContext('2d');
    target.clearRect(0,35,c.width,body.height);
    target.drawImage(body,0,35);
   }}catch(e){}
  const dp=DECAL_PAINT[g.trailerDecal];if(dp){try{const x=c.getContext('2d');x.save();x.globalCompositeOperation='source-atop';x.beginPath();x.rect(20,70,107,150);x.clip();dp(x,20,70,107,150,'trailer',this);x.restore();}catch(e){}}
  const cabDecal=DECAL_PAINT[g.decal];
  if(cabDecal)cabDecal(c.getContext('2d'),38,6,72,26,'cab',this);
  this._ts={key,c};return c;
 }
 /* The detached cab: the painted roof, deflector and beacons cut from ChatGPT's top view of the same tractor unit (flipped, so we look at it
    from behind), recoloured with the same paint recipe as the full rig; the rear wall, chassis and wheels are drawn to match its colour. */
 cabSprite(g){
  const key='cab:'+[g.truck,g.decal].join(':');if(this._cs&&this._cs.key===key)return this._cs;
  const img=this.images.routeShowroom,rect=ROUTE_ATLAS.showroom.rects[0];if(!img)return null;
  const sy=146,sh=76,c=document.createElement('canvas');c.width=rect[2];c.height=sh;const x=c.getContext('2d');x.translate(0,sh);x.scale(1,-1);x.drawImage(img,rect[0],rect[1]+sy,rect[2],sh,0,0,rect[2],sh);
  let col=CAB_COL[g.truck]||CAB_COL[0];
  try{const P=PAINTS[g.truck]||PAINTS[0];if(P.cab.hue||P.cab.sat!==undefined||P.cab.white)hueShift(c,P.cab);
   else if(P.cab.sprite===1||P.cab.sprite===2){hueShift(c,{hue:P.cab.sprite===1?-150:100,sat:1});}
   const d=c.getContext('2d').getImageData(rect[2]*.5|0,sh*.45|0,1,1).data;if(d[3]>200)col='rgb('+d[0]+','+d[1]+','+d[2]+')';}catch(e){}
  const cd=DECAL_PAINT[g.decal];if(cd){try{cd(c.getContext('2d'),38,12,94,34,'cab',this);}catch(e){}}
  this._cs={key,c,col};return this._cs;
 }
 draw(g,dt,truckIndex){
  {const e=this._ema=(this._ema||.016)*.94+Math.min(.1,dt||.016)*.06,q=e>.034?2:e>.024?1:0;if((this.q||0)<q){this.q=q;this.maxDpr=q>1?1:1.25;this.resize();}}
  this.g=g;const c=this.ctx,pad=this.pad,W=420+2*pad,H=this.H;this.time+=dt;
  const y0=this.y0=H*(this.y0f||.31),A=this.A=(this.yT-y0)*CAMBACK,camZ=g.distance-CAMBACK,tx=laneX(g.x,g.distance);
  const camX=this.camX=210+(tx-210)*.55,cx=210,seed=g.seed;
  this.finishPro ||= new ChaseFinishPro(this);this.finishPro.begin(g,dt);
  this.detailPro ||= new ChaseDetailPro(this);
  this.worldPro ||= new ChaseWorldPro(this);
  c.save();if(this.shake>0&&this.settings.motion){c.translate((Math.random()-.5)*this.shake,(Math.random()-.5)*this.shake);this.shake*=Math.exp(-dt*12);}
  // ---- cinematic sky, atmospheric depth, far scenery ----
  {const cv=this.canvas,key=mapAt(camZ+1150,g.seed).biome+(g.night?'n':'d')+cv.width+'x'+cv.height;
   if(!this._sky||this._sky.width!==cv.width||this._sky.height!==cv.height){this._sky=document.createElement('canvas');this._sky.width=cv.width;this._sky.height=cv.height;this._skyKey='';}
   if(this._skyKey!==key||(this._skyN=(this._skyN||0)+1)%4===0){const sc2=this._sky.getContext('2d');sc2.setTransform(1,0,0,1,0,0);sc2.clearRect(0,0,cv.width,cv.height);sc2.setTransform(c.getTransform());this.worldPro.sky(sc2,{g,camZ,y0,W,pad,cx});this._skyKey=key;}
   c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(this._sky,0,0);c.restore();}
  const LL=15,RR=405,marks=[];for(const d of decoAt(camZ,camZ+FAR*3,seed)){if(d.type==='zebra')marks.push({t:'zebra',z0:d.z,z1:d.z+d.len,side:d.side});else if(d.type==='junction')marks.push({t:'junction',z0:d.z,z1:d.z+d.len,side:d.side});}
  // ---- the ground and the road, row by row. The road never bends or sways: five fixed lanes. A lane is tarmac where the map has a
  //      drivable surface under it, and grass or river where it doesn't (that is the hazard: you have to move over). ----
  {const cv=this.canvas,RS=(this.q||0)>0?.5:.62,rw=Math.round(cv.width*RS),rh=Math.round(cv.height*RS);   // the ground and road are drawn at reduced resolution (fill-rate), the painted sprites stay sharp
   if(!this._rows||this._rows.width!==rw||this._rows.height!==rh){this._rows=document.createElement('canvas');this._rows.width=rw;this._rows.height=rh;}
   const rc=this._rows.getContext('2d');rc.setTransform(1,0,0,1,0,0);rc.clearRect(0,0,rw,rh);const T=c.getTransform();rc.setTransform(T.a*RS,T.b*RS,T.c*RS,T.d*RS,T.e*RS,T.f*RS);
   {const c=rc;
  let curYt=0,curHh=0;const Tm=rc.getTransform(),SS=Tm.d,FF=Tm.f,snap=v=>(Math.round(v*SS+FF)-FF)/SS;
  const fogRows=[],step=(this.q||0)>0?4:H>850?3:2,pats=this.world&&this.world.patterns&&this.world.patterns.length?this.world.patterns:null,kinds=[0,0,0,0,0];
  const fillSpan=(pi,col,x1,x2,y,sn,zw,zr,wob)=>{
   if(x2<=x1)return;const p=sn<(pi===ASPHALT?.2:.28)?null:pats&&pats[pi];
   if(p){const K=pi===WATER?1.6:pi===ASPHALT?2.1:1.9,d=-A/(zr*zr)/K,v=((zw+(wob||0))*K)%256;p.setTransform({a:sn/K,b:0,c:0,d,e:cx-camX*sn,f:y-v*d});c.fillStyle=p;}else c.fillStyle=col;
   c.fillRect(x1,curYt,x2-x1,curHh);};
  for(let y=H;y>y0+3;y-=step){
   const yt=snap(y-step),hh=snap(y)-yt;curYt=yt;curHh=hh;
   const zn=A/(y-y0),zf=A/(yt-y0);if(zf>FAR*9)break;const zm=(zn+zf)/2,zw=camZ+zm,sn=CAMBACK/zn,fog=Math.min(1,Math.pow(zm/FAR,1.7));
   const a=roadAt(zw,seed),bs=a.bands,ln=a.lanes,biome=a.biome,X=u=>cx+(u-camX)*sn,lw=Math.max(1.1,2.2*sn),dash=Math.floor(zw/55)%2===0,pv=PAVE[biome];
   fillSpan(GPAT[biome]===7?7:GPAT[biome],rgb(GCOL[biome]),-pad,420+pad,y,sn,zw,zm);
   this.worldPro.groundDetail(c,{th:biome==='city'?0:biome==='country'?1:2,y,zw,sn,fog,pad});
   // roadside strips beyond the five lanes: pavement and kerb in towns, a grass verge in the country, a hard shoulder on the motorway; river beyond a bridge or lake
   for(const side of[-1,1]){const outer=ln[side<0?0:4],e=side<0?LL:RR;let jn=false;for(const m of marks)if(m.t==='junction'&&m.side===side&&zw>=m.z0&&zw<=m.z1)jn=true;
    const wet=(outer.fk==='water'||outer.fk==='barrier')&&outer.o<.5;
    if(wet){const x1=side<0?-pad-60:X(e),x2=side<0?X(e):420+pad+60;fillSpan(WATER,'#2f7aa6',x1,x2,y,sn,zw,zm,Math.sin(this.time*1.3+zw*.02)*7+this.time*14);c.fillStyle='rgba(40,150,215,.38)';c.fillRect(x1,yt,x2-x1,hh);continue;}
    const xa=side<0?X(e-pv):X(e),xb=side<0?X(e):X(e+pv);
    if(jn){fillSpan(ASPHALT,'#42454a',side<0?-pad-60:X(e),side<0?X(e):420+pad+60,y,sn,zw,zm);continue;}
    if(biome==='city'){c.fillStyle='rgb(196,190,178)';c.fillRect(xa,yt,xb-xa,hh);if(Math.floor(zw/34)%2){c.fillStyle='rgba(120,114,104,.30)';c.fillRect(xa,yt,xb-xa,hh);}}
    else if(biome==='urban'){const pw=26,xm=side<0?X(e-pw):X(e+pw);c.fillStyle='rgb(190,184,172)';c.fillRect(side<0?xm:xa,yt,Math.abs(xm-xa),hh);}
    else if(biome==='country'){c.fillStyle='rgb(112,168,76)';c.fillRect(xa,yt,xb-xa,hh);}
    else{c.fillStyle='rgb(92,94,98)';c.fillRect(xa,yt,xb-xa,hh);c.fillStyle='#f4f1e6';c.fillRect(side<0?X(e)-lw*1.6:X(e)+lw*.6,yt,lw,hh);}
    if(biome==='city'||biome==='urban'){const kb=Math.max(2,5*sn);c.fillStyle='rgb(150,147,142)';c.fillRect(side<0?X(e)-kb:X(e),yt,kb,hh);c.fillStyle='rgb(104,102,98)';c.fillRect(side<0?X(e)-kb*.3:X(e),yt,kb*.3,hh);}
   }
   // lane slots that are not (fully) road: water, works, parked cars, central reservation, parapets, verge
   for(let k=0;k<5;k++){const Lk=ln[k];if(Lk.o>=.999)continue;const fk=Lk.fk,x1=X(LL+LANE*k),x2=X(LL+LANE*(k+1)),ex=side=>0;
    if(fk==='water')fillSpan(WATER,'#2f7aa6',x1,x2,y,sn,zw,zm,Math.sin(this.time*1.3+zw*.02)*7+this.time*14),(c.fillStyle='rgba(40,150,215,.38)',c.fillRect(x1,yt,x2-x1,hh));
    else if(fk==='closed'){fillSpan(ASPHALT,'#3a3d42',x1,x2,y,sn,zw,zm);c.fillStyle='rgba(240,150,40,.16)';c.fillRect(x1,yt,x2-x1,hh);}
    else if(fk==='parked'){fillSpan(ASPHALT,'#3d4046',x1,x2,y,sn,zw,zm);if(Math.floor(zw/66)%1===0&&Math.floor(zw/22)%3===0){c.fillStyle='rgba(244,241,230,.55)';c.fillRect(x1,yt,x2-x1,Math.max(.8,step*.45));}}
    else if(fk==='median'){c.fillStyle='rgb(78,128,60)';c.fillRect(x1,yt,x2-x1,hh);const kb=Math.max(2,5*sn);c.fillStyle='rgb(176,172,164)';c.fillRect(x1,yt,kb,hh);c.fillRect(x2-kb,yt,kb,hh);}
    else if(fk==='barrier'){c.fillStyle='rgb(176,174,168)';c.fillRect(x1,yt,x2-x1,hh);c.fillStyle='rgb(120,118,112)';c.fillRect(x1,yt,Math.max(1.5,4*sn),hh);}
    else if(fk==='hedge'){c.fillStyle='rgba(36,84,34,.62)';c.fillRect(x1,yt,x2-x1,hh);}
   }
   // tarmac, bus lanes and oncoming lanes: the real drivable bands (edges taper smoothly where the road narrows or widens)
   for(const bd of bs){const L=bd.left,R=bd.right,xl=X(L),xr=X(R);if(xr<=xl)continue;
    fillSpan(ASPHALT,'#42454a',xl,xr,y,sn,zw,zm);
    if(bd.rule==='bus'){c.fillStyle='rgba(178,48,42,.55)';c.fillRect(xl,yt,xr-xl,hh);}
    // water bank where a band meets a lake
    for(const [side,xe] of[[-1,xl],[1,xr]]){const k=side<0?bd.lanes[0]-1:bd.lanes[1]+1;if(k>=0&&k<5&&ln[k].fk==='water'&&ln[k].o<.5){c.fillStyle=rgb(mix([98,128,72],HAZE,fog*.8));c.fillRect(side<0?xe-14*sn:xe,yt,14*sn,hh);}}
    // edge lines (not against a kerb)
    const atKerb=(biome==='city'||biome==='urban');
    if(!(atKerb&&L<=LL+1)){c.fillStyle='#f4f1e6';c.fillRect(xl+lw*.6,yt,lw,hh);}
    if(!(atKerb&&R>=RR-1)){c.fillStyle='#f4f1e6';c.fillRect(xr-lw*1.6,yt,lw,hh);}
    this.worldPro.roadDetail(c,{X,kind:1,k:Math.max(0,Math.ceil((L-54)/LANE)),j:Math.min(4,Math.floor((R-54)/LANE)),xl,xr,y,step,zw,sn,fog});}
   // lane lines: dashed white between same-way lanes, double yellow against oncoming traffic, solid white beside a bus lane
   for(let m=1;m<5;m++){if(ln[m-1].o<.5||ln[m].o<.5)continue;const u=LL+LANE*m,ra=ln[m-1].rk,rb=ln[m].rk,x=X(u);
    if(ra===rb){if(dash){c.fillStyle='rgba(244,241,230,.9)';c.fillRect(x-lw/2,yt,lw,hh);}}
    else if(ra==='oncoming'||rb==='oncoming'){c.fillStyle='#f0c52e';c.fillRect(x-lw*1.4,yt,lw,hh);c.fillRect(x+lw*.4,yt,lw,hh);}
    else{c.fillStyle='#f4f1e6';c.fillRect(x-lw/2,yt,lw,hh);}}
   // zebra crossings: bars along the road, gaps between
   for(const m of marks)if(m.t==='zebra'&&zw>=m.z0&&zw<=m.z1){c.fillStyle='rgba(248,246,238,.92)';for(const bd of bs)for(let u=Math.ceil(bd.left/16)*16;u<bd.right-8;u+=16){const x=X(u);c.fillRect(x,yt,Math.max(1,8*sn),hh);}}
   fogRows.push(yt,fog,hh,zw);
  }
  // fog as a second pass over the finished rows (no seams between rows); rows with the same fog level are merged into one fill
  {const Q=28;let runA=-1,runTop=0,runBot=0;const flush=()=>{if(runA>0){c.fillStyle=(g.night?'rgba(51,70,91,':'rgba(222,233,226,')+(runA/Q*.97).toFixed(3)+')';c.fillRect(-pad-60,runTop,W+120,runBot-runTop);}};
   for(let i=0;i<fogRows.length;i+=4){const yt=fogRows[i],hh=fogRows[i+2],q=Math.round(Math.min(1,fogRows[i+1]*.95)*Q);
    if(q===runA&&Math.abs(runTop-(yt+hh))<.001){runTop=yt;}else{flush();runA=q;runTop=yt;runBot=yt+hh;}}
   flush();}
   }
   c.save();c.setTransform(1,0,0,1,0,0);c.imageSmoothingEnabled=true;c.drawImage(this._rows,0,0,rw,rh,0,0,cv.width,cv.height);c.restore();}
  // haze over the far distance
  this.worldPro.farHaze(c,{g,y0,W,pad});
  // ---- everything that stands on the road, far to near ----
  const L=[];
  for(const lot of lotsAt(camZ+CAMBACK-200,camZ+FAR,seed)){const zr=lot.z+lot.len*.5-camZ;if(zr<40||lot.z+lot.len-camZ<48)continue;
   let skip=false;for(const m of marks)if(m.t==='junction'&&m.side===lot.side&&lot.z+lot.len>m.z0-10&&lot.z<m.z1+10)skip=true;if(!skip)L.push({zr,k:'lot',lot});}
  for(const d of decoAt(camZ+CAMBACK-60,camZ+FAR,seed)){if(d.type==='zebra'||d.type==='junction')continue;const zr=d.z-camZ;if(zr<CAMBACK-40)continue;L.push({zr,k:'deco',d});}
  for(const e of g.items){if(e.done)continue;const zr=e.z-camZ;if(zr<CAMBACK-30||zr>FAR)continue;L.push({zr,k:'item',e});}
  if(g.sheep){const zr=g.sheep.z-camZ;if(zr>CAMBACK-30&&zr<FAR)L.push({zr,k:'herd',s:g.sheep});}
  for(const d of g.leaving||[]){const zr=d.z-camZ;if(zr>CAMBACK-30&&zr<FAR)L.push({zr,k:'leaving',d});}
  L.push({zr:CAMBACK,k:'truck'});
  L.sort((a,b)=>b.zr-a.zr);
  for(const o of L){
   const sc=CAMBACK/o.zr,y=y0+A/o.zr,fog=Math.min(1,Math.pow(o.zr/FAR,1.4));
   if(o.k==='truck'){this.drawTruck(g,cx+(tx-camX),y,dt);continue;}
   c.save();c.globalAlpha=1-fog*.85;
   const sh=0;
   if(o.k==='lot')this.drawLot(c,o.lot,camZ,fog);
   else if(o.k==='deco')this.drawDeco(c,o.d,cx+(o.d.x-camX)*sc,y,sc,o.zr);
   else if(o.k==='scenery')this.drawScenery(c,o.p,cx+(o.p.x+sh-camX)*sc,y,sc);
   else if(o.k==='item')this.drawItem(c,o.e,cx+(laneX(o.e.lane,o.e.z)+sh-camX)*sc,y,sc,o.zr);
   else if(o.k==='herd'){const s=o.s;for(let i=0;i<5;i++){let wx=54+78*i+sh,off=0;if(s.cleared)off=(i<2?-1:1)*Math.max(0,(g.time-s.baaAt-.3))*140;const bx=cx+(wx+off-camX)*sc,sz=SIZE[s.kind==='cows'?'cow':'sheep'];c.save();c.translate(bx,y);this.billboard(c,s.kind==='cows'?'cow':'sheep',sz[0]*sc,sz[1]*sc,this.time+i,i);c.restore();}}
   else if(o.k==='leaving'){const d=o.d,sz=SIZE[d.type]||[50,50];c.globalAlpha=Math.max(0,1-d.age/1.4);c.save();c.translate(cx+(laneX(d.lane,d.z)+sh+d.dir*d.age*130-camX)*sc,y);this.billboard(c,d.type,sz[0]*sc,sz[1]*sc,this.time*3,7);c.restore();}
   c.restore();
  }
  if(!g.night){ // grade: warm sun from the upper right, darker corners
   const gr=c.createLinearGradient(W,0,W*.25,H*.6);gr.addColorStop(0,'rgba(255,226,160,.16)');gr.addColorStop(1,'rgba(255,226,160,0)');c.fillStyle=gr;c.fillRect(-pad,0,W,H);
   const vg=c.createRadialGradient(W/2-pad,H*.55,H*.28,W/2-pad,H*.55,H*.82);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(8,14,24,.34)');c.fillStyle=vg;c.fillRect(-pad,0,W,H);}
  this.nightLight(g);
  this.finishPro.after(c,g,{H,W,pad,y0,cx});
  // floating text / sparkles (cash, fines)
  for(const f of this.fx){f.age+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.kind!=='text')f.vy+=190*dt;const al=Math.max(0,Math.min(1,1-f.age/f.life));
   if(f.kind==='text'){c.save();c.globalAlpha=al;this.label(f.text,f.x,f.y,'#fff0ad',17);c.restore();}else{c.save();c.globalAlpha=al;c.fillStyle=f.kind==='loss'?'#ff6a5a':'#ffd23f';c.beginPath();c.arc(f.x,f.y,4,0,TAU);c.fill();c.restore();}}
  this.fx=this.fx.filter(f=>f.age<f.life);
  // crash freeze ring
  if(this.highlight){const h=this.highlight,t=this.time-h.t0,pulse=1+Math.sin(t*9)*.08;
   if(h.item&&ART[h.item.type]){const sz=SIZE[h.item.type]||[50,50];c.save();c.translate(h.x,h.y+h.ry*.9);this.billboard(c,h.item.type,sz[0]*1.5,sz[1]*1.5,this.time,h.item.id);c.restore();}   // the thing you hit, in front
   c.save();c.strokeStyle='#ff4b3a';c.lineWidth=4;c.shadowColor='#ff4b3a';c.shadowBlur=14;c.beginPath();c.ellipse(h.x,h.y,h.rx*pulse,h.ry*pulse,0,0,TAU);c.stroke();c.shadowBlur=0;
   c.font='900 15px -apple-system,sans-serif';c.textAlign='center';const w=c.measureText(h.label).width+26,ly=Math.max(30,h.y-h.ry-30),lx=Math.min(420-w/2-8,Math.max(w/2+8,h.x));c.fillStyle='#1c0b0b';c.strokeStyle='#ff4b3a';c.lineWidth=2.5;c.beginPath();c.roundRect(lx-w/2,ly-17,w,28,9);c.fill();c.stroke();c.fillStyle='#fff3e0';c.fillText(h.label,lx,ly+3);c.restore();}
  c.restore();
 }
 /* Night driving from behind: everything is dark except the headlight beams thrown up the road. How far the beam reaches depends on the
    light-bar upgrade, so the standard lights show just enough road to play on and every upgrade buys a longer view. */
 nightLight(g){
  if(!g.night)return;const c=this.ctx,pad=this.pad,full=Math.ceil(420+2*pad),H=this.H,L=Math.min(3,g.upgrades&&g.upgrades.lights||0);
  if(!this.dark)this.dark=document.createElement('canvas');if(this.dark.width!==full)this.dark.width=full;if(this.dark.height!==Math.ceil(H))this.dark.height=Math.ceil(H);
  const m=this.dark.getContext('2d');m.setTransform(1,0,0,1,0,0);m.clearRect(0,0,full,H);m.fillStyle='rgba(4,9,26,.90)';m.fillRect(0,0,full,H);
  const D=[460,680,950,1350][L],spread=.22+.04*L,hw0=44+6*L,y0=this.y0,A=this.A,tx=210+(laneX(g.x,g.distance)-this.camX)+pad;
  const yN=this.yT+34,yF=y0+A/(CAMBACK+D),swF=(hw0+D*spread)*CAMBACK/(CAMBACK+D),swN=hw0+34*.2;
  m.globalCompositeOperation='destination-out';
  for(const [k,al] of[[1.5,.28],[1.2,.5],[1,.95]]){const gr=m.createLinearGradient(0,yN,0,yF);gr.addColorStop(0,'rgba(0,0,0,'+al+')');gr.addColorStop(.55,'rgba(0,0,0,'+al*.62+')');gr.addColorStop(1,'rgba(0,0,0,0)');
   m.fillStyle=gr;m.beginPath();m.moveTo(tx-swN*k,yN);m.lineTo(tx+swN*k,yN);m.lineTo(tx+swF*k,yF);m.lineTo(tx-swF*k,yF);m.closePath();m.fill();}
  const gr2=m.createRadialGradient(tx,this.yT-20,6,tx,this.yT-20,96);gr2.addColorStop(0,'rgba(0,0,0,.95)');gr2.addColorStop(1,'rgba(0,0,0,0)');m.fillStyle=gr2;m.fillRect(tx-100,this.yT-120,200,200);
  m.globalCompositeOperation='source-over';
  c.drawImage(this.dark,-pad,0,full,H);
  // warm glow where the beams land
  c.save();c.globalCompositeOperation='screen';const wg=c.createLinearGradient(0,yN,0,yF);wg.addColorStop(0,'rgba(255,226,150,.16)');wg.addColorStop(1,'rgba(255,226,150,0)');c.fillStyle=wg;c.beginPath();c.moveTo(tx-pad-swN,yN);c.lineTo(tx-pad+swN,yN);c.lineTo(tx-pad+swF,yF);c.lineTo(tx-pad-swF,yF);c.closePath();c.fill();c.restore();
 }
 drawTruck(g,x,y,dt){
  const c=this.ctx,bare=g.hasTrailer===false,img=bare?null:this.truckSprite(g);
  // sway: the trailer swings out behind the cab when you change lane (the model's own trailer angle), the whole rig leans into the move,
  // and the chassis bobs on its springs. Pivot is the rear axle, at the base of the sprite.
  const vx=dt>0?(x-(this._px??x))/dt:0;this._px=x;this._vx=(this._vx||0)*.82+clamp(vx,-900,900)*.18;
  const lean=clamp(this._vx/9000,-.045,.045)+clamp((g.lane-g.x)*.014,-.04,.04),swing=clamp((g.angle||0)*.16,-.1,.1);
  const bob=this.settings.motion?Math.sin(this.time*(g.boost>0?24:13))*(1+Math.min(1,g.speed/700))*.7:0,shake=this.settings.motion&&g.boost>0?Math.sin(this.time*60)*1.2:0;
  c.save();c.translate(x,y+bob);{const ks=this.truckScale||1;if(ks!==1)c.scale(ks,ks);}c.fillStyle='rgba(6,14,10,.38)';c.beginPath();c.ellipse(0,2,bare?44:64,bare?9:13,0,0,TAU);c.fill();
  c.globalAlpha=g.invulnerable>0&&Math.floor(this.time*13)%2===0?.55:1;
  const tw=bare?64:90;
  if(bare){const th=tw*1.02,cs=this.cabSprite(g);c.rotate(lean*.8);c.translate(shake,0);ART.cabRear(c,tw,th,this.time,{col:cs?cs.col:(CAB_COL[g.truck]||CAB_COL[0]),boost:g.boost>0});
   if(cs){const rw=tw*.92,rh=rw*cs.c.height/cs.c.width;c.drawImage(cs.c,-rw/2,-th*.9-rh*.12,rw,rh);}this.truckFx(g,c,tw,th,bare);this.detailPro.truckTrim(c,g,tw,th,bare);}
  else if(img){const th=tw*img.height/img.width;c.rotate(lean);c.translate(shake,0);
   // shear the body about its base so the top (the trailer) lags the steering, in thin slices to keep the edges clean
   c.rotate(swing*.5);c.drawImage(img,-tw/2,-th+6,tw,th);
   this.truckFx(g,c,tw,th,bare);this.detailPro.truckTrim(c,g,tw,th,bare);}
  c.restore();
 }
 truckFx(g,c,tw,th,bare){
  if(g.boost>0){for(const s of[-1,1]){const fx=s*tw*.34,len=18+Math.random()*26;const gr=c.createLinearGradient(0,-th*.05,0,len);gr.addColorStop(0,'rgba(255,240,170,.95)');gr.addColorStop(.4,'rgba(255,150,40,.8)');gr.addColorStop(1,'rgba(255,90,20,0)');c.fillStyle=gr;c.beginPath();c.moveTo(fx-5,-th*.05);c.lineTo(fx,len);c.lineTo(fx+5,-th*.05);c.fill();}}
  if(g.shield){const t=this.time;c.strokeStyle='rgba(255,230,120,'+(.55+.2*Math.sin(t*8))+')';c.lineWidth=4;c.beginPath();c.ellipse(0,-th*.45,tw*.78,th*.6,0,0,TAU);c.stroke();c.fillStyle='rgba(255,230,120,.12)';c.fill();}
  if(g.crashKind==='water'){c.strokeStyle='rgba(255,255,255,.9)';c.fillStyle='rgba(220,240,255,.8)';c.lineWidth=3;const t=(this.time*3)%1;for(let i=0;i<9;i++){const a=-Math.PI*(i/8),r=24+t*50;c.beginPath();c.arc(Math.cos(a)*r*.9,-10+Math.sin(a)*r,3+((i*7)%3),0,TAU);c.fill();}}
 }
 drawLot(c,lot,camZ,fog){
  const st=lot.style,y0=this.y0,A=this.A,camX=this.camX,pad=this.pad,zs=lot.z-camZ,ze=zs+lot.len,dxp=lot.x-camX;
  if(!NOFACADE.includes(st)){
   const tex=facadeTexture(st,lot.v,lot.h,lot.side);let za=Math.max(zs,48);const far=za>1300;
   c.save();c.globalAlpha=Math.max(.05,1-fog*.9);
   while(za<ze){const dz=Math.max(2,Math.min(far?140:70,1.5*za*za/(Math.abs(dxp)*CAMBACK+1))),zb=Math.min(ze,za+dz),sa=CAMBACK/za,sb=CAMBACK/zb,xa=210+dxp*sa,xb=210+dxp*sb,xl=Math.min(xa,xb),xr=Math.max(xa,xb);
    if(xr>-pad-20&&xl<440+pad){const zm=(za+zb)/2,yb=y0+A/zm,hp=lot.h*CAMBACK/zm;let u0=(za-zs)/lot.len,u1=(zb-zs)/lot.len;if(lot.side<0){u0=1-u0;u1=1-u1;}
     const sx=Math.min(u0,u1)*tex.width,sw=Math.max(.6,Math.abs(u1-u0)*tex.width);c.drawImage(tex,sx,0,Math.min(sw,tex.width-sx),tex.height,xl,yb-hp,xr-xl+.8,hp);}
    za=zb;}
   c.restore();}
  // trees, hedges and street lamps that go with the lot
  const hs=lot.hs,trees=st==='park'?3:st==='wood'?4:st==='field'?2:st==='cottage'||st==='barn'||st==='semi'?1:st==='embank'?2:0,lamp=(st==='terrace'||st==='semi'||st==='shops'||st==='flats'||st==='tower'||st==='park');
  if(this.q>0&&trees>1)return;
  for(let i=0;i<trees+(lamp?2:0);i++){const isLamp=i>=trees,zz=lot.z+lot.len*(isLamp?(.15+.7*(i-trees)):(.1+.8*(((hs>>>(i*3))&7)/7))),zr=zz-camZ;if(zr<CAMBACK*.6||zr>FAR)continue;
   const off=isLamp?(lot.side<0?lot.pave*.35:-lot.pave*.35):lot.side*(24+((hs>>>(i*4+2))&15)*(st==='wood'?9:5)),X=isLamp?(lot.side<0?15-lot.pave*.3:405+lot.pave*.3):lot.x+off,sc=CAMBACK/zr,y=y0+A/zr,x=210+(X-camX)*sc;if(x<-100||x>520+pad)continue;
   c.save();c.globalAlpha=Math.max(.05,1-Math.min(1,Math.pow(zr/FAR,1.7))*.9);
   if(isLamp){this.castShadow(c,x,y,10*sc,60*sc,'lamp');ART.lamp(c,16*sc,64*sc,this.time,{});}
   else{const k=(st==='wood'||((hs>>>5)&1))?'tree':'poplar',sz=SIZE.tree;this.castShadow(c,x,y,sz[0]*sc*.8,sz[1]*sc*.8,'tree');this.billboard(c,k==='poplar'?'tree':'tree',sz[0]*sc*.9,sz[1]*sc*.9,this.time,hs+i);}
   c.restore();}
 }
 drawDeco(c,d,x,y,sc,zr){
  if(x<-120||x>560+this.pad)return;const t=d.type;let w,h,key=t;
  if(t==='cone'){w=SIZE.cone[0]*sc*.9;h=SIZE.cone[1]*sc*.9;}else if(t==='barrier'){w=SIZE.barrier[0]*sc;h=SIZE.barrier[1]*sc;}else if(t==='digger'){w=SIZE.digger[0]*sc;h=SIZE.digger[1]*sc;}
  else if(t==='car'){w=SIZE.car[0]*sc*1.05;h=SIZE.car[1]*sc*1.05;}else if(t==='busstop'){w=44*sc;h=56*sc;}else return;
  this.castShadow(c,x,y,w,h,t);c.save();c.translate(x,y);
  if(t==='busstop')ART.busstop(c,w,h,this.time,{side:d.side});else this.billboard(c,key,w,h,this.time,d.id);c.restore();
 }
 /* Contact shadow plus a long soft shadow thrown to the left (the sun is high on the right), so props sit on the ground. */
 castShadow(c,x,y,w,h,k,a=1){
  if(this.g&&this.g.night||w<4)return;const tall=!(this.q>1)&&/tree|house|shop|garage|cabin|digger|bus|binlorry|icecream|tractor|caravan|lowbridge|weakbridge|hedge|barn|pub|cottage|poplar/.test(k);
  c.save();c.fillStyle='rgba(14,24,16,'+(.30*a*c.globalAlpha).toFixed(3)+')';c.beginPath();c.ellipse(x-w*.06,y,w*.46,Math.max(1.5,w*.085),0,0,TAU);c.fill();
  if(tall){c.fillStyle='rgba(14,24,16,'+(.15*a*c.globalAlpha).toFixed(3)+')';c.beginPath();c.moveTo(x+w*.30,y+1);c.lineTo(x-w*.30,y-1);c.lineTo(x-w*.30-h*.55,y+h*.07);c.lineTo(x+w*.10-h*.4,y+h*.09);c.closePath();c.fill();}
  c.restore();
 }
 drawScenery(c,p,x,y,sc){
  let k;if(p.sheet==='routeProps'){k={0:'house',1:'tree',2:'garage',3:'hedge',4:'digger',5:'cabin'}[p.sprite]||'tree';}else{k={0:'shop',7:'shop',1:'shop',2:'tree',3:'house',4:'cabin',5:'tree'}[p.sprite]||'tree';}
  const isl=String(p.id).endsWith(':island');if(isl)k='tree';
  const sz=SIZE[k];if(!sz)return;const side=p.x>210?1:-1,hw=sz[0]*.5,edge=p.decor||isl?p.x:roadEdge(p.z,side,this.g.seed),X=isl?p.x:(side*(p.x-edge)<hw+10?edge+side*(hw+10):p.x);   // never stand on the carriageway
  x=210+(X-this.camX)*sc;if(x<-160||x>580+this.pad)return;const w=sz[0]*sc,h=sz[1]*sc;this.detailPro.sceneryBase(c,p,x,y,sc,k);this.castShadow(c,x,y,w,h,k);c.save();c.translate(x,y);if(!this.billboard(c,k,w,h,this.time,parseInt(p.id)||p.z|0))this.detailPro.sceneryOverlay(c,p,w,h,k);c.restore();
 }
 drawItem(c,e,x,y,sc,zr){
  const t=this.time+e.id;
  if(FLAT[e.type]){const spec=HAZARD_SPECS[e.type],w=spec.width*sc*1.1,d=spec.height,hs=Math.max(2,this.A*(1/zr-1/(zr+d))*.9);c.save();c.translate(x,y);
   const rect=PAINTED[e.type],image=rect&&this.images[rect[0]];
   if(image){
    c.drawImage(image,...rect.slice(1),-w/2,-hs,w,hs);
    c.restore();return;
   }
   c.fillStyle=e.type==='pit' ?'#23252a':e.type==='mud'?'#6a4a2a':e.type==='oil'?'#2c2f4a':'#3d8a37';c.beginPath();c.ellipse(0,-hs*.5,w*.5,hs*.5,0,0,TAU);c.fill();
   if(e.type==='pit'){c.fillStyle='#14161a';c.beginPath();c.ellipse(0,-hs*.5,w*.36,hs*.36,0,0,TAU);c.fill();}
   if(e.type==='oil'){const g2=c.createLinearGradient(-w*.4,0,w*.4,0);g2.addColorStop(0,'#b04bd8');g2.addColorStop(.5,'#3fd2c4');g2.addColorStop(1,'#e8c24a');c.globalAlpha*=.7;c.fillStyle=g2;c.beginPath();c.ellipse(0,-hs*.5,w*.38,hs*.38,0,0,TAU);c.fill();}
   c.restore();return;}
  const sz=SIZE[e.type]||SIZE[(HAZARD_SPECS[e.type]&&e.type)||'cone']||[40,40],fn=ART[e.type];if(!fn)return;
  const bob=['coin','crumb','taco','boost','night','hitch','shield','prize','job'].includes(e.type)?-14*sc-Math.sin(t*4)*3*sc:0;
  this.castShadow(c,x,y,sz[0]*sc*1.1,sz[1]*sc*1.1,e.type,bob?.5:1);c.save();c.translate(x,y+bob);
  this.detailPro.itemUnderlay(c,e,sz,sc,zr,t);
  const scale=sc*(e.type==='crumb'?1.2:1.1);
  this.billboard(c,e.type,sz[0]*scale,sz[1]*scale,t,e.id);
  this.detailPro.itemOverlay(c,e,sz,sc,zr,t);
  if(e.honkable&&zr<620)this.label('HONK!',0,-sz[1]*sc*1.25-6,'#fff0a8',9);
  c.restore();
 }
}
const hash2=n=>{let x=Math.imul((n|0)^0x9e3779b9,0x85ebca6b);return (x^(x>>>16))>>>0;};
function quad(c,xl1,xr1,xl2,xr2,y,step){c.beginPath();c.moveTo(xl1,y+.5);c.lineTo(xr1,y+.5);c.lineTo(xr2,y-step-.7);c.lineTo(xl2,y-step-.7);c.closePath();c.fill();}
