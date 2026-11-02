// Rolling road patch v1.5 — same atlas boundaries as the five-lane rendered road.
const THEME_SEQUENCE=[0,1,2,3];
export function roadTheme(z){const sector=Math.floor(Math.max(0,z)/5400);for(let n=THEME_SEQUENCE.length;n<=sector;n++){let x=Math.imul(n^0x9e3779b9,0x85ebca6b)>>>0;x=(x^(x>>>16))>>>0;THEME_SEQUENCE.push((THEME_SEQUENCE[n-1]+1+x%3)%4);}return THEME_SEQUENCE[sector];}
export function roadShape(z){const stage=roadTheme(z);const width=stage===1?610:630;return {width,stage};}
export function roadCurve(z){return Math.sin(z/650)*23+Math.sin(z/1600)*12;}
export function laneX(lane,z){const width=roadShape(z).width;return 210+roadCurve(z)+(lane-2)*width*.56/5;}
export function rigPose(x,y,cabAngle,trailerAngle,rearAngle){
 const back=(p,d,a)=>({x:p.x-Math.sin(a)*d,y:p.y+Math.cos(a)*d});
 // 5th wheel is behind, not inside the tractor cab; both trailers rotate about connected hitches.
 const hitch=back({x,y},34,cabAngle);
 const trailer={...back(hitch,38,trailerAngle),angle:trailerAngle};
 const rearHitch=back(hitch,101,trailerAngle);
 const rear={...back(rearHitch,45,rearAngle),angle:rearAngle};
 return {hitch,trailer,rearHitch,rear};
}
