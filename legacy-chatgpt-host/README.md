# Legacy ChatGPT-hosted backend (optional, not needed to play)

This is the Next/vinext + Cloudflare D1 scaffold that served the v1.0 browser build, including the
`/api/run` and `/api/leaderboard` endpoints behind the **online** leaderboard. It is kept for reference only.

The game itself is a static site in `../public` and works without any of this: when `/api/*` is
unavailable the game transparently falls back to an on-device leaderboard (and Game Center on iOS).
To use the old online board, deploy this folder to a Cloudflare-compatible host and serve `../public`
from the same origin.
