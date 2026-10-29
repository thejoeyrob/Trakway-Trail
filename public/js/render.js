import {clamp,ROAD_TYPES,PICKUPS} from './model.js';
import {rigPose,roadShape,roadCurve,laneX} from './geometry.js';
import {SPRITE_RECTS,HAZARD_RECTS,TERRAIN_RECTS,EXTRAS_RECTS} from './atlas.js';
export const SPR={truck:0,trailer:1,orange:2,purple:3,car:4,redcar:5,cone:6,barrier:7,taco:8,job:9,finish:10,coin:11,sheep:12,face:13,flatbed:14,oil:15,crumb:11};
const HAZ={lowbridge:0,weakbridge:1,bus:2,noentry:3,narrow:4,sheepWarning:5,house:6,grass:7};
const LABELS={lowbridge:'LOW BRIDGE',weakbridge:'WEAK BRIDGE',bus:'BUS LANE',noentry:'NO ENTRY',house:'MIND THE HOUSE',grass:'KEEP OFF',narrow:'NARROW PASS'};
export class Renderer {
 constructor(canvas,images,settings){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.images=images;this.settings=settings;this.W=420;this.H=800;this.fx=[];this.shake=0;this.time=0;this.resize();}
 resize(){const r=this.canvas.getBoundingClientRect();this.H=420*r.height/r.width;let d=Math.min(window.devicePixelRatio||1,2);this.canvas.width=Math.round(r.width*d);this.canvas.height=Math.round(r.height*d);this.scale=this.canvas.width/420;this.ctx.setTransform(this.scale,0,0,this.scale,0,0);this.ctx.imageSmoothingEnabled=true;this.playerY=this.H*.65;}
 shape(z){return roadShape(z);}
 curve(z){return roadCurve(z);}
 x(lane,z){return laneX(lane,z);}
 sprite(id,x,y,w,h=w,angle=0,alpha=1,sheet='sprites'){const img=this.images[sheet];if(!img)return;let cols=4,rows=sheet==='extras'?3:sheet==='terrain'||sheet==='restrictions'?2:4;let cw=img.width/cols,ch=img.height/rows;const c=this.ctx;c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(angle);const rect=(sheet==='extras'?EXTRAS_RECTS:sheet==='terrain'?TERRAIN_RECTS:sheet==='restrictions'?HAZARD_RECTS:SPRITE_RECTS)[id]||[(id%4)*cw,Math.floor(id/4)*ch,cw,ch];c.drawImage(img,...rect,-w/2,-h/2,w,h);c.restore();}
 label(text,x,y,color='#fff5cd',size=10){const c=this.ctx;c.save();c.textAlign='center';c.font='900 '+size+'px -apple-system, sans-serif';c.lineWidth=4;c.strokeStyle='#173235';c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y);c.restore();}
 effect(kind,x,y,text){for(let i=0;i<(this.settings.motion?9:3);i++)this.fx.push({kind,x,y,life:.7+Math.random()*.5,age:0,vx:(Math.random()-.5)*140,vy:-40-Math.random()*110,rot:Math.random()*6});if(text)this.fx.push({kind:'text',x,y:y-20,life:1,age:0,vy:-42,vx:0,text});}
 road(distance){const c=this.ctx,img=this.images.roads;if(!img)return;const tile=img.width/2;for(let y=0;y<this.H;y+=6){const z=distance+this.playerY-y;let phase=((z%5400)+5400)%5400;let theme=Math.max(0,Math.floor(z/5400))%4;const raw=((z%(tile*2))+tile*2)%(tile*2);let sy=clamp(raw>=tile?tile*2-raw:raw-6,0,tile-6);const h=6;const curve=this.curve(z),width=this.shape(z).width;const draw=(idx,a=1)=>{c.globalAlpha=a;if(raw<tile){c.save();c.translate(0,y+6);c.scale(1,-1);c.drawImage(img,(idx%2)*tile,Math.floor(idx/2)*tile+sy,tile,h,(420-width)/2+curve,0,width,6);c.restore();}else{c.drawImage(img,(idx%2)*tile,Math.floor(idx/2)*tile+sy,tile,h,(420-width)/2+curve,y,width,6);}};draw(theme);if(phase<360&&z>=5400){draw((theme+3)%4,1-phase/360);}c.globalAlpha=1;}}
 terrain(g){
  const c=this.ctx,img=this.images.terrain;if(!img)return;
  for(const e of g.items){if(!e.road)continue;
   const id=ROAD_TYPES.indexOf(e.type),rect=TERRAIN_RECTS[id];if(!rect)continue;
   const len=e.length||190;
   for(let offset=0;offset<len;offset+=6){const z=e.z+offset,y=this.playerY-(z-g.distance),h=Math.min(6,len-offset);
    if(y< -8||y>this.H+8)continue;
    const laneWidth=roadShape(z).width*(280/627)/5;
    const sy=rect[1]+rect[3]*(1-(offset+h)/len),sh=Math.max(1,rect[3]*h/len);
    c.drawImage(img,rect[0],sy,rect[2],sh,this.x(e.lane,z)-laneWidth/2,y-h,laneWidth,h+.7);
   }
   const warn=e.z-(e.warning||390),wy=this.playerY-(warn-g.distance);
   if(wy>28&&wy<this.H-25){const wx=this.x(e.lane,warn);
    this.sprite(({lowbridge:0,weakbridge:1,bus:2,noentry:3,narrow:4,grass:7,house:6,works:4})[e.type],wx,wy,39,39,0,1,'restrictions');
    const title={lowbridge:'LOW BRIDGE',weakbridge:'WEAK BRIDGE',bus:'BUS LANE',noentry:'NO ENTRY',narrow:'NARROW',grass:'VERGE',house:'HOUSES',works:'ROADWORKS'}[e.type];
    this.label(title,wx,wy+29,'#fff3c1',7);this.label('AHEAD',wx,wy+39,'#fff3c1',7);
   }
  }
 }
 rig(g,truckIndex,px,py,alpha){
  const angle=clamp((g.lane-g.x)*.16,-.2,.2),pose=rigPose(px,py,angle,g.angle,clamp((g.trailer-g.rear)*.55,-.8,.8)),u=g.upgrades||{},decal=g.decal||0;
  // Tractor rear chassis is below the trailer; both trailer sprites are anchored to genuine hitches.
  this.sprite(truckIndex,px,py,61,81,angle,alpha);
  if(u.washroom)this.sprite(3,px,py+9,42,25,angle,alpha,'extras');
  if(u.exhaust)this.sprite(2,px,py-5,64,33,angle,alpha,'extras');
  if(u.lights)this.sprite(7,px+Math.sin(angle)*29,py-Math.cos(angle)*29,39,11,angle,alpha,'extras');
  if(decal)this.sprite(decal+3,px+Math.sin(angle)*18,py-Math.cos(angle)*18,28,24,angle,alpha,'extras');
  if(g.job?.double)this.sprite(14,pose.rear.x,pose.rear.y,56,108,pose.rear.angle,alpha);
  this.sprite(1,pose.trailer.x,pose.trailer.y,59,116,pose.trailer.angle,alpha);
  if(decal)this.sprite(decal+3,pose.trailer.x,pose.trailer.y-8,42,42,pose.trailer.angle,alpha*.95,'extras');
 }
 nightLight(g){if(!g.night)return;const c=this.ctx,px=this.x(g.x,g.distance),reach=230+(g.upgrades.lights||0)*65;
  if(!this.dark){this.dark=document.createElement('canvas');this.dark.width=420;}
  if(this.dark.height!==Math.ceil(this.H))this.dark.height=Math.ceil(this.H);
  const m=this.dark.getContext('2d');m.clearRect(0,0,420,this.H);m.fillStyle='rgba(5,12,33,.78)';m.fillRect(0,0,420,this.H);
  m.globalCompositeOperation='destination-out';
  for(const dir of [-1,1]){m.save();m.translate(px+dir*15,this.playerY-36-reach*.37);m.scale(.45,1);
   const gr=m.createRadialGradient(0,0,10,0,0,reach*.70);gr.addColorStop(0,'rgba(0,0,0,.98)');gr.addColorStop(.60,'rgba(0,0,0,.81)');gr.addColorStop(1,'rgba(0,0,0,0)');
   m.fillStyle=gr;m.beginPath();m.arc(0,0,reach*.70,0,Math.PI*2);m.fill();m.restore();}
  m.globalCompositeOperation='source-over';c.drawImage(this.dark,0,0,420,this.H);
 }
 draw(g,dt,truckIndex){const c=this.ctx;this.time+=dt;c.save();if(this.shake>0&&this.settings.motion){c.translate((Math.random()-.5)*this.shake,(Math.random()-.5)*this.shake);this.shake*=Math.exp(-dt*12);}this.road(g.distance);this.terrain(g);
 for(const e of g.items){if(e.done||e.road)continue;const y=this.playerY-(e.z-g.distance),x=this.x(e.lane,e.z);if(y< -100||y>this.H+100)continue;const collectible=PICKUPS.includes(e.type);const bob=collectible&&this.settings.motion?Math.sin(this.time*5+e.id)*5:0;let w=e.type==='crumb'?23:e.type==='coin'?31:e.type==='car'?46:e.type==='finish'?58:e.type==='job'?54:49;let h=e.type==='car'?68:w;
 if(collectible){c.save();c.shadowBlur=e.type==='crumb'?13:24;c.shadowColor=e.type==='job'?(e.double?'#d89bff':'#55ffda'):e.type==='finish'?'#55ffae':'#ffe69a';this.sprite(e.type==='night'?0:e.type==='boost'?1:SPR[e.type],x,y+bob,w,h,0,1,['night','boost'].includes(e.type)?'extras':'sprites');c.restore();if(e.type==='job')this.label(e.double?'DOUBLE ×2':'JOB',x,y-39,e.double?'#e4b9ff':'#a5ffe3',9);if(e.type==='night')this.label('NIGHT ×2',x,y-38,'#bde0ff',10);if(e.type==='boost')this.label('TURBO',x,y-38,'#ffe59a',10);if(e.type==='finish')this.label('CASH OUT',x,y-40,'#a5ffe3',9);}
 else if(HAZ[e.type]!==undefined){w=e.type.includes('bridge')?64:55;this.sprite(HAZ[e.type],x,y,w,w,0,1,'restrictions');if(LABELS[e.type])this.label(LABELS[e.type],x,y-34,'#fff2d2',7);}
 else this.sprite(SPR[e.type]??6,x,y,w,h);
 }
 if(g.sheep){const s=g.sheep,y=this.playerY-(s.z-g.distance);for(let i=0;i<5;i++){let x=this.x(i,s.z),rot=Math.sin(this.time*5+i)*.12;let sy=y+Math.sin(i*3)*17;if(s.cleared){const move=Math.max(0,(g.time-s.baaAt-.3))*120;x+=(i<2?-1:1)*move;rot=i<2?-1.5:1.5;sy+=Math.sin(this.time*20+i)*5;}this.sprite(12,x,sy,50,52,rot);}}
 const px=this.x(g.x,g.distance);let alpha=g.invulnerable>0&&Math.floor(this.time*13)%2===0?.55:1;this.nightLight(g);this.rig(g,truckIndex,px,this.playerY,alpha);
 for(const f of this.fx){f.age+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.kind!=='text')f.vy+=190*dt;let a=clamp(1-f.age/f.life,0,1);if(f.kind==='text'){c.save();c.globalAlpha=a;this.label(f.text,f.x,f.y,'#fff0ad',17);c.restore();}else this.sprite(f.kind==='loss'?11:11,f.x,f.y,13,13,f.rot+f.age*7,a);}
 this.fx=this.fx.filter(f=>f.age<f.life);c.restore();}
}
export async function loadImages(){const names=['sprites','roads','restrictions','cover','terrain','extras'];let result={};await Promise.all(names.map(n=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>{result[n]=i;res();};i.onerror=()=>rej(new Error(n));i.src='./assets/'+n+'.webp';})));return result;}
