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


## Website-Starter-Standard growth and quality pass (branch seo/traffic-growth-entrypoints-20261007)
Date: 2026-10-07. Governing source: chenmu2024/Website-Starter-Standard; includes agent rules, full quality gate, and per-project intent/evidence mapping.
Scope: first-visit H1 and six GSC-priority links, contextually relevant related-test journeys, selected search snippets, stable WebSite/SoftwareApplication IDs, removal of invisible HowTo JSON-LD and unsupported global benchmark displays, category/FAQ factual corrections, machine-readable drift baseline.
No new languages, keyword-variant pages, paid APIs, changed indexed test slugs, or assumed medical validation.

| Gate | Status | Proof needed |
|---|---|---|
| TypeScript and Next.js export | Pending PR CI | Action run tied to final branch SHA |
| 35 test/6 utility sitemap and canonical | Pending PR CI | audit-seo-export.mjs |
| Unique H1, featured direct links | Pending PR CI | static HTML audit + mobile Chromium |
| HTML JSON-LD parse and same-page entity relations | Pending PR CI | capture-seo-baseline.mjs |
| SEO drift manifest | Pending PR CI | uploaded Actions artifact |
| Mobile Chromium entry and related-link navigation | Pending PR CI | Playwright tests |
| Real Cloudflare production commit verification | Pending merge | commit-specific deployment check |
| Safari/iOS hardware, Android real microphone/audio | NOT VERIFIED | real-device acceptance matrix |
| Core Web Vitals lab/field LCP/INP/CLS | NOT MEASURED | real site and CrUX/lab measurement |
| New GSC clicks/CTR or AI-search visibility | NOT YET MEASURED | 28/90-day GSC export; this site not in the currently linked GSC list |

## L2 incremental technical integrity pass — 2026-10-07
Governing source: `chenmu2024/Website-Starter-Standard`, `SEO-GEO-QUALITY-GATE.md` technical and raw HTML sections.

The L1 raw-HTML test, 35 test registry/score check, six utility canonical validation, schema parity and baseline artifact remain mandatory. Additional `scripts/audit-internal-links.mjs` checks exported HTML links, sitemap destinations and local image references for build-time 404s. It does not claim remote-image availability, actual HTTP redirect semantics, browser event correctness, or live field CWV.

Removed misleading homepage `iq test` meta-keyword because there is no validated IQ test; this is not an owner-locked approved primary keyword. Existing owner-approved search terms and their exact canonical routes remain unchanged. Aligned tool hub descriptions with actually available non-calibrated browser measurements.

Gate outcome and Cloudflare release SHA must be filled with actual CI status. Follow-up: obtain first-party connected GSC for page/query changes; do not infer traffic gains from a build.
