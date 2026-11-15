/* Painted building fronts for the chase camera. Each is drawn once into a canvas and then stretched along the roadside on a plane that FACES the
   road (so you see terraces, shops and tower blocks the way you really would from a lorry, not a house turned to face you). Style follows the
   welcome-page illustrations: glossy flat colour, soft top light, no photo-realism. */
const cache=new Map();
const BRICK=['#b5533c','#a24b36','#c97a4c','#8f5a46','#b8a07a','#9b4a3a','#c08a5c'];
const DOORS=['#2d5aa8','#2a7a4a','#a02a2a','#262a30','#e0a82e','#6a3fa0'];
const WALLS=['#efe6d2','#e8d9b8','#d8e3d0','#e9d2c0','#f3efe6'];
const SHOPS=['#c8372d','#2f6fa8','#2f8a52','#e0a82e','#7a3f9a','#e86a2e'];
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const rr=(x,a,b,w,h,r)=>{x.beginPath();x.roundRect(a,b,w,h,r);};
function lg(x,y0,y1,a,b){const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
function window2(x,a,b,w,h,lit){
 x.fillStyle='#f5f1e6';rr(x,a-2,b-2,w+4,h+4,2);x.fill();
 x.fillStyle=lit?lg(x,b,b+h,'#ffe9a8','#f2c868'):lg(x,b,b+h,'#9bc6e0','#4d7da0');rr(x,a,b,w,h,1.5);x.fill();
 x.fillStyle='#f5f1e6';x.fillRect(a+w/2-.8,b,1.6,h);x.fillRect(a,b+h*.45,w,1.4);
 x.fillStyle='rgba(255,255,255,.28)';x.beginPath();x.moveTo(a+2,b+h-2);x.lineTo(a+w*.45,b+2);x.lineTo(a+w*.62,b+2);x.lineTo(a+w*.18,b+h-2);x.fill();
 x.fillStyle='#d8d0bc';x.fillRect(a-3,b+h+2,w+6,3);
}
function slateRoof(x,w,top,h,col){
 x.fillStyle=lg(x,top,top+h,col,'#262c34');x.fillRect(0,top,w,h);
 x.fillStyle='rgba(255,255,255,.07)';for(let i=top+3;i<top+h;i+=5)x.fillRect(0,i,w,1.2);
}
const PAINT={
 terrace(x,w,h,v){ // two storeys, two houses across
  const brick=BRICK[v%BRICK.length];x.fillStyle=lg(x,0,h,brick,'#00000030');x.fillRect(0,h*.2,w,h*.8);
  x.fillStyle='rgba(0,0,0,.10)';for(let y=h*.2;y<h;y+=4)x.fillRect(0,y,w,.8);
  slateRoof(x,w,0,h*.2,'#5a6672');x.fillStyle='#8a4a3a';for(const cx of[w*.25,w*.75]){x.fillRect(cx-5,-6,10,16);x.fillStyle='#4a2a22';x.fillRect(cx-6,-6,12,3);x.fillStyle='#8a4a3a';}
  for(let i=0;i<2;i++){const ox=i*w/2;
   window2(x,ox+w*.07,h*.34,w*.12,h*.2,v%3===0);window2(x,ox+w*.3,h*.34,w*.12,h*.2,v%2===0);
   window2(x,ox+w*.07,h*.66,w*.12,h*.2,false);
   x.fillStyle=DOORS[(v+i*2)%DOORS.length];rr(x,ox+w*.3,h*.62,w*.1,h*.36,2);x.fill();x.fillStyle='#e8d890';x.fillRect(ox+w*.375,h*.8,2,2);
   x.fillStyle='#e8e0cc';x.fillRect(ox+w*.28,h*.6,w*.14,3);}
  x.fillStyle='#4f7a3c';x.fillRect(0,h*.96,w,h*.04);},
 semi(x,w,h,v){ // two semi-detached halves, hipped roof, bay window, drive
  const wall=WALLS[v%WALLS.length];x.fillStyle=lg(x,0,h,wall,'#00000028');x.fillRect(0,h*.28,w,h*.7);
  x.fillStyle=BRICK[v%BRICK.length];x.fillRect(0,h*.78,w,h*.2);
  x.fillStyle=lg(x,0,h*.3,'#7a4a3a','#4a2e28');x.beginPath();x.moveTo(-4,h*.3);x.lineTo(w*.12,0);x.lineTo(w*.88,0);x.lineTo(w+4,h*.3);x.closePath();x.fill();
  for(let i=0;i<2;i++){const ox=i*w/2;
   window2(x,ox+w*.06,h*.4,w*.14,h*.2,v%2===0);window2(x,ox+w*.28,h*.4,w*.1,h*.2,false);
   x.fillStyle='#e8e0cc';rr(x,ox+w*.05,h*.62,w*.18,h*.28,3);x.fill();window2(x,ox+w*.07,h*.65,w*.14,h*.16,false);
   x.fillStyle=DOORS[(v+i)%DOORS.length];rr(x,ox+w*.3,h*.64,w*.08,h*.34,2);x.fill();}
  x.fillStyle='#3f7a35';x.fillRect(0,h*.95,w,h*.05);},
 shops(x,w,h,v){
  const up=BRICK[(v+2)%BRICK.length];x.fillStyle=lg(x,0,h,up,'#00000030');x.fillRect(0,0,w,h);
  slateRoof(x,w,0,h*.1,'#58646f');
  for(let i=0;i<2;i++){const ox=i*w/2,col=SHOPS[(v+i*2)%SHOPS.length];
   window2(x,ox+w*.07,h*.18,w*.1,h*.2,false);window2(x,ox+w*.25,h*.18,w*.1,h*.2,v%2===0);
   x.fillStyle=col;x.fillRect(ox+2,h*.45,w/2-4,h*.12);for(let k=0;k<8;k++){x.fillStyle=k%2?'#f4f1e6':col;x.fillRect(ox+4+k*(w/2-8)/8,h*.58,(w/2-8)/8,h*.08);}
   x.fillStyle=lg(x,h*.66,h,'#ffe9b0','#e0b060');x.fillRect(ox+6,h*.67,w/2-12,h*.3);
   for(let k=0;k<3;k++){x.fillStyle=['#c8372d','#2f8a52','#e0a82e'][(k+v)%3];x.fillRect(ox+10+k*(w/2-24)/3,h*.84,(w/2-30)/3,h*.12);}
   x.fillStyle='#2a2e34';x.fillRect(ox+w*.36,h*.67,w*.07,h*.31);}
  x.fillStyle='#8a8a86';x.fillRect(0,h*.97,w,h*.03);},
 flats(x,w,h,v){
  x.fillStyle=lg(x,0,h,BRICK[(v+1)%BRICK.length],'#00000035');x.fillRect(0,0,w,h);
  x.fillStyle='#d8d4c8';x.fillRect(0,0,w,h*.05);x.fillRect(0,h*.97,w,h*.03);
  const rows=Math.max(3,Math.round(h/30));for(let r=0;r<rows;r++)for(let k=0;k<4;k++){window2(x,w*(.06+k*.235),h*(.09+r*(.84/rows)),w*.13,h*(.84/rows)*.55,(r*3+k+v)%5===0);
   x.fillStyle='#ccc8bc';x.fillRect(w*(.045+k*.235),h*(.09+r*(.84/rows))+h*(.84/rows)*.62,w*.17,2);}
  x.fillStyle='#2a2e34';x.fillRect(w*.42,h*.9,w*.16,h*.1);},
 tower(x,w,h,v){
  const tone=[['#5a7a94','#2f4a60'],['#6a8a9a','#364e5a'],['#7a8794','#3d4650'],['#4f7a86','#27464e']][v%4];
  x.fillStyle=lg(x,0,h,tone[0],tone[1]);x.fillRect(0,0,w,h);
  x.fillStyle='rgba(255,255,255,.07)';x.fillRect(0,0,w*.5,h);
  const cols=6,rows=Math.max(6,Math.round(h/14));for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){const lit=((r*7+k*3+v)%6)===0;x.fillStyle=lit?'#ffe9a8':'rgba(180,220,245,.55)';x.fillRect(w*(.04+k*.155),h*(.04+r*.92/rows),w*.1,h*.92/rows*.58);}
  x.fillStyle='#c8d0d6';x.fillRect(0,0,w,h*.025);x.fillStyle='#e0e4e8';x.fillRect(w*.4,-8,w*.2,10);
  x.fillStyle='#252a30';x.fillRect(w*.38,h*.93,w*.24,h*.07);},
 cottage(x,w,h,v){
  x.fillStyle=lg(x,0,h,WALLS[v%WALLS.length],'#00000030');x.fillRect(w*.05,h*.35,w*.9,h*.63);
  x.fillStyle=lg(x,0,h*.45,'#c9a45a','#7a5a2a');x.beginPath();x.moveTo(-6,h*.46);x.quadraticCurveTo(w*.5,-h*.12,w+6,h*.46);x.lineTo(w+6,h*.5);x.lineTo(-6,h*.5);x.closePath();x.fill();
  x.fillStyle='rgba(60,40,10,.25)';for(let i=0;i<8;i++)x.fillRect(0,h*.1+i*5,w,1);
  window2(x,w*.14,h*.55,w*.16,h*.18,true);window2(x,w*.68,h*.55,w*.16,h*.18,false);
  x.fillStyle=DOORS[v%DOORS.length];rr(x,w*.43,h*.6,w*.14,h*.38,w*.07);x.fill();
  for(let i=0;i<14;i++){x.fillStyle=['#e86a8a','#f2c82e','#fff','#a86ae0'][i%4];x.beginPath();x.arc(w*.08+i*w*.065,h*.95-(i%3)*2,2.4,0,6.3);x.fill();}
  x.fillStyle='#4a8a38';x.fillRect(0,h*.94,w,h*.06);},
 barn(x,w,h,v){
  x.fillStyle=lg(x,0,h,v%2?'#9a3a2e':'#8a5a3a','#00000040');x.fillRect(w*.04,h*.3,w*.92,h*.7);
  x.fillStyle='#4a4c52';x.beginPath();x.moveTo(-4,h*.34);x.lineTo(w*.5,0);x.lineTo(w+4,h*.34);x.closePath();x.fill();
  x.fillStyle='#d8cfb8';rr(x,w*.32,h*.5,w*.36,h*.5,3);x.fill();x.strokeStyle='#8a2a22';x.lineWidth=3;x.strokeRect(w*.32,h*.5,w*.36,h*.5);x.beginPath();x.moveTo(w*.32,h*.5);x.lineTo(w*.68,h*1);x.moveTo(w*.68,h*.5);x.lineTo(w*.32,h*1);x.stroke();
  x.fillStyle='#e8e0c8';x.fillRect(w*.46,h*.38,w*.08,h*.08);},
 hedge(x,w,h,v){
  x.fillStyle=lg(x,0,h,'#4f8a3a','#2d5a26');x.fillRect(0,h*.2,w,h*.8);
  for(let i=0;i<46;i++){x.fillStyle=['#5fa043','#3f7a30','#6fb04c','#356a2a'][i%4];x.beginPath();x.arc((i*37.7)%w,h*.25+((i*13)%7)*h*.1,h*.22,0,6.3);x.fill();}
  x.fillStyle='rgba(0,0,0,.22)';x.fillRect(0,h*.88,w,h*.12);},
 wall(x,w,h,v){
  x.fillStyle=lg(x,0,h,'#b0a89a','#7a746a');x.fillRect(0,0,w,h);
  for(let r=0;r<4;r++)for(let k=0;k<9;k++){x.fillStyle='rgba(0,0,0,.18)';x.fillRect(k*w/8+(r%2)*w/16,r*h/4,1.4,h/4);}
  x.fillStyle='rgba(0,0,0,.2)';for(let r=1;r<4;r++)x.fillRect(0,r*h/4,w,1.4);x.fillStyle='#8a8478';x.fillRect(0,0,w,h*.12);},
 noise(x,w,h,v){
  x.fillStyle=lg(x,0,h,'#7fa08a','#5a7a68');x.fillRect(0,0,w,h);
  for(let k=0;k<=6;k++){x.fillStyle='#8a9aa0';x.fillRect(k*w/6-2,0,4,h);}
  x.fillStyle='rgba(0,0,0,.14)';for(let r=1;r<5;r++)x.fillRect(0,r*h/5,w,1.2);x.fillStyle='#b8c4c8';x.fillRect(0,0,w,h*.1);},
 embank(x,w,h,v){
  x.fillStyle=lg(x,0,h,'#6aa04a','#3d7330');x.fillRect(0,0,w,h);
  for(let i=0;i<34;i++){x.fillStyle=['#7ab858','#4f8a38','#5a9a40'][i%3];x.beginPath();x.ellipse((i*29.3)%w,h*.3+((i*17)%5)*h*.14,6,3,0,0,6.3);x.fill();}}
};
/* texture for a lot: darker on the side away from the sun (the right side of the road faces left, into the shade) */
export function facadeTexture(style,v,tall,side){
 const key=style+'|'+v+'|'+Math.round(tall/8)+'|'+side;let c=cache.get(key);if(c)return c;
 const W=192,H=Math.max(24,Math.round(tall));
 c=mk(W,H);const x=c.getContext('2d');(PAINT[style]||PAINT.hedge)(x,W,c.height,v);
 if(side>0){x.globalCompositeOperation='source-atop';x.fillStyle='rgba(18,30,50,.28)';x.fillRect(0,0,W,c.height);}
 cache.set(key,c);if(cache.size>160)cache.delete(cache.keys().next().value);return c;
}
