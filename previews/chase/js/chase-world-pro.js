/* TRUCKIN' & DRIVIN' — Chase Camera World Art v1.
 * Cosmetic-only Canvas2D environment; does not alter roadAt, physics, lanes or collision.
 * Designed for the 420-world-unit chase renderer on mobile (no textures/network fetch).
 */
import {roadTheme} from './geometry.js';
const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const fract=n=>n-Math.floor(n);
const hash=n=>fract(Math.sin(n*127.17+91.7)*43758.5453);
const rgba=(r,g,b,a=1)=>`rgba(${r|0},${g|0},${b|0},${a})`;
const blend=(a,b,t)=>a.map((v,i)=>lerp(v,b[i],t));
const palettes=[
 {top:[49,116,179],mid:[116,190,229],low:[227,235,222],far:[118,150,150],hills:[68,119,130],land:[47,100,100]},
 {top:[42,124,209],mid:[119,195,234],low:[244,228,178],far:[141,179,142],hills:[75,131,103],land:[61,118,77]},
 {top:[54,126,204],mid:[132,195,235],low:[240,226,204],far:[161,185,166],hills:[98,147,124],land:[71,118,90]},
 {top:[61,110,176],mid:[149,183,200],low:[234,212,172],far:[171,157,129],hills:[122,123,106],land:[126,117,91]}
];
export class ChaseWorldPro {
 constructor(renderer){
  this.r=renderer;this.lastTheme=-1;this.sunY=0;this.pats=null;
  // Lightweight local 2x2 materials atlas; images fail gracefully back to original road art.
  if(typeof Image!=='undefined'&&typeof document!=='undefined'){
   const im=new Image();im.onload=()=>{
    try{this.pats=[];
     for(let i=0;i<4;i++){
      const can=document.createElement('canvas');can.width=can.height=512;
      can.getContext('2d').drawImage(im,(i%2)*512,Math.floor(i/2)*512,512,512,0,0,512,512);
      this.pats.push(this.r.ctx.createPattern(can,'repeat'));
     }
    }catch{this.pats=null;}
   };
   im.onerror=()=>{this.pats=null;};
   im.src=(typeof window!=='undefined'&&window.TRUCKIN_IMAGE_DATA?.chaseMaterials)||'./assets/chase-pro/chase-materials.webp';
  }
 }
 material(c,pat,x1,x2,y,zw,sn,fog,opacity){
  if(!pat||x2<=x1||sn<.035||Math.floor(y/2)%2)return;
  // 4-pixel slices reduce mobile fill rate vs a 2-pixel overlay on every row.
  const zr=260/sn,d=-this.r.A/(zr*zr);
  c.save();c.globalAlpha=(1-fog)*opacity;
  pat.setTransform({a:sn,b:0,c:0,d,e:210-(this.r.camX||210)*sn,f:y-(zw%512)*d});
  c.fillStyle=pat;c.fillRect(x1,y-4,x2-x1,4.6);c.restore();
 }
 groundDetail(c,{th,y,zw,sn,fog,pad}){
  if(!this.pats||!(th===1||th===2))return;
  this.material(c,this.pats[2],-pad,420+pad,y,zw,sn,fog,.27);
 }
 sky(ctx,{g,camZ,y0,W,pad,cx}){
  const theme=roadTheme(camZ+1150),p=palettes[theme],night=!!g.night,t=this.r.time;
  const top=night?[9,22,52]:p.top,mid=night?[31,51,90]:p.mid,low=night?[100,102,127]:p.low;
  const sky=ctx.createLinearGradient(0,0,0,y0+28);
  sky.addColorStop(0,rgba(...top));sky.addColorStop(.68,rgba(...mid));sky.addColorStop(1,rgba(...low));
  ctx.fillStyle=sky;ctx.fillRect(-pad-4,-2,W+8,y0+32);
  // Warm solar disk with soft aerial glow. Night uses a moon and faint stars.
  const sunX=285+Math.sin(camZ*.000065)*34, sunY=night?y0*.23:y0*.46;
  ctx.save();ctx.globalCompositeOperation='screen';
  if(night){for(let i=0;i<48;i++){const x=-pad+hash(i*13+21)*(W+2*pad),y=hash(i*11+3)*y0*.78;
   ctx.fillStyle=rgba(201,230,255,.24+hash(i+3)*.38);ctx.fillRect(x,y,hash(i+9)>.86?1.5:.8,.8);}}
  for(let i=5;i>=0;i--){const r=(night?13:22)+i*(night?11:19),grad=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,r);
   grad.addColorStop(0,night?'rgba(222,237,255,.12)':'rgba(255,233,177,.18)');grad.addColorStop(1,'rgba(255,242,196,0)');ctx.fillStyle=grad;ctx.fillRect(sunX-r,sunY-r,2*r,2*r);}
  ctx.fillStyle=night?'#eaf3fc':'#fff1cd';ctx.beginPath();ctx.arc(sunX,sunY,night?10:15,0,TAU);ctx.fill();ctx.restore();
  // Layered atmospheric cloud banks. World-positioned: no popping on camera pans.
  for(let layer=0;layer<3;layer++)for(let i=0;i<9;i++){
   const raw=hash(i*37+layer*17+9),xp=-pad-130+fract(raw+camZ*(.000002+layer*.0000015)+t*.00008)*(W+320),
    yp=y0*(.12+layer*.14+hash(i*43+layer*3)*.18),scale=.45+.33*layer+hash(i+layer*6)*.32;
   const opacity=(night?.08:.21)+hash(i*13+layer)*.07;
   ctx.save();ctx.translate(xp,yp);ctx.scale(scale,scale);
   ctx.fillStyle=night?rgba(180,198,230,opacity):rgba(249,253,255,opacity+.08);
   ctx.beginPath();ctx.ellipse(0,0,52,10,0,0,TAU);ctx.ellipse(-23,-5,24,17,0,0,TAU);
   ctx.ellipse(5,-12,32,21,0,0,TAU);ctx.ellipse(36,-4,26,14,0,0,TAU);ctx.fill();
   ctx.fillStyle=night?'rgba(30,47,75,.12)':'rgba(127,168,194,.13)';ctx.fillRect(-46,5,98,3);ctx.restore();
  }
  // Broad, low-frequency rolling hills across the whole viewport; distinct depth planes.
  for(let layer=0;layer<3;layer++){
   const h=y0+14-layer*11,amp=layer===0?15:layer===1?26:40;
   const col=blend(p.far,p.hills,layer*.32),final=night?blend(col,[14,37,61],.77):col;
   ctx.fillStyle=rgba(...final);ctx.beginPath();ctx.moveTo(-pad-12,y0+47);
   for(let x=-pad-14;x<=420+pad+16;x+=6){const xx=x+camZ*(.003+layer*.003);
    const ridge=Math.sin(xx*.012+layer*2.41)*.48+Math.sin(xx*.026-layer*.83)*.33+Math.sin(xx*.047+layer)*.17;
    ctx.lineTo(x,h-ridge*amp);}
   ctx.lineTo(420+pad+20,y0+50);ctx.closePath();ctx.fill();
  }
  // Far hedgerow, distant village roofs and chimneys: readable depth, not intrusive.
  ctx.fillStyle=night?'rgba(23,45,67,.58)':'rgba(49,91,80,.27)';
  for(let i=-4;i<13;i++){
   const xx=i*55+hash(i+theme*34)*15 - fract(camZ*.001)*55;
   const yy=y0+7+Math.sin(i*.8)*5;
   ctx.beginPath();ctx.moveTo(xx-15,yy);ctx.lineTo(xx,yy-10-(i%3?0:6));ctx.lineTo(xx+17,yy);ctx.closePath();ctx.fill();
   if(i%3===0)ctx.fillRect(xx+7,yy-14,3,9);
  }
  // Horizon bloom / aerial mist keeps the pseudo-3D world glued to the sky.
  const haze=ctx.createLinearGradient(0,y0-30,0,y0+34);
  haze.addColorStop(0,'rgba(231,234,219,0)');
  haze.addColorStop(.5,night?'rgba(94,112,135,.30)':'rgba(226,232,217,.32)');
  haze.addColorStop(1,'rgba(222,232,217,0)');ctx.fillStyle=haze;ctx.fillRect(-pad-4,y0-30,W+8,64);
 }
 farHaze(c,{g,y0,W,pad}){
  const night=!!g.night;
  const haze=c.createLinearGradient(0,y0-9,0,y0+66);
  haze.addColorStop(0,night?'rgba(75,100,130,.72)':'rgba(221,235,231,.84)');
  haze.addColorStop(.5,night?'rgba(58,76,103,.24)':'rgba(222,235,227,.25)');
  haze.addColorStop(1,'rgba(221,235,231,0)');
  c.fillStyle=haze;c.fillRect(-pad,y0-9,W,77);
 }
 roadDetail(c,{X,kind,k,j,y,step,zw,sn,fog}){
  if(this.pats){this.material(c,this.pats[kind===1?0:1],X(15+78*k),X(15+78*(j+1)),y,zw,sn,fog,kind===1?.23:.31);}
  // Capped frequency to avoid expensive per-pixel work on mobile screens.
  const row=y|0;if((row&7)!==0||sn<.07)return;
  const alpha=clamp((1-fog)*.34,0,.34);
  c.save();c.globalAlpha=alpha;
  if(kind===1){
   // World-locked wheel-polished grooves, occasional tar seam and reflective chips.
   for(let m=k;m<=j;m++){
    const centre=54+78*m;
    c.fillStyle='rgba(15,25,25,.55)';
    for(const u of[-18,18]){const x=X(centre+u);c.fillRect(x-Math.max(.4,1.8*sn),y-step,Math.max(.8,3.2*sn),step+.6);}
    if((Math.floor(zw/198)+m*7)%13===0){c.fillStyle='rgba(220,223,219,.36)';
     c.fillRect(X(centre-26),y-step,Math.max(1,52*sn),.7);}
   }
   if(Math.floor(zw/130)%11===0){c.fillStyle='#111e24';
    c.fillRect(X(15+78*k),y-step,Math.max(1,(j-k+1)*78*sn),Math.min(1.3,step));}
  }else{
   c.fillStyle='rgba(225,182,106,.43)';
   for(let m=k;m<=j;m++)for(const u of[-20,19])c.fillRect(X(54+78*m+u),y-step,Math.max(1,4*sn),step);
   if(Math.floor(zw/34)%6===0){c.fillStyle='rgba(48,39,26,.26)';c.fillRect(X(54+78*k-12),y-step,45*sn,1);}
  }
  c.restore();
 }
 waterDetail(c,{x1,x2,y,zw,sn,step,fog,time}){
  if(this.pats)this.material(c,this.pats[3],x1,x2,y,zw,sn,fog,.23);
  if((y|0)%6!==0||x2-x1<2)return;
  const w=x2-x1,phase=zw*.074+time*1.5;
  c.save();c.globalAlpha=clamp((1-fog)*.35,0,.35);
  const strips=1+Math.min(3,Math.floor(w/100));
  for(let i=0;i<strips;i++){
   const x=x1+hash(Math.floor(zw/44)*11+i*3)*w;
   const sw=Math.max(3,(12+Math.sin(phase+i)*12)*sn);
   c.fillStyle=i%2?'#75d5e8':'#e1fbff';c.fillRect(x,y-step,sw,.8);
  }
  c.restore();
 }
}
