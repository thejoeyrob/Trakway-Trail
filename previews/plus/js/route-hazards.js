/* Sprite footprint and collision footprint are authored together. World-space
 * metres are deliberately arcade units. No road pixels determine collision. */
export const HAZARD_SPECS={
 car:{width:42,height:68,hitWidth:34,hitHeight:54,effect:'crash',sprite:4,sheet:'sprites'},
 cone:{width:54,height:50,hitWidth:32,hitHeight:30,effect:'fine',sprite:6,sheet:'sprites'},
 barrier:{width:64,height:34,hitWidth:52,hitHeight:24,effect:'fine',sprite:5,sheet:'routeProps'},
 works:{width:68,height:88,hitWidth:46,hitHeight:65,effect:'fine',sprite:4,sheet:'routeProps'},
 pit:{width:70,height:82,hitWidth:48,hitHeight:60,effect:'fine',sprite:6,sheet:'routeProps'},
 mud:{width:72,height:146,hitWidth:60,hitHeight:120,effect:'grip',sprite:8,sheet:'routeProps'},
 oil:{width:65,height:87,hitWidth:46,hitHeight:62,effect:'crash',sprite:9,sheet:'routeProps'},
 house:{width:80,height:110,hitWidth:60,hitHeight:78,effect:'crash',sprite:0,sheet:'routeProps'},
 footpath:{width:69,height:112,hitWidth:54,hitHeight:82,effect:'fine',sprite:10,sheet:'routeProps'},
 lowbridge:{width:77,height:148,hitWidth:58,hitHeight:45,effect:'crash',sprite:0,sheet:'terrain'},
 weakbridge:{width:77,height:148,hitWidth:58,hitHeight:90,effect:'crash',sprite:1,sheet:'terrain'},
 narrow:{width:72,height:145,hitWidth:52,hitHeight:60,effect:'fine',sprite:4,sheet:'terrain'},
 bus:{width:72,height:160,hitWidth:58,hitHeight:120,effect:'fine',sprite:2,sheet:'terrain'},
 noentry:{width:72,height:160,hitWidth:58,hitHeight:120,effect:'fine',sprite:3,sheet:'terrain'},
 grass:{width:72,height:145,hitWidth:60,hitHeight:100,effect:'grip-fine',sprite:8,sheet:'routeProps'},
 // Hand-drawn (see propart.js). Cow and ice-cream van end the shift; honking shoos cows and geese away in time.
 cow:{width:60,height:96,hitWidth:46,hitHeight:70,effect:'crash',draw:'cow',sheet:'draw'},
 tractor:{width:62,height:108,hitWidth:50,hitHeight:88,effect:'fine',draw:'tractor',sheet:'draw'},
 haybale:{width:64,height:58,hitWidth:52,hitHeight:46,effect:'fine',draw:'haybale',sheet:'draw'},
 icecream:{width:60,height:112,hitWidth:48,hitHeight:94,effect:'crash',draw:'icecream',sheet:'draw'},
 geese:{width:68,height:64,hitWidth:54,hitHeight:48,effect:'fine',draw:'geese',sheet:'draw'}
};
export const PICKUP_SPECS={hitch:{sprite:13,sheet:'routeProps',width:45,height:45},prize:{sprite:12,sheet:'routeProps',width:40,height:40},shield:{draw:'horseshoe',width:46,height:46}};
export function sweptOverlap(a0,a1,half,e0,e1){return Math.max(a0,a1)+half>=e0&&Math.min(a0,a1)-half<=e1;}
