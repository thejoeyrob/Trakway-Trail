#!/usr/bin/env python3
"""Marketing captions for the App Store screenshots. Takes the real in-game screenshots from store/screenshots/<device>/ and puts each on a
blue card with a headline (Anton italic, like the title) and a one-line sub-head. The game itself is never altered or imitated.
Output: fastlane/screenshots/en-GB/<device>-NN.png  (fastlane deliver picks the display size from the pixel dimensions).
Run: python3 tools/store-captions.py ios-iphone-6.9 ios-ipad-13"""
import sys, io, glob, os, tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
from fontTools.ttLib import TTFont
ROOT=Path(__file__).resolve().parents[1]
def ttf(name):
    out=Path(tempfile.gettempdir())/(name+'.ttf')
    if not out.exists():
        f=TTFont(ROOT/'public/assets/fonts'/(name+'.woff2'));f.flavor=None;f.save(out)
    return str(out)
ANTON=ttf('Anton-400');BARLOW=ttf('BarlowSemiCondensed-700')
CAPTIONS={
 '01':('HIT THE ROAD!','An arcade trucking adventure like no other.'),
 '02':('DELIVER THE GOODS!','Follow the golden trail and bank your pay.'),
 '03':('BUILD YOUR RIG!','Paint, roof graphics and upgrades you can see.'),
 '04':('WHAT DID YOU HIT?','Cows, ice-cream vans, bin lorries and more.'),
 '05':('FUNNY ENDINGS!','Every crash is a cartoon.'),
 '06':('NIGHT SHIFT!','Double bubble after dark.'),
}
def italic(img,shear=.22):
    w,h=img.size;pad=int(h*shear);big=Image.new('RGBA',(w+pad,h),(0,0,0,0));big.paste(img,(pad//2,0))
    return big.transform(big.size,Image.AFFINE,(1,shear,-pad*shear*0+0,0,1,0),Image.BICUBIC)
def headline(text,W,size):
    font=ImageFont.truetype(ANTON,size);d=ImageDraw.Draw(Image.new('RGBA',(10,10)));bb=d.textbbox((0,0),text,font=font,stroke_width=int(size*.07))
    tw,th=bb[2]-bb[0]+int(size*.5),bb[3]-bb[1]+int(size*.4);layer=Image.new('RGBA',(tw,th),(0,0,0,0));ld=ImageDraw.Draw(layer)
    off=int(size*.07)
    ld.text((int(size*.25)-bb[0]+0,int(size*.14)-bb[1]+off*1.4),text,font=font,fill=(8,28,74,255),stroke_width=int(size*.07),stroke_fill=(8,28,74,255))
    ld.text((int(size*.25)-bb[0],int(size*.14)-bb[1]),text,font=font,fill=(255,214,31,255),stroke_width=int(size*.07),stroke_fill=(8,28,74,255))
    return italic(layer,-.16)
def card(shot,cap,W,H):
    bg=Image.new('RGB',(W,H));px=bg.load()
    top=(36,128,232);bot=(8,52,138)
    grad=Image.linear_gradient('L').resize((1,H)).resize((W,H))
    bg=Image.composite(Image.new('RGB',(W,H),bot),Image.new('RGB',(W,H),top),grad)
    # soft light rays from the top
    rays=Image.new('RGBA',(W,H),(0,0,0,0));rd=ImageDraw.Draw(rays)
    for i in range(-6,8):rd.polygon([(W*.5,-H*.05),(W*.5+i*W*.16-W*.06,H*.55),(W*.5+i*W*.16+W*.06,H*.55)],fill=(255,255,255,16))
    bg=Image.alpha_composite(bg.convert('RGBA'),rays)
    # headline + sub-head
    hs=int(W*.115);h=headline(cap[0],W,hs)
    if h.width>W*.94:
        hs=int(hs*W*.94/h.width);h=headline(cap[0],W,hs)
    bg.alpha_composite(h,((W-h.width)//2,int(H*.028)))
    sub=ImageFont.truetype(BARLOW,int(W*.046));d=ImageDraw.Draw(bg);tw=d.textlength(cap[1],font=sub)
    sy=int(H*.028)+h.height-int(hs*.05)
    d.text(((W-tw)/2+2,sy+3),cap[1],font=sub,fill=(6,26,70,255));d.text(((W-tw)/2,sy),cap[1],font=sub,fill=(255,255,255,255))
    # the real screenshot, in a dark bezel with rounded corners
    top_y=sy+int(W*.075);avail=H-top_y-int(H*.02);sw=min(int(W*.78),int(avail*shot.width/shot.height));shh=int(sw*shot.height/shot.width)
    if shh>avail:shh=avail;sw=int(shh*shot.width/shot.height)
    scr=shot.convert('RGB').resize((sw,shh),Image.LANCZOS);r=int(sw*.07);m=Image.new('L',(sw,shh),0);ImageDraw.Draw(m).rounded_rectangle((0,0,sw-1,shh-1),r,fill=255)
    bez=int(sw*.025);frame=Image.new('RGBA',(sw+2*bez,shh+2*bez),(0,0,0,0));fd=ImageDraw.Draw(frame)
    fd.rounded_rectangle((0,0,frame.width-1,frame.height-1),r+bez,fill=(10,14,20,255),outline=(70,82,96,255),width=max(2,bez//5))
    frame.paste(scr,(bez,bez),m)
    sh=Image.new('RGBA',frame.size,(0,0,0,0));sh.paste((0,0,0,140),(0,0,frame.width,frame.height),frame.getchannel('A'));sh=sh.filter(ImageFilter.GaussianBlur(int(W*.012)))
    x=(W-frame.width)//2;bg.alpha_composite(sh,(x,top_y+int(W*.012)));bg.alpha_composite(frame,(x,top_y))
    return bg.convert('RGB')
if __name__=='__main__':
    devs=sys.argv[1:] or ['ios-iphone-6.9','ios-ipad-13']
    out=ROOT/'fastlane/screenshots/en-GB';out.mkdir(parents=True,exist_ok=True)
    for dev in devs:
        files=sorted(glob.glob(str(ROOT/'store/screenshots'/dev/'*.jpg')))
        for f in files:
            n=os.path.basename(f)[:2];cap=CAPTIONS.get(n)
            if not cap:continue
            shot=Image.open(f);W,H=shot.size
            card(shot,cap,W,H).save(out/f'{dev}-{n}.png',optimize=True);print('wrote',dev,n)
