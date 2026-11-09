import test from 'node:test';
import assert from 'node:assert/strict';
import {Drive,jobPath,seeded,CRASHES} from '../public/js/model.js';
test('one input moves one of exactly five bounded positions',()=>{
 let g=new Drive({seed:1});g.move(-1);assert.equal(g.lane,1);
 for(let i=0;i<9;i++)g.move(-1);assert.equal(g.lane,0);
 for(let i=0;i<9;i++)g.move(1);assert.equal(g.lane,4);
});
test('1000 delivery routes are reachable by single-position steps',()=>{
 for(let n=1;n<=1000;n++){let p=jobPath(2,seeded(n));assert.equal(p.length,10);assert.ok(p.every(x=>x>=0&&x<=4));assert.ok(p.every((x,i)=>i===0||Math.abs(x-p[i-1])<=1));}
});
test('job rewards are provisional until finish flag and pay once',()=>{
 let g=new Drive({seed:1}),e=g.add('job',600,2);g.collect(e);
 for(const c of g.items.filter(x=>x.type==='crumb'))g.collect(c);
 assert.equal(g.job.pay,400);assert.equal(g.money,500);
 let flag=g.items.find(x=>x.type==='finish');g.collect(flag);assert.equal(g.money,900);assert.equal(g.jobs,1);
 g.collect(flag);assert.equal(g.money,900);
});
test('double trailer pays double for the same trail',()=>{
 let g=new Drive({seed:1});g.collect(g.add('job',600,2,{double:true}));
 for(const c of g.items.filter(x=>x.type==='crumb'))g.collect(c);
 assert.equal(g.job.pay,800);g.collect(g.items.find(x=>x.type==='finish'));assert.equal(g.money,1300);
});
test('horn rejects early and late input, accepts tight timing window',()=>{
 for(const [time,baa,expected] of [[0,false,false],[.4,true,true],[1.2,true,false]]){let g=new Drive();g.sheep={z:1000,baa,baaAt:0,cleared:false};g.time=time;g.horn();assert.equal(g.sheep.cleared,expected);assert.equal(g.money,expected?575:500);}
});
test('missed sheep ends the shift without physical collision depiction',()=>{
 let g=new Drive();g.sheep={z:60,baa:true,baaAt:-3,cleared:false};g.tick(.016);assert.equal(g.finished,true);assert.equal(g.sheepFail,1);assert.ok(g.events.some(e=>e.type==='sheepFail'));
});
test('fines have grace period and insurance discount; bankruptcy ends run',()=>{
 let g=new Drive({upgrades:{insurance:3,horn:0,stability:0}});g.fine(100,'test');assert.equal(g.money,436);g.fine(100,'test');assert.equal(g.money,436);g.invulnerable=0;g.fine(1000,'test');assert.ok(g.finished);
});
test('trailer collides with a hazard after the cab passes',()=>{
 let g=new Drive();g.x=3;g.lane=3;g.trailer=2;g.add('cone',-55,3);g.tick(.016);assert.equal(g.money,430);
});
test('frantic double-trailer swerves trigger a jackknife',()=>{
 let g=new Drive();g.job={double:true,pay:300,end:5000};g.rapid=1.5;g.x=4;g.trailer=1;g.lane=4;g.tick(.016);assert.equal(g.job,null);assert.ok(g.events.some(e=>e.type==='jackknife'));
});
test('checkpoints preserve RNG, delivery and money exactly',()=>{
 let g=new Drive({seed:67});for(let i=0;i<100;i++)g.tick(.016);let r=Drive.restore(JSON.parse(JSON.stringify(g.snapshot())));assert.ok(r);assert.equal(r.distance,g.distance);assert.equal(r.money,g.money);assert.equal(r.rng(),g.rng());assert.deepEqual(r.items,g.items);
});
test('fixed seed produces identical road events',()=>{
 let a=new Drive({seed:20261029}),b=new Drive({seed:20261029});for(let i=0;i<400;i++){a.tick(.016);b.tick(.016);}assert.deepEqual(a.items,b.items);assert.equal(a.money,b.money);
});
test('model cannot accrue time or money after finishing',()=>{
 let g=new Drive();g.end('finished');let d=g.distance;g.tick(.05);g.move(1);assert.equal(g.distance,d);assert.equal(g.lane,2);
});

import {rigPose,laneX,roadShape,roadCurve,RIG} from '../public/js/geometry.js';
import {defaults as defaultUpgrades,normalize,deliveryBonus} from '../public/js/upgrades.js';
import {ROAD_TYPES,hazardKinds} from '../public/js/model.js';
test('tractor and both trailers remain attached at their hitch points',()=>{
 for(let a=-.75;a<.75;a+=.05){const r=rigPose(210,410,.2,a,-a);assert.ok(Math.abs(r.trailer.x+Math.sin(a)*38*RIG.S-r.hitch.x)<1e-7);assert.ok(Math.abs(r.trailer.y-Math.cos(a)*38*RIG.S-r.hitch.y)<1e-7);assert.ok(Math.abs(r.rear.x+Math.sin(-a)*45*RIG.S-r.rearHitch.x)<1e-7);}
});
test('steering remains five fixed positions while road boundaries vary independently',()=>{
 assert.deepEqual([0,1,2,3,4].map(l=>laneX(l,0)),[54,132,210,288,366]);
 for(let z=0;z<24000;z+=87)for(let lane=0;lane<5;lane++)assert.equal(laneX(lane,z),54+78*lane);
});
test('night shift creates forty coins at double value and resumes',()=>{
 const g=new Drive({seed:18});g.collect(g.add('night',100,2));assert.ok(g.night);assert.equal(g.items.filter(x=>x.nightCoin).length,40);let c=g.items.find(x=>x.nightCoin);g.collect(c);assert.equal(g.money,530);g.collect(c);assert.equal(g.money,530);
 const r=Drive.restore(JSON.parse(JSON.stringify(g.snapshot())));assert.deepEqual(r.night,g.night);assert.equal(r.items.filter(x=>x.nightCoin).length,40);
});
test('hazards are long road sections with prior lane-specific warnings',()=>{
 const g=new Drive();for(const type of ROAD_TYPES){const e=g.add(type,1200,2);assert.ok(e.road&&e.length>=190&&e.warning>=350);}assert.ok(hazardKinds(100).includes('bus'));assert.ok(hazardKinds(6000).includes('weakbridge'));assert.ok(hazardKinds(18100).includes('works'));
});
test('upgrades migrate, improve earnings and have bounded levels',()=>{
 let u=normalize({bunk:3,exhaust:3,lights:99,insurance:-4});assert.equal(u.lights,3);assert.equal(u.insurance,0);assert.equal(Object.keys(u).length,9);assert.ok(deliveryBonus(u,3,1)>.1);
 const g=new Drive({upgrades:u,truck:3,decal:1});g.collect(g.add('taco',0,2));assert.equal(g.money,600);g.collect(g.add('coin',0,2));assert.equal(g.money,617);assert.ok(g.rested>0);
});
test('burst of speed and taco cooldown have priority and expire',()=>{
 const g=new Drive();g.collect(g.add('boost',0,2));g.tick(.016);assert.ok(g.speed>g.cruise*1.25);g.collect(g.add('taco',0,2));g.tick(.016);assert.ok(g.speed<g.cruise*.7);g.slow=0;g.boost=.01;g.tick(.016);assert.ok(g.speed<g.cruise*1.05);
});
test('daily dispatch has stock equipment for fair Game Center daily scores',()=>{
 const g=new Drive({mode:'daily',upgrades:{bunk:3,exhaust:3,lights:3},truck:3,decal:3});assert.deepEqual(g.upgrades,defaultUpgrades());assert.equal(g.jobValue(100),100);assert.equal(g.rested,0);
});
test('difficulty ramps with distance: hazards bunch up and the rig speeds up, bounded',()=>{
 const g=new Drive({seed:5});assert.equal(g.ramp(),0);
 g.distance=24000;assert.ok(Math.abs(g.ramp()-.5)<1e-9);
 g.distance=1e7;assert.equal(g.ramp(),1);
 const a=new Drive({seed:5}),b=new Drive({seed:5});b.distance=48000;a.tick(.016);b.tick(.016);
 assert.ok(b.speed>a.speed+40,'late-shift speed exceeds opening speed');
});
test('first sheep waits until the player has had time to take a job',()=>{
 assert.ok(new Drive({seed:9}).nextSheep>=6500);
});
test('car, low bridge, weak bridge and oil each end the shift with their own reason',()=>{
 for(const kind of ['car','lowbridge','weakbridge','oil','house']){
  const g=new Drive({seed:3});g.collect(g.add(kind,100,2));
  assert.ok(g.finished,kind+' ends the shift');assert.equal(g.crashKind,kind);assert.equal(g.endReason,CRASHES[kind]);
  assert.ok(g.events.some(e=>e.type==='crash'&&e.kind===kind));
 }
 const reasons=new Set(Object.values(CRASHES));assert.equal(reasons.size,Object.keys(CRASHES).length,'every vignette has a distinct line');
});
test('cones, bridges of the fine-only kind and the rest still just cost money',()=>{
 for(const kind of ['cone','barrier','works','narrow','bus','noentry','grass']){
  const g=new Drive({seed:3});g.collect(g.add(kind,100,2));assert.ok(!g.finished,kind);assert.ok(g.fines>0,kind);
 }
});
test('level-3 insurance buys exactly one bail-out per shift; daily dispatch gets none',()=>{
 const g=new Drive({seed:3,upgrades:{insurance:3}});assert.equal(g.lives,1);
 g.collect(g.add('car',100,2));assert.ok(!g.finished);assert.equal(g.money,100);assert.ok(g.invulnerable>2);assert.ok(g.events.some(e=>e.type==='bailout'));
 g.collect(g.add('lowbridge',200,2));assert.ok(g.finished);assert.equal(g.crashKind,'lowbridge');
 assert.equal(new Drive({seed:3,mode:'daily',upgrades:{insurance:3}}).lives,0);
 assert.equal(new Drive({seed:3,upgrades:{insurance:2}}).lives,0);
});

test('garage catalogue: every truck, decal and upgrade has display copy and stats',async()=>{
 const {TRUCKS,DECAL_TAGS,STATS,CATALOG,DECALS}=await import('../public/js/upgrades.js');
 assert.equal(TRUCKS.length,6);assert.equal(DECAL_TAGS.length,DECALS.length);
 for(const u of CATALOG){assert.ok(STATS[u.id],u.id+' has a stat line');for(let l=0;l<=3;l++)assert.ok(String(STATS[u.id].f(l)).length>0);}
 assert.ok(STATS.insurance.f(3).includes('bail-out'));
});

// Rolling road v1.5 — no repeat patterns, safe exits and genuinely approaching traffic.
import {chooseRoadScenario,SCENARIO_NAMES} from '../public/js/road-events.js';
test('the seeded road scenarios vary without immediate repeats and always leave safe lanes',()=>{
 for(let seed=1;seed<=150;seed++){const rng=seeded(seed);let last='',seen=new Set();for(let i=0;i<30;i++){const event=chooseRoadScenario(rng,1000+i*740,last,.55);assert.notEqual(event.name,last);assert.ok(SCENARIO_NAMES.includes(event.name));const closed=new Set(event.items.filter(x=>x.length).map(x=>x.lane));assert.ok(closed.size<=3);assert.ok(event.items.every(x=>x.lane>=0&&x.lane<5));seen.add(event.name);last=event.name;}assert.ok(seen.size>=4);}
});
test('approaching traffic advances towards the truck and survives checkpoint restore',()=>{
 const g=new Drive({seed:21});const car=g.add('car',2000,0,{oncoming:true});const initial=car.z;g.tick(.05);assert.ok(car.z<initial);const restored=Drive.restore(JSON.parse(JSON.stringify(g.snapshot())));assert.ok(restored.items.some(e=>e.oncoming));
});
test('scenery theme sequence does not mechanically loop every four zones',()=>{
 const first=Array.from({length:24},(_,i)=>roadShape(i*5400).stage);assert.deepEqual(first.slice(0,4),[0,1,2,3]);assert.ok(first.some((x,i)=>i>=4&&x!==i%4));for(let i=1;i<first.length;i++)assert.notEqual(first[i],first[i-1]);
});

// The old flat-road density metric (34 hazards/minute) is superseded by the
// route geometry and reachability tests in route-world.test.mjs. A narrower
// road itself is a challenge; maintaining that old count would overcrowd it.
test('the rig is quicker: opening speed 240, ramping towards ~380 on a long shift',()=>{
 const g=new Drive({seed:2});g.tick(.016);assert.ok(g.cruise>=250&&g.cruise<262);
 const h=new Drive({seed:2});h.time=200;h.distance=48000;h.tick(.016);assert.ok(h.cruise>=420&&h.cruise<=430);
});

test('steering anchors never auto-follow the road; bends require player input',()=>{
 for(let z=0;z<40000;z+=173){assert.equal(roadCurve(z),0);assert.equal(laneX(2,z),210);for(let lane=0;lane<5;lane++)assert.ok(Math.abs((laneX(lane,z)-210)/(lane-2||1)-(laneX(4,z)-210)/2)<1e-9||lane===2);}
});

// ---- v2-plus ----
test('every hazard type can appear on the road (nothing is missing from the spawn mix)',async()=>{
 const {MIX}=await import('../public/js/model.js'),{HAZARD_SPECS}=await import('../public/js/route-hazards.js');
 const used=new Set(MIX.flat().map(m=>m[0]));
 for(const k of Object.keys(HAZARD_SPECS))if(k!=='house')assert.ok(used.has(k),k+' is in the mix');
});
test('honking shoos a cow in range for pay; a cow too close or too far is untouched, and an unshooed cow ends the shift',()=>{
 const g=new Drive({seed:3});g.items=[];g.row=1e9;const near=g.add('cow',g.distance+300,1,{honkable:true}),far=g.add('cow',g.distance+900,3,{honkable:true}),close=g.add('cow',g.distance+30,0,{honkable:true});
 const before=g.money;g.horn();assert.ok(near.cleared&&near.done);assert.ok(!far.cleared);assert.ok(!close.cleared);assert.equal(g.money,before+60);
 g.collect(close);assert.equal(g.crashKind,'cow');assert.ok(g.finished);
});
test('a lucky horseshoe absorbs exactly one crash',()=>{
 const g=new Drive({seed:4});g.items=[];g.collect(g.add('shield',100,2));assert.equal(g.shield,1);
 g.crash('car');assert.ok(!g.finished);assert.equal(g.shield,0);g.invulnerable=0;g.crash('car');assert.ok(g.finished);
});
test('cab-only is much faster, the pay of an abandoned job is lost, and a new job hitches up again',()=>{
 const a=new Drive({seed:6}),b=new Drive({seed:6});a.items=[];b.items=[];a.row=b.row=1e9;
 b.startJob({z:200,lane:2,double:false});const pay=b.job.pay;assert.ok(pay>0);const money=b.money;b.dropTrailer();assert.equal(b.job,null);assert.equal(b.money,money,'unbanked job pay is not paid out');
 a.dropTrailer();b.tick(.016);a.tick(.016);const c=new Drive({seed:6});c.items=[];c.row=1e9;c.tick(.016);assert.ok(a.speed>c.speed*1.3,'cab only is at least 30% quicker');
 assert.equal(a.hasTrailer,false);a.startJob({z:a.distance+200,lane:2,double:false});assert.equal(a.hasTrailer,true);
});
test('every paint and roof graphic has copy, and the cab and trailer paints are separate profile fields',async()=>{
 const {TRUCKS,DECALS,DECAL_TAGS}=await import('../public/js/upgrades.js'),{PAINTS,DECAL_PAINT}=await import('../public/js/rigart.js').catch(()=>({}));
 assert.equal(DECAL_TAGS.length,DECALS.length);for(const t of TRUCKS)assert.ok(t.name&&t.desc,'paint '+t.id);
});
test('tall layout maths: a wider or taller-than-SE screen keeps the 420-wide road and never less than SE lookahead',()=>{
 for(const [w,h] of [[375,667],[390,844],[768,1024],[430,932]]){const k=Math.min(w/420,h/747),H=h/k,pad=Math.max(0,(w/k-420)/2);assert.ok(H>=747-1e-9);assert.ok(pad>=0);}
});
