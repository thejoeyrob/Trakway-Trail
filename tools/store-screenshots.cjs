/* Store screenshots from the real game. Usage: node tools/store-screenshots.cjs <base-url> [outDir] [device]
   (needs Playwright; serve public/ first, e.g. `npx http-server public -p 8130`). Screens are captured at each store's exact pixel size. */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const base=process.argv[2]||'http://localhost:8130',out=process.argv[3]||'store/screenshots',only=process.argv[4];
// css size x dpr = store pixel size
const DEVICES={
 'ios-iphone-6.9':{w:440,h:956,dpr:3},'ios-iphone-6.5':{w:428,h:926,dpr:3},'ios-ipad-13':{w:1032,h:1376,dpr:2},
 'android-phone':{w:360,h:720,dpr:3},'android-tablet-7':{w:600,h:960,dpr:2},'android-tablet-10':{w:800,h:1280,dpr:2}};
const SAVE={name:'Driver',wallet:4200,tutorial:true,owned:[0,1,2,4],ownedDecals:[0,1,2],truck:4,decal:2,trailerPaint:1,trailerDecal:2,best:2860,
 upgrades:{lights:2,exhaust:2,horn:2,steering:1,insurance:1,bunk:1},settings:{music:0,sfx:0,motion:true,haptics:false}};
async function shot(page,file,wait=700){await page.waitForTimeout(wait);await page.screenshot({path:file.replace(/\.png$/,'.jpg'),type:'jpeg',quality:90});}
(async()=>{const browser=await chromium.launch();
 for(const [name,d] of Object.entries(DEVICES)){if(only&&only!==name)continue;
  const dir=path.join(out,name);fs.mkdirSync(dir,{recursive:true});
  const ctx=await browser.newContext({viewport:{width:d.w,height:d.h},deviceScaleFactor:d.dpr});
  const page=await ctx.newPage();page.on('pageerror',e=>console.log(name,'ERR',e.message));
  const load=async(save)=>{await page.addInitScript(s=>{localStorage.setItem('truckin-save-v1',JSON.stringify(s));},save||SAVE);await page.goto(base+'/play.html');await page.waitForTimeout(1500);await page.evaluate(()=>document.getElementById('intro').classList.add('hidden'));};
  const quiet=()=>page.evaluate(()=>{const g=window.truckinQA.game;g.invulnerable=999;g.items=[];g.row=1e9;g.nextSheep=1e9;g.nextNight=1e9;g.nextJob=1e9;g.nextBoost=1e9;g.nextShield=1e9;return g.distance;});
  // 1 depot menu
  await load();await page.click('#tapPrompt');await shot(page,dir+'/01-menu.png',1800);
  // 2 on the job, with a cow and geese to honk
  await page.evaluate(()=>window.truckinQA.begin('endless'));await page.waitForTimeout(1500);await quiet();
  await page.evaluate(()=>{const g=window.truckinQA.game;g.startJob({z:g.distance+240,lane:2,double:false});g.invulnerable=999;g.add('cow',g.distance+640,0,{honkable:true});g.add('geese',g.distance+760,4,{honkable:true});g.add('cone',g.distance+560,4);g.add('haybale',g.distance+860,0);});
  await shot(page,dir+'/02-on-the-job.png',900);
  // 3 garage
  await page.evaluate(()=>{window.truckinQA.home();});await page.waitForTimeout(600);await page.evaluate(()=>window.truckinQA.openGarage());await page.waitForTimeout(500);await page.click('[data-tab=livery]');await page.keyboard.press('ArrowRight');await shot(page,dir+'/03-garage.png',1200);
  // 4 crash freeze -> comic
  await page.reload();await page.waitForTimeout(1500);await page.evaluate(()=>document.getElementById('intro').classList.add('hidden'));
  await page.evaluate(()=>window.truckinQA.begin('endless'));await page.waitForTimeout(1500);await quiet();
  await page.evaluate(()=>{const g=window.truckinQA.game;g.invulnerable=0;g.lives=0;g.add('icecream',g.distance+230,g.lane,{});});await shot(page,dir+'/04-crash.png',1050);
  await page.waitForTimeout(1500);await shot(page,dir+'/05-comic.png',300);
  // 6 night shift
  await page.reload();await page.waitForTimeout(1500);await page.evaluate(()=>document.getElementById('intro').classList.add('hidden'));
  await page.evaluate(()=>window.truckinQA.begin('endless'));await page.waitForTimeout(1500);await quiet();
  await page.evaluate(()=>{const g=window.truckinQA.game;g.night={start:g.distance,end:g.distance+9000};for(let i=0;i<8;i++)g.add('coin',g.distance+200+i*110,[2,2,3,3,2,1,1,2][i],{nightCoin:true});g.add('tractor',g.distance+720,4,{drift:0});g.add('barrier',g.distance+640,0);});
  await shot(page,dir+'/06-night.png',900);
  await ctx.close();console.log('done',name);}
 await browser.close();})();
