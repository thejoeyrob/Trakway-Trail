/** Copies the web game into the Android project's assets (android/app/src/main/assets/web). Run before every Android build. */
import {rm,mkdir,cp,readdir} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),dst=path.join(root,'android/app/src/main/assets/web');
await rm(dst,{recursive:true,force:true});await mkdir(dst,{recursive:true});
await cp(path.join(root,'public'),dst,{recursive:true,filter:p=>!/\.DS_Store$/.test(p)});
const n=(await readdir(dst,{recursive:true})).length;
console.log('Android web assets synced: '+n+' files -> '+path.relative(root,dst));
