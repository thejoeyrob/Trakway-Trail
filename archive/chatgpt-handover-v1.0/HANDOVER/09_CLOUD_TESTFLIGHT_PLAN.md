# Native / cloud build checklist (source-state accurate)

## What can be done without a Mac on the user's laptop

Place the reconstructed `Truckin-and-Drivin/` source (not ZIP wrappers) in a private GitHub repository. The delivered `.github/workflows/ios-build.yml` uses a macOS runner to compile an **unsigned simulator** binary. It is a useful compilation check but cannot be uploaded to App Store Connect as an iPhone app.

Claude should add a separate, manually triggered macOS workflow that: checks out code, tests JS/model logic, syncs native bundled web content, resolves Xcode version, imports Apple Distribution signing material **from GitHub secrets** or an authorized signing provider, archives a physical-device build, exports App Store IPA, publishes it as an artifact and optionally uploads using the App Store Connect API. Prefer manual workflow dispatch so no unintentional paid runner executions occur.

## Apple-side requirements

1. Apple Developer account + existing/created exact Bundle ID in the Xcode target (currently `com.jweds.truckinanddrivin`, **not known to be reserved**).
2. Game Center capability enabled and leaderboards created in App Store Connect, exact IDs `truckin.earnings` and `truckin.daily` unless code is changed consistently.
3. Apple distribution certificate and provisioning profile or managed cloud signing configured securely; never place `.p8`, `.p12`, password or raw provisioning private material in source ZIPs.
4. App Store Connect app record, privacy/support URLs, age rating, final screenshots and TestFlight tester configuration.
5. Physical iPhone QA: continuity of road joins, 5 positions, gestures, real horn/baa speakers, pause/resume, backgrounding and battery/thermal, 4 environments, normal/double trailer, Game Center sign-in and multi-device score sync.

The D1 browser leaderboard in `app/api/` is independent of native Game Center; do not assume the two share scores. Neither source archive nor this handover proves real-world submissions or App Store approval.
