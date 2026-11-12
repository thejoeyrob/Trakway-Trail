# Painted vehicle art (optional upgrade)

The funny vehicles are drawn in code (`public/js/propart.js`) so the game always works. If you would like painted versions in the same style as the rest of the
route-world art, generate ONE sheet and save it as **`public/assets/route-v2/vehicles.webp`**. The game uses it automatically (nothing else to change). If the file
is missing, the drawn versions are used.

## The sheet
Transparent PNG/WebP, square (2048 x 2048 recommended), **4 columns x 4 rows of equal cells**, each object centred in its cell, no text outside the objects, no shadows
cast beyond the object, soft contact shadow only. Orthographic top-down (straight down, front of vehicle pointing UP the sheet), the same polished painted look and
lighting (light from top-left) as the existing `props` and `trucks` sheets.

Cell order (left to right, top to bottom):
1. Friesian cow (black and white), standing, seen from above, head at the BOTTOM of the cell looking at the viewer
2. Green farm tractor, big rear wheels, small front wheels, cab roof, front pointing UP
3. British ice-cream van: cream body, pink and turquoise stripes, giant cone on the roof, "ICE CREAM" lettering, serving hatch awning on the right side, front pointing UP
4. UK refuse lorry: green body, white cab, rear hopper, hi-vis red and yellow chevrons at the back, two wheelie bins, front pointing UP
5. Blue hatchback towing a cream touring caravan, front pointing UP (tall cell: object is about 2.5 x taller than wide)
6. Round golden hay bale with orange straps
7. Flock of five white geese, loose group
8. Morris dancers: five people in white with coloured sashes, hats with flowers, waving hankies
9. Four road cyclists in bright lycra and helmets, riding in a loose group, front pointing UP
10-16. leave empty (transparent)

## Prompt to paste into ChatGPT / an image model
"Use case: stylized-concept. Asset type: premium top-down UK truck arcade game transparent sprite atlas. ONE 2048x2048 sheet, exactly 4 columns x 4 rows of equal
square cells, each object centred in its cell on a transparent background, orthographic overhead view (looking straight down), richly rendered like polished 3D game
assets, soft daylight from the top-left, no text outside the objects, no ground, no borders. Row 1: a Friesian cow seen from above with its head at the bottom of the
cell; a green farm tractor with big rear wheels (front pointing up); a British ice-cream van, cream with pink and turquoise stripes, giant ice-cream cone on the roof,
'ICE CREAM' lettering, striped serving awning on its right side (front pointing up); a UK green refuse lorry with white cab, rear hopper, red and yellow hi-vis chevrons
and two wheelie bins (front pointing up). Row 2: a blue hatchback towing a cream touring caravan (front pointing up, very long cell); a round golden hay bale with
orange straps; a loose flock of five white geese; five Morris dancers in white with coloured sashes and flowered hats waving hankies. Row 3: four road cyclists in bright
lycra and helmets riding in a group (front pointing up); then leave the rest of the sheet empty. Keep each object fully inside its own cell with a margin."
