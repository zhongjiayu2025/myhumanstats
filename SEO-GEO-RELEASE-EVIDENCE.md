# MyHumanStats SEO/GEO release evidence

Reference period: October 7, 2026. Production: https://myhumanstats.org/
User-provided GSC three-month snapshot baseline: **591 clicks, 36,400 impressions, 1.6% CTR, average position 20.7**. This is not a forecast.

## Release history and verified automated gates
- PR #1: SEO/canonical, structured-data integrity, misleading clinical claims and static-export repairs.
- PR #2: core traffic tools (Rhythm, Contrast, Hue, Pitch, Peripheral Vision) and test-specific educational explanations.
- PR #3: canonical score IDs, local-history compatibility, timer and pointer repairs; 35-test static route gate.
- PR #4: browser/mobile follow-up for CPS, anxiety/pointer practice, local microphone recording, stereo audio safety and Hz-frame sampling; 35 page unique content and six tool canonicals. **PR checks are authoritative; do not assume it has deployed before they pass.**

## Automated release gate
| Gate | Evidence |
|---|---|
| TypeScript | GitHub Actions / verify / Type-check |
| Static export | GitHub Actions / verify / Static export |
| 35 route and score IDs | node scripts/audit-tests.mjs |
| 35 SEO pages + six tools | node scripts/audit-seo-export.mjs |
| Cloudflare | Commit-specific Pages check, not just a green GitHub build |
| Live production | Final deployed version and HTTP/HTML checks required |

## Manual acceptance still needed
- Android Chrome / iOS Safari touch tests for CPS, Rhythm, Colour Hue and reaction/aim exercises.
- Browser input permission allowed/denied/not-found flows for microphone and vocal range.
- Audio playback including stereo channel/phase/orbit, mic recording across supported MIME formats, idle/unmount resource cleanup.
- Screen reader focus, reduced motion, 360/390/768px layouts and real INP/LCP/CLS.
- 28-day and 90-day GSC comparison by query x page x country x device.

All statistical comparisons and medical-sounding explanations require evidence. No auto-generated claims of diagnostic validity, universal norms, traffic improvement, or browser passes.
