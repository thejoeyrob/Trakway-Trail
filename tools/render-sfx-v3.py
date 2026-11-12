#!/usr/bin/env python3
"""Truckin' & Drivin' sound effects v3. Fully synthesised (numpy/scipy), deterministic, no samples.
Replaces the older effect files in public/audio and adds the new funny-hazard sounds.
Run: python3 tools/render-sfx-v3.py   (the music, sheep recording and menu music are not touched)"""
from pathlib import Path
import numpy as np
from scipy import signal
from scipy.io import wavfile
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'public'/'audio'
SR=44100; TAU=2*np.pi; RNG=np.random.default_rng(20261112)
def T(d): return np.arange(int(d*SR))/SR
def hz(n): return 440*2**((n-69)/12)
def lp(x,c,o=3): return signal.sosfilt(signal.butter(o,c,'lowpass',fs=SR,output='sos'),x)
def hp(x,c,o=3): return signal.sosfilt(signal.butter(o,c,'highpass',fs=SR,output='sos'),x)
def bp(x,lo,hi,o=2): return signal.sosfilt(signal.butter(o,[lo,hi],'bandpass',fs=SR,output='sos'),x)
def adsr(n,a=.005,d=.1,s=.6,r=.1):
    n=int(n);e=np.full(n,float(s));na=min(int(a*SR),n);nd=min(int(d*SR),max(0,n-na));nr=min(int(r*SR),max(0,n-na-nd))
    if na:e[:na]=np.linspace(0,1,na)
    if nd:e[na:na+nd]=np.linspace(1,s,nd)
    if nr:e[-nr:]*=np.linspace(1,0,nr)
    return e
def mix_at(dst,src,sec,g=1.0):
    i=int(sec*SR);j=min(len(dst),i+len(src))
    if j>i:dst[i:j]+=src[:j-i]*g
def room(x,wet=.18,length=.28,seed=3):
    r=np.random.default_rng(seed);t=T(length);ir=r.normal(0,1,len(t))*np.exp(-t*14);ir=lp(ir,5000);ir[0]=0
    return x+wet*signal.fftconvolve(x,ir)[:len(x)]*.12
def bell(f,d,partials=((1,1,5),(2.76,.45,8),(5.4,.25,12),(8.9,.12,18))):
    t=T(d);return sum(a*np.sin(TAU*f*r*t)*np.exp(-t*k) for r,a,k in partials)
def additive(f,d,n=18,slope=.9,detune=0):
    t=T(d);fa=f if np.ndim(f) else np.full(len(t),f);ph=np.cumsum(fa)/SR;x=np.zeros(len(t))
    for h in range(1,n+1):x+=np.sin(TAU*h*ph*(1+detune*h*.0003))/h**slope
    return x
def save(name,x,peak=.88,loop=False,fadein=True):
    x=np.nan_to_num(x).astype(np.float64);x-=x.mean();x*=peak/max(1e-6,np.max(np.abs(x)))
    if not loop:
        f=min(len(x)//4,int(.006*SR))
        if fadein:x[:f]*=np.linspace(0,1,f)
        x[-f:]*=np.linspace(1,0,f)
    wavfile.write(OUT/(name+'.wav'),SR,(np.clip(x,-1,1)*32767).astype(np.int16));return len(x)/SR

# ---------- the diesel: one engine model used for rev, ignition and idle ----------
def engine(rpm,load=None,seed=1):
    """rpm: array (per sample). Returns a lumpy six-cylinder diesel with exhaust rasp, valve clatter and a turbo whistle under load."""
    r=np.random.default_rng(seed);n=len(rpm);load=np.zeros(n) if load is None else load
    fire=rpm/60*3;ph=np.cumsum(fire)/SR           # firing frequency (6 cyl, 4 stroke)
    x=np.zeros(n)
    for h in range(1,26):x+=np.sin(TAU*h*ph+h*.37)/h**1.05*(1+.35*np.sin(TAU*.5*ph))
    lump=1+.22*np.sin(TAU*ph/3+.8)+.10*r.normal(0,1,n).cumsum()/np.sqrt(np.arange(1,n+1))*0  # cylinder-to-cylinder lumpiness
    x*=lump
    cutoff=450+rpm*.9
    # time-varying lowpass: blend two fixed filters on the rpm
    lo=lp(x,700);hi=lp(x,2600);k=np.clip((rpm-700)/1600,0,1);x=lo*(1-k)+hi*k
    clat=hp(r.normal(0,1,n),2500)*(np.sin(TAU*ph*2)>.93)*.5       # injector / valve ticks
    rasp=bp(r.normal(0,1,n),180,1400)*(.25+.7*load)
    turbo=np.sin(TAU*np.cumsum(1800+rpm*2.6)/SR)*(.03+.16*np.clip(load,0,1))*(rpm>1000)
    return np.tanh(1.4*(x*.7+clat*.12+rasp*.35))*.8+turbo

# ---------- 1. horn: a three-note lorry air horn ----------
def horn():
    d=1.0;t=T(d);x=np.zeros(len(t))
    for f0,g in [(233.1,1),(293.7,.95),(349.2,.9)]:
        fa=f0*(1-.045*np.exp(-t*40))*(1+.0035*np.sin(TAU*6.5*t));x+=g*additive(fa,d,22,.8,detune=1)
    x=lp(x,5200)+0.10*bp(RNG.normal(0,1,len(t)),400,5000)*np.exp(-t*7)
    x=x*adsr(len(t),.035,.08,.9,.28)
    # bell-mouth resonance, then a little room
    b,a=signal.iirpeak(1250,4,fs=SR);x=x+.6*signal.lfilter(b,a,x);x=room(np.tanh(.9*x),.2)
    return x
# ---------- 2. rev (menu swipe): a quick blip of the throttle ----------
def rev():
    d=.95;t=T(d);rpm=800+1350*np.exp(-((t-.34)/.2)**2)+250*np.exp(-t*1.5);rpm=np.where(t<.34,800+(rpm-800)*(t/.34)**.6,rpm)
    load=np.exp(-((t-.34)/.22)**2);x=engine(rpm,load,2)*adsr(len(t),.02,.1,.9,.2);return room(x,.12)
# ---------- 3. ignition: starter, catch, flare, settle ----------
def ignition():
    d=2.7;t=T(d);x=np.zeros(len(t))
    # starter motor + compression chug
    s=T(1.0);whirl=np.sin(TAU*np.cumsum(70+55*(1-np.exp(-s*6)))/SR)+.5*np.sin(TAU*np.cumsum(140+110*(1-np.exp(-s*6)))/SR)
    chug=1+.55*np.sin(TAU*np.cumsum(5.5+4*(1-np.exp(-s*6)))/SR);st=lp(whirl*chug,900)*adsr(len(s),.03,.1,.85,.12)*.55
    x[:len(st)]+=st;mix_at(x,hp(RNG.normal(0,1,int(.05*SR)),600)*np.exp(-T(.05)*60),0,.5)   # solenoid clunk
    # engine catches at 0.95 s: rpm climbs from 190, flares, settles to idle
    e=T(d-.95);rpm=190+(1500-190)*(1-np.exp(-e*7));rpm=rpm+420*np.exp(-((e-.45)/.25)**2)-0;rpm=np.where(e>.9,800+(rpm-800)*np.exp(-(e-.9)*2.2)+0,rpm)
    rpm=np.maximum(rpm,780);ld=np.exp(-((e-.45)/.4)**2)*.9;eng=engine(rpm,ld,5)*adsr(len(e),.05,.2,.95,.35)
    x[int(.95*SR):int(.95*SR)+len(eng)]+=eng*.9
    return room(x,.14)
# ---------- 4. idle: loopable tick-over ----------
def idle():
    d=2.0;t=T(d);rpm=785+14*np.sin(TAU*t/d*2)+9*np.sin(TAU*t/d*3);x=engine(rpm,np.zeros(len(t))+.05,9)
    k=int(.12*SR);c=np.linspace(0,1,k);x[:k]=x[-k:]*(1-c)+x[:k]*c;return x[:-k]
# ---------- 5. UI click: a cab-switch tick ----------
def click():
    t=T(.09);return (hp(RNG.normal(0,1,len(t)),2500)*np.exp(-t*420)*.7+np.sin(TAU*1600*t)*np.exp(-t*110)*.5+np.sin(TAU*220*t)*np.exp(-t*60)*.4)
# ---------- 6. crumb: a coin tink ----------
def crumb():
    t=T(.22);return (np.sin(TAU*1760*t)*.7+np.sin(TAU*2637*t)*.45+np.sin(TAU*5274*t)*.18)*np.exp(-t*20)+hp(RNG.normal(0,1,len(t)),5000)*np.exp(-t*260)*.4
# ---------- 7. cash: register ka-ching with coin spill ----------
def cash():
    d=1.05;x=np.zeros(int(d*SR));t=T(.07);mix_at(x,bp(RNG.normal(0,1,len(t)),700,5500)*np.exp(-t*70),0,.55)
    mix_at(x,np.sin(TAU*120*T(.1))*np.exp(-T(.1)*40),0,.4)                                   # drawer thump
    mix_at(x,bell(2093,.7,((1,1,4.5),(2.4,.5,7),(4.1,.3,10))),.07,.7);mix_at(x,bell(3136,.6,((1,1,5),(2.4,.4,8))),.11,.55)
    for i in range(7):mix_at(x,bell(RNG.uniform(2400,4200),.18,((1,1,22),(2.3,.4,30))),.26+i*.045+RNG.uniform(0,.02),RNG.uniform(.14,.3))
    return room(x,.1)
# ---------- 8. pickup: bright three-note rise ----------
def pickup():
    x=np.zeros(int(.6*SR))
    for i,n in enumerate([79,83,88]):mix_at(x,bell(hz(n),.38,((1,1,6),(2,.35,9),(3.01,.2,12),(4.2,.1,16))),i*.075,.55)
    return room(x,.1)
# ---------- 9. delivery: brass fanfare ----------
def delivery():
    d=1.45;x=np.zeros(int(d*SR))
    def brass(n,dur,g):
        f=hz(n);t=T(dur);fa=f*(1+.004*np.sin(TAU*5.5*t)*np.minimum(1,t*6));y=additive(fa,dur,16,.75);return lp(y,4200)*adsr(len(t),.02,.08,.8,.16)*g
    for i,n in enumerate([60,64,67]):mix_at(x,brass(n,.2,.5),i*.13)
    for n in [72,76,79,84]:mix_at(x,brass(n,.85,.38),.40)
    mix_at(x,hp(RNG.normal(0,1,int(.9*SR)),5500)*np.exp(-T(.9)*3.5),.40,.12)               # cymbal wash
    mix_at(x,np.sin(TAU*60*T(.3))*np.exp(-T(.3)*14),.40,.5)                                  # kick
    return room(x,.22)
# ---------- 10. bonus: little sparkle run ----------
def bonus():
    x=np.zeros(int(.8*SR))
    for i,n in enumerate([84,88,91,96,100]):mix_at(x,bell(hz(n),.3,((1,1,10),(2.5,.3,16))),i*.055,.5)
    mix_at(x,hp(RNG.normal(0,1,int(.4*SR)),6500)*np.exp(-T(.4)*9),0,.15);return room(x,.12)
# ---------- 11. flush: a fine. Sad trombone + clunk ----------
def flush():
    d=1.0;x=np.zeros(int(d*SR))
    def tb(n0,n1,dur):
        t=T(dur);f=hz(n0)*(hz(n1)/hz(n0))**(np.clip(t/(dur*.5),0,1)**.7)*(1+.01*np.sin(TAU*5*t));y=additive(f,dur,14,1.0);wah=1+.5*np.sin(TAU*np.cumsum(2.2+0*t)/SR)
        return lp(y,900+700*wah.mean())*adsr(len(t),.03,.1,.85,.12)
    mix_at(x,tb(58,57,.3),0,.6);mix_at(x,tb(57,55,.4),.3,.6);mix_at(x,tb(55,50,.5),.7*.7,.6)
    t=T(.12);mix_at(x,np.sin(TAU*90*t)*np.exp(-t*30)*.6+hp(RNG.normal(0,1,len(t)),800)*np.exp(-t*90)*.4,0,.7);return room(x,.1)
# ---------- 12. brake: tyre squeal + air release + thump ----------
def brake():
    d=1.3;x=np.zeros(int(d*SR));t=T(.55);f=1250-520*t/.55;sq=(np.sin(TAU*np.cumsum(f)/SR)*.4+np.sin(TAU*np.cumsum(f*1.51)/SR)*.25+bp(RNG.normal(0,1,len(t)),1800,6500)*.5)*adsr(len(t),.03,.08,.8,.18)
    mix_at(x,sq,0,.6);ps=bp(RNG.normal(0,1,int(.8*SR)),2200,8500)*np.exp(-T(.8)*4.5)*adsr(int(.8*SR),.01,.1,1,.1);mix_at(x,ps,.5,.55)
    th=T(.25);mix_at(x,np.sin(TAU*(75-30*th/.25)*th)*np.exp(-th*16),.52,.9);return room(x,.1)
# ---------- 13. scatter: a flock bolting (hooves + whoosh) ----------
def scatter():
    d=.9;x=np.zeros(int(d*SR))
    for i in range(34):
        t=T(.03);mix_at(x,(bp(RNG.normal(0,1,len(t)),500,3000)*np.exp(-t*160)),i*.02+RNG.uniform(0,.012),RNG.uniform(.2,.45)*(1-i/48))
    mix_at(x,bp(RNG.normal(0,1,int(.5*SR)),700,4500)*np.exp(-T(.5)*7)*.35,0.02,1);return room(x,.1)
# ---------- 14. moo ----------
def formant_voice(f0c,F,dur,gains=(1,.6,.25),bw=(90,130,200),vib=.012):
    t=T(dur);ph=np.cumsum(f0c)/SR;src=np.zeros(len(t))
    for h in range(1,40):src+=np.sin(TAU*h*ph)/h**1.1
    out=np.zeros(len(t))
    # three formant tracks, each a narrow resonator updated in blocks
    blk=256
    for fi,(g,b) in enumerate(zip(gains,bw)):
        y=np.zeros(len(t));zi=np.zeros(2)
        for s in range(0,len(t),blk):
            fc=float(F[fi][s]);sos=signal.iirpeak(fc,fc/b,fs=SR);bb,aa=sos
            seg,zi=signal.lfilter(bb,aa,src[s:s+blk],zi=zi);y[s:s+blk]=seg
        out+=y*g
    return out
def moo():
    d=1.25;t=T(d);f0=105*(1+.2*np.sin(np.pi*np.clip(t/d,0,1))**1.5-.12*np.clip((t-.85)/.4,0,1))*(1+.014*np.sin(TAU*5*t))
    k=np.sin(np.pi*np.clip(t/d,0,1))**1.4
    F=[330+330*k,700+420*k,2200+0*t];x=formant_voice(f0,F,d)*adsr(len(t),.08,.15,.85,.3)
    x+=0.1*bp(RNG.normal(0,1,len(t)),200,900)*adsr(len(t),.05,.2,.4,.4);return room(np.tanh(x*.5),.15)
# ---------- 15. ice-cream van chime (Greensleeves, a traditional tune) ----------
def chime():
    notes=[(57,.5),(60,1),(62,.5),(64,.75),(65,.25),(64,.5),(62,1),(59,.5),(55,.75),(57,.25),(59,.5),(60,1)];bpm=170;beat=60/bpm
    x=np.zeros(int(8.0*SR));t0=0
    for n,b in notes:
        d=b*beat;mix_at(x,bell(hz(n+12),.9,((1,1,5),(2,.3,8),(3.0,.18,12),(5.1,.1,20))),t0,.5);t0+=d
    return x[:int((t0+.9)*SR)]
# ---------- 16. Morris bells ----------
def morris():
    d=1.0;x=np.zeros(int(d*SR))
    for i in range(36):mix_at(x,bell(RNG.uniform(2600,4600),.22,((1,1,18),(2.7,.5,26),(5.2,.2,40))),RNG.uniform(0,.8),RNG.uniform(.12,.3))
    return room(x,.12)
# ---------- 17. bicycle bell ting-ting ----------
def cyclebell():
    x=np.zeros(int(.8*SR))
    for off in (0,.17):mix_at(x,bell(2960,.5,((1,1,9),(1.51,.55,11),(2.3,.3,16))),off,.6)
    return x
# ---------- 18. clang: bin lorry ----------
def clang():
    d=1.3;x=np.zeros(int(d*SR));t=T(d);r=np.random.default_rng(11)
    for f in r.uniform(180,3200,18):x+=np.sin(TAU*f*t+r.uniform(0,6))*np.exp(-t*r.uniform(3,10))*r.uniform(.2,.7)
    x*=1;x+=np.sin(TAU*55*t)*np.exp(-t*8)*1.2+hp(RNG.normal(0,1,len(t)),900)*np.exp(-t*60)*.8;return room(np.tanh(x*.5),.2)
# ---------- 19. splat: ice cream ----------
def splat():
    d=.7;t=T(d);x=lp(RNG.normal(0,1,len(t)),1800)*np.exp(-t*20)*.9
    x+=np.sin(TAU*np.cumsum(420*np.exp(-t*6)+60)/SR)*np.exp(-t*7)*.8
    b=bell(1568,.4,((1,1,12),(2.4,.3,18)));x[:len(b)]+=b*.15
    return room(x,.1)
# ---------- 20. shield: horseshoe chime / break ----------
def shield():
    x=np.zeros(int(1.0*SR))
    for i,n in enumerate([72,76,79,84,88,91]):mix_at(x,bell(hz(n),.6,((1,1,6),(2,.4,9),(3,.2,14))),i*.07,.45)
    mix_at(x,hp(RNG.normal(0,1,int(.6*SR)),6000)*np.exp(-T(.6)*6),0,.12);return room(x,.18)
def shield_break():
    d=.7;x=np.zeros(int(d*SR));t=T(.5);mix_at(x,hp(RNG.normal(0,1,len(t)),2500)*np.exp(-t*14),0,.7)
    for f in (2400,3400,4700,6100):mix_at(x,bell(f,.4,((1,1,14),(1.8,.4,22))),RNG.uniform(0,.05),.25)
    mix_at(x,np.sin(TAU*np.cumsum(500*np.exp(-T(.4)*5)+80)/SR)*np.exp(-T(.4)*8),0,.5);return room(x,.1)
# ---------- 21. goose ----------
def goose():
    d=.55;t=T(d);f0=300*(1-.25*np.clip((t-.12)/.4,0,1))*(1+.02*np.sin(TAU*30*t));F=[560+0*t,1350+250*np.sin(np.pi*t/d),2600+0*t]
    x=formant_voice(f0,F,d,(1,.9,.3),(110,160,260))*adsr(len(t),.02,.06,.9,.14);return room(np.tanh(x*.5),.12)

# fallback sheep (the real CC0 recording is installed over this by tools/prepare-sheep-audio.sh in the release builds)
def sheep_fallback():
    d=1.25;t=T(d);x=np.zeros(len(t))
    for s0,dur,f0 in [(0,.55,300),(.6,.62,255)]:
        i=int(s0*SR);tt=T(dur);f=f0*(1-.18*tt/dur)*(1+.05*np.sin(TAU*9*tt));F=[700+120*np.sin(np.pi*tt/dur)+0*tt,1200+0*tt,2500+0*tt]
        v=formant_voice(f,F,dur,(1,.7,.25),(100,160,260));flutter=1+.55*np.sin(TAU*34*tt);v=v*flutter*adsr(len(tt),.03,.06,.9,.2);x[i:i+len(v)]+=v
    return room(np.tanh(x*.45),.1)

OUT.mkdir(parents=True,exist_ok=True)
specs=dict(horn=horn,rev=rev,ignition=ignition,idle=idle,click=click,crumb=crumb,cash=cash,pickup=pickup,delivery=delivery,bonus=bonus,flush=flush,brake=brake,scatter=scatter,
           moo=moo,chime=chime,morris=morris,cyclebell=cyclebell,clang=clang,splat=splat,shield=shield,shieldbreak=shield_break,goose=goose)
peaks=dict(idle=.7,click=.6,crumb=.7,horn=.9)
for name,fn in specs.items():
    d=save(name,fn(),peaks.get(name,.88),loop=(name=='idle'),fadein=name not in ('click','crumb','cyclebell'));print(f'{name:12s}{d:5.2f}s')
import sys
if '--sheep-fallback' in sys.argv:print('sheep',round(save('sheep',sheep_fallback(),.85),2),'s')
