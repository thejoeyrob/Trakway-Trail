import test from 'node:test';
import assert from 'node:assert/strict';
import {setRouteMode,roadAt,routeLanes,surfaceAt} from '../public/js/route-world.js';
import {segInfo,recipe,lotsAt,decoAt,terrainAt,mapAt} from '../public/js/route-map.js';
setRouteMode('map');
test('every biome has ten authored variants and the map uses all of them',()=>{
 for(const b of['city','urban','country','highway'])for(let v=0;v<10;v++)assert.ok(recipe(b,v).features.length>=1,b+v);
 const seen=new Set();for(let seed=1;seed<=60;seed++)for(let n=0;n<40;n++){const s=segInfo(n,seed);seen.add(s.biome+s.variant);}
 assert.equal(seen.size,40);
});
test('biomes never repeat back to back and runs start in different places',()=>{
 for(let seed=1;seed<=80;seed++){let last='';for(let n=0;n<60;n++){const s=segInfo(n,seed);assert.notEqual(s.biome,last);last=s.biome;}}
 const starts=new Set();for(let seed=1;seed<=60;seed++){const r=roadAt(300,seed);starts.add(r.biome+r.variant);}assert.ok(starts.size>=10,'start segments: '+starts.size);
});
test('there is always a legal lane, and the legal path is continuous',()=>{
 for(let seed=1;seed<=25;seed++){let prev=null;for(let z=0;z<60000;z+=30){const L=routeLanes(z,seed,{legal:true});assert.ok(L.length>=1,`no legal lane seed ${seed} z ${z}`);
  if(prev)assert.ok(L.some(l=>prev.some(p=>Math.abs(p-l)<=1)),`legal path breaks seed ${seed} z ${z}`);prev=L;}}
});
test('road edges move smoothly: no square steps between neighbouring samples',()=>{
 for(let seed=1;seed<=12;seed++){let prev=null;for(let z=0;z<40000;z+=8){const r=roadAt(z,seed);if(prev&&prev.bands.length===r.bands.length)r.bands.forEach((b,i)=>{assert.ok(Math.abs(b.left-prev.bands[i].left)<9&&Math.abs(b.right-prev.bands[i].right)<9,`edge jump seed ${seed} z ${z}`);});prev=r;}}
});
test('the map is deterministic and the roadside faces the road',()=>{
 assert.deepEqual(roadAt(1234,9).bands,roadAt(1234,9).bands);
 const a=lotsAt(0,3000,9),b=lotsAt(0,3000,9);assert.deepEqual(a.map(l=>l.id+l.style),b.map(l=>l.id+l.style));
 for(const l of a){assert.ok(l.side<0?l.x<15:l.x>405,'lot '+l.id+' is on the carriageway');}
 for(const d of decoAt(0,12000,4))assert.ok(Number.isFinite(d.x)&&Number.isFinite(d.z));
});
test('water, oncoming and bus lanes are described by the map',()=>{
 let water=0,oncoming=0,bus=0;for(let seed=1;seed<=40;seed++)for(let z=0;z<80000;z+=60){const r=mapAt(z,seed);if(r.lanes.some(l=>l.fk==='water'&&l.o<.5))water++;if(r.bands.some(b=>b.rule==='oncoming'))oncoming++;if(r.bands.some(b=>b.rule==='bus'))bus++;}
 assert.ok(water>0&&oncoming>0&&bus>0,`water ${water} oncoming ${oncoming} bus ${bus}`);
 // a lane that is water is not drivable and the model sees it as off the road
 for(let seed=1;seed<=40;seed++)for(let z=0;z<80000;z+=60){const r=mapAt(z,seed);r.lanes.forEach((l,k)=>{if(l.fk==='water'&&l.o<=.02){const t=terrainAt(54+78*k,z,seed);assert.equal(t.onRoad,false);assert.equal(t.kind,'water');}});}
});
