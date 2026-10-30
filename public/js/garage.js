import {Wheel} from './wheel.js';
import {CATALOG,DECALS,TRUCKS,DECAL_TAGS,STATS} from './upgrades.js';
import {Renderer} from './render.js';
const LOCK="<svg class='padlock' viewBox='0 0 24 24' aria-hidden='true'><path d='M7 10V7a5 5 0 0 1 10 0v3' fill='none' stroke='currentColor' stroke-width='2.6' stroke-linecap='round'/><rect x='4.5' y='10' width='15' height='11' rx='3' fill='currentColor'/><circle cx='12' cy='15.5' r='1.7' fill='#10343a'/></svg>";
const TABS=[['trucks','TRUCKS'],['livery','LIVERY'],['upgrades','UPGRADES']];
/* Showroom garage: pick a tab, swipe the wheel, and watch the turntable show the truck exactly as it will drive.
   Unaffordable items can be previewed but not bought (padlock + "keep truckin'"). */
export class Garage{
 constructor(o){Object.assign(this,o);this.tab='trucks';this.idx={trucks:0,livery:0,upgrades:0};this.angle=0;this.spark=[];this.pop=0;this.running=false;this.drag=null;
  const q=s=>this.root.querySelector(s);this.q=q;this.canvas=q('#showroom');
  q('#garageBack').onclick=()=>this.close();
  q('#garageTabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b&&b.dataset.tab!==this.tab){this.sound.play('click');this.sound.rev(1);this.setTab(b.dataset.tab);}});
  q('#gAction').onclick=()=>this.act();
  const c=this.canvas;c.addEventListener('pointerdown',e=>{this.drag={x:e.clientX,a:this.angle};c.setPointerCapture?.(e.pointerId);});
  c.addEventListener('pointermove',e=>{if(this.drag)this.angle=this.drag.a+(e.clientX-this.drag.x)*.014;});
  const end=()=>{this.drag=null;};c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);
  document.addEventListener('keydown',e=>{if(!this.running)return;if(e.key==='ArrowLeft'){this.wheel.step(-1);e.preventDefault();}else if(e.key==='ArrowRight'){this.wheel.step(1);e.preventDefault();}else if(e.key==='Escape'){this.close();e.preventDefault();}});
 }
 items(tab=this.tab){
  if(tab==='trucks')return TRUCKS.map(t=>({kind:'truck',id:t.id,name:t.name,desc:t.desc,cost:t.cost}));
  if(tab==='livery')return DECALS.map(d=>({kind:'decal',id:d.id,name:d.name,desc:DECAL_TAGS[d.id],cost:d.cost,icon:d.icon}));
  return CATALOG.map(u=>({kind:'upgrade',id:u.id,name:u.name,desc:u.description,cost:u.cost,icon:u.icon}));
 }
 st(it){const p=this.profile,w=p.wallet;
  if(it.kind==='truck'){const owned=p.owned.includes(it.id);return {owned,selected:p.truck===it.id,price:it.cost,locked:!owned&&w<it.cost};}
  if(it.kind==='decal'){const owned=p.ownedDecals.includes(it.id);return {owned,selected:p.decal===it.id,price:it.cost,locked:!owned&&w<it.cost};}
  const lv=p.upgrades[it.id],maxed=lv>=3,price=maxed?0:it.cost*(lv+1);return {lv,maxed,price,owned:lv>0,locked:!maxed&&w<price};
 }
 art(it){if(it.kind==='truck')return "<span class='sprite' data-sprite='"+it.id+"'></span>";if(it.icon===null)return "<span class='factory-dash'>FACTORY</span>";return "<span class='extra' data-extra='"+it.icon+"'></span>";}
 card(it){const s=this.st(it);let meta;
  if(it.kind==='upgrade')meta=Array.from({length:3},(_,i)=>"<i class='pip "+(i<s.lv?'on':'')+"'></i>").join('');
  else meta=s.selected?'ON THE ROAD':s.owned?'OWNED':this.money(s.price);
  return "<div class='gcard "+(s.locked?'locked':'')+" "+(s.selected?'equipped':'')+"'>"+this.art(it)+(s.locked?"<b class='lockbadge'>"+LOCK+"</b>":'')+"<span class='gname'>"+it.name.replace(/^THE /,'')+"</span><span class='gmeta'>"+meta+"</span></div>";}
 open(){this.root.classList.remove('hidden');this.root.classList.add('opening');setTimeout(()=>this.root.classList.remove('opening'),600);this.running=true;
  this.preview=new Renderer(this.canvas,this.images,this.profile.settings);
  this.setTab(this.tab,true);this.last=performance.now();const loop=t=>{if(!this.running)return;this.draw((t-this.last)/1000);this.last=t;requestAnimationFrame(loop);};requestAnimationFrame(loop);}
 close(){this.running=false;this.root.classList.add('hidden');this.sound.play('click');this.onExit?.();}
 setTab(tab,first){this.tab=tab;const items=this.items();
  this.root.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  let start=0;if(tab==='trucks')start=items.findIndex(i=>i.id===this.profile.truck);else if(tab==='livery')start=items.findIndex(i=>i.id===this.profile.decal);else start=this.idx.upgrades;
  start=Math.max(0,start);
  const el=this.q('#garageWheel');
  if(this.wheel){this.wheel.setItems(items,false);this.wheel.pos=this.wheel.target=start;this.wheel.last=start;this.wheel.layout();}
  else this.wheel=new Wheel(el,{items,start,render:it=>this.card(it),spacing:w=>Math.min(w*.3,128),scales:[1,.66,.5,.4],
   onStep:(i,dir)=>{this.sound.rev(dir);this.haptic();this.update();},onSettle:i=>{this.idx[this.tab]=i;this.update();},onSelect:()=>this.tapCenter()});
  this.update();}
 cur(){return this.wheel.items[this.wheel.index];}
 pv(){const p=this.profile,it=this.cur(),pv={truck:p.truck,decal:p.decal,upgrades:{...p.upgrades}};
  if(it.kind==='truck')pv.truck=it.id;else if(it.kind==='decal')pv.decal=it.id;else pv.upgrades[it.id]=Math.min(3,p.upgrades[it.id]+(p.upgrades[it.id]<3?1:0));return pv;}
 update(){const it=this.cur(),s=this.st(it),q=this.q;
  q('#garageWallet').textContent=this.money(this.profile.wallet);
  q('#gName').textContent=it.name;q('#gDesc').textContent=it.desc;
  // stats row
  let stat='';
  if(it.kind==='upgrade'){const S=STATS[it.id],now=S.f(s.lv),nxt=s.maxed?null:S.f(s.lv+1);
   stat="<div class='statrow'><span>"+S.label+"</span><span class='pips'>"+[1,2,3].map(i=>"<i class='pip "+(i<=s.lv?'on':!s.maxed&&i===s.lv+1?'next':'')+"'></i>").join('')+"</span><b>"+now+(nxt?" <em>→ "+nxt+"</em>":" <em>MAX</em>")+"</b></div>";}
  else{const bonus=it.kind==='truck'?({0:0,2:2,3:4})[it.id]:(it.id>0?2:0);stat="<div class='statrow'><span>DELIVERY PAY</span><span class='pips'>"+[1,2,3,4].map(i=>"<i class='pip "+(i<=bonus/1?'on':'')+"'></i>").join('')+"</span><b>"+(bonus?'+'+bonus+'%':'standard')+"</b></div>";}
  q('#gStats').innerHTML=stat;
  // action button + notices
  const a=q('#gAction'),note=q('#gNote'),badge=q('#stageBadge');a.className='big-button';a.disabled=false;note.textContent='';badge.className='stage-badge hidden';
  const gap=Math.max(0,s.price-this.profile.wallet);
  if(s.locked){a.className='big-button locked';a.innerHTML=LOCK+"<span>KEEP TRUCKIN’ · "+this.money(gap)+" TO GO</span>";
   note.textContent='Preview only — look, but no touching. Earn '+this.money(gap)+' more and it’s yours.';badge.className='stage-badge lock';badge.innerHTML=LOCK+"<span>PREVIEW ONLY</span>";}
  else if(it.kind==='upgrade'){if(s.maxed){a.className='big-button done';a.innerHTML="<span>FULLY LOADED ✓</span>";a.disabled=true;}else{a.innerHTML="<span>UPGRADE · "+this.money(s.price)+"</span><b>➜</b>";badge.className='stage-badge try';badge.innerHTML="<span>NEXT LEVEL</span>";}}
  else if(s.selected){a.className='big-button done';a.innerHTML="<span>ON THE ROAD ✓</span>";a.disabled=true;}
  else if(s.owned){a.innerHTML="<span>"+(it.kind==='truck'?'DRIVE THIS ONE':'FIT IT')+"</span><b>➜</b>";}
  else{a.innerHTML="<span>BUY · "+this.money(s.price)+"</span><b>➜</b>";badge.className='stage-badge try';badge.innerHTML="<span>TRYING IT ON</span>";}
  this.locked=!!s.locked;this.wheel.refresh();
 }
 tapCenter(){const it=this.cur(),s=this.st(it);if(it.kind!=='upgrade'&&s.owned&&!s.selected)this.act();else{this.sound.honk();this.bump();}}
 bump(){this.pop=1;}
 act(){const it=this.cur(),s=this.st(it),p=this.profile;
  if(s.locked){this.sound.play('flush',.6);this.bump();this.root.classList.add('shake');setTimeout(()=>this.root.classList.remove('shake'),400);this.haptic('heavy');return;}
  if(it.kind==='upgrade'){if(s.maxed)return;p.wallet-=s.price;p.upgrades[it.id]++;this.celebrate();}
  else if(it.kind==='truck'){if(!s.owned){p.wallet-=s.price;p.owned.push(it.id);this.celebrate();}else this.sound.honk();p.truck=it.id;}
  else{if(!s.owned){p.wallet-=s.price;p.ownedDecals.push(it.id);this.celebrate();}else this.sound.honk();p.decal=it.id;}
  this.save();this.onChange?.();this.update();}
 celebrate(){this.sound.play('cash');this.sound.honk();this.sound.rev(1);this.haptic('heavy');this.bump();
  for(let i=0;i<46;i++){const a=Math.random()*6.283,v=70+Math.random()*190;this.spark.push({x:0,y:0,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.8+Math.random()*.7,age:0,r:2+Math.random()*4});}
  this.root.classList.add('flash');setTimeout(()=>this.root.classList.remove('flash'),500);}
 draw(dt){const r=this.preview,c=r.ctx,W=420,H=r.H;if(!W||!H||!isFinite(H))return;dt=Math.min(.05,Math.max(0,dt||0));
  r.time+=dt;if(!this.drag)this.angle+=dt*.55;this.pop=Math.max(0,this.pop-dt*2.4);
  c.clearRect(0,0,W,H);
  // showroom floor + spotlight
  const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0d2a30');bg.addColorStop(1,'#123b40');c.fillStyle=bg;c.fillRect(0,0,W,H);
  const cx=W/2,cy=H*.5,R=Math.min(W*.44,H*.47);
  const pool=c.createRadialGradient(cx,cy,R*.2,cx,cy,R*1.9);pool.addColorStop(0,'#3aa6a6aa');pool.addColorStop(.5,'#1c5b5f55');pool.addColorStop(1,'#0d2a3000');c.fillStyle=pool;c.fillRect(0,0,W,H);
  c.strokeStyle='#ffffff10';c.lineWidth=1;for(let x=-W;x<2*W;x+=42){c.beginPath();c.moveTo(cx+(x-cx)*1.0,0);c.lineTo(cx+(x-cx)*1.9,H);c.stroke();}
  // turntable
  c.save();c.translate(cx,cy);
  c.fillStyle='#04141a';c.beginPath();c.arc(0,6,R+10,0,6.283);c.fill();
  const rim=c.createLinearGradient(0,-R,0,R);rim.addColorStop(0,'#9fb7bd');rim.addColorStop(.5,'#4f666d');rim.addColorStop(1,'#243a40');c.fillStyle=rim;c.beginPath();c.arc(0,0,R+7,0,6.283);c.fill();
  const plate=c.createRadialGradient(0,-R*.3,R*.1,0,0,R);plate.addColorStop(0,this.locked?'#1f6f86':'#2b6a70');plate.addColorStop(1,'#10343a');c.fillStyle=plate;c.beginPath();c.arc(0,0,R,0,6.283);c.fill();
  c.rotate(this.angle);c.strokeStyle='#ffffff22';c.lineWidth=2;for(let i=0;i<48;i++){c.rotate(Math.PI/24);c.beginPath();c.moveTo(R-(i%4?6:14),0);c.lineTo(R-1,0);c.stroke();}
  c.strokeStyle=this.locked?'#7be7ff':'#ffd35b';c.globalAlpha=.55;c.lineWidth=3;c.setLineDash(this.locked?[8,7]:[]);c.beginPath();c.arc(0,0,R*.9,0,6.283);c.stroke();c.setLineDash([]);c.globalAlpha=1;
  c.restore();
  // truck on the turntable
  const pv=this.pv(),k=(R*1.7)/175*(1+this.pop*.07);
  c.save();c.translate(cx,cy);c.rotate(this.angle);c.scale(k,k);
  if(this.locked){c.shadowColor='#6fe6ff';c.shadowBlur=18;}else{c.shadowColor='#000b';c.shadowBlur=14;c.shadowOffsetY=7;}
  r.rig({x:2,lane:2,trailer:2,rear:2,angle:0,upgrades:pv.upgrades,decal:pv.decal},pv.truck,0,-44,this.locked?.92:1);
  c.restore();
  if(this.locked){c.save();c.beginPath();c.arc(cx,cy,R,0,6.283);c.clip();c.fillStyle='#8ff3ff1f';const off=(r.time*28)%6;for(let y=-R+off;y<R;y+=6)c.fillRect(cx-R,cy+y,R*2,2);c.restore();}
  // sparkles
  c.save();c.translate(cx,cy);for(const s of this.spark){s.age+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=140*dt;const a=Math.max(0,1-s.age/s.life);c.globalAlpha=a;c.fillStyle='#fff3b0';c.beginPath();c.moveTo(s.x,s.y-s.r*2);c.lineTo(s.x+s.r*.6,s.y-s.r*.6);c.lineTo(s.x+s.r*2,s.y);c.lineTo(s.x+s.r*.6,s.y+s.r*.6);c.lineTo(s.x,s.y+s.r*2);c.lineTo(s.x-s.r*.6,s.y+s.r*.6);c.lineTo(s.x-s.r*2,s.y);c.lineTo(s.x-s.r*.6,s.y-s.r*.6);c.closePath();c.fill();}c.restore();this.spark=this.spark.filter(s=>s.age<s.life);
 }
}
