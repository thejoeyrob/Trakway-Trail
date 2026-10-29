// Fast pre-release sanity check: JS syntax, manifest JSON, and that every asset the service worker precaches exists.
import {readFile,readdir,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
let failed=0;const fail=m=>{failed++;console.error('✗',m);};
for(const f of await readdir(path.join(root,'public/js'))){
 const r=spawnSync(process.execPath,['--check',path.join(root,'public/js',f)],{encoding:'utf8'});
 if(r.status)fail(`syntax: public/js/${f}\n${r.stderr}`);
}
try{JSON.parse(await readFile(path.join(root,'public/manifest.webmanifest'),'utf8'));}catch(e){fail('manifest.webmanifest: '+e.message);}
const sw=await readFile(path.join(root,'public/sw.js'),'utf8');
const list=sw.match(/ASSETS=\[(.*?)\]/s)?.[1].match(/'([^']+)'/g)?.map(s=>s.slice(1,-1))||[];
if(!list.length)fail('sw.js: no ASSETS found');
for(const a of list)try{await stat(path.join(root,'public',a));}catch{fail('sw.js precaches missing file: '+a);}
const html=await readFile(path.join(root,'public/play.html'),'utf8');
for(const m of html.matchAll(/(?:src|href)="\.\/([^"#?]+)"/g))try{await stat(path.join(root,'public',m[1]));}catch{fail('play.html references missing file: '+m[1]);}
console.log(failed?`${failed} problem(s)`:`OK — ${list.length} precached assets, all scripts parse`);
process.exit(failed?1:0);
