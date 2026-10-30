#!/usr/bin/env python3
"""Depot / menu audio for Truckin' & Drivin' v1.4: ignition, idle loop, rev blip and a lounge-style menu loop.
Deterministic, no samples. Requires numpy + scipy + ffmpeg. Outputs to public/audio. Menu music is in D minor so it
crossfades cleanly into the in-game road-trip track."""
from pathlib import Path
import subprocess
import numpy as np
from scipy import signal
from scipy.io import wavfile

OUT = Path(__file__).resolve().parents[1] / 'public' / 'audio'
SR = 44100
RNG = np.random.default_rng(301029)
TAU = 2 * np.pi
hz = lambda n: 440 * 2 ** ((n - 69) / 12)
tt = lambda d: np.arange(int(d * SR)) / SR

def filt(x, kind, cut, order=3):
    return signal.sosfilt(signal.butter(order, cut, kind, fs=SR, output='sos'), x)

def norm(x, peak=.89):
    return x / max(1e-9, np.max(np.abs(x))) * peak

def save_wav(name, x, sr=SR):
    x = np.asarray(x)
    if sr != SR:
        x = signal.resample_poly(x, sr, SR)
    wavfile.write(OUT / name, sr, (np.clip(x, -1, 1) * 32767).astype(np.int16))

# ---------- Engine: a lumpy six-cylinder diesel from a firing-frequency curve ----------
def diesel(freq, seed=1, lump=.28):
    """freq: firing frequency in Hz per sample."""
    rng = np.random.default_rng(seed)
    phase = np.cumsum(freq) / SR
    frac = phase % 1
    cyc = phase.astype(int)
    gains = 1 + lump * rng.normal(0, 1, 6)           # each cylinder fires a touch differently
    g = gains[cyc % 6]
    pulse = np.exp(-frac * 9) * g                     # sharp thump decaying inside each firing period
    body = filt(pulse, 'lowpass', 520, 2)
    clack = filt(np.exp(-frac * 38) * g * rng.normal(0, 1, len(freq)), 'bandpass', [900, 3200], 2) * .22   # injector ticking
    rumble = filt(rng.normal(0, 1, len(freq)), 'lowpass', 160, 2) * .5
    x = np.tanh(1.8 * (body * 1.3 + rumble * .35)) + clack
    return x

def lerp_curve(points, d):
    t = tt(d)
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)

def idle_loop():
    d = 2.4
    f = np.full(int(d * SR), 24.0)                    # 24 Hz firing -> 60 firings, a multiple of 6 -> seamless pattern
    x = diesel(f, seed=7, lump=.3)
    xf = int(.08 * SR)                                # equal-power crossfade of the tail into the head
    w = np.linspace(0, np.pi / 2, xf)
    x[:xf] = x[:xf] * np.sin(w) + x[-xf:] * np.cos(w)
    x = x[:-xf]
    return norm(x, .55)

def rev_blip():
    d = .95
    f = lerp_curve([(0, 24), (.08, 26), (.30, 58), (.45, 62), (.95, 25)], d)
    x = diesel(f, seed=11, lump=.2)
    t = tt(d)
    # cutoff opens as the revs rise: crude brightness swell
    bright = filt(x, 'highpass', 300, 2) * np.interp(t, [0, .3, .5, .95], [.15, 1, .8, .1])
    x = x * .9 + bright * .7
    x *= np.interp(t, [0, .04, .4, .95], [0, 1, .9, 0])
    return norm(x, .8)

def ignition():
    d = 2.6
    t = tt(d)
    x = np.zeros_like(t)
    # starter crank 0 - 1.05 s: slowly turning engine, uneven compression pulses plus a whirring starter motor
    n = int(1.05 * SR)
    f = np.interp(t[:n], [0, .25, 1.05], [5.5, 8.0, 9.5])
    crank = diesel(f, seed=3, lump=.5) * .9
    whirr = np.sin(TAU * np.cumsum(np.interp(t[:n], [0, .3, 1.05], [90, 135, 150])) / SR) * .12
    whirr += filt(RNG.normal(0, 1, n), 'bandpass', [400, 1600], 2) * .07
    x[:n] += (crank + whirr) * np.interp(t[:n], [0, .05, 1.0, 1.05], [0, 1, 1, .7])
    # catch: stuttering firing, flare, settle back to the 24 Hz idle (so the idle loop picks up seamlessly)
    f2 = np.interp(t[n:], [1.05, 1.3, 1.55, 1.85, 2.15, 2.6], [10, 16, 40, 52, 30, 24])
    catch = diesel(f2, seed=9, lump=.35)
    x[n:] += catch * np.interp(t[n:], [1.05, 1.15, 1.5, 2.6], [.5, .9, 1, .8])
    return norm(x, .85)

# ---------- Menu music: 88 BPM lounge-funk in D minor ----------
BPM = 88
BEAT = 60 / BPM
BAR = 4 * BEAT
BARS = 16
LEN = BARS * BAR

def env(n, a=.005, d=.2, s=.4, r=.1):
    n = int(n); na = min(int(a * SR), n); nr = min(int(r * SR), max(0, n - na)); nd = min(int(d * SR), max(0, n - na - nr))
    o = np.full(n, s)
    if na: o[:na] = np.linspace(0, 1, na)
    if nd: o[na:na + nd] = np.exp(np.linspace(0, np.log(max(s, .001)), nd))
    if nr: o[-nr:] = np.linspace(s, 0, nr) ** 1.2
    return o

def tine(note, d, vel=1.0):
    """Electric-piano tine: FM with a decaying modulator, a little tremolo."""
    t = tt(d); f = hz(note)
    mod = vel * 1.7 * np.exp(-t * 4.5) * np.sin(TAU * f * t)
    x = np.sin(TAU * f * t + mod) + .25 * np.sin(TAU * 2 * f * t + .5 * mod) * np.exp(-t * 3)
    x *= (1 + .08 * np.sin(TAU * 4.6 * t))
    return x * env(len(t), .004, .35, .55, .25)

def bass(note, d):
    t = tt(d); f = hz(note)
    p = TAU * f * t
    x = np.sin(p) + .35 * np.sin(2 * p) * np.exp(-t * 6) + .12 * np.sin(3 * p) * np.exp(-t * 10)
    return np.tanh(1.1 * x) * env(len(t), .006, .08, .7, .08)

def vibes(note, d):
    t = tt(d); f = hz(note)
    x = sum(np.sin(TAU * f * k * t) * w * np.exp(-t * dc) for k, w, dc in [(1, .8, 2.4), (4, .22, 7), (10, .08, 14)])
    x *= 1 + .18 * np.sin(TAU * 5.4 * t)
    return x * env(len(t), .002, .3, .5, .35)

def kick():
    t = tt(.3)
    return .9 * np.sin(TAU * (46 * t + 70 * .03 * (1 - np.exp(-t / .03)))) * np.exp(-t * 12)

def snare():
    t = tt(.22)
    n = filt(RNG.normal(0, 1, len(t)), 'bandpass', [700, 9000])
    return (.5 * n * np.exp(-t * 22) + .3 * np.sin(TAU * 190 * t) * np.exp(-t * 26)) * .8

def hat(d=.07, g=1):
    t = tt(d)
    return filt(RNG.normal(0, 1, len(t)), 'highpass', 7000) * np.exp(-t * 70) * g

def put(dst, src, sec, g=1, pan=0):
    i = int(sec * SR)
    if src.ndim == 1:
        src = np.stack([src * np.sqrt((1 - pan) / 2), src * np.sqrt((1 + pan) / 2)], axis=1)
    idx = (np.arange(len(src)) + i) % len(dst)          # wrap -> seamless loop
    np.add.at(dst, idx, src * g)

def menu_music():
    mix = np.zeros((int(LEN * SR), 2))
    # D minor family, two bars each: Dm9 | Bbmaj7 | Fmaj7 | A7(b13) -> back to Dm
    chords = [[50, 57, 60, 64, 65], [46, 53, 57, 60, 62], [53, 57, 60, 64, 67], [45, 55, 59, 61, 64]]
    roots = [38, 34, 41, 33]
    for bar in range(BARS):
        b = bar * BAR; k = (bar // 2) % 4; ch = chords[k]
        # drums: laid-back half-time pocket
        put(mix, kick(), b, .55); put(mix, kick(), b + 2.5 * BEAT, .42)
        put(mix, snare(), b + 2 * BEAT + .012, .42, .08)
        for s in range(8):
            put(mix, hat(.07 if s % 2 else .09, 1), b + s * BEAT / 2 + (.016 if s % 2 else 0), .05 + .03 * (s % 2 == 0), .25)
        # bass: root-fifth walk with ghost note
        r = roots[k]
        for off, n, d, g in [(0, r, .55, 1), (1.5, r + 7, .3, .7), (2.5, r, .4, .85), (3.25, r + 12 if bar % 2 else r + 5, .3, .6)]:
            put(mix, bass(n, d), b + off * BEAT, g * .30)
        # electric piano comps (offbeat stabs) + warm sustained pad of the top two notes
        for off, g in [(.75, .7), (2.25, .6), (3.5, .5)]:
            for j, n in enumerate(ch[:4]):
                put(mix, tine(n + 12 if j else n + 12, 1.1, .8), b + off * BEAT + j * .006, g * .052, -.3 + j * .1)
        for n in ch[1:3]:
            put(mix, tine(n + 12, BAR * .98, .35), b, .02, .35)
    # sparse vibraphone hook, answers itself in the second half
    hook = [(0, 74, 1.5), (1.5, 77, .5), (2, 76, 1), (3, 72, 1), (4.5, 69, .5), (5, 72, 1.5), (6.5, 74, .5), (7, 70, 1),
            (8, 74, 1), (9, 77, .5), (9.5, 79, 1.5), (11, 76, 1), (12, 72, 1), (13, 74, 1.5), (14.5, 72, .5), (15, 69, 1.5)]
    for rep in range(2):
        for beat, n, ln in hook:
            bar_off = rep * 8 * BAR + beat * BEAT * 2 if False else (rep * 8 * BAR + beat * BEAT * 2)
            pos = (rep * 8 * BAR) + beat * BEAT * 2
            if pos >= LEN: continue
            note = n + (12 if rep == 1 and beat % 3 == 0 else 0)
            put(mix, vibes(note, ln * BEAT * 1.6), pos, .085, .2 if rep == 0 else -.2)
            put(mix, vibes(note, ln * BEAT * 1.6), pos + BEAT * .75, .028, -.4)   # soft echo
    # warm tape-ish high cut, light slap reverb
    mix = np.stack([filt(mix[:, 0], 'lowpass', 9000, 2), filt(mix[:, 1], 'lowpass', 9000, 2)], axis=1)
    wet = np.zeros_like(mix)
    for dly, g in [(.083, .22), (.137, .16), (.211, .11), (.307, .07)]:
        wet += np.roll(mix, int(dly * SR), axis=0) * g
    mix = mix + wet[:, ::-1] * .6
    return norm(mix, .68)

def to_mp3(wav, mp3):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(wav), '-codec:a', 'libmp3lame', '-q:a', '4', str(mp3)], check=True)

if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    save_wav('ignition.wav', ignition(), 22050)
    save_wav('idle.wav', idle_loop(), 22050)
    save_wav('rev.wav', rev_blip(), 22050)
    m = menu_music()
    tmp = OUT / '_menu.wav'
    wavfile.write(tmp, SR, (np.clip(m, -1, 1) * 32767).astype(np.int16))
    to_mp3(tmp, OUT / 'menumusic.mp3')
    tmp.unlink()
    print('menu audio rendered: music %.1fs, bpm %d' % (LEN, BPM))
