import {laneX,rigPose,roadTheme} from './geometry.js';
import {chooseRoadScenario} from './road-events.js';
import {ROUTE_VERSION,CHUNK_LENGTH,roadAt,surfaceAt,routeLanes,laneCorridor,nearestLane,reachableCorridor,steeringX,sceneryProps,rewardPath} from './route-world.js';
import {HAZARD_SPECS,sweptOverlap} from './route-hazards.js';
import {normalize,deliveryBonus} from './upgrades.js';
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const themes=['THE TOWN RUN','COUNTRY MILES','SUBURBAN SHORTCUT','HARD HAT HAUL'];
export const ROAD_TYPES=['lowbridge','weakbridge','bus','noentry','narrow','grass','house','works'];
/* Hazards that end the shift outright, each with its own comic vignette (see COMICS in game.js) and result-sheet line. */
export const CRASHES={car:'Not a bumper car.',lowbridge:'Height restriction. Not a suggestion.',weakbridge:'Weight limit: less than you.',oil:'Slick move, driver.',house:'Planning permission denied.',sheep:'Ewe had one job.'};
export const PICKUPS=['job','crumb','finish','taco','coin','night','boost','hitch','prize'];
export function seeded(seed){const fn=()=>{seed|=0;seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;fn.state=seed;return((t^t>>>14)>>>0)/4294967296;};fn.state=seed;return fn;}
export function jobPath(lane,rng,count=10){const p=[];for(let i=0;i<count;i++){if(i%2)lane=clamp(lane+(rng()>.5?1:-1),0,4);p.push(lane);}return p;}
export function biomeAt(z){return roadTheme(z);}
export function hazardKinds(z){return [['car','cone','bus','noentry','lowbridge'],['grass','weakbridge','oil','lowbridge','narrow'],['house','car','noentry','narrow'],['barrier','cone','oil','works']][biomeAt(z)];}
export class Drive {
 constructor(options={}){
  this.seed=options.seed??Date.now();this.routeVersion=ROUTE_VERSION;this.hasTrailer=true;this.grip=0;this.offroad=0;this.surface='asphalt';this.dropCooldown=0;this.detached=[];this.routeFines={};this.routeChoice={};this.nextHitch=0;this.nearIds=[];this.sceneryHits={};this.rng=seeded(this.seed);
  this.mode=options.mode||'endless';this.upgrades=normalize(this.mode==='daily'?{}:options.upgrades);
  this.truck=this.mode==='daily'?0:(options.truck||0);this.decal=this.mode==='daily'?0:(options.decal||0);
  this.events=[];this.items=[];this.distance=0;this.time=0;this.money=500;this.earned=0;this.fines=0;this.jobs=0;this.crumbs=0;this.horns=0;this.near=0;
  this.lane=2;this.x=2;this.trailer=2;this.rear=2;this.sway=0;this.angle=0;this.rapid=0;this.lastMove=-10;this.invulnerable=0;this.speed=180;
  this.lastScenario='';this.cruise=240;this.row=900;this.nextJob=600;this.nextSheep=6500;this.nextNight=5600;this.nextBoost=2100;this.night=null;this.nights=0;this.boost=0;this.rested=this.upgrades.bunk?20+8*this.upgrades.bunk:0;
  this.job=null;this.sheep=null;this.finished=false;this.endReason='';this.stage=0;this.slow=0;this.multiplier=1;this.id=0;this.sheepFail=0;this.combo=0;this.crashKind='';this.lives=this.upgrades.insurance>=3?1:0;
 }
 snapshot(){const d={...this,rngState:this.rng.state};delete d.rng;d.events=[];return d;}
 static restore(data){if(!data||data.finished||!Number.isFinite(data.distance)||data.distance<0||!Array.isArray(data.items)||data.items.length>600||!Number.isFinite(data.money))return null;const g=new Drive();for(const k of Object.keys(g))if(k!=='rng'&&k!=='events'&&Object.hasOwn(data,k))g[k]=data[k];g.upgrades=normalize(g.upgrades);g.rng=seeded(data.rngState||1);g.events=[];if(data.routeVersion!==ROUTE_VERSION){g.items=[];g.job=null;g.night=null;g.sheep=null;g.row=g.distance+900;g.nextJob=g.distance+700;g.nextNight=g.distance+5500;g.lane=g.x=g.trailer=g.rear=nearestLane(g.distance,2,g.seed);g.emit('hint',{text:'Road upgrade loaded. Your shift balance is safe.'});}g.routeVersion=ROUTE_VERSION;return g;}
 emit(type,data={}){this.events.push({type,...data});}
 add(type,z,lane,props={}){const road=ROAD_TYPES.includes(type),spec=HAZARD_SPECS[type];const e={id:++this.id,type,z,lane,done:false,collectible:PICKUPS.includes(type),...(road?{road:true,length:['bus','noentry','works'].includes(type)?310:190,warning:390}:{}),...props};if(spec){e.hitWidth=spec.hitWidth;e.hitHeight=spec.hitHeight;}this.items.push(e);return e;}
 dropTrailer(){
  if(this.finished||!this.hasTrailer||this.dropCooldown>0)return false;
  const lost=this.job?.pay||0;this.hasTrailer=false;this.dropCooldown=1.5;
  this.detached.push({x:laneX(this.x,this.distance),z:this.distance-72,angle:this.angle,age:0,double:!!this.job?.double});
  this.job=null;this.multiplier=1;this.sway=0;this.rapid=0;this.angle=0;
  this.items=this.items.filter(e=>!['crumb','finish'].includes(e.type));
  this.nextHitch=this.distance+1050;this.row=Math.max(this.row,this.distance+600);
  this.emit('trailerDrop',{lost});return true;
 }
 hitchTrailer(){if(this.hasTrailer)return;this.hasTrailer=true;this.trailer=this.rear=this.x;this.angle=this.rapid=this.sway=0;this.dropCooldown=1.5;this.emit('trailerHitch');}
 move(direction){if(this.finished)return;const next=clamp(this.lane+direction,0,4);if(next===this.lane)return;this.rapid=clamp(this.rapid+(this.time-this.lastMove<.2?.3:.07),0,1.5);this.lastMove=this.time;this.lane=next;this.emit('steer');}
 horn(){if(this.finished)return;this.emit('horn');if(!this.sheep||this.sheep.cleared)return;const s=this.sheep,delta=this.time-s.baaAt;if(s.baa&&delta>=0&&delta<=.75+this.upgrades.horn*.16){s.cleared=true;this.horns++;this.award(75,'WOOL DONE!');this.emit('sheepClear');}else this.emit('hint',{text:s.baa?'Too late! Brake for the flock.':'Wait for the BAA…'});}
 award(value,label){this.money+=value;this.earned+=value;this.emit('cash',{value,label});}
 fine(value,label){if(this.invulnerable>0)return;value=Math.round(value*(1-.12*this.upgrades.insurance));this.money-=value;this.fines+=value;this.combo=0;this.invulnerable=1.3;this.slow=.8;this.emit('loss',{value,label});if(this.money<=0)this.end('The float has floated away.');}
 jobValue(value){return Math.round(value*this.multiplier*(1+deliveryBonus(this.upgrades,this.truck,this.decal)));}
 startJob(item){if(this.job||this.night)return;this.hitchTrailer();this.multiplier=item.double?2:1;this.job={label:item.double?'THE DOUBLE TROUBLE':'SUPERMARKET SWEEP',pay:this.jobValue(150),count:0,total:10,double:!!item.double,end:item.z+1780};this.items=this.items.filter(e=>e===item||e.z+(e.length||0)<item.z-240||e.z>this.job.end+650);
  const positions=Array.from({length:10},(_,i)=>item.z+160*(i+1));positions.push(this.job.end);const p=rewardPath(positions,item.lane,this.seed,this.rng);
  positions.forEach((z,i)=>this.add(i===10?'finish':'crumb',z,p[i]));
  // Two authored obstacles sit beside the trail where the road has room. They
  // cannot consume the selected pickup lane or the escape corridor.
  for(const i of [3,7]){const z=positions[i],other=laneCorridor(z-100,z+200,this.seed,true).filter(l=>l!==p[i]&&Math.abs(l-p[i])>0);if(other.length>=2)this.add('cone',z,other[0]);}
  this.row=Math.max(this.row,this.job.end+650);this.nextJob=this.job.end+1000;this.emit('job',{label:this.job.label,double:this.job.double});}
 startNight(item){if(this.job||this.sheep||this.night)return;const end=item.z+4200;this.night={start:item.z,end};this.nights++;this.items=this.items.filter(e=>e===item||e.z+(e.length||0)<item.z-235||e.z>end+600);const positions=Array.from({length:40},(_,i)=>item.z+(i+1)*100),path=rewardPath(positions,item.lane,this.seed,this.rng);
  for(let i=0;i<40;i++){this.add('coin',positions[i],path[i],{nightCoin:true});if(i%10===7){const other=laneCorridor(positions[i]-100,positions[i]+180,this.seed,true).filter(l=>l!==path[i]);if(other.length>=2)this.add('cone',positions[i],other[0]);}}
  this.row=Math.max(this.row,end+650);this.nextJob=Math.max(this.nextJob,end+760);this.nextSheep=Math.max(this.nextSheep,end+1100);this.nextNight=end+4300;this.emit('night');}
 collect(e){if(e.done)return;e.done=true;switch(e.type){
  case 'hitch':this.hitchTrailer();break;case 'prize':this.award(85,'RISK REWARDED');this.emit('prize');break;
  case 'mud':this.grip=Math.max(this.grip,4.8);this.emit('mud');break;case 'pit':this.fine(95,'That pothole has ambition.');break;case 'footpath':this.fine(90,'Public path. Private embarrassment.');break;
  case 'job':this.startJob(e);break;case 'night':this.startNight(e);break;
  case 'boost':this.boost=7+this.upgrades.exhaust;this.emit('boost');break;
  case 'crumb':if(this.job){this.job.count++;this.crumbs++;this.combo++;const v=this.jobValue(25);this.job.pay+=v;this.emit('crumb',{value:v});}break;
  case 'finish':if(this.job){const pay=this.job.pay,dbl=this.job.double;this.jobs++;this.award(pay,'DELIVERY BANKED');this.emit('delivery',{pay,perfect:this.job.count===10,double:dbl});this.job=null;this.multiplier=1;}break;
  case 'taco':this.award(100+20*this.upgrades.washroom,'TACO BREAK. PAID.');this.slow=2.4;this.emit('taco');break;
  case 'coin':this.award(Math.round(15*(this.night?2:1)*(1+.05*this.upgrades.exhaust)),this.night?'DOUBLE BUBBLE':'ROAD BONUS');break;
  case 'car':case 'lowbridge':case 'weakbridge':case 'oil':case 'house':this.crash(e.type);break;case 'cone':case 'barrier':case 'works':this.fine(70,'Cones are not a slalom.');break;
  case 'narrow':this.fine(80,'Mirrors are wider than optimism.');break;case 'bus':this.fine(90,'You are not a bus.');break;
  case 'noentry':this.fine(120,'Sat-nav says… absolutely not.');break;
  case 'grass':this.grip=Math.max(this.grip,4.8);this.fine(65,'Lawn care: £65.');break;
 }}
 crash(kind){if(this.finished)return;
  if(this.lives>0){this.lives--;this.money-=400;this.fines+=400;this.combo=0;this.invulnerable=2.6;this.slow=1.2;this.rapid=0;this.emit('bailout',{kind,value:400});if(this.money<=0)this.end('The float has floated away.');return;}
  this.crashKind=kind;this.emit('crash',{kind});this.end(CRASHES[kind]);}
 end(reason){if(this.finished)return;this.finished=true;this.endReason=reason;this.emit('end',{reason});}
 /* ---- lane occupancy: hazards, pickups and oncoming traffic are never placed on top of each other ---- */
 laneBusy(lane,z0,z1,pad=110){return this.items.some(e=>!e.done&&e.lane===lane&&e.z-pad<z1&&e.z+(e.length||40)+pad>z0);}
 openLanes(z0,z1,pad=60){return [0,1,2,3,4].filter(l=>!this.laneBusy(l,z0,z1,pad));}
 shuffled(){const a=[0,1,2,3,4];for(let i=4;i>0;i--){const j=Math.floor(this.rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 /* One row of 1-3 hazards. At least two lanes stay open and one of them is reachable (one swipe per ~0.34s) from the lanes that were open just before. Returns the row's length. */
 makeRow(z,gapSec){
  const route=roadAt(z,this.seed),corridor=laneCorridor(z-100,z+240,this.seed,true);
  if(corridor.length<2)return 160;
  const centre=nearestLane(z,2,this.seed),order=corridor.slice().sort((a,b)=>Math.abs(a-centre)-Math.abs(b-centre));
  if(this.rng()<.5)order.reverse();let chosen=null;
  const biome=biomeAt(z),pool=route.motif==='roadworks'?['works','pit','barrier']:biome===1?['mud','car','weakbridge']:biome===2?['car','footpath','cone']:biome===3?['works','pit','oil']:['car','cone','bus'];
  for(const lane of order){
   const kind=pool[Math.floor(this.rng()*pool.length)],candidate={type:kind,lane,z,length:0,done:false,collectible:false};
   if(this.laneBusy(lane,z-150,z+200,90))continue;
   const hazards=this.items.filter(e=>!e.collectible&&!e.done);
   if(!reachableCorridor([...hazards,candidate],z-500,z+650,this.seed))continue;
   chosen=this.add(kind,z,lane,{length:0,road:ROAD_TYPES.includes(kind),warning:430});break;
  }
  const safe=chosen?corridor.filter(l=>l!==chosen.lane):corridor;
  if(safe.length){let l=safe[Math.floor(this.rng()*safe.length)];
   // Reward is beside, never inside, the collision footprint. The next row is
   // kept beyond a trailer-length recovery window.
   for(let k=0;k<3;k++){const at=z-90+k*145;l=nearestLane(at,l,this.seed);if(!this.laneBusy(l,at,at,75))this.add(k===1&&this.rng()<.18?'taco':'coin',at,l);}
  }
  return 150;
 }
 spawnEncounter(z){
  const r=roadAt(z,this.seed);if(!['farm-fork','estate-fork','contraflow'].includes(r.motif)||r.gate<.96)return false;
  const branch=r.bands.find(b=>b.branch===r.restricted),lane=branch.branch==='left'?1:3;
  if(this.laneBusy(lane,z-250,z+700,160))return false;
  if(r.motif==='contraflow'){
   // The car never crosses into another route: it follows a fixed lane only
   // through this signed branch, and despawns before the junction merges.
   const stopZ=r.start+1050,spawnZ=Math.min(r.end-650,z+380);
   if(spawnZ<=stopZ+180)return false;
   this.add('car',spawnZ,lane,{oncoming:true,traffic:true,stopZ,speed:150,length:0});
   this.add('prize',z-130,lane===1?0:4,{risky:true});
  }else this.add('prize',z,lane,{risky:true});
  this.lastScenario=r.motif;return true;
 }
 spawn(){const busy=this.job||this.sheep||this.night,pending=this.items.some(e=>['job','night'].includes(e.type)&&!e.done);
  if(!busy&&!pending){if(this.distance>this.nextNight-1100){this.add('night',this.distance+700,nearestLane(this.distance+700,2,this.seed));this.nextNight=this.distance+6500;}else if(this.distance>this.nextJob-1100){this.add('job',Math.max(this.nextJob,this.distance+700),nearestLane(Math.max(this.nextJob,this.distance+700),2,this.seed),{double:this.jobs>0&&this.rng()>.5});this.nextJob+=3300;}}
  if(!busy&&this.distance>this.nextBoost-700){this.add('boost',this.distance+550,nearestLane(this.distance+550,Math.floor(this.rng()*5),this.seed));this.nextBoost=this.distance+4200;}
  if(!this.hasTrailer&&this.nextHitch&&this.distance>this.nextHitch-700&&!this.items.some(e=>e.type==='hitch'&&!e.done)){const z=this.distance+650,lane=nearestLane(z,this.lane,this.seed);if(!this.laneBusy(lane,z-100,z+100,100)){this.add('hitch',z,lane);this.nextHitch=z+1500;}}
  while(this.row<this.distance+1300){
   const r=this.ramp(),gapSec=Math.max(.85,1.4-.45*r);
   const nearJob=this.items.some(e=>['job','night'].includes(e.type)&&!e.done&&Math.abs(e.z-this.row)<580);
   if(this.job||this.night||this.sheep||nearJob){this.row+=this.cruise*(gapSec+this.rng()*.55);continue;}
   if(this.spawnEncounter(this.row)){this.row+=600+this.cruise*(.9+this.rng()*.5);continue;}
   this.row+=this.makeRow(this.row,gapSec)+this.cruise*(gapSec+this.rng()*.55);}
  if(this.distance>this.nextSheep-850&&!busy&&!this.items.some(e=>e.type==='night'&&!e.done)){this.sheep={z:this.distance+850,baa:false,baaAt:Infinity,cleared:false};this.emit('sheepWarning');for(const e of this.items)if(e.type==='job'&&!e.done&&e.z>this.distance)e.z=this.sheep.z+900;this.items=this.items.filter(e=>e.type==='job'||e.z+(e.length||0)<this.sheep.z-450||e.z>this.sheep.z+400);this.nextSheep=this.distance+5200;}
 }
 /* 0 at the depot gate -> 1 after ~7 miles: hazards bunch up and the rig gets quicker so long shifts end on skill, not boredom */
 ramp(){return clamp(this.distance/63000,0,1);}
 tick(dt){if(this.finished)return;dt=clamp(dt,0,.05);this.time+=dt;for(const k of ['invulnerable','slow','boost','rested','grip','dropCooldown'])this[k]=Math.max(0,this[k]-dt);
  const base=240+Math.min(70,this.time*.7)+70*this.ramp();this.cruise=base;this.speed=Math.min(510,base*(this.slow>0?.65:this.boost>0?1.3:1)*(this.hasTrailer?1:1.16)*(this.grip>0?.92:1));const oldDistance=this.distance,oldX=this.x;this.distance+=this.speed*dt;this.stage=biomeAt(this.distance);
  this.rapid=Math.max(0,this.rapid-dt*(this.job?.double?.19:.43)*(1+.2*this.upgrades.stability)*(this.rested>0?1.2:1));
  this.x+=(this.lane-this.x)*(1-Math.exp(-dt*(this.grip>0?6.2:11)*(this.hasTrailer?1:1.18)*(1+.12*this.upgrades.steering)));
  this.trailer+=(this.x-this.trailer)*(1-Math.exp(-dt*(this.job?.double?2.2:4)));
  this.rear+=(this.trailer-this.rear)*(1-Math.exp(-dt*1.7));
  this.angle=clamp((this.x-this.trailer)*.62*(1-.08*this.upgrades.suspension),-.85,.85);
  this.sway=this.hasTrailer?clamp(Math.abs(this.x-this.trailer)*.3+this.rapid*(this.job?.double?.72:.32)+(this.grip>0?.12:0),0,1):0;
  if(this.sway>.98&&this.job?.double){this.fine(260,'JACKKNIFE! Double trouble.');this.emit('jackknife');this.items=this.items.filter(e=>!['crumb','finish'].includes(e.type));this.job=null;this.multiplier=1;this.rapid=0;}
  if(this.night&&this.distance>this.night.end){this.night=null;this.emit('dawn');}this.spawn();
  if(this.sheep){const s=this.sheep,ahead=s.z-this.distance;if(ahead<Math.max(375,this.speed*1.5)&&!s.baa){s.baa=true;s.baaAt=this.time;this.emit('baa');}if(ahead<65&&!s.cleared){this.sheepFail=1;this.crashKind='sheep';this.emit('sheepFail');this.end(CRASHES.sheep);}if(ahead< -200&&s.cleared)this.sheep=null;}
  // Contraflow traffic approaches against the scrolling road; same collision rules as cars.
  for(const e of this.items)if(!e.done&&e.oncoming){e.previousZ=e.z;e.z-=(e.speed||this.speed*.55)*dt;if(e.stopZ&&e.z<e.stopZ)e.done=true;}
  const pose=rigPose(laneX(this.x,this.distance),0,clamp((this.lane-this.x)*.16,-.2,.2),this.angle,clamp((this.trailer-this.rear)*.55,-.8,.8));
  // Wheel contact uses the same bands as the rendered asphalt; leaving the
  // road has a short grace interval, so merely brushing a painted edge is fair.
  const contact=surfaceAt(laneX(this.x,this.distance),this.distance,this.seed,16);this.surface=contact.surface;
  const trailerContact=this.hasTrailer?surfaceAt(pose.trailer.x,this.distance-pose.trailer.y,this.seed,15):contact;
  if(contact.surface==='mud'||trailerContact.surface==='mud'){if(this.grip<.1)this.emit('mud');this.grip=4.8;}
  if(!contact.onRoad||!trailerContact.onRoad){this.offroad+=dt;if(this.offroad>.55){this.fine(35,'Keep it on the road.');if([1,3].includes(this.stage))this.grip=Math.max(this.grip,2.5);this.offroad=-1.7;}}else this.offroad=Math.max(0,this.offroad-dt*2);
  if(contact.rule&&!this.routeFines[contact.route.id]){this.routeFines[contact.route.id]=true;this.fine(contact.rule==='oneway'?120:90,contact.rule==='oneway'?'One way. The other way.':'Residents and public access only.');}
  if(contact.route.gate>.97&&!this.routeChoice[contact.route.id]){this.routeChoice[contact.route.id]=contact.branch;this.emit('routeChoice',{branch:contact.branch,motif:contact.route.motif});}
  for(const key of Object.keys(this.routeFines))if(+key<contact.route.id-2)delete this.routeFines[key];
  for(const key of Object.keys(this.routeChoice))if(+key<contact.route.id-2)delete this.routeChoice[key];
  for(const d of this.detached)d.age+=dt;this.detached=this.detached.filter(d=>d.age<3);
  // Buildings and foliage are actual scenery collisions, using the very same
  // placements and authored footprints as the painter. They sit off-road.
  for(const p of sceneryProps(this.distance-240,this.distance+100,this.seed)){
   if(this.sceneryHits[p.id]||this.invulnerable>0)continue;
   const hit=(x,z,hw,hh)=>Math.abs(x-p.x)<hw+p.hitWidth/2&&Math.abs(z-p.z)<hh+p.hitHeight/2;
   if(hit(laneX(this.x,this.distance),this.distance,18,24)||(this.hasTrailer&&hit(pose.trailer.x,this.distance-pose.trailer.y,19,52))){this.sceneryHits[p.id]=p.z;if(p.effect==='house')this.crash('house');else this.fine(55,'Scenery is not a shortcut.');}
  }
  for(const key of Object.keys(this.sceneryHits))if(this.sceneryHits[key]<this.distance-400)delete this.sceneryHits[key];
  for(const e of this.items){if(e.done)continue;const delta=e.z-this.distance,length=e.length||0,hazard=!PICKUPS.includes(e.type),spec=HAZARD_SPECS[e.type];
   const halfX=hazard?(spec?.hitWidth||40)/2:18,halfZ=hazard?(spec?.hitHeight||40)/2:18;
   const ex=laneX(e.lane,e.z),cabX=laneX(this.x,this.distance),oldCabX=laneX(oldX,oldDistance);
   const cabHit=sweptOverlap(oldDistance,this.distance,24,e.z-halfZ,e.z+length+halfZ)&&sweptOverlap(oldCabX,cabX,hazard?18:13,ex-halfX,ex+halfX);
   const trailHit=hazard&&this.hasTrailer&&Math.abs(ex-pose.trailer.x)<halfX+19&&delta< -pose.trailer.y+52+halfZ&&delta+length> -pose.trailer.y-52-halfZ;
   const rearHit=hazard&&this.hasTrailer&&this.job?.double&&Math.abs(ex-pose.rear.x)<halfX+19&&delta< -pose.rear.y+52+halfZ&&delta+length> -pose.rear.y-52-halfZ;
   if((cabHit||trailHit||rearHit)&&(!hazard||this.invulnerable<=0))this.collect(e);
   else if(delta+length<(hazard?-240:-42)){e.done=true;if(e.type==='finish'&&this.job){this.emit('missedJob');this.job=null;this.multiplier=1;}else if(e.type==='crumb')this.combo=0;}
   if(this.finished)break;
  }
  this.items=this.items.filter(e=>e.z+(e.length||0)>this.distance-325);
  if(this.mode==='daily'&&this.time>=120)this.end('Two minutes. One mighty shift.');
 }
}
