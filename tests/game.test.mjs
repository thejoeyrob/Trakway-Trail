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

import {rigPose,laneX,roadShape,roadCurve} from '../public/js/geometry.js';
import {defaults as defaultUpgrades,normalize,deliveryBonus} from '../public/js/upgrades.js';
import {ROAD_TYPES,hazardKinds} from '../public/js/model.js';
test('tractor and both trailers remain attached at their hitch points',()=>{
 for(let a=-.75;a<.75;a+=.05){const r=rigPose(210,410,.2,a,-a);assert.ok(Math.abs(r.trailer.x+Math.sin(a)*38-r.hitch.x)<1e-7);assert.ok(Math.abs(r.trailer.y-Math.cos(a)*38-r.hitch.y)<1e-7);assert.ok(Math.abs(r.rear.x+Math.sin(-a)*45-r.rearHitch.x)<1e-7);}
});
test('lane positions correspond to five evenly spaced sections of the road',()=>{
 for(let z=0;z<24000;z+=87){const w=roadShape(z).width,step=w*(280/627)/5,left=210+roadCurve(z)-2.5*step;for(let lane=0;lane<5;lane++)assert.ok(Math.abs(laneX(lane,z)-(left+(lane+.5)*step))<1e-8);}
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
 const g=new Drive();g.collect(g.add('boost',0,2));g.tick(.016);assert.ok(g.speed>230);g.collect(g.add('taco',0,2));g.tick(.016);assert.ok(g.speed<130);g.slow=0;g.boost=.01;g.tick(.016);assert.ok(g.speed<190);
});
test('daily dispatch has stock equipment for fair Game Center daily scores',()=>{
 const g=new Drive({mode:'daily',upgrades:{bunk:3,exhaust:3,lights:3},truck:3,decal:3});assert.deepEqual(g.upgrades,defaultUpgrades());assert.equal(g.jobValue(100),100);assert.equal(g.rested,0);
});
test('difficulty ramps with distance: hazards bunch up and the rig speeds up, bounded',()=>{
 const g=new Drive({seed:5});assert.equal(g.ramp(),0);
 g.distance=31500;assert.ok(Math.abs(g.ramp()-.5)<1e-9);
 g.distance=1e7;assert.equal(g.ramp(),1);
 const a=new Drive({seed:5}),b=new Drive({seed:5});b.distance=63000;a.tick(.016);b.tick(.016);
 assert.ok(b.speed>a.speed+40,'late-shift speed exceeds opening speed');
});
test('first sheep waits until the player has had time to take a job',()=>{
 assert.ok(new Drive({seed:9}).nextSheep>=5200);
});
test('car, low bridge, weak bridge and oil each end the shift with their own reason',()=>{
 for(const kind of ['car','lowbridge','weakbridge','oil']){
  const g=new Drive({seed:3});g.collect(g.add(kind,100,2));
  assert.ok(g.finished,kind+' ends the shift');assert.equal(g.crashKind,kind);assert.equal(g.endReason,CRASHES[kind]);
  assert.ok(g.events.some(e=>e.type==='crash'&&e.kind===kind));
 }
 const reasons=new Set(Object.values(CRASHES));assert.equal(reasons.size,Object.keys(CRASHES).length,'every vignette has a distinct line');
});
test('cones, bridges of the fine-only kind and the rest still just cost money',()=>{
 for(const kind of ['cone','barrier','works','narrow','bus','noentry','house','grass']){
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
