# Warmer / Colder — Technical Specification (PoC)

> A GPS-based outdoor wayfinding game. The phone guides you to a target using
> nothing but spoken "warmer" / "colder" feedback and a straight-line distance,
> the way a childhood "getting warmer, getting colder" game works — only the
> playing field is now the real world instead of a single room.

This document is written to be handed directly to an AI coding agent (e.g. Claude
Code) as the build brief for a Proof of Concept. It is implementation-oriented:
every rule is stated so it can be coded without further interpretation.

---

## 1. Background and purpose

The concept comes from a children's game: one player stands at point **A** and
tries to reach a hidden goal **B**. As they move, a guide repeatedly calls out
"warmer" (closer) or "colder" (farther). With enough calls, the seeker reliably
homes in on the goal.

The product turns this into a personal exploration tool. The intended primary use
is helping someone who has just moved to a new town discover their surroundings on
foot, on a run, or by bike — by turning navigation into a low-pressure game rather
than turn-by-turn directions.

The key insight that makes this viable: **plain warmer/colder feedback is, on its
own, enough to steer a user to a destination.** The PoC exists to validate that
claim in the real world.

---

## 2. Goals and non-goals

### Goals (PoC / MVP)
- Prove that repeated warmer/colder audio cues plus a distance readout can guide a
  real user to a real-world target.
- Run on a real phone during a real walk/run/cycle.
- Be simple enough to "vibe-code" quickly.

### Non-goals (explicitly out of scope for the PoC)
- Turn-by-turn or map-route navigation.
- Map rendering / visual route display.
- Accounts, persistence across sessions, sharing, multiplayer.
- Background operation when the screen is locked.
- Battery, network-offline, or accessibility optimization beyond basics.

---

## 3. Core game rules (formalized)

1. The session starts with the user at an arbitrary location (**A**). The target
   (**B**) is supplied by the user as coordinates at launch.
2. At a **fixed interval** (default **10 seconds**), the app takes a GPS reading
   ("control point") and computes the great-circle ("as the crow flies") distance
   to **B**.
3. At each control point after the first, the app compares the current distance to
   the distance at the **previous** control point:
   - distance decreased → **"warmer"**
   - distance increased → **"colder"**
   - effectively unchanged → **"no change"** (see dead-band, §9)
4. The app speaks the result **and** the current remaining straight-line distance,
   then logs the reading.
5. When the user comes within the **arrival radius** (default **100 m**) of **B**,
   the app speaks a congratulation and ends the session.

The interval is intentionally constant in the PoC. The original game's guide could
vary how often they spoke; here a fixed cadence is used so the same app works
whether the user travels on foot, by bike, by e-scooter, or by car — a faster
traveller simply covers more ground between cues, and direction can still be
confirmed once enough cues accumulate.

---

## 4. Functional requirements

| ID | Requirement |
|----|-------------|
| FR-1 | On launch, prompt the user for the target coordinates (latitude, longitude). |
| FR-2 | Provide a convenience action to capture the device's **current** GPS position as the target (useful for testing). |
| FR-3 | Validate coordinates: latitude in [-90, 90], longitude in [-180, 180]; reject anything else with an inline error. |
| FR-4 | Request foreground location permission before tracking; if denied, show a clear, actionable error and do not start. |
| FR-5 | Once started, take a GPS reading every `CONTROL_INTERVAL_MS` (default 10 000 ms). |
| FR-6 | Compute great-circle distance to the target using the haversine formula (§8). |
| FR-7 | At each control point (except the first), determine the trend vs. the previous control point: warmer / colder / no change. |
| FR-8 | At each control point, give spoken feedback: the trend word plus the rounded remaining distance in metres. The very first reading has no previous point, so it announces distance only. |
| FR-9 | Append every control point to a plain-text log file, one reading per line (§7). |
| FR-10 | When current distance ≤ `ARRIVAL_RADIUS_M` (default 100 m), speak a congratulation, stop the interval, and move to the "arrived" state. |
| FR-11 | Allow the user to stop a session manually at any time. |
| FR-12 | On arrival, surface the log file location so the captured track can be retrieved. |
| FR-13 | All key parameters (interval, arrival radius, language, dead-band, filename) must live in a single config module so they are trivially tunable. |

---

## 5. User flow

```
[ Setup ] --enter target / use current--> [ Tracking ] --within 100 m--> [ Arrived ]
    ^                                          |  every 10 s: read GPS,        |
    |                                          |  speak warmer/colder + dist,  |
    +------------------ "start over" ----------+  log a line                   |
                                               +--- manual "Stop" -------------+
```

- **Setup screen:** two coordinate fields, a "Use my current location" button, a
  "Start" button. Invalid input blocks Start with an inline message.
- **Tracking screen:** large remaining-distance readout, current trend
  (warmer/colder/no change), number of control points recorded, a "Stop" button.
- **Arrived screen:** congratulation, target shown, path to the saved track file,
  and a "Start over" button.

---

## 6. Audio feedback specification

- Use on-device text-to-speech (TTS). No network required.
- Each control point speaks a single short utterance. A new utterance cancels any
  still-playing previous one (cues should never queue up and lag behind reality).
- Utterance content:
  - First reading: distance only.
  - Subsequent readings: `<trend> + <remaining distance> metres`.
  - Arrival: a congratulatory line.
- Language is configurable (`LANGUAGE` in config). Two phrase sets are provided:
  - **English** ("Warmer. 240 metres to go.")
  - **Finnish** ("Lämpenee. Matkaa jäljellä 240 metriä.") — the language of the
    original game; included so the tool can be used in its native form.
- Phrases live in a dedicated module so wording/locale can be edited in one place.

---

## 7. Track logging specification

- A single plain-text file in the app's document directory (default name
  `track.txt`).
- The file is **reset (emptied)** at the start of each session.
- One control point per line. Tab-separated fields:

  ```
  <ISO-8601 timestamp>\t<latitude>\t<longitude>\t<distance_to_target_m>
  ```

  Example:
  ```
  2026-06-09T10:31:00.000Z	60.169857	24.938379	412
  2026-06-09T10:31:10.000Z	60.170102	24.938991	388
  ```
- Coordinates are written with 6 decimal places; distance is rounded to whole
  metres. This file is the raw artifact a tester uses to review the path taken.

---

## 8. Geospatial computation

- **Distance:** great-circle ("as the crow flies") distance via the **haversine**
  formula, Earth radius `R = 6_371_000 m`. Output in metres.
- **No bearing / no compass** is exposed to the user. The product deliberately does
  *not* tell the user which way to go — discovering direction from the
  warmer/colder signal is the entire point of the game.
- All trend decisions are made purely on the change in distance between
  consecutive control points.

Reference implementation (the agent must match this behaviour):

```
a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlon/2)
d = 2·R·asin(√a)
```

---

## 9. Tunable parameters (single config module)

| Name | Default | Meaning |
|------|---------|---------|
| `CONTROL_INTERVAL_MS` | `10000` | Time between control points (ms). |
| `ARRIVAL_RADIUS_M` | `100` | Within this distance the goal is "found". |
| `MIN_DELTA_M` | `3` | Dead-band: distance changes smaller than this count as "no change", to suppress GPS jitter when nearly stationary. Set to `0` for the literal warmer-or-colder behaviour of the original game. |
| `LANGUAGE` | `'en'` | `'en'` or `'fi'`; selects the spoken phrase set and TTS locale. |
| `TRACK_FILENAME` | `'track.txt'` | Name of the log file in the document directory. |

---

## 10. Recommended technology stack

**Chosen: Expo (React Native), JavaScript.**

Rationale:
- **Runs on a real phone in minutes.** With the Expo Go app a tester scans a QR
  code and is walking around with the build — exactly what a field-tested PoC
  needs, with no Xcode/Android Studio setup and no app-store step.
- **First-party modules cover every requirement:** `expo-location` (GPS),
  `expo-speech` (on-device TTS), `expo-file-system` (write the track file). No
  third-party glue needed.
- **Cross-platform** from one JS codebase (iOS + Android), so the PoC isn't locked
  to one device.
- **Fast iteration / "vibe-coding" friendly:** hot reload, a small surface area,
  and a large amount of training-data coverage for an AI agent to draw on.

Alternatives considered:
- **Progressive Web App** (Geolocation + Web Speech APIs): zero install, but
  background/locked-screen geolocation and TTS are unreliable across mobile
  browsers, and "save to a file" is awkward — weaker fit for a field test.
- **Flutter:** strong cross-platform option, but heavier toolchain setup for a
  throwaway PoC and less of an instant-on-device story than Expo Go.
- **Native iOS/Android:** best long-term, far too much setup for an MVP.

If the idea proves out, the natural next step is a development build (still Expo)
to enable background location and map display.

---

## 11. Architecture and module breakdown

```
App.js                  State machine: setup → game → arrived; owns the target.
src/config.js           All tunable constants (single source of truth).
src/phrases.js          Spoken phrase sets (en / fi).
src/screens/
  SetupScreen.js        Coordinate entry + "use current location" + validation.
  GameScreen.js         Live distance/trend UI; signature warm↔cold colour shift.
  ArrivedScreen.js      Congratulation + track-file location + restart.
src/hooks/
  useWarmerColder.js    Core loop: permissions, interval, read, compare, speak, log.
src/utils/
  geo.js                Haversine distance.
  speech.js             TTS wrapper (locale-aware).
  track.js              Reset/append the plain-text track file.
```

The core game loop is isolated in `useWarmerColder` so the rule logic is testable
and independent of the UI.

---

## 12. Permissions and platform considerations

- Requires **foreground** location permission (`requestForegroundPermissionsAsync`).
- The PoC runs only while the app is foregrounded and the screen is on; background
  tracking is out of scope.
- **"App closes itself" on arrival:** the original concept ends by the app closing.
  Programmatic self-exit is not portable — iOS (Apple guidelines) does not allow an
  app to terminate itself, and it is discouraged generally. The PoC therefore ends
  the *session* and shows the Arrived screen as the canonical end state; on Android
  it may additionally offer/attempt a graceful exit. The agent must not rely on a
  guaranteed process kill.
- Speech and file APIs are on-device; no backend or connectivity is required.

---

## 13. Edge cases and error handling

- **Permission denied:** do not start; show an actionable message.
- **GPS read fails / times out at a control point:** skip that point (keep the
  previous distance as the comparison baseline), surface a non-fatal status, and
  continue with the next tick. One bad reading must not end the session.
- **First control point:** no previous distance exists → announce distance only,
  set no trend.
- **Stationary / GPS jitter:** handled by `MIN_DELTA_M` dead-band (§9).
- **Already within arrival radius at start:** immediately go to Arrived.
- **Overlapping ticks** (a GPS read slower than the interval): guard so a new tick
  is skipped while one is still in flight.

---

## 14. Acceptance criteria

The PoC is accepted when, on a physical phone:
1. Launching prompts for target coordinates and accepts both manual entry and
   "use current location".
2. After Start, a spoken cue is produced roughly every 10 seconds containing a
   trend word (after the first reading) and the remaining distance.
3. Walking toward the target reliably yields "warmer"; walking away yields
   "colder".
4. `track.txt` contains one tab-separated line per control point in the specified
   format, reset per session.
5. Crossing inside 100 m produces a spoken congratulation and the session ends on
   the Arrived screen, which shows where the track file was saved.
6. Every parameter in §9 can be changed in one file and takes effect.

---

## 15. Future extensions (post-PoC, not to be built now)

- Map view showing the recorded breadcrumb track.
- Adaptive cue cadence (closer = more frequent), echoing how a human guide would
  speak more often near the goal.
- Background/locked-screen tracking via an Expo development build.
- Difficulty modes (silent stretches, limited number of cues).
- Saving multiple named tracks and reviewing past explorations.
