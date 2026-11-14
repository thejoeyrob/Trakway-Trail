import {RoutePainter} from './route-render.js';
import {drawRig,drawTrailerOnly} from './rigart.js';
import {drawVehicle} from './propart.js';
import {HAZARD_SPECS} from './route-hazards.js';
import {clamp,ROAD_TYPES,PICKUPS} from './model.js';
import {rigPose,roadShape,roadCurve,laneX,roadTheme,RIG} from './geometry.js';
import {SPRITE_RECTS,HAZARD_RECTS,TERRAIN_RECTS,EXTRAS_RECTS} from './atlas.js';
export const SPR={truck:0,trailer:1,orange:2,purple:3,car:4,redcar:5,cone:6,barrier:7,taco:8,job:9,finish:10,coin:11,sheep:12,face:13,flatbed:14,oil:15,crumb:11};
const HAZ={lowbridge:0,weakbridge:1,bus:2,noentry:3,narrow:4,sheepWarning:5,house:6,grass:7};
const LABELS={lowbridge:'LOW BRIDGE',weakbridge:'WEAK BRIDGE',bus:'BUS LANE',noentry:'NO ENTRY',house:'MIND THE HOUSE',grass:'KEEP OFF',narrow:'NARROW PASS'};
export class Renderer {
 constructor(canvas,images,settings,opts={}){this.opts=opts;this.pad=0;this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.images=images;this.settings=settings;this.W=420;this.H=800;this.fx=[];this.shake=0;this.time=0;this.resize();this.world=new RoutePainter(this);}
 /* The road column is always 420 world units wide and at least 747 tall (iPhone SE proportions). A taller phone just shows more road.
    A wider screen (iPad) or the "tall phone preview" shrinks the world to fit and the spare width becomes side scenery (this.pad on each side). */
 resize(){const r=this.canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
  let k,pad=0;
  if(this.opts.fixedWidth){k=r.width/420;this.H=420*r.height/r.width;}
  else{const hreq=this.settings.tall?909:747;k=Math.min(r.width/420,r.height/hreq);const Wc=r.width/k;pad=Math.max(0,(Wc-420)/2);this.H=r.height/k;}
  this.k=k;this.pad=pad;this.cssCol=420*k;this.actualTall=420*r.height/r.width>=830;
  this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);this.scale=k*dpr;
  this.ctx.setTransform(this.scale,0,0,this.scale,this.scale*pad,0);this.ctx.imageSmoothingEnabled=true;
  this.playerY=this.opts.fixedWidth?this.H*.66:493+Math.max(0,this.H-747)*.36;this.worldScale=.72;}
 shape(z){return roadShape(z);}
 curve(z){return roadCurve(z);}
 x(lane,z){return laneX(lane,z);}
 sprite(id,x,y,w,h=w,angle=0,alpha=1,sheet='sprites'){const img=this.images[sheet];if(!img)return;let cols=4,rows=sheet==='extras'?3:sheet==='terrain'||sheet==='restrictions'?2:4;let cw=img.width/cols,ch=img.height/rows;const c=this.ctx;c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(angle);const rect=(sheet==='extras'?EXTRAS_RECTS:sheet==='terrain'?TERRAIN_RECTS:sheet==='restrictions'?HAZARD_RECTS:SPRITE_RECTS)[id]||[(id%4)*cw,Math.floor(id/4)*ch,cw,ch];c.drawImage(img,...rect,-w/2,-h/2,w,h);c.restore();}
 label(text,x,y,color='#fff5cd',size=10){const c=this.ctx;c.save();c.textAlign='center';c.font='900 '+size+'px -apple-system, sans-serif';c.lineWidth=4;c.strokeStyle='#173235';c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y);c.restore();}
 effect(kind,x,y,text){for(let i=0;i<(this.settings.motion?9:3);i++)this.fx.push({kind,x,y,life:.7+Math.random()*.5,age:0,vx:(Math.random()-.5)*140,vy:-40-Math.random()*110,rot:Math.random()*6});if(text)this.fx.push({kind:'text',x,y:y-20,life:1,age:0,vy:-42,vx:0,text});}
 road(g){this.world.road(g);}
 /* The painted road only has one centre dash, but steering is five-position. Draw the five lanes: soft dashed dividers that scroll and curve with the road,
    plus a faint glow in the lane the truck is heading for. Hazards, pickups and breadcrumbs all share these lane centres. */
 laneGuides(g){const c=this.ctx;c.save();c.fillStyle='#9dffe117';c.fillRect(this.x(g.lane,g.distance)-31,120,62,this.playerY-120);c.restore();}
 terrain(g){this.world.hazards(g);}
 rig(g,truckIndex,px,py,alpha){drawRig(this,{truck:g.truck,decal:g.decal,trailerPaint:g.trailerPaint,trailerDecal:g.trailerDecal,upgrades:g.upgrades,lane:g.lane,x:g.x,angle:g.angle,trailer:g.trailer,rear:g.rear,hasTrailer:g.hasTrailer!==false,job:g.job,grip:g.grip,boost:g.boost,shield:g.shield,hornAge:g.time-(g.hornAt??-10)},px,py,alpha,1,this.worldScale||.72,this.time);}
 nightLight(g){if(!g.night)return;const c=this.ctx,px=this.x(g.x,g.distance),reach=230+(g.upgrades.lights||0)*65;
  const full=Math.ceil(420+2*this.pad);if(!this.dark)this.dark=document.createElement('canvas');
  if(this.dark.width!==full)this.dark.width=full;if(this.dark.height!==Math.ceil(this.H))this.dark.height=Math.ceil(this.H);
  const m=this.dark.getContext('2d');m.clearRect(0,0,full,this.H);m.fillStyle='rgba(5,12,33,.78)';m.fillRect(0,0,full,this.H);
  m.save();m.translate(this.pad,0);m.globalCompositeOperation='destination-out';
  for(const dir of [-1,1]){m.save();m.translate(px+dir*15,this.playerY-36-reach*.37);m.scale(.45,1);
   const gr=m.createRadialGradient(0,0,10,0,0,reach*.70);gr.addColorStop(0,'rgba(0,0,0,.98)');gr.addColorStop(.60,'rgba(0,0,0,.81)');gr.addColorStop(1,'rgba(0,0,0,0)');
   m.fillStyle=gr;m.beginPath();m.arc(0,0,reach*.70,0,Math.PI*2);m.fill();m.restore();}
  m.globalCompositeOperation='source-over';m.restore();c.drawImage(this.dark,-this.pad,0,full,this.H);
 }
 draw(g,dt,truckIndex){const c=this.ctx;this.time+=dt;c.save();if(this.shake>0&&this.settings.motion){c.translate((Math.random()-.5)*this.shake,(Math.random()-.5)*this.shake);this.shake*=Math.exp(-dt*12);}this.road(g);if(this.settings.guides===true)this.laneGuides(g);this.terrain(g);
 for(const e of g.items){if(e.done||HAZARD_SPECS[e.type])continue;const y=this.playerY-(e.z-g.distance)*this.worldScale,x=this.x(e.lane,e.z);if(y< -100||y>this.H+100)continue;const collectible=PICKUPS.includes(e.type);const bob=collectible&&this.settings.motion?Math.sin(this.time*5+e.id)*5:0;let w=e.type==='crumb'?23:e.type==='coin'?31:e.type==='car'?46:e.type==='finish'?58:e.type==='job'?54:49;let h=e.type==='car'?68:w;
 if(this.world.pickup(e,x,y+bob))continue;
 if(collectible){c.save();c.shadowBlur=e.type==='crumb'?13:24;c.shadowColor=e.type==='job'?(e.double?'#d89bff':'#55ffda'):e.type==='finish'?'#55ffae':'#ffe69a';this.sprite(e.type==='night'?0:e.type==='boost'?1:SPR[e.type],x,y+bob,w,h,0,1,['night','boost'].includes(e.type)?'extras':'sprites');c.restore();if(e.type==='job')this.label(e.double?'DOUBLE ×2':'JOB',x,y-39,e.double?'#e4b9ff':'#a5ffe3',9);if(e.type==='night')this.label('NIGHT ×2',x,y-38,'#bde0ff',10);if(e.type==='boost')this.label('TURBO',x,y-38,'#ffe59a',10);if(e.type==='finish')this.label('CASH OUT',x,y-40,'#a5ffe3',9);}
 else if(HAZ[e.type]!==undefined){w=e.type.includes('bridge')?64:55;this.sprite(HAZ[e.type],x,y,w,w,0,1,'restrictions');if(LABELS[e.type])this.label(LABELS[e.type],x,y-34,'#fff2d2',7);}
 else this.sprite(SPR[e.type]??6,x,y,w,h,e.oncoming?Math.PI:0);
 }
 if(g.sheep){const s=g.sheep,y=this.playerY-(s.z-g.distance)*this.worldScale;for(let i=0;i<5;i++){let x=this.x(i,s.z),rot=Math.sin(this.time*5+i)*.12;let sy=y+Math.sin(i*3)*17;if(s.cleared){const move=Math.max(0,(g.time-s.baaAt-.3))*120;x+=(i<2?-1:1)*move;rot=i<2?-1.5:1.5;sy+=Math.sin(this.time*20+i)*5;}if(s.kind==='cows'){const c=this.ctx;c.save();c.translate(x,sy);c.rotate(rot);c.scale(1,this.worldScale);drawVehicle(c,this.images.vehicles,'cow',62,98,this.time+i);c.restore();}else this.sprite(12,x,sy,50,52,rot);}}
 for(const d of g.detached||[])drawTrailerOnly(this,g.trailerPaint??1,g.trailerDecal??0,d.x,this.playerY-(d.z-g.distance)*this.worldScale,RIG.trailerW,RIG.trailerL*this.worldScale,d.angle,Math.max(0,1-d.age/3));
 const px=this.x(g.x,g.distance);let alpha=g.invulnerable>0&&Math.floor(this.time*13)%2===0?.55:1;this.nightLight(g);this.rig(g,truckIndex,px,this.playerY,alpha);
 for(const f of this.fx){f.age+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.kind!=='text')f.vy+=190*dt;let a=clamp(1-f.age/f.life,0,1);if(f.kind==='text'){c.save();c.globalAlpha=a;this.label(f.text,f.x,f.y,'#fff0ad',17);c.restore();}else this.sprite(f.kind==='loss'?11:11,f.x,f.y,13,13,f.rot+f.age*7,a);}
 this.fx=this.fx.filter(f=>f.age<f.life);
 if(this.highlight){const h=this.highlight,t=this.time-h.t0,pulse=1+Math.sin(t*9)*.08,x=h.x,y=h.y;
  if(h.item)this.world.hazards({items:[{...h.item,done:false}],distance:g.distance,leaving:[]});   // the thing you hit, drawn on top so it's plainly visible
  c.save();c.strokeStyle='#ff4b3a';c.lineWidth=4;c.shadowColor='#ff4b3a';c.shadowBlur=14;c.beginPath();c.ellipse(x,y,h.rx*pulse,h.ry*pulse,0,0,Math.PI*2);c.stroke();c.shadowBlur=0;
  c.font='900 15px -apple-system,sans-serif';c.textAlign='center';const w=c.measureText(h.label).width+26,ly=Math.max(30,y-h.ry-30);c.fillStyle='#1c0b0b';c.strokeStyle='#ff4b3a';c.lineWidth=2.5;c.beginPath();c.roundRect(Math.min(420-w/2-8,Math.max(w/2+8,x))-w/2,ly-17,w,28,9);c.fill();c.stroke();c.fillStyle='#fff3e0';c.fillText(h.label,Math.min(420-w/2-8,Math.max(w/2+8,x)),ly+3);c.restore();}
 c.restore();}
}
export async function loadImages(){const names=['sprites','roads','restrictions','cover','terrain','extras'];const extra={routeSurfaces:'surfaces',routeProps:'props',routeTrucks:'trucks',routeShowroom:'showroom',routeScenery:'scenery'};let result={};await new Promise(res=>{const i=new Image();i.onload=()=>{result.vehicles=i;res();};i.onerror=()=>res();i.src=(window.TRUCKIN_IMAGE_DATA&&window.TRUCKIN_IMAGE_DATA.vehicles)||'./assets/route-v2/vehicles.webp';});
 await Promise.all([...names,...Object.keys(extra)].map(n=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>{result[n]=i;res();};i.onerror=()=>rej(new Error(n));i.src=(window.TRUCKIN_IMAGE_DATA&&window.TRUCKIN_IMAGE_DATA[n])||('./assets/'+(extra[n]?'route-v2/'+extra[n]:n)+'.webp');})));
 await Promise.all(['traffic','scenery','pickups'].map(name=>new Promise(resolve=>{
  const img=new Image();
  img.onload=()=>{result[name]=img;resolve();};
  img.onerror=()=>resolve();
  img.src='./assets/chase-pro/'+name+'.webp';
 })));
 return result;}
