/* TRUCKIN' & DRIVIN' — Filmic Finishing / VFX v1.
 * Screen-space cosmetic effects; reduced-motion aware, no collision or game-state writes.
 */
import {roadTheme,laneX} from './geometry.js';
const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const fract=n=>n-Math.floor(n);
const hash=n=>fract(Math.sin(n*76.57+13.21)*19783.74);
export class ChaseFinishPro {
 constructor(r){this.r=r;this.smoke=[];this.lastX=null;this.accum=0;}
 begin(g,dt){
  const moving=!!this.r.settings?.motion;
  this.delta=clamp(Number(dt)||0,0,.066);
  if(!moving||!this.delta||!g){this.smoke=[];return;}
  const x=210+(laneX(g.x,g.distance)-(this.r.camX||210));
  this.accum+=this.delta;
  // Exhaust / tyre dust emitted in world-space, with bounded particles and no allocation storms.
  if(this.accum>.065){this.accum=0;
   const speed=clamp((g.speed||0)/650),theme=roadTheme(g.distance),boost=g.boost>0;
   for(const side of[-1,1]){
    this.smoke.push({x:x+side*(g.hasTrailer===false?23:31),y:this.r.yT-56,
     vx:(hash(this.r.time*12+side)-.5)*14,vy:-12-hash(this.r.time*24+side)*16,
     life:boost?.36:theme===3?.85:.56,age:0,
     r:(boost?2:3)+hash(this.r.time*13+side)*3,
     mud:theme===3,opacity:.17+speed*.09});
   }
  }
  if(this.smoke.length>45)this.smoke.splice(0,this.smoke.length-45);
  for(const p of this.smoke){p.age+=this.delta;p.x+=p.vx*this.delta;p.y+=p.vy*this.delta;p.r+=this.delta*12;}
  this.smoke=this.smoke.filter(p=>p.age<p.life);
 }
 after(c,g,{H,W,pad,y0,cx}){
  if(!g)return;
  const night=!!g.night,theme=roadTheme(g.distance),motion=!!this.r.settings?.motion;
  c.save();
  // Colour-grade atmosphere: barely visible warm dust at construction sites,
  // emerald bounce in the countryside, slight cool air during night driving.
  if(theme===3&&!night){const at=c.createLinearGradient(0,H*.25,0,H);at.addColorStop(0,'rgba(249,181,103,0)');at.addColorStop(1,'rgba(196,142,64,.06)');c.fillStyle=at;c.fillRect(-pad,0,W,H);}
  if(night){c.fillStyle='rgba(22,44,78,.07)';c.fillRect(-pad,0,W,H);}
  // Subtle sun-lit film contrast; darkened corners frame the truck and play field.
  const vg=c.createRadialGradient(210,H*.47,H*.12,210,H*.47,H*.88);
  vg.addColorStop(0,'rgba(5,12,20,0)');vg.addColorStop(.55,'rgba(7,15,19,.02)');vg.addColorStop(1,night?'rgba(2,8,19,.45)':'rgba(6,20,21,.24)');
  c.fillStyle=vg;c.fillRect(-pad,0,W,H);
  // Fast-motion side streaks, world-locked and weighted towards the edges only.
  const velocity=clamp(((g.speed||0)-350)/490),boost=g.boost>0;
  if(motion&&(velocity>.08||boost)){
   const speed=clamp(velocity+(boost?.46:0));
   c.lineCap='round';
   for(let i=0;i<20;i++){
    const side=i%2===0?-1:1,seed=hash(i*19+Math.floor(g.distance/47)),
     x=side<0?-pad+seed*Math.min(pad+34,95):420+pad-seed*Math.min(pad+34,95),
     pos=fract(hash(i*17)+g.distance*(.00055+hash(i*7)*.0006));
    const y=y0+pos*(H-y0),len=(16+hash(i*31)*80)*speed*pos;
    c.strokeStyle=night?`rgba(173,211,248,${.08*speed*pos})`:`rgba(244,243,206,${.095*speed*pos})`;
    c.lineWidth=Math.max(.7,(.7+pos*1.6)*speed);
    c.beginPath();c.moveTo(x,y);c.lineTo(x,y+len);c.stroke();
   }
  }
  // Exhaust / dust with soft radial falloff. Wind-swept and short-lived.
  if(motion)for(const p of this.smoke){const age=p.age/p.life,alpha=(1-age)*p.opacity;
   const gr=c.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
   const rgb=p.mud?'165,137,99':night?'155,172,195':'178,184,177';
   gr.addColorStop(0,`rgba(${rgb},${alpha})`);gr.addColorStop(1,`rgba(${rgb},0)`);
   c.fillStyle=gr;c.beginPath();c.arc(p.x,p.y,p.r,0,TAU);c.fill();}
  // Twin red tail-light lens glow and surface reflections for dark conditions.
  if(night){
   const x=cx+laneX(g.x,g.distance)-(this.r.camX||210),y=this.r.yT-29;
   c.save();c.globalCompositeOperation='screen';
   for(const s of[-1,1]){
    const rx=x+s*(g.hasTrailer===false?22:35),r=22;
    const rg=c.createRadialGradient(rx,y,0,rx,y,r);
    rg.addColorStop(0,'rgba(255,54,35,.28)');rg.addColorStop(.32,'rgba(252,49,25,.1)');rg.addColorStop(1,'rgba(255,38,20,0)');
    c.fillStyle=rg;c.fillRect(rx-r,y-r,r*2,r*2);
   }c.restore();
  }
  if(g.crashKind==='water'){
   const x=210+laneX(g.x,g.distance)-(this.r.camX||210),y=this.r.yT;
   c.save();c.globalAlpha=.37;c.strokeStyle='#effbff';c.lineWidth=1.8;
   for(let i=0;i<3;i++){const wob=fract(this.r.time*.8+i/3),rad=15+wob*70;
    c.beginPath();c.ellipse(x,y,rad,rad*.19,0,Math.PI*.08,Math.PI*.92);c.stroke();}
   c.restore();
  }
  // Tiny lens glints during a boost: no opaque screens / nuisance overlays.
  if(motion&&boost){
   const gr=c.createLinearGradient(0,H*.55,0,H);
   gr.addColorStop(0,'rgba(255,178,57,0)');gr.addColorStop(1,'rgba(255,178,57,.075)');c.fillStyle=gr;c.fillRect(-pad,H*.55,W,H*.45);
  }
  c.restore();
 }
}
