/* UK-style road signs drawn in code (no image files): red-bordered warning triangles, red-ring prohibition circles, the red No Entry disc,
   blue mandatory circles, blue bus-lane rectangles and white local direction signs. Each is drawn face-on at (x,y), size s, on a short post. */
const TAU=Math.PI*2,RED='#d4141f',BLUE='#0f5fb5',INK='#15171a',WHITE='#fbfbf6';
function post(c,x,y,s){c.fillStyle='#0a1416aa';c.fillRect(x-1,y+s*.42,2,s*.45);}
function tri(c,x,y,s){c.save();c.translate(x,y);c.lineJoin='round';const h=s*.9;c.beginPath();c.moveTo(0,-h*.58);c.lineTo(s*.52,h*.42);c.lineTo(-s*.52,h*.42);c.closePath();c.fillStyle=WHITE;c.fill();c.lineWidth=s*.13;c.strokeStyle=RED;c.stroke();return h;}
const ICONS={
 low(c,s){c.strokeStyle=INK;c.lineWidth=s*.07;c.beginPath();c.moveTo(-s*.2,s*.28);c.lineTo(-s*.2,-s*.02);c.arc(0,-s*.02,s*.2,Math.PI,0);c.lineTo(s*.2,s*.28);c.stroke();c.beginPath();c.moveTo(0,s*.3);c.lineTo(0,s*.02);c.moveTo(-s*.06,s*.08);c.lineTo(0,s*.01);c.lineTo(s*.06,s*.08);c.stroke();},
 works(c,s){c.fillStyle=INK;c.beginPath();c.arc(-s*.1,-s*.14,s*.06,0,TAU);c.fill();c.strokeStyle=INK;c.lineWidth=s*.07;c.lineCap='round';c.beginPath();c.moveTo(-s*.1,-s*.07);c.lineTo(-s*.14,s*.12);c.lineTo(-s*.2,s*.3);c.moveTo(-s*.14,s*.12);c.lineTo(-s*.02,s*.3);c.moveTo(-s*.1,0);c.lineTo(s*.06,s*.08);c.moveTo(s*.06,s*.0);c.lineTo(s*.12,s*.26);c.stroke();c.beginPath();c.moveTo(s*.2,s*.3);c.lineTo(s*.3,s*.12);c.lineTo(s*.4,s*.3);c.closePath();c.fill();},
 slippery(c,s){c.fillStyle=INK;c.beginPath();c.roundRect(-s*.14,-s*.2,s*.28,s*.3,s*.06);c.fill();c.strokeStyle=INK;c.lineWidth=s*.06;c.lineCap='round';for(const dy of[.18,.3]){c.beginPath();c.moveTo(-s*.22,s*dy);c.bezierCurveTo(-s*.1,s*(dy-.07),s*.1,s*(dy+.07),s*.22,s*dy);c.stroke();}},
 peds(c,s){c.strokeStyle=INK;c.fillStyle=INK;c.lineWidth=s*.06;c.lineCap='round';for(const [x,k] of[[-s*.14,1],[s*.14,.8]]){c.beginPath();c.arc(x,-s*.17*k,s*.05*k,0,TAU);c.fill();c.beginPath();c.moveTo(x,-s*.1*k);c.lineTo(x,s*.12);c.lineTo(x-s*.07,s*.3);c.moveTo(x,s*.12);c.lineTo(x+s*.07,s*.3);c.moveTo(x-s*.08,-s*.02);c.lineTo(x+s*.08,-s*.02);c.stroke();}},
 cattle(c,s){c.fillStyle=INK;c.beginPath();c.ellipse(-s*.02,s*.02,s*.2,s*.11,0,0,TAU);c.fill();c.beginPath();c.ellipse(s*.22,-s*.04,s*.07,s*.06,0,0,TAU);c.fill();c.strokeStyle=INK;c.lineWidth=s*.05;c.lineCap='round';for(const x of[-s*.14,-s*.06,s*.08,s*.15]){c.beginPath();c.moveTo(x,s*.08);c.lineTo(x,s*.27);c.stroke();}c.beginPath();c.moveTo(s*.24,-s*.1);c.lineTo(s*.27,-s*.16);c.moveTo(-s*.2,-s*.01);c.lineTo(-s*.28,s*.08);c.stroke();},
 narrow(c,s){c.strokeStyle=INK;c.lineWidth=s*.08;c.lineCap='round';c.beginPath();c.moveTo(-s*.22,s*.3);c.bezierCurveTo(-s*.22,s*.05,-s*.09,s*.05,-s*.09,-s*.18);c.moveTo(s*.22,s*.3);c.bezierCurveTo(s*.22,s*.05,s*.09,s*.05,s*.09,-s*.18);c.stroke();}
};
export function drawSign(c,type,x,y,s=26,o={}){
 c.save();
 if(ICONS[type]){post(c,x,y,s);const h=tri(c,x,y,s);ICONS[type](c,s);c.restore();
  if(o.plate){c.save();c.fillStyle=WHITE;c.strokeStyle=INK;c.lineWidth=1;const w=s*.78,hh=s*.3;c.beginPath();c.roundRect(x-w/2,y+h*.46,w,hh,2);c.fill();c.stroke();c.fillStyle=INK;c.font='800 '+(s*.22)+'px -apple-system,Arial,sans-serif';c.textAlign='center';c.fillText(o.plate,x,y+h*.46+hh*.75);c.restore();}
  return;}
 post(c,x,y,s);c.translate(x,y);
 if(type==='limit'){c.beginPath();c.arc(0,0,s*.5,0,TAU);c.fillStyle=WHITE;c.fill();c.lineWidth=s*.14;c.strokeStyle=RED;c.stroke();c.fillStyle=INK;c.textAlign='center';c.font='900 '+(s*.34)+'px -apple-system,Arial,sans-serif';c.fillText(o.text||'7.5t',0,s*.12);}
 else if(type==='noentry'){c.beginPath();c.arc(0,0,s*.5,0,TAU);c.fillStyle=RED;c.fill();c.fillStyle=WHITE;c.fillRect(-s*.34,-s*.07,s*.68,s*.14);}
 else if(type==='arrow'){c.beginPath();c.arc(0,0,s*.5,0,TAU);c.fillStyle=BLUE;c.fill();c.strokeStyle=WHITE;c.lineWidth=s*.04;c.stroke();c.rotate(o.dir<0?-.6:o.dir>0?.6:0);c.fillStyle=WHITE;c.beginPath();c.moveTo(0,-s*.34);c.lineTo(s*.24,-s*.04);c.lineTo(s*.09,-s*.04);c.lineTo(s*.09,s*.3);c.lineTo(-s*.09,s*.3);c.lineTo(-s*.09,-s*.04);c.lineTo(-s*.24,-s*.04);c.closePath();c.fill();}
 else if(type==='bus'){const w=s*1.05,h=s*.8;c.fillStyle=BLUE;c.beginPath();c.roundRect(-w/2,-h/2,w,h,3);c.fill();c.strokeStyle=WHITE;c.lineWidth=1.2;c.stroke();c.fillStyle=WHITE;c.beginPath();c.roundRect(-s*.26,-s*.2,s*.52,s*.3,3);c.fill();c.fillStyle=BLUE;c.fillRect(-s*.2,-s*.15,s*.4,s*.09);c.fillStyle=WHITE;c.font='800 '+(s*.15)+'px -apple-system,Arial,sans-serif';c.textAlign='center';c.fillText('BUS LANE',0,s*.3);}
 else{ // direction / information sign: white, black text, thin black border (UK non-primary style)
  const lines=o.lines||[o.text||''],w=Math.max(s*1.2,Math.max(...lines.map(t=>t.length))*s*.17+s*.5),h=s*.28*lines.length+s*.3;c.fillStyle=WHITE;c.strokeStyle=INK;c.lineWidth=1.4;c.beginPath();c.roundRect(-w/2,-h/2,w,h,3);c.fill();c.stroke();
  c.fillStyle=INK;c.textAlign='center';c.font='800 '+(s*.23)+'px -apple-system,Arial,sans-serif';lines.forEach((t,i)=>c.fillText(t,0,-h/2+s*.35+i*s*.28));}
 c.restore();
}
