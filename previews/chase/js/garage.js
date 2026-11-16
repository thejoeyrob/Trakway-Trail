import {Wheel} from './wheel.js';
import {CATALOG,DECALS,TRUCKS,DECAL_TAGS,STATS,upgradePrice} from './upgrades.js';
import {Renderer} from './render.js';
import {ChaseRenderer} from './chase.js';
import {GARAGE_SEED} from './route-map.js';
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
  q('#gPeek').onclick=()=>{this.root.classList.toggle('peek');this.sound.play('click');setTimeout(()=>this.fitStage(),480);};
  addEventListener('resize',()=>this._fit=0);
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
  if(it.kind==='truck'||it.kind==='trailer'){const owned=(it.kind==='truck'?p.owned:p.ownedTrailer).includes(it.id),sel=it.kind==='truck'?p.truck===it.id:p.trailerPaint===it.id;return {owned,selected:sel,price:it.cost,locked:!owned&&w<it.cost};}
  if(it.kind==='decal'){const t=this.target,oc=p.ownedDecals.includes(it.id),ot=p.ownedDecalsTrailer.includes(it.id),parts=t==='both'?['cab','trailer']:[t],missing=parts.filter(x=>!(x==='cab'?oc:ot)).length,price=it.cost*Math.max(1,missing),sel=t==='cab'?p.decal===it.id:t==='trailer'?p.trailerDecal===it.id:p.decal===it.id&&p.trailerDecal===it.id;return {owned:missing===0,selected:sel,price,locked:missing>0&&w<price};}
  const lv=p.upgrades[it.id],maxed=lv>=3,price=maxed?0:upgradePrice(it.cost,lv);return {lv,maxed,price,owned:lv>0,locked:!maxed&&w<price};
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
  this.chase=!/[?&]top/.test(location.search);this.root.classList.toggle('chase',this.chase);this.root.classList.remove('peek');this.preview=new (this.chase?ChaseRenderer:Renderer)(this.canvas,this.images,this.profile.settings,{fixedWidth:true});this.images_r=this.preview;
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
  // Cab and trailer paints are bought separately; one button buys or fits the pair.
  if(it.kind==='truck'||it.kind==='trailer'){const oc=p.owned.includes(it.id),ot=p.ownedTrailer.includes(it.id);if(!(p.truck===it.id&&p.trailerPaint===it.id)){const miss=(oc?0:1)+(ot?0:1),price=it.cost*miss;both.classList.remove('hidden');both.textContent=miss?'BUY CAB + TRAILER · '+this.money(price):'FIT TO CAB + TRAILER';both.classList.toggle('locked',miss>0&&p.wallet<price);}}
  if(this.chase&&it.kind==='upgrade')this._badgeKey='';
  this._fit=0;this.locked=!!s.locked;this.wheel.refresh();
 }
 tapCenter(){const it=this.cur(),s=this.st(it);if(it.kind!=='upgrade'&&s.owned&&!s.selected)this.act();else{this.sound.honk();this.bump();}}
 bump(){this.pop=1;}
 act(both){const it=this.cur(),s=this.st(it),p=this.profile,shake=()=>{this.sound.play('flush',.6);this.bump();this.root.classList.add('shake');setTimeout(()=>this.root.classList.remove('shake'),400);this.haptic('heavy');};
  if(it.kind==='upgrade'){if(s.locked)return shake();if(s.maxed)return;p.wallet-=s.price;p.upgrades[it.id]++;this.celebrate();}
  else{
   const isPaint=it.kind!=='decal',parts=it.kind==='truck'?(both?['cab','trailer']:['cab']):it.kind==='trailer'?(both?['cab','trailer']:['trailer']):(this.target==='both'?['cab','trailer']:[this.target]);
   const own=pt=>isPaint?(pt==='cab'?p.owned:p.ownedTrailer):(pt==='cab'?p.ownedDecals:p.ownedDecalsTrailer);
   const missing=parts.filter(pt=>!own(pt).includes(it.id)),price=it.cost*missing.length;
   if(p.wallet<price)return shake();
   if(missing.length){p.wallet-=price;for(const pt of missing)own(pt).push(it.id);this.celebrate();}else this.sound.honk();
   for(const pt of parts){if(isPaint){if(pt==='cab')p.truck=it.id;else p.trailerPaint=it.id;}else{if(pt==='cab')p.decal=it.id;else p.trailerDecal=it.id;}}
  }
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
 /* keep the truck in the part of the screen the menu sheet leaves free */
 fitStage(){const r=this.preview;if(!r||!this.chase)return;const cb=this.canvas.getBoundingClientRect(),pb=this.q('.garage-panel').getBoundingClientRect();if(!cb.height)return;
  const free=Math.max(120,pb.top-cb.top-6),f=Math.max(.3,Math.min(.82,free/cb.height));r.zoomF=1;r.zoomY=1;r.y0f=.03;r.truckScale=Math.max(.8,Math.min(1.2,free/330));r.yTf=f;r.yT=r.H*f;r.playerY=r.yT-120;}
 drawChase(r,c,W,H,dt){
  this.pop=Math.max(0,this.pop-dt*2.4);
  if(!this._fit||this._fit<t0()){this._fit=t0()+400;this.fitStage();}
  const it=this.cur(),pv=this.pv(),p=this.profile,t=this.ct=(this.ct||0)+dt,bare=this.rigView==='cab',id=it.kind==='upgrade'?it.id:'';
  // Upgrades are shown by doing them: it alternates (5 s each) between what you have now and the next level.
  const up={...p.upgrades};let next=false,cur=0;
  if(id){cur=p.upgrades[id];if(cur<3){next=Math.floor(t/5)%2===1;up[id]=next?cur+1:cur;}}
  else Object.assign(up,pv.upgrades);
  const S=this.sim||(this.sim={x:2,tr:2,dist:5000,flame:0}),steer=up.steering||0,stab=up.stability||0,susp=up.suspension||0,eng=up.engine||0;
  const swoop=id==='steering'||id==='stability'||id==='suspension';
  const target=swoop?2+Math.tanh(3.2*Math.sin(t*1.25))*1.5:2+Math.sin(t*.7)*.32;
  S.x+=(target-S.x)*(1-Math.exp(-dt*(swoop?3.4:5)*(1+.12*steer)));
  S.tr+=(S.x-S.tr)*(1-Math.exp(-dt*3*(1+.2*stab)));
  const surge=(id==='engine'||id==='exhaust')?Math.max(0,Math.sin(t*1.1)):0;
  S.dist+=dt*(250+90*surge)*(1+.05*eng);
  const night=id==='lights',items=[];
  if(night||id==='horn'||id==='insurance'){const base=Math.ceil(S.dist/230)*230;for(let k=0;k<10;k++){const z=base+k*230,h=(z/230)*2654435761>>>0,lane=h%5,ty=h%7===0?'cone':h%11===0?'car':'coin';items.push({id:z,type:ty,lane,z,done:false,collectible:ty==='coin'});}}
  const g={seed:GARAGE_SEED,distance:S.dist,x:S.x,lane:2,trailer:S.tr,rear:2,angle:clamp2((S.x-S.tr)*.62*(1-.08*susp),.85),sway:Math.abs(S.x-S.tr)*.3,speed:250*(1+.05*eng),time:t,items,sheep:null,leaving:[],hasTrailer:!bare,job:null,grip:0,
   boost:(id==='engine'||id==='exhaust')&&surge>.55?1:Math.max(0,Math.sin(t*.7)*3)*(id?0:1),shield:id==='insurance'&&Math.floor(t*3)%6<4,invulnerable:0,night:night?{start:0,end:1e9}:null,
   upgrades:up,truck:pv.truck,decal:pv.decal,trailerPaint:pv.trailerPaint,trailerDecal:pv.trailerDecal,hornAge:this.pop>0?(1-this.pop)*.35:9,finished:false,lives:0,combo:0,money:0,multiplier:1,stage:1,offroad:0,surface:'asphalt',detached:[],effects:[]};
  try{r.draw(g,dt,pv.truck);}catch(e){console.error(e);}
  if(this.locked){c.save();c.fillStyle='#8ff3ff1c';const off2=(t*28)%6;for(let y=off2;y<H;y+=6)c.fillRect(0,y,W,2);c.restore();}
  c.save();c.translate(W/2,H*.4);for(const sp of this.spark){sp.age+=dt;sp.x+=sp.vx*dt;sp.y+=sp.vy*dt;sp.vy+=140*dt;const a=Math.max(0,1-sp.age/sp.life);c.globalAlpha=a;c.fillStyle='#fff3b0';c.beginPath();c.arc(sp.x,sp.y,sp.r,0,6.283);c.fill();}c.restore();
  this.spark=this.spark.filter(sp=>sp.age<sp.life);
  // A / B label
  const badge=this.q('#stageBadge'),key=id&&cur<3?(next?'B':'A')+id+cur:'';
  if(key&&this._badgeKey!==key){this._badgeKey=key;badge.className='stage-badge '+(next?'try':'');badge.innerHTML=next?'<span>▲ WITH UPGRADE · LEVEL '+(cur+1)+'</span>':'<span>NOW · LEVEL '+cur+'</span>';}
  else if(!key)this._badgeKey='';
 }
}
const clamp2=(v,m)=>Math.max(-m,Math.min(m,v));
const t0=()=>performance.now();
