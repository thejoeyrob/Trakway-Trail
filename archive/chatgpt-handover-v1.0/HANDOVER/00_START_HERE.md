# TRUCKIN’ & DRIVIN’ — WORK-CHAT HANDOVER

**Scope:** The original *Truckin Drivin Game Design* work chat and its delivered **v1.0.0** game source, plus the subsequently produced panicked-farmer artwork and known outstanding requests in that same chat. **NOT** a merge of later continuation branches, other games, or unrelated chat histories.

## How to give this to Claude

1. Upload **both ZIP files**. Each is below the 30,000,000-byte upload cap.
2. Unzip both ZIPs into **the same directory**, preserving relative paths. Both files contain the same top-level folder `TRUCKIN-DRIVIN-WORKCHAT-HANDOVER/` and complementary contents.
3. Give Claude `HANDOVER/04_INSTRUCTIONS_FOR_CLAUDE.md` first, followed by `01_REQUIREMENTS_AND_WORK_TRAIL.md`, `02_UNFINISHED_WORK_AND_ACCEPTANCE.md`, and `03_CODE_ARCHITECTURE.md`.
4. The actual full source root is `Truckin-and-Drivin/`. Supplementary artist-provided post-v1 artwork lives in `HANDOVER/POST-V1-ASSET/`.
5. Do not treat this handover as a signed iPhone installable app. It is **source**, not a signed IPA.

## Recoverability and scope limits

This contains all **187 file payloads** from the recovered original v1.0.0 source ZIP, checked byte-for-byte against their archive checksums, plus one separately retrieved work-chat farmer image. It includes web and iOS code, original lossless art/audio, built web/native assets, backend, tests, and design/art manifests.

**The ChatGPT conversation's complete verbatim message transcript and all intermediate unpublished scratchpad states are not exposed by the available recovery interfaces.** `01_REQUIREMENTS_AND_WORK_TRAIL.md` is a faithful, clearly marked reconstruction from accessible work-chat information and delivered code, not an invented word-for-word transcript. Original commit-by-commit Git history was not part of the recovered ZIP. The per-file timestamps in `06_ORIGINAL_FILE_INVENTORY.csv` are ZIP metadata, not git audit history.

The original ChatGPT-hosted preview entry was titled “Truckin’ & Drivin’” at `https://truckin-and-drivin.josephrwhelan.chatgpt.site`; a separate export of the hosted project could not be materialized. The delivered source itself contains its web and offline iOS app.

## What’s actually implemented in recovered source

- Full-screen portrait driving, five discrete steering positions, swipe controls and double-tap / button horn.
- Four art-based environments, deliveries/breadcrumb trails, fines and hazards, sheep challenge, taco/coin rewards, double trailers, three truck liveries and upgrade paths.
- Autosaved game progress and seeded Daily Dispatch.
- Browser leaderboard backend and separate optional iOS Game Center bridge.
- Original rendered raster source art and sound-master files; native WKWebView offline bundle/Xcode project.
- A GitHub Actions **unsigned simulator compile-check** workflow, not an App Store/TestFlight signing workflow.

## Verification performed for this handover

The exact v1.0.0 snapshot's `node --test tests/game.test.mjs` passes **12 of 12 tests** here. See `05_MODEL_TEST_RESULTS.txt` and the source's `docs/VERIFICATION.md`. Native compilation, real-device TestFlight validation, Game Center production configuration and the unfinished visual corrections have NOT been verified.

Open `02_UNFINISHED_WORK_AND_ACCEPTANCE.md` for the must-fix tasks, especially the visible V-shaped road-width changes at segment joins.
