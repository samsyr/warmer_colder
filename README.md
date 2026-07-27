# Warmer / Colder

A GPS "getting warmer, getting colder" game. Enter a target's coordinates and the
phone speaks **warmer** or **colder** every 10 seconds, plus the straight-line
distance left, until you arrive within 100 m. Every reading is logged to a text
file. See `TECHNICAL_SPECIFICATION.md` for the original build brief.

## Stack
Expo (React Native) + JavaScript — `expo-location`, `expo-speech`,
`expo-file-system`. Chosen so it runs on a real phone via Expo Go in minutes.

## Run it
```bash
npm install
# make sure the native module versions match your Expo SDK:
npx expo install --fix
npx expo start
```
Then scan the QR code with the **Expo Go** app on your phone, go outside, and walk.

> Needs a physical device (and being outdoors) for a real GPS fix. A simulator
> can be fed a mock location but won't move realistically.

## Running on web (dev/testing only)

Web is **not a production target** — it exists only for fast manual testing of UI
and logic in a desktop browser (no QR-code round-trip, plus React DevTools).

```bash
npx expo start --web        # serves on http://localhost:8081
```

Then grant the browser's location prompt to exercise the tracking loop. For
component/profiler inspection, install the **React Developer Tools** Chrome
extension — it hooks into the page automatically; reload and use the *Components*
/ *Profiler* tabs in DevTools.

### eval-free static export (for strict-CSP browsers)

The dev server (`expo start --web`) uses `eval()` for fast-refresh and lazy
module loading. Browsers/extensions enforcing a strict Content-Security-Policy
(no `'unsafe-eval'`) will log *"…blocks the use of 'eval'…"*. If you hit that,
serve the **production export** instead — it has no HMR/lazy loading, so it runs
eval-free under any CSP:

```bash
./serve_web.sh            # exports to dist/, serves at http://localhost:8080
```

Trade-off: no fast refresh — re-run the script after code changes.

### web/native code separation

Web-only compromises are isolated in `*.web.js` files (Metro resolves these for
the web platform automatically), so production/native code never carries web
shims:
- `src/utils/track.web.js` — `expo-file-system` has no web support, so the web
  build keeps the track in memory instead of writing to disk.
- `src/utils/demoJitter.web.js` — you can't physically walk at a desk, so on web
  the measured distance is jittered ±25 m each reading to exercise the
  warmer/colder trend. Native uses the identity `demoJitter.js`.
- `src/utils/speech.web.js` — drives the browser Web Speech API directly,
  handling its quirks (async voice loading, the autoplay/gesture lock, the
  cancel-before-speak race) and never stalling the loop if no voices exist.
  Native uses `speech.js` (expo-speech). Note: browsers with no installed TTS
  voices (common with Chrome on Linux without a configured audio server) stay
  silent — that's the environment, not the app.

## How it works
1. **Setup** — type the target latitude/longitude, or tap *Use my current
   location* to grab a test target.
2. **Tracking** — every 10 s it reads GPS, compares distance to the previous
   reading, speaks warmer/colder + metres remaining, and appends a line to the
   track file. The screen runs warm (ember) when warmer, cool (blue) when colder.
3. **Arrived** — within 100 m it congratulates you and shows where the track was
   saved.

## Tuning
Everything adjustable lives in `src/config.js`: interval, arrival radius,
jitter dead-band, language (`en` / `fi`), and the track filename.

## Testing
There's no on-device automation (GPS/speech behaviour is still verified manually
on a physical phone outdoors) but the pure logic and the web dev target are
covered automatically:

```bash
npm test          # Jest — pure-logic unit tests (geo, track formatting, random destination)
npm run test:web  # Playwright — starts the web dev server, loads it headless, checks
                   # for a 200 response, no console/page errors, and expected rendered text
npm run test:all  # both, in sequence
```

See `.claude/agents/testing-agent.md` for the agent responsible for keeping this
test set current as features are added.

## Project map
```
App.js                       setup → game → arrived state machine
TECHNICAL_SPECIFICATION.md   the original build brief
src/config.js                tunable parameters
src/i18n.js                  on-screen UI text (en / fi)
src/voices.js                spoken trend words + locale-aware number/unit formatting
src/screens/                 SetupScreen, GameScreen, ArrivedScreen
src/hooks/useWarmerColder.js core loop (permissions, interval, compare, speak, log)
src/utils/geo.js             haversine distance + coordinate validation
src/utils/speech.js          text-to-speech wrapper (native, expo-speech)
src/utils/speech.web.js      text-to-speech wrapper (web, browser Web Speech API)
src/utils/track.js           plain-text track logging (native/production)
src/utils/track.web.js       in-memory track stub for the web dev/test build
src/utils/trackFormat.js     shared control-point line formatter (both targets)
src/utils/homeLocation.js    saved Home location (native, expo-file-system)
src/utils/homeLocation.web.js saved Home location (web, in-memory only)
```

## Notes / limitations
- Foreground only; no background or locked-screen tracking.
- "App closes itself" on arrival isn't portable (iOS forbids self-exit), so the
  Arrived screen is the end state; Android offers a best-effort *Close app*.
- The dead-band (`MIN_DELTA_M`) suppresses GPS jitter; set it to `0` for the
  literal warmer-or-colder behaviour of the original game.
