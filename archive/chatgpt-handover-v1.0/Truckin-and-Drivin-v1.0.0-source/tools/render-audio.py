#!/usr/bin/env python3
"""Original Truckin' & Drivin' sound design. Deterministic, no samples.
Requires Python/numpy/scipy + ffmpeg. Outputs assets to public/audio.
Music: 16-bar 120 BPM arcade funk, D-minor → G → C → A turnaround.
All sources, melodies, drum design and effects are authored for this game.
"""
from pathlib import Path
import json, math, subprocess
import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'audio'
OUT.mkdir(parents=True, exist_ok=True)
SR = 44100
RNG = np.random.default_rng(271029)
TAU = 2*np.pi

def hz(note): return 440 * 2**((note-69)/12)
def time(d): return np.arange(int(d*SR)) / SR

def env(n,a=.006,d=.10,s=.35,r=.09):
    n=int(n); na=min(int(a*SR),n); nr=min(int(r*SR),max(0,n-na)); nd=min(int(d*SR),max(0,n-na-nr))
    out=np.full(n,s,dtype=np.float64)
    if na: out[:na]=np.linspace(0,1,na)
    if nd: out[na:na+nd]=np.exp(np.linspace(0,np.log(max(s,.001)),nd))
    if nr: out[-nr:]=np.linspace(s,0,nr)**1.2
    return out

def filt(x,kind,cut,order=3):
    return signal.sosfilt(signal.butter(order,cut,kind,fs=SR,output='sos'),x)

def add(dst,src,sec,gain=1,pan=0,wrap=False):
    if src.ndim == 1:
        src=np.stack([src*np.sqrt((1-pan)/2),src*np.sqrt((1+pan)/2)],axis=1)
    i=int(sec*SR); src=src*gain
    if wrap:
        idx=(np.arange(len(src))+i)%len(dst)
        np.add.at(dst,idx,src)
    else:
        start=max(0,i); end=min(len(dst),i+len(src))
        if end>start: dst[start:end]+=src[start-i:end-i]

def harmonic(note,d,kind='bass'):
    t=time(d); f=hz(note); n=len(t)
    if kind=='bass':
        p=TAU*f*t + .8*np.sin(TAU*f*t)*np.exp(-t*11)
        x=.77*np.sin(p)+.23*np.sin(2*p)*np.exp(-t*3)+.10*np.sin(3*p)*np.exp(-t*8)
        return x*env(n,.004,.09,.64,.07)
    if kind=='clav':
        x=np.zeros(n)
        for k in range(1,10):
            x+=np.sin(TAU*f*k*t+.12*k) * (1/k**1.15) * np.exp(-t*(6+k*1.1))
        x+=RNG.normal(0,.03,n)*np.exp(-t*90)
        return np.tanh(1.2*x)*env(n,.002,.06,.28,.08)
    if kind=='guitar':
        x=np.zeros(n)
        for k in range(1,11):
            x+=np.sin(TAU*f*k*t*(1+k*k*.000014))*(1/k**1.35)*np.exp(-t*(2.5+k*.6))
        return x*env(n,.004,.08,.55,.14)
    if kind=='lead':
        vibrato=.012*np.sin(TAU*5.2*t)*np.minimum(t*5,1)
        phase=TAU*f*t+vibrato*TAU*f/(TAU*5.2)
        x=.68*np.sin(phase)+.19*np.sin(phase*2)+.08*np.sin(phase*3)
        return x*env(n,.014,.08,.72,.11)
    if kind=='organ':
        v=1+.0008*np.sin(TAU*4.8*t)
        x=sum(w*np.sin(TAU*f*k*t*v) for k,w in [(1,.5),(2,.22),(3,.1),(4,.04)])
        return x*env(n,.06,.11,.65,.23)
    if kind=='bell':
        x=sum(np.sin(TAU*f*k*t)*w*np.exp(-t*dec) for k,w,dec in [(1,.7,4),(2,.3,6),(2.76,.18,8),(4.07,.08,12)])
        return x*env(n,.001,.10,.12,.06)

# --- Drum kit: warm, punchy and short ---
def kick():
    t=time(.34)
    phase=TAU*(48*t + (105-48)*.030*(1-np.exp(-t/.030)))
    return .86*np.sin(phase)*np.exp(-t*11)+.13*filt(RNG.normal(0,1,len(t)),'highpass',1400)*np.exp(-t*110)
def snare():
    t=time(.24); noise=filt(RNG.normal(0,1,len(t)),'bandpass',[600,10500])
    return .53*noise*np.exp(-t*20)+.30*np.sin(TAU*180*t)*np.exp(-t*24)+.15*np.sin(TAU*330*t)*np.exp(-t*35)
def hat(opened=False):
    t=time(.23 if opened else .085); x=filt(RNG.normal(0,1,len(t)),'highpass',6500)
    ring=sum(np.sign(np.sin(TAU*f*t)) for f in [341,567,833,1151,1827])/7
    return (.60*x+.13*filt(ring,'highpass',6500))*np.exp(-t*(18 if opened else 64))
def rim():
    t=time(.07); return (np.sin(TAU*1730*t)+.38*np.sin(TAU*2400*t))*np.exp(-t*95)
def shaker():
    t=time(.065); return filt(RNG.normal(0,.5,len(t)),'bandpass',[4000,13000])*np.sin(np.pi*np.arange(len(t))/len(t))**2

DURATION=32.; BEAT=.5; BAR=2.
mix=np.zeros((int(SR*DURATION),2))
K=kick(); S=snare(); HC=hat(); HO=hat(True); R=rim(); SH=shaker()
chords=[[62,65,69,72,76],[59,62,65,69,76],[60,64,67,71,74],[57,61,64,67,70]]
bassroots=[38,43,36,33]
# 4-chord, two-bar harmony; second half with answering melody.
for bar in range(16):
    b=bar*BAR
    root=bassroots[(bar//2)%4]
    chord=chords[(bar//2)%4]
    # Humanised laid-back groove; fills do not collide with pickup audio.
    for beat,g in [(0,.9),(1.5,.6),(2,.74),(2.75,.5)]: add(mix,K,b+beat*BEAT,g)
    for beat,g in [(1,.76),(3,.85)]: add(mix,S,b+beat*BEAT+.009,g,pan=.06)
    if bar%4==3:
        for beat in [3.5,3.75]: add(mix,S,b+beat*BEAT,.24,pan=-.10)
    for step in range(8):
        add(mix,HO if step==7 and bar%2 else HC,b+step*.25,.17 if step%2 else .23,pan=.23)
    for step in range(16):
        if step%2: add(mix,SH,b+step*.125+.01,.09,pan=-.38)
    for beat in [1.75,3.25]: add(mix,R,b+beat*BEAT,.07,pan=-.3)
    bassline=[(0,root,.31,.9),(.75,root,.15,.53),(1.5,root+12,.18,.65),(2,root+7,.23,.76),(2.75,root,.15,.62),(3.5,root+10 if bar%2 else root+12,.17,.64),(3.75,root+11 if bar%2 else root+7,.11,.38)]
    for beat,n,d,g in bassline: add(mix,harmonic(n,d,'bass'),b+beat*BEAT,g*.40)
    # Syncopated electric clavinet stabs; slightly staggered chord attacks.
    for beat,g in [(.5,.7),(1.25,.5),(2.5,.8),(3.25,.55)]:
        for j,n in enumerate(chord): add(mix,harmonic(n,.31,'clav'),b+beat*BEAT+j*.003,g*.15,pan=-.36)
    # Sustained drawbar bed at very low level, a little springy picked guitar reply.
    for j,n in enumerate(chord[:4]): add(mix,harmonic(n,2.05,'organ'),b,.048,pan=.36,wrap=True)
    if bar%2:
        for beat,n in [(2.75,chord[2]+12),(3.25,chord[1]+12),(3.75,chord[0]+12)]:
            add(mix,harmonic(n,.25,'guitar'),b+beat*BEAT,.13,pan=.42)

# Original singable 8-bar hook, with answer and octave pickup in bars 9–16.
motifs=[
 [(0,74,.34),(.75,77,.18),(1.5,76,.22),(2.5,74,.25),(3.25,72,.26)],
 [(.5,69,.22),(1.25,72,.23),(2,74,.62),(3.5,77,.17)],
 [(0,76,.35),(.75,74,.18),(1.5,71,.25),(2.5,69,.20),(3.25,67,.26)],
 [(.5,69,.25),(1.25,71,.22),(2,74,.55),(3.5,72,.18)],
 [(0,72,.35),(.75,76,.19),(1.5,79,.26),(2.5,76,.25),(3.25,74,.27)],
 [(.5,72,.22),(1.25,71,.22),(2,67,.58),(3.5,69,.19)],
 [(0,73,.35),(.75,76,.20),(1.5,79,.25),(2.5,76,.25),(3.25,73,.27)],
 [(.5,72,.22),(1.25,69,.20),(2,67,.26),(2.75,69,.21),(3.5,73,.18)],
]
for bar in range(16):
    for beat,n,d in motifs[bar%8]:
        # Second chorus: muted guitar doubling rather than a louder synth wall.
        x=harmonic(n,d+.06,'lead')
        add(mix,x,bar*BAR+beat*BEAT,.21,pan=-.08,wrap=True)
        add(mix,x,bar*BAR+beat*BEAT+.1875,.043,pan=.52,wrap=True)
        if bar>=8: add(mix,harmonic(n-12,d+.08,'guitar'),bar*BAR+beat*BEAT,.055,pan=.28,wrap=True)

# Circular short room and vintage tape slap: the tail folds across the loop boundary.
source=mix.copy()
for delay,g,p in [(0.048,.055,True),(.093,.044,False),(.163,.035,True),(.281,.025,False)]:
    echo=np.roll(source,int(delay*SR),axis=0)
    if p: echo=echo[:,::-1]
    mix+=echo*g
mix=np.tanh(mix*.85)
# Remove DC and normalise conservatively before true-peak loudness normalisation.
mix-=mix.mean(axis=0)
mix*=.82/max(.001,np.max(np.abs(mix)))

manifest={'music':{},'effects':{},'provenance':'Entirely original procedural composition and sound design. No third-party recordings; sheep is a stylised formant-synthesised baa.'}

def save_wav(name,x,peak=.86):
    if x.ndim==1: x=np.stack([x,x],axis=1)
    x=np.nan_to_num(x); x-=x.mean(axis=0)
    x*=peak/max(np.max(np.abs(x)),.0001)
    # Anti-click edges only for non-loop effects.
    if name not in ['roadtrip','engine']:
        fade=min(len(x)//4,int(.008*SR))
        x[:fade]*=np.linspace(0,1,fade)[:,None]; x[-fade:]*=np.linspace(1,0,fade)[:,None]
    wavfile.write(OUT/(name+'.wav'),SR,(np.clip(x,-1,1)*32767).astype(np.int16))
    return len(x)/SR

save_wav('roadtrip',mix,.86)
# Fixed gain preserves the exact phrase dynamics; FFmpeg's limiter guards true peak.
for ext,codec in [('m4a',['-c:a','aac','-b:a','160k']),('mp3',['-c:a','libmp3lame','-b:a','160k'])]:
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(OUT/'roadtrip.wav'),'-af','loudnorm=I=-16:TP=-1.5:LRA=9','-ar',str(SR),*codec,str(OUT/('roadtrip.'+ext))],check=True)
manifest['music']={'files':['roadtrip.m4a','roadtrip.mp3','roadtrip.wav'],'duration':32,'bpm':120,'loop':True,'recommended_gain':.22,'notes':'16-bar original arcade funk with round bass, clavinet, drawbar chords, surf-like lead and stereo drums. Use decoded AudioBuffer loop for seamless scheduling.'}

# --- Sound effects ---
# A real-feeling metallic cash drawer: mechanical transient, two pitched bells.
x=np.zeros((int(0.85*SR),2)); t=time(.09)
clack=filt(RNG.normal(0,1,len(t)),'bandpass',[900,6000])*np.exp(-t*65)
add(x,clack,0,.16,-.2)
for offset,n,g in [(.045,88,.6),(.10,95,.7)]: add(x,harmonic(n,.66,'bell'),offset,g,.15)
manifest['effects']['cash']={'duration':save_wav('cash',x),'gain':.50,'use':'Bank job/taco money; warm ka-ching.'}

# Tiny breadcrumb sparkle, deliberately subtle and extremely short.
x=harmonic(91,.16,'bell')+.3*harmonic(103,.16,'bell')
manifest['effects']['crumb']={'duration':save_wav('crumb',x,.60),'gain':.16,'use':'Each collected breadcrumb; throttle to one voice per 70ms.'}

x=np.zeros((int(.48*SR),2))
for off,n in [(0,76),(.07,83),(.14,88)]: add(x,harmonic(n,.30,'bell'),off,.35)
manifest['effects']['pickup']={'duration':save_wav('pickup',x),'gain':.42,'use':'Job or special item collected.'}

x=np.zeros((int(1.25*SR),2))
for i,n in enumerate([62,66,69,74]):
    add(x,harmonic(n,.72,'lead'),i*.10,.42,pan=(i-1.5)*.22)
    add(x,harmonic(n+12,.70,'bell'),i*.10,.16,pan=(1.5-i)*.16)
add(x,S,.32,.25)
manifest['effects']['delivery']={'duration':save_wav('delivery',x),'gain':.58,'use':'Cash-out flag; short triumphant cadence.'}

# Truck dual air horn: rich reed harmonics, air attack, restrained fundamental.
t=time(.85); amp=(1-np.exp(-t*65))*np.minimum(1,np.maximum(0,(.85-t)/.12))
x=np.zeros(len(t))
for f in [146.8,196.0]:
    for h in range(1,14):
        x+=np.sin(TAU*f*h*t + .08*np.sin(TAU*9*t))*np.exp(-h*.19)/(h**.38)
x=filt(x,'lowpass',3600)
x=.35*np.tanh(x*.65)+filt(RNG.normal(0,.09,len(t)),'bandpass',[500,5000])
x*=amp
manifest['effects']['horn']={'duration':save_wav('horn',x),'gain':.40,'use':'Player horn; duck music briefly by 30%.'}

# A humorous formant-synthesised baa-baa, no recording/sample.
t=time(1.15); f=155*(1+.055*np.sin(TAU*7*t))*(1+.05*np.exp(-t*3))
phase=TAU*np.cumsum(f)/SR
source=signal.sawtooth(phase,width=.12)
formants=np.zeros(len(t))
for center,bw,gain in [(650,160,1),(1150,240,.62),(2450,350,.16)]:
    b,a=signal.iirpeak(center,center/bw,fs=SR)
    formants+=signal.lfilter(b,a,source)*gain
# Two articulated syllables and cartoon wobble.
amp=np.zeros(len(t))
for start,dur in [(0,.43),(.51,.56)]:
    i=int(start*SR); n=int(dur*SR)
    amp[i:i+n]=env(n,.035,.11,.75,.16)
x=(formants+.018*RNG.normal(0,1,len(t)))*amp
manifest['effects']['sheep']={'duration':save_wav('sheep',x),'gain':.58,'use':'Timed horn cue: two comic baa syllables.'}

# Toilet flush: rushing water sweeps down, bubbly gurgles circulate stereo.
t=time(1.35); noise=RNG.normal(0,1,len(t)); x=np.zeros((len(t),2))
water=filt(noise,'bandpass',[280,6500])*(1-np.exp(-t*24))*np.exp(-t*2.2)
for ch in range(2): x[:,ch]=water*(.75+.15*np.sin(TAU*(3.1*t+ch*.24)))
for i in range(18):
    start=.1+i*.054; bt=time(.12); f0=RNG.uniform(90,320)
    burble=np.sin(TAU*(f0*bt-80*bt*bt))*np.exp(-bt*30)
    add(x,burble,start,.3,pan=math.sin(i*1.7)*.7)
manifest['effects']['flush']={'duration':save_wav('flush',x),'gain':.48,'use':'Money drains away on a fine/collision.'}

# Braking rubber screech followed by a dramatic rising comic sting.
t=time(.75); sweep=850*t+850*t*t
x=(.40*signal.sawtooth(TAU*sweep)+.22*np.sin(TAU*(sweep*1.041))+.20*filt(RNG.normal(0,1,len(t)),'bandpass',[1800,6500]))
x*=env(len(t),.04,.10,.65,.20)
y=np.zeros((int(1.6*SR),2)); add(y,x,0,.6)
ct=time(.95); phase=TAU*(150*ct+100*ct*ct)
for ratio,pan in [(1,-.4),(1.26,0),(1.5,.4)]:
    swell=(np.sin(phase*ratio)+.22*np.sin(phase*ratio*2))*np.sin(np.pi*np.arange(len(ct))/len(ct))**.65
    add(y,swell,.52,.36,pan)
add(y,K,1.31,.6)
manifest['effects']['brake']={'duration':save_wav('brake',y),'gain':.56,'use':'Sheep near-miss/fail transition; visual covers contact.'}

# Low revving diesel loop, kept quiet beneath music.
t=time(2.); phase=TAU*(42*t+1.5*np.sin(TAU*.5*t))
x=.5*np.sin(phase)+.19*np.sin(phase*2)+.09*np.sin(phase*4)
x+=filt(RNG.normal(0,.10,len(t)),'lowpass',850)
# Crossfade loop ends while retaining duration.
k=int(.08*SR); cross=np.linspace(0,1,k)
x[:k]=x[-k:]*(1-cross)+x[:k]*cross
manifest['effects']['engine']={'duration':save_wav('engine',x,.55),'gain':.07,'use':'Optional looping diesel ambience; rate 0.9–1.3 follows speed.'}

# Gentle steering and pause buttons.
x=harmonic(71,.09,'clav')
manifest['effects']['click']={'duration':save_wav('click',x,.45),'gain':.18,'use':'Menu and garage button feedback.'}

# Soft spinning whistle for sheep scatter; comically relieved, not distressed.
t=time(.48); p=TAU*(900*t+600*t*t)
x=np.sin(p+.25*np.sin(TAU*18*t))*env(len(t),.015,.04,.42,.16)
manifest['effects']['scatter']={'duration':save_wav('scatter',x,.6),'gain':.28,'use':'Sheep run safely away after a timed horn.'}

# Near miss / clean driving achievement.
x=np.zeros((int(.5*SR),2))
for off,n in [(0,81),(.09,88)]: add(x,harmonic(n,.31,'guitar'),off,.6)
manifest['effects']['bonus']={'duration':save_wav('bonus',x,.7),'gain':.35,'use':'Clean driving bonus or newly unlocked item.'}

(OUT/'audio-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'music':manifest['music'],'sfx':list(manifest['effects']),'totalBytes':sum(p.stat().st_size for p in OUT.iterdir())},indent=2))
