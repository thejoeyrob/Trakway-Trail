# Behind-the-truck camera (prototype)

Branch: `chase-cam-prototype`. Preview: `previews/chase/play.html?rich&chase`. It is a **camera**, not a second game: it uses the same Drive model, roads, hazards, pickups, collisions, HUD, controls and sounds as the top-down view, and can be switched on/off in **In the cab → Behind-the-truck camera (new)** or with `?chase` in the URL.

## How it works
`public/js/chase.js` draws a pseudo-3D road row by row (like classic arcade racers) from the road bands the game already has (`route-world.js`), exaggerates the bends so the road visibly winds, and stands every object on it as a scaled billboard sorted far to near. The truck is ChatGPT's "rear above" view from the showroom sheet, recoloured for your paint and decal. Hazards, pickups and scenery are drawn in code in `public/js/chaseart.js` (rear views of cars, tractors, vans, bin lorry, cows, etc.). Collisions are unchanged: an item hits when it reaches the truck's depth.

## What is placeholder
* All billboards are drawn in code. They read well but are not painted. For the polished look in your mock-up, generate real painted billboards (prompt below) and I will wire them in the same way the top-down vehicle atlas is.
* The sky, hills and road surface are simple gradients and flat colours (no photographic texture yet).
* Upgrade parts (light bar, stacks, horns) are not drawn on the rear view yet.

## Painted billboard sheet (optional)
Transparent 2048x2048 sheet, 4 x 4 equal cells, each object centred with its BASE at the bottom-centre of the cell, seen from BEHIND and slightly above, polished 3D-game look, soft light from top-left, no ground, no text outside objects.
Row 1: orange traffic cone; red-and-white road barrier with amber lamps; blue hatchback (rear); red double-decker/city bus (rear).
Row 2: stone low-bridge arch with a 3.9 m height roundel; wooden weak bridge with 7.5 t roundel; green farm tractor (rear); Friesian cow (rear, tail swishing).
Row 3: cream British ice-cream van (rear, giant cone on the roof, ICE CREAM lettering); UK green refuse lorry (rear, hi-vis chevrons, REFUSE); cream touring caravan (rear); round hay bale.
Row 4: five Morris dancers (rear, waving hankies); four road cyclists (rear); flock of geese; red-brick house with grey slate roof (front).
A second sheet for scenery (trees, hedges, shopfronts, garage, digger, site cabin, lamp posts) and one for the sky/hill backdrop can follow the same pattern.

## Update: straight road, water and the cab

- The road no longer bends or sways. Five fixed lanes; a lane is tarmac only where the map has drivable surface under it, otherwise it is grass or, at a river bend, **water**.
- Nothing steers the lorry away from water. A "WATER AHEAD · MOVE OVER" hint shows about 850 units before it, and the river is visible far down the road. Drive in and it is **SILLY DIPPING** (a normal crash: shield or a bailout life saves you and tows you to the nearest road lane).
- The rig sways: the trailer lags the steering (the model's own trailer angle), the whole rig leans into lane changes and bobs on its springs.
- Trailer dropped: a separate rear view of the tractor unit (`ART.cabRear`) in the cab colour.

## Prompt for the remaining art (paste into ChatGPT image generation, one sheet per request)

> Create a transparent-background PNG sprite sheet for a mobile arcade lorry game seen from BEHIND and ABOVE (third-person chase camera, about 25 degrees down). Style: glossy painted toy-like 3D illustration, rich saturated colour, soft top light from the upper left, thin dark outline, gentle ground shadow under every object, clean edges. British roadside setting. Every sprite faces AWAY from the viewer (we see its back), is centred in an equal grid cell with 12 px padding, and stands on a flat base at the bottom of the cell. No text, no road, no background, no cast shadow baked outside the cell.
>
> **Sheet 1, vehicles (4 x 4 cells, 256 px each):** small red hatchback, blue estate car, white van, green double-decker bus, cream ice-cream van with a 99 cone on the roof, orange bin lorry with wheelie bins on the lift, red tractor with a trailer of hay, vintage Morris Minor, cyclist group of three, white caravan, yellow digger, school minibus, police car, milk float, dustcart, motorbike with rider.
>
> **Sheet 2, animals and hazards (4 x 4):** cow (black and white), cow (brown), sheep, flock of three sheep, geese in a line, traffic cone, red-and-white road barrier, roadworks sign board, pothole, mud puddle, oil slick, hay bale, fallen branch, low-bridge arch (stone, with a height bar), weak bridge (wooden planks), flood puddle.
>
> **Sheet 3, roadside scenery (4 x 4):** terraced house, semi-detached house, country cottage with thatch, corner shop, pub with a hanging sign, petrol garage, farm barn, windmill, oak tree, poplar tree, hedge section, drystone wall section, telegraph pole, bus shelter, red phone box, church with spire.
>
> **Sheet 4, pickups (4 x 2):** gold coin, bread crumb, taco, rotating blue boost, night-light moon, hitch, shield bubble, mystery prize box.
>
> **Sheet 5, the lorry from behind (6 x 2 cells, 384 px):** row 1 tractor unit + trailer in six paint colours; row 2 tractor unit only (trailer dropped) in the same six colours. Slightly open mirrors, twin exhaust stacks, glowing red tail lights, number plate, mudflaps.
>
> **Sheet 6, ground tiles (seamless, 512 px each, 3 x 3):** fresh asphalt, worn asphalt with lane paint, mud, river water with ripples, short grass, long grass, paving slabs, gravel, sand.
