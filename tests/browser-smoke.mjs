/* Optional browser acceptance tests. npm test remains dependency-free.
 * Install Playwright locally, then: node tests/browser-smoke.mjs
 * BROWSER_TEST_REPORT selects a JSON output; QA_SHOTS enables local screenshots.
 */
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(import.meta.dirname,'..'),report={checks:[],errors:[],screens:[],timings:[]};
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.wav':'audio/wav','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const server=createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://local').pathname),file=path.join(root,name);if(!file.startsWith(root+path.sep))throw Error();const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(data);}catch{res.writeHead(404).end('Not found');}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
let browser;
const check=(name,condition)=>{assert.ok(condition,name);report.checks.push(name);};
try{
 browser=await chromium.launch({headless:true,...(process.env.TEST_BROWSER_EXECUTABLE?{executablePath:process.env.TEST_BROWSER_EXECUTABLE}:{}),args:process.env.TEST_BROWSER_ARGS?JSON.parse(process.env.TEST_BROWSER_ARGS):[]});
 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:768,height:1024}]){
  const context=await browser.newContext({viewport,deviceScaleFactor:2,hasTouch:true,isMobile:true});const page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(base+'/public/play.html');await page.waitForFunction(()=>!!window.truckinQA?.renderer);
  await page.locator('#intro').click({force:true});await page.locator('#tapPrompt').click();await page.locator('#menuWheel .focus').click();
  await page.locator('#driverName').fill('Test Driver');await page.locator('#nameGo').click();await page.waitForFunction(()=>window.truckinQA.state==='playing');
  check(viewport.width+': complete launch, menu and driver registration',await page.locator('#hud').isVisible());
  await page.keyboard.press('ArrowLeft');check(viewport.width+': steering keyboard',await page.evaluate(()=>window.truckinQA.game.lane===1));
  await page.locator('#trailerButton').click();check(viewport.width+': trailer button drops load',await page.evaluate(()=>window.truckinQA.game.hasTrailer===false));
  await page.locator('#pauseButton').click();const d=await page.evaluate(()=>window.truckinQA.game.distance);await page.waitForTimeout(90);check(viewport.width+': pause freezes world',await page.evaluate(()=>window.truckinQA.game.distance)===d);
  await page.reload();await page.waitForFunction(()=>!!window.truckinQA?.renderer);await page.locator('#intro').click({force:true});await page.locator('#tapPrompt').click();await page.locator('#menuWheel .focus').click();await page.waitForFunction(()=>window.truckinQA.state==='playing');
  check(viewport.width+': reload resumes detached truck',await page.evaluate(()=>!window.truckinQA.game.hasTrailer));
  await page.locator('#pauseButton').click();
  // Controlled fixture tests: road renderer, real collection and equipment data.
  const hitch=await page.evaluate(()=>{const g=window.truckinQA.game;g.collect(g.add('hitch',g.distance,g.lane));return g.hasTrailer;});check(viewport.width+': hitch collection',hitch);
  const perf=await page.evaluate(()=>{const qa=window.truckinQA,g=qa.game;g.seed=19;g.items=[];g.sheep=null;g.night=null;const start=performance.now();for(let i=0;i<90;i++){g.distance=5200+i*7;qa.renderer.draw(g,.016,0);}return (performance.now()-start)/90;});report.timings.push({width:viewport.width,meanDrawMs:perf});
  await page.evaluate(()=>{window.truckinQA.home();window.truckinQA.openGarage();});
  const before=await page.locator('#showroom').evaluate(el=>el.toDataURL());const box=await page.locator('#showroom').boundingBox();await page.mouse.move(box.x+box.width*.4,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.8,box.y+box.height*.5,{steps:8});await page.mouse.up();await page.waitForTimeout(80);const after=await page.locator('#showroom').evaluate(el=>el.toDataURL());check(viewport.width+': garage drag changes rendered perspective',before!==after);
  await page.locator('[data-tab="upgrades"]').click();check(viewport.width+': original nine upgrades retained',await page.locator('#garageWheel .wheel-item').count()===9);
  check(viewport.width+': no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const action=await page.locator('#gAction').boundingBox();check(viewport.width+': garage purchase control fits viewport',action.y+action.height<=viewport.height+1);
  for(const id of ['routeDecision','trailerButton','hornButton'])check(viewport.width+': '+id+' exists',await page.locator('#'+id).count()===1);
  if(process.env.QA_SHOTS){await mkdir(process.env.QA_SHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SHOTS,`garage-${viewport.width}.png`)});}
  // Offline reload must load every new module and texture from the worker.
  await page.evaluate(()=>navigator.serviceWorker.ready);await context.setOffline(true);await page.reload();await page.waitForFunction(()=>!!window.truckinQA?.renderer);check(viewport.width+': complete offline reload',await page.locator('#loadError').isHidden());
  await context.close();
 }
 // The generated single-file native bundle uses the same model and all art.
 const native=await browser.newPage({viewport:{width:390,height:844}});native.on('pageerror',e=>report.errors.push('native: '+e.message));
 await native.goto(base+'/ios/Truckin/web/play.html');await native.waitForFunction(()=>!!window.truckinQA?.renderer);check('generated iOS web bundle boots',await native.locator('#loadError').isHidden());
 check('zero uncaught JavaScript errors',report.errors.length===0);
 report.passed=true;
}catch(error){report.passed=false;report.failure=error.stack;process.exitCode=1;}finally{
 await browser?.close();server.close();if(process.env.BROWSER_TEST_REPORT)await writeFile(process.env.BROWSER_TEST_REPORT,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}
