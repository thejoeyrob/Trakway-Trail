/** Zero-dependency bundle sync for locked-down and cloud-only build environments. */
import {readFile,writeFile,copyFile,rm,mkdir,cp} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),dst=path.join(root,'ios/Truckin/web');
await rm(dst,{recursive:true,force:true});for(const x of ['assets','js'])await mkdir(path.join(dst,x),{recursive:true});
await cp(path.join(root,'public/assets/comic'),path.join(dst,'assets/comic'),{recursive:true});
await cp(path.join(root,'public/assets/menu'),path.join(dst,'assets/menu'),{recursive:true});
for(const f of ['sprites.webp','roads.webp','restrictions.webp','cover.webp','intro-jw.png','icon.png','farmer.webp','terrain.webp','extras.webp'])await copyFile(path.join(root,'public/assets',f),path.join(dst,'assets',f));
await copyFile(path.join(root,'public/game.css'),path.join(dst,'game.css'));
const files=['atlas.js','geometry.js','upgrades.js','model.js','audio.js','render.js','wheel.js','garage.js','game.js'];
const functions=[];
for(const name of files){let source=await readFile(path.join(root,'public/js',name),'utf8');const exports=[];
 source=source.replace(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?/g,(_,names,loc)=>{
  const bindings=names.split(',').map(s=>s.trim().replace(/\s+as\s+/,' : ')).join(',');
  return `const {${bindings}}=require(${JSON.stringify(loc)});`;
 });
 source=source.replace(/\bexport\s+(async\s+function|const|let|function|class)\s+([\w$]+)/g,(_,type,name)=>{exports.push(name);return `${type} ${name}`;});
 if(/\bexport\s+default|\bimport\s/.test(source))throw new Error(`Unrecognised module form: ${name}`);
 source+=`\nmodule.exports={${exports.join(',')}};\n`;
 functions.push(`${JSON.stringify('./'+name)}:function(module,exports,require){\n${source}\n}`);
}
const bundle=`(function(){'use strict';const modules={${functions.join(',\n')}};const cache={};function require(n){if(cache[n])return cache[n].exports;if(!modules[n])throw new Error('Missing '+n);const m={exports:{}};cache[n]=m;modules[n](m,m.exports,require);return m.exports;}require('./game.js');})();`;
await writeFile(path.join(dst,'js/game.bundle.js'),bundle);
let html=(await readFile(path.join(root,'public/play.html'),'utf8')).replace('<link rel="manifest" href="./manifest.webmanifest">','').replace('<script type="module" src="./js/game.js"></script>','<script src="./js/audio-data.js"></script><script src="./js/game.bundle.js"></script>');
await writeFile(path.join(dst,'play.html'),html);
const MP3=['roadtrip','menumusic','jweds-jingle'],data={};for(const n of ['roadtrip','menumusic','ignition','idle','rev','cash','crumb','pickup','delivery','horn','sheep','flush','brake','click','scatter','bonus','jweds-jingle']){try{data[n]=(await readFile(path.join(root,'public/audio',n+(MP3.includes(n)?'.mp3':'.wav')))).toString('base64');}catch(e){if(n!=='jweds-jingle')throw e;}}
await writeFile(path.join(dst,'js/audio-data.js'),'window.TRUCKIN_AUDIO_DATA='+JSON.stringify(data)+';');
console.log('Offline native web bundle synced: '+(bundle.length/1024).toFixed(1)+' KB of JS; all game art and audio included.');
