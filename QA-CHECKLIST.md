# MyHumanStats release checklist

- [ ] Pull request diff inspected; existing URL slugs unchanged
- [ ] TypeScript check passed in GitHub Actions
- [ ] Next static export passed; required `out/` pages exist
- [ ] Homepage, 35 tests, 6 tools, 4 category hubs, blog and help pages return expected production status
- [ ] No broken internal links, image URLs or javascript exceptions on top GSC landing pages
- [ ] Canonical/robots/sitemap agree; noindex pages absent from XML sitemap
- [ ] Blog lacks old hash-router links and content placeholders
- [ ] Rhythm: calibration includes final tap; audio/keyboard/touch input tested
- [ ] Contrast, Color Hue, Perfect Pitch, Peripheral Vision and Number Memory operate end to end
- [ ] Browser audio/microphone errors and permission denial explained clearly
- [ ] Hearing, vision, ADHD and anxiety results do not imply a clinical diagnosis
- [ ] Unsupported statistics do not claim verified aggregate user data
- [ ] Local-only user score storage/import/export checked
- [ ] Mobile 360/390/768 widths checked with real interaction
- [ ] Accessibility: headings, focus, keyboard and reduced-motion checked
- [ ] Core Web Vitals measured on actual deployment; no assumed pass
- [ ] Cloudflare production build version checked and important URLs smoke tested
- [ ] Record 28-day and 90-day GSC comparison after release
