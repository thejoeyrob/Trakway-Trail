// Zero-dependency static server for local play/testing: `npm run dev` -> http://localhost:8080
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','public');
const port=Number(process.env.PORT)||8080;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.wav':'audio/wav','.mp3':'audio/mpeg'};
createServer(async(req,res)=>{
 try{
  let p=decodeURIComponent(new URL(req.url,'http://x').pathname);if(p==='/')p='/play.html';
  const file=path.join(root,p);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(!(await stat(file)).isFile())throw Error();
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(await readFile(file));
 }catch{res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found');}
}).listen(port,()=>console.log(`Truckin' & Drivin' -> http://localhost:${port}`));
