# Unfinished work — implementation order and acceptance criteria

These are the remaining requirements identified from the **original work chat**, not feature requests imported from other continuations.

## P0 — visibly constant road width and seamless joins

**Observed symptom:** left/right road edges taper into a V at repeated map/road joins; the visible road widens and narrows. The game must render a steady-width road corridor through every source tile/scene transition while allowing curves that move the corridor sideways rather than changing its width.

**Primary code:** `Truckin-and-Drivin/public/js/render.js` — `Renderer.shape(z)`, `Renderer.curve(z)`, `Renderer.x(lane,z)`, and `Renderer.road(distance)`.

Current `shape(z)` intentionally alternates widths of **520 vs 560** map units and interpolates for 360 distance units at 5400-unit environment transitions. This is a concrete cause of changing render width. The `road()` function slices a 2×2 atlas and mirrors its source rows, so artwork edge alignment and source-coordinate wraps may also make seams visible. Correct both, rather than hiding the problem with overlays.

Plan: normalize the art/atlas rendering to a single calibrated source road corridor across all four scenes; use fixed *visible asphalt* width and one common five-position lane coordinate transform in the renderer. Preserve smooth lateral road curvature, and continuous texture boundaries at tile repetition/environment transitions. Cross-fade themes without stretching only one side or creating a triangular wedge. Do not draw fake polygon roads.

**Pass conditions:** frame-by-frame sequence at every environment boundary and repeated texture wrap shows equal road-edge separation above/below the join, no diagonal V pinch, no obvious mirrored seam; road marks stay visually aligned with lane centers. Verify at iPhone SE-size and contemporary tall iPhone.

## P0 — lane positions and truck articulation

`Renderer.x(lane,z)` currently spaces positions at `(lane-2)*49*shape(z).width/560 + curve(z)`. Ensure fixed lane spacing is calibrated to actual visible road art and sprites. At each of the five positions, center of cab and trailer is visibly on the corresponding reachable corridor; sheep, cars, restrictions, breadcrumbs and pickups share the same coordinate logic. Single swipe moves exactly one position, no phantom positions.

Increase physical rendered scale/length of the cab + trailer and adjust draw order/coupling geometry. Do **not** simply enlarge disconnected parts. The trailer pivots behind the cab and double-trailer behaves consistently; no impossible separation on a swipe, sway or corner. Check that sprite scale and hitboxes still agree. Art must stay top-down and high quality.

**Pass conditions:** screenshots and a short video showing all five positions, at least one curve, normal and double trailer, with clearly connected rig; collectables/hazards correctly line up with visual lanes.

## P1 — speed and presentation

Increase the experience of motion in the game model/scroll rate (`public/js/model.js` speed/tick and `render.js` road). Keep hazards reactable, swipes predictable, and difficulty balanced. Avoid screen jumps/tearing at high speed. Reduce gameplay-obscuring alerts: persistent HUD should be small, most notifications brief and positioned so they do not block the road. Full-screen art should dominate; menu panels should not permanently overlay play.

## P1 — “beep the sheep” encounter

Integrate `HANDOVER/POST-V1-ASSET/Panicked British sheep farmer points right.png` into the timed sheep sequence. Animate it sensibly and present a short speech bubble reading **“beep the sheep”**, without hiding steering or covering hazards. Retain existing **“OH FLOCK!”** end/result text. Replace/rework the inadequate cartoon baa with a convincingly audible sheep baa, using properly licensed audio and accurately documenting its provenance. Confirm cue timing with the existing model and give the horn a reliable 0.75s pre-upgrade window. Preserve double-tap horn and the dedicated button.

## P2 — iOS/cloud release and real scoreboard

The recovered `.github/workflows/ios-build.yml` only compiles an **unsigned simulator** target. The recovered iOS `.xcodeproj` has not been tested by Xcode on a physical device. Claude should produce a **proper macOS GitHub Actions** source-check, signing, archive, IPA export and TestFlight-upload workflow, plus a concrete Apple signing/secrets guide. Never embed private keys. Build must be manually triggerable. Game Center has code/identifiers but must be enabled in the Apple developer account, tested with real devices, verified for offline queue and cross-account score posting, and approved for release.

## P2 — full regression and delivery

Run all original model tests, add visuals/regression coverage for joins, lane mapping, truck articulation, speed, farmer sequence and audio. Rebuild the native offline bundle using `node tools/sync-ios.mjs` after changes. Then produce a playable separate preview AND complete updated source package and exact steps for cloud TestFlight deployment. Do not claim signed, submitted or accepted until the evidence exists.

**Protect existing features:** delivery earning/banking, Daily Dispatch seed, hazards, fines/insurance, taco pickups, upgrades/garage, save/recover, audio controls, 4 environments, no pay-to-play or ads, and original style.
