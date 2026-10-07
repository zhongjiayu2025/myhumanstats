# MyHumanStats SEO / GEO project brief (2026-10-07)

## Evidence baseline
Owner-provided Google Search Console screenshot: 591 clicks, approximately 36,400 impressions, CTR 1.6%, average position 20.7 over a rolling three-month window. This is observed search performance, not a guaranteed growth rate.
Owner-provided US desktop keyword tool data (2026-10-07); do not silently replace approved terms:

| Primary query | US monthly volume | KD | US CPC | Canonical tool destination |
|---|---:|---:|---:|---|
| rhythm test | 720 | 11 | 0 | /test/rhythm-test/ |
| contrast sensitivity test | 320 | 16 | 2.44 | /test/contrast-test/ |
| color hue test | 480 | 33 | 0 | /test/color-hue-test/ |
| perfect pitch test | 3600 | 27 | 1.75 | /test/perfect-pitch-test/ |
| peripheral vision test | 1600 | 24 | 1.82 | /test/peripheral-vision-test/ |
| number memory test | 590 | 31 | 1.24 | /test/number-memory-test/ |
| spacebar speed test | 1600 | 27 | 0 | /test/spacebar-speed-test/ |
| vocal range test | 12100 | 38 | 1.20 | /test/vocal-range-test/ |
| hearing age test | 720 | 37 | 1.58 | /test/hearing-age-test/ |
| pelli robson test | 40 | 13 | 1.83 | /test/contrast-test/ as non-clinical explanatory context |

Values are third-party estimates, not Search Console query totals. Keep one canonical primary destination per search intent; avoid creating separate indexable pages solely for spelling variations.

## Index and architecture
- Preserve existing `/test/[id]/` slugs, categories, blogs and six `/tools/` routes.
- Index core tests, category hubs and useful original blog pages. Keep reference tables noindex until reliable sourcing is added; glossary one-paragraph entries remain noindex until independently useful.
- Sitemap contains canonical indexable destinations only; never sitemap noindex reference pages.
- Remove nonexistent internal search SearchAction until a real crawlable route exists.
- Preserve existing GSC-performing title themes while improving factual relevance and tool usability.
- Avoid fabricated benchmarks, ratings, authorship, clinical diagnoses, published dates and fake schema attributes.

## GEO / citation policy
Real interactive value is the primary original asset. Explain test methodology, browser/hardware limitations and reproducibility succinctly near results. Present sourced facts with precise citation mapping. Structured data must match visible page content; Google AI Search does not require AI-only markup. No paid GEO plugins or API required.

## Internal links
Auditory: Rhythm → BPM Counter → Perfect Pitch → Tone Deaf → Vocal Range.
Visual: Contrast → Color Hue → Color Blind → Peripheral Vision.
Cognitive: Number Memory → Visual Memory → Verbal Memory → Reaction Time.

## Measurement
Track query × landing page × country × device per 28-day settled GSC window. Treat current screenshots as baseline until this property's connector access exists. Check migration/SEO regressions after deploying, then again after 28 and 90 days.
