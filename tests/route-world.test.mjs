import test from 'node:test';
import assert from 'node:assert/strict';
import {Drive,PICKUPS} from '../public/js/model.js';
import {CHUNK_LENGTH,MOTIFS,routeSpec,roadAt,routeLanes,nearestLane,surfaceAt,reachableCorridor,sceneryProps,steeringX,rewardPath} from '../public/js/route-world.js';
import {HAZARD_SPECS,sweptOverlap} from '../public/js/route-hazards.js';
import {showroomFrame} from '../public/js/showroom.js';
const quiet=g=>{g.nextJob=g.nextNight=g.nextSheep=g.nextBoost=g.row=Infinity;};
const at=(g,z,lane)=>{g.distance=z;g.lane=g.x=g.trailer=g.rear=lane;};
test('route bags vary with seed, visit all motifs and never immediately repeat',()=>{
 for(let seed=1;seed<=100;seed++){let last='';const seen=new Set();for(let i=0;i<60;i++){const s=routeSpec(i,seed);assert.notEqual(s.motif,last);last=s.motif;seen.add(last);}assert.equal(seen.size,MOTIFS.length);}
 assert.notDeepEqual(Array.from({length:20},(_,i)=>routeSpec(i,7).motif),Array.from({length:20},(_,i)=>routeSpec(i,8).motif));
});
test('100 seeded routes retain a legal corridor over 100,000 world units',()=>{
 for(let seed=1;seed<=100;seed++)assert.ok(reachableCorridor([],0,100000,seed),`seed ${seed}`);
});
test('road joins share exact edges, and variable widths require steering',()=>{
 let widths=new Set(),centres=new Set(),counts=new Set();
 for(let seed=1;seed<=40;seed++)for(let i=1;i<30;i++){
  const before=roadAt(i*CHUNK_LENGTH-.0001,seed),after=roadAt(i*CHUNK_LENGTH+.0001,seed);
  assert.ok(Math.abs(before.bands[0].left-after.bands[0].left)<.001);assert.ok(Math.abs(before.bands.at(-1).right-after.bands.at(-1).right)<.001);
  const mid=roadAt(i*CHUNK_LENGTH+1300,seed);for(const b of mid.bands){widths.add(Math.round(b.right-b.left));centres.add(Math.round((b.left+b.right)/2));}counts.add(routeLanes(i*CHUNK_LENGTH+1300,seed).length);
 }
 assert.ok(widths.size>=4);assert.ok(centres.size>=4);assert.ok([...counts].some(n=>n<5));
});
test('3,000 delivery trails stay on legal roads with single-step reachable pickups',()=>{
 for(let seed=1;seed<=100;seed++)for(let k=0;k<30;k++){
  const z=400+k*1700,g=new Drive({seed}),lane=nearestLane(z,2,seed);g.startJob(g.add('job',z,lane));
  let previous=lane;for(const e of g.items.filter(e=>['crumb','finish'].includes(e.type))){assert.ok(routeLanes(e.z,seed,{legal:true}).includes(e.lane));assert.ok(Math.abs(previous-e.lane)<=1,`${seed}:${z}`);previous=e.lane;}
 }
});
test('night coin trails use the same branch-aware planner',()=>{
 for(let seed=1;seed<=30;seed++)for(let z=200;z<25000;z+=2100){const positions=Array.from({length:40},(_,i)=>z+100*(i+1)),start=nearestLane(z,2,seed),path=rewardPath(positions,start,seed);let last=start;path.forEach((l,i)=>{assert.ok(routeLanes(positions[i],seed,{legal:true}).includes(l));assert.ok(Math.abs(l-last)<=1);last=l;});}
});
test('generated hazard rows cannot wall off the legal road',()=>{
 for(let seed=1;seed<=70;seed++){const g=new Drive({seed});quiet(g);for(let z=1200;z<40000;z+=620){g.makeRow(z,1.2);const hazards=g.items.filter(e=>!PICKUPS.includes(e.type));assert.ok(reachableCorridor(hazards,z-500,z+650,seed),`seed ${seed} z ${z}`);g.items=g.items.filter(e=>e.z>z-1200);}}
});
test('risk prizes and oncoming traffic occupy separate lanes inside a signed fork',()=>{
 const g=new Drive({seed:41});let found=false;for(let i=1;i<30;i++){const z=i*CHUNK_LENGTH+1350;if(roadAt(z,g.seed).motif!=='contraflow')continue;g.items=[];assert.ok(g.spawnEncounter(z));const car=g.items.find(e=>e.oncoming),prize=g.items.find(e=>e.type==='prize');assert.ok(car&&prize);assert.notEqual(car.lane,prize.lane);assert.equal(surfaceAt(steeringX(car.lane),car.z,g.seed).rule,'oneway');assert.ok(car.stopZ>i*CHUNK_LENGTH+900);found=true;break;}assert.ok(found);
});
test('drop abandons only provisional delivery pay, accelerates cab, and disables rear collisions',()=>{
 const g=new Drive({seed:9});quiet(g);g.startJob(g.add('job',600,2));const bank=g.money;assert.ok(g.dropTrailer());assert.equal(g.money,bank);assert.equal(g.job,null);assert.ok(!g.items.some(e=>['crumb','finish'].includes(e.type)));assert.equal(g.dropTrailer(),false);
 g.items=[];quiet(g);g.add('cone',-100,2);g.tick(.016);assert.equal(g.fines,0);assert.ok(g.speed>g.cruise*1.15);assert.equal(g.sway,0);
});
test('green hitch and new job both restore a real trailer with no payout exploit',()=>{
 const g=new Drive({seed:2});g.dropTrailer();const hitch=g.add('hitch',10,2);g.collect(hitch);g.collect(hitch);assert.equal(g.hasTrailer,true);assert.equal(g.money,500);g.dropCooldown=0;g.dropTrailer();g.collect(g.add('job',100,2));assert.equal(g.hasTrailer,true);assert.ok(g.job);assert.equal(g.money,500);
});
test('a missed hitch is offered again and drop state survives checkpoint restore',()=>{
 const g=new Drive({seed:2});quiet(g);g.dropTrailer();g.grip=3.2;const restored=Drive.restore(JSON.parse(JSON.stringify(g.snapshot())));assert.equal(restored.hasTrailer,false);assert.equal(restored.grip,3.2);assert.equal(restored.nextHitch,g.nextHitch);
 g.nextHitch=500;g.spawn();assert.ok(g.items.some(e=>e.type==='hitch'));const h=g.items.find(e=>e.type==='hitch');h.done=true;g.distance=g.nextHitch;g.spawn();assert.equal(g.items.filter(e=>e.type==='hitch').length,2);
});
test('mud weakens steering temporarily, expires on asphalt, and preserves upgrades',()=>{
 const dry=new Drive({seed:2}),wet=new Drive({seed:2});quiet(dry);quiet(wet);wet.collect(wet.add('mud',0,2));dry.move(1);wet.move(1);dry.tick(.05);wet.tick(.05);assert.ok(wet.x<dry.x);assert.ok(wet.grip>4);
 for(let i=0;i<110;i++){at(wet,50,2);wet.items=[];wet.tick(.05);}assert.equal(wet.grip,0);assert.equal(wet.money,500);
});
test('one-way and residential restrictions charge once per section, not every frame',()=>{
 for(const motif of ['contraflow','estate-fork']){const g=new Drive({seed:10});quiet(g);let r;for(let i=1;i<40;i++){r=roadAt(i*CHUNK_LENGTH+1350,g.seed);if(r.motif===motif)break;}assert.equal(r.motif,motif);at(g,r.start+1300,r.restricted==='left'?1:3);
  g.tick(.01);const fine=g.fines;assert.equal(fine,motif==='contraflow'?120:90);g.invulnerable=0;g.tick(.01);assert.equal(g.fines,fine);
 }
});
test('roadside collision footprints match visible scenery placements',()=>{
 const g=new Drive({seed:1});quiet(g);const p=sceneryProps(100,1000,1).find(p=>p.effect==='house'&&p.x>=30&&p.x<=390);assert.ok(p);at(g,p.z,(p.x-54)/78);g.tick(.001);assert.equal(g.crashKind,'house');
 for(const p of sceneryProps(0,10000,17)){assert.ok(p.hitWidth<=p.width);assert.ok(p.hitHeight<=p.height);}
});
test('collision specifications stay inside artwork and swept contact catches fast movement',()=>{
 for(const s of Object.values(HAZARD_SPECS)){assert.ok(s.hitWidth<=s.width);assert.ok(s.hitHeight<=s.height);}
 assert.equal(sweptOverlap(0,100,10,45,55),true);assert.equal(sweptOverlap(0,25,10,45,55),false);
});
test('legacy live checkpoints migrate without losing bank, owned upgrades or seed',()=>{
 const g=new Drive({seed:51,upgrades:{steering:2}}),old=g.snapshot();delete old.routeVersion;old.money=777;old.distance=5800;const r=Drive.restore(old);assert.equal(r.money,777);assert.equal(r.seed,51);assert.equal(r.upgrades.steering,2);assert.ok(routeLanes(r.distance,51,{legal:true}).includes(r.lane));assert.equal(r.items.length,0);assert.ok(r.events.some(e=>e.type==='hint'));
});
test('eight showroom views wrap in both directions without a spinning flat sprite',()=>{
 assert.deepEqual(Array.from({length:8},(_,i)=>showroomFrame(i*Math.PI/4)),[0,1,2,3,4,5,6,7]);assert.equal(showroomFrame(Math.PI*2),0);assert.equal(showroomFrame(-Math.PI/4),7);
});
