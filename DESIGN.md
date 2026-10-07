# MyHumanStats design system

Product: privacy-first, free browser-based human ability tests. Primary task: arrive from search and start the specific test immediately. The design should be technical and trustworthy, not clinical.

## Visual direction
- Preserve the established near-black canvas (#050505), cool-cyan focus/brand accents, restrained neutral surfaces, and mono readouts.
- Preserve Inter for content and JetBrains Mono for data labels. Dense dashboard elements are secondary to test interaction.
- Reuse existing Tailwind tokens and `bg-surface`, `text-primary-400`, `border-zinc-800` rather than introducing unrelated colors.
- No unnecessary additional blur, glow, animation or generic AI-SaaS hero treatment.
- Test pages: compact explanation and large primary interactive module above long-form educational text; result appears in the same context.
- Landing page: existing dashboard for returning users; first-time visitors should be able to locate top tests quickly without mandatory account setup.
- Icons: keep Lucide icon family; avoid third-party imagery unless it explains an exercise.

## Responsive and accessibility
- Support 360, 390, 768, 1024 and 1440 px viewport layouts.
- Ensure keyboard and touch equivalence where possible, with touch controls at least 44×44 CSS px when practical.
- Reduced motion setting must disable non-essential animations; do not depend on animation alone for success/error.
- Explain permission denial for microphone and audio; never auto-play unexpected loud tones.
- Use clear non-medical statements before and after hearing, vision and attention exercises.
- Do not claim clinical precision or fabricated global percentiles.

## Reference and implementation rules
Study interaction affordances from Human Benchmark, ToneDear and X-Rite, but do not imitate their brand identity. Apply the owner's Website-Starter-Standard and awesome-design-md reference principles to new UI changes.

No redesign that changes an already ranked route or degrades tool-first interaction without comparative QA evidence.
