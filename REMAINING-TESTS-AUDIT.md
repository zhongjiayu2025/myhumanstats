# Remaining 30 tests: source review and verification register
Date: 2026-10-07. Baseline: GSC screenshots provided by owner. Scope excludes five previously optimized core pages: Rhythm, Contrast, Color Hue, Perfect Pitch and Peripheral Vision.

**Important:** This is a source-code audit, not a claim of complete end-to-end cross-browser testing. A successful Next build means the source compiles, not that every interactive sequence has been exercised. Protect indexed page slugs and search keywords.

## Findings and committed fixes
1. Score/history ID mismatches affected 17 test IDs (including earlier five-page fixes). `lib/core.ts` now accepts old keys, writes normalized canonical keys and combines history without dropping prior entries.
2. `HearingAgeTest` wrote a score during React render; it now writes on completion via an effect, including raw frequency.
3. `NumberMemoryTest` previously stored its stage directly as a 0–100 dashboard score; now stores bounded practice score plus raw longest successful digit span.
4. `ReactionTimeTest` now uses a monotonic timer and a single pointer input path, retaining keyboard activation.
5. `SpacebarSpeedTest` previously disabled its pointer overlay on desktop; desktop click and touch now use one pointer path.
6. `ADHDTest` contained stale trial state and duplicate response risks; trial progression now uses refs and result wording remains explicitly non-diagnostic.
7. `VisualMemoryTest`, `ChimpTest` and `StroopTest` use one activation path per selection rather than independent mouse/touch listeners.
8. `AimTrainerTest` merges duplicated mouse/touch target interactions into unified pointer inputs.
9. `ProcrastinationTest` uses pointer capture to keep the hold action consistent on touch devices.

## Remaining-module source-review inventory

| Category | Test modules | Code review outcome |
|---|---|---|
| Auditory | HearingAge, VocalRange, ToneDeaf, Misophonia | HearingAge render side-effect fixed; legacy history IDs normalized; other audio/mic and cancellation behaviors still require browser testing. |
| Visual | ColorBlind, Afterimage, VisualMemory, AimTrainer, Astigmatism, FaceBlindness | Input paths fixed in VisualMemory/AimTrainer, legacy IDs in FaceBlindness; screen calibration and accessibility still require review. |
| Cognitive | ReactionTime, Cps, Stroop, Chimp, TypingSpeed, NumberMemory, SpacebarSpeed, AttentionSpan, ReadingSpeed, VerbalMemory | Route/history audit and several input fixes made; Cps and other timer-related interactions need hardware/browsers verification. |
| Personality | BigFive, Procrastination, SocialBattery, LeftRightBrain, DifficultPerson, ADHD, EQ, Anxiety, Chronotype, Empathy | ADHD state progression fixed; Procrastination pointer hold fixed; medical/psychological interpretation and attention-task accuracy remain an editorial QA gate. |

## Remaining manual acceptance work
- Test all 30 interactions in real Chrome/Firefox/Safari on mouse/keyboard/touch, including early clicks, misses, timeouts, permission denial, restart, and navigation during a session.
- Verify score and last-50 history behavior for each tested module, including old LocalStorage backups and import/export.
- Validate audio/microphone routines and response latency under different sample rates/devices.
- Remove unsupported clinical claims across all remaining questionnaire and health-adjacent pages after source-by-source evidence review.
- Only treat a module as functionally verified after performing its full start → response → finish → retry → history path.

Automated build gate: `node scripts/audit-tests.mjs`, run after `npm run build` in GitHub Actions.
