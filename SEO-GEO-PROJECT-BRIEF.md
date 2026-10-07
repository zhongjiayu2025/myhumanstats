# MyHumanStats SEO/GEO project brief — 2026-10-07

Governing standard: chenmu2024/Website-Starter-Standard / SEO-GEO-QUALITY-GATE.md.
Existing production domain: https://myhumanstats.org/ . Single language: English. Target readers: English-speaking international visitors with US as the largest known click market. Free 35-test browser collection, six utility pages. Static Next.js export on Cloudflare Pages; no required account, backend, database, paid API or fixed server charge. Monetization has not been verified.

## 1. Approved keywords, intent and evidence
**Source:** owner-supplied third-party US desktop keyword export, October 2026. Volume/KD/CPC are estimates, not first-party Search Console traffic, ranking guarantees or AdSense earnings. The following keyword strings are owner-approved and must not change.

| Locked primary keyword | US Volume/month | KD | CPC USD | Canonical search-intent owner |
|---|---:|---:|---:|---|
| vocal range test | 12100 | 38 | 1.20 | /test/vocal-range-test/ |
| perfect pitch test | 3600 | 27 | 1.75 | /test/perfect-pitch-test/ |
| peripheral vision test | 1600 | 24 | 1.82 | /test/peripheral-vision-test/ |
| spacebar speed test | 1600 | 27 | 0.00 | /test/spacebar-speed-test/ |
| hearing age test | 720 | 37 | 1.58 | /test/hearing-age-test/ |
| rhythm test | 720 | 11 | 0.00 | /test/rhythm-test/ |
| number memory test | 590 | 31 | 1.24 | /test/number-memory-test/ |
| color hue test | 480 | 33 | 0.00 | /test/color-hue-test/ |
| contrast sensitivity test | 320 | 16 | 2.44 | /test/contrast-test/ |
| pelli robson test | 40 | 13 | 1.83 | /test/contrast-test/ contextual explanation ONLY; not an authentic clinical Pelli–Robson protocol |

The remaining pre-existing unique tests keep their existing page intents and slugs. No mass-produced synonym pages, keyword swapping, unreviewed translations, or keyword cannibalization.

**Owner GSC screenshot baseline:** rolling three months ending early October 2026: 591 clicks, about 36,400 impressions, CTR 1.6%, average position 20.7. Pages: Rhythm 93 clicks, Contrast 81, Color Hue 67, Spacebar Speed 47, Perfect Pitch 45, Number Memory 33, Peripheral Vision 26. This property is not in the currently linked GSC connector account; these are owner-supplied screenshots, not independently queried current GSC data.

## 2. Route and indexation policy

| Routes | Canonical/index rule | Sitemap | Notes |
|---|---|---|---|
| / | Self, index/follow | yes | User intent H1, six direct search-focused links |
| /test/[id]/ (35) | Self, index/follow | yes | Distinct real interactive tools, visible method and limitations |
| /tools/[id]/ (6) | Self, index/follow | yes | Independent utilities, device permission only on demand |
| /category/[categoryId]/ (4) | Self, index/follow | yes | Search-relevant hubs, real anchor links |
| /blog/[slug]/ | Self, index/follow if independently useful | currently yes | Factual review and originality are required |
| /statistics/ and /statistics/[id]/ | Self, noindex/follow | no | Unverified reference values, not visitor aggregates |
| /glossary/[slug]/ | Self, noindex/follow | no | Thin definitions awaiting differentiation |
| /tools/, /blog/, /glossary/ | Self, index/follow | yes | Category/listing hubs |
| About, legal, contact | Self, index/follow | yes | Must match actual privacy and ownership practices |

Keep the working trailing-slash policy, production HTTPS host, deterministic slugs and real 404 handling. No query-parameter index pages. No redirects or URL changes for established ranking pages.

## 3. Crawl and related-content structure
Primary hub / gives direct raw-HTML links to Rhythm, Contrast, Color Hue, Perfect Pitch, Peripheral Vision and Number Memory. Remaining 29 tools are discoverable through the homepage/category grids, not orphaned. Each test links to its actual /category/{category}/ hub.

Cross-topic relevance mapping:
- Rhythm ⇄ Perfect Pitch ⇄ Tone Deaf ⇄ Vocal Range; Rhythm → BPM Counter.
- Contrast ⇄ Color Hue ⇄ Color Blind ⇄ Peripheral Vision.
- Number Memory ⇄ Verbal Memory ⇄ Visual Memory; Spacebar Speed ⇄ CPS ⇄ Reaction Time.
- Blog posts link to the actual functional test when useful, without stuffing keyword anchors.

## 4. GEO answer and original-value map
| Test | Direct answer / reproducibility | Original useful asset | Limitation |
|---|---|---|---|
| Rhythm | BPM and tap timing, timing variation | Actual tap sequence and own history | device and audio latency |
| Contrast | Distinguishing faint patterns | On-screen stripe exercise and score | not clinical Pelli–Robson |
| Color Hue | Find a different hue | Timed color tile game and breakdown | monitor gamut and calibration |
| Perfect Pitch | Identify notes; reference C changes to relative-pitch task | Ten-round note recognition | not proof of absolute pitch |
| Peripheral Vision | Focus centrally and detect peripheral on-screen flashes | Two targets per region | not medical visual field exam |
| Number Memory | Recall digit spans | Increasing sequence recall | practice-dependent |
| Vocal Range | Microphone detects a sung pitch range | Browser-based audio processing | mic, technique and environment |
| Hearing Age | Browser high-frequency audibility | Tone-frequency experiment | not hearing-age or clinical test |

Do not fabricate population norms or clinical precision, ratings, author credentials, testimonials, revenue, backlink metrics, AI Overview appearance or an "AI visibility" score. Google AI Search has no required parallel markup. llms.txt is not necessary.

## 5. Evidence / source register

| Topic | Source of truth | Date / update trigger | Known limitation |
|---|---|---|---|
| Keyword Volume/KD/CPC | owner-supplied keyword export | Oct 2026; revalidate before new investment | third-party estimate |
| GSC click/impression baseline | owner-supplied GSC screenshots | Oct 2026; compare settled 28/90 day windows | not linked to this GSC connector |
| Tool methodology and measurement | actual source code plus user tests | on feature change | no independent clinical calibration |
| WebSite / SoftwareApplication | Schema.org documentation | when altering schema | matching schema is not guaranteed rich results |
| LCP, INP, CLS | actual live data or labelled lab testing | post-release | none currently measured in this session |
| Hearing/vision medical claims | independent primary clinical sources required | before making claims | not available for validation of these web exercises |

The bibliography on test pages is related reading; citing a paper does not imply the proprietary browser exercise was clinically validated.

## 6. Entity and structured-data plan
Canonical WebSite name MyHumanStats, stable @id https://myhumanstats.org/#website . Existing 35 individual SoftwareApplication identifiers use canonical /test/{slug}/#software, a real free Offer and same WebSite relationship. BreadcrumbList mirrors visible Home/category/current route. FAQPage only where its FAQs are visible and factually accurate; no promise of Google FAQ rich results. No fabricated reviews, organizations, authors, dates or fake HowTo steps.

## 7. International, programmatic, media, crawlers
English only; hreflang: N/A (do not manufacture translations). The 35 tests are bounded, purposeful static pages with different interaction logic, not generic programmatic SEO. Canonicals self-reference. The brand logo is a neutral fallback OG asset; do not substitute filler imagery for actual test interactions. Googlebot/Bing Search crawling remains allowed by existing robots.txt. No assumption that Google-Extended controls Search; training-crawler changes require explicit owner decision.

## 8. Release L1 / L2 / L3 and sign-off
L1: TypeScript, Next build, npm audit, static HTML SEO script and 35-route test registry gate. L2: Playwright mobile Chromium, actual deploy SHA, robots/sitemap/canonical raw HTML, manual spot checks and source-content parity. L3: compare first-party GSC query × page × country × device 28/90 days later when the property is accessible. Core Web Vitals must be measured, not inferred.

Owner-approved locked keywords: YES (existing supplied set).
Keyword/intent route mapping: preserved existing URLs; no new synonym slugs.
International strategy: English-only, no new languages.
Crawl policy: preserve search crawl, unsourced pages noindex.
Final production/mobile verification: evidence pending until actual checks run.
