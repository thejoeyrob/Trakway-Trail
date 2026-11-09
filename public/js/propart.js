/* Hand-drawn top-down props (no image files): cow, tractor, hay bale, ice-cream van, geese, lucky horseshoe.
   Each draws centred on (0,0) inside a w x h box, lit from the top-left like the painted atlas art. t = seconds, for tail swish, beacons, etc. */
const TAU=Math.PI*2;
function shadow(c,w,h,a=.28){c.save();c.fillStyle='rgba(8,18,14,'+a+')';c.beginPath();c.ellipse(w*.06,h*.05,w*.5,h*.5,0,0,TAU);c.fill();c.restore();}
function blob(c,x,y,rx,ry,fill,rot=0){c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,rot,0,TAU);c.fill();}
function rr(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
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
export const HAS_ART=Object.keys(ART);
export function drawProp(c,kind,w,h,t=0){const f=ART[kind];if(!f)return false;c.save();f(c,w,h,t);c.restore();return true;}
