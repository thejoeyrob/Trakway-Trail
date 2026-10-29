(function(){'use strict';const modules={"./atlas.js":function(module,exports,require){
const SPRITE_RECTS=[[59, 16, 203, 287], [394, 4, 151, 310], [678, 16, 203, 287], [990, 16, 203, 287], [71, 329, 175, 285], [382, 330, 175, 281], [662, 362, 235, 221], [960, 386, 268, 141], [42, 638, 244, 302], [335, 642, 273, 298], [652, 637, 263, 303], [981, 655, 228, 234], [70, 940, 172, 265], [316, 940, 310, 275], [693, 940, 247, 293], [940, 951, 295, 266]];
const HAZARD_RECTS=[[16, 84, 428, 306], [444, 13, 359, 425], [978, 12, 272, 419], [1423, 50, 254, 368], [59, 474, 336, 388], [495, 474, 339, 389], [901, 454, 414, 394], [1361, 455, 383, 417]];

const TERRAIN_RECTS=[[105, 1, 279, 511], [384, 1, 369, 511], [810, 3, 239, 509], [1152, 1, 271, 511], [106, 512, 278, 504], [384, 512, 357, 503], [787, 512, 365, 503], [1152, 512, 321, 501]];

const EXTRAS_RECTS=[[55, 46, 307, 310], [362, 50, 362, 299], [724, 20, 307, 342], [1119, 40, 296, 313], [24, 410, 338, 238], [362, 388, 362, 336], [724, 388, 347, 336], [1091, 464, 325, 260], [28, 741, 334, 252], [362, 724, 362, 295], [724, 724, 302, 326], [1098, 724, 321, 298]];

module.exports={SPRITE_RECTS,HAZARD_RECTS,TERRAIN_RECTS,EXTRAS_RECTS};

},
"./geometry.js":function(module,exports,require){
function roadShape(z){const stage=Math.max(0,Math.floor(Math.max(0,z)/5400))%4;const width=stage===1?610:630;return {width,stage};}
function roadCurve(z){return Math.sin(z/650)*23+Math.sin(z/1600)*12;}
function laneX(lane,z){const width=roadShape(z).width;return 210+roadCurve(z)+(lane-2)*width*(280/627)/5;}
function rigPose(x,y,cabAngle,trailerAngle,rearAngle){
 const back=(p,d,a)=>({x:p.x-Math.sin(a)*d,y:p.y+Math.cos(a)*d});
 // 5th wheel is behind, not inside the tractor cab; both trailers rotate about connected hitches.
 const hitch=back({x,y},34,cabAngle);
 const trailer={...back(hitch,38,trailerAngle),angle:trailerAngle};
 const rearHitch=back(hitch,101,trailerAngle);
 const rear={...back(rearHitch,45,rearAngle),angle:rearAngle};
 return {hitch,trailer,rearHitch,rear};
}

module.exports={roadShape,roadCurve,laneX,rigPose};

},
"./upgrades.js":function(module,exports,require){
const CATALOG=[
 ['stability','STEADY EDDIE','Trailer stabiliser: sway settles 20% faster per level.',350,10],
 ['suspension','AIR-RIDE','Air suspension: 8% less trailer angle per level.',450,10],
 ['steering','QUICK HANDS','Better wheel: steering response 12% quicker per level.',400,9],
 ['lights','SEE EWE LATER','LED lightbar: 65 metres more visibility per level.',500,7],
 ['exhaust','BIG PIPES','Chrome stacks: 5% more coin earnings per level.',550,2],
 ['washroom','ENSUITE SUITE','Sleeper washroom: +£20 per taco break per level.',650,3],
 ['bunk','SLEEP LIKE A LOG','Better bunk: rested handling and 3% delivery bonus per level.',550,8],
 ['insurance','MATES’ RATES','Damage insurance: 12% smaller fines per level. Level 3 adds a once-per-shift bail-out from a crash (£400 excess).',350,11],
 ['horn','THE BIG TOOT','Air horn: 0.16 second more sheep-reaction time per level.',350,0]
].map(([id,name,description,cost,icon])=>({id,name,description,cost,icon}));
const defaults=()=>Object.fromEntries(CATALOG.map(u=>[u.id,0]));
const normalize=(v={})=>Object.fromEntries(CATALOG.map(u=>[u.id,Math.min(3,Math.max(0,Math.floor(Number(v?.[u.id])||0)))]));
const DECALS=[{id:0,name:'FACTORY',cost:0,icon:null},{id:1,name:'GOLD WINGS',cost:700,icon:4},{id:2,name:'HOT HAUL',cost:900,icon:5},{id:3,name:'FLOCK ROYALTY',cost:1100,icon:6}];
const deliveryBonus=(u,truck,decal)=>u.bunk*.03+(truck===2?.02:truck===3?.04:0)+(decal>0?.02:0);

module.exports={CATALOG,defaults,normalize,DECALS,deliveryBonus};

},
"./model.js":function(module,exports,require){
const {laneX,rigPose}=require("./geometry.js");
const {normalize,deliveryBonus}=require("./upgrades.js");
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const themes=['THE TOWN RUN','COUNTRY MILES','SUBURBAN SHORTCUT','HARD HAT HAUL'];
const ROAD_TYPES=['lowbridge','weakbridge','bus','noentry','narrow','grass','house','works'];
/* Hazards that end the shift outright, each with its own comic vignette (see COMICS in game.js) and result-sheet line. */
const CRASHES={car:'Not a bumper car.',lowbridge:'Height restriction. Not a suggestion.',weakbridge:'Weight limit: less than you.',oil:'Slick move, driver.',sheep:'Ewe had one job.'};
const PICKUPS=['job','crumb','finish','taco','coin','night','boost'];
function seeded(seed){const fn=()=>{seed|=0;seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;fn.state=seed;return((t^t>>>14)>>>0)/4294967296;};fn.state=seed;return fn;}
function jobPath(lane,rng,count=10){const p=[];for(let i=0;i<count;i++){if(i%2)lane=clamp(lane+(rng()>.5?1:-1),0,4);p.push(lane);}return p;}
function biomeAt(z){return Math.floor(Math.max(0,z)/5400)%4;}
function hazardKinds(z){return [['car','cone','bus','noentry','lowbridge'],['grass','weakbridge','oil','lowbridge','narrow'],['house','car','noentry','narrow'],['barrier','cone','oil','works']][biomeAt(z)];}
class Drive {
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
  case 'car':case 'lowbridge':case 'weakbridge':case 'oil':this.crash(e.type);break;case 'cone':case 'barrier':case 'works':this.fine(70,'Cones are not a slalom.');break;
  case 'narrow':this.fine(80,'Mirrors are wider than optimism.');break;case 'bus':this.fine(90,'You are not a bus.');break;
  case 'noentry':this.fine(120,'Sat-nav says… absolutely not.');break;case 'house':this.fine(170,'The porch was not a shortcut.');break;
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

module.exports={clamp,themes,ROAD_TYPES,CRASHES,PICKUPS,seeded,jobPath,biomeAt,hazardKinds,Drive};

},
"./audio.js":function(module,exports,require){
class Sound {
 constructor(settings){this.settings=settings;this.ctx=null;this.buffers={};this.active=[];this.ready=false;this.loading=null;this.music=null;this.musicOffset=0;this.musicStarted=0;this.suspended=false;}
 async unlock(){try{if(!this.ctx){this.ctx=new (window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=.8;const comp=this.ctx.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=3;this.master.connect(comp);comp.connect(this.ctx.destination);this.musicGain=this.ctx.createGain();this.musicGain.connect(this.master);}await this.ctx.resume();if(!this.loading)this.loading=this.load();await this.loading;return true;}catch{return false;}}
 async load(){await Promise.all(['roadtrip','cash','crumb','pickup','delivery','horn','sheep','flush','brake','click','scatter','bonus'].map(async name=>{try{let bytes;if(window.TRUCKIN_AUDIO_DATA?.[name]){let b=atob(window.TRUCKIN_AUDIO_DATA[name]);bytes=Uint8Array.from(b,c=>c.charCodeAt(0)).buffer;}else{let r=await fetch('./audio/'+name+(name==='roadtrip'?'.mp3':'.wav'));if(!r.ok)return;bytes=await r.arrayBuffer();}this.buffers[name]=await this.ctx.decodeAudioData(bytes);}catch{}}));this.ready=true;}
 play(name,volume=1){if(!this.ctx||!this.buffers[name]||this.settings.sfx<=0||this.suspended)return;let gains={cash:.45,crumb:.16,pickup:.48,delivery:.48,horn:.4,sheep:.60,flush:.46,brake:.52,click:.28,scatter:.45,bonus:.4};const s=this.ctx.createBufferSource();s.buffer=this.buffers[name];const g=this.ctx.createGain();g.gain.value=(gains[name]||.4)*this.settings.sfx*volume;s.connect(g);g.connect(this.master);s.start();this.active.push(s);s.onended=()=>{this.active=this.active.filter(x=>x!==s);s.disconnect();g.disconnect();};}
 duck(){if(!this.musicGain||!this.ctx)return;const t=this.ctx.currentTime;this.musicGain.gain.cancelScheduledValues(t);this.musicGain.gain.setValueAtTime(this.settings.music*.07,t);this.musicGain.gain.setTargetAtTime(this.settings.music*.26,t+.9,.15);}
 musicOn(){if(this.music||!this.ctx||!this.buffers.roadtrip||this.suspended)return;this.music=this.ctx.createBufferSource();this.music.buffer=this.buffers.roadtrip;this.music.loop=true;this.music.loopEnd=32;this.music.connect(this.musicGain);this.musicGain.gain.value=this.settings.music*.26;this.musicStarted=this.ctx.currentTime;this.music.start(0,this.musicOffset%32);}
 musicOff(){if(this.music){this.musicOffset+=(this.ctx.currentTime-this.musicStarted);this.music.stop();this.music.disconnect();this.music=null;}}
 update(){if(this.musicGain)this.musicGain.gain.setTargetAtTime(this.settings.music*.26,this.ctx.currentTime,.1);}
 pause(){this.musicOff();this.active.forEach(s=>{try{s.stop();}catch{}});this.active=[];this.suspended=true;}
 resume(){this.suspended=false;this.ctx?.resume();this.musicOn();}
}

module.exports={Sound};

},
"./render.js":function(module,exports,require){
const {clamp,ROAD_TYPES,PICKUPS}=require("./model.js");
const {rigPose,roadShape,roadCurve,laneX}=require("./geometry.js");
const {SPRITE_RECTS,HAZARD_RECTS,TERRAIN_RECTS,EXTRAS_RECTS}=require("./atlas.js");
const SPR={truck:0,trailer:1,orange:2,purple:3,car:4,redcar:5,cone:6,barrier:7,taco:8,job:9,finish:10,coin:11,sheep:12,face:13,flatbed:14,oil:15,crumb:11};
const HAZ={lowbridge:0,weakbridge:1,bus:2,noentry:3,narrow:4,sheepWarning:5,house:6,grass:7};
const LABELS={lowbridge:'LOW BRIDGE',weakbridge:'WEAK BRIDGE',bus:'BUS LANE',noentry:'NO ENTRY',house:'MIND THE HOUSE',grass:'KEEP OFF',narrow:'NARROW PASS'};
class Renderer {
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
async function loadImages(){const names=['sprites','roads','restrictions','cover','terrain','extras'];let result={};await Promise.all(names.map(n=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>{result[n]=i;res();};i.onerror=()=>rej(new Error(n));i.src='./assets/'+n+'.webp';})));return result;}

module.exports={SPR,Renderer,loadImages};

},
"./game.js":function(module,exports,require){
const {CATALOG,DECALS,defaults : defaultUpgrades,normalize : normalizeUpgrades}=require("./upgrades.js");
const {Drive,clamp,themes,CRASHES}=require("./model.js");
const {Renderer,loadImages}=require("./render.js");
const {Sound}=require("./audio.js");
const $=id=>document.getElementById(id),money=v=>'£'+Math.max(0,Math.round(v)).toLocaleString('en-GB');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='truckin-save-v1';
const defaults={version:1,name:'',player:globalThis.crypto?.randomUUID?.()||'driver-'+Date.now()+'-'+Math.random().toString(36).slice(2),wallet:0,best:0,truck:0,owned:[0],upgrades:defaultUpgrades(),decal:0,ownedDecals:[0],scores:[],stats:{jobs:0,horns:0,tacos:0,doubles:0},settings:{music:.7,sfx:.8,haptics:true,motion:!matchMedia('(prefers-reduced-motion: reduce)').matches},tutorial:false};
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}');}catch{}
const profile={...defaults,...saved,upgrades:normalizeUpgrades(saved.upgrades),settings:{...defaults.settings,...saved.settings},stats:{...defaults.stats,...saved.stats}};
profile.wallet=clamp(Number(profile.wallet)||0,0,1e9);profile.best=clamp(Number(profile.best)||0,0,1e9);
profile.scores=Array.isArray(profile.scores)?profile.scores.slice(0,30):[];
profile.owned=Array.isArray(profile.owned)?profile.owned.filter(v=>[0,2,3].includes(v)):[0];if(!profile.owned.includes(0))profile.owned.push(0);if(!profile.owned.includes(profile.truck))profile.truck=0;
profile.ownedDecals=Array.isArray(profile.ownedDecals)?profile.ownedDecals.filter(v=>[0,1,2,3].includes(v)):[0];if(!profile.ownedDecals.includes(0))profile.ownedDecals.push(0);if(!profile.ownedDecals.includes(profile.decal))profile.decal=0;
let storageWarning=false;function save(){if(game&&!game.finished&&['playing','paused','countdown'].includes(state)){profile.active={data:game.snapshot(),id:onlineId};}else if(game?.finished){delete profile.active;}try{localStorage.setItem(KEY,JSON.stringify(profile));bridge('saveProgress',{data:JSON.stringify(profile)});}catch{storageWarning=true;}}
const sound=new Sound(profile.settings);let renderer,game=null,state='home',activeSheet='',lastTime=0,toastUntil=0,onlineId=null,runRequest=null,runSerial=0,ending=false,scoreMode='all',leaderTimer=null,wasFocus=null,lastHorn=-10,comicTimer=null,countdownTimer=null;
const native=()=>!!window.webkit?.messageHandlers?.truckin;
let backendUp=true;/* flips false after the first failed /api call so static hosts don't spam 404s */
function bridge(action,data={}){if(native())window.webkit.messageHandlers.truckin.postMessage({action,...data});}
function haptic(type='light'){if(!profile.settings.haptics)return;if(native())bridge('haptic',{style:type});else navigator.vibrate?.(type==='heavy'?[25,30,20]:12);}
function updateHome(){if(renderer)$('playLabel').textContent=profile.active?'RESUME YOUR SHIFT':'HIT THE ROAD';$('homeBest').textContent=money(profile.best);$('homeWallet').textContent=money(profile.wallet);}
function toast(text,detail='',seconds=2){$('floatingToast').innerHTML=escape(text)+(detail?'<small>'+escape(detail)+'</small>':'');$('floatingToast').classList.remove('hidden');toastUntil=performance.now()+seconds*1000;}
function openSheet(title,eyebrow,body,name){activeSheet=name;wasFocus=document.activeElement;$('sheetTitle').textContent=title;$('sheetEyebrow').textContent=eyebrow;$('sheetBody').innerHTML=body;$('sheet').classList.remove('hidden');$('closeSheet').classList.remove('hidden');setTimeout(()=>$('closeSheet').focus(),10);}
function closeSheet(){if(activeSheet==='pause'){resume();return;}if(activeSheet==='result'){home();return;}clearInterval(leaderTimer);leaderTimer=null;$('sheet').classList.add('hidden');activeSheet='';if(wasFocus?.isConnected)wasFocus.focus();}
function home(){runSerial++;clearTimeout(comicTimer);clearTimeout(countdownTimer);ending=false;state='home';game=null;onlineId=null;$('comic').classList.add('hidden');$('hud').classList.add('hidden');$('home').classList.remove('hidden');$('sheet').classList.add('hidden');activeSheet='';clearInterval(leaderTimer);sound.pause();updateHome();}
function askStart(mode){sound.unlock();if(mode==='endless'&&profile.active){restoreShift();return;}if(!profile.name){openSheet('YOUR SHIFT STARTS HERE','SIGN THE TACHO',"<p class='sheet-copy'>A full tank, a £500 float, and a sat-nav with questionable judgement. Let’s make a living.</p><label class='field-label' for='driverName'>DRIVER NAME</label><input id='driverName' type='text' maxlength='16' autocomplete='nickname' placeholder='Road legend' value=''><p class='status-note'>Your name appears on the leaderboard. Game earnings are fictional.</p><button class='big-button' id='nameGo'>LET’S GET TRUCKIN’ <b>➜</b></button>",'name');$('nameGo').onclick=()=>{profile.name=$('driverName').value.replace(/[^a-zA-Z0-9 _.-]/g,'').trim().slice(0,16)||'Road legend';save();begin(mode);};$('driverName').onkeydown=e=>{if(e.key==='Enter')$('nameGo').click();};}else begin(mode);}
function restoreShift(){const restored=Drive.restore(profile.active?.data);if(!restored){delete profile.active;save();begin();return;}game=restored;onlineId=profile.active.id||null;runRequest=null;runSerial++;ending=false;state='playing';$('home').classList.add('hidden');$('hud').classList.remove('hidden');$('tutorialHint').classList.add('hidden');renderer.draw(game,0,profile.truck);updateHud();sound.suspended=false;sound.unlock().then(()=>{if(state==='playing')sound.musicOn();});toast('WELCOME BACK, DRIVER','Right where you parked it.',2);}
function begin(mode='endless'){delete profile.active;if(!renderer)return;clearInterval(leaderTimer);clearTimeout(comicTimer);ending=false;lastHorn=-10;const stamp=Date.now();const seed=mode==='daily'?Number(new Date().toISOString().slice(0,10).replace(/-/g,'')):stamp;game=new Drive({seed,mode,upgrades:profile.upgrades,truck:profile.truck,decal:profile.decal});onlineId=null;const serial=++runSerial;state='countdown';$('home').classList.add('hidden');$('sheet').classList.add('hidden');$('comic').classList.add('hidden');$('hud').classList.remove('hidden');$('jobBox').classList.add('hidden');$('sheepWarning').classList.add('hidden');$('tutorialHint').classList.toggle('hidden',profile.tutorial);activeSheet='';sound.suspended=false;sound.unlock().then(()=>{if(serial===runSerial&&state!=='paused'&&state!=='home')sound.musicOn();});if(!native()&&backendUp){runRequest=fetch('/api/run',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({player:profile.player,mode}),signal:AbortSignal.timeout(8000)}).then(r=>r.ok?r.json():null).then(d=>{if(!d)backendUp=false;if(serial===runSerial)onlineId=d?.id||null;return d?.id||null;}).catch(()=>{backendUp=false;return null;});}else runRequest=null;toast('SHINY SIDE UP!',mode==='daily'?'120 seconds · same route · stock handling':'£500 float · swipe one position at a time',1.5);renderer.fx=[];renderer.shake=0;renderer.draw(game,0,profile.truck);updateHud();countdownTimer=setTimeout(()=>{if(state==='countdown'){state='playing';$('road').focus();}},1100);}
function pause(){if(!['playing','countdown'].includes(state))return;clearTimeout(countdownTimer);state='paused';save();sound.pause();openSheet('PARKED UP','TAKE A BREATHER',"<p class='sheet-copy'>Your truck is safe here. The clock and the road are stopped.</p><button class='big-button' id='resumeButton'>BACK ON THE ROAD <b>➜</b></button><button class='secondary' id='finishShift'>Finish shift & bank earnings</button><p class='status-note'>An unfinished delivery won’t be paid.</p>",'pause');$('resumeButton').onclick=resume;$('finishShift').onclick=()=>{if(game){game.end('Clocked off. Kettle on.');handleEvents();}};}
function resume(){if(!game||game.finished)return;state='playing';$('sheet').classList.add('hidden');activeSheet='';lastTime=performance.now();sound.resume();$('road').focus();}
function honk(){if(state!=='playing'||!game)return;let now=performance.now()/1000;if(now-lastHorn<.6)return;lastHorn=now;game.horn();haptic();handleEvents();}
const IMG=n=>"<img src='./assets/comic/"+n+".webp' alt='' draggable='false'>";
/* One vignette per shift-ending hazard: art stage, catchphrase, deadpan sub-line, sound. Add a key here + a CRASHES line in model.js for a new one. */
const COMICS={
 sheep:{art:"<span class='sprite' data-sprite='13'></span>",title:'OH, FLOCK!',sub:'NO SHEEP WERE HARMED.<br>YOUR PRIDE, HOWEVER…',sfx:['brake']},
 car:{art:"<div class='stage'><i class='burst'>CRUNCH!</i><span class='part cab'>"+IMG('cab')+"</span><span class='part carb'>"+IMG('car-blue')+"</span></div>",title:'OH, BUMPER!',sub:'NO ONE WAS HURT.<br>YOUR NO-CLAIMS BONUS, HOWEVER…',sfx:['horn','brake']},
 lowbridge:{art:"<div class='stage'><span class='part arch'>"+IMG('bridge-low')+"</span><i class='burst'>BONK!</i></div>",title:'SUNROOF!',sub:'FACTORY-FIT. NO EXTRA CHARGE.<br>THE BRIDGE SENDS ITS THANKS.',sfx:['brake','flush']},
 weakbridge:{art:"<div class='stage'><span class='part half l'>"+IMG('bridge-weak')+"</span><span class='part half r'>"+IMG('bridge-weak')+"</span><span class='part cab'>"+IMG('cab')+"</span><i class='burst'>SPLASH!</i></div>",title:'PLANK YOU!',sub:'NOT RATED FOR YOUR DINNER.<br>THE RIVER SENDS ITS REGARDS.',sfx:['brake','flush']},
 oil:{art:"<div class='stage'><span class='part slick'>"+IMG('oil')+"</span><span class='part cab'>"+IMG('cab')+"</span><i class='dizzy'>★ ✦ ★</i></div>",title:'SPIN CYCLE!',sub:'WASH. RINSE. JACKKNIFE.<br>COLOURS MAY RUN.',sfx:['brake','scatter']}
};
let comicAt=0;
function showComic(kind){const c=COMICS[kind]||COMICS.sheep,el=$('comic');el.className='comic-'+kind;el.innerHTML=c.art+'<strong>'+c.title+'</strong><small>'+c.sub+'</small><em>TAP TO CONTINUE</em>';comicAt=performance.now();c.sfx.forEach((n,i)=>setTimeout(()=>sound.play(n),i*260));if(kind!=='sheep'){renderer.shake=profile.settings.motion?16:0;haptic('heavy');}}
window.truckinPreviewComic=showComic;/* QA hook: truckinPreviewComic('car'|'lowbridge'|'weakbridge'|'oil'|'sheep') */
function handleEvents(){if(!game)return;for(const e of game.events.splice(0)){const px=renderer.x(game.x,game.distance),py=renderer.playerY;
 switch(e.type){
 case'steer':haptic();break;
 case'horn':sound.play('horn');break;
 case'cash':sound.play('cash');renderer.effect('cash',px,py,'+'+money(e.value));break;
 case'loss':sound.play('flush');renderer.effect('loss',px,py,'−'+money(e.value));renderer.shake=profile.settings.motion?10:0;toast(e.label,'−'+money(e.value),2);haptic('heavy');break;
 case'crumb':sound.play('crumb');renderer.effect('cash',px,py);break;
 case'job':sound.play('pickup');toast(e.double?'DOUBLE TROUBLE!':'YOU’RE ON THE JOB',e.double?'Double pay. Twice the trailer.':'Follow the golden trail. Hit the finish flag.',2.2);break;
 case'delivery':sound.play('delivery');profile.stats.jobs++;if(e.double)profile.stats.doubles++;toast(e.perfect?'PERFECT DROP!':'DELIVERY BANKED',money(e.pay)+' · '+['Lovely jubbly.','Pallets in. Payday out.','Proof of delivery: smug grin.'][game.jobs%3],2.5);haptic();save();break;
 case'taco':sound.play('bonus');profile.stats.tacos++;save();break;
 case'sheepWarning':break;
 case'baa':sound.play('sheep');sound.duck();haptic();break;
 case'night':sound.play('bonus');toast('NIGHT SHIFT · DOUBLE BUBBLE','Coins are worth twice as much.',1.5);break;
 case'dawn':toast('HERE COMES THE SUN','Night rate clocked off.',1.4);break;
 case'boost':sound.play('pickup');toast('THERMOS TURBO!','A little extra go.',1.2);break;
 case'sheepClear':sound.play('scatter');profile.stats.horns++;save();break;
 case'hint':toast(e.text,'',1.2);break;
 case'crash':showComic(e.kind);break;
 case'bailout':sound.play('flush');renderer.shake=profile.settings.motion?12:0;haptic('heavy');toast('MATES’ RATES TO THE RESCUE','−£400 excess · '+({car:'Car park shuffle.',lowbridge:'Roof: mostly intact.',weakbridge:'Bridge: mostly intact.',oil:'Slick recovery.'}[e.kind]||'Phew.'),2.6);break;
 case'jackknife':sound.play('brake');renderer.shake=12;break;
 case'missedJob':toast('MISSED YOUR DROP','The pallet’s going back to the depot.',2);break;
 case'sheepFail':showComic('sheep');break;
 case'end':finish(e.reason,game.crashKind||'');break;
 }
 }}
function updateHud(){if(!game)return;$('money').textContent=money(game.money);$('distance').textContent=game.mode==='daily'?Math.max(0,120-Math.floor(game.time))+'s':(game.distance/9000).toFixed(2);$('distanceLabel').textContent=game.mode==='daily'?'SHIFT TIME LEFT':'MILES ON THE CLOCK';$('zone').textContent=themes[game.stage];$('jobs').textContent=game.night?'☾ NIGHT ×2':game.boost>0?'TURBO '+Math.ceil(game.boost)+'s':game.rested>0?'RESTED':' '+game.jobs+' DROPS';$('swayFill').style.width=game.sway*100+'%';$('swayFill').style.background=game.sway>.75?'#ff886f':'#60dfd4';$('swayLabel').textContent=game.job?.double?'DOUBLE TRAILER SWAY':'TRAILER SWAY';$('drivingHint').textContent=game.sway>.7?'Steady! Let it settle.':game.job?.double?'Double pay. Easy on the wheel.':'Easy does it, driver.';$('jobBox').classList.toggle('hidden',!game.job);if(game.job){$('jobTitle').textContent=game.job.label;$('jobMoney').textContent=money(game.job.pay);$('jobCount').textContent=game.job.count+' / 10 crumbs';$('jobProgress').style.width=game.job.count*10+'%';}
 $('sheepWarning').classList.toggle('hidden',!game.sheep);$('hornButton').classList.toggle('alert',!!game.sheep&&game.sheep.baa&&!game.sheep.cleared);if(game.sheep){let s=game.sheep;$('sheepWarning').classList.toggle('now',s.baa&&!s.cleared);$('sheepWarning').classList.toggle('cleared',s.cleared);$('sheepText').textContent=s.cleared?'WOOL DONE!':s.baa?'BEEP THE SHEEP!':'BEEP THE SHEEP!';$('sheepHint').textContent=s.cleared?'Cheers, driver!':s.baa?'BAA! DOUBLE TAP!':'Wait for the baa…';}
 if(game.time>8){$('tutorialHint').classList.add('hidden');if(!profile.tutorial){profile.tutorial=true;save();}}if(performance.now()>toastUntil)$('floatingToast').classList.add('hidden');}
async function finish(reason,kind=''){if(ending)return;ending=true;state='ended';sound.musicOff();const result={score:Math.max(0,Math.round(game.earned-game.fines)),earned:game.earned,fines:game.fines,distance:Math.floor(game.distance/10),jobs:game.jobs,horns:game.horns,time:Math.floor(game.time),mode:game.mode,date:new Date().toISOString(),name:profile.name};
 result.newBest=result.score>profile.best;profile.best=Math.max(profile.best,result.score);profile.wallet+=result.score;profile.scores.unshift(result);profile.scores=profile.scores.slice(0,30);save();updateHome();if(native()&&result.score>0)bridge('submitScore',{score:result.score,mode:result.mode});
 const show=()=>{if(state!=='ended')return;$('comic').classList.add('hidden');openSheet('SHIFT COMPLETE',reason,"<div class='result-score'>"+(result.newBest?"<span class='badge'>NEW PERSONAL BEST</span>":'')+"<span class='eyebrow'>NET EARNINGS</span><strong>"+money(result.score)+"</strong></div><div class='result-grid'><div><strong>"+result.jobs+"</strong><small>DELIVERIES</small></div><div><strong>"+(result.distance/900).toFixed(2)+"</strong><small>MILES</small></div><div><strong>"+result.horns+"</strong><small>FLOCKS SAVED</small></div></div><div class='receipt'><span>Jobs & rewards</span><b>"+money(result.earned)+"</b></div><div class='receipt'><span>Fines & damage</span><b class='negative'>−"+money(result.fines)+"</b></div><div class='receipt'><span>Added to garage wallet</span><b>"+money(result.score)+"</b></div><p class='status-note' id='saveStatus'>"+(native()?'Saved on this iPhone. Game Center submits when signed in.':'Saved on this device. Updating leaderboard…')+"</p><button class='big-button' id='againButton'>ONE MORE SHIFT <b>➜</b></button><button class='secondary' id='shareButton'>Share your shift</button><details class='taco-fact'><summary>🇺🇸 <span class='sprite' data-sprite='8'></span> WHY TACOS?</summary><p>In Britain, a <b>tachograph</b> records a lorry driver’s driving and rest. Drivers shorten it to <b>tacho</b>, which sounds just like taco. American drivers commonly use an <b>ELD</b>—Electronic Logging Device—to record driving hours.</p><p>So yes, the taco break is a tacho-break joke. Lettuce rest!</p></details><button class='quiet' id='homeButton'>Back to the depot</button>",'result');$('againButton').onclick=()=>begin(result.mode);$('homeButton').onclick=home;$('shareButton').onclick=async()=>{const text='I banked '+money(result.score)+' in Truckin’ & Drivin’ — '+result.jobs+' deliveries, '+result.horns+' flocks politely relocated. Keep it shiny side up!';if(native())bridge('share',{text});else{try{if(navigator.share)await navigator.share({title:'Truckin’ & Drivin’',text});else{await navigator.clipboard.writeText(text);$('shareButton').textContent='Shift copied!';}}catch{$('shareButton').textContent='Share cancelled — try again';}};};};
 if(kind){$('comic').onclick=()=>{if(performance.now()-comicAt>900){clearTimeout(comicTimer);show();}};comicTimer=setTimeout(show,3200);}else show();
 if(!native()&&backendUp){let id=onlineId||await runRequest;let msg='Saved on this device. Online board is unavailable.';if(id){try{const r=await fetch('/api/leaderboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,player:profile.player,nickname:profile.name,score:result.score,distance:result.distance,jobs:result.jobs}),signal:AbortSignal.timeout(8000)});msg=r.ok?'Your shift is on the live leaderboard.':'Saved on this device. This run could not be posted.';}catch{}}const waitStatus=()=>{if(activeSheet==='result'&&$('saveStatus'))$('saveStatus').textContent=msg;};waitStatus();if(kind)setTimeout(waitStatus,3300);}
}
const trucks=[{id:0,name:'THE OLD FAITHFUL',desc:'Your trusty turquoise mile muncher.',cost:0},{id:2,name:'THE TANGERINE DREAM',desc:'Sunset paint · +2% delivery earnings.',cost:1200},{id:3,name:'THE NIGHT SHIFT',desc:'Midnight paint · +4% delivery earnings.',cost:2800}];
function garage(){
 const t=trucks.find(t=>t.id===profile.truck);
 const picks=trucks.map(t=>"<button class='truck-option "+(profile.truck===t.id?'selected':'')+"' data-truck='"+t.id+"'><span class='sprite' data-sprite='"+t.id+"'></span>"+t.name.split('THE ')[1]+"<small>"+(profile.owned.includes(t.id)?profile.truck===t.id?'SELECTED':'OWNED':money(t.cost))+"</small></button>").join('');
 const decals=DECALS.map(d=>"<button class='decal-option "+(profile.decal===d.id?'selected':'')+"' data-decal='"+d.id+"'>"+(d.icon!==null?"<span class='extra' data-extra='"+d.icon+"'></span>":"<span class='factory'>—</span>")+"<b>"+d.name+"</b><small>"+(profile.ownedDecals.includes(d.id)?profile.decal===d.id?'FITTED':'OWNED':money(d.cost))+"</small></button>").join('');
 const upgrades=CATALOG.map(u=>{const lv=profile.upgrades[u.id],cost=u.cost*(lv+1);return "<div class='upgrade'><span class='extra' data-extra='"+u.icon+"'></span><div><b>"+u.name+" <span class='yellow'>"+lv+"/3</span></b><small>"+u.description+"</small></div><button data-upgrade='"+u.id+"' "+(lv>=3||profile.wallet<cost?'disabled':'')+">"+(lv>=3?'MAXED':money(cost))+"</button></div>";}).join('');
 openSheet('YOUR GARAGE','NIGHTING OUT, LIVING WELL',"<div class='garage-hero'><canvas id='garageRig' width='420' height='290' aria-label='Your truck and selected upgrades'></canvas><h3>"+t.name+"</h3><p>"+t.desc+"</p></div><div class='wallet-line'><span>Garage wallet</span><b>"+money(profile.wallet)+"</b></div><div class='truck-picker'>"+picks+"</div><p class='status-note'>Orange livery +2% deliveries. Purple livery +4% deliveries.</p><div class='decal-picker'>"+decals+"</div><p class='status-note'>A custom roof decal gives another 2% on deliveries.</p>"+upgrades+"<p class='status-note'>Everything is earned in game. No purchases. Upgrades are disabled in Daily Dispatch to keep it fair.</p>",'garage');
 if(renderer){const c=$('garageRig'),preview=new Renderer(c,renderer.images,profile.settings);preview.ctx.fillStyle='#1c4045';preview.ctx.fillRect(0,0,420,290);preview.rig({x:2,lane:2,trailer:2,rear:2,angle:0,upgrades:profile.upgrades,decal:profile.decal},profile.truck,210,70,1);}
 document.querySelectorAll('[data-truck]').forEach(btn=>btn.onclick=()=>{const t=trucks.find(x=>x.id===Number(btn.dataset.truck));if(!profile.owned.includes(t.id)){if(profile.wallet<t.cost)return;profile.wallet-=t.cost;profile.owned.push(t.id);}profile.truck=t.id;save();sound.play('click');updateHome();garage();});
 document.querySelectorAll('[data-decal]').forEach(btn=>btn.onclick=()=>{const d=DECALS.find(x=>x.id===Number(btn.dataset.decal));if(!profile.ownedDecals.includes(d.id)){if(profile.wallet<d.cost)return;profile.wallet-=d.cost;profile.ownedDecals.push(d.id);}profile.decal=d.id;save();sound.play('click');updateHome();garage();});
 document.querySelectorAll('[data-upgrade]').forEach(btn=>btn.onclick=()=>{const u=CATALOG.find(x=>x.id===btn.dataset.upgrade),lv=profile.upgrades[u.id],cost=u.cost*(lv+1);if(lv<3&&profile.wallet>=cost){profile.wallet-=cost;profile.upgrades[u.id]++;save();sound.play('cash');haptic();updateHome();const scroll=$('sheetBody').parentElement.scrollTop;garage();$('sheetBody').parentElement.scrollTop=scroll;}});
}

function guide(){openSheet('DRIVER’S GUIDE','KEEP IT SHINY SIDE UP',"<div class='guide-row'><span class='guide-symbol'>‹ ›</span><div><b>One swipe. One position.</b><p>Five steering positions, one rolling road. Swipe left or right. Keyboard: arrow keys or A / D.</p></div></div><div class='guide-row'><span class='sprite' data-sprite='4'></span><div><b>It’s not just the sheep.</b><p>Cars, low bridges, weak bridges and oil slicks end your shift on the spot. Cones, bus lanes, houses and the rest only cost a fine. Mates’ Rates insurance level 3 bails you out of one crash per shift.</p></div></div><div class='guide-row'><span class='sprite' data-sprite='9'></span><div><b>Green glow? Get that job.</b><p>Drive into the pallet. Every golden breadcrumb adds £25. Collect the finish flag to bank the whole job.</p></div></div><div class='guide-row'><span class='sprite' data-sprite='8'></span><div><b>A very important taco break.</b><p>Grab a shiny taco for £100 and a short breather. The tacho joke practically wrote itself.</p></div></div><div class='guide-row'><span class='sprite' data-sprite='12'></span><div><b>Wait for BAA. Then honk!</b><p>Double-tap, use HONK or press Space within the short yellow warning window. Early horns don’t count.</p></div></div><div class='guide-row'><span class='sprite' data-sprite='14'></span><div><b>Double trailer. Double trouble.</b><p>Purple jobs pay double. Rapid swerves can jackknife the outfit. Let the sway settle between moves.</p></div></div><p class='sheet-copy'>Warnings appear on the lane ahead of actual rolling-road features: low bridges, weak bridges, bus lanes, no-entry sections, gardens and roadworks. Change position early—and keep your trailer clear. Fines eat your £500 float. Bank your shift from Pause whenever you like.</p><div class='guide-row'><span class='extra' data-extra='0'></span><div><b>Night shift. Double bubble.</b><p>Pick up the glowing moon. Follow a dimly lit trail of coins worth twice as much; lighting upgrades improve your view.</p></div></div><div class='guide-row'><span class='extra' data-extra='1'></span><div><b>Thermos turbo!</b><p>Coffee means a burst of speed; tacos slow things down. Garage equipment improves earnings, comfort and control.</p></div></div><button class='secondary' id='guideDone'>Got it. Let’s roll.</button>",'guide');$('guideDone').onclick=closeSheet;}
function settings(){openSheet('IN THE CAB','JUST HOW YOU LIKE IT',"<div class='setting'><label for='musicVolume'>Road-trip music</label><input id='musicVolume' type='range' min='0' max='1' step='.05' value='"+profile.settings.music+"'></div><div class='setting'><label for='sfxVolume'>Sound effects</label><input id='sfxVolume' type='range' min='0' max='1' step='.05' value='"+profile.settings.sfx+"'></div><div class='setting'><label for='hapticSetting'>Haptic feedback</label><input id='hapticSetting' type='checkbox' "+(profile.settings.haptics?'checked':'')+"></div><div class='setting'><label for='motionSetting'>Extra motion & screen shake</label><input id='motionSetting' type='checkbox' "+(profile.settings.motion?'checked':'')+"></div><label class='field-label' for='editName'>DRIVER NAME</label><input id='editName' type='text' maxlength='16' value='"+escape(profile.name)+"' placeholder='Road legend'><button class='secondary' id='saveSettings'>Save settings</button><button class='quiet' id='privacyButton'>Privacy & your progress</button><p class='status-note'>v1.3.0 · Original art & music · No ads or in-app purchases</p>",'settings');$('musicVolume').oninput=e=>{profile.settings.music=Number(e.target.value);sound.update();};$('sfxVolume').oninput=e=>{profile.settings.sfx=Number(e.target.value);sound.play('click');};$('hapticSetting').onchange=e=>profile.settings.haptics=e.target.checked;$('motionSetting').onchange=e=>profile.settings.motion=e.target.checked;$('saveSettings').onclick=()=>{profile.name=$('editName').value.replace(/[^a-zA-Z0-9 _.-]/g,'').trim().slice(0,16)||'Road legend';save();closeSheet();};$('privacyButton').onclick=privacy;}
function privacy(){openSheet('YOUR DATA','SMALL PRINT. SHORT VERSION.',"<p class='sheet-copy'>Your truck unlocks, upgrades, settings and recent shifts are stored on this device. Clearing website data or removing the app can remove that progress.</p><p class='sheet-copy'>The online board stores your chosen driver name and submitted run results with an app-specific player ID. Never use a real name if you don’t want it shown. No advertising, analytics, location tracking, payments or contact permissions are used by this game.</p><p class='sheet-copy'>On iPhone, Game Center is optional and uses your Apple gaming profile. You can play offline without it.</p><p class='status-note'>"+(storageWarning?'This browser could not save progress. Check available storage and private browsing settings.':'Progress is saved after each finished shift and garage purchase.')+"</p>",'privacy');}
async function refreshScores(){if(activeSheet!=='leaderboard')return;const target=$('scores');try{if(!backendUp)throw Error();let r=await fetch('/api/leaderboard?mode='+scoreMode,{signal:AbortSignal.timeout(6000)});if(!r.ok)throw Error();let d=await r.json();if(activeSheet!=='leaderboard')return;target.innerHTML=d.scores.length?d.scores.map((s,i)=>"<div class='score-row'><span class='rank'>"+(i+1)+"</span><span class='name'>"+escape(s.nickname)+"</span><b>"+money(s.score)+"</b></div>").join(''):"<div class='empty'>A clear road ahead.<br>Finish a shift to set the first score.</div>";$('boardStatus').textContent='LIVE · best shift per driver · refreshes every 15 seconds';}catch{backendUp=false;if(activeSheet!=='leaderboard')return;$('sheetEyebrow').textContent='YOUR BEST SHIFTS';const list=profile.scores.filter(s=>s.score>0&&(scoreMode!=='daily'||(s.mode==='daily'&&s.date.slice(0,10)===new Date().toISOString().slice(0,10)))).sort((a,b)=>b.score-a.score).slice(0,10);target.innerHTML=list.length?list.map((s,i)=>"<div class='score-row'><span class='rank'>"+(i+1)+"</span><span class='name'>"+escape(s.name)+"</span><b>"+money(s.score)+"</b></div>").join(''):"<div class='empty'>No shifts saved on this device yet.<br>Time to get truckin’.</div>";$('boardStatus').textContent='ON THIS DEVICE · the online board isn’t connected';}}
function leaderboard(){if(native()){bridge('leaderboard',{mode:scoreMode});return;}openSheet('ROAD LEGENDS','THE LIVE LEADERBOARD',"<div class='score-tabs'><button id='allScores' class='"+(scoreMode==='all'?'active':'')+"'>All time</button><button id='dailyScores' class='"+(scoreMode==='daily'?'active':'')+"'>Daily dispatch</button></div><div id='scores'><div class='empty'>Checking the dispatch board…</div></div><p class='status-note' id='boardStatus'>Best net earnings wins. No invented drivers.</p>",'leaderboard');$('allScores').onclick=()=>{scoreMode='all';leaderboard();};$('dailyScores').onclick=()=>{scoreMode='daily';leaderboard();};clearInterval(leaderTimer);refreshScores();leaderTimer=setInterval(refreshScores,15000);}
window.truckinNativeMessage=(message)=>{if(message==='scoreSubmitted'&&$('saveStatus'))$('saveStatus').textContent='Your shift is on Game Center.';if(message==='pause')pause();if(message==='gameCenterUnavailable')openSheet('ROAD LEGENDS','GAME CENTER',"<p class='sheet-copy'>Game Center isn’t available right now. Sign in to Game Center in iPhone Settings to post scores. Your best shift is safely saved on this device.</p><div class='result-score'><span class='eyebrow'>PERSONAL BEST</span><strong>"+money(profile.best)+"</strong></div>",'nativeboard');};
$('playButton').onclick=()=>askStart('endless');$('dailyButton').onclick=()=>askStart('daily');$('pauseButton').onclick=pause;$('hornButton').onclick=honk;$('closeSheet').onclick=closeSheet;
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{sound.unlock();sound.play('click');({garage,leaderboard,guide,settings,intro:()=>{$('intro').classList.remove('hidden');setTimeout(()=>$('intro').classList.add('hidden'),2500);}})[b.dataset.action]?.();});
$('intro').onclick=()=>{$('intro').classList.add('hidden');sound.unlock();};setTimeout(()=>$('intro').classList.add('hidden'),2400);
let pointer=null,lastTap=0,lastTapPoint=null;
$('road').addEventListener('pointerdown',e=>{if(state!=='playing')return;e.preventDefault();$('road').setPointerCapture(e.pointerId);pointer={id:e.pointerId,x:e.clientX,y:e.clientY,at:performance.now(),moved:false};});
$('road').addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId||state!=='playing')return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(!pointer.moved&&Math.abs(dx)>Math.max(23,$('road').clientWidth*.06)&&Math.abs(dx)>Math.abs(dy)*.65){game.move(Math.sign(dx));pointer.moved=true;lastTap=0;handleEvents();}});
$('road').addEventListener('pointerup',e=>{if(!pointer||pointer.id!==e.pointerId)return;const now=performance.now(),dist=Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y);if(!pointer.moved&&dist<18&&now-pointer.at<260){if(now-lastTap<320&&lastTapPoint&&Math.hypot(e.clientX-lastTapPoint.x,e.clientY-lastTapPoint.y)<80){honk();lastTap=0;}else{lastTap=now;lastTapPoint={x:e.clientX,y:e.clientY};}}pointer=null;});
$('road').addEventListener('pointercancel',()=>pointer=null);
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;if(e.key==='Escape'){e.preventDefault();if(activeSheet)closeSheet();else pause();return;}if(e.key==='Tab'&&activeSheet){const focus=[...$('sheet').querySelectorAll('button:not(:disabled),input')].filter(el=>el.offsetParent!==null);if(e.shiftKey&&document.activeElement===focus[0]){e.preventDefault();focus.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===focus.at(-1)){e.preventDefault();focus[0]?.focus();}}if(state!=='playing')return;if(['ArrowLeft','a','A','ArrowRight','d','D',' ','p','P'].includes(e.key))e.preventDefault();if(e.repeat)return;if(['ArrowLeft','a','A'].includes(e.key))game.move(-1);if(['ArrowRight','d','D'].includes(e.key))game.move(1);if(e.key===' ')honk();if(e.key.toLowerCase()==='p')pause();handleEvents();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();sound.pause();if(game)save();}});window.addEventListener('pagehide',()=>{pause();if(game)save();});
function resize(){renderer?.resize();if(window.innerWidth>window.innerHeight&&window.innerHeight<550)pause();if(game)renderer?.draw(game,0,profile.truck);}
window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);
let hudAccumulator=0,checkpointClock=0;function frame(now){const dt=clamp((now-lastTime)/1000,0,.04);lastTime=now;if(game&&state==='playing'){game.tick(dt);handleEvents();checkpointClock+=dt;if(checkpointClock>5){save();checkpointClock=0;}renderer.draw(game,dt,profile.truck);hudAccumulator+=dt;if(hudAccumulator>.05){updateHud();hudAccumulator=0;}}requestAnimationFrame(frame);}
updateHome();
loadImages().then(images=>{renderer=new Renderer($('road'),images,profile.settings);$('playButton').disabled=false;$('dailyButton').disabled=false;updateHome();requestAnimationFrame(frame);}).catch(()=>$('loadError').classList.remove('hidden'));
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});

module.exports={};

}};const cache={};function require(n){if(cache[n])return cache[n].exports;if(!modules[n])throw new Error('Missing '+n);const m={exports:{}};cache[n]=m;modules[n](m,m.exports,require);return m.exports;}require('./game.js');})();