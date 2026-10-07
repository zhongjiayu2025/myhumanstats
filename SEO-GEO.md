# SEO / GEO Standard

`SEO-GEO-QUALITY-GATE.md` is the mandatory detailed execution standard. This file is the concise policy summary.

## Non-negotiable rules

- Approved core keywords are immutable unless explicitly changed by the project owner.
- Never invent Volume, KD, CPC, SERP, traffic, backlink, or AI-visibility data.
- One primary search intent should map to one canonical destination.
- Avoid cannibalization, doorway pages, near-duplicate pages, keyword stuffing, and mass publishing without unique user value.
- Treat heuristics as heuristics; do not present them as Google requirements.
- Prefer primary-source documentation for changing SEO rules.

## Required page fundamentals

- Unique intent-aligned title/meta.
- Clear H1 and logical heading hierarchy.
- Correct canonical and robots directives.
- Crawlable primary content and internal links.
- Useful answer/utility early in the page.
- Structured data only where truthful and currently applicable.
- Valid sitemap coverage for canonical indexable routes.
- Working images/assets and correct 404/redirect behavior.

## GEO / AI-search readiness

Google's generative-AI Search features still depend on core Search ranking and quality systems. Do not build a parallel "AI SEO" layer that weakens normal SEO.

- Direct definitions/answers where appropriate.
- Self-contained factual passages.
- Question headings when they match user intent.
- Tables/examples for comparisons and procedures.
- Explicit units, assumptions, formulas and limitations for tools.
- Primary-source attribution for factual/changing claims.
- Clear entity identity for the site/organization/author when it materially helps trust or disambiguation.
- Distinguish original analysis/data/tool output from third-party facts.
- Do not create separate near-duplicate "AI keyword" pages.
- Do not invent special AI-only schema or markup.
- `llms.txt` is optional interoperability metadata; Google does not require it for Search or generative-AI Search features.
- `Google-Extended` controls certain Google model-training/product uses and does not control Google Search inclusion or ranking.

## Programmatic SEO

Generated pages must provide distinct standalone value, not merely swap a name/keyword. Use the review thresholds and batch-expansion gates in `SEO-GEO-QUALITY-GATE.md`.

## International SEO

Multilingual sites must validate canonical/hreflang parity, self-reference, return links, language/region codes, and real localization. Do not mechanically translate approved keywords without market validation.

## Audit cadence

- L1: change/commit audit.
- L2: pre-release audit.
- L3: production/periodic full audit with real search/performance data where available.

See `SEO-GEO-QUALITY-GATE.md` for the exact checks, acceptance criteria, drift baseline, scoring rules, and evidence format.
