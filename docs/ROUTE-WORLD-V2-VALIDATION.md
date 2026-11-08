# Validation record — 7 November 2026

Implementation baseline: b3b319382f6a7b88f481513d20823c303d764f2b. Upgrade version 2.0.0.

- `npm test`: 46 passing model tests, zero failures. Includes retained game behaviour plus route boundaries, seed variation, no adjacent motif repeats, legal corridors, single-step reward trails, route fees, mud recovery, trailer drop/hitch, save preservation, scenery footprints and showroom viewpoints.
- Coverage includes 100 route seeds over 100,000 units and 3,000 legal delivery trails. The previous flat-road hazards-per-minute expectation was replaced with geometry/reachability coverage because road clearance now governs spawns.
- `npm run check`: passes; all 63 service-worker cached entries resolve.
- `npm run sync-ios`: passes; refreshed web bundle generated.
- `tests/browser-smoke.mjs`: 44 passing checks, zero uncaught JavaScript errors. Viewports 320x568, 390x844 and 768x1024. Menu/registration, steering, drop, pause, reload persistence, hitch collection, garage view change, nine upgrades, layout fit, controls and complete offline reload at each size. Also boots the generated iOS web bundle in Chromium. See browser-report.json.
- Visual inspection: gameplay road joins and truck hitch, garage viewpoints and mobile text. This is not a pixel-diff certification.

Limitations: browser automation used headless Chromium, not WebKit or an iPhone. Hitch collection is a controlled model fixture through the real collection method; it does not prove every pickup is easy to reach by touch. Synthetic canvas timings are not device FPS evidence. No native Xcode compile/signing was possible in this Linux environment. No signed IPA was created, no TestFlight upload occurred, and Game Center services were not authenticated. Human difficulty, visual polish and long-session performance still need device playtesting before App Store submission. The implementation and assets are supplied for Claude to integrate and validate against the latest repository.

Installer validation: clean-baseline check/application, repeat application (zero pending changes), conflict refusal without partial mutation, followed by all 46 tests, asset check and native bundle sync on the installed copy: passed.
