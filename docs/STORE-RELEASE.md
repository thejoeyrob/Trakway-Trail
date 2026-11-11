# Store release guide — Truckin’ & Drivin’ 2.1.0 (Apple + Google Play)

Branch: `store/v2.1-release` (built on `v2-plus`, the upgraded ChatGPT v2 game). Nothing here touches `main` or the live site.

## Status — what is done and what is proven

| Item | State |
|---|---|
| Game tests (52) + asset check | Pass |
| iOS project (WKWebView wrapper), version **2.1.0**, bundle `com.jweds.truckinanddrivin`, portrait, iPhone + iPad | Ready. Simulator build check passed in GitHub Actions (run on this branch). |
| TestFlight workflow (`testflight.yml`) | Ready, **needs your Apple secrets** (below). Not run: no Apple account here. |
| Android wrapper (`android/`) — full-screen WebView serving the bundled game, no internet permission, haptics + share bridge, adaptive icon, portrait | Built in GitHub Actions: **test APK (16.8 MB) and unsigned Play bundle (16.4 MB)** were produced. **Not yet installed on a real phone.** |
| Android signing + Play upload | Ready in `android-release.yml`, **needs your upload key + Play service account** (below). |
| Store screenshots, feature graphic, icons | `store/` — correct pixel sizes for every slot |
| Listing copy, age rating, privacy answers | `store/LISTING.md` |
| Privacy policy page | `privacy/index.html` (goes live when merged to `main`; **put your support email in it**) |

Not done and not possible from here: creating the Apple/Google accounts or app records, signing, uploading, store review, and playing on a physical device.

## Before anything: test on a real phone
1. **Android:** GitHub → Actions → “Android build” → latest run → download **Truckin-Android-test-APK**, unzip, install the `.apk` on a phone (allow “install unknown apps”). Check: menu swipe, tap-to-start sound, a full shift, garage, honk, pause when you press Home, back button, sound after a call/notification.
2. **iPhone:** after the first TestFlight build (below) install via TestFlight and run the checklist in `docs/APP-STORE-HANDOFF.md`.

## Apple (iOS + iPad)
You need: Apple Developer Program membership (£79/yr).
1. developer.apple.com → Identifiers → register App ID `com.jweds.truckinanddrivin` with **Game Center** enabled (or change the bundle ID everywhere).
2. App Store Connect → My Apps → New App (iOS), same bundle ID, name “Truckin’ & Drivin’”, SKU anything.
3. (Optional) Game Center → create leaderboards `truckin.earnings` (Classic) and `truckin.daily` (Recurring daily). Without them the in-game Leaderboard button shows the player’s own best.
4. Create an **Apple Distribution** certificate (.p12) and an **App Store Connect API key** (.p8, role App Manager).
5. GitHub repo → Settings → Secrets and variables → Actions:
   * Variables: `APPSTORE_BUNDLE_ID`, `APPSTORE_TEAM_ID`, `APPSTORE_ISSUER_ID`, `APPSTORE_API_KEY_ID`
   * Secrets: `APPSTORE_CERTIFICATES_FILE_BASE64` (`base64 -i cert.p12`), `APPSTORE_CERTIFICATES_PASSWORD`, `APPSTORE_API_PRIVATE_KEY` (contents of the .p8)
   (Never commit these. The repo ignores `*.p8`, `*.p12`, `*.jks`, `*.keystore`.)
6. Actions → **Build and upload to TestFlight** → Run workflow on branch `store/v2.1-release`. It tests, bundles the game, archives, signs, uploads. Build number = run number (always increases).
7. In App Store Connect: add testers, then fill the listing from `store/LISTING.md`, upload `store/screenshots/ios-*`, answer privacy (“Data Not Collected”) and age rating, pick the build, **Submit for Review**.

## Google Play
You need: Play Console developer account (one-off fee). **New personal accounts must usually run a closed test with a minimum number of testers for about two weeks before production — check the current rule in Play Console.**
1. Play Console → Create app → package `com.jweds.truckinanddrivin`. Enrol in **Play App Signing** (default).
2. Make an upload key **on your own computer** (do not share or commit it):
   ```
   keytool -genkeypair -v -keystore truckin-upload.keystore -alias truckin -keyalg RSA -keysize 2048 -validity 10000
   base64 -i truckin-upload.keystore | pbcopy     # macOS (Linux: base64 -w0 truckin-upload.keystore)
   ```
   Keep a safe backup of the keystore and its passwords.
3. GitHub → Secrets: `ANDROID_KEYSTORE_BASE64` (the base64 text), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (`truckin`), `ANDROID_KEY_PASSWORD`.
4. Actions → **Android build** → Run workflow on `store/v2.1-release`. With the secrets present it produces a **signed** `Truckin-Android-Play-bundle-SIGNED` (.aab) and the test APK.
5. Play Console → Testing → Internal testing → Create release → upload the .aab (the first upload must be manual).
6. Fill Store listing (`store/LISTING.md` + `store/screenshots/android-*` + `store/graphics/*`), Content rating questionnaire, **Data safety** (“no data collected”, no INTERNET permission), Target audience, then promote to closed/production.
7. Optional automation later: create a Play **service account** (Play Console → API access), add its JSON as secret `PLAY_SERVICE_ACCOUNT_JSON`, and tick “upload_to_play” when running the workflow to push to the internal track.
8. Version codes: `run number + ANDROID_VERSION_CODE_OFFSET` (repo variable, default 0). Raise the offset if Play ever says a code was used.

## Updating the game later
Change the game in `public/`, bump `VERSION_NAME`/`MARKETING_VERSION`, run `npm test`, then re-run the two workflows. `npm run sync-ios` refreshes the iOS web bundle; `node tools/sync-android.mjs` refreshes the Android assets (the workflow does it for you). Retake store pictures with `node tools/store-screenshots.cjs`.

## Platform notes
* The iOS and Android apps share one web game and one bridge (`window.webkit.messageHandlers.truckin`): haptics, share, leaderboard. On Android, “Leaderboard” shows the player’s own best (Play Games sign-in is a future add).
* Android is portrait-locked. Android 16+ may ignore orientation locks on large tablets; the game still plays, centred.
* The online leaderboard backend is not used in the store apps (they are fully offline).
* **“Fatty’s Game Shack”**: I still don’t know what this is or where its code lives. Tell me and I’ll prepare that too.
