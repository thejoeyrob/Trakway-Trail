# Original work-chat requirements and recoverable work trail

**This is a reconstruction of the original Truckin Drivin Game Design work chat, not a verbatim export.** Only details attributable to that game’s original work-chat instructions and its delivered v1.0.0 source are included.

## Game concept and presentation

Truckin’ & Drivin’ — colourful, nostalgic, approachable British truck-driving arcade experience designed primarily for a portrait, edge-to-edge iPhone game, with App Store ambition. Real rendered, high-quality cartoon art/sprite imagery — **do not** replace visual scenes, trucks, buildings or other artwork with simple procedural polygons or geometric placeholders. Minimal in-play HUD. Show menus in deliberate windows/panels instead of obstructing the road.

## Interaction and driving

- Five distinct left-to-right truck positions/lanes, with **one swipe left/right = one adjacent position**. What the player sees in the road artwork must correspond to reachable truck positions; inputs, road markings and collision/hazard paths must agree.
- Double-tapping the road is a horn action; a dedicated horn control is also implemented. Sheep crossings are timed to a baa/horn cue.
- The truck should feel substantial: correct top-down/plan view proportions, visibly **larger and longer** than the original draft, with articulated truck/trailer sections **physically connected**, including when steering and in double-trailer jobs.
- The rolling scenery should feel faster and less repetitive, without losing control or legibility. Road width and lane positions should remain consistent at tile joins and through scene transitions.

## Gameplay already built into v1.0.0

Four location environments (urban/town, country, suburban/residential, construction), delivery jobs, collectible breadcrumb trails and payoffs, direction and restriction hazards, upgrades, distinctive truck liveries, double-trailer challenges, trailer sway/jackknife risks, a daily challenge and high-score functionality. Include humorous British touches, taco/tacho breaks, the horn/sheep encounter, and the existing **“OH FLOCK!”** comic result: **retain this exact joke**.

## Specific feedback subsequently given in the same work chat

- Increase truck and trailer length/visual scale; fix hitch alignment and perspective.
- Road markings and the visible five lane positions must match each steering swipe precisely.
- Increase the sense of pace.
- Reduce intrusive banner/HUD elements and avoid covering gameplay.
- Replace the obstructive sheep-horn prompt with a panicky farmer appearing with a short speech bubble: **“beep the sheep”**. The farmer image is provided separately in `HANDOVER/POST-V1-ASSET/` and has not been integrated into v1.0.0.
- Improve the sheep **baa** sound, which was judged inadequate.
- Maintain full-screen artwork with cleaner menu windows, preserve “OH FLOCK!”, and prepare a route to TestFlight/App Store Connect.
- Final explicit road correction: even out road/map join points. The roadway visibly widens and narrows with a vertical **V-shaped pinch/wedge on both edges** where road segments connect. Eliminate this changing width across joins; do not simply disguise it with UI elements.

## Chronology and status

- 29 Oct 2026, original work chat: game concept and feature development; original rendered-source assets and code assembled.
- 29 Oct 2026 around 13:12 UTC: v1.0.0 iOS-and-source ZIP delivered (recovered here); source verification record states 12 model tests pass, but no signed native build.
- Same work-chat feedback after delivery: improve truck dimensions, lane alignment, pace, HUD, sheep prompt and sound; farmer asset rendered after v1.0.0.
- Further work-chat instruction: fix conspicuous vertical V/variable-width joins in the scrolling map.

No recoverable **revised, integrated** original-work-chat source package was found for those after-v1 items. Treat them as pending, not completed.
