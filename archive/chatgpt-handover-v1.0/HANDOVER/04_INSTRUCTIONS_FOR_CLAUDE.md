# INSTRUCTIONS TO CLAUDE — FINISH THE ORIGINAL WORK-CHAT BUILD

You are taking over **Truckin’ & Drivin’**, a portrait iOS/browser truck-driving arcade game. **Read all HANDOVER docs before modifying source.** The source itself is in `Truckin-and-Drivin/`; the PNG farmer artwork is in `HANDOVER/POST-V1-ASSET/`. The two supplied ZIPs are complementary and must be extracted together into one folder.

**Hard scope rule:** Treat this handover plus its v1.0.0 source as authoritative. Do not merge work or notes from the separate personal-account/branch continuations, other chat conversations, other games or an external repository. Do not copy in later v1.3 features or assets. If any original work-chat requirement appears unresolved, deliver it without inventing a different project direction.

**Priority deliverable:** Produce a polished updated, working game based on the recovered source, implement the specific outstanding feedback, and make the resulting source cloud-buildable for App Store Connect. Preserve original assets and every working game system. No downgrade to generic geometry art or a static mock-up.

Execute in order:

1. **Audit:** verify 187 recovered original source files plus farmer PNG; read README, ART-PROMPTS, art-manifest, model, renderer, UI, native bridge, test suite, and original release documents. Run `node --test tests/game.test.mjs` before changing anything.
2. **Fix V-shaped road seams:** remove width toggles/transition squeeze in `Renderer.shape()`, audit source atlas scanline wrapping/mirroring and align source art edges; ensure visible road asphalt width is constant everywhere. Keep natural lateral road curvature but no width pinch or widen at joins. Capture before/after visual evidence.
3. **Fix five visible positions:** align lane centers/markings, road art and renderer coordinate transform. Verify every swipe, object path and collision corresponds to the same physically visible lane. Make a five-position visual QA sheet from gameplay if useful.
4. **Improve vehicle:** cab and trailer enlarged/lengthened and articulated with anchored visible hitch, proper plan-view proportions, correctly layered double trailer, calibrated hitboxes and stable steering. No floating/separated pieces.
5. **Pace and UI:** improve driving momentum while retaining fair hazards; minimize blocking alerts and optimize portrait full-screen play. Keep menus polished windows, preserve all gameplay mechanics and existing art style.
6. **Sheep event:** integrate the provided transparent farmer PNG and speech bubble “beep the sheep”; revise baa sound quality/timing; retain the exact “OH FLOCK!” joke and double-tap/dedicated horn controls.
7. **Native parity:** regenerate offline iOS assets after edits (`node tools/sync-ios.mjs`, after appropriate dependency setup). Check iPhone safe areas, touch input, offline assets and GameKit bridge. Update signing/upload workflow to generate signed IPA and upload to TestFlight on GitHub-hosted macOS (using user-provided secrets, not hardcoded credentials). Keep the simulator QA job.
8. **Tests and artifacts:** rerun regression tests, add seam and input-level visual QA, show measured results rather than assurances. Deliver a separate browser preview (ZIP or accessible preview if you actually deploy it), updated full-source ZIP and a cloud build / App Store Connect guide. Mark anything not compiled or verified as unverified.

## Nonnegotiable acceptance checklist

- At every scene/tile join, no V-shaped road-edge widening/narrowing and no gaps/visible seams.
- Five visible roadway positions align precisely to five swipe positions and object/hazard paths.
- Truck noticeably larger/longer and trailer physically connected through straight runs, curves and swerves.
- Faster-feeling but fair gameplay, HUD doesn't block road, clean full-screen portrait presentation.
- Farmer animation + “beep the sheep” bubble, convincing baa; **“OH FLOCK!”** preserved.
- All preexisting features retained and model tests passing.
- iOS assets regenerated, native source builds in macOS CI, Game Center configured with correct IDs, and real TestFlight evidence requested before claiming success.
- Release artifacts and clear step-by-step GitHub/cloud instructions; no Apple signing credentials in git or ZIP.

## Important constraints and provenance

The original source’s iOS build is **not** already an App Store IPA. Its existing `.github/workflows/ios-build.yml` only creates unsigned simulator outputs. Do not falsely mark signing/TestFlight completed. Original source includes `docs/APP-STORE-HANDOFF.md`, and these original docs are preserved for reference; your updated instructions supersede them where you add functionality.

The work-chat history is represented by these handover documents, not a guaranteed word-for-word ChatGPT transcript. Do not use content from other chats to fill perceived gaps. Where the original chat does not specify a detail, preserve current source behaviour by default.
