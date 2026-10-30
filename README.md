# TRUCKIN’ & DRIVIN’ — v1.4

Original artwork-first, portrait, five-position British HGV arcade game. Runs as an installable web app (PWA) and as a native iOS 17+ app.

## Run it

```bash
npm run dev      # static server -> http://localhost:8080  (no install step, no dependencies)
npm test         # 21 deterministic gameplay tests (Node 22+)
npm run check    # JS syntax, manifest and service-worker asset sanity check
npm run sync-ios # regenerate the native offline bundle in ios/Truckin/web after editing public/
```

## Deploy the web version

The game is a plain static site: **the web root is `public/`** (entry `play.html`, `/` rewrites to it).

- **Vercel:** import the repo; `vercel.json` already sets `outputDirectory: public`, no build step.
- **GitHub Pages / Netlify / Cloudflare Pages / any static host:** publish the `public/` folder.
- **iPhone (TestFlight):** see `docs/CLOUD-BUILD-TESTFLIGHT.md` (GitHub Actions on macOS, no local Xcode needed).

The online leaderboard needs a backend (the old ChatGPT-hosted one is archived in `legacy-chatgpt-host/`). Without it the game automatically
falls back to an on-device leaderboard, and uses Game Center on iOS. Nothing else depends on a server.

## v1.4 changes

- **New home experience.** Clean cover art with a flashing TAP TO START; tapping fires the truck’s ignition, darkens the scene a touch and raises a continuous swipe wheel of illustrated icons (keys, tea + stopwatch, showroom, trophy-sheep, sat-nav, spanners). Revs on every swipe, a soft honk on select, lounge menu music over engine idle that hands over to the road-trip track when a shift starts. See `docs/MENU-ART-AND-AUDIO.md`.
- **Showroom garage.** Spinning turntable that shows your truck exactly as it will drive (drag to spin), wheel-picker for trucks, liveries and upgrades, stat before→after, and padlocked *preview-only* items with “Keep truckin’ · £X to go”.
- **One button system** across every screen, and proper home-screen icons (180/192/512 + maskable).
- **More ways to end a shift, each with its own comic vignette** (like the original OH, FLOCK!): car → *OH, BUMPER!*, low bridge → *SUNROOF!*, weak bridge → *PLANK YOU!*, oil slick → *SPIN CYCLE!*, house → *KNOCK, KNOCK!*. Tap to skip. Level-3 Mates’ Rates insurance gives one £400 bail-out per shift. Add a new one by adding a `CRASHES` line in `model.js` and a `COMICS` entry in `game.js`.
- Home: Garage / Leaderboard / Driver’s Guide are one tap away again (the hidden “Depot menu” is gone); personal best + wallet shown on legible pills.
- Difficulty ramp: speed and hazard density climb with distance, so long shifts end on skill rather than boredom. First sheep now arrives after the first job.
- HONK button pulses the instant the sheep bleat, so the one time-critical input can’t be missed.
- Offline-first leaderboard: no more failed `/api` calls on static hosts; zero-score runs no longer clutter the board; honest labels.
- Garage preview no longer stretched; PWA manifest works from any URL path; precache version bumped.
- Repo restructured: game, iOS app, tests and docs at the top level; the ChatGPT-hosting scaffold archived in `legacy-chatgpt-host/`. Web CI added.

## Gameplay

Rendered 2D art and character sprites rather than block geometry. Roadway and five movement locations line up. Countryside, suburban, city and construction backdrops scroll seamlessly. Road-integrated weak/low bridges, bus lanes, no-entry lanes, narrow sections, gardens and works have advance warning signs in the affected road position. Drive the bigger articulated truck; physically pivoting trailers and meaningful sway; double-trailer assignments risk jackknifing.

Pick up a delivery pallet, follow a paying golden breadcrumb trail, then hit the finish flag to bank it. Pick up tacos for a paid break and temporary slowdown, thermos coffee for a turbo burst, or a glowing night-shift moon for dim-road driving and forty double-value coins. Upgrade lights, suspension, steering response, stability, insurance, washroom, bunk and exhaust. Earn two custom liveries and three decal styles. Farmer calls “BEEP THE SHEEP!” with sheep audio cue; the original **OH FLOCK!** failure vignette remains intact. An optional US-flag “Why tacos?” explainer appears on the end-of-shift receipt.

All currency, earnings and equipment upgrades are fictional in-game rewards; no ads or IAP. The JW EDS splash artwork is sourced from the user's Zombie Smash project.

## Source and tests

`public/play.html` — browser/PWA entry. `public/js/model.js` — deterministic game model. `public/js/geometry.js` — lane/rig coordinates. `public/js/render.js` — image-based rendering. `public/js/upgrades.js` — garage upgrades. `tests/game.test.mjs` — 19 deterministic tests; run with `node --test tests/game.test.mjs` (Node 22+).

`node tools/sync-ios.mjs` generates the native WKWebView offline bundle, all image sprites, and embedded audio with **no npm installation or paid tools**. Upload everything to a private GitHub repository; the included Actions workflows compile on macOS.

The browser leaderboard at `app/api` / `db` is a distinct hosted backend. The iPhone version uses optional Apple **Game Center** (all-time and daily high scores). See `docs/CLOUD-BUILD-TESTFLIGHT.md` for setup.

## Release honesty

The 19 model tests and all JavaScript syntax checks passed in this environment. The code has not been compiled with Xcode, signed by your Apple Team, accepted into TestFlight or tested on a physical iPhone here. The real-sheep WAV download occurs during the cloud release workflow, not in this offline ZIP. This is a **cloud-build-ready source package**, not an already signed `.ipa`, and Apple review approval cannot be guaranteed.
