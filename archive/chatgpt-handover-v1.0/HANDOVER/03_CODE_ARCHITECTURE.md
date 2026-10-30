# Code, asset and build map — recovered v1.0.0 snapshot

All paths below are under `Truckin-and-Drivin/`.

| Path | Role |
|---|---|
| `public/play.html` + `public/game.css` | Full-screen browser game scene, DOM HUD, overlay panels |
| `public/js/model.js` | Deterministic game state, five-position steering, route/score/hazard/collision/timing logic |
| `public/js/render.js` | Canvas sprite drawing, road-atlas scrolling, **variable width/curve/lane coordinates**, truck/trailer render |
| `public/js/atlas.js` | Sprite/hazard source rectangle mappings |
| `public/js/game.js` | Game view, menus, input events, HUD, browser scores, app bridge |
| `public/js/audio.js` | Original music/effect playback |
| `public/assets/*` | Production WebP raster art, icon, intro image |
| `source-art/*` | Original high-resolution rendered sprites/roads/restrictions/cover/icon and lossless audio masters |
| `art-manifest.json` | Atlas tile geometry and original pixel source references |
| `ART-PROMPTS.json` / `ICON-PROMPT.txt` | Original visual design/generation brief from the work-chat export |
| `public/audio/*` | Production soundtrack, horn, cue and gameplay effects |
| `ios/Truckin.xcodeproj` | UIKit iOS project; source, not signed binary |
| `ios/Truckin/GameViewController.swift` | Offline WKWebView, native bridge, Game Center leaderboard IDs |
| `ios/Truckin/web/*` | Previously bundled offline web code/art/audio; **regenerate after web edits** |
| `tools/sync-ios.mjs` | Bundles web game and sound into native project |
| `.github/workflows/ios-build.yml` | Unsigned simulator build test; NOT App Store signing |
| `app/api/*`, `db/*`, `drizzle/*` | Browser/cloud leaderboard and persistence; distinct from Game Center |
| `tests/game.test.mjs` | 12 deterministic gameplay model tests |
| `docs/APP-STORE-HANDOFF.md`, `docs/VERIFICATION.md` | Original source author's release gating and test record |

## Concrete bug diagnosis from source

`Renderer.shape(z)` toggles or interpolates road width between 520 and 560 depending on 5400-distance scene zones. `Renderer.road()` rescales each horizontal atlas scanline to `(420-width)/2+curve`, and `Renderer.x()` applies width-based lane scaling. Together they deliberately move road edges inward/outward and alter lane spacing; the user explicitly rejected the visible V-shaped size changes. Other atlas tile seams should also be tested around source y-wrap/mirroring.

`Renderer.draw()` renders trailer (`sprite(1, tx, ty, 48, 88, ...)`) and cab (`sprite(truckIndex, px, playerY, 49, 63, ...)`). The requirement after v1 is a longer/larger, visibly connected rig and matching collision math. Maintain coupling in all four environments and double-trailer scenarios.

## Recorded verification for original snapshot

`node --test tests/game.test.mjs`: **12 passed, 0 failed**, measured during handover recheck. No claim is made for device or native signed IPA. `docs/VERIFICATION.md` is the source’s historical record, not newly reproduced TestFlight evidence.

## Source tree and audit data

`06_ORIGINAL_FILE_INVENTORY.csv` lists each of the 187 delivered original paths, uncompressed size, original archive timestamp and SHA256. `07_ORIGINAL_ZIP_SHA256.txt` records the recovered single ZIP fingerprint before splitting. All original file bytes in the two parts are unmodified.
