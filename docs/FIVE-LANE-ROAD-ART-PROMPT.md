# Five-lane road art — brief for the next art pass

**Why:** the shipped `roads.webp` was generated from the original `ART-PROMPTS.json` prompt, which asked for *"TWO normal road lanes only, thin broken
cream centerline at 50%"* (see `art-manifest.json` → `roads.guidance`: "Normal dashed two-lane center marking"). The game steers across **five** positions, so
v1.4 draws translucent lane guides over the art (`Renderer.laneGuides`, Settings → "Show the five lanes"). Painted five-lane art would replace that overlay.

**Also worth fixing in the same pass:** lane spacing is currently 56 px (`laneX` in `geometry.js`) but the rig is ~61 px wide, so the truck is wider than a lane.
Five wider lanes (~70 px) would fit it properly.

## Prompt (for the image generator, same style as the other atlases)
> Use case: stylized-concept. Asset type: vertically repeatable terrain texture atlas for a premium top-down cartoon mobile truck-driving game. One square 2048x2048 image divided into exactly FOUR equal quadrants, each an independent straight vertical road tile, no borders/gutters/text. Camera exactly overhead orthographic plan view, no perspective. Same bright rendered 3D cartoon style, tactile asphalt/brick/foliage detail and warm consistent sunlight as the existing art. In EVERY quadrant the asphalt is the same straight charcoal road centred at 50% of the quadrant width, spanning x=22% to x=78% with straight vertical edges top to bottom, containing **FIVE equal-width lanes (each exactly 11.2% of the quadrant width)** separated by **four thin broken cream dashed lane dividers at x = 33.2%, 44.4%, 55.6% and 66.8%**, identical dash length and phase in all four quadrants so the pattern loops seamlessly. Solid cream edge lines at 22% and 78%. No cars, animals or objects on the road. Top-left: British town — brick shops, grey paving, streetlamps, planters on the outer 22% strips. Top-right: lush countryside — hedges, wildflowers, stone walls, fields. Bottom-left: residential estate — red/cream rooftops, gardens, driveways. Bottom-right: warm dusty construction site — timber stacks, excavation dirt, cones. The top and bottom edge of each quadrant must tile vertically with itself.

## Hand-off
Save as `public/assets/roads.webp` (1254×1254 is fine) and `source-art/roads.png`, then ask Claude to: set lane spacing to 11.2% of the tile width, retune the road crop in
`Renderer.road`, hide the overlay by default, re-check hazard/pickup/breadcrumb lanes and hitboxes, run the tests and `npm run sync-ios`.
