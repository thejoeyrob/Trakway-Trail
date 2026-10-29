import {laneX,rigPose} from './geometry.js';
import {normalize,deliveryBonus} from './upgrades.js';
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const themes=['THE TOWN RUN','COUNTRY MILES','SUBURBAN SHORTCUT','HARD HAT HAUL'];
export const ROAD_TYPES=['lowbridge','weakbridge','bus','noentry','narrow','grass','house','works'];
/* Hazards that end the shift outright, each with its own comic vignette (see COMICS in game.js) and result-sheet line. */
export const CRASHES={car:'Not a bumper car.',lowbridge:'Height restriction. Not a suggestion.',weakbridge:'Weight limit: less than you.',oil:'Slick move, driver.',house:'Planning permission denied.',sheep:'Ewe had one job.'};
export const PICKUPS=['job','crumb','finish','taco','coin','night','boost'];
export function seeded(seed){const fn=()=>{seed|=0;seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;fn.state=seed;return((t^t>>>14)>>>0)/4294967296;};fn.state=seed;return fn;}
export function jobPath(lane,rng,count=10){const p=[];for(let i=0;i<count;i++){if(i%2)lane=clamp(lane+(rng()>.5?1:-1),0,4);p.push(lane);}return p;}
export function biomeAt(z){return Math.floor(Math.max(0,z)/5400)%4;}
export function hazardKinds(z){return [['car','cone','bus','noentry','lowbridge'],['grass','weakbridge','oil','lowbridge','narrow'],['house','car','noentry','narrow'],['barrier','cone','oil','works']][biomeAt(z)];}
export class Drive {
 constructor(options={}){
  this.seed=options.seed||Date.now();this.rng=seeded(this.seed);
  this.mode=options.mode||'endless';this.upgrades=normalize(this.mode==='daily'?{}:options.upgrades);
  this.truck=this.mode==='daily'?0:(options.truck||0);this.decal=this.mode==='daily'?0:(options.decal||0);
  this.events=[];this.items=[];this.distance=0;this.time=0;this.money=500;this.earned=0;this.fines=0;this.jobs=0;this.crumbs=0;this.horns=0;this.near=0;
  this.lane=2;this.x=2;this.trailer=2;this.rear=2;this.sway=0;this.angle=0;this.rapid=0;this.lastMove=-10;this.invulnerable=0;this.speed=180;
  this.row=900;this.nextJob=600;this.nextSheep=5200;this.nextNight=5600;this.nextBoost=2100;this.night=null;this.nights=0;this.boost=0;this.rested=this.upgrades.bunk?20+8*this.upgrades.bunk:0;
  this.job=null;this.sheep=null;this.finished=false;this.endReason='';this.stage=0;this.slow=0;this.multiplier=1;this.id=0;this.sheepFail=0;this.combo=0;this.crashKind='';this.lives=this.upgrades.insurance>=3?1:0;
 }
 snapshot(){const d={...this,rngState:this.rng.state};delete d.rng;d.events=[];return d;}
 static restore(data){if(!data||data.finished||!Number.isFinite(data.distance)||data.distance<0||!Array.isArray(data.items)||data.items.length>600||!Number.isFinite(data.money))return null;const g=new Drive();for(const k of Object.keys(g))if(k!=='rng'&&k!=='events'&&Object.hasOwn(data,k))g[k]=data[k];g.upgrades=normalize(g.upgrades);g.rng=seeded(data.rngState||1);g.events=[];return g;}
 emit(type,data={}){this.events.push({type,...data});}
 add(type,z,lane,props={}){const road=ROAD_TYPES.includes(type);const e={id:++this.id,type,z,lane,done:false,...road?{road:true,length:['bus','noentry','works'].includes(type)?310:190,warning:390}:{},...props};this.items.push(e);return e;}
 move(direction){if(this.finished)return;const next=clamp(this.lane+direction,0,4);if(next===this.lane)return;this.rapid=clamp(this.rapid+(this.time-this.lastMove<.2?.3:.07),0,1.5);this.lastMove=this.time;this.lane=next;this.emit('steer');}
 horn(){if(this.finished)return;this.emit('horn');if(!this.sheep||this.sheep.cleared)return;const s=this.sheep,delta=this.time-s.baaAt;if(s.baa&&delta>=0&&delta<=.75+this.upgrades.horn*.16){s.cleared=true;this.horns++;this.award(75,'WOOL DONE!');this.emit('sheepClear');}else this.emit('hint',{text:s.baa?'Too late! Brake for the flock.':'Wait for the BAA…'});}
 award(value,label){this.money+=value;this.earned+=value;this.emit('cash',{value,label});}
 fine(value,label){if(this.invulnerable>0)return;value=Math.round(value*(1-.12*this.upgrades.insurance));this.money-=value;this.fines+=value;this.combo=0;this.invulnerable=1.3;this.slow=.8;this.emit('loss',{value,label});if(this.money<=0)this.end('The float has floated away.');}
 jobValue(value){return Math.round(value*this.multiplier*(1+deliveryBonus(this.upgrades,this.truck,this.decal)));}
 startJob(item){if(this.job||this.night)return;this.multiplier=item.double?2:1;this.job={label:item.double?'THE DOUBLE TROUBLE':'SUPERMARKET SWEEP',pay:this.jobValue(150),count:0,total:10,double:!!item.double,end:item.z+1780};this.items=this.items.filter(e=>e===item||e.z+(e.length||0)<item.z-240||e.z>this.job.end+650);
  const p=jobPath(item.lane,this.rng);p.forEach((lane,i)=>{this.add('crumb',item.z+160*(i+1),lane);if(i%2)this.add(this.rng()>.5?'cone':'car',item.z+160*(i+1),(lane+2+Math.floor(this.rng()*2))%5);});this.add('finish',this.job.end,p.at(-1));this.row=Math.max(this.row,this.job.end+650);this.nextJob=this.job.end+1000;this.emit('job',{label:this.job.label,double:this.job.double});}
 startNight(item){if(this.job||this.sheep||this.night)return;const end=item.z+4200;this.night={start:item.z,end};this.nights++;this.items=this.items.filter(e=>e===item||e.z+(e.length||0)<item.z-235||e.z>end+600);let lane=item.lane;
  for(let i=1;i<=40;i++){if(i%4===0)lane=clamp(lane+(this.rng()>.5?1:-1),0,4);const z=item.z+i*100;this.add('coin',z,lane,{nightCoin:true});if(i%5===0){const k=hazardKinds(z);this.add(k[Math.floor(this.rng()*k.length)],z,(lane+2)%5);}}
  this.row=Math.max(this.row,end+650);this.nextJob=Math.max(this.nextJob,end+760);this.nextSheep=Math.max(this.nextSheep,end+1100);this.nextNight=end+4300;this.emit('night');}
 collect(e){if(e.done)return;e.done=true;switch(e.type){
  case 'job':this.startJob(e);break;case 'night':this.startNight(e);break;
  case 'boost':this.boost=7+this.upgrades.exhaust;this.emit('boost');break;
  case 'crumb':if(this.job){this.job.count++;this.crumbs++;this.combo++;const v=this.jobValue(25);this.job.pay+=v;this.emit('crumb',{value:v});}break;
  case 'finish':if(this.job){const pay=this.job.pay,dbl=this.job.double;this.jobs++;this.award(pay,'DELIVERY BANKED');this.emit('delivery',{pay,perfect:this.job.count===10,double:dbl});this.job=null;this.multiplier=1;}break;
  case 'taco':this.award(100+20*this.upgrades.washroom,'TACO BREAK. PAID.');this.slow=2.4;this.emit('taco');break;
  case 'coin':this.award(Math.round(15*(this.night?2:1)*(1+.05*this.upgrades.exhaust)),this.night?'DOUBLE BUBBLE':'ROAD BONUS');break;
  case 'car':case 'lowbridge':case 'weakbridge':case 'oil':case 'house':this.crash(e.type);break;case 'cone':case 'barrier':case 'works':this.fine(70,'Cones are not a slalom.');break;
  case 'narrow':this.fine(80,'Mirrors are wider than optimism.');break;case 'bus':this.fine(90,'You are not a bus.');break;
  case 'noentry':this.fine(120,'Sat-nav says… absolutely not.');break;
  case 'grass':this.fine(65,'Lawn care: £65.');break;
 }}
 crash(kind){if(this.finished)return;
  if(this.lives>0){this.lives--;this.money-=400;this.fines+=400;this.combo=0;this.invulnerable=2.6;this.slow=1.2;this.rapid=0;this.emit('bailout',{kind,value:400});if(this.money<=0)this.end('The float has floated away.');return;}
  this.crashKind=kind;this.emit('crash',{kind});this.end(CRASHES[kind]);}
 end(reason){if(this.finished)return;this.finished=true;this.endReason=reason;this.emit('end',{reason});}
 spawn(){const busy=this.job||this.sheep||this.night,pending=this.items.some(e=>['job','night'].includes(e.type)&&!e.done);
  if(!busy&&!pending){if(this.distance>this.nextNight-1100){this.add('night',this.distance+700,2);this.nextNight=this.distance+6500;}else if(this.distance>this.nextJob-1100){this.add('job',Math.max(this.nextJob,this.distance+700),2,{double:this.jobs>0&&this.rng()>.5});this.nextJob+=3300;}}
  if(!busy&&this.distance>this.nextBoost-700){this.add('boost',this.distance+550,Math.floor(this.rng()*5));this.nextBoost=this.distance+4200;}
  while(this.row<this.distance+1300){if(!this.job&&!this.night){const kinds=hazardKinds(this.row),kind=kinds[Math.floor(this.rng()*kinds.length)];let lane=Math.floor(this.rng()*5);if(['house','grass','bus'].includes(kind))lane=this.rng()>.5?0:4;
    const blocked=this.items.some(e=>['job','night'].includes(e.type)&&!e.done&&Math.abs(e.z-this.row)<580);if(!blocked){this.add(kind,this.row,lane);if(this.rng()>.45)this.add(this.rng()>.65?'taco':'coin',this.row+80,(lane+2)%5);}}
   const r=this.ramp();this.row+=(540-190*r)+this.rng()*(170-50*r);}
  if(this.distance>this.nextSheep-850&&!busy&&!this.items.some(e=>e.type==='night'&&!e.done)){this.sheep={z:this.distance+850,baa:false,baaAt:Infinity,cleared:false};this.emit('sheepWarning');for(const e of this.items)if(e.type==='job'&&!e.done&&e.z>this.distance)e.z=this.sheep.z+900;this.items=this.items.filter(e=>e.type==='job'||e.z+(e.length||0)<this.sheep.z-450||e.z>this.sheep.z+400);this.nextSheep=this.distance+5200;}
 }
 /* 0 at the depot gate -> 1 after ~7 miles: hazards bunch up and the rig gets quicker so long shifts end on skill, not boredom */
 ramp(){return clamp(this.distance/63000,0,1);}
 tick(dt){if(this.finished)return;dt=clamp(dt,0,.05);this.time+=dt;for(const k of ['invulnerable','slow','boost','rested'])this[k]=Math.max(0,this[k]-dt);
  const base=180+Math.min(100,this.time*.7)+60*this.ramp();this.speed=base*(this.slow>0?.65:this.boost>0?1.3:1);this.distance+=this.speed*dt;this.stage=biomeAt(this.distance);
  this.rapid=Math.max(0,this.rapid-dt*(this.job?.double?.19:.43)*(1+.2*this.upgrades.stability)*(this.rested>0?1.2:1));
  this.x+=(this.lane-this.x)*(1-Math.exp(-dt*11*(1+.12*this.upgrades.steering)));
  this.trailer+=(this.x-this.trailer)*(1-Math.exp(-dt*(this.job?.double?2.2:4)));
  this.rear+=(this.trailer-this.rear)*(1-Math.exp(-dt*1.7));
  this.angle=clamp((this.x-this.trailer)*.62*(1-.08*this.upgrades.suspension),-.85,.85);
  this.sway=clamp(Math.abs(this.x-this.trailer)*.3+this.rapid*(this.job?.double?.72:.32),0,1);
  if(this.sway>.98&&this.job?.double){this.fine(260,'JACKKNIFE! Double trouble.');this.emit('jackknife');this.items=this.items.filter(e=>!['crumb','finish'].includes(e.type));this.job=null;this.multiplier=1;this.rapid=0;}
  if(this.night&&this.distance>this.night.end){this.night=null;this.emit('dawn');}this.spawn();
  if(this.sheep){const s=this.sheep,ahead=s.z-this.distance;if(ahead<Math.max(375,this.speed*1.5)&&!s.baa){s.baa=true;s.baaAt=this.time;this.emit('baa');}if(ahead<65&&!s.cleared){this.sheepFail=1;this.crashKind='sheep';this.emit('sheepFail');this.end(CRASHES.sheep);}if(ahead< -200&&s.cleared)this.sheep=null;}
  const pose=rigPose(laneX(this.x,this.distance),0,clamp((this.lane-this.x)*.16,-.2,.2),this.angle,clamp((this.trailer-this.rear)*.55,-.8,.8));
  for(const e of this.items){if(e.done)continue;const delta=e.z-this.distance,length=e.length||0,hazard=!PICKUPS.includes(e.type);
   const cabHit=delta<22&&delta+length> -24&&Math.abs(e.lane-this.x)<.52;
   const trailHit=hazard&&delta< -pose.trailer.y+55&&delta+length> -pose.trailer.y-55&&Math.abs(laneX(e.lane,e.z)-pose.trailer.x)<30;
   const rearHit=hazard&&this.job?.double&&delta< -pose.rear.y+55&&delta+length> -pose.rear.y-55&&Math.abs(laneX(e.lane,e.z)-pose.rear.x)<30;
   if(cabHit||trailHit||rearHit)this.collect(e);
   else if(delta+length<(hazard?-240:-28)){e.done=true;if(e.type==='finish'&&this.job){this.emit('missedJob');this.job=null;this.multiplier=1;}else if(e.type==='crumb')this.combo=0;}
   if(this.finished)break;
  }
  this.items=this.items.filter(e=>e.z+(e.length||0)>this.distance-325);
  if(this.mode==='daily'&&this.time>=120)this.end('Two minutes. One mighty shift.');
 }
}
