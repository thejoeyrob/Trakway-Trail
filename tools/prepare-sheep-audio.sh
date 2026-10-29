#!/bin/bash
# Fetch an actual sheep bleat for the distributable iPhone build.
# Joseph SARDIN / BigSoundBank sound #2350, CC0 (commercial use permitted).
set -euo pipefail
URL='https://bigsoundbank.com/UPLOAD/bwf-en/2350.wav'
RAW="${TMPDIR:-/tmp}/truckin-sheep-source.wav"
curl -fLsS --connect-timeout 20 --max-time 100 --retry 3 "$URL" -o "$RAW"
# Expected source is a real 48kHz sheep recording; reject an HTML error page.
test "$(wc -c < "$RAW")" -gt 20000
if command -v afconvert >/dev/null 2>&1; then
  afconvert -f WAVE -d LEI16@44100 -c 2 "$RAW" public/audio/sheep.wav
elif command -v ffmpeg >/dev/null 2>&1; then
  ffmpeg -loglevel error -y -i "$RAW" -ac 2 -ar 44100 -c:a pcm_s16le public/audio/sheep.wav
else
  echo 'Need afconvert (macOS) or ffmpeg to convert the CC0 recording' >&2
  exit 1
fi
test "$(wc -c < public/audio/sheep.wav)" -gt 10000
printf 'Installed natural sheep recording under CC0: %s\n' "$URL"
