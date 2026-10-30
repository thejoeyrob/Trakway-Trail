export class Sound {
 constructor(settings){this.settings=settings;this.ctx=null;this.buffers={};this.active=[];this.ready=false;this.loading=null;this.music=null;this.musicOffset=0;this.musicStarted=0;this.suspended=false;this.menuWanted=false;this.menu=null;this.revSrc=null;this.timers=[];}
 init(){if(this.ctx)return;this.ctx=new (window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=.8;const comp=this.ctx.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=3;this.master.connect(comp);comp.connect(this.ctx.destination);this.musicGain=this.ctx.createGain();this.musicGain.connect(this.master);}
 /* Create the context and decode everything before the first tap, so the ignition fires the instant the player taps. */
 preload(){try{this.init();if(!this.loading)this.loading=this.load();}catch{}return this.loading;}
 async unlock(){try{this.init();const resumed=this.ctx.resume();if(!this.loading)this.loading=this.load();await resumed;await this.loading;return true;}catch{return false;}}
 async load(){await Promise.all(['roadtrip','menumusic','ignition','idle','rev','cash','crumb','pickup','delivery','horn','sheep','flush','brake','click','scatter','bonus','jweds-jingle'].map(async name=>{try{let bytes;if(window.TRUCKIN_AUDIO_DATA?.[name]){let b=atob(window.TRUCKIN_AUDIO_DATA[name]);bytes=Uint8Array.from(b,c=>c.charCodeAt(0)).buffer;}else{let r=await fetch('./audio/'+name+(['roadtrip','menumusic','jweds-jingle'].includes(name)?'.mp3':'.wav'));if(!r.ok)return;bytes=await r.arrayBuffer();}this.buffers[name]=await this.ctx.decodeAudioData(bytes);}catch{}}));this.ready=true;}
 play(name,volume=1){if(!this.ctx||!this.buffers[name]||this.settings.sfx<=0||this.suspended)return;let gains={ignition:.55,rev:.42,'jweds-jingle':.7,cash:.45,crumb:.16,pickup:.48,delivery:.48,horn:.4,sheep:.60,flush:.46,brake:.52,click:.28,scatter:.45,bonus:.4};const s=this.ctx.createBufferSource();s.buffer=this.buffers[name];const g=this.ctx.createGain();g.gain.value=(gains[name]||.4)*this.settings.sfx*volume;s.connect(g);g.connect(this.master);s.start();this.active.push(s);s.onended=()=>{this.active=this.active.filter(x=>x!==s);s.disconnect();g.disconnect();};}
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
  const s=this.ctx.createBufferSource();s.buffer=this.buffers.rev;s.playbackRate.value=.94+Math.random()*.14+(dir>0?.02:-.02);const g=this.ctx.createGain();g.gain.value=.4*this.settings.sfx;s.connect(g);g.connect(this.master);s.start();this.revSrc={s,g};s.onended=()=>{if(this.revSrc?.s===s)this.revSrc=null;s.disconnect();g.disconnect();};}
 honk(){this.play('horn',.6);}
 gameStop(){this.musicOff();this.active.forEach(s=>{try{s.stop();}catch{}});this.active=[];}
 pause(){const wanted=this.menuWanted;this.menuOff(.01);this.menuWanted=wanted;this.musicOff();this.active.forEach(s=>{try{s.stop();}catch{}});this.active=[];this.suspended=true;}
 resume(){this.suspended=false;this.ctx?.resume();if(this.menuWanted)this.menuOn(false);else this.musicOn();}
}
