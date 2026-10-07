# SEO / GEO Quality Gate

> Mandatory execution standard for every website built from this starter. This document is the detailed gate; `SEO-GEO.md` is the concise policy summary.

## 0. Authority and operating rules

- Read this file before implementing SEO-sensitive architecture, routes, templates, metadata, structured data, internationalization, or content at scale.
- Explicitly approved core keywords are immutable unless the project owner changes them. Do not silently replace, merge, translate, or "improve" them because another keyword appears easier or larger.
- Search volume, KD, CPC, SERP features, traffic estimates, and competitor metrics must come from an identified data source. Never invent or infer numeric keyword data.
- Prefer primary sources for rules: Google Search Central, Bing documentation, Schema.org, web.dev/Chrome, official product/platform docs, and first-party API docs.
- Distinguish four evidence classes in analysis: `official requirement`, `documented best practice`, `third-party evidence`, and `internal heuristic`.
- Internal heuristics are quality-control thresholds, not Google ranking rules.
- Time-sensitive SEO facts must be revalidated against primary documentation when materially relevant.
- Unless traffic/revenue is already validated, do not introduce paid SEO APIs, paid crawlers, fixed monthly infrastructure, or other recurring cost without explicit approval.

## 1. Required SEO architecture before implementation

Before page production begins, define:

1. Approved keyword set and source data.
2. Search intent for every approved primary keyword.
3. One canonical destination per primary intent.
4. Page-type map: homepage, tool, calculator/generator, category/hub, glossary/guide, comparison, programmatic template, legal/support.
5. Internal-link model and hubs/spokes.
6. Indexation policy: index, noindex, canonical target, parameter handling.
7. International structure where applicable: language/region codes, URL strategy, canonical and hreflang relationships.
8. Sitemap ownership and generation method.
9. Structured-data types that truthfully match visible content.
10. Source/evidence registry for factual or time-sensitive claims: source URL/owner, claim supported, checked date, refresh rule, and failure fallback.
11. Entity map for important Organization/Person/Product/SoftwareApplication/VideoGame/etc. entities where identity or disambiguation matters.
12. Release evidence plan: which checks are deterministic, which require visual/manual review, and which require production/Search Console data.

Do not create multiple indexable pages whose only difference is a keyword variation while satisfying the same intent.

## 2. Page-level SEO gate

Every important indexable page must be checked for:

- Unique, intent-aligned `<title>`.
- Useful meta description; no requirement to force exact-match keywords.
- One clear page-level H1 unless framework semantics justify otherwise.
- Logical H2/H3 hierarchy.
- Self-referencing canonical unless intentional consolidation is documented.
- Correct robots directives in the initial HTML.
- Crawlable primary content and crawlable internal links using real `<a href>` links.
- Descriptive URL, stable slug, consistent trailing-slash policy.
- Relevant internal links to parent hub, related tools/content, and the next useful action.
- Useful content or utility visible early; do not bury the answer beneath generic marketing copy.
- Correct Open Graph/social metadata where useful.
- No broken images, scripts, CSS, or external assets required for the core task.

## 3. Raw HTML / rendering gate

For public SEO pages, critical search elements should be present in initial server-rendered or statically generated HTML whenever practical:

- title
- meta robots
- canonical
- primary H1 and primary content
- structured data
- important internal links
- hreflang when emitted in HTML

Compare raw HTML with rendered output for JavaScript-heavy sites. A page that looks correct in a browser is not automatically SEO-correct.

Preferred default:

- SSG: stable public content, tools whose shell/results guidance can be rendered statically.
- SSR: public dynamic SEO content.
- CSR: authenticated/private application surfaces or interactions that do not carry the only copy of indexable content.

Do not rely on JavaScript to repair an incorrect canonical or remove an incorrect `noindex` from the initial HTML.

## 4. Technical SEO gate

Validate at minimum:

- HTTP status codes and redirect behavior.
- HTTPS and mixed-content issues.
- robots.txt availability and intended rules.
- XML sitemap validity and coverage.
- Canonical consistency across HTML, sitemap, hreflang, redirects, and final URL.
- Intentional noindex only; no accidental blocking of important pages/resources.
- Real 404 behavior for missing URLs; no misleading soft-404 templates.
- No redirect chains for primary navigation/canonical routes where avoidable.
- Mobile viewport and usable layout.
- Core Web Vitals: LCP, INP, CLS. Do not use FID as the current interaction metric.
- Structured-data validity against current Google eligibility rules and Schema.org vocabulary.
- JavaScript rendering parity for indexable content.
- IndexNow only where useful for engines that support it; do not present it as a Google indexing mechanism.

Where field data is unavailable, label lab measurements as lab data. Do not fabricate CrUX/GSC status.

## 5. Programmatic SEO quality gate

Applies to generated tools, game pages, fonts, names, calculators, locations, templates, glossary entries, database pages, and other pages produced at scale.

### Required properties

- Each generated page must satisfy a distinct or meaningfully specialized intent.
- Each page must provide standalone value even if no sibling template pages existed.
- Dynamic data/logic must change the substance of the page, not only the keyword/name.
- Template variables must cover title, H1, body sections, metadata, schema, related items, and/or output where appropriate.
- Use conditional sections instead of empty or meaningless boilerplate when data is absent.
- Every programmatic URL must have a deterministic slug and collision handling.
- Each indexable page needs a self-referencing canonical unless a consolidation rule explicitly applies.
- Generated pages must enter the correct hub/internal-link structure and sitemap only after passing quality gates.

### Internal heuristics — not Google rules

Use these as review triggers, not claims about Google's algorithm:

- 100+ unreviewed generated pages: require a sampled quality audit before expansion.
- 500+ pages without explicit business/search justification: stop bulk expansion and review architecture, uniqueness, index demand, and crawl/index behavior.
- Body content below roughly 300 words: review for thinness, but do not pad a useful calculator/tool merely to hit a word count.
- Less than roughly 40% materially differentiated body content across sibling pages: investigate template duplication.
- Less than roughly 30% materially differentiated body content: default stop for large-scale publication until justified.
- Review a representative sample before each major batch; increase sampling when templates or data sources change.

Never publish hundreds of pages merely because generation is technically possible. Utility, original data, unique output, comparison, examples, or genuinely specialized guidance must justify indexation.

## 6. GEO / AI-search gate

GEO does not replace SEO. The baseline is still crawlability, indexability, useful original content, authority, and clear structure.

Google's current guidance for its generative-AI Search features explicitly says normal SEO best practices still apply because those experiences are grounded in core Search ranking and quality systems. Do not create a separate technical stack whose only purpose is "AI optimization."

### Required AI-search principles

- Optimize the same canonical pages for people, classic Search, and AI-assisted Search; do not create duplicate "AI answer" versions.
- Prefer original value: first-party tools, measurements, examples, screenshots, datasets, comparisons, workflows, or analysis.
- Make important claims attributable: identify the source, the checked date where freshness matters, and what is interpretation vs sourced fact.
- Keep entity names and relationships consistent across visible content, metadata, structured data, About/Contact pages, and citations where applicable.
- A page should be quotable in useful self-contained passages without becoming keyword-stuffed or repetitive.
- If content is substantially automated/AI-assisted and disclosure would reasonably answer "how was this created?", document or disclose the workflow appropriately.
- Large-scale AI generation without meaningful added value is prohibited by this standard.

Important pages should improve answer extraction through:

- Direct definition/answer near the start where appropriate.
- Self-contained factual passages that make sense when quoted out of context.
- Question-shaped headings when they match real user intent.
- Tables for comparisons and structured facts.
- Explicit units, assumptions, formulas, inputs, and limitations for tools/calculators.
- Specific examples instead of generic filler.
- Primary-source citations for factual or changing claims.
- Clear author/organization identity where trust matters.
- Publication/updated dates when freshness matters.
- Useful original assets: calculators, interactive tools, datasets, charts, screenshots, examples.

Do not create artificial "AI keywords" or multiple near-duplicate pages for query variants.

### AI-specific files and crawler controls

- Do not require special AI-only markup for Google Search. Google states that no special machine-readable AI text file or markup is required for visibility in its generative-AI Search features.
- `llms.txt` may be generated as optional interoperability metadata for non-Google systems, but it is not a Google Search requirement.
- AI crawler controls must distinguish search visibility from model-training/product permission.
- `Google-Extended` is a standalone control for certain Gemini/Vertex AI training and grounding uses; Google documents that it does not affect Search inclusion or ranking.
- Document any decision to block/allow training crawlers separately from the site's Search robots policy.

### Measurement

When available, measure AI-search performance using first-party Search Console reporting rather than invented "AI visibility scores." Record the date range and report/filter used. For sites with meaningful image-driven discovery, include Search Console multimodal search reporting (Lens/image-input surfaces) in L3 review.

## 7. International SEO / hreflang gate

For multilingual or multi-region sites:

- Choose deliberate language/region codes, e.g. `es`, `es-MX`, `pt`, `pt-BR` as appropriate to the actual content/audience.
- Do not translate an approved keyword mechanically when the target-market keyword has not been validated.
- Every hreflang set must use canonical, indexable equivalents.
- Include self-reference and reciprocal return relationships.
- Use `x-default` only when a meaningful fallback/selector exists.
- Keep protocol, hostname, path, and trailing-slash forms consistent with canonical URLs.
- Do not place hreflang relationships on URLs that canonicalize elsewhere.
- For large multilingual sites, sitemap-based hreflang is acceptable if generated and tested consistently.
- Localize examples, terminology, units, currency, legal/contextual copy, and search intent where relevant; translation alone is not sufficient localization.

## 8. Structured data gate

- Structured data must describe visible, truthful page content.
- Prefer JSON-LD unless a project constraint justifies another format.
- Use stable `@id` entities for Organization/Person/WebSite relationships when useful.
- Validate generated schema and prevent template placeholders from shipping.
- Do not add schema solely because a type exists in Schema.org; confirm current Google eligibility before promising a rich result.
- FAQ content may still be useful to users, but do not promise Google FAQ rich results based on legacy guidance.
- Structured data must not be used as a generic GEO hack. Add only types that describe the visible page and are useful for machine understanding or supported search features.
- Do not recommend deprecated rich-result tactics as current SEO strategy.

## 9. Content quality / trust gate

- No placeholder copy.
- No fabricated statistics, citations, testimonials, reviews, credentials, usage numbers, "AI visibility" scores, or synthetic authority claims.
- AI-assisted content must add meaningful original value; mass generation or summarization without added value fails this gate.
- Claims that can change should carry a source and date when useful.
- Tool pages must explain inputs, outputs, assumptions, edge cases, and examples where relevant.
- Avoid generic intros written only to lengthen the page.
- Avoid repeated paragraphs across a programmatic set.
- Distinguish factual content from opinion or internal recommendation.
- For YMYL or regulated topics, require stronger sourcing and do not auto-publish unsupported claims.

## 10. Image and media SEO gate

- Images must load, be relevant, and not be decorative logos used as filler.
- Use width/height or aspect-ratio reservation to reduce layout shift.
- Use responsive images where needed (`srcset`/`sizes` or framework equivalent).
- Prefer efficient modern formats where supported.
- Lazy-load offscreen media, not the critical hero/LCP asset when that harms LCP.
- Alt text should describe meaningful image purpose; decorative images should not receive keyword-stuffed alt text.
- Ensure social/OG images exist when the page is designed to be shared.
- Important visual pages should keep captions/context close enough that image meaning is understandable to users and multimodal search systems.
- For original charts/screenshots/diagrams, preserve enough nearby text to explain what the visual proves or demonstrates.

## 11. Internal linking and crawl architecture

- Every important page must be reachable from at least one crawlable indexable path.
- Hub pages should expose important child pages without relying only on site search or JavaScript filters.
- Related links should be semantically relevant, not generated randomly.
- Breadcrumbs should reflect the actual information architecture.
- Avoid orphan pages, endless faceted URL combinations, and parameter explosions.
- Anchor text should describe destination intent naturally; do not force exact-match repetition.

## 12. Sitemap / index management

- Sitemap contains only canonical, indexable URLs intended for search.
- Do not include redirects, 404s, noindexed pages, or canonicalized-away duplicates.
- `<lastmod>` should reflect meaningful page/data changes when emitted.
- Split sitemaps at protocol limits and use a sitemap index when required.
- Register/verify sitemap in search-engine tools when available.
- For large generated sets, compare submitted, discovered, crawled, and indexed counts before expanding further.

## 13. Audit levels

### L1 — Change / commit audit

Run after SEO-sensitive changes. Fast, deterministic checks. Record the actual command/result/evidence rather than checking boxes from memory:

- build/type/lint as applicable
- important route status/404s
- title/H1/canonical/robots
- raw-HTML presence of critical SEO elements
- sitemap/route coverage
- internal links and broken assets
- schema syntax/validation
- hreflang syntax/relationship checks when affected

### L2 — Release audit

Run before production launch or a major release:

- full L1
- technical crawl
- mobile/responsive review
- CWV/lab performance
- content and programmatic-template quality sample
- schema eligibility
- GEO extractability/citability review
- international/hreflang parity
- image/media review
- final visual QA

### L3 — Full / periodic audit

Run after sufficient production data exists or on major periodic reviews:

- Search Console queries/indexing
- Search Console generative-AI features reporting when available
- Search Console multimodal/image-input reporting when relevant
- CrUX field data when available
- analytics/landing-page performance when connected
- content gaps/cannibalization
- backlinks/brand mentions when a reliable source exists
- AI-search visibility when measurable
- competitor SERP changes
- drift/regression comparison to the previous accepted baseline

Do not run an expensive full multi-agent audit after every trivial commit.

## 14. SEO drift baseline

After a production release is accepted, record or preserve a baseline for important routes:

- title/meta
- H1 and primary headings
- canonical
- robots/noindex
- hreflang
- structured data
- main content fingerprint/word count where useful
- internal-link count/critical links
- sitemap membership
- status code/redirect target
- CWV/PSI snapshot when available

Future audits should flag regressions, not just produce a fresh standalone score.

## 15. Scoring rules

- Scores are secondary to evidence and must never hide unmeasured categories.
- Never assign numeric scores to data that was not actually measured.
- Deterministic calculations (counts, overlap, status codes, weighted arithmetic, duplicate ratios) should be performed in code/tools, not guessed by the language model.
- Any composite SEO score is an internal prioritization device, not a Google score and not a ranking prediction.

## 16. Required finding format

For every Critical/High finding, report:

1. Observation/evidence.
2. Why it matters.
3. Exact affected URLs/templates/components.
4. Dependency or prerequisite.
5. Recommended fix.
6. Verification test: how we know the fix worked.
7. Leading indicator to monitor after release.

Priority meanings:

- Critical: blocks indexing/core task, creates severe policy/security/search failure, or breaks a primary route.
- High: materially harms discoverability, intent satisfaction, template quality, or important performance.
- Medium: meaningful optimization with limited immediate risk.
- Low: cleanup/nice-to-have.

## 17. Launch acceptance

A site is not SEO/GEO complete until all applicable items below are verified:

- Approved keywords preserved.
- Intent-to-page map complete.
- Planned important pages exist.
- No primary-route 404s or broken assets.
- Critical content is crawlable and visible in raw HTML where required.
- Metadata, headings, canonicals, robots, and sitemap are correct.
- Structured data is truthful and valid where used.
- Programmatic pages pass uniqueness/value sampling.
- Multilingual equivalents pass canonical/hreflang parity.
- Internal-link architecture has no important orphan pages.
- Mobile layouts and core tool flows work.
- Images/fonts are optimized enough not to create obvious performance regressions.
- Production deployment is verified, not only local build.
- A post-launch baseline exists for future drift checks.

## 18. Reference model

This standard incorporates useful engineering patterns from the open-source `AgriciDaniel/claude-seo` project, but does not require that plugin at runtime and does not copy its promotional/runtime assumptions. Upstream heuristics are treated as heuristics unless supported by primary documentation.

Primary references to consult when rules are time-sensitive:

- Google Search Central: https://developers.google.com/search/
- Google Search generative-AI optimization guide: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google guidance for generative-AI content: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- Google Search spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google localized versions/hreflang: https://developers.google.com/search/docs/specialty/international/localized-versions
- Schema.org: https://schema.org/
- web.dev Core Web Vitals: https://web.dev/vitals/
- Google crawler controls / Google-Extended: https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
- IndexNow: https://www.indexnow.org/
- Upstream inspiration: https://github.com/AgriciDaniel/claude-seo
