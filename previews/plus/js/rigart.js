/* The rig, drawn properly: ChatGPT's painted cab + trailer plates are recoloured per paint, wrapped with vector
   decals (clipped to the metalwork so they sit on the roofs), then every garage upgrade is drawn on top as a
   visible part. Used by BOTH the game and the garage preview, so what you see in the garage is what you drive. */
import {ROUTE_ATLAS} from './route-atlas.js';
import {rigPose,RIG} from './geometry.js';
const TAU=Math.PI*2;
/* paint id -> cab sprite (+ hue/sat/light tweak) and trailer tint */
export const PAINTS={
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
export const DECAL_PAINT={
 1(c,x,y,w,h){ // TWIN STRIPE: two gold pinstriped racing stripes
  for(const s of[-1,1]){const cx=x+w/2+s*w*.15,sw=w*.1;c.fillStyle='#14181a';c.fillRect(cx-sw/2-3,y,sw+6,h);c.fillStyle=GOLD;c.fillRect(cx-sw/2,y,sw,h);c.fillStyle='#fff3c4';c.fillRect(cx-sw/2+sw*.3,y,sw*.12,h);}},
 2(c,x,y,w,h){ // CHEVRON HAUL: hi-vis chevrons pointing up the road
  const n=Math.max(4,Math.round(h/58));c.lineJoin='miter';
  for(let i=0;i<n;i++){const yy=y+h*(i+.5)/n,d=w*.26;c.fillStyle='#16191b';c.beginPath();c.moveTo(x+w*.06,yy+d);c.lineTo(x+w/2,yy-d*.2);c.lineTo(x+w*.94,yy+d);c.lineTo(x+w*.94,yy+d+h/n*.26);c.lineTo(x+w/2,yy-d*.2+h/n*.26);c.lineTo(x+w*.06,yy+d+h/n*.26);c.closePath();c.fill();
   c.strokeStyle='#ffd22e';c.lineWidth=h/n*.1;c.beginPath();c.moveTo(x+w*.06,yy+d);c.lineTo(x+w/2,yy-d*.2);c.lineTo(x+w*.94,yy+d);c.stroke();}},
 3(c,x,y,w,h){ // CARBON & GOLD: carbon-fibre panel with gold keyline
  const ix=x+w*.1,iy=y+h*.03,iw=w*.8,ih=h*.94;c.save();c.beginPath();c.roundRect(ix,iy,iw,ih,10);c.clip();c.fillStyle='#14171a';c.fillRect(ix,iy,iw,ih);
  c.strokeStyle='#2c3338';c.lineWidth=3;for(let k=-ih;k<iw+ih;k+=9){c.beginPath();c.moveTo(ix+k,iy);c.lineTo(ix+k-ih,iy+ih);c.stroke();}
  c.strokeStyle='#07090a';c.lineWidth=3;for(let k=-ih;k<iw+ih;k+=9){c.beginPath();c.moveTo(ix+k+4,iy);c.lineTo(ix+k+4+ih,iy+ih);c.stroke();}
  c.restore();c.strokeStyle=GOLD;c.lineWidth=3;c.beginPath();c.roundRect(ix,iy,iw,ih,10);c.stroke();c.strokeStyle=GOLD2;c.lineWidth=1;c.beginPath();c.roundRect(ix+6,iy+6,iw-12,ih-12,7);c.stroke();
  c.fillStyle=GOLD;c.fillRect(x+w/2-2,iy+10,4,ih-20);},
 4(c,x,y,w,h){ // SHARD: swept midnight shards with a cyan edge
  c.fillStyle='#0f1b2d';c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y+h*.06);c.lineTo(x+w,y+h*.55);c.lineTo(x,y+h*.34);c.closePath();c.fill();
  c.fillStyle='#17304f';c.beginPath();c.moveTo(x,y+h*.4);c.lineTo(x+w,y+h*.62);c.lineTo(x+w,y+h);c.lineTo(x,y+h);c.closePath();c.fill();
  c.strokeStyle='#37e6d3';c.lineWidth=4;c.beginPath();c.moveTo(x,y+h*.37);c.lineTo(x+w,y+h*.585);c.stroke();c.strokeStyle='#ffffff90';c.lineWidth=1.5;c.beginPath();c.moveTo(x,y+h*.35);c.lineTo(x+w,y+h*.565);c.stroke();},
 5(c,x,y,w,h){ // ROYAL FLOCK: gold-trimmed roof with a crowned sheep crest
  c.strokeStyle=GOLD;c.lineWidth=5;c.strokeRect(x+w*.06,y+h*.03,w*.88,h*.94);c.strokeStyle='#14181a';c.lineWidth=1.5;c.strokeRect(x+w*.06+5,y+h*.03+5,w*.88-10,h*.94-10);
  const cx=x+w/2,cy=y+h/2,R=Math.min(w*.34,h*.3);c.fillStyle='#14181a';c.beginPath();c.arc(cx,cy,R*1.12,0,TAU);c.fill();c.fillStyle=GOLD;c.beginPath();c.arc(cx,cy,R,0,TAU);c.fill();c.fillStyle='#14181a';c.beginPath();c.arc(cx,cy,R*.86,0,TAU);c.fill();
  c.fillStyle='#f6f2e6';for(const[a,b]of[[-.42,-.36],[0,-.5],[.42,-.36],[-.5,-.02],[.5,-.02],[-.28,.2],[.28,.2]]){c.beginPath();c.arc(cx+a*R,cy+b*R,R*.27,0,TAU);c.fill();}
  c.fillStyle='#23272a';c.beginPath();c.ellipse(cx,cy+R*.12,R*.3,R*.38,0,0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(cx-R*.12,cy+R*.05,R*.05,0,TAU);c.arc(cx+R*.12,cy+R*.05,R*.05,0,TAU);c.fill();
  c.fillStyle=GOLD;c.beginPath();const t=cy-R*.78;c.moveTo(cx-R*.42,t);c.lineTo(cx-R*.42,t-R*.34);c.lineTo(cx-R*.2,t-R*.16);c.lineTo(cx,t-R*.4);c.lineTo(cx+R*.2,t-R*.16);c.lineTo(cx+R*.42,t-R*.34);c.lineTo(cx+R*.42,t);c.closePath();c.fill();}
};
const ZONE={cab:[20,12,182,138],trailer:[14,10,116,336]};
function composed(r,kind,paint,decal){
 const key=kind+':'+paint+':'+decal,hit=cache.get(key);if(hit)return hit;
 const P=PAINTS[paint]||PAINTS[0],img=r.images.routeTrucks;if(!img)return null;
 const rect=ROUTE_ATLAS.trucks.rects[kind==='cab'?P.cab.sprite:3];let c=crop(img,rect);
 if(kind==='cab'&&(P.cab.hue||P.cab.sat!==undefined||P.cab.light||P.cab.white))hueShift(c,P.cab);
 if(kind==='trailer'&&P.tint)tintBody(c,P.tint);
 const dp=DECAL_PAINT[decal];
 if(dp){const x=c.getContext('2d'),z=ZONE[kind];x.save();x.globalCompositeOperation='source-atop';x.globalAlpha=.94;x.beginPath();x.rect(...z);x.clip();dp(x,z[0],z[1],z[2],z[3]);x.restore();}
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
 if(L.horn){const n=L.horn*2,xs=n===2?[-20,20]:n===4?[-16,-22,16,22]:[-14,-20,-26,14,20,26];xs.forEach(x=>{const len=16;c.save();c.translate(x,-6);const g=c.createLinearGradient(-4,0,4,0);g.addColorStop(0,'#8a6a12');g.addColorStop(.4,'#ffe58a');g.addColorStop(1,'#a17c18');c.fillStyle=g;c.beginPath();c.moveTo(-1.3,0);c.lineTo(1.3,0);c.lineTo(3.4,-len);c.lineTo(-3.4,-len);c.closePath();c.fill();c.fillStyle='#2b2110';c.beginPath();c.ellipse(0,-len,3.4,1.5,0,0,TAU);c.fill();c.strokeStyle='#fff3b8';c.lineWidth=.8;c.beginPath();c.ellipse(0,-len,3.4,1.5,0,0,TAU);c.stroke();c.restore();});
  if(st.hornAge<.35){c.save();c.strokeStyle='rgba(255,246,190,'+(1-st.hornAge/.35)*.8+')';c.lineWidth=2;for(let k=0;k<3;k++){const rr=26+k*14+st.hornAge*80;c.beginPath();c.arc(0,-26,rr,-Math.PI*.8,-Math.PI*.2);c.stroke();}c.restore();}}
}
function stacks(r,c,u,st,t){const n=u?.exhaust||0;if(!n)return;
 for(const s of[-1,1]){const rad=2.6+n*1.15;c.save();c.translate(s*(RIG.cabW/2+2.6),5);
  c.fillStyle='rgba(10,16,16,.35)';c.beginPath();c.ellipse(4,6+n*2,rad+1,rad+3+n*2,0,0,TAU);c.fill();
  const g=c.createRadialGradient(-rad*.3,-rad*.3,.5,0,0,rad*1.2);g.addColorStop(0,'#ffffff');g.addColorStop(.45,'#b8c3c9');g.addColorStop(1,'#4b555b');c.fillStyle=g;c.beginPath();c.arc(0,0,rad,0,TAU);c.fill();
  c.fillStyle='#0b0e0f';c.beginPath();c.arc(0,0,rad*.55,0,TAU);c.fill();c.strokeStyle='#f1f6f8';c.lineWidth=1;c.beginPath();c.arc(0,0,rad*.98,0,TAU);c.stroke();
  if(n>=2){c.strokeStyle='#8f9ba1';c.lineWidth=1;c.beginPath();c.arc(0,0,rad*1.35,0,TAU);c.stroke();}
  if(n>=3||st.boost>0){const f=(n>=3?.7:.4)+Math.sin(t*38+s)*.25+(st.boost>0?.6:0),len=(8+n*4)*f*(st.boost>0?2.1:1);const g2=c.createLinearGradient(0,0,0,len);g2.addColorStop(0,'rgba(120,200,255,.95)');g2.addColorStop(.5,'rgba(70,120,255,.55)');g2.addColorStop(1,'rgba(70,120,255,0)');c.fillStyle=g2;c.beginPath();c.moveTo(-rad*.5,0);c.lineTo(rad*.5,0);c.lineTo(0,len);c.closePath();c.fill();}
  c.restore();}}
function trailerParts(r,c,u,st,t){
 const L=u||{},W=RIG.trailerW,H=RIG.trailerL;
 if(L.suspension){const n=L.suspension;for(const s of[-1,1])for(let i=0;i<n;i++){const y=H*(.2+.085*i)+3;c.save();c.translate(s*(W/2+4.4),y);c.fillStyle='#1a2a44';c.beginPath();c.roundRect(-3.4,-5,6.8,10,2.4);c.fill();const g=c.createLinearGradient(-3,0,3,0);g.addColorStop(0,'#2d6fd0');g.addColorStop(.45,'#8fc6ff');g.addColorStop(1,'#2459a8');c.fillStyle=g;c.beginPath();c.roundRect(-2.6,-4.2,5.2,8.4,2);c.fill();c.fillStyle='#d8e2e8';c.fillRect(-3,-5.2,6,1.7);c.fillRect(-3,3.5,6,1.7);c.restore();}}
 if(L.stability){const n=L.stability,y0=-H/2+4;for(const s of[-1,1]){c.save();c.translate(s*(W/2-9),y0);c.strokeStyle=chrome(c,-30,30);c.lineWidth=2.6;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.lineTo(s*-4,15);c.stroke();c.strokeStyle='#f1b72b';c.lineWidth=2;c.beginPath();for(let k=0;k<6;k++)c.lineTo((k%2?-2.6:2.6)+s*-1.5,3+k*2);c.stroke();dot(c,0,0,2.4,'#aab4ba');dot(c,s*-4,15,2,'#aab4ba');c.restore();}
  if(n>=2){c.strokeStyle='#58ffa8';c.lineWidth=2;c.globalAlpha=.85;c.beginPath();c.moveTo(-W/2+4,-H/2+1.5);c.lineTo(W/2-4,-H/2+1.5);c.stroke();c.globalAlpha=1;glow(c,0,-H/2+2,26,'#58ffa855');}
  if(n>=3){for(const s of[-1,1]){c.strokeStyle='#58ffa8';c.lineWidth=1.8;c.globalAlpha=.7+Math.sin(t*5)*.2;c.beginPath();c.moveTo(s*(W/2-1),-H/2+14);c.lineTo(s*(W/2-1),H*.12);c.stroke();c.globalAlpha=1;}}}
 if(L.insurance>=3){c.save();c.translate(W/2-13,-H/2+20);c.fillStyle='#14181a';c.beginPath();c.moveTo(-6,-6);c.lineTo(6,-6);c.lineTo(6,2);c.lineTo(0,8);c.lineTo(-6,2);c.closePath();c.fill();c.fillStyle=GOLD;c.beginPath();c.moveTo(-4.5,-4.5);c.lineTo(4.5,-4.5);c.lineTo(4.5,1.4);c.lineTo(0,5.8);c.lineTo(-4.5,1.4);c.closePath();c.fill();c.restore();}
}
/* st: {truck,decal,trailerPaint,trailerDecal,upgrades,lane,x,angle,trailer,rear,hasTrailer,job,grip,boost,shield,hornAge}
   scale: extra magnification (garage). ys: vertical squash (the game camera is tilted). */
export function drawRig(r,st,px,py,alpha=1,scale=1,ys=.72,time=0){
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
export function drawTrailerOnly(r,paint,decal,x,y,w,h,angle,alpha){const t=composed(r,'trailer',paint,decal);if(!t)return;const c=r.ctx;c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(angle);c.drawImage(t,-w/2,-h/2,w,h);c.restore();}

/* Little upright thumbnails for the garage cards (cab or trailer, with paint + roof graphic). Cached data URLs. */
const thumbs=new Map();
export function thumb(r,kind,paint,decal){const key=kind+':'+paint+':'+decal;if(thumbs.has(key))return thumbs.get(key);
 const src=composed(r,kind,paint,decal);if(!src)return '';const c=mk(Math.round(src.width*.55),Math.round(src.height*.55));c.getContext('2d').drawImage(src,0,0,c.width,c.height);
 const url=c.toDataURL('image/png');thumbs.set(key,url);return url;}
