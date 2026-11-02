# Truckin’ & Drivin’ — Rolling Road v1.5 integration

**Target:** `thejoeyrob/Trakway-Trail`, based on commit `83c35712903167f7ce17ca9aa36c8440e31579f3` (2 November 2026).

This is an **additive upgrade pack**, not an older full-game replacement. The existing Claude v1.4 game, intro/menu, garage, reward economy, comics, sheep, soundtracks, iOS project, leaderboard integrations and TestFlight workflows remain in place.

## Files supplied

- `public/assets/roads.webp`: drop-in 1,254×1,254 atlas preserving all four rendered landscapes, now displaying five painted lanes. Road x=22%–78%, four dashed dividers x=33.2%, 44.4%, 55.6%, 66.8%.
- `source-art/roads.png`: full-resolution editable source.
- `public/js/road-events.js`: seeded seven-scenario encounter generator (narrowing, split, contraflow, one-way, works, bus restrictions and chicanes). Preserves at least two clear lanes per encounter.
- `tools/apply-rolling-road.mjs`: source-aware, fail-closed migration for the checked version of the existing game; backs up the changed code. Adds moving oncoming traffic, collision handling, matched road/steering widths, non-repeating terrain themes, advance-warning restrictions, offline caching and regression tests.
- `tools/verify-rolling-road.mjs`: independent road event-generator checks.
- `preview/*`: art and visual comparison.

## Installation with Claude Code or a computer

1. Back up the repository or create a feature branch. Do not delete or replace the existing project.
2. Extract **this ZIP's contents** into the root of `Trakway-Trail`, preserving the folder paths. Allow the *two specific art files* `public/assets/roads.webp` and `source-art/roads.png` to be replaced. The code files `public/js/road-events.js`, `tools/apply-rolling-road.mjs`, `tools/verify-rolling-road.mjs` are new.
3. From the repository root, run: `node tools/apply-rolling-road.mjs`. It checks exact code anchors before editing any JS source and saves original source files under `.rolling-road-backup/`. If the repository has changed, it stops rather than blindly replacing Claude's newer code.
4. Validate: `node tools/verify-rolling-road.mjs && npm test && npm run check && npm run sync-ios`.
5. Preview `public/play.html` using `npm run dev`, playtest in a mobile browser and review on actual iPhone. Commit the changes and deploy only after acceptance.

If an installed source revision does not match the anchors, **do not force the updater**; have Claude compare and port the edits, preserve any superior current implementation, and run the same tests.

## Technical notes

- Existing game already draws lane-specific 3D road restrictions using `public/assets/terrain.webp`. The event generator assembles varied safe routes from those existing rendered assets; it does not introduce block-art stand-ins.
- Contraflow uses moving, 180°-facing car sprites and collision. Split traffic is currently represented by a central roadworks/closed-lane separation; **a fully branching road mesh with two independently scrolling roadways is not supplied**.
- Scenery starts with the current four environments and then uses a repeat-avoiding deterministic hash sequence. Encounter ordering, lane counts and location vary with the drive's seed. An encounter never blocks more than three lanes, but the final balance still needs actual playtesting.
- The truck sprite art itself is **not regraded in this package**, because doing so without comparing the current in-game atlas and seam/hitch positioning risks degrading the Claude build. Trailer hinge and sway code is left intact.
- The atlas is vertically sampled with the existing mirrored scroll renderer, avoiding the hard seam caused by naïve top-to-bottom wrap.

## Verification boundary

Directly checked: exact insertion anchors in GitHub main; generation of the PNG and compressed WebP; asset dimensions; JavaScript syntax of the standalone new modules and updater; **15,000 randomized encounter scenarios** with safe exit, per-lane lead-ins and no immediate scenario repeat.

**Not checked:** Running the updated complete app's `npm test` and browser playtest, macOS/Xcode build, signed IPA, Game Center, or TestFlight. Repository write access via the GitHub connector was denied (403), so no files were pushed and the original `main` branch was not changed.
