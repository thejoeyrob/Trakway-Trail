/* Behind-the-truck camera ("chase cam"). A pseudo-3D road drawn row by row, using exactly the same game (Drive model, route-world road bands, hazards,
   pickups, collisions) as the top-down view. Only the camera changes. The truck is ChatGPT's rear-above sprite from the showroom sheet. */
import {Renderer} from './render.js';
import {roadAt,sceneryProps,sideProps,waterSide} from './route-world.js';
import {roadTheme,laneX} from './geometry.js';
import {ROUTE_ATLAS} from './route-atlas.js';
import {PAINTS,hueShift,tintBody,DECAL_PAINT} from './rigart.js';
import {HAZARD_SPECS} from './route-hazards.js';
import {ART,SIZE} from './chaseart.js';
const CAMBACK=260,FAR=2400,TAU=Math.PI*2,CURVE=1.9;
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const rgb=c=>'rgb('+c[0]+','+c[1]+','+c[2]+')';
const THEME_GROUND=[[124,128,134],[82,158,58],[92,170,66],[201,166,107]];   // town paving, country grass, suburban lawn, building-site sand
const HAZE=[196,226,246];
const FLAT={pit:1,mud:1,oil:1,grass:1};
export class ChaseRenderer extends Renderer{
 resize(){super.resize();this.yT=this.H*.80;this.playerY=this.yT-120;this.worldScale=.72;this.camX=this.camX||210;}
 /* screen x of a lane at the truck's depth (used for cash pop-ups and night lights) */
 x(lane){return 210+(54+78*lane-(this.camX||210));}
 /* project a world point (lane or raw x, z) to the screen: {x,y,s} */
 /* Roads bend only a little in the model; the camera exaggerates the bend (applied to the road, the scenery and the items alike, so they stay lined up). */
 shiftAt(z){const a=roadAt(z,this.g.seed),bs=a.bands,l=Math.min(...bs.map(b=>b.left)),r=Math.max(...bs.map(b=>b.right));return ((l+r)/2-210)*(CURVE-1);}
 project(lane,z,rawX){const g=this.g,zr=z-(g.distance-CAMBACK),sc=CAMBACK/zr,wx=(rawX??(54+78*lane))+this.shiftAt(z);return {x:210+(wx-this.camX)*sc,y:this.y0+this.A/zr,s:sc};}
 truckSprite(g){
  const key=[g.truck,g.trailerPaint,g.decal,g.trailerDecal].join(':');if(this._ts&&this._ts.key===key)return this._ts.c;
  const img=this.images.routeShowroom,rect=ROUTE_ATLAS.showroom.rects[4];if(!img)return null;
  let c=document.createElement('canvas');c.width=rect[2];c.height=rect[3];c.getContext('2d').drawImage(img,...rect,0,0,rect[2],rect[3]);
  try{const P=PAINTS[g.truck]||PAINTS[0];if(P.cab.hue||P.cab.sat!==undefined||P.cab.white)hueShift(c,P.cab);
   else if(P.cab.sprite===1||P.cab.sprite===2){hueShift(c,{hue:P.cab.sprite===1?-150:100,sat:1});}
   const TP=PAINTS[g.trailerPaint??1];if(TP&&TP.tint)tintBody(c,TP.tint);}catch(e){}
  const dp=DECAL_PAINT[g.trailerDecal];if(dp){try{const x=c.getContext('2d');x.save();x.globalCompositeOperation='source-atop';x.beginPath();x.rect(20,70,107,150);x.clip();dp(x,20,70,107,150,'trailer',this);x.restore();}catch(e){}}
  this._ts={key,c};return c;
 }
 draw(g,dt,truckIndex){
  this.g=g;const c=this.ctx,pad=this.pad,W=420+2*pad,H=this.H;this.time+=dt;
  const y0=this.y0=H*.31,A=this.A=(this.yT-y0)*CAMBACK,camZ=g.distance-CAMBACK,tx=laneX(g.x,g.distance)+this.shiftAt(g.distance);
  const camX=this.camX=210+(tx-210)*.55,cx=210,seed=g.seed;
  c.save();if(this.shake>0&&this.settings.motion){c.translate((Math.random()-.5)*this.shake,(Math.random()-.5)*this.shake);this.shake*=Math.exp(-dt*12);}
  // ---- sky, sun, clouds, distant hills ----
  const sky=c.createLinearGradient(0,0,0,y0);sky.addColorStop(0,'#2d86e6');sky.addColorStop(.7,'#8cc9f6');sky.addColorStop(1,rgb(HAZE));c.fillStyle=sky;c.fillRect(-pad,-4,W,y0+6);
  const sun=c.createRadialGradient(cx+90,y0*.45,4,cx+90,y0*.45,y0*.55);sun.addColorStop(0,'#fffbe0ee');sun.addColorStop(1,'#fffbe000');c.fillStyle=sun;c.fillRect(-pad,0,W,y0);
  const themeFar=roadTheme(camZ+FAR*.6);
  for(const [k,col,amp,y] of [[.25,mix(THEME_GROUND[themeFar],HAZE,.55),26,y0-2],[.5,mix(THEME_GROUND[themeFar],[60,90,70],.45),18,y0+1]]){
   c.fillStyle=rgb(col);c.beginPath();c.moveTo(-pad,y0+2);for(let x=-pad;x<=420+pad+8;x+=8)c.lineTo(x,y-amp*(.5+.5*Math.sin((x+camX*k*.4+camZ*.01*k)*.012*k*4+k*7))*(.6+.4*Math.sin(x*.031+k)));c.lineTo(420+pad,y0+2);c.closePath();c.fill();}
  c.fillStyle='#ffffffcc';for(let i=0;i<5;i++){const x=((i*173+this.time*3+camZ*.004*(1+i%2)*.5)%(W+160))-80-pad,y=y0*(.18+.12*((i*37)%5)/5);for(const [dx,dy,r] of[[0,0,22],[24,-6,26],[50,2,20],[26,6,22]]){c.beginPath();c.ellipse(x+dx,y+dy,r*1.4,r*.55,0,0,TAU);c.fill();}}
  // ---- the ground and the road, row by row ----
  const step=2;let prev=null;
  for(let y=H;y>y0+3;y-=step){
   const zn=A/(y-y0),zf=A/(y-step-y0);if(zf>FAR*1.2)break;const zm=(zn+zf)/2,zw=camZ+zm,sn=CAMBACK/zn,sf=CAMBACK/zf,fog=Math.min(1,Math.pow(zm/FAR,1.4));
   const stripe=Math.floor(zw/70)%2?1:0,gcol=mix(THEME_GROUND[roadTheme(zw)],HAZE,fog*.75).map(v=>v+(stripe?-5:3)*(1-fog));
   c.fillStyle=rgb(gcol);c.fillRect(-pad,y-step,W,step+.6);
   const a=roadAt(zw,seed),wsd=waterSide(a),sh0=((Math.min(...a.bands.map(b=>b.left))+Math.max(...a.bands.map(b=>b.right)))/2-210)*(CURVE-1);
   if(a.motif==='river-bend'&&wsd){const edge=(wsd>0?Math.max(...a.bands.map(b=>b.right)):Math.min(...a.bands.map(b=>b.left)))+sh0,xe=cx+(edge+(wsd>0?22:-22)-camX)*sn;c.fillStyle=rgb(mix([40,98,132],HAZE,fog*.7));if(wsd>0)c.fillRect(xe,y-step,420+pad-xe+4,step+.6);else c.fillRect(-pad,y-step,xe+pad,step+.6);}
   for(const b of a.bands){
    const L0=b.left+sh0,R0=b.right+sh0,xln=cx+(L0-camX)*sn,xrn=cx+(R0-camX)*sn,xlf=cx+(L0-camX)*sf,xrf=cx+(R0-camX)*sf;
    const base=b.surface==='mud'?[104,76,48]:[66,68,72],col=mix(base,HAZE,fog*.8);
    const sh=10;c.fillStyle=rgb(mix(base.map(v=>v+30),HAZE,fog*.8));quad(c,xln-sh*sn,xrn+sh*sn,xlf-sh*sf,xrf+sh*sf,y,step);   // shoulder
    c.fillStyle=rgb(col);quad(c,xln,xrn,xlf,xrf,y,step);
    // edge lines and lane dividers
    c.fillStyle=rgb(mix([236,234,222],HAZE,fog*.8));const el=2.2;
    quad(c,xln,xln+el*sn,xlf,xlf+el*sf,y,step);quad(c,xrn-el*sn,xrn,xrf-el*sf,xrf,y,step);
    const w=b.right-b.left,n=w>=340?5:Math.max(1,Math.round(w/74));
    if(Math.floor(zw/50)%2===0&&b.surface!=='mud')for(let k=1;k<n;k++){const lw=Math.min(78,w/n),xm=(b.left+b.right)/2+sh0+(k-n/2)*lw;quad(c,cx+(xm-1.2-camX)*sn,cx+(xm+1.2-camX)*sn,cx+(xm-1.2-camX)*sf,cx+(xm+1.2-camX)*sf,y,step);}
   }
  }
  // haze over the far distance
  const haze=c.createLinearGradient(0,y0-6,0,y0+60);haze.addColorStop(0,rgb(HAZE)+'');haze.addColorStop(1,'rgba(196,226,246,0)');c.fillStyle=haze;c.fillRect(-pad,y0-6,W,66);
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
   const sh=this.shiftAt(o.k==='scenery'?o.p.z:o.k==='item'?o.e.z:o.k==='herd'?o.s.z:o.d.z);
   if(o.k==='scenery')this.drawScenery(c,o.p,cx+(o.p.x+sh-camX)*sc,y,sc);
   else if(o.k==='item')this.drawItem(c,o.e,cx+(laneX(o.e.lane,o.e.z)+sh-camX)*sc,y,sc,o.zr);
   else if(o.k==='herd'){const s=o.s;for(let i=0;i<5;i++){let wx=54+78*i+sh,off=0;if(s.cleared)off=(i<2?-1:1)*Math.max(0,(g.time-s.baaAt-.3))*140;const bx=cx+(wx+off-camX)*sc,sz=SIZE[s.kind==='cows'?'cow':'sheep'];c.save();c.translate(bx,y);ART[s.kind==='cows'?'cow':'sheep'](c,sz[0]*sc,sz[1]*sc,this.time+i,{id:i});c.restore();}}
   else if(o.k==='leaving'){const d=o.d,sz=SIZE[d.type]||[50,50];c.globalAlpha=Math.max(0,1-d.age/1.4);c.save();c.translate(cx+(laneX(d.lane,d.z)+sh+d.dir*d.age*130-camX)*sc,y);if(ART[d.type])ART[d.type](c,sz[0]*sc,sz[1]*sc,this.time*3,{id:7});c.restore();}
   c.restore();
  }
  this.nightLight(g);
  // floating text / sparkles (cash, fines)
  for(const f of this.fx){f.age+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.kind!=='text')f.vy+=190*dt;const al=Math.max(0,Math.min(1,1-f.age/f.life));
   if(f.kind==='text'){c.save();c.globalAlpha=al;this.label(f.text,f.x,f.y,'#fff0ad',17);c.restore();}else{c.save();c.globalAlpha=al;c.fillStyle=f.kind==='loss'?'#ff6a5a':'#ffd23f';c.beginPath();c.arc(f.x,f.y,4,0,TAU);c.fill();c.restore();}}
  this.fx=this.fx.filter(f=>f.age<f.life);
  // crash freeze ring
  if(this.highlight){const h=this.highlight,t=this.time-h.t0,pulse=1+Math.sin(t*9)*.08;
   if(h.item&&ART[h.item.type]){const sz=SIZE[h.item.type]||[50,50];c.save();c.translate(h.x,h.y+h.ry*.9);ART[h.item.type](c,sz[0]*1.5,sz[1]*1.5,this.time,{id:h.item.id});c.restore();}   // the thing you hit, in front
   c.save();c.strokeStyle='#ff4b3a';c.lineWidth=4;c.shadowColor='#ff4b3a';c.shadowBlur=14;c.beginPath();c.ellipse(h.x,h.y,h.rx*pulse,h.ry*pulse,0,0,TAU);c.stroke();c.shadowBlur=0;
   c.font='900 15px -apple-system,sans-serif';c.textAlign='center';const w=c.measureText(h.label).width+26,ly=Math.max(30,h.y-h.ry-30),lx=Math.min(420-w/2-8,Math.max(w/2+8,h.x));c.fillStyle='#1c0b0b';c.strokeStyle='#ff4b3a';c.lineWidth=2.5;c.beginPath();c.roundRect(lx-w/2,ly-17,w,28,9);c.fill();c.stroke();c.fillStyle='#fff3e0';c.fillText(h.label,lx,ly+3);c.restore();}
  c.restore();
 }
 drawTruck(g,x,y,dt){
  const c=this.ctx,img=this.truckSprite(g);const roll=((g.lane-g.x)*.05)+Math.sin(this.time*7)*.004;
  c.save();c.translate(x,y);c.fillStyle='rgba(6,14,10,.35)';c.beginPath();c.ellipse(0,2,64,13,0,0,TAU);c.fill();
  c.globalAlpha=g.invulnerable>0&&Math.floor(this.time*13)%2===0?.55:1;
  if(img){const tw=g.hasTrailer===false?62:86,th=tw*img.height/img.width,body=g.hasTrailer===false?.34:1;c.rotate(roll);
   if(g.hasTrailer===false){c.drawImage(img,0,0,img.width,img.height*.30,-tw/2,-th*.3,tw,th*.3);}else c.drawImage(img,-tw/2,-th+6,tw,th);
   if(g.boost>0){c.fillStyle='rgba(255,170,60,.8)';for(const s of[-1,1]){c.beginPath();c.moveTo(s*tw*.32,-th*.04);c.lineTo(s*tw*.32+4,16+Math.random()*24);c.lineTo(s*tw*.32-4,-th*.04);c.fill();}}
   if(g.shield){c.strokeStyle='rgba(255,230,120,.7)';c.lineWidth=4;c.beginPath();c.ellipse(0,-th*.45,tw*.75,th*.58,0,0,TAU);c.stroke();}}
  c.restore();
 }
 drawScenery(c,p,x,y,sc){
  let k;if(p.sheet==='routeProps'){k={0:'house',1:'tree',2:'garage',3:'hedge',4:'digger',5:'cabin'}[p.sprite]||'tree';}else{k={0:'shop',7:'shop',1:'shop',2:'tree',3:'house',4:'cabin',5:'tree'}[p.sprite]||'tree';}
  const sz=SIZE[k];if(!sz||x<-120||x>540+this.pad)return;c.save();c.translate(x,y);ART[k](c,sz[0]*sc*1.25,sz[1]*sc*1.25,this.time,{id:parseInt(p.id)||p.z|0});c.restore();
 }
 drawItem(c,e,x,y,sc,zr){
  const t=this.time+e.id;
  if(FLAT[e.type]){const spec=HAZARD_SPECS[e.type],w=spec.width*sc*1.1,d=spec.height,hs=Math.max(2,this.A*(1/zr-1/(zr+d))*.9);c.save();c.translate(x,y);
   c.fillStyle=e.type==='pit'?'#23252a':e.type==='mud'?'#6a4a2a':e.type==='oil'?'#2c2f4a':'#3d8a37';c.beginPath();c.ellipse(0,-hs*.5,w*.5,hs*.5,0,0,TAU);c.fill();
   if(e.type==='pit'){c.fillStyle='#14161a';c.beginPath();c.ellipse(0,-hs*.5,w*.36,hs*.36,0,0,TAU);c.fill();}
   if(e.type==='oil'){const g2=c.createLinearGradient(-w*.4,0,w*.4,0);g2.addColorStop(0,'#b04bd8');g2.addColorStop(.5,'#3fd2c4');g2.addColorStop(1,'#e8c24a');c.globalAlpha*=.7;c.fillStyle=g2;c.beginPath();c.ellipse(0,-hs*.5,w*.38,hs*.38,0,0,TAU);c.fill();}
   c.restore();return;}
  const sz=SIZE[e.type]||SIZE[(HAZARD_SPECS[e.type]&&e.type)||'cone']||[40,40],fn=ART[e.type];if(!fn)return;
  const bob=['coin','crumb','taco','boost','night','hitch','shield','prize','job'].includes(e.type)?-14*sc-Math.sin(t*4)*3*sc:0;
  c.save();c.translate(x,y+bob);
  if(e.type==='crumb')fn(c,sz[0]*sc*1.2,sz[1]*sc*1.2,t,{id:e.id});else fn(c,sz[0]*sc*1.1,sz[1]*sc*1.1,t,{id:e.id});
  if(e.honkable&&zr<620)this.label('HONK!',0,-sz[1]*sc*1.25-6,'#fff0a8',9);
  c.restore();
 }
}
function quad(c,xl1,xr1,xl2,xr2,y,step){c.beginPath();c.moveTo(xl1,y+.5);c.lineTo(xr1,y+.5);c.lineTo(xr2,y-step-.7);c.lineTo(xl2,y-step-.7);c.closePath();c.fill();}
