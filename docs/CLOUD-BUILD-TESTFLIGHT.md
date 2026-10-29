# Truckin’ & Drivin’ v1.3 — TestFlight handoff

## Recommended: GitHub Actions cloud build (no Codespaces, Xcode or Mac needed locally)

1. On github.com, create a **private** repository, e.g. `Truckin-and-Drivin`. Upload the **contents** of the `Truckin-and-Drivin` folder in the ZIP, not the ZIP file itself. For a large set of files, GitHub’s upload page may be cumbersome; GitHub Desktop or a GitHub-connected coding agent can push the contents. Never commit Apple credentials.
2. In [Apple Developer — Identifiers](https://developer.apple.com/account/resources/identifiers/list), register your App ID/bundle ID, for example `com.jweds.truckinanddrivin` (only if you control it). Enable Game Center. In [App Store Connect](https://appstoreconnect.apple.com/), create the corresponding iOS app record; use the **identical** bundle ID.
3. In App Store Connect → Users and Access → Integrations → App Store Connect API, create an **App Manager** team key. Download the `.p8` file; it is only downloadable once.
4. In GitHub repo → Settings → Secrets and variables → Actions, add these **Variables**:
   - `APPSTORE_BUNDLE_ID` = exact registered bundle ID.
   - `APPSTORE_TEAM_ID` = your Apple Developer Team ID (10 characters).
   - `APPSTORE_ISSUER_ID` = API issuer ID.
   - `APPSTORE_API_KEY_ID` = API key ID.
5. Add these **Secrets** in the same menu:
   - `APPSTORE_API_PRIVATE_KEY` = full text from `AuthKey_XXXXXXXXXX.p8`, including BEGIN/END PRIVATE KEY.
   - `APPSTORE_CERTIFICATES_FILE_BASE64` = base64 of an **Apple Distribution** `.p12` certificate containing the private key.
   - `APPSTORE_CERTIFICATES_PASSWORD` = password protecting that `.p12`.
6. Create an **App Store distribution provisioning profile** for your App ID, with exact profile name `AppStore <bundle-id>`; example `AppStore com.jweds.truckinanddrivin`. It must use the Apple Distribution certificate from step 5. An Apple certificate without its private key **cannot sign the game**. Apple’s [Example-iOS](https://github.com/Apple-Actions/Example-iOS) and [download-provisioning-profiles](https://github.com/Apple-Actions/download-provisioning-profiles) repositories provide cloud-friendly certificate/profile setup scripts. A connected Codemagic project with automated signing is another route if you cannot create a `.p12` from your managed laptop.
7. In the repo → Actions → **Build and upload to TestFlight** → Run workflow. It runs the deterministic game tests, regenerates the offline web assets, archives the signed iPhone app on a macOS GitHub runner, exports a real `.ipa`, saves it as an Actions artifact, and uploads it to TestFlight. **No GitHub Codespaces consumption required.** The workflow is *not* automatically run on push, to avoid signing charges.
8. Open App Store Connect → My Apps → Truckin’ & Drivin’ → TestFlight. Wait for Apple processing; complete beta test information (feedback email and description), assign yourself to internal testers and test the build on a physical iPhone.

**Important:** This package includes the **source and workflows**, not a pre-signed IPA. We have not run Xcode in this Linux environment. The first macOS job is the authoritative compile/signing verification. If it fails, inspect the GitHub Actions log and correct the Xcode or signing error before assuming the game is TestFlight-ready.

## Game Center leaderboards (live iPhone high scores)

Enable the Game Center entitlement for the App ID. In App Store Connect → Game Center → Add Leaderboard create:

| ID | Type | Display | Score |
|---|---|---|---|
| `truckin.earnings` | Classic | All-time cash | Highest integer net £ score |
| `truckin.daily` | Recurring | Daily Dispatch | Highest integer net £ score, 24h daily, reset midnight UTC |

Keep both IDs **exact**, because they are hardcoded in `ios/Truckin/GameViewController.swift`. Add English localisation and submit the Game Center components for Apple review as required. The native app saves earned money, owned trucks and upgrades on the phone, queues scores when offline and posts to Game Center when the player is signed in. Test two different Game Center sandbox accounts in TestFlight to verify cross-device rankings. No Supabase database is needed for native Game Center scores.

The browser backend at `app/api/` is a separate D1 leaderboard for web players, and must be deployed with its database for cross-device browser scores. That service does **not** automatically synchronise with Game Center. Do not use its basic client-reported scores for prize competitions without server-authoritative anti-cheat.

## Before App Store release

Complete real-iPhone tests on small and modern iPhones, a longer thermal/performance run, pause/background recovery, horn timing with actual device speakers, memory pressure, Game Center authentication and offline operation. Review the Store screenshots, app icon, support/privacy URL, age rating, Game Center review, and Apple’s App Review Guidelines. Internal TestFlight is the immediate next goal; App Store approval is not yet claimed.

## Sheep audio

`public/audio/sheep.wav` is the game's currently bundled bleat effect. The original synthetic effect was judged inadequate. The cloud TestFlight workflow now automatically **downloads and installs a natural CC0 recording** before bundling the signed IPA. Recommended source: [BigSoundBank Sheep #8](https://bigsoundbank.com/sheep-8-s2350.html) (Joseph SARDIN, CC0); If building without GitHub Actions, run `bash tools/prepare-sheep-audio.sh` on a Mac with Internet access before `node tools/sync-ios.mjs`. The workflow intentionally fails if the recording cannot be fetched rather than silently submitting the old synthetic effect. The final audio must still be auditioned on an iPhone.
