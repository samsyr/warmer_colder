# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A GPS "warmer / colder" game built with **Expo (SDK 54) + React Native 0.81 + React 19**, plain JavaScript (no TypeScript). You enter a target's coordinates; every 10 s the phone reads GPS, speaks *warmer* / *colder* plus the straight-line distance left, and logs each reading to a text file, until you arrive within 100 m.

`TECHNICAL_SPECIFICATION.md` is the original build brief. Code comments reference its sections (e.g. "spec §6"); consult it when a comment cites a section.

## Commands

```bash
npm install
npx expo install --fix     # align native module versions with the Expo SDK — run after dependency changes
npx expo start             # Metro + QR code (dev client / general)
./script/start.sh [args]   # `expo start` with all args forwarded (e.g. --go, --tunnel, --clear)
./start_expo_go.sh         # convenience wrapper → script/start.sh --go (Expo Go)
./script/force_stop.sh     # kill Metro (8081), expo, metro, ngrok
./script/force_clean_start.sh [args]  # nuke node_modules/.expo/caches, reinstall, restart (forwards args) — use when Metro is wedged
npm test                   # Jest (jest-expo preset) — unit tests for pure logic (src/utils/*.test.js)
npm run test:web           # Playwright smoke test — starts the web dev server, loads it headless,
                            # fails on any HTTP/console/page error or missing expected content
npm run test:all           # both, in sequence
```

EAS builds are configured in `eas.json`: `eas build --profile development` (internal dev client) and `--profile production`.

There is **no linter configured** — no `eslint` or `prettier`; don't invent `npm run lint`. GPS/speech/native behaviour still has no automated coverage and is verified manually on a physical device (a simulator can be fed a mock location but won't move realistically; real GPS requires being outdoors) — the automated tests above only cover pure logic and the web dev target. `.claude/agents/testing-agent.md` defines a subagent whose job is to keep this test set current as features are added; invoke it (or ask for it by name) after implementing a feature, rather than letting test coverage silently fall behind.

## Architecture

**Phase state machine.** `App.js` holds a single `phase` (`setup → game → arrived`) and the `target` coords, swapping one full-screen component per phase. There is no navigation library.

**The core loop is isolated in one hook: `src/hooks/useWarmerColder.js`.** This is the most important file. It owns permissions, the `setInterval` tick, GPS reads, haversine distance, trend resolution, speech, and track logging — deliberately UI-independent so the game rules are testable in isolation. Screens are thin; logic changes almost always belong here.

**Trend resolution has no "no change" state** (matching the original game). Each tick compares the current distance against `lastDistance` — the *last committed* distance, a hysteresis baseline that only updates when a real warmer/colder is emitted, not every tick. This lets small steady movement accumulate until it crosses the `MIN_DELTA_M` dead-band, so nothing freezes permanently while standing still. A reading inside the dead-band inherits `lastStatus` (defaults to `'warmer'`, so an opening dead-band reading becomes warmer) **and** reuses `lastDistance`, so the spoken/shown number can never contradict the word. `config.SPEAK_ON_NO_CHANGE` toggles whether dead-band readings are spoken aloud (the UI updates either way).

**UI language and voice language are two independent systems — keep them separate.**
- **On-screen text:** `src/i18n.js`, a `strings` map keyed by `config.LANGUAGE` (the device `languageCode` from `expo-localization`), falling back to English. Import the resolved `UI` object.
- **Spoken output:** `src/voices.js`, keyed by the device TTS locale (`Intl…resolvedOptions().locale`), independent of the UI language. A spoken cue is `<trend word> <number> <unit>`. The **number and unit are auto-localized for any language with zero config** — the TTS engine reads digits in the device language, and `Intl.NumberFormat({style:'unit', unit:'meter'})` renders the localized unit ("metriä", "meters", …). Only the **trend word** (warmer/colder) needs translation; it comes from the small `TREND_WORDS` table. **To add a language to the voice, add two words there** — everything else is automatic. (`speech.js` is the `expo-speech` wrapper: it cancels any in-flight utterance and picks the highest-quality voice for the locale.)

**All tunables live in `src/config.js`** (interval, arrival radius, dead-band, language override, speech rate/pitch/voice, `SPEAK_ON_NO_CHANGE`). Change behaviour there, not by scattering constants.

**Track logging (`src/utils/track.js`):** `expo-file-system` has no native append, so the full file is rewritten each tick from an in-memory `lines` array. The file lives in the app's sandboxed Documents directory (`Paths.document`). On iOS it is **not user-accessible** without adding `UIFileSharingEnabled` / `LSSupportsOpeningDocumentsInPlace` to `app.json` → `ios.infoPlist` (not currently set), or an in-app share sheet.

**Other utilities:** `src/utils/geo.js` (haversine + coordinate validation), `src/utils/RandomDestinationPicker.js` (forward-geodesy class that picks a point exactly 1 km from an origin for the Setup screen's "random destination" button), `src/utils/homeLocation.js` (persists a saved Home location via `expo-file-system`, read/written from the Setup screen).

**Any module that touches a native-only API needs a `*.web.js` counterpart, or the web build crashes at runtime.** Metro resolves `foo.web.js` over `foo.js` automatically for the web platform — there's no compile-time check that one exists, so a missing counterpart doesn't fail until the module is actually invoked in a browser (e.g. `homeLocation.js` used `expo-file-system`'s `File`/`Paths` directly with no `homeLocation.web.js`, and crashed the whole page on mount with `this.validatePath is not a function` — caught by `npm run test:web`, not by Metro). Existing examples: `track.js`/`track.web.js` (in-memory instead of on-disk), `speech.js`/`speech.web.js` (Web Speech API instead of `expo-speech`), `demoJitter.js`/`demoJitter.web.js`, `homeLocation.js`/`homeLocation.web.js`.

## Notes

- `app.json` configures iOS/Android permission strings and bundle IDs; the React Compiler is enabled via `experiments.reactCompiler`. The Hermes engine's `Intl` unit support can differ from Node's — `voices.js` wraps the `Intl.NumberFormat` call in try/catch and falls back to the bare number.
- If the README's "Project map" or "Testing" sections and the actual `src/` tree or `package.json` scripts ever disagree, trust the code and this file over the README, and fix the README while you're there.
