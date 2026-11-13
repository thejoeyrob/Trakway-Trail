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
