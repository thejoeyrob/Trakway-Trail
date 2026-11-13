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
  shadow(c,w*1.0,h*.82);
  const sw=Math.sin(t*3)*3,ink='#1d1f20';
  c.strokeStyle='#d9d3c3';c.lineWidth=2.6;c.lineCap='round';c.beginPath();c.moveTo(0,-h*.3);c.quadraticCurveTo(sw*1.4,-h*.43,sw*2.2,-h*.5);c.stroke();blob(c,sw*2.2,-h*.5,3,4.2,ink);   // tail
  for(const [x,y] of [[-.29,-.2],[.29,-.2],[-.29,.14],[.29,.14]]){blob(c,x*w,y*h,w*.075,h*.065,'#2a2622');blob(c,x*w-1,y*h-1,w*.03,h*.02,'#ffffff30');}   // hooves
  // body: big Friesian patches
  c.save();c.beginPath();c.roundRect(-w*.4,-h*.35,w*.8,h*.64,w*.3);c.clip();
  c.fillStyle=grad(c,-w*.4,0,w*.4,0,'#fffdf6','#e4dfd0');c.fillRect(-w*.5,-h*.4,w,h*.8);
  c.fillStyle=ink;for(const [x,y,rx,ry,r] of [[-.16,-.2,.2,.14,.5],[.2,-.05,.22,.17,-.4],[-.12,.17,.16,.1,.2],[.24,.2,.1,.08,0],[-.3,.02,.08,.12,.3]]){c.beginPath();c.ellipse(x*w,y*h,rx*w,ry*h,r,0,TAU);c.fill();}
  c.fillStyle='#ffffff2e';c.beginPath();c.ellipse(-w*.16,-h*.22,w*.18,h*.05,0,0,TAU);c.fill();c.restore();
  c.strokeStyle=ink;c.lineWidth=1.6;c.beginPath();c.roundRect(-w*.4,-h*.35,w*.8,h*.64,w*.3);c.stroke();
  c.strokeStyle='#bdb7a6';c.lineWidth=1.3;c.beginPath();c.moveTo(0,-h*.33);c.lineTo(0,h*.27);c.stroke();   // spine
  // head, looking at you
  blob(c,0,h*.37,w*.25,h*.16,'#f3efe2');c.strokeStyle=ink;c.lineWidth=1.4;c.beginPath();c.ellipse(0,h*.37,w*.25,h*.16,0,0,TAU);c.stroke();
  blob(c,-w*.1,h*.33,w*.1,h*.07,ink);blob(c,0,h*.45,w*.17,h*.08,'#f5b3ae');blob(c,-w*.055,h*.46,1.8,1.5,'#7a3b3b');blob(c,w*.055,h*.46,1.8,1.5,'#7a3b3b');
  blob(c,-w*.13,h*.34,3,3.2,'#101010');blob(c,w*.13,h*.34,3,3.2,'#101010');blob(c,-w*.12,h*.335,1,1,'#fff');blob(c,w*.14,h*.335,1,1,'#fff');
  blob(c,-w*.31,h*.32,w*.1,h*.045,'#ebe5d4',-.4);blob(c,w*.31,h*.32,w*.1,h*.045,'#ebe5d4',.4);   // ears
  c.strokeStyle='#efe0ab';c.lineWidth=3;c.beginPath();c.moveTo(-w*.17,h*.27);c.lineTo(-w*.22,h*.22);c.moveTo(w*.17,h*.27);c.lineTo(w*.22,h*.22);c.stroke();   // horns
 },
 tractor(c,w,h,t){
  shadow(c,w*1.08,h*.96);const ink='#14201a',G='#2f9f55',G2='#1f6f3b';
  // big rear wheels with tread, small front wheels
  for(const s2 of[-1,1]){const x=s2*w*.47;
   c.fillStyle='#161a19';rr(c,x-w*.13,h*.0,w*.26,h*.4,6);c.fill();c.strokeStyle='#3a4240';c.lineWidth=1.4;for(let i=0;i<9;i++){const y=h*.02+i*h*.042;c.beginPath();c.moveTo(x-w*.13,y);c.lineTo(x+w*.13,y+3);c.stroke();}
   c.fillStyle='#f0c21a';rr(c,x-w*.035,h*.1,w*.07,h*.2,2);c.fill();
   c.fillStyle='#161a19';rr(c,s2*w*.4-w*.075,-h*.36,w*.15,h*.17,4);c.fill();c.fillStyle='#f0c21a';rr(c,s2*w*.4-w*.02,-h*.32,w*.04,h*.09,2);c.fill();}
  // axle, bonnet, front weight
  c.fillStyle='#2b3330';rr(c,-w*.4,-h*.28,w*.8,h*.035,2);c.fill();
  c.fillStyle='#5a625f';rr(c,-w*.15,-h*.53,w*.3,h*.06,3);c.fill();
  c.fillStyle=grad(c,-w*.25,0,w*.25,0,G,G2);rr(c,-w*.24,-h*.5,w*.48,h*.5,10);c.fill();c.strokeStyle=ink;c.lineWidth=1.6;rr(c,-w*.24,-h*.5,w*.48,h*.5,10);c.stroke();
  c.fillStyle='#ffffff33';rr(c,-w*.19,-h*.47,w*.1,h*.42,4);c.fill();c.fillStyle='#f0c21a';c.fillRect(-w*.24,-h*.27,w*.48,h*.03);
  c.fillStyle='#1a2220';for(let i=0;i<4;i++)c.fillRect(-w*.17,-h*.49+i*h*.016,w*.34,h*.008);                // grille
  blob(c,-w*.17,-h*.505,3.2,2.2,'#fffbe0');blob(c,w*.17,-h*.505,3.2,2.2,'#fffbe0');
  c.fillStyle='#262c2a';c.beginPath();c.arc(w*.13,-h*.2,3.6,0,TAU);c.fill();c.fillStyle='#9aa4a0';c.beginPath();c.arc(w*.13,-h*.2,2,0,TAU);c.fill();    // exhaust stack
  // cab
  c.fillStyle='#e9ece6';rr(c,-w*.3,-h*.03,w*.6,h*.37,9);c.fill();c.strokeStyle=ink;c.lineWidth=1.6;rr(c,-w*.3,-h*.03,w*.6,h*.37,9);c.stroke();
  c.fillStyle='#2f5b66';rr(c,-w*.25,0,w*.5,h*.07,3);c.fill();rr(c,-w*.25,h*.26,w*.5,h*.06,3);c.fill();rr(c,-w*.27,h*.07,w*.05,h*.19,2);c.fill();rr(c,w*.22,h*.07,w*.05,h*.19,2);c.fill();   // glass round the roof
  c.fillStyle='#ffffff66';c.fillRect(-w*.2,h*.12,w*.4,2);c.fillStyle='#cfd5cf';rr(c,-w*.18,h*.1,w*.36,h*.14,3);c.fill();
  blob(c,-w*.34,h*.04,3,4,'#242b29');blob(c,w*.34,h*.04,3,4,'#242b29');                                               // mirrors
  c.fillStyle=G2;rr(c,-w*.12,h*.34,w*.24,h*.05,2);c.fill();c.fillStyle='#2a2f2d';c.fillRect(-w*.03,h*.39,w*.06,h*.07);                                 // rear hitch
  const on=Math.sin(t*9)>0;c.fillStyle=on?'#ffb52e':'#9a6a14';c.beginPath();c.arc(0,h*.17,3.8,0,TAU);c.fill();if(on)glowSpot(c,0,h*.17);
 },
 icecream(c,w,h,t){
  shadow(c,w*1.08,h*.96);const ink='#2a2230';
  // wheels, serving-hatch awning on the right
  c.fillStyle='#161a1a';for(const y of[-.3,.28])for(const s2 of[-1,1]){rr(c,s2*w*.49-w*.065,h*y-h*.07,w*.13,h*.14,3);c.fill();}
  c.fillStyle='#fff';c.beginPath();c.moveTo(w*.38,h*.0);c.lineTo(w*.66,h*.05);c.lineTo(w*.66,h*.27);c.lineTo(w*.38,h*.3);c.closePath();c.fill();
  c.fillStyle='#ff6fa5';for(let i=0;i<5;i++){c.beginPath();const y0=h*(.0+i*.06),y1=y0+h*.03;c.moveTo(w*.38,y0);c.lineTo(w*.66,y0+h*.012);c.lineTo(w*.66,y1+h*.012);c.lineTo(w*.38,y1);c.closePath();c.fill();}
  c.strokeStyle=ink;c.lineWidth=1.3;c.beginPath();c.moveTo(w*.38,0);c.lineTo(w*.66,h*.05);c.lineTo(w*.66,h*.27);c.lineTo(w*.38,h*.3);c.stroke();
  // body
  c.fillStyle=grad(c,-w*.4,0,w*.4,0,'#fffaf0','#e8dcc6');rr(c,-w*.4,-h*.47,w*.8,h*.94,w*.17);c.fill();c.strokeStyle=ink;c.lineWidth=1.8;rr(c,-w*.4,-h*.47,w*.8,h*.94,w*.17);c.stroke();
  c.fillStyle='#ff6fa5';rr(c,-w*.4,h*.04,w*.12,h*.43,6);c.fill();c.fillStyle='#35c4d2';rr(c,-w*.28,h*.04,w*.05,h*.43,2);c.fill();
  // cab: windscreen, bonnet, headlamps
  c.fillStyle='#41555d';rr(c,-w*.3,-h*.42,w*.6,h*.14,6);c.fill();c.fillStyle='#ffffff55';c.fillRect(-w*.24,-h*.405,w*.48,2.5);
  blob(c,-w*.3,-h*.475,3.4,2.4,'#fff7c8');blob(c,w*.3,-h*.475,3.4,2.4,'#fff7c8');
  // roof sign board with the lettering, and the giant cone
  c.fillStyle='#fff';rr(c,-w*.2,-h*.24,w*.4,h*.62,6);c.fill();c.strokeStyle='#ff6fa5';c.lineWidth=2.4;rr(c,-w*.2,-h*.24,w*.4,h*.62,6);c.stroke();
  c.save();c.translate(0,h*.1);c.rotate(Math.PI/2);c.fillStyle='#e0457f';c.font='900 '+Math.round(w*.17)+'px "Barlow Semi Condensed","Arial Narrow",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('ICE CREAM',0,0,h*.5);c.restore();
  c.fillStyle='#e9b25f';c.beginPath();c.moveTo(-w*.1,-h*.18);c.lineTo(w*.1,-h*.18);c.lineTo(0,-h*.02);c.closePath();c.fill();c.strokeStyle='#b57d2e';c.lineWidth=1;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*w*.04,-h*.18);c.lineTo(0,-h*.03);c.stroke();}
  blob(c,0,-h*.215,w*.12,w*.1,'#ff9fc4');blob(c,-w*.02,-h*.235,w*.075,w*.06,'#ffd1e3');blob(c,0,-h*.255,w*.04,w*.035,'#d8466f');       // swirl and cherry
  c.fillStyle='#2d3436';rr(c,-w*.12,h*.4,w*.24,h*.055,3);c.fill();                                                                       // chime speaker
  const on=Math.sin(t*6)>0;c.fillStyle=on?'#ffe14a':'#9c8a2e';c.beginPath();c.arc(-w*.35,-h*.4,2.8,0,TAU);c.arc(w*.35,-h*.4,2.8,0,TAU);c.fill();
 },
 caravan(c,w,h,t){
  shadow(c,w*1.1,h*.96);const ink='#1d2733';
  const ch=h*.3,cy=-h*.5+ch/2+2;
  c.fillStyle='#161a1a';for(const y of[-.4,-.2])for(const s2 of[-1,1]){rr(c,s2*w*.36-w*.05,h*y-h*.04,w*.1,h*.08,2);c.fill();}
  c.fillStyle=grad(c,-w*.35,0,w*.35,0,'#4a86dc','#27529c');rr(c,-w*.34,cy-ch/2,w*.68,ch,10);c.fill();c.strokeStyle=ink;c.lineWidth=1.6;rr(c,-w*.34,cy-ch/2,w*.68,ch,10);c.stroke();
  c.fillStyle='#22364f';rr(c,-w*.26,cy-ch*.12,w*.52,ch*.34,5);c.fill();rr(c,-w*.26,cy-ch*.44,w*.52,ch*.22,5);c.fill();c.fillStyle='#ffffff40';c.fillRect(-w*.22,cy-ch*.4,w*.44,2);
  blob(c,-w*.24,cy-ch*.5,2.6,1.8,'#fff7c8');blob(c,w*.24,cy-ch*.5,2.6,1.8,'#fff7c8');
  c.strokeStyle='#4b5257';c.lineWidth=2.6;c.beginPath();c.moveTo(0,cy+ch/2);c.lineTo(0,cy+ch/2+h*.07);c.stroke();                       // towbar
  const by=cy+ch/2+h*.07,bh=h-(by+h/2)-2;
  c.fillStyle='#161a1a';for(const s2 of[-1,1]){rr(c,s2*w*.43-w*.045,by+bh*.55,w*.09,h*.12,2);c.fill();}
  c.fillStyle=grad(c,-w*.4,0,w*.4,0,'#fffaf0','#ddd1b6');rr(c,-w*.4,by,w*.8,bh,11);c.fill();c.strokeStyle=ink;c.lineWidth=1.8;rr(c,-w*.4,by,w*.8,bh,11);c.stroke();
  c.fillStyle='#cdd3d7';rr(c,-w*.14,by+bh*.18,w*.28,bh*.14,3);c.fill();rr(c,-w*.2,by+bh*.5,w*.4,bh*.12,3);c.fill();c.strokeStyle='#8a949a';c.lineWidth=1;c.strokeRect(-w*.14,by+bh*.18,w*.28,bh*.14);
  c.strokeStyle='#e9a73a';c.lineWidth=3.4;c.beginPath();c.moveTo(-w*.4,by+bh*.38);c.lineTo(w*.4,by+bh*.38);c.stroke();c.strokeStyle='#3a7bd0';c.lineWidth=1.6;c.beginPath();c.moveTo(-w*.4,by+bh*.44);c.lineTo(w*.4,by+bh*.44);c.stroke();
  c.fillStyle='#d33';c.fillRect(-w*.3,by+bh-3,6,3);c.fillRect(w*.3-6,by+bh-3,6,3);
 },
 binlorry(c,w,h,t){
  shadow(c,w*1.08,h*.96);const ink='#12251a';
  c.fillStyle='#161a1a';for(const y of[.2,.36,-.32])for(const s2 of[-1,1]){rr(c,s2*w*.48-w*.065,h*y-h*.07,w*.13,h*.14,3);c.fill();}
  // body and hopper
  c.fillStyle=grad(c,-w*.4,0,w*.4,0,'#34a05d','#1d6b3b');rr(c,-w*.4,-h*.2,w*.8,h*.68,9);c.fill();c.strokeStyle=ink;c.lineWidth=1.8;rr(c,-w*.4,-h*.2,w*.8,h*.68,9);c.stroke();
  c.fillStyle='#ffffff2e';rr(c,-w*.34,-h*.18,w*.1,h*.5,4);c.fill();
  c.fillStyle='#0f3a25';rr(c,-w*.3,h*.08,w*.6,h*.34,6);c.fill();c.strokeStyle='#8ed3a6';c.lineWidth=1.3;for(let i=0;i<6;i++){c.beginPath();c.moveTo(-w*.28,h*.12+i*h*.05);c.lineTo(w*.28,h*.12+i*h*.05);c.stroke();}
  c.fillStyle='#fff';c.font='900 '+Math.round(w*.17)+'px "Barlow Semi Condensed","Arial Narrow",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('REFUSE',0,-h*.02);
  // rear lift bar and hi-vis chevrons
  c.strokeStyle='#9aa7a2';c.lineWidth=3;c.beginPath();c.moveTo(-w*.3,h*.47);c.lineTo(w*.3,h*.47);c.stroke();
  for(let i=0;i<8;i++){c.fillStyle=i%2?'#f6e21c':'#d6262a';c.beginPath();const x0=-w*.36+i*w*.09;c.moveTo(x0,h*.5);c.lineTo(x0+w*.09,h*.5);c.lineTo(x0+w*.045,h*.455);c.lineTo(x0-w*.045,h*.455);c.closePath();c.fill();}
  // cab
  c.fillStyle=grad(c,-w*.3,0,w*.3,0,'#f7f4ea','#cfc9b6');rr(c,-w*.34,-h*.49,w*.68,h*.3,9);c.fill();c.strokeStyle=ink;c.lineWidth=1.6;rr(c,-w*.34,-h*.49,w*.68,h*.3,9);c.stroke();
  c.fillStyle='#41565c';rr(c,-w*.27,-h*.46,w*.54,h*.11,4);c.fill();c.fillStyle='#ffffff55';c.fillRect(-w*.22,-h*.445,w*.44,2);
  blob(c,-w*.27,-h*.495,3,2.2,'#fff7c8');blob(c,w*.27,-h*.495,3,2.2,'#fff7c8');
  const on=Math.sin(t*8)>0;c.fillStyle=on?'#ffb52e':'#8a5d12';c.beginPath();c.arc(-w*.2,-h*.2,3.6,0,TAU);c.arc(w*.2,-h*.2,3.6,0,TAU);c.fill();if(on){glowSpot(c,-w*.2,-h*.2);glowSpot(c,w*.2,-h*.2);}
  for(const s2 of[-1,1]){c.fillStyle='#2b6dd0';rr(c,s2*w*.6-w*.08,h*.2,w*.16,h*.14,3);c.fill();c.fillStyle='#1d3f78';rr(c,s2*w*.6-w*.08,h*.2,w*.16,h*.045,2);c.fill();c.strokeStyle=ink;c.lineWidth=1;rr(c,s2*w*.6-w*.08,h*.2,w*.16,h*.14,3);c.stroke();}   // wheelie bins
 },
 haybale(c,w,h,t){
  shadow(c,w*.95,h*.95);
  c.fillStyle=grad(c,-w*.4,-h*.4,w*.4,h*.4,'#f0cf6e','#c79a35');rr(c,-w*.42,-h*.4,w*.84,h*.8,h*.2);c.fill();
  c.strokeStyle='#a97b22';c.lineWidth=1.1;for(let i=-4;i<=4;i++){c.beginPath();c.moveTo(-w*.4,i*h*.085);c.lineTo(w*.4,i*h*.085+Math.sin(i)*2);c.stroke();}
  c.strokeStyle='#d9692a';c.lineWidth=3;for(const x of[-w*.2,w*.2]){c.beginPath();c.moveTo(x,-h*.4);c.lineTo(x,h*.4);c.stroke();}
  c.strokeStyle='#ffe9a0aa';c.lineWidth=1.4;for(let i=0;i<9;i++){const x=((i*37)%80-40)/40*w*.35,y=((i*53)%80-40)/40*h*.32;c.beginPath();c.moveTo(x,y);c.lineTo(x+5,y-4);c.stroke();}
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

/* Optional painted vehicle art: if assets/route-v2/vehicles.webp exists (a 4 x 4 grid, see docs/VEHICLE-ART-PROMPT.md) the game uses it instead of the drawn versions. */
export const VEHICLE_CELLS={cow:0,tractor:1,icecream:2,binlorry:3,caravan:4,haybale:5,geese:6,morris:7,cyclists:8};
export function drawVehicle(c,img,kind,w,h,t){const cell=VEHICLE_CELLS[kind];
 if(img&&cell!==undefined){const cw=img.width/4,ch=img.height/4,sx=(cell%4)*cw,sy=Math.floor(cell/4)*ch,k=Math.min(w/cw,h/ch);c.drawImage(img,sx,sy,cw,ch,-cw*k/2,-ch*k/2,cw*k,ch*k);return true;}
 return drawProp(c,kind,w,h,t);}
