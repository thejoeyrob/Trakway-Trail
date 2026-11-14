/* TRUCKIN' & DRIVIN' — Chase Camera Detail & Object Art v1.
 * Adds fine material details to existing billboard actors; zero gameplay changes.
 * Calls happen within the object transform unless documented otherwise.
 */
const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const frac=n=>n-Math.floor(n);
const hash=n=>frac(Math.sin(n*72.672+21.97)*17373.338);
const rr=(c,x,y,w,h,r=2)=>{c.beginPath();c.roundRect(x,y,w,h,Math.max(0,r));};
export class ChaseDetailPro {
 constructor(renderer){this.r=renderer;}
 sceneryBase(c,p,x,y,sc,k){
  if(sc<.12)return;
  const w=(k==='house'||k==='shop'?130:k==='tree'?90:95)*sc;
  c.save();const gr=c.createRadialGradient(x,y,0,x,y,Math.max(10,w*.65));
  gr.addColorStop(0,'rgba(4,27,22,.24)');gr.addColorStop(1,'rgba(4,27,22,0)');
  c.fillStyle=gr;c.beginPath();c.ellipse(x,y,w*.6,Math.max(2,12*sc),0,0,TAU);c.fill();c.restore();
 }
 sceneryOverlay(c,p,w,h,k){
  if(w<10||h<10)return;
  const seed=(typeof p.id==='string'?p.id.length*101:p.z)||1;
  c.save();c.lineCap='round';
  if(k==='house'||k==='shop'||k==='garage'||k==='cabin'){
   // Fine masonry / cladding courses for a more dimensional building surface.
   c.lineWidth=Math.max(.55,w*.006);c.strokeStyle=k==='house'?'rgba(70,36,30,.22)':'rgba(30,35,43,.19)';
   const l=-w*.37,r=w*.37,dy=h*.082;
   for(let j=1;j<8;j++){
    const y=-h*.58+j*dy;if(y>-.02*h)break;
    c.beginPath();c.moveTo(l,y);c.lineTo(r,y);c.stroke();
    for(let i=0;i<5;i++){const x=l+(i+.5*(j%2))*((r-l)/5);c.beginPath();c.moveTo(x,y);c.lineTo(x,y+dy*.7);c.stroke();}
   }
   // Sunlit sash glass with frame crossbar and warm interior.
   if(k==='house'||k==='shop')for(const s of [-1,1]){
    const wx=s*w*.2,wy=k==='house'?-h*.43:-h*.41;
    c.fillStyle='rgba(255,218,149,.24)';c.fillRect(wx-w*.075,wy-h*.03,w*.13,h*.16);
    c.fillStyle='rgba(251,251,238,.53)';c.fillRect(wx-w*.005,wy-h*.03,w*.01,h*.16);
    c.fillRect(wx-w*.075,wy+h*.06,w*.13,h*.012);
    c.fillStyle='rgba(255,255,255,.33)';c.beginPath();c.moveTo(wx-w*.07,wy);c.lineTo(wx-w*.03,wy-h*.03);c.lineTo(wx,wy-h*.03);c.lineTo(wx-w*.045,wy+h*.06);c.closePath();c.fill();
   }
   if(k==='house'){ // fence and flower planters, only near the camera
    c.fillStyle='rgba(69,75,60,.7)';c.fillRect(-w*.48,-h*.105,w*.96,h*.026);
    for(let i=0;i<6;i++){c.fillStyle=i%2?'#d89a52':'#8b5138';c.fillRect(-w*.45+i*w*.16,-h*.1,Math.max(1,w*.021),h*.10);}
    for(let i=0;i<5;i++){c.fillStyle=['#d45a4e','#eac35c','#e78f94'][i%3];c.beginPath();c.arc(-w*.36+i*w*.17,-h*.15,Math.max(.7,w*.022),0,TAU);c.fill();}
   }
   if(k==='shop'){
    c.fillStyle='rgba(249,236,191,.8)';c.fillRect(-w*.37,-h*.73,w*.74,h*.022);
    c.strokeStyle='rgba(35,49,53,.7)';c.lineWidth=Math.max(.7,w*.013);c.beginPath();c.moveTo(0,-h*.60);c.lineTo(0,-h*.08);c.stroke();
   }
   if(k==='garage'){
    c.strokeStyle='rgba(233,239,241,.36)';c.lineWidth=Math.max(.8,w*.014);for(let i=0;i<3;i++){c.beginPath();c.moveTo(-w*.24,-h*(.46-i*.12));c.lineTo(w*.24,-h*(.46-i*.12));c.stroke();}
    for(const s of[-1,1]){c.fillStyle='#ffe17e';rr(c,s*w*.34-2,-h*.22,w*.06,h*.10,2);c.fill();}
   }
   if(k==='cabin'){
    c.strokeStyle='rgba(34,56,66,.4)';c.lineWidth=Math.max(.7,w*.01);
    for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*w*.1,-h*.77);c.lineTo(i*w*.1,-h*.08);c.stroke();}
   }
  }
  if(k==='tree'){
   // Tonal leaf clusters, edge highlights and a few individual windblown leaves.
   for(let i=0;i<26;i++){
    const u=hash(seed+i*7),v=hash(seed+i*13+41);
    const yy=-h*(.37+v*.52),xx=(u-.5)*w*(.35+.32*Math.sin(v*5));
    const leaf=Math.max(1.2,w*(.017+hash(i+seed)*.026));
    c.fillStyle=i%4===0?'rgba(202,237,121,.65)':i%3===0?'rgba(30,83,40,.57)':'rgba(122,185,72,.48)';
    c.beginPath();c.ellipse(xx,yy,leaf*1.25,leaf*.65,(u-.5)*.5,0,TAU);c.fill();
   }
   c.strokeStyle='rgba(235,233,189,.28)';c.lineWidth=Math.max(.65,w*.008);c.beginPath();c.moveTo(-w*.013,-h*.06);c.lineTo(-w*.018,-h*.29);c.stroke();
  }
  if(k==='hedge'){
   for(let i=0;i<34;i++){const x=-w*.46+hash(i+seed)*w*.92,y=-h*(.22+hash(i*41+seed)*.69);
    c.fillStyle=i%3===0?'rgba(199,220,117,.5)':'rgba(29,78,39,.3)';
    c.beginPath();c.ellipse(x,y,Math.max(.8,w*.017),Math.max(.6,h*.035),0,0,TAU);c.fill();}
  }
  if(k==='digger'){
   c.strokeStyle='#222428';c.lineWidth=Math.max(1.2,w*.028);
   c.beginPath();c.moveTo(-w*.31,-h*.14);c.lineTo(-w*.24,-h*.14);c.moveTo(w*.24,-h*.14);c.lineTo(w*.31,-h*.14);c.stroke();
   c.fillStyle='#f6e34d';c.fillRect(-w*.2,-h*.53,w*.4,h*.025);
   c.fillStyle='rgba(255,255,255,.55)';c.fillRect(-w*.18,-h*.48,w*.14,h*.02);
  }
  c.restore();
 }
 itemUnderlay(c,e,sz,sc,zr,t){
  const w=sz[0]*sc,h=sz[1]*sc;
  if(w<3)return;
  const rewards=['coin','crumb','taco','boost','night','hitch','shield','prize','job','finish'];
  if(!rewards.includes(e.type))return;
  const gold=e.type==='coin'||e.type==='crumb'||e.type==='taco',
   color=gold?'241,190,57':e.type==='night'?'110,180,255':e.type==='job'?'70,244,195':'144,213,255';
  const pulse=.77+.23*Math.sin(t*5+e.id);
  c.save();c.globalCompositeOperation='screen';
  const radius=Math.max(3,w*(.65+.12*pulse));
  const gl=c.createRadialGradient(0,-h*.55,0,0,-h*.55,radius);
  gl.addColorStop(0,`rgba(${color},${.34*pulse})`);gl.addColorStop(.4,`rgba(${color},.14)`);gl.addColorStop(1,`rgba(${color},0)`);
  c.fillStyle=gl;c.beginPath();c.arc(0,-h*.55,radius,0,TAU);c.fill();
  // Contact ellipse underneath the floating reward anchors the billboard in depth.
  c.fillStyle=`rgba(${color},${clamp(.2*sc,0,.3)})`;c.beginPath();c.ellipse(0,9*sc,Math.max(2,w*.5),Math.max(1,4*sc),0,0,TAU);c.fill();c.restore();
 }
 itemOverlay(c,e,sz,sc,zr,t){
  const w=sz[0]*sc,h=sz[1]*sc;if(w<5)return;
  c.save();
  if(['car','bus','binlorry','icecream','caravan','tractor'].includes(e.type)){
   for(const s of[-1,1]){
    const x=s*w*.38,y=-h*.28;
    c.fillStyle='#f42620';c.shadowColor='#fa3524';c.shadowBlur=Math.min(15,7*sc);
    rr(c,x-w*.055,y,w*.11,Math.max(1.5,h*.095),Math.min(3,2*sc));c.fill();
    c.shadowBlur=0;c.fillStyle='rgba(255,232,190,.5)';c.fillRect(x-w*.022,y+2*sc,w*.04,Math.max(.5,h*.02));
   }
   if(e.type==='tractor'||e.type==='binlorry'){
    c.fillStyle=Math.sin(t*8)>0?'#ffce58':'#886123';c.shadowBlur=8*sc;c.shadowColor='#ffc63e';
    c.beginPath();c.arc(0,-h*.94,Math.max(1,w*.047),0,TAU);c.fill();c.shadowBlur=0;
   }
  }
  if(e.type==='cone'){
   c.fillStyle='rgba(255,255,255,.7)';c.fillRect(-w*.21,-h*.56,w*.42,Math.max(1,2*sc));
  }
  if(e.type==='barrier'||e.type==='works'){
   for(const s of[-1,1]){c.fillStyle=Math.sin(t*9)>0?'#ffd94e':'#966c20';
    c.shadowColor='#ffd54b';c.shadowBlur=6*sc;c.beginPath();c.arc(s*w*.38,-h*.82,Math.max(1,3*sc),0,TAU);c.fill();}c.shadowBlur=0;
  }
  if(['coin','boost','night','shield','prize'].includes(e.type)){
   c.globalCompositeOperation='screen';c.strokeStyle='rgba(255,255,230,.7)';c.lineWidth=Math.max(.6,1.8*sc);
   const x=w*.35+Math.sin(t*3+e.id)*w*.14,yy=-h*.83;
   c.beginPath();c.moveTo(x-5*sc,yy);c.lineTo(x+5*sc,yy);c.moveTo(x,yy-5*sc);c.lineTo(x,yy+5*sc);c.stroke();
  }
  c.restore();
 }
 truckTrim(c,g,w,h,bare){
  c.save();
  const up=g.upgrades||{},night=!!g.night,boost=g.boost>0;
  // Chrome bumper / reflectors, yellow UK number plate, reversing gear details.
  const bumper=c.createLinearGradient(0,-h*.1,0,-h*.025);
  bumper.addColorStop(0,'#5a666b');bumper.addColorStop(.2,'#e5ebea');bumper.addColorStop(.55,'#7f898e');bumper.addColorStop(1,'#30383c');
  c.fillStyle=bumper;rr(c,-w*.38,-h*.115,w*.76,h*.07,Math.max(1,w*.012));c.fill();
  c.fillStyle='#151d23';rr(c,-w*.16,-h*.155,w*.32,h*.092,1.5);c.fill();
  c.fillStyle='#ffd94e';rr(c,-w*.14,-h*.145,w*.28,h*.074,1.2);c.fill();
  c.fillStyle='#24313a';c.font=`900 ${Math.max(5,w*.072)}px system-ui, sans-serif`;c.textAlign='center';
  c.fillText('JW  EDS',0,-h*.094);
  // Wide LED outline / rear marker lamps. Animate brake flicker during impact.
  for(const side of [-1,1]){
   const x=side*w*.38-w*.065,y=-h*.31;
   c.fillStyle=boost?'#ff5631':'#c62620';c.shadowColor='#f33425';c.shadowBlur=night?14:6;
   rr(c,x,y,w*.13,h*.11,Math.max(1,w*.02));c.fill();c.shadowBlur=0;
   c.fillStyle='rgba(255,206,158,.76)';c.fillRect(x+w*.03,y+h*.015,w*.045,Math.max(1,h*.025));
   c.fillStyle='#ffcd63';c.fillRect(side*w*.44-w*.03,-h*.21,w*.065,Math.max(1,h*.035));
  }
  // Upgrades remain compatible with the Drive's existing upgrades object.
  if((up.lights||0)>0){
   c.fillStyle='#20272e';rr(c,-w*.30,-h*.97,w*.60,h*.045,Math.max(1,w*.02));c.fill();
   const count=3+Math.min(3,up.lights||0);
   for(let i=0;i<count;i++){
    const x=(i-(count-1)/2)*w*.105;
    c.fillStyle=night?'#fff5d3':'#dce9ef';c.shadowColor='#fff5cc';c.shadowBlur=night?11:1;
    c.beginPath();c.arc(x,-h*.96,Math.max(1.2,w*.024),0,TAU);c.fill();c.shadowBlur=0;
   }
  }
  // Distinctive amber trailer marker lights improve readability at distance.
  if(!bare){c.fillStyle='#f8b957';for(const s of[-1,1])for(const hh of[.56,.78]){
   c.beginPath();c.ellipse(s*w*.47,-h*hh,Math.max(1,w*.018),Math.max(1,w*.023),0,0,TAU);c.fill();}}
  c.restore();
 }
}
