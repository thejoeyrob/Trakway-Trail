# Audio provenance

All game music and sound effects (except the new sheep sample used in the cloud build) originate from the game's own generated audio masters.

**Natural sheep bleat in TestFlight workflow:** Joseph SARDIN, BigSoundBank “Sheep #8”, sound no. 2350; CC0 / public-domain equivalent. Source: https://bigsoundbank.com/sheep-8-s2350.html . License permits redistribution, modification and commercial usage without attribution. The signed GitHub workflow downloads the original recording, converts it to 44.1kHz stereo PCM, and embeds it into the iPhone game's offline sound bundle. This source ZIP itself contains the fallback pre-existing sheep effect pending download.


## v2.1 additions
* **Sound effects v3** (`tools/render-sfx-v3.py`): horn, engine rev, ignition, idle, click, coin, cash, pickup, fanfare, sparkle, fine, brakes, scatter and the new funny-hazard sounds (moo, ice-cream chime on the traditional tune Greensleeves, Morris bells, bicycle bell, bin-lorry clang, splat, horseshoe, goose) are fully synthesised for this game. No samples.
* **Sheep**: the release builds install the CC0 sheep recording (Joseph Sardin / BigSoundBank #2350) over the synthesised fallback and play it as a small flock at several pitches.
* **Fonts**: Anton (SIL OFL 1.1, Vernon Adams) and Barlow Semi Condensed (SIL OFL 1.1, Jeremy Tribby), bundled in `public/assets/fonts` with their licences.
