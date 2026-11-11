# Store listing copy (Apple App Store + Google Play)

Owner TODOs are marked **[OWNER]**. Everything else is ready to paste.

## Names
| | Apple | Google Play |
|---|---|---|
| App name | Truckin’ & Drivin’ | Truckin’ & Drivin’ (max 30) |
| Subtitle / short description | **Big rigs. Little roads.** (23/30) | **Swipe, dodge and honk your way through Britain’s most ridiculous roads.** (70/80) |
| Bundle / package | `com.jweds.truckinanddrivin` | `com.jweds.truckinanddrivin` |
| Category | Games → Racing (secondary: Arcade) | Games → Racing (or Arcade) |
| Price | Free, no in-app purchases, no ads | Free, no ads, no in-app purchases |

## Promotional text (Apple, 170 max)
New: cows to honk away, a lucky horseshoe, a tall-phone view with a ticker of terrible lorry jokes, and a garage that shows your rig exactly as it drives.

## Keywords (Apple, 100 max)
`truck,lorry,trucker,driving,arcade,delivery,sheep,UK,HGV,swipe,endless,garage,casual,funny,cows`

## Full description (both stores)
Five lanes. One very big truck. Take delivery jobs, follow the golden trail and bank your payday, all while dodging low bridges, weak bridges, bus lanes, oil slicks, roadworks, tractors, hay bales and a countryside full of very opinionated animals.

• HONK THE HERD — wait for the baa to scatter the sheep, and honk in time to shoo cows and geese off the road. Miss, and you’ll meet a comic end: “OH, FLOCK!”, “MOO-VE OVER!”, “99 PROBLEMS!” and “KNOCK, KNOCK!”
• A ROAD THAT KEEPS CHANGING — bends, forks, roadworks, villages and river bends, never the same run twice.
• DROP THE TRAILER — run light and fast, but any unbanked delivery is lost. A new job hitches you up again.
• YOUR GARAGE, YOUR RIG — separate paint for cab and trailer, roof graphics, and nine upgrades you can see on the truck: lightbar, air horns, chrome stacks, bull bar, air-ride, stabilisers and more. Preview anything, even before you can afford it.
• NIGHT SHIFT, TURBO TEAS & TACO BREAKS — grab a lucky horseshoe for a free crash.
• DOUBLE TRAILERS for double pay (and double trouble).
• Built for every screen: a tall-phone view with a scrolling ticker of UK lorry jokes, and scenery that stretches out for iPad.

No ads. No in-app purchases. Works offline.

## What’s new (2.1.0)
Cows and geese to honk away, tractors, hay bales, ice-cream vans and a lucky horseshoe. Denser, smarter hazards. Redesigned garage with a live in-game preview, separate cab and trailer paint, and visible upgrades. A bigger honk button. Tall-phone view with a lorry-joke ticker, and wider-screen scenery for iPad.

## Support / privacy URLs
* Privacy policy: `privacy/index.html` in this repo (publishes at **https://thejoeyrob.github.io/Trakway-Trail/privacy/** once this branch is merged to `main`). **[OWNER]** put your real support email in it first.
* Support URL: **[OWNER]** — e.g. the GitHub Pages site or a page of yours.
* Marketing URL (optional): https://thejoeyrob.github.io/Trakway-Trail/

## Age rating / content rating answers
* Violence: cartoon slapstick only (crashes shown as comic vignettes, no blood or injury). Apple: “Cartoon or Fantasy Violence — Infrequent/Mild”. IARC will give roughly PEGI 3 / Everyone.
* No gambling, no user-generated content, no chat, no web access, no purchases, no location.
* Not directed at children (don’t opt into Kids/Family programmes unless you want those extra rules).

## Apple privacy (“nutrition label”)
Data Not Collected. (Optional Game Center is Apple’s.) The bundled privacy manifest declares UserDefaults (CA92.1), no tracking.
Export compliance: uses no non-exempt encryption (already set in Info.plist).

## Google Play Data safety form
* Collects or shares user data? **No**. Data encrypted in transit: n/a. Deletion: n/a (all data is on the device).
* The app requests only `VIBRATE` and has **no INTERNET permission**.
* Ads: none. Target audience: 13+ (or “all ages, not designed for children”, your choice).

## Screenshots (in this folder)
| Store slot | Folder | Pixels |
|---|---|---|
| iPhone 6.9″ (required) | `screenshots/ios-iphone-6.9` | 1320×2868 |
| iPhone 6.5″ | `screenshots/ios-iphone-6.5` | 1284×2778 |
| iPad 13″ (universal app, required) | `screenshots/ios-ipad-13` | 2064×2752 |
| Play phone | `screenshots/android-phone` | 1080×2160 |
| Play 7″ tablet | `screenshots/android-tablet-7` | 1200×1920 |
| Play 10″ tablet | `screenshots/android-tablet-10` | 1600×2560 |
| Play feature graphic | `graphics/google-play-feature-graphic-1024x500.jpg` | 1024×500 |
| Play icon | `graphics/google-play-icon-512.png` | 512×512 |
| App Store icon | `graphics/app-store-icon-1024.png` | 1024×1024 |

These are rendered from the real game at each store’s exact size using the web build (`node tools/store-screenshots.cjs`). Apple asks for screenshots that show the app itself; if App Review or you prefer true-device captures, retake the same six scenes on a phone after TestFlight.
