# Verification record — 29 October 2026

## Passed

- 12 deterministic model tests: bounded steering, 1,000 reachable job routes, provisional/banked job accounting, doubled pay, horn timing, sheep failure, insurance/grace period/bankruptcy, trailer collision, jackknife, checkpoint/RNG restore, deterministic seed and stopped-state behaviour.
- A scripted 120-second Daily Dispatch completed all four environments, five deliveries and five horn encounters. Net earnings remained consistent; the entity list stayed bounded.
- JavaScript syntax checks and the production web build.
- Browser title screen, name entry, starting a shift, steering controls, pause/resume, final-shift receipt, interrupted-shift recovery after reload, and readable gameplay HUD.
- Browser layout inspection at 375×667 and 390×844.
- Local API flow through browser UI: create run 200; save result 200; repeat submission 409; read leaderboard 200 with the saved result present; invalid player 400.
- Xcode project object references, XML/plist parsing, required resource presence, and generation of the standalone native JS/audio bundle.
- Audio assets are valid stereo 44.1kHz. Original 32-second music loop measures approximately −16.43 LUFS / −2.45dB true peak; effect peaks remain below clipping.

## Remaining release gates

No Mac/Xcode toolchain or connected physical iPhone was available in this session. The native project has not been compiled, signed, installed, archived or uploaded to App Store Connect. Native Game Center, audio interruptions, haptics and frame pacing require on-device testing. Follow APP-STORE-HANDOFF.md before submission.

## Art and audio

Gameplay scenery, trucks, pickups and hazards are rendered raster assets, not programmatically drawn geometric stand-ins. World scrolling, sprite transforms, glow and text are canvas rendering operations. UI panels and progress meters use CSS.

The soundtrack and sound effects are original synthesized audio. The sheep voice is deliberately cartoonish synthesized “baa-baa”, not a natural animal recording.
