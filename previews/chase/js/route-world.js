/* Route World 2.0. Distances and polygons are the shared source of truth for
 * artwork, signs, spawning and wheel contact. Five INPUT positions are retained;
 * they are fixed across the screen, not five permanently open road lanes. */
import {roadTheme} from './geometry.js';
export const ROUTE_VERSION=2;
export const CHUNK_LENGTH=2600;
export const MOTIFS=['s-bend','farm-fork','estate-fork','roadworks','village','contraflow','river-bend'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
export function hash(n,seed=1){let x=Math.imul((n|0)^(seed|0),0x45d9f3b);x=Math.imul(x^(x>>>16),0x45d9f3b);return (x^(x>>>16))>>>0;}
export function steeringX(lane){return 54+78*lane;}
const routeCache=new Map();
export function routeSpec(index,seed=1){
 index=Math.max(0,index|0);const key=seed+':'+index;
 if(routeCache.has(key))return routeCache.get(key);
 // A shuffled bag per seven sections: no fixed loop and no adjacent repeats.
 const cycle=Math.floor(index/MOTIFS.length),bag=MOTIFS.slice();
 for(let i=bag.length-1;i>0;i--){const j=hash(cycle*19+i,seed)%(i+1);[bag[i],bag[j]]=[bag[j],bag[i]];}
 if(cycle===0){const first=bag.indexOf('s-bend');[bag[0],bag[first]]=[bag[first],bag[0]];}
 if(cycle>0){const prev=routeSpec(cycle*MOTIFS.length-1,seed).motif;if(bag[0]===prev)[bag[0],bag[1]]=[bag[1],bag[0]];}
 const motif=bag[index%bag.length];
 const side=hash(index+103,seed)%2?1:-1;
 const restricted=hash(index+401,seed)%2?'left':'right';
 const s={id:index,start:index*CHUNK_LENGTH,end:(index+1)*CHUNK_LENGTH,motif,side,restricted,
  prizeSide:restricted,signZ:index*CHUNK_LENGTH+330,decisionZ:index*CHUNK_LENGTH+760};
 routeCache.set(key,s);if(routeCache.size>256)routeCache.delete(routeCache.keys().next().value);
 return s;
}
export function roadAt(z,seed=1){
 z=Math.max(0,z);const s=routeSpec(Math.floor(z/CHUNK_LENGTH),seed),p=z-s.start;
 const gate=smooth((p-500)/440)*smooth((2480-p)/440),wave=Math.sin((p-500)/1900*Math.PI*2);
 const band=(centre,width,surface='asphalt',rule='',branch='main')=>({left:centre-width/2,right:centre+width/2,surface,rule,branch});
 let bands=[],sign=null;
 switch(s.motif){
  case 'farm-fork':case 'estate-fork':case 'contraflow':{
   for(const branch of ['left','right']){const side=branch==='left'?-1:1,restricted=branch===s.restricted;
    const rule=restricted?(s.motif==='estate-fork'?'access':s.motif==='contraflow'?'oneway':''):'';
    const surface=restricted&&s.motif==='farm-fork'?'mud':'asphalt';
    bands.push(band(210+side*110*gate,mix(368,140,gate),gate>.65?surface:'asphalt',gate>.82?rule:'',branch));
   }
   sign={left:s.restricted==='left'?(s.motif==='farm-fork'?'MUD • BONUS':s.motif==='estate-fork'?'ACCESS • £90':'NO ENTRY • £120'):'MAIN ROAD',right:s.restricted==='right'?(s.motif==='farm-fork'?'MUD • BONUS':s.motif==='estate-fork'?'ACCESS • £90':'NO ENTRY • £120'):'MAIN ROAD'};
   break;
  }
  case 'roadworks':bands=[band(210+s.side*76*gate,mix(368,218,gate))];sign={text:s.side<0?'WORKS • KEEP LEFT':'WORKS • KEEP RIGHT'};break;
  case 'village':bands=[band(210+s.side*65*gate,mix(368,228,gate))];sign={text:'VILLAGE • NARROW ROAD'};break;
  case 'river-bend':bands=[band(210+s.side*70*gate,mix(368,224,gate))];sign={text:s.side<0?'RIVER BEND • LEFT':'RIVER BEND • RIGHT'};break;
  default:bands=[band(210+wave*64*gate,mix(368,236,gate))];sign={text:'BENDS • FOLLOW THE ROAD'};
 }
 return {...s,p,gate,bands,sign};
}
export function surfaceAt(x,z,seed=1,halfWidth=0){
 const r=roadAt(z,seed),matches=r.bands.filter(b=>x-halfWidth>=b.left&&x+halfWidth<=b.right);
 if(!matches.length)return {surface:'verge',rule:'',branch:'outside',onRoad:false,route:r};
 const b=matches.find(b=>!b.rule&&b.surface==='asphalt')||matches[0];
 return {...b,onRoad:true,route:r};
}
export function routeLanes(z,seed=1,{legal=false,margin=23}={}){
 return [0,1,2,3,4].filter(l=>{const x=steeringX(l),s=surfaceAt(x,z,seed,margin),r=s.route;
  const approachingRestriction=legal&&['estate-fork','contraflow'].includes(r.motif)&&r.gate>.1&&(r.restricted==='left'?x<210:x>210);
  return s.onRoad&&(!legal||!s.rule)&&!approachingRestriction;
 });
}
export function laneCorridor(z0,z1,seed=1,legal=false){
 return [0,1,2,3,4].filter(l=>{for(let z=z0;z<=z1;z+=45)if(!routeLanes(z,seed,{legal}).includes(l))return false;return routeLanes(z1,seed,{legal}).includes(l);});
}
export function nearestLane(z,preferred=2,seed=1,legal=true){
 const lanes=routeLanes(z,seed,{legal});return lanes.sort((a,b)=>Math.abs(a-preferred)-Math.abs(b-preferred))[0]??2;
}
/* Plan reward trails backwards from the finish. A greedy next pickup could
 * otherwise lead into the wrong branch just as a restriction starts. */
export function rewardPath(positions,startLane,seed=1,rng=()=>.5){
 const valid=positions.map(z=>routeLanes(z,seed,{legal:true})),viable=valid.map(()=>[]);
 viable[viable.length-1]=valid.at(-1);
 for(let i=positions.length-2;i>=0;i--)viable[i]=valid[i].filter(l=>viable[i+1].some(n=>Math.abs(n-l)<=1));
 let lane=startLane;return viable.map((choices,i)=>{let possible=choices.filter(l=>Math.abs(l-lane)<=1);if(!possible.length)possible=choices.length?choices:valid[i];
  possible.sort((a,b)=>Math.abs(a-lane)-Math.abs(b-lane));const near=possible.filter(l=>Math.abs(l-lane)<=1);lane=(near.length?near:possible)[Math.floor(rng()*(near.length||possible.length))]??nearestLane(positions[i],lane,seed);return lane;
 });
}
/* A cheap, deterministic reachability check. Dynamic traffic is reserved as a
 * whole corridor. Includes a 150-unit trailer clearance and steering lead time. */
export function reachableCorridor(items,z0,z1,seed=1,start=[0,1,2,3,4],maxSpeed=530){
 const step=150;let reachable=new Set(start);
 for(let z=z0;z<=z1;z+=step){const open=routeLanes(z,seed,{legal:true}).filter(l=>!items.some(e=>!e.done&&!e.collectible&&e.lane===l&&e.z-80<=z&&e.z+(e.length||45)+150>=z));
  const next=new Set(open.filter(l=>[...reachable].some(p=>Math.abs(p-l)<=1&&step/maxSpeed>=.22)));
  if(!next.size)return false;reachable=next;
 }
 return true;
}
export function routeWarning(distance,seed=1){const index=Math.floor(Math.max(0,distance)/CHUNK_LENGTH),r=roadAt(index*CHUNK_LENGTH+900,seed);if(distance-r.start<1100)return {...r.sign,distance:Math.max(0,Math.round((r.decisionZ-distance)/10)),id:r.id};return null;}
/* Outermost edge of the road on one side over the whole length of a prop, so a prop never overhangs the carriageway on a bend. */
export function roadEdge(z,side,seed=1,span=62){let o=side<0?Infinity:-Infinity;for(const dz of[-span,-span/2,0,span/2,span]){const a=roadAt(z+dz,seed),v=side<0?Math.min(...a.bands.map(b=>b.left)):Math.max(...a.bands.map(b=>b.right));o=side<0?Math.min(o,v):Math.max(o,v);}return o;}
/* Side of the road with water at a river bend (props are not placed on the water). */
export const waterSide=a=>a.motif==='river-bend'&&a.gate>.4?-a.side:0;
export function sceneryProps(z0,z1,seed=1){
 const props=[];for(let n=Math.floor(z0/210);n<=Math.ceil(z1/210);n++){
  if(n<0)continue;const z=n*210+hash(n+123,seed)%70,a=roadAt(z,seed),stage=roadTheme(z);
  for(const side of [-1,1]){if(waterSide(a)===side)continue;const outer=roadEdge(z,side,seed);
   const sprite=stage===0||stage===2?(hash(n+side,seed)%3===0?1:0):stage===3?[4,7,2][hash(n+side,seed)%3]:1;
   const width=sprite===1?92:91,height=sprite===0?109:sprite===4?125:87;
   const variant=hash(n+side+880,seed)%4;
   const detailed=stage===1?variant===3:variant!==0&&sprite!==1;
   const scenic=stage===0?[0,7,0,1][variant]:stage===1?2:stage===2?3:[4,1,4,1][variant];
   props.push({id:n+':'+side,x:outer+side*(width*.51+12),z,sprite:detailed?scenic:sprite,sheet:detailed?'routeScenery':'routeProps',width,height,hitWidth:sprite===0?60:38,hitHeight:sprite===0?70:45,effect:stage===1&&detailed?'house':sprite===0||sprite===2?'house':'fine'});
  }
  if(a.bands.length===2&&a.bands[1].left-a.bands[0].right>60)props.push({id:n+':island',x:210,z,sprite:a.motif==='estate-fork'?0:5,sheet:a.motif==='estate-fork'?'routeProps':'routeScenery',width:67,height:83,hitWidth:44,hitHeight:56,effect:a.motif==='estate-fork'?'house':'fine'});
 }
 return props;
}

/* Decorative scenery for the extra width on iPads and the tall-phone preview: further rows of the same painted houses, trees and
   hedges, set back from the verge. No collision; purely to carry the world out to the screen edges. */
export function sideProps(z0,z1,seed=1,pad=0){
 const props=[];if(pad<2)return props;
 const cols=Math.ceil(pad/118);
 for(let n=Math.floor(z0/260);n<=Math.ceil(z1/260);n++){if(n<0)continue;
  for(const side of[-1,1])for(let col=0;col<cols;col++){
   const h=hash(n*7+col*131+(side>0?977:13),seed+51),z=n*260+(h%140);
   const a=roadAt(z,seed),stage=roadTheme(z),outer=roadEdge(z,side,seed,70);if(waterSide(a)===side)continue;
   const roll=h>>>8&7;if(col>0&&roll<2)continue;   // gaps, so the rows look natural
   const treeish=roll>=5||stage===1;
   const sprite=treeish?1:stage===3?[4,7,2][roll%3]:0,sheet='routeProps';
   const width=sprite===1?96:sprite===0?91:95,height=sprite===0?109:sprite===4?125:90;
   const detailed=!treeish&&roll===3,scenic=stage===0?[0,7,0,1][roll%4]:stage===2?3:stage===3?4:2;
   props.push({id:n+':'+side+':'+col,x:outer+side*(60+col*118+(h>>>12&15)),z,sprite:detailed?scenic:sprite,sheet:detailed?'routeScenery':sheet,width,height});
  }
 }
 return props;
}
