# Truckin’ & Drivin’ — road world v2 handover

This is implemented source and generated artwork, not a request to rebuild the game from scratch. Preserve the existing Claude game and integrate this upgrade. Baseline: thejoeyrob/Trakway-Trail main commit b3b319382f6a7b88f481513d20823c303d764f2b. No remote branch was changed or deployment made.

## Give Claude all three archives
1. Claude-Upgrade: safe installer and changed files, with baseline originals for comparison.
2. Complete-Web-iOS: complete runnable source snapshot and refreshed native web bundle; useful for comparison or a clean checkout.
3. Art-Sources: original generated PNG atlases, crop metadata and prompt provenance. Runtime WebP atlases are already included in the other packs. The complete source pack omits older raw source-art masters and the legacy-chatgpt-host folder to stay below 30 MB; retain those from your existing repository. All current runtime assets and build inputs are included.

Do not overwrite a newer Claude repository with the full snapshot. Read docs/ROUTE-WORLD-V2-DESIGN.md and docs/ROUTE-WORLD-V2-VALIDATION.md first. These v2 documents supersede old release-status and five-lane art notes; historical documents are retained.

## Integrate into the existing repository
Commit or back up current work. With Node 22 or later, run from anywhere:

    node /path/to/Claude-Upgrade/apply-upgrade.mjs /path/to/Trakway-Trail --check
    node /path/to/Claude-Upgrade/apply-upgrade.mjs /path/to/Trakway-Trail --apply

The installer checks every file before writing, accepts already-applied files, refuses modified baseline files and new-file collisions. On conflicts, manually merge payload against baseline and your current version. Never force replacement of newer game features. Backups and a restore manifest are recorded in .route-world-v2-backup. Review your git diff after installation.

Then, from the repository:

    npm test
    npm run check
    npm run sync-ios
    npm run dev

Play http://localhost:8080. No npm dependencies are needed for these commands. Optional browser suite: install Playwright and its Chromium browser, then run `node tests/browser-smoke.mjs`. It runs its own local server. The archive contains an actual passing browser report.

## Deploy web
Publish the complete public directory to the existing static host, preserving existing base paths. For existing GitHub Pages publishing from repository root, retain index.html and the public/ path. Keep new modules and assets/route-v2 together. Use HTTPS for service-worker offline support. Cache version is truckin-v2.0.0-route1. Check first-load, refresh, update from the old service worker and offline reopening on the live origin. Do not clear players’ localStorage. Saved balances/upgrades keep their existing keys; old in-progress route content migrates to the new world.

## iOS / TestFlight / App Store
Run sync-ios after every web change. Open ios/Truckin.xcodeproj; keep the existing bundle ID, entitlements and team. Version is 2.0.0. Set a build number higher than every previously uploaded build (the project’s carried-over number is not a release-ready choice). Build and run on physical iPhones, then Archive / Distribute through your existing Apple signing setup.

The existing manual TestFlight GitHub workflow is retained with the full test suite added. Configure its APPSTORE variables/secrets as described in docs/CLOUD-BUILD-TESTFLIGHT.md. Confirm the selected macOS/Xcode version is available and that the provisioning-profile name really matches `AppStore <bundle ID>`; replace that mapping with your actual profile if needed. GITHUB_RUN_NUMBER must exceed previous uploads; adjust the build-number strategy when it does not. Do not upload until native validation succeeds.

Required release checks: small and large iPhones, safe areas, touch/swipe/horn/trailer controls, audio after interruption, app background/resume, offline installation, memory/thermal behaviour, Game Center authentication and leaderboard submission, save migration, privacy disclosures, accessibility and current App Store screenshots/metadata. Review existing monetisation/privacy behaviour before submission. This pack is not a signed IPA, App Store submission or approval guarantee.

Apple references: https://developer.apple.com/testflight/ and https://developer.apple.com/app-store/review/guidelines/ .

## Rollback
Prefer reverting the reviewed integration commit. For uncommitted installation, consult .route-world-v2-backup/<timestamp>/restore.json: restore backed-up original files and remove only files listed as newly created, after confirming no later edits would be lost. Re-run sync-ios to restore native bundled content. Do not reset the player save store.
