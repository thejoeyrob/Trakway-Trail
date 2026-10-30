import test from 'node:test';
import assert from 'node:assert/strict';
import {Drive,jobPath,seeded} from '../public/js/model.js';
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
 let g=new Drive();g.x=3;g.lane=3;g.trailer=2;g.add('cone',-55,2);g.tick(.016);assert.equal(g.money,430);
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
