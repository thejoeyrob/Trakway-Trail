/* Infinite swipe wheel: the focused item sits proud in the middle, neighbours shrink away either side and the
   list wraps round forever. Used by the home menu and the garage. No dependencies.
   opts: items[], render(item,i)->html, spacing(width)->px, scales[], onStep(index,dir), onSelect(index), onSettle(index) */
export class Wheel {
 constructor(el,opts){
  this.el=el;this.opts=opts;this.items=opts.items;this.scales=opts.scales||[1,.58,.4,.3];
  this.pos=opts.start||0;this.target=this.pos;this.last=Math.round(this.pos);this.drag=null;this.raf=0;this.t0=0;this.enabled=true;
  this.build();
  el.addEventListener('pointerdown',e=>this.down(e));
  el.addEventListener('pointermove',e=>this.move(e));
  el.addEventListener('pointerup',e=>this.up(e));
  el.addEventListener('pointercancel',e=>this.up(e,true));
  el.addEventListener('wheel',e=>{if(!this.enabled)return;const d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(Math.abs(d)<12)return;e.preventDefault();if(performance.now()-this.t0>180){this.t0=performance.now();this.step(d>0?1:-1);}},{passive:false});
  this.layout();
 }
 get n(){return this.items.length;}
 get index(){return ((Math.round(this.pos)%this.n)+this.n)%this.n;}
 build(){this.el.innerHTML='';this.nodes=this.items.map((it,i)=>{const d=document.createElement('div');d.className='wheel-item';d.dataset.i=i;d.innerHTML=this.opts.render(it,i);this.el.appendChild(d);return d;});}
 setItems(items,keep=true){const at=keep?this.index:0;this.items=items;this.build();this.pos=this.target=at;this.last=at;this.layout();}
 refresh(){this.nodes.forEach((d,i)=>{d.innerHTML=this.opts.render(this.items[i],i);});this.layout();}
 spacing(){return this.opts.spacing?this.opts.spacing(this.el.clientWidth):this.el.clientWidth*.37;}
 layout(){
  const S=this.spacing(),n=this.n,focus=Math.round(this.pos);
  this.nodes.forEach((node,i)=>{
   let d=((i-this.pos)%n+n)%n;if(d>n/2)d-=n;const a=Math.abs(d);
   const x=Math.sign(d)*(a<=1?a*S:S+(a-1)*S*.6);
   const sc=this.scales,s=a<1?sc[0]+(sc[1]-sc[0])*a:a<2?sc[1]+(sc[2]-sc[1])*(a-1):a<3?sc[2]+(sc[3]-sc[2])*(a-2):sc[3];
   const f=Math.max(0,1-a*1.25);
   node.style.transform='translate3d(calc(-50% + '+x.toFixed(1)+'px),0,0) scale('+s.toFixed(3)+')';
   node.style.opacity=a>2.6?0:String(Math.max(0,1-a*.2));
   node.style.zIndex=String(100-Math.round(a*10));
   node.style.setProperty('--f',f.toFixed(3));
   node.classList.toggle('focus',((focus%n)+n)%n===i);
   node.style.pointerEvents=a>2.2?'none':'auto';
  });
 }
 tick(now){
  const dt=Math.min(.05,(now-this.lastT)/1000||.016);this.lastT=now;
  if(!this.drag){this.pos+=(this.target-this.pos)*(1-Math.exp(-dt*11));if(Math.abs(this.target-this.pos)<.002){this.pos=this.target;}}
  this.emitStep();this.layout();
  if(this.drag||this.pos!==this.target)this.raf=requestAnimationFrame(t=>this.tick(t));
  else{this.raf=0;this.opts.onSettle?.(this.index);}
 }
 kick(){if(!this.raf){this.lastT=performance.now();this.raf=requestAnimationFrame(t=>this.tick(t));}}
 emitStep(){const r=Math.round(this.pos);if(r!==this.last){const dir=r>this.last?1:-1;this.last=r;this.opts.onStep?.(this.index,dir);}}
 step(dir){if(!this.enabled)return;this.target=Math.round(this.target)+dir;this.kick();}
 goTo(i){const n=this.n;let d=((i-this.index)%n+n)%n;if(d>n/2)d-=n;this.target=Math.round(this.target)+d;this.kick();}
 select(){this.opts.onSelect?.(this.index);}
 down(e){if(!this.enabled)return;this.drag={id:e.pointerId,x:e.clientX,start:this.pos,moved:false,at:performance.now(),lx:e.clientX,lt:performance.now(),v:0,target:e.target};this.el.setPointerCapture?.(e.pointerId);this.kick();}
 move(e){const d=this.drag;if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.x;if(Math.abs(dx)>8)d.moved=true;
  if(d.moved){this.pos=d.start-dx/this.spacing();this.target=this.pos;const now=performance.now(),dtm=Math.max(1,now-d.lt);d.v=(e.clientX-d.lx)/dtm;d.lx=e.clientX;d.lt=now;}}
 up(e,cancel){const d=this.drag;if(!d||d.id!==e.pointerId)return;this.drag=null;
  if(!d.moved&&!cancel&&performance.now()-d.at<350){const node=d.target?.closest?.('.wheel-item');if(node){const i=Number(node.dataset.i);if(i===this.index)this.select();else this.goTo(i);}return this.kick();}
  const flick=-d.v/this.spacing()*90;this.target=Math.round(this.pos+Math.max(-1.6,Math.min(1.6,flick)));this.kick();}
}
