import {roadAt,hash,steeringX,CHUNK_LENGTH,surfaceAt,sceneryProps,sideProps} from './route-world.js';
import {roadTheme} from './geometry.js';
import {ROUTE_ATLAS} from './route-atlas.js';
import {HAZARD_SPECS,PICKUP_SPECS} from './route-hazards.js';
import {drawProp} from './propart.js';
const mod=(n,m)=>((n%m)+m)%m;
export class RoutePainter{
 constructor(renderer){this.r=renderer;this.patterns=[];this.makePatterns();}
 /* Seamless ground textures. The atlas cells have a bright 1-2 px border and are not tileable, so each cell is cropped inward and made
    periodic by cross-fading it with a half-tile-shifted copy (no mirroring, so no kaleidoscope pattern or seam line every 256 px). */
 makePatterns(){const img=this.r.images.routeSurfaces;if(!img)return;const N=256,inset=12;
  // Raised-cosine alpha mask (generated, never read back), so the whole thing works with images loaded from local files on iOS.
  const mask=document.createElement('canvas');mask.width=mask.height=N;{const mx=mask.getContext('2d'),md=mx.createImageData(N,N);
   for(let y=0;y<N;y++){const wy=.5-.5*Math.cos(2*Math.PI*y/N);for(let x=0;x<N;x++){const wx=.5-.5*Math.cos(2*Math.PI*x/N),i=(y*N+x)*4;md.data[i+3]=Math.round(255*wx*wy);}}mx.putImageData(md,0,0);}
  for(const rect of ROUTE_ATLAS.surfaces.rects){
   const A=document.createElement('canvas');A.width=A.height=N;const ax=A.getContext('2d');ax.drawImage(img,rect[0]+inset,rect[1]+inset,rect[2]-2*inset,rect[3]-2*inset,0,0,N,N);
   const out=document.createElement('canvas');out.width=out.height=N;const ox=out.getContext('2d');
   // B: the tile shifted by half a tile in both directions (wrapped)
   for(const dx of[-N/2,N/2])for(const dy of[-N/2,N/2])ox.drawImage(A,dx,dy);
   // A, faded out towards its edges by the mask, laid over B
   const Am=document.createElement('canvas');Am.width=Am.height=N;const amx=Am.getContext('2d');amx.drawImage(A,0,0);amx.globalCompositeOperation='destination-in';amx.drawImage(mask,0,0);
   ox.drawImage(Am,0,0);this.patterns.push(this.r.ctx.createPattern(out,'repeat'));
  }
 }
 atlas(sheet,id,x,y,w,h,angle=0,alpha=1){const r=this.r,c=r.ctx,key=sheet.replace('route','').toLowerCase(),meta=ROUTE_ATLAS[key],img=r.images[sheet],rect=meta?.rects[id];if(!img||!rect)return;
  c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=alpha;c.drawImage(img,...rect,-w/2,-h/2,w,h);c.restore();
 }
 paint(id,x,y,w,h,offset){const c=this.r.ctx,p=this.patterns[id];if(!p)return;p.setTransform(new DOMMatrix().translate(0,offset));c.fillStyle=p;c.fillRect(x,y,w,h);}
 road(g){const r=this.r,c=r.ctx,scale=r.worldScale,offset=mod(r.playerY+g.distance*scale,256);
  const topZ=g.distance+r.playerY/scale,bottomZ=g.distance+(r.playerY-r.H)/scale;
  this.paint([7,3,12,11][roadTheme(bottomZ)],-r.pad,0,420+2*r.pad,r.H,offset);
  const boundary=(Math.floor(bottomZ/5400)+1)*5400,by=r.playerY-(boundary-g.distance)*scale;
  if(by>0&&by<r.H){c.save();c.beginPath();c.rect(-r.pad,0,420+2*r.pad,by);c.clip();this.paint([7,3,12,11][roadTheme(boundary+1)],-r.pad,0,420+2*r.pad,r.H,offset);c.restore();}
  const samples=[];for(let y=-8;y<=r.H+8;y+=4)samples.push({y,z:g.distance+(r.playerY-y)/scale,a:roadAt(g.distance+(r.playerY-y)/scale,g.seed)});
  const polygon=(rows,getBand,expand=0)=>{const path=new Path2D();if(!rows.length)return path;
   rows.forEach((row,i)=>{const b=getBand(row);const x=b.left-expand;i?path.lineTo(x,row.y):path.moveTo(x,row.y);});
   for(let i=rows.length-1;i>=0;i--){const b=getBand(rows[i]);path.lineTo(b.right+expand,rows[i].y);}path.closePath();return path;};
  const fills=(path,id)=>{c.save();c.clip(path);this.paint(id,-r.pad,0,420+2*r.pad,r.H,offset);c.restore();};
  const river=samples.filter(row=>row.a.motif==='river-bend'&&row.a.gate>.04),bank=g=>{const t=Math.max(0,Math.min(1,(g-.04)/.5));return t*t*(3-2*t);};
  if(river.length)fills(polygon(river,row=>{const t=bank(row.a.gate);if(row.a.side<0){const l=row.a.bands[0].right+20;return {left:l,right:l+(420+r.pad-l)*t};}const rt=row.a.bands[0].left-20;return {left:rt-(rt+r.pad)*t,right:rt};}),14);
  // Each complete road ribbon is filled once. Scanline rectangles leave tiny
  // antialias seams on high-DPI screens, so they are deliberately not used.
  const all=new Path2D(),shoulders=new Path2D();
  for(let branch=0;branch<2;branch++){
   let run=[];const flush=()=>{if(run.length){all.addPath(polygon(run,r=>r.a.bands[branch]));shoulders.addPath(polygon(run,r=>r.a.bands[branch],8));run=[];}};
   for(const row of samples){if(row.a.bands[branch])run.push(row);else flush();}flush();
  }
  fills(shoulders,2);fills(all,0);
  for(let branch=0;branch<2;branch++){let mud=[];const flush=()=>{if(mud.length){fills(polygon(mud,r=>r.a.bands[branch]),5);mud=[];}};
   for(const row of samples){if(row.a.bands[branch]?.surface==='mud')mud.push(row);else flush();}flush();}
  // Soft entry into the mud: faded slices just before the surface turns to mud, so there is no hard cut across the lane.
  for(let branch=0;branch<2;branch++){const fade=samples.filter(row=>row.a.motif==='farm-fork'&&row.a.bands[branch]&&row.a.bands[branch].branch===row.a.restricted&&row.a.gate>.4&&row.a.bands[branch].surface!=='mud');
   for(let i=0;i+1<fade.length;i++){if(fade[i+1].y-fade[i].y>8)continue;const t=Math.max(0,Math.min(1,(fade[i].a.gate-.4)/.25)),k=t*t*(3-2*t);c.save();c.globalAlpha=k;fills(polygon([fade[i],fade[i+1]],r=>r.a.bands[branch]),5);c.restore();}}
  // Only the outside boundary is stroked while branches overlap. Once they
  // separate, the island gains its own continuous pair of edge markings.
  c.save();c.strokeStyle='#eeeaddb0';c.lineWidth=1.5;
  for(const edge of ['outerLeft','outerRight','innerLeft','innerRight']){c.beginPath();let active=false;
   for(const row of samples){const b=row.a.bands,gap=b.length===2&&b[0].right<b[1].left;let x;
    if(edge==='outerLeft')x=b[0].left+2;else if(edge==='outerRight')x=b.at(-1).right-2;else if(gap)x=edge==='innerLeft'?b[0].right-2:b[1].left+2;
    if(x===undefined){active=false;continue;}if(active)c.lineTo(x,row.y);else c.moveTo(x,row.y);active=true;
   }c.stroke();}
  // Lane dividers: a wide road is painted as 4-5 proper lanes (about 74 units each); narrower roads and fork branches get 2-3.
  c.strokeStyle='#eee5ccaa';c.lineWidth=1.5;
  for(let branch=0;branch<2;branch++)for(let k=1;k<=4;k++){c.beginPath();let active=false,prevN=0;for(const row of samples){let b=row.a.bands,split=b.length===2&&b[0].right<b[1].left;
    if(!split)b=[{left:b[0].left,right:b.at(-1).right,surface:'asphalt'}];const lane=b[branch];
    const w=lane?lane.right-lane.left:0,n=w>=340?5:Math.max(1,Math.round(w/74));
    if(!lane||lane.surface==='mud'||n<=k||mod(row.z,100)>43){active=false;continue;}
    const lw=Math.min(78,w/n),x=(lane.left+lane.right)/2+(k-n/2)*lw;if(n!==prevN)active=false;prevN=n;active?c.lineTo(x,row.y):c.moveTo(x,row.y);active=true;}c.stroke();}
  c.restore();
  // Roadside props are anchored in world coordinates and never drift relative
  // to the road. Their footprints stay outside the driveable asphalt.
  for(const p of sceneryProps(g.distance+(r.playerY-r.H)/scale-150,g.distance+r.playerY/scale+150,g.seed))this.atlas(p.sheet||'routeProps',p.sprite,p.x,r.playerY-(p.z-g.distance)*scale,p.width,p.height*scale,0,.98);
  for(const p of sideProps(g.distance+(r.playerY-r.H)/scale-150,g.distance+r.playerY/scale+150,g.seed,r.pad))this.atlas(p.sheet,p.sprite,p.x,r.playerY-(p.z-g.distance)*scale,p.width,p.height*scale,0,.98);
  this.signs(g);
 }
 /* Signs stand on the verge beside the road, never on it, and only where the driver has a decision to make (forks and roadworks). */
 post(x,y,lines,tone){const c=this.r.ctx,w=42,h=lines.length>1?30:22;c.save();c.fillStyle='#0b1c1fcc';c.fillRect(x-1.2,y+h/2,2.4,16);c.fillStyle=tone;c.strokeStyle='#f3f6e6';c.lineWidth=1.6;c.beginPath();c.roundRect(x-w/2,y-h/2,w,h,3);c.fill();c.stroke();
  c.fillStyle='#fbfcef';c.font='800 6.6px -apple-system,sans-serif';c.textAlign='center';lines.forEach((t,i)=>c.fillText(t,x,y+(lines.length>1?-2.5+i*9:2.5)));c.restore();}
 signs(g){const r=this.r,c=r.ctx,start=Math.max(0,Math.floor(g.distance/CHUNK_LENGTH)-1),end=start+2;
  for(let i=start;i<=end;i++){const a=roadAt(i*CHUNK_LENGTH+900,g.seed),y=r.playerY-(a.signZ-g.distance)*r.worldScale;if(y< -50||y>r.H+50)continue;
   if(a.sign.left){this.post(13,y,a.sign.left.split(' • '),a.sign.left==='MAIN ROAD'?'#1d5b3a':'#7a2a1e');this.post(407,y,a.sign.right.split(' • '),a.sign.right==='MAIN ROAD'?'#1d5b3a':'#7a2a1e');}
   else if(a.motif==='roadworks'){const t=a.sign.text.split(' • ');this.post(a.side<0?407:13,y,t,'#b8651a');}
  }
  // Arrows belong to the road. No-entry branch points toward the driver.
  for(let z=Math.floor((g.distance-300)/340)*340;z<g.distance+r.playerY/r.worldScale;z+=340){const a=roadAt(z,g.seed);if(a.gate<.97||a.bands.length<2)continue;
   for(const b of a.bands){const x=(b.left+b.right)/2,y=r.playerY-(z-g.distance)*r.worldScale;c.save();c.translate(x,y);if(b.rule==='oneway')c.rotate(Math.PI);c.fillStyle=b.rule?'#ffdfc3a0':'#e9eddca0';c.beginPath();c.moveTo(0,-17);c.lineTo(10,-4);c.lineTo(4,-4);c.lineTo(4,13);c.lineTo(-4,13);c.lineTo(-4,-4);c.lineTo(-10,-4);c.closePath();c.fill();c.restore();}
  }
 }
 hazards(g){const r=this.r,c=r.ctx;this.leaving(g);for(const e of g.items){if(e.done)continue;const spec=HAZARD_SPECS[e.type];if(!spec)continue;const x=steeringX(e.lane),y=r.playerY-(e.z-g.distance)*r.worldScale;if(y< -160||y>r.H+160)continue;
   const h=spec.height*r.worldScale+(e.length||0)*r.worldScale;
   if(spec.draw){c.save();c.translate(x,y);c.scale(1,r.worldScale);drawProp(c,spec.draw,spec.width,spec.height,r.time+e.id);c.restore();}
   else if(spec.sheet.startsWith('route'))this.atlas(spec.sheet,spec.sprite,x,y-(e.length||0)*r.worldScale/2,spec.width,h,e.oncoming?Math.PI:0);
   else r.sprite(spec.sprite,x,y-(e.length||0)*r.worldScale/2,spec.width,h,e.oncoming?Math.PI:0,1,spec.sheet);
   if(e.honkable&&e.z-g.distance>60&&e.z-g.distance<620)r.label('HONK!',x,y-h/2-6,'#fff0a8',9);
   if(e.oncoming){r.label('ONCOMING',x,y-43,'#ffd1aa',7);}
   if(['lowbridge','weakbridge','bus','footpath'].includes(e.type)){const labels={lowbridge:'LOW BRIDGE',weakbridge:'WEIGHT LIMIT',bus:'BUS ONLY',footpath:'PUBLIC PATH'};r.label(labels[e.type],x,y-h/2-8,'#ffebb5',7);}
   if(r.settings.hitboxes){c.save();c.strokeStyle='#ff4bcc';c.lineWidth=1;c.strokeRect(x-spec.hitWidth/2,y-(e.length||0)*r.worldScale-spec.hitHeight*r.worldScale/2,spec.hitWidth,(spec.hitHeight+(e.length||0))*r.worldScale);c.restore();}
  }
 }
 pickup(e,x,y){const spec=PICKUP_SPECS[e.type];if(!spec)return false;const c=this.r.ctx;if(spec.draw){c.save();c.translate(x,y);drawProp(c,spec.draw,spec.width,spec.height,this.r.time+e.id);c.restore();}else this.atlas(spec.sheet,spec.sprite,x,y,spec.width,spec.height);const L={hitch:['HITCH UP','#a3ffd0'],prize:['£85 BONUS','#ffe7a2'],shield:['LUCKY SHOE','#fff0a8']}[e.type];this.r.label(L[0],x,y-29,L[1],8);return true;}
 /* Cows and geese you've honked away trot off to the side and fade. */
 leaving(g){const r=this.r,c=r.ctx;for(const d of g.leaving||[]){const spec=HAZARD_SPECS[d.type];if(!spec)continue;const y=r.playerY-(d.z-g.distance)*r.worldScale,x=steeringX(d.lane)+d.dir*d.age*130;c.save();c.globalAlpha=Math.max(0,1-d.age/1.4);c.translate(x,y);c.scale(1,r.worldScale);c.rotate(d.dir*.5*Math.min(1,d.age*3));drawProp(c,spec.draw,spec.width,spec.height,r.time*3);c.restore();}}
}
