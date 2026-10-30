# Truckin’ & Drivin’ — 1.0.0

A full-screen portrait arcade driving game: five-position swipe steering, rendered cartoon worlds and sprites, delivery breadcrumb trails, costly wrong turns, taco breaks, trailer sway, double-trailer jobs and timed sheep/horn encounters.

## Play and source

- The browser app is public/play.html with ES modules in public/js/.
- The complete offline iPhone/iPad project is ios/Truckin.xcodeproj.
- **The iOS project is source, not a signed IPA.** It has not been compiled in Xcode or tested on a physical device in this Linux session.
- Three earnable truck liveries, three upgrade trees, endless runs, seeded 120-second Daily Dispatch, persistent wallet and interrupted-shift recovery are implemented.
- Browser leaderboard uses the D1 API. The native app uses Apple Game Center and does not depend on the browser deployment.
- No purchases, ads, trackers, accounts or remote game downloads are needed to play.
- This is an arcade game, not truck-driving training. All earnings are fictional.

## Local development

Use Node 22.13 or later. Install with the included pnpm lockfile, then run npm run dev.
Test the deterministic game model with node --test tests/game.test.mjs.
Build the hosted application with npm run build.
After changing game files, regenerate the native offline bundle with node tools/sync-ios.mjs.

The checked-in native bundle is ready to open in Xcode without Node or package installation.
The included .github/workflows/ios-build.yml builds a simulator app on a Mac runner after this source is placed in a GitHub repository. It does not sign or submit to Apple.

## Controls

Swipe left/right to move one position. Double-tap the road, use the HONK button, or press Space for the horn.
Arrow keys / A / D steer on desktop. P pauses. Escape closes panels.
The Pause menu can finish a shift and bank its net earnings.
Early horns do not clear sheep. Wait for the BAA cue; the horn window is 0.75 seconds before upgrades.

## Files

- public/: browser game, production artwork and audio.
- ios/: native UIKit/WKWebView app with offline assets, haptics, native share sheet, Game Center, launch screen and privacy manifest.
- app/api/, db/, drizzle/: web leaderboard and migrations.
- tests/: money, steering, job, collision, checkpoint and horn timing checks.
- source-art/: original rendered artwork and lossless sound masters.
- ART-PROMPTS.json, ICON-PROMPT.txt, art-manifest.json: artwork provenance and atlas coordinates.
- tools/render-audio.py: original soundtrack/effect synthesis.
- docs/APP-STORE-HANDOFF.md: signing, Game Center and release verification.
- docs/VERIFICATION.md: what was checked and what still needs device testing.

JW EDS intro artwork was reused from the user's Zombie Smash repository, chatgpt-pro-build, intro-jw.png (blob 2d58c1043de6e94f5a85088082c5d39b243ef547). No other Zombie Smash code or gameplay was copied.
