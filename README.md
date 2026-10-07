# MyHumanStats

MyHumanStats is a browser-based collection of 35 interactive auditory, visual, cognitive and personality/attention exercises, plus six utility tools. The public site is https://myhumanstats.org/.

## Stack and local development

- Next.js 16 App Router (static export with `output: 'export'`)
- React, TypeScript, Tailwind CSS and Recharts
- Browser APIs for tests; LocalStorage for private per-device test history
- No server database or Gemini API is used by the current app

```bash
npm install
npm run dev
npx tsc --noEmit
npm run build
```

The static build is written to `out/`. Do not enable dynamic API handlers in static-export mode. Deploy `out/` using the existing static hosting workflow.

## Product safety and content integrity

- Browser-based hearing and vision activities are **not clinical exams**.
- The attention/impulse-control exercise is **not a validated ADHD screener**.
- Reference tables are illustrative, not verified samples of site visitors or population norms. They are `noindex` pending source review.
- Never invent scientific norms, sample sizes, percentiles, user data, citations or publication dates.
- Preserve indexed core tool slugs and approved primary keywords.

## Release process

Use `AGENTS.md`, `DESIGN.md`, `SEO-GEO-QUALITY-GATE.md`, `SEO-GEO-PROJECT-BRIEF.md`, `SEO-GEO.md`, `SEO-GEO-RELEASE-EVIDENCE.md`, and `QA-CHECKLIST.md`, based on the owner's Website-Starter-Standard. Never claim passing real-device, production or GSC checks merely because a static build succeeds. Check Actions for a successful type check, static build, route smoke test, then inspect a production deployment before marking a release complete.


## SEO/GEO verification
The keyword-to-canonical map and evidence sources are in `SEO-GEO-PROJECT-BRIEF.md`. Run `node scripts/audit-seo-export.mjs` and `node scripts/capture-seo-baseline.mjs` after the static build. Each CI run uploads an HTML/metadata drift baseline (30-day artifact). Compare the actual production deployment and settled first-party GSC windows before declaring growth.
