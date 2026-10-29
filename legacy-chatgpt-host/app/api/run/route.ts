import { env } from 'cloudflare:workers';
export async function POST(req: Request) {
 try {
  const origin=req.headers.get('origin');
  if(origin && origin!==new URL(req.url).origin) return Response.json({error:'Invalid origin'},{status:403});
  const b=await req.json() as Record<string,unknown>;
  if(typeof b.player!=='string'||!/^[-\w]{8,80}$/.test(b.player)) return Response.json({error:'Invalid player'},{status:400});
  if(!env.DB) return Response.json({error:'Leaderboard unavailable'},{status:503});
  const player=req.headers.get('oai-authenticated-user-id')||b.player;
  const recent=await env.DB.prepare('SELECT COUNT(*) AS n FROM runs WHERE player=? AND started>?').bind(player,Date.now()-60000).first<{n:number}>();
  if((recent?.n||0)>8) return Response.json({error:'Take a breather before your next shift.'},{status:429});
  const id=crypto.randomUUID(), mode=b.mode==='daily'?'daily':'endless';
  await env.DB.prepare('INSERT INTO runs(id,player,started,mode) VALUES(?,?,?,?)').bind(id,player,Date.now(),mode).run();
  return Response.json({id},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Unable to start online run'},{status:503});}
}
