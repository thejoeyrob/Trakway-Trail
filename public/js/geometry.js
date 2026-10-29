export function roadShape(z){const stage=Math.max(0,Math.floor(Math.max(0,z)/5400))%4;const width=stage===1?610:630;return {width,stage};}
export function roadCurve(z){return Math.sin(z/650)*23+Math.sin(z/1600)*12;}
export function laneX(lane,z){const width=roadShape(z).width;return 210+roadCurve(z)+(lane-2)*width*(280/627)/5;}
export function rigPose(x,y,cabAngle,trailerAngle,rearAngle){
 const back=(p,d,a)=>({x:p.x-Math.sin(a)*d,y:p.y+Math.cos(a)*d});
 // 5th wheel is behind, not inside the tractor cab; both trailers rotate about connected hitches.
 const hitch=back({x,y},34,cabAngle);
 const trailer={...back(hitch,38,trailerAngle),angle:trailerAngle};
 const rearHitch=back(hitch,101,trailerAngle);
 const rear={...back(rearHitch,45,rearAngle),angle:rearAngle};
 return {hitch,trailer,rearHitch,rear};
}
