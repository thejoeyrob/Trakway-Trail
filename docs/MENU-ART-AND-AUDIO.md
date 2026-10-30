# Menu art, menu audio and the JW EDS jingle

## What is where
| Thing | File(s) | Notes |
| --- | --- | --- |
| Home wheel icons | `public/assets/menu/{keys,daily,garage,trophy,guide,settings}.webp` | 512×512, transparent. Source: `tools/menu-art/icons.html`, rendered by `node tools/render-menu-art.cjs` (needs Playwright + Pillow). |
| Menu items, names, taglines | `menuItems()` in `public/js/game.js` | Change the humour here. `art:` is the icon file name. |
| Swipe wheel | `public/js/wheel.js` | Used by the home menu and the garage. |
| Garage | `public/js/garage.js`, `TRUCKS`/`STATS` in `public/js/upgrades.js` | Showroom turntable; unaffordable items are preview-only. |
| Menu music, ignition, idle, rev | `public/audio/{menumusic.mp3,ignition.wav,idle.wav,rev.wav}` | Synthesised by `python3 tools/render-menu-audio.py` (numpy + scipy + ffmpeg). Deterministic. |
| Sound behaviour | `Sound` in `public/js/audio.js` | tap = ignition, then idle + music; swipe = rev; select = soft honk; shift start = fade menu out, game music in. |

## Swapping in painted artwork
The icons are vector illustrations drawn for this game from its own sprites. To use painted art instead, generate six
512×512 transparent images in the game’s style (glossy, painterly, thick teal-black outline, warm rim light, soft ground
shadow, nothing touching the edges) and save them over the files in `public/assets/menu/` with the same names:

- **keys** – a chunky brass truck key on a steel ring with a teal leather fob showing a top-down teal HGV cab.
- **daily** – a gold stopwatch reading 120s with a steaming mug of builder’s tea leaning on it.
- **garage** – three top-down HGV cabs (orange, teal, purple) fanned out under showroom spotlights on a glossy floor, tiny “NEW!” starburst.
- **trophy** – a gold trophy cup with a wide-eyed shocked sheep’s face peeking over the rim, plaque reading “#1 DRIVER”.
- **guide** – a dashboard sat-nav showing a hopelessly looping yellow route and the words “RECALCULATING…”, a sheep wandering past.
- **settings** – a chrome open-ended spanner and a red-handled screwdriver crossed behind a gold cog.

Then run `npm run sync-ios` so the iPhone app picks them up.

## The JW EDS start-up jingle
The jingle was not in the uploaded package, so it is not included. Drop it at **`public/audio/jweds-jingle.mp3`** (then
`npm run sync-ios`). When the file exists the JW EDS intro waits for a tap (browsers only allow sound after a tap) and plays the
jingle as the logo animates; when it doesn’t, the intro auto-dismisses silently exactly as before.

## Honest notes
The engine, ignition and music were generated and checked numerically (levels, loop seams, ordering of events in a real browser),
but nobody has listened to them on a phone speaker yet. If any sound is too loud/quiet/unconvincing, the gains live in `Sound.play()`
(`ignition`, `rev`), `menuOn()` (idle + music levels) and `rev()`.
