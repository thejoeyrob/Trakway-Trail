/* Behind-the-truck camera ("chase cam"). A pseudo-3D road drawn row by row, using exactly the same game (Drive model, route-world road bands, hazards,
   pickups, collisions) as the top-down view. Only the camera changes. The truck is ChatGPT's rear-above sprite from the showroom sheet. */
import {Renderer} from './render.js';
import {roadAt,sceneryProps,sideProps,waterSide} from './route-world.js';
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
const GROUND_PAT=[7,3,12,11],ASPHALT=0,MUD=5,WATER=14,LANE=78,L0=15;   // surface-atlas cells used for the ground, road, mud and river
const CAB_COL=['#d6dde2','#f2f2ee','#e0601c','#6a2fb8','#b02a24','#2a8a44'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const rgb=c=>'rgb('+c[0]+','+c[1]+','+c[2]+')';
const THEME_GROUND=[[124,128,134],[82,158,58],[92,170,66],[201,166,107]];   // town paving, country grass, suburban lawn, building-site sand
const HAZE=[196,226,246];
const FLAT={pit:1,mud:1,oil:1,grass:1};
export class ChaseRenderer extends Renderer{
 resize(){super.resize();this.yT=this.H*.80;this.playerY=this.yT-120;this.worldScale=.72;this.camX=this.camX||210;}
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
  this.g=g;const c=this.ctx,pad=this.pad,W=420+2*pad,H=this.H;this.time+=dt;
  const y0=this.y0=H*.31,A=this.A=(this.yT-y0)*CAMBACK,camZ=g.distance-CAMBACK,tx=laneX(g.x,g.distance);
  const camX=this.camX=210+(tx-210)*.55,cx=210,seed=g.seed;
  this.finishPro ||= new ChaseFinishPro(this);this.finishPro.begin(g,dt);
  this.detailPro ||= new ChaseDetailPro(this);
  this.worldPro ||= new ChaseWorldPro(this);
  c.save();if(this.shake>0&&this.settings.motion){c.translate((Math.random()-.5)*this.shake,(Math.random()-.5)*this.shake);this.shake*=Math.exp(-dt*12);}
  // ---- cinematic sky, atmospheric depth, far scenery ----
  this.worldPro.sky(c,{g,camZ,y0,W,pad,cx});
  // ---- the ground and the road, row by row. The road never bends or sways: five fixed lanes. A lane is tarmac where the map has a
  //      drivable surface under it, and grass or river where it doesn't (that is the hazard: you have to move over). ----
  const step=H>850?3:2,pats=this.world&&this.world.patterns&&this.world.patterns.length?this.world.patterns:null,kinds=[0,0,0,0,0];
  const fillSpan=(pi,col,x1,x2,y,sn,zw,zr,wob)=>{
   if(x2<=x1)return;const p=pats&&pats[pi];
   if(p){const d=-A/(zr*zr),v=(zw%256)+(wob||0);p.setTransform({a:sn,b:0,c:0,d,e:cx-camX*sn,f:y-v*d});c.fillStyle=p;}else c.fillStyle=col;
   c.fillRect(x1,y-step,x2-x1,step+.6);};
  for(let y=H;y>y0+3;y-=step){
   const zn=A/(y-y0),zf=A/(y-step-y0);if(zf>FAR*1.2)break;const zm=(zn+zf)/2,zw=camZ+zm,sn=CAMBACK/zn,fog=Math.min(1,Math.pow(zm/FAR,1.4));
   const th=roadTheme(zw),a=roadAt(zw,seed),ws=waterSide(a),bs=a.bands,edge=ws?(ws>0?Math.max(...bs.map(b=>b.right)):Math.min(...bs.map(b=>b.left))):0;
   fillSpan(GROUND_PAT[th],rgb(THEME_GROUND[th]),-pad,420+pad,y,sn,zw,zm);this.worldPro.groundDetail(c,{th,y,zw,sn,fog,pad});
   let lo=5,hi=-1;
   for(let k=0;k<5;k++){const lx=54+LANE*k;let kind=0;
    for(const b of bs)if(lx-14>=b.left&&lx+14<=b.right){kind=b.surface==='mud'?2:1;break;}
    if(!kind&&ws&&(lx-edge)*ws>0)kind=3;kinds[k]=kind;if(kind===3){lo=Math.min(lo,k);hi=Math.max(hi,k);}}
   const X=u=>cx+(u-camX)*sn;
   if(hi>=0){ // river: every lane on the water side that has no road, and everything beyond it
    const ripple=Math.sin(this.time*1.3+zw*.02)*7+this.time*14;
    let x1=ws<0?-pad-60:X(L0+LANE*lo),x2=ws<0?X(L0+LANE*(hi+1)):420+pad+60;if(ws<0)x1=-pad-60;
    fillSpan(WATER,'#2f7aa6',x1,x2,y,sn,zw,zm,ripple);c.fillStyle='rgba(40,150,215,.38)';c.fillRect(x1,y-step,x2-x1,step+.6);
    this.worldPro.waterDetail(c,{x1,x2,y,zw,sn,step,fog,time:this.time});
    // grassy bank where the river meets the road, a pale ripple line and a glint
    const bx=ws<0?x2:x1;c.fillStyle=rgb(mix([88,120,70],HAZE,fog*.8));c.fillRect(bx-(ws<0?0:5*sn),y-step,5*sn,step+.6);
    if(Math.floor((zw+this.time*40)/46)%3===0){c.fillStyle='rgba(255,255,255,'+(.35*(1-fog))+')';const gx=(ws<0?x1:x2)+((hash2(Math.floor(zw/46))%100)/100-(ws<0?1:0))*(Math.abs(x2-x1)*.8);c.fillRect(gx,y-step,Math.max(2,18*sn),1.4);}
   }
   // tarmac and mud, merged into runs
   for(let k=0;k<5;){const kind=kinds[k];if(kind!==1&&kind!==2){k++;continue;}let j=k;while(j+1<5&&kinds[j+1]===kind)j++;
    fillSpan(kind===2?MUD:ASPHALT,kind===2?'#68482c':'#42454a',X(L0+LANE*k),X(L0+LANE*(j+1)),y,sn,zw,zm);
    // kerb + edge lines at the ends of the run, dashed dividers between lanes
    const lw=Math.max(1.2,2.4*sn),kb=Math.max(2,6*sn),dash=Math.floor(zw/55)%2===0;
    for(const [u,s2] of[[L0+LANE*k,-1],[L0+LANE*(j+1),1]]){const x=X(u);c.fillStyle=Math.floor(zw/40)%2?'#d94a3a':'#f4f1e6';c.fillRect(s2<0?x-kb:x,y-step,kb,step+.6);c.fillStyle='#f4f1e6';c.fillRect(s2<0?x+kb*.4:x-kb*.4-lw,y-step,lw,step+.6);}
    if(dash&&kind===1)for(let m=k+1;m<=j;m++){const x=X(L0+LANE*m);c.fillStyle='rgba(244,241,230,.9)';c.fillRect(x-lw/2,y-step,lw,step+.6);}
    this.worldPro.roadDetail(c,{X,kind,k,j,y,step,zw,sn,fog});
    k=j+1;}
   // fog and a faint mowing stripe over the whole row
   c.fillStyle=(g.night?'rgba(51,70,91,':'rgba(196,226,246,')+(fog*.77).toFixed(3)+')';c.fillRect(-pad-60,y-step,W+120,step+.6);
   if(Math.floor(zw/70)%2){c.fillStyle='rgba(0,0,0,'+(.05*(1-fog)).toFixed(3)+')';c.fillRect(-pad-60,y-step,W+120,step+.6);}
  }
  // haze over the far distance
  this.worldPro.farHaze(c,{g,y0,W,pad});
  // ---- everything that stands on the road, far to near ----
  const L=[];
  for(const p of sceneryProps(camZ+CAMBACK-60,camZ+FAR,seed)){const zr=p.z-camZ;if(zr<CAMBACK-40)continue;L.push({zr,k:'scenery',p});}
  if(pad>1)for(const p of sideProps(camZ+CAMBACK-60,camZ+FAR,seed,pad)){const zr=p.z-camZ;if(zr<CAMBACK-40)continue;L.push({zr,k:'scenery',p});}
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
   if(o.k==='scenery')this.drawScenery(c,o.p,cx+(o.p.x+sh-camX)*sc,y,sc);
   else if(o.k==='item')this.drawItem(c,o.e,cx+(laneX(o.e.lane,o.e.z)+sh-camX)*sc,y,sc,o.zr);
   else if(o.k==='herd'){const s=o.s;for(let i=0;i<5;i++){let wx=54+78*i+sh,off=0;if(s.cleared)off=(i<2?-1:1)*Math.max(0,(g.time-s.baaAt-.3))*140;const bx=cx+(wx+off-camX)*sc,sz=SIZE[s.kind==='cows'?'cow':'sheep'];c.save();c.translate(bx,y);this.billboard(c,s.kind==='cows'?'cow':'sheep',sz[0]*sc,sz[1]*sc,this.time+i,i);c.restore();}}
   else if(o.k==='leaving'){const d=o.d,sz=SIZE[d.type]||[50,50];c.globalAlpha=Math.max(0,1-d.age/1.4);c.save();c.translate(cx+(laneX(d.lane,d.z)+sh+d.dir*d.age*130-camX)*sc,y);this.billboard(c,d.type,sz[0]*sc,sz[1]*sc,this.time*3,7);c.restore();}
   c.restore();
  }
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
 drawTruck(g,x,y,dt){
  const c=this.ctx,bare=g.hasTrailer===false,img=bare?null:this.truckSprite(g);
  // sway: the trailer swings out behind the cab when you change lane (the model's own trailer angle), the whole rig leans into the move,
  // and the chassis bobs on its springs. Pivot is the rear axle, at the base of the sprite.
  const vx=dt>0?(x-(this._px??x))/dt:0;this._px=x;this._vx=(this._vx||0)*.82+clamp(vx,-900,900)*.18;
  const lean=clamp(this._vx/5200,-.1,.1)+clamp((g.lane-g.x)*.03,-.08,.08),swing=clamp((g.angle||0)*.3,-.26,.26)+clamp((g.sway||0)*.2,-.15,.15);
  const bob=this.settings.motion?Math.sin(this.time*(g.boost>0?24:13))*(1+Math.min(1,g.speed/700))*.7:0,shake=this.settings.motion&&g.boost>0?Math.sin(this.time*60)*1.2:0;
  c.save();c.translate(x,y+bob);c.fillStyle='rgba(6,14,10,.38)';c.beginPath();c.ellipse(0,2,bare?44:64,bare?9:13,0,0,TAU);c.fill();
  c.globalAlpha=g.invulnerable>0&&Math.floor(this.time*13)%2===0?.55:1;
  const tw=bare?64:90;
  if(bare){const th=tw*1.02,cs=this.cabSprite(g);c.rotate(lean*.8);c.translate(shake,0);ART.cabRear(c,tw,th,this.time,{col:cs?cs.col:(CAB_COL[g.truck]||CAB_COL[0]),boost:g.boost>0});
   if(cs){const rw=tw*.92,rh=rw*cs.c.height/cs.c.width;c.drawImage(cs.c,-rw/2,-th*.9-rh*.12,rw,rh);}this.truckFx(g,c,tw,th,bare);this.detailPro.truckTrim(c,g,tw,th,bare);}
  else if(img){const th=tw*img.height/img.width;c.rotate(lean);c.translate(shake,0);
   // shear the body about its base so the top (the trailer) lags the steering, in thin slices to keep the edges clean
   c.save();c.transform(1,0,-swing,1,0,0);c.drawImage(img,-tw/2,-th+6,tw,th);c.restore();
   this.truckFx(g,c,tw,th,bare);this.detailPro.truckTrim(c,g,tw,th,bare);}
  c.restore();
 }
 truckFx(g,c,tw,th,bare){
  if(g.boost>0){for(const s of[-1,1]){const fx=s*tw*.34,len=18+Math.random()*26;const gr=c.createLinearGradient(0,-th*.05,0,len);gr.addColorStop(0,'rgba(255,240,170,.95)');gr.addColorStop(.4,'rgba(255,150,40,.8)');gr.addColorStop(1,'rgba(255,90,20,0)');c.fillStyle=gr;c.beginPath();c.moveTo(fx-5,-th*.05);c.lineTo(fx,len);c.lineTo(fx+5,-th*.05);c.fill();}}
  if(g.shield){const t=this.time;c.strokeStyle='rgba(255,230,120,'+(.55+.2*Math.sin(t*8))+')';c.lineWidth=4;c.beginPath();c.ellipse(0,-th*.45,tw*.78,th*.6,0,0,TAU);c.stroke();c.fillStyle='rgba(255,230,120,.12)';c.fill();}
  if(g.crashKind==='water'){c.strokeStyle='rgba(255,255,255,.9)';c.fillStyle='rgba(220,240,255,.8)';c.lineWidth=3;const t=(this.time*3)%1;for(let i=0;i<9;i++){const a=-Math.PI*(i/8),r=24+t*50;c.beginPath();c.arc(Math.cos(a)*r*.9,-10+Math.sin(a)*r,3+((i*7)%3),0,TAU);c.fill();}}
 }
 drawScenery(c,p,x,y,sc){
  let k;if(p.sheet==='routeProps'){k={0:'house',1:'tree',2:'garage',3:'hedge',4:'digger',5:'cabin'}[p.sprite]||'tree';}else{k={0:'shop',7:'shop',1:'shop',2:'tree',3:'house',4:'cabin',5:'tree'}[p.sprite]||'tree';}
  const sz=SIZE[k];if(!sz||x<-120||x>540+this.pad)return;this.detailPro.sceneryBase(c,p,x,y,sc,k);c.save();c.translate(x,y);if(!this.billboard(c,k,sz[0]*sc*1.25,sz[1]*sc*1.25,this.time,parseInt(p.id)||p.z|0))this.detailPro.sceneryOverlay(c,p,sz[0]*sc*1.25,sz[1]*sc*1.25,k);c.restore();
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
  c.save();c.translate(x,y+bob);
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
