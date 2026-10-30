# iOS release handoff

## What is ready

ios/Truckin.xcodeproj contains a standalone iOS 17+ game with all images, code and audio bundled locally. It is not a web URL wrapper. It uses a local WKWebView for rendering, UIKit for lifecycle/share/haptics, and GameKit for optional leaderboards.

The app contains no remote script loading, monetisation SDKs or third-party runtime frameworks. The Xcode project requires no CocoaPods or npm installation. The 1024×1024 opaque icon, launch storyboard, app metadata, Game Center entitlement and privacy manifest are included.

## Signing and first device build

1. Open ios/Truckin.xcodeproj in a current supported Xcode on a Mac.
2. Select the Truckin target. Set your Apple Developer team in Signing & Capabilities.
3. Confirm or replace the bundle identifier com.jweds.truckinanddrivin with an identifier you own. It has not been registered by this build.
4. Enable Game Center for that App ID and let Xcode create/update the provisioning profile.
5. Build and run on a real iPhone. Complete the checks below.
6. Archive with a physical-device / Any iOS Device destination, then validate and distribute through Xcode Organizer to App Store Connect/TestFlight.
7. Create the app's App Store Connect record if it does not exist. No record, certificates, provisioning profiles or signed IPA have been created here.

A simulator build-check workflow is included at .github/workflows/ios-build.yml. It creates an unsigned simulator .app, not an installable device IPA.

## Game Center

Create these exact leaderboard IDs in App Store Connect, or change the corresponding constants in GameViewController.swift:

| Identifier | Type | Scoring |
| --- | --- | --- |
| truckin.earnings | Classic | Highest integer net earnings |
| truckin.daily | Recurring daily | Highest net earnings; align reset to 00:00 UTC |

The daily game uses the UTC date as its seed and stock handling for fairness. Native scores are queued when offline or not authenticated. Players can sign in by opening Leaderboard; there is no login requirement for gameplay. Do not advertise Game Center as available until these leaderboards are configured and tested through TestFlight.

The hosted browser leaderboard is separate from Game Center. It performs basic format, ownership, duplicate and elapsed-time sanity checks. It is not a hardened competitive anti-cheat service. Do not use it for prizes or real-money competition.

## Mandatory device QA before submission

- iPhone SE-sized display, a current notched/Dynamic Island iPhone, and iPad if retaining universal support.
- Check safe areas, bottom home gesture, portrait lock, every menu and text field.
- Verify one swipe = one position; rapid alternating swipes; single and double taps; horn button.
- Play through all four environments, a normal job, a double trailer, missed finish, bankruptcy, sheep escape and sheep failure.
- Listen on iPhone speakers and headphones. Confirm music/effect balance, silent switch behaviour, interruptions and resume.
- Background/foreground during a shift; force-close and recover; test a phone/audio interruption.
- Airplane mode from a clean installed app: art, music and gameplay must work. Restore internet and check Game Center submissions.
- Buy every truck and upgrade with earned game money; relaunch and verify persistence.
- Measure frame pacing, memory, battery and thermal behaviour during a 20-minute session using Instruments.
- Validate the Release archive in Xcode and run a TestFlight soak test.

These checks cannot be marked complete from the Linux browser preview.

## Store content and privacy

Suggested name: Truckin’ & Drivin’
Suggested subtitle: Big rigs. Little roads.
Suggested category: Games / Racing or Casual.

Description draft:
“Five positions. One very big truck. Take delivery jobs, follow the golden trail and bank your payday while dodging low bridges, bus lanes, questionable shortcuts and a countryside full of very opinionated sheep. Collect taco breaks, unlock colourful rigs and take on double-trailer jobs for double pay. Swipe to steer, wait for the baa, and honk like your earnings depend on it.”

Screenshots must be captured from the final native build at Apple's required device sizes. Browser QA images are not App Store screenshots.
Set the actual support/privacy URLs and answer Apple's age-rating and privacy questionnaires based on the final app configuration. The included native privacy manifest declares app-only UserDefaults use (CA92.1), no tracking and no developer-collected data. Reassess it if analytics, ads, accounts or a custom online backend are later added.
Game Center is Apple-provided; review its use when completing App Store Connect privacy answers.

No guarantee of App Review approval is implied. Do not submit an untested archive.

References reviewed for this implementation:
- https://developer.apple.com/app-store/review/guidelines/
- https://developer.apple.com/documentation/gamekit/gkleaderboard
- https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api
