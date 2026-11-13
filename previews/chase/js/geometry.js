// Rolling road patch v1.5 — same atlas boundaries as the five-lane rendered road.
const THEME_SEQUENCE=[0,1,2,3];
export function roadTheme(z){const sector=Math.floor(Math.max(0,z)/5400);for(let n=THEME_SEQUENCE.length;n<=sector;n++){let x=Math.imul(n^0x9e3779b9,0x85ebca6b)>>>0;x=(x^(x>>>16))>>>0;THEME_SEQUENCE.push((THEME_SEQUENCE[n-1]+1+x%3)%4);}return THEME_SEQUENCE[sector];}
// Road geometry is now independent from the five fixed steering positions.
export function roadShape(z){return {width:368/.56,stage:roadTheme(z)};}
export function roadCurve(z){return 0;}
export function laneX(lane,z){return 54+78*lane;}
/* The rig is drawn 1.3x bigger than the first build so it sits properly on the wider roads.
   RIG holds the shared size + collision numbers (collision is a touch smaller than the art, so it stays fair). */
export const RIG={S:1.3,cabW:64,cabL:119,trailerW:61,trailerL:151,flatW:60,flatL:138,cabHX:21,cabHZ:28,trHX:22,trHZ:64};
export function rigPose(x,y,cabAngle,trailerAngle,rearAngle){
 const S=RIG.S,back=(p,d,a)=>({x:p.x-Math.sin(a)*d,y:p.y+Math.cos(a)*d});
 // 5th wheel is behind, not inside the tractor cab; both trailers rotate about connected hitches.
 const hitch=back({x,y},34*S,cabAngle);
 const trailer={...back(hitch,38*S,trailerAngle),angle:trailerAngle};
 const rearHitch=back(hitch,101*S,trailerAngle);
 const rear={...back(rearHitch,45*S,rearAngle),angle:rearAngle};
 return {hitch,trailer,rearHitch,rear};
}
