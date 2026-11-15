export const CATALOG=[
 ['engine','TURBO DIESEL','Bigger engine: +5% top speed per level, and a heavy double trailer drags you far less (full pace at level 3).',1100,1],
 ['stability','STEADY EDDIE','Trailer stabiliser: sway settles 20% faster per level.',700,10],
 ['suspension','AIR-RIDE','Air suspension: 8% less trailer angle per level.',800,10],
 ['steering','QUICK HANDS','Better wheel: steering response 12% quicker per level.',750,9],
 ['lights','SEE EWE LATER','Light bar: at night every level throws the headlight beams much further up the road. Standard lights show only a short stretch.',900,7],
 ['exhaust','BIG PIPES','Chrome stacks: 5% more coin earnings per level.',1200,2],
 ['washroom','ENSUITE SUITE','Sleeper washroom: +£20 per taco break per level.',1000,3],
 ['bunk','SLEEP LIKE A LOG','Better bunk: rested handling and 3% delivery bonus per level.',1100,8],
 ['insurance','MATES’ RATES','Damage insurance: 12% smaller fines per level. Level 3 adds a once-per-shift bail-out from a crash (£400 excess).',900,11],
 ['horn','THE BIG TOOT','Air horn: 0.16 second more sheep-reaction time per level.',700,0]
].map(([id,name,description,cost,icon])=>({id,name,description,cost,icon}));
export const defaults=()=>Object.fromEntries(CATALOG.map(u=>[u.id,0]));
export const normalize=(v={})=>Object.fromEntries(CATALOG.map(u=>[u.id,Math.min(3,Math.max(0,Math.floor(Number(v?.[u.id])||0)))]));
/* Paint styles are shared by the cab and the trailer: unlock one and either can wear it (or both). Trailer default is white. */
export const TRUCKS=[
 {id:1,name:'ARCTIC WHITE',desc:'Clean, crisp and entirely forgettable. The trailer’s factory colour.',cost:0,bonus:0},
 {id:0,name:'THE OLD FAITHFUL',desc:'Your trusty turquoise mile muncher.',cost:0,bonus:0},
 {id:2,name:'THE TANGERINE DREAM',desc:'Sunset paint · +2% delivery earnings.',cost:2500,bonus:2},
 {id:3,name:'THE NIGHT SHIFT',desc:'Midnight purple · +4% delivery earnings.',cost:6000,bonus:4},
 {id:4,name:'POST HASTE',desc:'Pillar-box red. Stops traffic and fits through letterboxes. Not really.',cost:3500,bonus:2},
 {id:5,name:'RACING GREEN',desc:'Proper British green · for drivers with taste and a flat cap.',cost:4500,bonus:3}
];
/* Roof graphics, drawn as vector art clipped to the cab and trailer roofs (see rigart.js). */
export const DECALS=[
 {id:0,name:'FACTORY',cost:0},
 {id:1,name:'GOLD WINGS',cost:1500},
 {id:2,name:'HOT HAUL',cost:2000},
 {id:3,name:'FLOCK ROYALTY',cost:2500}
];
export const DECAL_TAGS=['Factory finish. Honest and humble.','Golden wings for a golden driver. +2% on deliveries.','Flames on a lorry. Speed not included. +2% on deliveries.','Flock Royalty: the sheep approve. +2% on deliveries.'];
export const PAINT_IDS=TRUCKS.map(t=>t.id);
export const DECAL_IDS=DECALS.map(d=>d.id);
export const deliveryBonus=(u,truck,decal)=>u.bunk*.03+((TRUCKS.find(t=>t.id===truck)?.bonus)||0)/100+(decal>0?.02:0);
export const STATS={
 engine:{label:'TOP SPEED',f:l=>l?'+'+l*5+'%':'stock'},
 stability:{label:'SWAY SETTLES',f:l=>l?l*20+'% faster':'stock'},
 suspension:{label:'TRAILER ANGLE',f:l=>l?l*8+'% less':'stock'},
 steering:{label:'STEERING SNAP',f:l=>l?l*12+'% quicker':'stock'},
 lights:{label:'NIGHT VISION',f:l=>l?'+'+l*65+' m':'stock'},
 exhaust:{label:'COIN PAY',f:l=>l?'+'+l*5+'%':'stock'},
 washroom:{label:'TACO BREAK PAY',f:l=>'£'+(100+l*20)},
 bunk:{label:'DELIVERY BONUS',f:l=>l?'+'+l*3+'%':'stock'},
 insurance:{label:'FINES',f:l=>l?l*12+'% smaller'+(l>=3?' + bail-out':''):'full price'},
 horn:{label:'HORN WINDOW',f:l=>(.75+l*.16).toFixed(2)+' s'}
};

/* Upgrade prices rise steeply: level 1 costs the listed price, level 2 about three times that and level 3 about eight times. A typical shift earns around £3,000, so the first level of anything is a shift or two, and a fully loaded rig takes dozens of shifts. */
export const LEVEL_MULT=[1,3.2,8];
export const upgradePrice=(base,level)=>Math.round(base*LEVEL_MULT[Math.min(2,Math.max(0,level))]/50)*50;
