#!/usr/bin/env node
/* Apply exactly scoped changes to Claude's existing v1.4 game; refuse unknown revisions.
 * Unzip the complete art pack into the PROJECT ROOT, then: node tools/apply-rolling-road.mjs
 * Automatically backs up modified originals to .rolling-road-backup/
 */
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const p=f=>path.join(root,f);
const files=['public/js/geometry.js','public/js/model.js','public/js/render.js','public/js/game.js','public/sw.js','tests/game.test.mjs'];
function requireUnique(str,find,label){const count=str.split(find).length-1;if(count!==1)throw Error(`${label}: expected 1 anchor, found ${count}. Refusing to overwrite incompatible source.`);}
function swap(source,oldText,newText,label){requireUnique(source,oldText,label);return source.replace(oldText,newText);}
for(const file of files)if(!fs.existsSync(p(file)))throw Error(`Missing ${file}. Extract into Trakway-Trail repository root, not inside an extra folder.`);
if(!fs.existsSync(p('public/js/road-events.js')))throw Error('Missing road-events.js. Extract every pack file, preserving folder paths.');
const staged=new Map(files.map(f=>[f,fs.readFileSync(p(f),'utf8')]));
if(staged.get('public/js/geometry.js').includes('Rolling road patch v1.5')){console.log('Rolling road integration already applied. No changes.');process.exit(0);}
let text=staged.get('public/js/geometry.js');
text=swap(text,'export function roadShape(z)',`// Rolling road patch v1.5 — same atlas boundaries as the five-lane rendered road.\nconst THEME_SEQUENCE=[0,1,2,3];\nexport function roadTheme(z){const sector=Math.floor(Math.max(0,z)/5400);for(let n=THEME_SEQUENCE.length;n<=sector;n++){let x=Math.imul(n^0x9e3779b9,0x85ebca6b)>>>0;x^=x>>>16;THEME_SEQUENCE.push((THEME_SEQUENCE[n-1]+1+x%3)%4);}return THEME_SEQUENCE[sector];}\nexport function roadShape(z)`,'geometry stamp');
text=swap(text,'const stage=Math.max(0,Math.floor(Math.max(0,z)/5400))%4;','const stage=roadTheme(z);','nonrepeating scene order');
text=swap(text,'width*(280/627)/5','width*.56/5','geometry lane spacing');
staged.set('public/js/geometry.js',text);
text=staged.get('public/js/render.js');
text=swap(text,'roadShape(z).width*(280/627)/5','roadShape(z).width*.56/5','road events lane width');
text=swap(text,"import {rigPose,roadShape,roadCurve,laneX} from './geometry.js';","import {rigPose,roadShape,roadCurve,laneX,roadTheme} from './geometry.js';",'random biomes render import');
text=swap(text,'let theme=Math.max(0,Math.floor(z/5400))%4;','let theme=roadTheme(z);','road theme non-patterned');
text=swap(text,'draw((theme+3)%4,1-phase/360);','draw(roadTheme(z-5400),1-phase/360);','biome crossfade');
text=swap(text,"if(this.settings.guides!==false)this.laneGuides(g);","if(this.settings.guides===true)this.laneGuides(g);",'painted road default guides');
text=swap(text,'else this.sprite(SPR[e.type]??6,x,y,w,h);','else this.sprite(SPR[e.type]??6,x,y,w,h,e.oncoming?Math.PI:0);','oncoming-traffic turn');
staged.set('public/js/render.js',text);
text=staged.get('public/js/model.js');
text=swap(text,"import {laneX,rigPose} from './geometry.js';","import {laneX,rigPose,roadTheme} from './geometry.js';\nimport {chooseRoadScenario} from './road-events.js';",'scenario import');
text=swap(text,'return Math.floor(Math.max(0,z)/5400)%4;','return roadTheme(z);','model biome synchronization');
text=swap(text,'this.row=900;this.nextJob=600;','this.lastScenario=\'\';this.row=900;this.nextJob=600;','model scenario state');
const original="if(!blocked){this.add(kind,this.row,lane);if(this.rng()>.45)this.add(this.rng()>.65?'taco':'coin',this.row+80,(lane+2)%5);}}";
const changed=`if(!blocked){
     if(this.rng()<.27+.20*this.ramp()){
      const encounter=chooseRoadScenario(this.rng,this.row,this.lastScenario,this.ramp());
      this.lastScenario=encounter.name;
      for(const section of encounter.items)this.add(section.type,section.z,section.lane,section);
      this.row+=170+this.rng()*95; // room to steer before the next surprise
     }else{
      this.add(kind,this.row,lane);
      if(this.rng()>.45)this.add(this.rng()>.65?'taco':'coin',this.row+80,(lane+2)%5);
     }
    }}`;
text=swap(text,original,changed,'scenario event hook');
text=swap(text,'  const pose=rigPose(laneX(this.x,this.distance)',`  // Contraflow traffic approaches against the scrolling road; same collision rules as cars.
  for(const e of this.items)if(!e.done&&e.oncoming)e.z-=this.speed*dt*.55;
  const pose=rigPose(laneX(this.x,this.distance)`,'moving oncoming collision');
staged.set('public/js/model.js',text);
text=staged.get('public/sw.js');
text=swap(text,"const CACHE='truckin-v1.4.1';","const CACHE='truckin-v1.5.0';",'service worker cache bust');
text=swap(text,"'./js/model.js'","'./js/model.js','./js/road-events.js'",'offline scenario module');
staged.set('public/sw.js',text);
text=staged.get('tests/game.test.mjs');
text=swap(text,'w*(280/627)/5','w*.56/5','geometry regression test');
text += `\n// Rolling road v1.5 — no repeat patterns, safe exits and genuinely approaching traffic.\nimport {chooseRoadScenario,SCENARIO_NAMES} from '../public/js/road-events.js';\ntest('the seeded road scenarios vary without immediate repeats and always leave safe lanes',()=>{\n for(let seed=1;seed<=150;seed++){const rng=seeded(seed);let last='',seen=new Set();for(let i=0;i<30;i++){const event=chooseRoadScenario(rng,1000+i*740,last,.55);assert.notEqual(event.name,last);assert.ok(SCENARIO_NAMES.includes(event.name));const closed=new Set(event.items.filter(x=>x.length).map(x=>x.lane));assert.ok(closed.size<=3);assert.ok(event.items.every(x=>x.lane>=0&&x.lane<5));seen.add(event.name);last=event.name;}assert.ok(seen.size>=4);}\n});\ntest('approaching traffic advances towards the truck and survives checkpoint restore',()=>{\n const g=new Drive({seed:21});const car=g.add('car',2000,0,{oncoming:true});const initial=car.z;g.tick(.05);assert.ok(car.z<initial);const restored=Drive.restore(JSON.parse(JSON.stringify(g.snapshot())));assert.ok(restored.items.some(e=>e.oncoming));\n});\ntest('scenery theme sequence does not mechanically loop every four zones',()=>{\n const first=Array.from({length:24},(_,i)=>roadShape(i*5400).stage);assert.deepEqual(first.slice(0,4),[0,1,2,3]);assert.ok(first.some((x,i)=>i>=4&&x!==i%4));for(let i=1;i<first.length;i++)assert.notEqual(first[i],first[i-1]);\n});\n`;
staged.set('tests/game.test.mjs',text);
// No source file is changed until every expected anchor has been matched.
const backup=p('.rolling-road-backup');fs.mkdirSync(backup,{recursive:true});
for(const file of files){const target=p(file),back=path.join(backup,file);fs.mkdirSync(path.dirname(back),{recursive:true});if(!fs.existsSync(back))fs.copyFileSync(target,back);fs.writeFileSync(target,staged.get(file),'utf8');}
console.log('Applied v1.5 to',files.length,'source files. Preserved originals in .rolling-road-backup/.');
console.log('NEXT: npm test && npm run check && npm run sync-ios');
