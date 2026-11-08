# Road world v2 — design and integration map

## Player experience
The five existing steering positions are retained as familiar input targets; they are no longer five permanent painted lanes. Driveable bands narrow, curve and divide around islands. The truck does not auto-follow the road. Seven seeded motifs rotate through shuffled bags without adjacent repeats: S-bend, farm fork, estate fork, roadworks, village, contraflow and river bend. Town, countryside, estates and work sites use coherent surface/scenery layers. Road continuity comes from shared boundary geometry and texture tiling rather than separately drawn road pictures.

Signs appear in the world and the compact HUD gives route decisions. Farm tracks offer reward with mud; residential access and wrong-way branches impose fines. Oncoming traffic is a physical collision risk. Decorative props and collision-enabled props are explicitly distinguished in route-world.js. Houses, works, barriers and surfaces occupy the road naturally; hitboxes are authored with the sprites, never inferred from pixels.

## Main modules
| File | Responsibility |
|---|---|
| public/js/route-world.js | Seeded routes, bands, legal corridors, signs, scenery positions, pickup path planning |
| public/js/route-render.js | Continuous road painting, layered ground, kerbs, scenery, signs and debug footprints |
| public/js/route-hazards.js | Visual sizes, smaller collision footprints, effects and swept overlap |
| public/js/route-atlas.js | Five sheet registrations and crop rectangles |
| public/js/model.js | Existing economy/run logic plus geometry-aware spawning, grip, trailer and route offences |
| public/js/render.js | Road painter, truck/trailer assembly, original effects and overlays |
| public/js/showroom.js | Eight real rendered viewpoints and view-anchored upgrades |
| public/js/game.js / garage.js | Existing UI integration, trailer action, signs and showroom interaction |
| tools/sync-ios.mjs | Rebuild offline native bundle and copy new art |

## Tuning and fairness
World chunks are 2600 arcade units. Steering targets are x=54/132/210/288/366. Road band contact, hazard placement and painting share the same route model. Delivery trails use a backward viability planner so a pickup trail does not demand a jump across a fork island. Legal trails avoid restricted branches before the fork decision. Generation uses the existing seeded game progression, not a repeating scenery strip.

Cab-only speed is 16% higher with quicker steering. Drop trailer with the labelled button or X; it discards the current unbanked delivery, leaves earned cash untouched and removes trailer collision points. A green hitch pickup or new delivery attaches a trailer again. Mud applies a 4.8-second grip state, reducing steering responsiveness; clean-road travel recovers handling. It is temporary and does not permanently downgrade the truck. Access-route fee is £90, no-entry fee £120, applied once per section. Optional prize value is £85. Overall speed cap is 510 world units/second. Review constants in model.js when balancing against the current economy; these are initial tuned values, not analytics-validated retention results.

Risky optional prizes are separate from legal delivery trails. The player can skip them. Do not spawn unavoidable obstacle walls or require paid upgrades to clear a route. Keep signs readable before a commitment and retain an escape corridor for the full articulated truck. Geometry tests cover reachability but cannot replace human difficulty playtesting.

## Truck artwork
Top-down cab/trailer atlases replace the earlier mismatched sprites; the existing articulated hitch pose is retained. Three cab colours, box and flatbed trailers, exhaust/lightbar/roof accessories use shared art. Garage uses eight discrete camera views, selected by drag/rotation, rather than spinning a flat overhead sprite. This is a multi-view 2D showroom, not a continuous 3D model. Colour variants and accessory placements are rendered per view. Reduced-motion mode disables idle rotation.

## Preserve existing systems
Keep the menu, nine upgrades, decals, driver registration, daily challenge, earnings/damage economy, taco breaks, horn/sheep interaction, night content, comic crash scenes, native bridge and Game Center. Save keys are unchanged. Old active checkpoints migrate route content while retaining progression/balance/seed; verify with a real existing device save before release.

## Assets and production
Runtime WebP sheets are in public/assets/route-v2; raw sources in archive 03. Crop definitions are authoritative in route-atlas.js. Source atlases contain 16 surfaces, 16 prop cells, 8 truck/accessory cells, 8 showroom views and 8 scenery cells. Generated 1254-square or 1774x887 dimensions are supplied as produced, not advertised as 4K. Prompt log records image-generation provenance; it is not a third-party licence certificate. Retain the project’s existing audio/asset credits. No Temple Run or Sonic artwork is copied.

For a new motif, define entry/exit geometry and legal route bands first, then art placements and collision footprints, then spawn/reward plans. Add it to corridor/seed tests and inspect it at maximum speed on a small phone. Do not draw scenery over an unregistered collision point. QA debug footprints are for development only. The localhost-only truckinQA hook is used by the browser tests and is unavailable on production hosts.
