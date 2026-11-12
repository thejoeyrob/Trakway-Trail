export class Sound {
 constructor(settings){this.settings=settings;this.ctx=null;this.buffers={};this.active=[];this.ready=false;this.loading=null;this.music=null;this.musicOffset=0;this.musicStarted=0;this.suspended=false;this.menuWanted=false;this.menu=null;this.revSrc=null;this.timers=[];}
 init(){if(this.ctx)return;this.ctx=new (window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=.8;const comp=this.ctx.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=3;this.master.connect(comp);comp.connect(this.ctx.destination);this.musicGain=this.ctx.createGain();this.musicGain.connect(this.master);}
 /* Create the context and decode everything before the first tap, so the ignition fires the instant the player taps. */
 preload(){try{this.init();if(!this.loading)this.loading=this.load();}catch{}return this.loading;}
 /* iOS treats Web Audio as "ambient" and mutes it when the silent switch is on. Declaring a playback session (Safari 16.4+) and running a silent <audio> element (older iOS) makes it behave like a media app. Must run inside a tap. */
 bypassMute(){try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch{}try{if(!this.keepAlive){const a=document.createElement('audio');a.setAttribute('playsinline','');a.setAttribute('x-webkit-airplay','deny');a.loop=true;a.preload='auto';a.src='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';this.keepAlive=a;}this.keepAlive.play()?.catch(()=>{});}catch{}}
 async unlock(){try{this.bypassMute();this.init();const resumed=this.ctx.resume();if(!this.loading)this.loading=this.load();await resumed;await this.loading;return true;}catch{return false;}}
 async load(){await Promise.all(['roadtrip','menumusic','ignition','idle','rev','cash','crumb','pickup','delivery','horn','sheep','flush','brake','click','scatter','bonus','moo','chime','morris','cyclebell','clang','splat','shield','shieldbreak','goose','jweds-jingle'].map(async name=>{try{let bytes;if(window.TRUCKIN_AUDIO_DATA?.[name]){let b=atob(window.TRUCKIN_AUDIO_DATA[name]);bytes=Uint8Array.from(b,c=>c.charCodeAt(0)).buffer;}else{let r=await fetch('./audio/'+name+(['roadtrip','menumusic','jweds-jingle'].includes(name)?'.mp3':'.wav'));if(!r.ok)return;bytes=await r.arrayBuffer();}this.buffers[name]=await this.ctx.decodeAudioData(bytes);}catch{}}));this.ready=true;}
 /* opts: rate (pitch/speed), pan (-1..1), delay (seconds). The sound is routed through a panner so flocks and bells can sit left/right. */
 play(name,volume=1,opts={}){if(!this.ctx||!this.buffers[name]||this.settings.sfx<=0||this.suspended)return;
  const gains={ignition:.55,rev:.46,'jweds-jingle':.7,cash:.45,crumb:.2,pickup:.5,delivery:.5,horn:.44,sheep:.6,flush:.48,brake:.5,click:.34,scatter:.5,bonus:.42,moo:.62,chime:.4,morris:.42,cyclebell:.46,clang:.56,splat:.52,shield:.46,shieldbreak:.5,goose:.5};
  const s=this.ctx.createBufferSource();s.buffer=this.buffers[name];if(opts.rate)s.playbackRate.value=opts.rate;const g=this.ctx.createGain();g.gain.value=(gains[name]||.4)*this.settings.sfx*volume;
  let tail=g;if(opts.pan&&this.ctx.createStereoPanner){const p=this.ctx.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,opts.pan));g.connect(p);tail=p;}
  s.connect(g);tail.connect(this.master);s.start(this.ctx.currentTime+(opts.delay||0));this.active.push(s);s.onended=()=>{this.active=this.active.filter(x=>x!==s);try{s.disconnect();g.disconnect();if(tail!==g)tail.disconnect();}catch{}};}
 /* A flock: the same recording at several pitches, spread left and right, so it sounds like many sheep, not one. */
 flock(n=3,volume=1){const rates=[1,.86,1.17,.94,1.28];for(let i=0;i<n;i++)this.play('sheep',volume*(i?.7:1),{rate:rates[i%rates.length]*(.97+Math.random()*.06),pan:n>1?(i/(n-1)*2-1)*.8:0,delay:i*.11+Math.random()*.08});}
 duck(){if(!this.musicGain||!this.ctx)return;const t=this.ctx.currentTime;this.musicGain.gain.cancelScheduledValues(t);this.musicGain.gain.setValueAtTime(this.settings.music*.07,t);this.musicGain.gain.setTargetAtTime(this.settings.music*.26,t+.9,.15);}
 musicOn(){if(this.music||!this.ctx||!this.buffers.roadtrip||this.suspended)return;this.music=this.ctx.createBufferSource();this.music.buffer=this.buffers.roadtrip;this.music.loop=true;this.music.loopEnd=32;this.music.connect(this.musicGain);this.musicGain.gain.value=this.settings.music*.26;this.musicStarted=this.ctx.currentTime;this.music.start(0,this.musicOffset%32);}
 musicOff(){if(this.music){this.musicOffset+=(this.ctx.currentTime-this.musicStarted);this.music.stop();this.music.disconnect();this.music=null;}}
 update(){if(this.musicGain)this.musicGain.gain.setTargetAtTime(this.settings.music*.26,this.ctx.currentTime,.1);if(this.menu?.music)this.menu.music.g.gain.setTargetAtTime(this.settings.music*.27,this.ctx.currentTime,.1);}

 /* ---- depot / menu: ignition -> idle ticking + lounge music, rev on every swipe, soft honk on select ---- */
 _ramp(g,to,secs){const t=this.ctx.currentTime;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(to,t+secs);}
 _loop(name,gain,to,fade,offset=0){const src=this.ctx.createBufferSource();src.buffer=this.buffers[name];src.loop=true;const g=this.ctx.createGain();g.gain.value=0;src.connect(g);g.connect(this.master);src.start(0,offset);this._ramp(g,to,fade);return {src,g};}
 menuOn(ignite=false){if(!this.ctx||this.suspended)return;this.menuWanted=true;if(this.menu)return;const m=this.menu={music:null,idle:null};
  const musicLevel=this.settings.music*.27,idleLevel=this.settings.sfx*.16;
  const start=()=>{if(this.menu!==m||!this.buffers.menumusic)return;m.music=this._loop('menumusic',0,musicLevel,ignite?3:1.4);m.idle=this.buffers.idle?this._loop('idle',0,idleLevel,.5):null;};
  if(ignite&&this.buffers.ignition&&this.settings.sfx>0){this.play('ignition');this.timers.push(setTimeout(start,1500));}else start();}
 menuOff(fade=.7){this.menuWanted=false;this.timers.forEach(clearTimeout);this.timers=[];const m=this.menu;this.menu=null;if(!m||!this.ctx)return;
  for(const k of ['music','idle'])if(m[k]){this._ramp(m[k].g,0,fade);const {src,g}=m[k];setTimeout(()=>{try{src.stop();}catch{}src.disconnect();g.disconnect();},fade*1000+80);}}
 rev(dir=1){if(!this.ctx||!this.buffers.rev||this.settings.sfx<=0||this.suspended)return;
  if(this.revSrc){const {s,g}=this.revSrc;this._ramp(g,0,.09);setTimeout(()=>{try{s.stop();}catch{}},120);}
  const s=this.ctx.createBufferSource();s.buffer=this.buffers.rev;s.playbackRate.value=.92+Math.random()*.16+(dir>0?.06:-.04);const g=this.ctx.createGain();g.gain.value=.5*this.settings.sfx;s.connect(g);g.connect(this.master);s.start();this.revSrc={s,g};s.onended=()=>{if(this.revSrc?.s===s)this.revSrc=null;s.disconnect();g.disconnect();};}
 honk(){this.play('horn',.6);}
 gameStop(){this.musicOff();this.active.forEach(s=>{try{s.stop();}catch{}});this.active=[];}
 pause(){const wanted=this.menuWanted;this.menuOff(.01);this.menuWanted=wanted;this.musicOff();this.active.forEach(s=>{try{s.stop();}catch{}});this.active=[];this.suspended=true;}
 resume(){this.suspended=false;this.ctx?.resume();if(this.menuWanted)this.menuOn(false);else this.musicOn();}
}
