# MyHumanStats mobile / audio acceptance matrix

Use real devices or browser automation with a running browser and controlled microphone inputs. The static quality gate is not a replacement for these interactions.

| Test | Critical steps | Pass conditions |
|---|---|---|
| CPS | Mouse/pointer, touch, Enter/Space, 1s/10s/60s, background-tab delay | Every physical press counts once; stops at the intended monotonic duration; first click included; duration switch respected; heatmap points fit canvas |
| Anxiety/Cursor focus | Ten-second hold on mouse/touch, release early, cancel pointer, finish all prompts, restart | Early release resets; completed hold proceeds exactly once; no clinical GAD-7/medical diagnosis claim |
| Mic | No device, permission deny, default/selected mic, switch device, stop and play, clear and unmount | No stale microphone tracks, no leaking ObjectURLs; graceful recorder fallback and correct playable MIME |
| Stereo | Left, right, center, in/out phase, orbit, rapid switching and unmount | Only one audible source; no playback after unmount; safe gain and manual stop |
| Hz checker | 60/120/144 Hz monitors, 390px screen, hide/show tab, motion speed changes | No stale FPS state, no Infinity/NaN, no runaway RAF, clearly labeled as an estimate |
| Ranked test routes | rhythm/contrast/hue/pitch/peripheral/reaction | Tool near top, functional mobile input, no accidental canonical/keyword/URL changes |
| All 35 pages | View Source and rendered HTML | Correct unique title + description + visible H1 + original method explanation, canonical and indexable sitemap URL |
| Site-wide | Mobile 360/390/768/1024, keyboard-only and reduced-motion | Navigation, content, focus, touch controls and no severe shift/overflow |

**Do not check any manual row complete without actual browser interaction evidence.**
