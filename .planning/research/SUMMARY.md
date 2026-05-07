# Project Research Summary

**Project:** 频安AI智能商学院 — v1.1 像素级视觉合规复刻
**Domain:** Pixel-perfect CSS compliance retrofit — React landing vs minified Tailwind baseline (`7be7097^`)
**Researched:** 2026-04-20
**Confidence:** HIGH

## Executive Summary

v1.0 completed structural React reconstruction of all 5 landing pages. v1.1 is a CSS parity sprint: every visual discrepancy between the React landing and the `7be7097^` baseline has been directly traced to source code. The differences concentrate in three areas: (1) the CSS variable system uses opposite polarity (light-first vs dark-first) with incorrect color values and a smaller token set; (2) the font stack imports `Noto Sans SC` instead of `Inter` as the body font; and (3) all decorative animations (float, pulse-glow, marquee) are absent. None require new frameworks — the fix is CSS authoring work plus two npm packages (`@fontsource/inter`, `@fontsource/montserrat`).

The recommended approach is a strictly ordered, layered CSS rewrite of `landing.css`: fonts first (stabilize layout reflow before measurement), token system second (dark-first `:root`, 15 tokens, `[data-theme=light]` overrides), utility classes and keyframes third, spacing/radius audit fourth, per-page visual QA last. Visual regression testing uses Playwright's built-in `toHaveScreenshot()`.

## Key Findings

### Recommended Stack

Only two additions needed: `@fontsource/inter` and `@fontsource/montserrat` — self-hosting pins exact font binaries and eliminates CDN metric variability. Everything else is CSS authoring in the existing `landing.css`. Do not add: Tailwind, Framer Motion, GSAP, BackstopJS, Percy, styled-components.

### Expected Features

**Must have (table stakes):**
- Dark-first color system: `:root` = dark values; `[data-theme=light]` = overrides (current is inverted)
- Complete 15-token variable set in both themes
- Brand green correction: dark `#7a9e7a`, light `#34C759` (current `#4d8e5a` is wrong)
- Inter body font / remove Noto Sans SC
- `.glass-effect`, `.text-gradient`, `.shadow-glow` utility classes
- 8 keyframe animations: float variants, pulse-glow, marquee

**Should have:**
- 10 missing images registered in `assets.ts`
- `--radius` token: dark `0.625rem` / light `1rem`
- `scroll-behavior: smooth`, `-webkit-font-smoothing: antialiased`

### Architecture Approach

Single-file CSS (`landing.css`) with 6-layer internal organization: font imports → dark-first `:root` tokens → `[data-theme=light]` overrides → utility classes → `@keyframes` → `.landing-*` BEM component classes → media queries. `LandingThemeContext.tsx` needs one-line default inversion. An `index.html` synchronous script prevents first-paint flash.

### Critical Pitfalls

1. **Theme polarity flash** — synchronous `<script>` in `index.html` required before React loads
2. **Font swap layout cascades** — Noto→Inter causes global reflow; do fonts before any per-pixel measurement
3. **CSS variable scope collision** — `index.css` (academy) `body {}` rules leak into landing without `.landing-app` scoping
4. **`backdrop-filter` stacking context** — ancestors with transform/will-change clip glass effects; needs `-webkit-` prefix for Safari
5. **Spacing off-by-4px** — extract exact Tailwind pixel values from baseline CSS, don't eyeball

## Implications for Roadmap

### Suggested 6 Phases (continuing from v1.0 Phase 5):

1. **Phase 6: CSS Variable Audit & Scope Isolation** — Neutralize collision risk before authoring
2. **Phase 7: Font System Replacement** — Install @fontsource, remove Noto; must precede per-pixel measurement
3. **Phase 8: Color Token System (Dark-First)** — Invert `:root`/light structure; gates all effect work
4. **Phase 9: Utility Classes & Keyframe Animations** — glass-effect, text-gradient, shadow-glow + 8 @keyframes
5. **Phase 10: Asset Registry & Spacing Token Audit** — 10 missing images + spacing/radius alignment
6. **Phase 11: Visual Regression Test Suite** — Playwright toHaveScreenshot() goldens from baseline

### Phase Ordering Rationale

- Audit before authoring (collision is silent)
- Fonts before pixels (Noto→Inter reflow invalidates measurements)
- Tokens before utilities (glass-effect references `--glass-bg`)
- Assets/spacing are independent of animation work

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Direct project inspection + @fontsource docs |
| Features | HIGH | Line-by-line comparison of baseline vs React CSS |
| Architecture | HIGH | Source read; one gap: exact keyframe midpoint values |
| Pitfalls | HIGH | All from direct code inspection |

**Overall:** HIGH

## Sources

### Primary
- Baseline CSS: `index-DuxCbJQB.css` — tokens, keyframes, utilities, font imports
- Baseline JS: `index-BqLXAaHJ.js` — ThemeContext mechanism
- React source: `landing/landing.css`, `LandingThemeContext.tsx`, `LandingShell.tsx`, `assets.ts`

---
*Research completed: 2026-04-20*
*Ready for roadmap: yes*
