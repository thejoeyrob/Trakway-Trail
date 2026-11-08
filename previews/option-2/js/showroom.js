import {ROUTE_ATLAS} from './route-atlas.js';
const TAU=Math.PI*2;
export function showroomFrame(angle){return ((Math.round(angle/(TAU/8))%8)+8)%8;}
export function drawShowroom(r,pv,angle,cx,cy,R,pop=0){
 const c=r.ctx,img=r.images.routeShowroom,frame=showroomFrame(angle),rect=ROUTE_ATLAS.showroom.rects[frame];
 if(!img||!rect)return;
 // Eight distinct camera views. The body is never rotated as a flat card.
 const width=R*1.83,height=Math.min(r.H*.72,R*1.52),scale=Math.min(width/rect[2],height/rect[3])*(1+pop*.025),w=rect[2]*scale,h=rect[3]*scale;
 c.save();c.translate(cx,cy-8);c.shadowColor='#0009';c.shadowBlur=13;c.shadowOffsetY=9;
 const hue=pv.truck===2?'hue-rotate(193deg) saturate(1.25)':pv.truck===3?'hue-rotate(100deg) saturate(1.18)':'none';
 c.filter=hue;c.drawImage(img,...rect,-w/2,-h/2,w,h);c.filter='none';c.shadowBlur=0;c.shadowOffsetY=0;
 // Body-mounted decorations use view-specific anchors. Rear views hide cab
 // accessories, avoiding impossible floating lights over the trailer doors.
 const mount=[{x:0,y:.00,s:1},{x:-.29,y:.13,s:.8},{x:-.37,y:-.23,s:.6},null,null,null,{x:.38,y:-.23,s:.6},{x:.29,y:.13,s:.8}][frame];
 const u=pv.upgrades||{};
 if(mount){const x=mount.x*w,y=mount.y*h;
  if(u.lights){r.world.atlas('routeTrucks',6,x,y-15*mount.s,42*mount.s,8*mount.s);}
  if(u.exhaust){r.world.atlas('routeTrucks',5,x,y+10*mount.s,48*mount.s,30*mount.s);}
  if(u.washroom||u.bunk)r.world.atlas('routeTrucks',7,x,y-5*mount.s,19*mount.s,10*mount.s);
 }
 if(pv.decal){const side=[null,{x:.1,y:-.04,s:.7},{x:.13,y:.02,s:1},{x:.05,y:.14,s:.62},null,{x:-.05,y:.14,s:.62},{x:-.13,y:.02,s:1},{x:-.1,y:-.04,s:.7}][frame];
  if(side)r.sprite(pv.decal+3,side.x*w,side.y*h,58*side.s,36*side.s,0,1,'extras');
 }
 c.restore();
 c.save();c.textAlign='center';c.fillStyle='#b3cec9';c.font='700 9px -apple-system,sans-serif';c.fillText(['FRONT','FRONT QUARTER','RIGHT SIDE','REAR QUARTER','REAR','REAR QUARTER','LEFT SIDE','FRONT QUARTER'][frame],cx,cy+R*.78);c.restore();
}
