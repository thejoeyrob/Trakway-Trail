import {existsSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {chooseRoadScenario,SCENARIO_NAMES} from '../public/js/road-events.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const name of ['public/assets/roads.webp','source-art/roads.png','public/js/road-events.js']){
 const f=path.join(root,name);if(!existsSync(f)||statSync(f).size<1000)throw Error('Missing asset/module: '+name);
}
function seeded(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
let count=0;
for(let seed=1;seed<=300;seed++){
 let rng=seeded(seed),last='',seen=new Set();
 for(let i=0;i<50;i++){
  const event=chooseRoadScenario(rng,900+i*700,last,i/50);
  if(event.name===last||!SCENARIO_NAMES.includes(event.name))throw Error('Scenario pattern issue at seed '+seed);
  const blocked=new Set(event.items.filter(e=>e.length).map(e=>e.lane));
  if(blocked.size>3||event.items.some(e=>e.lane<0||e.lane>4))throw Error('Unplayable road section');
  if(event.items.filter(e=>e.oncoming).some(e=>e.type!=='car'))throw Error('Oncoming must be moving car');
  if(event.items.some(e=>!e.oncoming&&e.warning<500))throw Error('Insufficient advance warning');
  last=event.name;seen.add(event.name);count++;
 }
 if(seen.size<4)throw Error('Insufficient route variety for '+seed);
}
console.log(`PASS: ${count.toLocaleString()} scenario generations; seven encounter types, safe exits, warning lead-ins, no immediate repeats.`);
