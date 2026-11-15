# Route map (chase-cam build)

The road is an endless chain of 3,900-unit segments. Each belongs to a biome (**city, urban, country, highway**) and is one of **10 authored variants** of that biome (40 layouts in all, `recipe()` in `public/js/route-map.js`). Segments are joined in a shuffled order that never repeats a biome back to back, every run starts at a different segment, and each segment blends from the previous one's plain layout, so there are no square ends.

Five lane slots always exist (world x = 54 + 78 × lane). Each slot is drivable (road, **bus lane**, **oncoming lane**) or something else (closed for roadworks, **water**, **parked cars**, central reservation, bridge parapet, verge, hedge). Features (roadworks, bus lane, lake, dual carriageway, parking, bridge, widening, narrowing, plus zebra crossings and side junctions) change the slots over a stretch with long tapers. The game model only sees the drivable bands, so hazards, pickups, fines and contact work as before.

Rules in the model: bus lane £60, oncoming lane £150 (and oncoming traffic is spawned in it), water = silly dipping, parked cars / parapet = crash, roadworks lane = off-road fine. Cows and sheep appear only in the country, tractors only in the country, and so on (`FUNNY_AT` in `model.js`).

Roadside: buildings are drawn as facades on a plane that faces the road (`facades.js`, `drawLot` in `chase.js`), so houses face the road. No red-and-white kerbs: grey kerbs and pavement in town, grass verge and hedge in the country, hard shoulder on the motorway.

Night: the headlight beam in the chase view reaches 460 / 680 / 950 / 1350 units at light-bar level 0 / 1 / 2 / 3.

Upgrade prices: level 1 = list price, level 2 about 3.2x, level 3 8x. A typical shift earns around £3,000.

Tests: `tests/route-map.test.mjs` (variants, continuity of the legal path, smooth edges, roadside geometry). `npm test` runs the older tests with `TRUCKIN_ROUTE=legacy`.
