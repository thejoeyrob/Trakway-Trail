/* Deterministic lane-specific rolling road encounters. No static pre-scripted sequence.
   Scenarios change with the seeded session; at least two of five lanes remain open.
   All world positions are measured in the same units as Drive.items. */
const choice=(rng,values)=>values[Math.floor(rng()*values.length)];
export const SCENARIO_NAMES=['narrow','split','contraflow','oneway','works','bus','chicane'];
export function chooseRoadScenario(rng,z,previous='',difficulty=0){
 const allowed=difficulty>=.18?SCENARIO_NAMES:SCENARIO_NAMES.filter(n=>n!=='chicane');
 const options=allowed.filter(n=>n!==previous);
 const name=choice(rng,options);
 const side=rng()<.5?0:4;
 const fromEdge=side===0?[0,1]:[4,3];
 const width=rng()<.6?1:2;
 const p=[];
 const section=(type,lane,at=z,length=340)=>p.push({type,lane,z:at,length,warning:620});
 const vehicle=(lane,at=z+175)=>p.push({type:'car',lane,z:at,oncoming:true});
 switch(name){
  case 'narrow':section('grass',0);section('grass',4);break;
  case 'split':section('works',2);section('noentry',rng()<.5?1:3);break;
  case 'contraflow':section('noentry',side);vehicle(side);if(width===2)section('noentry',fromEdge[1]);break;
  case 'oneway':for(const lane of fromEdge)section('noentry',lane);break;
  case 'works':section('works',choice(rng,[1,2,3]));section('narrow',side,z+95,175);break;
  case 'bus':section('bus',side);if(width===2)section('noentry',fromEdge[1],z+115,190);break;
  case 'chicane':{
   const pivot=choice(rng,[1,2,3]);section('works',pivot,z,170);
   const next= pivot===1?3:pivot===3?1:choice(rng,[0,4]);
   section('narrow',next,z+210,170);break;
  }
 }
 // Never emit a complete full-width blockade, even at max difficulty.
 const lanes=new Set(p.filter(e=>e.length).map(e=>e.lane));
 if(lanes.size>3)throw Error('Scenario blocks too many lanes');
 return {name,items:p};
}
