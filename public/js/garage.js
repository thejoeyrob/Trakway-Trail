import {Wheel} from './wheel.js';
import {CATALOG,DECALS,TRUCKS,DECAL_TAGS,STATS} from './upgrades.js';
import {Renderer} from './render.js';
import {ChaseRenderer} from './chase.js';
import {drawRig,thumb} from './rigart.js';
import {RIG} from './geometry.js';
const LOCK="<svg class='padlock' viewBox='0 0 24 24' aria-hidden='true'><path d='M7 10V7a5 5 0 0 1 10 0v3' fill='none' stroke='currentColor' stroke-width='2.6' stroke-linecap='round'/><rect x='4.5' y='10' width='15' height='11' rx='3' fill='currentColor'/><circle cx='12' cy='15.5' r='1.7' fill='#10343a'/></svg>";
/* Garage: the preview is the real in-game view (same camera, same road, same drawing code as the game), so what you see is what you drive.
   Paints and roof graphics preview even when you can't afford them; only buying/fitting is locked. Cab and trailer are separate, and any
   style you own can be fitted to either or both. */
export class Garage{
 constructor(o){Object.assign(this,o);this.tab='trucks';this.target='both';this.idx={trucks:0,trailers:0,livery:0,upgrades:0};this.pop=0;this.running=false;this.spark=[];this.sway=0;this.rigView='full';this.rigView='full';
  const q=s=>this.root.querySelector(s);this.q=q;this.canvas=q('#showroom');
  q('#garageBack').onclick=()=>this.close();
  q('#garageTabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b&&b.dataset.tab!==this.tab){this.sound.play('click');this.sound.rev(1);this.setTab(b.dataset.tab);}});
  q('#gTarget').addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(b){this.target=b.dataset.t;this.sound.play('click');this.update();}});
  q('#gRig').addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(b){this.rigView=b.dataset.r;this.sound.play('click');this.update();}});
  q('#gAction').onclick=()=>this.act();q('#gBoth').onclick=()=>this.act(true);
  const c=this.canvas;c.addEventListener('pointerdown',()=>{this.sound.honk();this.bump();});
  document.addEventListener('keydown',e=>{if(!this.running)return;if(e.key==='ArrowLeft'){this.wheel.step(-1);e.preventDefault();}else if(e.key==='ArrowRight'){this.wheel.step(1);e.preventDefault();}else if(e.key==='Escape'){this.close();e.preventDefault();}});
 }
 items(tab=this.tab){
  if(tab==='trucks')return TRUCKS.map(t=>({kind:'truck',id:t.id,name:t.name,desc:t.desc,cost:t.cost}));
  if(tab==='trailers')return TRUCKS.map(t=>({kind:'trailer',id:t.id,name:t.name,desc:t.desc.replace('The trailer’s factory colour.','Trailer factory colour.'),cost:t.cost}));
  if(tab==='livery')return DECALS.map(d=>({kind:'decal',id:d.id,name:d.name,desc:DECAL_TAGS[d.id],cost:d.cost}));
  return CATALOG.map(u=>({kind:'upgrade',id:u.id,name:u.name,desc:u.description,cost:u.cost,icon:u.icon}));
 }
 st(it){const p=this.profile,w=p.wallet;
  if(it.kind==='truck'||it.kind==='trailer'){const owned=p.owned.includes(it.id),sel=it.kind==='truck'?p.truck===it.id:p.trailerPaint===it.id;return {owned,selected:sel,price:it.cost,locked:!owned&&w<it.cost};}
  if(it.kind==='decal'){const owned=p.ownedDecals.includes(it.id),t=this.target,sel=t==='cab'?p.decal===it.id:t==='trailer'?p.trailerDecal===it.id:p.decal===it.id&&p.trailerDecal===it.id;return {owned,selected:sel,price:it.cost,locked:!owned&&w<it.cost};}
  const lv=p.upgrades[it.id],maxed=lv>=3,price=maxed?0:it.cost*(lv+1);return {lv,maxed,price,owned:lv>0,locked:!maxed&&w<price};
 }
 art(it){
  if(it.kind==='truck')return "<img class='paint-thumb cab' alt='' draggable='false' src='"+thumb(this.images_r,'cab',it.id,0)+"'>";
  if(it.kind==='trailer')return "<img class='paint-thumb trailer' alt='' draggable='false' src='"+thumb(this.images_r,'trailer',it.id,0)+"'>";
  if(it.kind==='decal')return it.id?"<img class='paint-thumb trailer' alt='' draggable='false' src='"+thumb(this.images_r,'trailer',1,it.id)+"'>":"<span class='factory-dash'>FACTORY</span>";
  return "<span class='extra' data-extra='"+it.icon+"'></span>";}
 card(it){const s=this.st(it);let meta;
  if(it.kind==='upgrade')meta=Array.from({length:3},(_,i)=>"<i class='pip "+(i<s.lv?'on':'')+"'></i>").join('');
  else meta=s.selected?'ON THE ROAD':s.owned?'OWNED':this.money(s.price);
  return "<div class='gcard "+(s.locked?'locked':'')+" "+(s.selected?'equipped':'')+"'>"+this.art(it)+(s.locked?"<b class='lockbadge'>"+LOCK+"</b>":'')+"<span class='gname'>"+it.name.replace(/^THE /,'')+"</span><span class='gmeta'>"+meta+"</span></div>";}
 open(){this.root.classList.remove('hidden');this.root.classList.add('opening');setTimeout(()=>this.root.classList.remove('opening'),600);this.running=true;
  this.chase=this.profile.settings.view==='chase';this.preview=new (this.chase?ChaseRenderer:Renderer)(this.canvas,this.images,this.profile.settings,{fixedWidth:true});this.images_r=this.preview;
  this.setTab(this.tab,true);this.last=performance.now();const loop=t=>{if(!this.running)return;this.draw((t-this.last)/1000);this.last=t;requestAnimationFrame(loop);};requestAnimationFrame(loop);}
 close(){this.running=false;this.root.classList.add('hidden');this.sound.play('click');this.onExit?.();}
 setTab(tab,first){this.tab=tab;const items=this.items();
  this.root.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  const p=this.profile;let start=0;if(tab==='trucks')start=items.findIndex(i=>i.id===p.truck);else if(tab==='trailers')start=items.findIndex(i=>i.id===p.trailerPaint);else if(tab==='livery')start=items.findIndex(i=>i.id===p.decal);else start=this.idx.upgrades;
  start=Math.max(0,start);
  const el=this.q('#garageWheel');
  if(this.wheel){this.wheel.setItems(items,false);this.wheel.pos=this.wheel.target=start;this.wheel.last=start;this.wheel.layout();}
  else this.wheel=new Wheel(el,{items,start,render:it=>this.card(it),spacing:w=>Math.min(w*.3,128),scales:[1,.66,.5,.4],
   onStep:(i,dir)=>{this.sound.rev(dir);this.haptic();this.update();},onSettle:i=>{this.idx[this.tab]=i;this.update();},onSelect:()=>this.tapCenter()});
  this.update();}
 cur(){return this.wheel.items[this.wheel.index];}
 /* What the preview shows: the current setup with the highlighted item tried on (owned or not). */
 pv(){const p=this.profile,it=this.cur(),pv={truck:p.truck,decal:p.decal,trailerPaint:p.trailerPaint,trailerDecal:p.trailerDecal,upgrades:{...p.upgrades}};
  if(it.kind==='truck')pv.truck=it.id;else if(it.kind==='trailer')pv.trailerPaint=it.id;
  else if(it.kind==='decal'){if(this.target!=='trailer')pv.decal=it.id;if(this.target!=='cab')pv.trailerDecal=it.id;}
  else pv.upgrades[it.id]=Math.min(3,p.upgrades[it.id]+(p.upgrades[it.id]<3?1:0));return pv;}
 update(){const it=this.cur(),s=this.st(it),q=this.q,p=this.profile;
  q('#garageWallet').textContent=this.money(p.wallet);
  q('#gRig').classList.toggle('hidden',!this.chase);q('#gRig').querySelectorAll('[data-r]').forEach(b=>b.classList.toggle('active',b.dataset.r===this.rigView));
  q('#gName').textContent=it.name;q('#gDesc').textContent=it.desc;
  q('#gTarget').classList.toggle('hidden',it.kind!=='decal');q('#gTarget').querySelectorAll('[data-t]').forEach(b=>b.classList.toggle('active',b.dataset.t===this.target));
  let stat='';
  if(it.kind==='upgrade'){const S=STATS[it.id],now=S.f(s.lv),nxt=s.maxed?null:S.f(s.lv+1);
   stat="<div class='statrow'><span>"+S.label+"</span><span class='pips'>"+[1,2,3].map(i=>"<i class='pip "+(i<=s.lv?'on':!s.maxed&&i===s.lv+1?'next':'')+"'></i>").join('')+"</span><b>"+now+(nxt?" <em>→ "+nxt+"</em>":" <em>MAX</em>")+"</b></div>";}
  else{const bonus=it.kind==='decal'?(it.id>0?2:0):(TRUCKS.find(t=>t.id===it.id)?.bonus||0);stat="<div class='statrow'><span>DELIVERY PAY</span><span class='pips'>"+[1,2,3,4].map(i=>"<i class='pip "+(i<=bonus/1?'on':'')+"'></i>").join('')+"</span><b>"+(bonus?'+'+bonus+'%':'standard')+"</b></div>";}
  q('#gStats').innerHTML=stat;
  const a=q('#gAction'),note=q('#gNote'),badge=q('#stageBadge'),both=q('#gBoth');a.className='big-button';a.disabled=false;note.textContent='';badge.className='stage-badge hidden';both.classList.add('hidden');
  const part=it.kind==='truck'?'CAB':it.kind==='trailer'?'TRAILER':this.target==='cab'?'CAB':this.target==='trailer'?'TRAILER':'CAB + TRAILER';
  const gap=Math.max(0,s.price-p.wallet);
  if(s.locked){a.className='big-button locked';a.innerHTML=LOCK+"<span>KEEP TRUCKIN’ · "+this.money(gap)+" TO GO</span>";
   note.textContent='Preview only — look, but no touching. Earn '+this.money(gap)+' more and it’s yours.';badge.className='stage-badge lock';badge.innerHTML=LOCK+"<span>PREVIEW ONLY</span>";}
  else if(it.kind==='upgrade'){if(s.maxed){a.className='big-button done';a.innerHTML="<span>FULLY LOADED ✓</span>";a.disabled=true;}else{a.innerHTML="<span>UPGRADE · "+this.money(s.price)+"</span><b>➜</b>";badge.className='stage-badge try';badge.innerHTML="<span>NEXT LEVEL</span>";}}
  else if(s.selected){a.className='big-button done';a.innerHTML="<span>ON THE ROAD ✓ · "+part+"</span>";a.disabled=true;}
  else if(s.owned){a.innerHTML="<span>FIT TO "+part+"</span><b>➜</b>";}
  else{a.innerHTML="<span>BUY · "+this.money(s.price)+" · "+part+"</span><b>➜</b>";badge.className='stage-badge try';badge.innerHTML="<span>TRYING IT ON</span>";}
  // "Match both": an owned paint can be fitted to the cab and the trailer in one go.
  if((it.kind==='truck'||it.kind==='trailer')&&s.owned&&!(p.truck===it.id&&p.trailerPaint===it.id)){both.classList.remove('hidden');both.textContent='FIT TO CAB + TRAILER';}
  this.locked=!!s.locked;this.wheel.refresh();
 }
 tapCenter(){const it=this.cur(),s=this.st(it);if(it.kind!=='upgrade'&&s.owned&&!s.selected)this.act();else{this.sound.honk();this.bump();}}
 bump(){this.pop=1;}
 act(both){const it=this.cur(),s=this.st(it),p=this.profile;
  if(s.locked){this.sound.play('flush',.6);this.bump();this.root.classList.add('shake');setTimeout(()=>this.root.classList.remove('shake'),400);this.haptic('heavy');return;}
  const buy=(list)=>{if(!s.owned){p.wallet-=s.price;list.push(it.id);this.celebrate();}else this.sound.honk();};
  if(it.kind==='upgrade'){if(s.maxed)return;p.wallet-=s.price;p.upgrades[it.id]++;this.celebrate();}
  else if(it.kind==='truck'||it.kind==='trailer'){buy(p.owned);if(both){p.truck=it.id;p.trailerPaint=it.id;}else if(it.kind==='truck')p.truck=it.id;else p.trailerPaint=it.id;}
  else{buy(p.ownedDecals);if(this.target!=='trailer')p.decal=it.id;if(this.target!=='cab')p.trailerDecal=it.id;}
  this.save();this.onChange?.();this.update();}
 celebrate(){this.sound.play('cash');this.sound.honk();this.sound.rev(1);this.haptic('heavy');this.bump();
  for(let i=0;i<46;i++){const a=Math.random()*6.283,v=70+Math.random()*190;this.spark.push({x:0,y:0,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.8+Math.random()*.7,age:0,r:2+Math.random()*4});}
  this.root.classList.add('flash');setTimeout(()=>this.root.classList.remove('flash'),500);}
 draw(dt){const r=this.preview,c=r.ctx,W=420,H=r.H;if(!W||!H||!isFinite(H))return;dt=Math.min(.05,Math.max(0,dt||0));
  if(this.chase){this.drawChase(r,c,W,H,dt);return;}
  r.time+=dt;this.pop=Math.max(0,this.pop-dt*2.4);
  // The in-game road, scrolling slowly so the lamps, flames and decals feel alive.
  const off=(r.time*60)%256;r.world.paint(0,0,0,W,H,off);
  c.fillStyle='#0003';c.fillRect(0,0,W,H);
  c.strokeStyle='#eeeaddb0';c.lineWidth=2;for(const x of[44,376]){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}
  c.strokeStyle='#eee5ccaa';c.lineWidth=2;c.setLineDash([26,34]);c.lineDashOffset=-off;for(const x of[132,210,288]){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}c.setLineDash([]);
  const vg=c.createRadialGradient(W/2,H*.5,H*.2,W/2,H*.5,H*.8);vg.addColorStop(0,'#0000');vg.addColorStop(1,'#000a');c.fillStyle=vg;c.fillRect(0,0,W,H);
  const pv=this.pv(),ys=r.worldScale||.72,span=RIG.cabL/2+RIG.S*34+RIG.S*38+RIG.trailerL/2+RIG.cabL/2,s=Math.min(H*.84/(span*ys),W*.5/(RIG.cabW))*(1+this.pop*.035);
  const t=r.time;this.sway=Math.sin(t*.9)*.9;const x=2+this.sway*.18,lane=2+Math.sin(t*.9+.35)*.18;
  const top=-RIG.cabL/2,cy=H/2-(span/2-RIG.cabL/2)*s*ys;
  drawRig(r,{...pv,lane,x,angle:Math.sin(t*.9-.5)*.08,trailer:2+Math.sin(t*.9-.3)*.14,rear:2,hasTrailer:true,job:null,grip:0,boost:Math.max(0,Math.sin(t*.7)*3),shield:false,hornAge:this.pop>0?(1-this.pop)*.35:9},W/2,cy,1,s,ys,t);
  if(this.locked){c.save();c.fillStyle='#8ff3ff1c';const off2=(r.time*28)%6;for(let y=off2;y<H;y+=6)c.fillRect(0,y,W,2);c.restore();}
  c.save();c.translate(W/2,H/2);for(const sp of this.spark){sp.age+=dt;sp.x+=sp.vx*dt;sp.y+=sp.vy*dt;sp.vy+=140*dt;const a=Math.max(0,1-sp.age/sp.life);c.globalAlpha=a;c.fillStyle='#fff3b0';c.beginPath();c.moveTo(sp.x,sp.y-sp.r*2);c.lineTo(sp.x+sp.r*.6,sp.y-sp.r*.6);c.lineTo(sp.x+sp.r*2,sp.y);c.lineTo(sp.x+sp.r*.6,sp.y+sp.r*.6);c.lineTo(sp.x,sp.y+sp.r*2);c.lineTo(sp.x-sp.r*.6,sp.y+sp.r*.6);c.lineTo(sp.x-sp.r*2,sp.y);c.lineTo(sp.x-sp.r*.6,sp.y-sp.r*.6);c.closePath();c.fill();}c.restore();this.spark=this.spark.filter(sp=>sp.age<sp.life);
 }
 /* Chase-view preview: the real chase camera on a quiet, slow-rolling road, zoomed in on the rig so paint, decals and either rig
    configuration (with trailer / cab only) are shown exactly as they will look when driving. */
 drawChase(r,c,W,H,dt){
  this.pop=Math.max(0,this.pop-dt*2.4);const pv=this.pv(),t=r.time+dt,bare=this.rigView==='cab';
  this.cdist=(this.cdist||4000)+dt*260;this.sway=Math.sin(t*.9)*.9;
  const g={seed:11,distance:this.cdist,x:2+this.sway*.12,lane:2,trailer:2,rear:2,angle:Math.sin(t*.9-.5)*.1,sway:Math.sin(t*1.3)*.4,speed:260,time:t,items:[],sheep:null,leaving:[],hasTrailer:!bare,job:null,grip:0,boost:Math.max(0,Math.sin(t*.7)*3),shield:false,invulnerable:0,night:null,
   upgrades:pv.upgrades,truck:pv.truck,decal:pv.decal,trailerPaint:pv.trailerPaint,trailerDecal:pv.trailerDecal,hornAge:this.pop>0?(1-this.pop)*.35:9,finished:false,lives:0,combo:0,money:0,multiplier:1,stage:0,offroad:0,surface:'asphalt',detached:[],effects:[]};
  const z=1.35+this.pop*.05;c.save();c.translate(W/2,H*.99);c.scale(z,z);c.translate(-W/2,-H*.99);
  try{r.draw(g,dt,pv.truck);}catch(e){console.error(e);}
  c.restore();
  if(this.locked){c.save();c.fillStyle='#8ff3ff1c';const off2=(t*28)%6;for(let y=off2;y<H;y+=6)c.fillRect(0,y,W,2);c.restore();}
  c.save();c.translate(W/2,H*.62);for(const sp of this.spark){sp.age+=dt;sp.x+=sp.vx*dt;sp.y+=sp.vy*dt;sp.vy+=140*dt;const a=Math.max(0,1-sp.age/sp.life);c.globalAlpha=a;c.fillStyle='#fff3b0';c.beginPath();c.arc(sp.x,sp.y,sp.r,0,6.283);c.fill();}c.restore();
  this.spark=this.spark.filter(sp=>sp.age<sp.life);
 }
}
