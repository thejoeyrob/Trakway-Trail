export const CATALOG=[
 ['stability','STEADY EDDIE','Trailer stabiliser: sway settles 20% faster per level.',350,10],
 ['suspension','AIR-RIDE','Air suspension: 8% less trailer angle per level.',450,10],
 ['steering','QUICK HANDS','Better wheel: steering response 12% quicker per level.',400,9],
 ['lights','SEE EWE LATER','LED lightbar: 65 metres more visibility per level.',500,7],
 ['exhaust','BIG PIPES','Chrome stacks: 5% more coin earnings per level.',550,2],
 ['washroom','ENSUITE SUITE','Sleeper washroom: +£20 per taco break per level.',650,3],
 ['bunk','SLEEP LIKE A LOG','Better bunk: rested handling and 3% delivery bonus per level.',550,8],
 ['insurance','MATES’ RATES','Damage insurance: 12% smaller fines per level. Level 3 adds a once-per-shift bail-out from a crash (£400 excess).',350,11],
 ['horn','THE BIG TOOT','Air horn: 0.16 second more sheep-reaction time per level.',350,0]
].map(([id,name,description,cost,icon])=>({id,name,description,cost,icon}));
export const defaults=()=>Object.fromEntries(CATALOG.map(u=>[u.id,0]));
export const normalize=(v={})=>Object.fromEntries(CATALOG.map(u=>[u.id,Math.min(3,Math.max(0,Math.floor(Number(v?.[u.id])||0)))]));
export const DECALS=[{id:0,name:'FACTORY',cost:0,icon:null},{id:1,name:'GOLD WINGS',cost:700,icon:4},{id:2,name:'HOT HAUL',cost:900,icon:5},{id:3,name:'FLOCK ROYALTY',cost:1100,icon:6}];
export const deliveryBonus=(u,truck,decal)=>u.bunk*.03+(truck===2?.02:truck===3?.04:0)+(decal>0?.02:0);
