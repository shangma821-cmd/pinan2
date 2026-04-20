# Feature Research

**Domain:** Pixel-perfect CSS visual compliance — React landing vs baseline (`7be7097^`)
**Researched:** 2026-04-20
**Confidence:** HIGH (sourced directly from baseline CSS/JS artifacts and React source)

> This file supersedes the v1.0 structural-restoration FEATURES.md. v1.1 scope is purely visual compliance — structure and interactions are already complete.

---

## Feature Landscape

### Table Stakes (Must Ship — Missing = Compliance Fails)

These are non-negotiable for v1.1. Each maps directly to a measurable, testable baseline discrepancy confirmed by direct inspection of `index-DuxCbJQB.css` and `index-BqLXAaHJ.js`.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Color system: dark-first default theme** | Baseline `:root` sets dark background (`--bg-primary: #050a05`); the light palette lives in `[data-theme=light]`. React `:root` is light-first (`#f4f7f1`). Every page renders inverted polarity on cold load. | LOW | Note: baseline JS also initializes ThemeContext to `"light"` (`useState("light")`), then overrides from `localStorage`. The fix is: align React `:root` as the dark base + `[data-theme=light]` as the override, to match baseline CSS structure. |
| **Color system: brand green token correction** | Baseline dark `--brand-green: #7a9e7a`; light `--brand-green: #34C759`. React uses a single `#4d8e5a` in both modes — wrong hue (too yellow-green) and wrong lightness in both. | LOW | Affects every button, active nav link, stat value, inline link, kicker, price. Token change cascades everywhere. |
| **Color system: complete 15-token variable set** | Baseline defines these semantic tokens missing from React's current 8-token set: `--bg-primary`, `--bg-secondary`, `--bg-card`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border-color`, `--glow-color`, `--glass-bg` in both themes. | MEDIUM | Dark defaults: `--bg-primary:#050a05`, `--text-primary:#ffffff`, `--glass-bg:rgba(0,0,0,.3)`, `--glow-color:rgba(122,158,122,.3)`. Light overrides: `--bg-primary:#F5F7FA`, `--text-primary:#1D1D1F`, `--glass-bg:rgba(255,255,255,.72)`, `--glow-color:rgba(52,199,89,.15)`. |
| **Typography: remove Noto Sans SC, use Inter body** | Baseline `@import` is `Inter` + `Montserrat` only. `body { font-family: Inter, sans-serif }`. React currently imports and applies `Noto Sans SC` as the body font — all body text renders with wrong letterforms and weight rendering. | LOW | React already imports Montserrat correctly. Change: remove `Noto Sans SC` from import URL; replace it in `font-family` stacks on `.landing-app`, `.landing-brand-title`, `.landing-section-title`, `.landing-page-title`, `.landing-display`, etc. |
| **Animation: float-slow / float-medium / float-fast / float-slow-reverse keyframes** | Baseline uses 4 multi-stop translate+scale floating variants for decorative orbs and background elements. React has zero keyframes — all animated elements are static. | LOW | Exact keyframes from baseline (e.g. `float-slow`: `0%,to{transform:translate(0) scale(1)} 25%{translate(30px,-20px) scale(1.05)} 50%{translate(-10px,30px) scale(.95)} 75%{translate(-20px,-10px) scale(1.02)}`). Classes: `.animate-float-slow` (15s), `.animate-float-medium` (12s), `.animate-float-fast` (8s), `.animate-float-slow-reverse` (18s). Must also apply class names to the correct JSX elements — not just add the keyframes to CSS. |
| **Animation: pulse-glow keyframe** | Baseline uses `pulse-glow` for background glow orbs creating a "breathing light" effect. React has none. | LOW | Keyframe: `0%,to{opacity:.5; transform:translate(-50%,-50%) scale(1)} 50%{opacity:.8; transform:translate(-50%,-50%) scale(1.1)}`. Used at two durations: 3s (tight version) and 6s (slow version). Class: `.animate-pulse-glow`. |
| **Animation: marquee keyframe** | Baseline uses `marquee` for horizontally scrolling credential/logo strips (30s linear infinite). React has no marquee. | LOW | Keyframe: `0%{transform:translate(0)} to{transform:translate(-50%)}`. Class: `.animate-marquee`. The 30s duration is specified in `.animate-marquee`. |
| **Effect: `.glass-effect` utility class** | Baseline `glass-effect` is applied to nav, cards, overlays — the defining visual texture of the dark UI. React hardcodes `backdrop-filter` per-element with no shared token. Values differ per theme. | LOW | Dark: `backdrop-filter:blur(20px) saturate(180%); background:var(--glass-bg); border:1px solid rgba(122,158,122,.2)`. Light: `background:#ffffffb8; border:1px solid rgba(0,0,0,.08); box-shadow:0 4px 24px #0000000a,0 1px 2px #00000005,inset 0 0 0 1px #ffffff80`. |
| **Effect: `.text-gradient` utility class** | Baseline applies `text-gradient` to hero display text and section headers — CSS gradient clip creates the multi-tone green gradient effect. React renders all headings as flat `var(--landing-brand-green)`. | LOW | Dark: `background-image:linear-gradient(135deg,var(--brand-green) 0%,var(--brand-accent) 50%,var(--brand-green) 100%); background-size:200%; -webkit-background-clip:text; color:transparent`. Light override: `background-image:linear-gradient(135deg,#34c759,#30b350,#248a3d)`. |
| **Effect: `.shadow-glow` utility class** | Baseline uses `shadow-glow` with `--glow-color` token for CTAs and featured cards. React uses hardcoded shadow values that don't adapt to theme. | LOW | Dark: `box-shadow:0 0 20px var(--glow-color)` (resolves to `rgba(122,158,122,.3)`). Light: `box-shadow:0 8px 32px rgba(52,199,89,.12),0 2px 8px rgba(52,199,89,.08)`. |

### Differentiators (High-value Parity Items, Not Blocking)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Asset registry: 10 unregistered images** | `how-it-works.jpg`, `market-pain.jpg`, `news-1.jpg`, `news-2.jpg`, `solution-pain.jpg`, `solution-rehab.jpg`, `solution-wellness.jpg`, `store-front.jpg`, `user-journey.jpg`, `why-choose.jpg` exist in `public/entry-station/` but are absent from `assets.ts`. Sections using them show blank placeholder backgrounds instead of real photos. | LOW | Files are already in `public/`. Work is mechanical: add `import` entries to `assets.ts` and wire the export keys into the relevant JSX props. No new photography needed. |
| **`--radius` token system (theme-responsive corners)** | Baseline: dark `--radius:.625rem` (10px), light `--radius:1rem` (16px). React uses fixed `24px`/`36px` tokens that produce identical corners in both modes. Subtle but noticeable on card grids. | MEDIUM | Requires audit of all `landing-radius-*` usages to determine whether they should derive from `--radius` or remain as separate tokens with different values per theme. |
| **`scroll-behavior: smooth` on `html`** | Baseline sets `html { scroll-behavior: smooth }`. React does not. Back-to-top and anchor links feel abrupt. | LOW | Single line. |
| **`-webkit-font-smoothing: antialiased`** | Baseline sets this on body via Tailwind's base layer. Improves rendering sharpness on macOS. | LOW | Include in the body ruleset update alongside the Inter font switch. |

### Anti-Features (Do Not Build)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Tailwind CSS integration** | Baseline was built with Tailwind, so importing Tailwind seems "correct" | Adds a second CSS framework (105KB output), creates cascade conflicts with `landing.css`, requires purge config — defeats maintainability goal | Hand-write the 5 utility classes (`glass-effect`, `text-gradient`, `shadow-glow`, `animate-*`) directly in `landing.css`. Total is ~50 lines. |
| **Import `index-DuxCbJQB.css` directly** | "Just link the baseline CSS file" would be fastest | 3000+ Tailwind utility classes in the global cascade break React component styles; not maintainable source code | Implement only the semantic token layer and custom classes |
| **Scroll-triggered animation choreography** | "Animate on scroll" for section entrances looks polished | Baseline v14 does NOT use IntersectionObserver-triggered animations — orbs float continuously, they don't trigger on scroll. Adding this diverges from baseline. | Keep CSS-only `animation` on continuously animated elements; do not add scroll-reactive JS |
| **New component architecture for animations** | "Let's create an AnimatedOrb component" | Scope creep, changes structure that is already validated as passing tests | Add `animate-*` classNames to existing JSX element props only |

---

## Feature Dependencies

```
[Color token system (dark-first :root + all 15 tokens)]
    └──required-by──> [.glass-effect]      (references --glass-bg)
    └──required-by──> [.shadow-glow]       (references --glow-color)
    └──required-by──> [.text-gradient]     (references --brand-green, --brand-accent)
    └──required-by──> [brand green fix]    (--brand-green must be #7a9e7a / #34C759)
    └──co-located──>  [--radius tokens]    (live in same :root / [data-theme=light] block)

[Font system (Inter body, remove Noto Sans SC)]
    └──independent──> no token or animation dependencies

[Keyframe animations (float-*, pulse-glow, marquee)]
    └──independent──> no CSS token dependencies
    └──requires-pairing──> [JSX class application] (keyframes alone do nothing)

[Asset registry (10 images)]
    └──independent──> image files already in public/entry-station/
    └──requires-pairing──> [Component prop wiring] (assets.ts key must be used in JSX)
```

### Dependency Notes

- **Color tokens must precede all effect utilities:** `glass-effect`, `shadow-glow`, and `text-gradient` reference `--glass-bg`, `--glow-color`, `--brand-green`. Writing the utilities before the tokens produces broken `rgba(0,0,0,0)` backgrounds and invisible glow.
- **Font change is safe as standalone:** Changing the Google Fonts import URL and updating `font-family` stacks has no risk of breaking color or animation work. Can be done in parallel.
- **Keyframe additions are purely additive:** Adding `@keyframes` blocks to `landing.css` cannot break existing layout. The risk point is the second step — applying `animate-*` class names to JSX — which requires identifying the correct orb/decorative elements per section.
- **Asset registry is mechanical and independent:** Adding to `assets.ts` is a pure addition. Zero regression risk.

---

## MVP Definition

### Launch With (v1.1 compliance — all required for visual acceptance)

- [ ] **Color token system** — dark-first `:root` with all 15 baseline tokens; `[data-theme=light]` overrides. *Blocks all effects work.*
- [ ] **Brand green correction** — `#7a9e7a` (dark) / `#34C759` (light) replacing `#4d8e5a`. *Visible on every interactive element.*
- [ ] **Inter font / remove Noto Sans SC** — update import URL, update all `font-family` stacks. *Visible on all body text.*
- [ ] **`.glass-effect` utility** — backdrop-filter + theme-responsive background from `--glass-bg`. *Nav, card overlays.*
- [ ] **`.text-gradient` utility** — gradient-clip on headings. *Hero and section headers.*
- [ ] **`.shadow-glow` utility** — `--glow-color` shadow on CTAs/featured cards.
- [ ] **Float keyframes** — all 4 variants + `animate-float-*` classes applied to orb elements.
- [ ] **Pulse-glow keyframe** — `animate-pulse-glow` applied to decorative glow orbs.
- [ ] **Marquee keyframe** — `animate-marquee` applied to credential strip.

### Add After Core (v1.1 completion verification)

- [ ] **Asset registry** — wire 10 unregistered images into their sections after color/animation parity is confirmed.
- [ ] **`--radius` token** — theme-responsive corner radius after token system is stable.
- [ ] **`scroll-behavior: smooth`** — single-line `html` addition.
- [ ] **`-webkit-font-smoothing: antialiased`** — body ruleset addition alongside Inter switch.

### Future Consideration (v2+)

- [ ] **Scroll-triggered section entrance animations** — not present in baseline v14; out of scope for compliance.
- [ ] **Per-section orb pixel positioning** — matching exact `top`/`left` offset of decorative elements; QA-level detail.

---

## Feature Prioritization Matrix

| Feature | User Value (Visible Impact) | Implementation Cost | Priority |
|---------|------------------------------|---------------------|----------|
| Color token system (dark-first + 15 tokens) | HIGH — every element on every page | LOW — CSS variable block rewrite | P1 |
| Brand green `#7a9e7a` / `#34C759` | HIGH — all CTAs, links, active states | LOW — token change, cascades everywhere | P1 |
| Inter font / remove Noto Sans SC | HIGH — all body text rendering | LOW — import URL + 6 font-family stacks | P1 |
| `.glass-effect` | HIGH — nav and card backgrounds wrong texture | LOW — 8 CSS lines | P1 |
| `.text-gradient` | HIGH — hero headings flat vs gradient | LOW — 5 CSS lines | P1 |
| `.shadow-glow` | MEDIUM — CTAs/featured cards | LOW — 4 CSS lines | P1 |
| Float keyframes (all 4) | MEDIUM — decorative background motion | LOW — keyframes: 12 lines; JSX: 4 elements | P1 |
| Pulse-glow keyframe | MEDIUM — breathing glow orbs on dark bg | LOW — keyframes: 4 lines; JSX: target elements | P1 |
| Marquee keyframe | MEDIUM — credential strip scrolling | LOW — 3 lines CSS + JSX wrapper element | P1 |
| Asset registry (10 images) | MEDIUM — real photos vs blank sections | LOW — mechanical imports | P2 |
| `--radius` token (theme-responsive corners) | LOW — subtle corner difference | MEDIUM — requires usage audit | P2 |
| `scroll-behavior: smooth` | LOW — UX detail | LOW — 1 line | P3 |
| `-webkit-font-smoothing: antialiased` | LOW — font rendering polish | LOW — 1 line | P3 |

---

## Testability Criteria Per Category

### Color System
- **Test:** Load page with no `localStorage` theme. Background must be near-black (`#050a05`). Brand-green elements must show `#7a9e7a`. Toggle to light — background becomes `#F5F7FA`, brand-green becomes `#34C759`.
- **Method:** DevTools computed styles on `body` background, on a CTA button background, on a nav active-link color.

### Typography
- **Test:** `getComputedStyle(document.body).fontFamily` must include `Inter` as first family, no `Noto Sans SC`.
- **Method:** DevTools console or automated Playwright `evaluate()` check.

### Animations
- **Test:** DevTools → Animations panel shows active float animations on orb elements with 15s/12s/8s/18s durations. Marquee strip scrolls continuously. Glow orbs pulse.
- **Method:** Visual inspection + DevTools Animation inspector. No `animation: none` overrides.

### Effects
- **Test (glass-effect):** In dark mode, nav bar computed `background` must include `rgba(0,0,0,0.3)` and `backdrop-filter` must include `blur(20px) saturate(180%)`.
- **Test (text-gradient):** In dark mode, hero h1 computed `color` must be `rgba(0,0,0,0)` (transparent) with non-empty `backgroundImage` gradient.
- **Test (shadow-glow):** CTA button computed `boxShadow` must include `rgba(122,158,122,0.3)` in dark mode.

### Assets
- **Test:** DevTools Network tab on each of 5 pages — all `<img>` elements return HTTP 200. No blank image boxes in the layout.
- **Method:** Playwright test can assert `page.locator('img').evaluateAll(imgs => imgs.every(img => img.naturalWidth > 0))`.

### Spacing / Radius
- **Test:** In dark mode, a `.landing-card` computed `borderRadius` must be ≤12px. In light mode, same element must be ≥14px.
- **Method:** DevTools computed styles or Playwright `getComputedStyle`.

---

## Sources

- Baseline CSS (direct inspection): `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/assets/index-DuxCbJQB.css`
- Baseline JS (ThemeContext default, nav styles): `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/assets/index-BqLXAaHJ.js`
- React CSS (current state, 1258 lines): `landing/landing.css`
- React asset registry: `landing/assets.ts`
- Public image inventory: `public/entry-station/` directory listing (35 .jpg files; 10 absent from `assets.ts`)

---
*Feature research for: v1.1 pixel-perfect CSS visual compliance*
*Researched: 2026-04-20*
