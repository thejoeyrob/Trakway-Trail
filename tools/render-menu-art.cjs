// Renders tools/menu-art/icons.html -> public/assets/menu/<id>.webp (512x512, transparent). Needs Playwright + Pillow (dev only).
const {chromium}=require('playwright');const path=require('path');const {execFileSync}=require('child_process');
(async()=>{
 const root=path.join(__dirname,'..'),out=path.join(root,'public/assets/menu');
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:600,height:600},deviceScaleFactor:1});
 await p.goto('file://'+path.join(root,'tools/menu-art/icons.html'));await p.waitForTimeout(500);
 for(const id of ['keys','daily','garage','trophy','guide','settings']){
  const el=await p.$('#'+id);const png=path.join(out,id+'.png');await el.screenshot({path:png,omitBackground:true});
  execFileSync('python3',['-c',`from PIL import Image;im=Image.open(${JSON.stringify(png)}).convert('RGBA');im.save(${JSON.stringify(png.replace('.png','.webp'))},quality=90,method=6);import os;os.remove(${JSON.stringify(png)})`]);
 }
 await b.close();console.log('menu icons rendered');
})();
