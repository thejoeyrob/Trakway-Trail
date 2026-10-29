import { env } from 'cloudflare:workers';
export async function GET(req: Request) {
 if(!env.DB) return Response.json({error:'Leaderboard unavailable'},{status:503});
 try{
  const daily=new URL(req.url).searchParams.get('mode')==='daily';
  const since=daily?new Date(new Date().toISOString().slice(0,10)+'T00:00:00Z').getTime():0;
  const r=await env.DB.prepare("SELECT nickname, MAX(score) AS score, MAX(distance) AS distance, MAX(jobs) AS jobs FROM runs WHERE finished>? AND score IS NOT NULL "+(daily?"AND mode='daily' ":"")+"GROUP BY player ORDER BY score DESC LIMIT 20").bind(since).all();
  return Response.json({scores:r.results,scope:daily?'daily':'all'},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Leaderboard unavailable'},{status:503});}
}
export async function POST(req: Request) {
 try{
  if(!env.DB) return Response.json({error:'Leaderboard unavailable'},{status:503});
  const origin=req.headers.get('origin');
  if(origin&&origin!==new URL(req.url).origin)return Response.json({error:'Invalid origin'},{status:403});
  const b=await req.json() as Record<string,any>;
  if(typeof b.id!=='string'||typeof b.player!=='string'||typeof b.nickname!=='string')return Response.json({error:'Invalid result'},{status:400});
  const run=await env.DB.prepare('SELECT * FROM runs WHERE id=?').bind(b.id).first<{started:number,finished:number|null,player:string}>();
  const player=req.headers.get('oai-authenticated-user-id')||b.player;
  if(!run||run.player!==player||run.finished)return Response.json({error:'This run has already ended'},{status:409});
  const elapsed=(Date.now()-run.started)/1000;
  if(!Number.isInteger(b.score)||b.score<0||b.score>Math.min(1000000,elapsed*125+1000)||!Number.isInteger(b.distance)||b.distance<0||b.distance>elapsed*50+100||!Number.isInteger(b.jobs)||b.jobs<0||b.jobs>elapsed/4+1)return Response.json({error:'Run could not be verified'},{status:400});
  const nickname=b.nickname.replace(/[^a-zA-Z0-9 _.-]/g,'').trim().slice(0,16)||'Road legend';
  await env.DB.prepare('UPDATE runs SET finished=?,nickname=?,score=?,distance=?,jobs=? WHERE id=? AND finished IS NULL').bind(Date.now(),nickname,b.score,b.distance,b.jobs,b.id).run();
  return Response.json({saved:true});
 }catch{return Response.json({error:'Could not save online. Your score is saved on this device.'},{status:503});}
}
