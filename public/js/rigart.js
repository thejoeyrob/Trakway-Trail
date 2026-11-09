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
 1(c,x,y,w,h,part){ // PINSTRIPE: fine double gold keylines running along the roof edges
  for(const [i,a] of [[.06,1],[.1,.55]]){c.strokeStyle=GOLD;c.globalAlpha=a;c.lineWidth=part==='cab'?2:2.6;c.beginPath();c.roundRect(x+w*i,y+h*(i*.5),w*(1-2*i),h*(1-i*1.0),6);c.stroke();}
  c.globalAlpha=1;if(part==='trailer'){c.strokeStyle=GOLD;c.lineWidth=2.4;c.beginPath();c.moveTo(x+w/2,y+h*.04);c.lineTo(x+w/2,y+h*.96);c.stroke();}},
 2(c,x,y,w,h,part){ // HAULIER: company lettering along the roof, like a real fleet number
  c.fillStyle='#1b2024';c.textAlign='center';c.textBaseline='middle';
  if(part==='trailer'){c.save();c.translate(x+w/2,y+h*.5);c.rotate(-Math.PI/2);c.font='900 '+Math.round(w*.62)+'px "Arial Black",Impact,-apple-system,sans-serif';c.fillText('JW EDS',0,-w*.04);c.fillStyle=GOLD;c.fillRect(-h*.3,w*.3,h*.6,w*.05);c.restore();}
  else{c.save();c.translate(x+w/2,y+h*.78);c.font='900 '+Math.round(w*.2)+'px "Arial Black",Impact,-apple-system,sans-serif';c.fillText('JW EDS',0,0);c.restore();}},
 3(c,x,y,w,h,part){ // HI-VIS: red and white conspicuity tape around the edge, as on a real rear marker board
  const t=part==='cab'?7:9,seg=part==='cab'?10:13;
  const tape=(x0,y0,x1,y1)=>{const len=Math.hypot(x1-x0,y1-y0),ang=Math.atan2(y1-y0,x1-x0);c.save();c.translate(x0,y0);c.rotate(ang);for(let i=0;i*seg<len;i++){c.fillStyle=i%2?'#f4f4ee':'#d3262a';c.fillRect(i*seg,-t/2,Math.min(seg,len-i*seg),t);}c.restore();};
  const m=part==='cab'?w*.04:w*.05;tape(x+m,y+m,x+w-m,y+m);tape(x+m,y+h-m,x+w-m,y+h-m);if(part==='trailer'){tape(x+m,y+m,x+m,y+h-m);tape(x+w-m,y+m,x+w-m,y+h-m);}},
 4(c,x,y,w,h,part){ // TWO-TONE: a navy block across the rear of the trailer, cut on a clean diagonal, with a cyan keyline
  if(part==='cab'){c.fillStyle='#37e6d3';c.fillRect(x+w*.04,y+h*.02,w*.92,4);c.fillStyle='#0f1b2d';c.fillRect(x+w*.04,y+h*.02+4,w*.92,3);return;}
  c.fillStyle='#10213a';c.beginPath();c.moveTo(x,y+h*.52);c.lineTo(x+w,y+h*.4);c.lineTo(x+w,y+h);c.lineTo(x,y+h);c.closePath();c.fill();
  c.strokeStyle='#37e6d3';c.lineWidth=4;c.beginPath();c.moveTo(x,y+h*.5);c.lineTo(x+w,y+h*.38);c.stroke();},
 5(c,x,y,w,h,part){ // CREST: a gold-ringed sheep crest, centred like a heraldic roof badge
  const cx=x+w/2,cy=part==='cab'?y+h*.55:y+h*.5,R=part==='cab'?w*.17:w*.3;
  c.fillStyle='#16191c';c.beginPath();c.arc(cx,cy,R*1.1,0,TAU);c.fill();c.strokeStyle=GOLD;c.lineWidth=R*.14;c.beginPath();c.arc(cx,cy,R*.98,0,TAU);c.stroke();
  c.fillStyle='#f6f2e6';for(const[a,b]of[[-.42,-.36],[0,-.5],[.42,-.36],[-.5,-.02],[.5,-.02],[-.28,.2],[.28,.2]]){c.beginPath();c.arc(cx+a*R*.8,cy+b*R*.8,R*.22,0,TAU);c.fill();}
  c.fillStyle='#23272a';c.beginPath();c.ellipse(cx,cy+R*.12,R*.24,R*.3,0,0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(cx-R*.1,cy+R*.05,R*.04,0,TAU);c.arc(cx+R*.1,cy+R*.05,R*.04,0,TAU);c.fill();
  if(part==='trailer'){c.strokeStyle=GOLD;c.lineWidth=2.4;c.strokeRect(x+w*.08,y+h*.03,w*.84,h*.94);}}
};
const ZONE={cab:[22,14,178,52],trailer:[16,12,112,330]};
function composed(r,kind,paint,decal){
 const key=kind+':'+paint+':'+decal,hit=cache.get(key);if(hit)return hit;
 const P=PAINTS[paint]||PAINTS[0],img=r.images.routeTrucks;if(!img)return null;
 const rect=ROUTE_ATLAS.trucks.rects[kind==='cab'?P.cab.sprite:3];let c=crop(img,rect);
 if(kind==='cab'&&(P.cab.hue||P.cab.sat!==undefined||P.cab.light||P.cab.white))hueShift(c,P.cab);
 if(kind==='trailer'&&P.tint)tintBody(c,P.tint);
 const dp=DECAL_PAINT[decal];
 if(dp){const x=c.getContext('2d'),z=ZONE[kind];x.save();x.globalCompositeOperation='source-atop';x.globalAlpha=.94;x.beginPath();x.rect(...z);x.clip();dp(x,z[0],z[1],z[2],z[3],kind);x.restore();
  // put the original panel ribbing and lighting back over the graphic so it reads as paint, not a sticker
  x.save();x.globalCompositeOperation='soft-light';x.globalAlpha=.9;x.drawImage(crop(img,rect),0,0);x.restore();}
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
