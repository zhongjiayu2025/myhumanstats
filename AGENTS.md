# MyHumanStats project scope

This is an existing English-language 35-test static website. Preserve all approved keywords, indexed routes, free architecture and no-backend operation. Apply the Website-Starter-Standard below to any additional updates. See SEO-GEO-PROJECT-BRIEF.md for actual project-specific decisions and evidence status.

# Website Project Agent Rules

These rules are mandatory for every website created from this starter.

## 1. Required build order

Do not start page-level UI implementation until the following are complete:

1. User intent, site goal, monetization model, and cost constraints understood.
2. Keyword research reviewed and explicitly approved keywords locked.
3. Search intent mapped to canonical destinations; no unresolved cannibalization plan.
4. Competitor/reference analysis completed.
5. Full project PRD and information architecture completed.
6. Project-specific `DESIGN.md` completed.
7. `SEO-GEO-PROJECT-BRIEF.md` completed with keyword/intent ownership, indexation, sources, entities, schema, and international rules.
8. Applicable SEO/GEO, programmatic SEO, and international architecture from `SEO-GEO-QUALITY-GATE.md` defined.
9. Design tokens and reusable base components defined.

Then implement the complete planned site, responsive behavior, SEO/GEO, QA, deployment, and production verification.

## 2. DESIGN.md is mandatory

Every project MUST have a project-specific `DESIGN.md` before UI development begins.

The design system must be derived from product context, target users, search intent, brand positioning, and 2–4 high-quality references. `VoltAgent/awesome-design-md` is a required reference source during design research when applicable, but no site may directly clone a single brand's visual identity.

The design system must define at minimum: visual theme, semantic colors, typography, spacing, grid/layout, radii, core components and states, elevation, responsive behavior, media/icon rules, motion, accessibility, design guardrails, and AI implementation notes.

## 3. Design-system enforcement

- All pages and components must follow `DESIGN.md`.
- Do not introduce arbitrary colors, radii, spacing, shadows, gradients, glow, blur, glassmorphism, or typography.
- Reuse existing tokens/components first.
- If the visual language must change, update `DESIGN.md` first, then implementation.
- Marketing, tool, content, and utility pages may differ in density but must share one recognizable system.
- Avoid generic AI-SaaS aesthetics unless the product genuinely requires them.

## 4. SEO / GEO quality gate is mandatory

Read and apply `SEO-GEO-QUALITY-GATE.md` before changing routes, templates, metadata, structured data, multilingual architecture, programmatic pages, or indexation behavior.

- Preserve explicitly approved core keywords. Do not silently replace, merge, translate, or rewrite them.
- Never fabricate keyword metrics, SERP data, traffic, backlinks, citations, or indexation status.
- Map one primary intent to one canonical destination.
- Maintain crawlable initial content, heading hierarchy, canonical URLs, robots directives, sitemap coverage, internal linking, valid structured data, and real 404 behavior.
- Programmatic pages must provide standalone value and meaningful differentiation; do not mass-publish name/keyword swaps.
- Multilingual sites must pass canonical/hreflang and localization checks.
- GEO work must improve extractability, evidence, clarity, originality, and usefulness; it must not create near-duplicate "AI keyword" pages.
- Do not add AI-only files/markup solely because a GEO checklist says so. Google states that its generative-AI Search features use normal Search foundations and do not require special AI markup.
- `Google-Extended` is a model-training/product control, not a Google Search indexing/ranking control. Do not confuse crawler/training permissions with search visibility.
- Treat third-party thresholds as internal heuristics, not search-engine rules.

## 5. Audit levels

- L1 change/commit audit after SEO-sensitive changes.
- L2 release audit before production launch/major release, with evidence recorded in `SEO-GEO-RELEASE-EVIDENCE.md`.
- L3 periodic full audit only when production data or a major review justifies it.

Do not spend full-audit model/API cost on every trivial commit. Prefer deterministic checks for status codes, counts, duplicate ratios, schema syntax, arithmetic, and route coverage.

## 6. Performance and accessibility

- Mobile-first behavior must be validated, not assumed.
- Avoid unnecessary dependencies and heavy client-side JavaScript.
- Prefer SSG/SSR for public SEO content; do not let CSR hide the only copy of indexable content.
- Optimize images and fonts.
- Preserve keyboard navigation, visible focus, semantic HTML, usable touch targets, readable contrast, and reduced-motion behavior.

## 7. Cost discipline

Unless meaningful traffic or revenue is already validated, prefer zero/freemium infrastructure:

- Static or edge hosting where practical.
- Free-tier databases/services where practical.
- No paid SEO API, crawler, fixed monthly server, or other recurring cost without explicit approval.

## 8. Visual QA is mandatory

A website is not complete until Visual QA checks hero/first-screen hierarchy, tool clarity, desktop/tablet/mobile layouts, typography/spacing/components, CTA hierarchy, contrast, imagery, generic-template smell, unnecessary effects, real user-task efficiency, and SEO content readability.

## 9. Final project QA

Before calling the site complete, verify:

- No broken primary navigation or route 404s.
- Main tools work end-to-end.
- All planned important pages exist.
- Responsive layouts work at representative widths.
- `SEO-GEO-QUALITY-GATE.md` launch acceptance passes.
- Internal links and images/assets work.
- No obvious console/build/runtime errors.
- Production build succeeds.
- Cloudflare deployment settings are documented when used.
- Production URL is checked after deployment.
- The final site still follows `DESIGN.md`.
- A post-launch SEO baseline is recorded for important routes.

## 10. Complete-scope rule

Do not use a thin "V1 now, required pages/features later" approach as a substitute for the agreed complete build. Staged implementation is acceptable internally, but all agreed required scope and acceptance gates must be completed before declaring the project finished.

## 11. Default new-site rule

When starting a new website for this owner, treat this repository as the canonical website baseline. Do not wait for reminders about approved keywords, `DESIGN.md`, `awesome-design-md`, `SEO-GEO-QUALITY-GATE.md`, programmatic SEO, international SEO, Cloudflare, mobile QA, cost discipline, complete-scope delivery, or final visual/production QA. Apply them automatically unless explicitly overridden for that project.
