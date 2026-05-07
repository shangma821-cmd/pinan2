# Roadmap: 频安AI智能商学院

## Overview

This milestone first performs a runtime reset so `public/entry-station/**` is explicitly treated as the active transitional runtime again, revalidates the shell contract (`/` -> landing -> `/academy` -> `/`), and then rebuilds baseline-equivalent landing behavior as maintainable React/Vite source for later cutover.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Runtime Reset & Shell Revalidation** - Lock baseline truth, reset transitional runtime ownership, and revalidate the public shell contract before React reconstruction.
- [x] **Phase 2: React Landing Foundation (Post-Reset)** - Establish React landing route scaffolding and shared shell targets while transitional runtime remains active.
- [x] **Phase 3: Core Page Reconstruction** - Rebuild Home, About, Products, and Franchise in React against the approved baseline pack.
- [x] **Phase 4: News & Interaction Equivalence** - Rebuild news and cross-page interactions in React with baseline-equivalent behavior.
- [x] **Phase 5: React Runtime Cutover & Parity QA** - Switch public landing runtime ownership from transitional assets to React output and prove parity under shell and direct loads.
- [x] **Phase 6: CSS Variable Audit & Scope Isolation** - Neutralize academy/landing CSS variable collision risk and verify scope isolation before authoring new token values. (completed 2026-04-23)
- [ ] **Phase 7: Font System Replacement** - Replace Noto Sans SC with self-hosted Inter + Montserrat fonts and stabilize layout reflow before per-pixel measurement begins.
- [ ] **Phase 8: Color Token System (Dark-First)** - Invert the token polarity to dark-first `:root` with complete 15-token set and corrected brand green, gating all subsequent effect work.
- [ ] **Phase 9: Utility Classes & Keyframe Animations** - Implement glass-effect, text-gradient, shadow-glow utility classes and all baseline keyframe animations including accessibility degradation.
- [ ] **Phase 10: Asset Registry & Spacing Token Audit** - Register all missing baseline images in assets.ts and align spacing/radius tokens to baseline 4px-grid values.
- [ ] **Phase 11: Visual Regression Test Suite & Per-Page QA** - Establish Playwright screenshot golden baseline and complete page-by-page desktop/mobile visual acceptance.

## Phase Details

### Phase 1: Runtime Reset & Shell Revalidation
**Goal**: Users keep the current public landing entry and academy handoff behavior while planning truth is reset so `public/entry-station/**` is the active transitional runtime and the baseline pack remains immutable review truth.
**Depends on**: Nothing (first phase)
**Requirements**: SHELL-01, SHELL-03
**Success Criteria** (what must be TRUE):
  1. User can visit `/` and still reach the landing through the existing shell without a public URL change, while the stable public landing route remains `/entry-station`.
  2. User can trigger the academy entry from the landing and reach `/academy`, then return to `/`, preserving the public contract even if trigger internals live in a transitional wrapper.
  3. The milestone has one approved pre-`7be7097^` baseline pack, an updated source-of-truth inventory, and a shell checklist that may remain `PENDING` before the shell smoke task runs; Phase 1 is complete only after that smoke verification runs and is recorded in the checklist.
**Plans**: 3 (completed 2026-04-16)
**UI hint**: yes

### Phase 2: React Landing Foundation (Post-Reset)
**Goal**: Users can navigate five landing destinations in React route structure prepared for reconstruction while the active transitional runtime continues to serve public traffic.
**Depends on**: Phase 1
**Requirements**: SHELL-02
**Success Criteria** (what must be TRUE):
  1. User can navigate to five distinct landing destinations under React-owned `/entry-station` routes: Home, About, Products, Franchise, and News.
  2. User can refresh or direct-load each React destination and remain in the scoped landing route experience.
  3. User sees a shared React landing shell and navigation frame across all five destinations, ready for baseline content restoration.
**Plans**: 3 (completed 2026-04-16)
**UI hint**: yes

### Phase 3: Core Page Reconstruction
**Goal**: Users can experience the restored core marketing destinations with the original information architecture, CTA flow, and content groupings.
**Depends on**: Phase 2
**Requirements**: HOME-01, HOME-02, ABOUT-01, ABOUT-02, PROD-01, PROD-02, PROD-03, FRAN-01, FRAN-02, FRAN-03
**Success Criteria** (what must be TRUE):
  1. User can see the restored Home page with baseline-equivalent hero, credentials, pain points, core advantages, service flow, case/proof sections, news preview, and closing CTA.
  2. User can use Home CTAs to reach the Products and Franchise destinations.
  3. User can open an independent About page with baseline-equivalent brand introduction, qualifications/certifications, development history, team/equipment, and service-experience groupings.
  4. User can open the Products page and switch between core products and membership packages while viewing equivalent descriptions, applicable scenarios, specifications or benefits, and related cases.
  5. User can open the Franchise page and view baseline-equivalent cooperation models, return estimates, support and guarantee sections, consultation form UI, and contact details.
**Plans**: 6 (completed 2026-04-17)
**UI hint**: yes

### Phase 4: News & Interaction Equivalence
**Goal**: Users can use the restored news experience and cross-page interaction behaviors that made the original landing feel alive.
**Depends on**: Phase 3
**Requirements**: HOME-03, NEWS-01, NEWS-02, NEWS-03, XPG-01, XPG-02
**Success Criteria** (what must be TRUE):
  1. User can use Home interactions equivalent to the baseline, including expandable advantages, service-process step switching or auto-advance, and results number presentation.
  2. User can open the News page, search or filter the article list, browse articles, and open detail views via `?id=` before returning to the list.
  3. User's theme choice persists across landing visits with baseline-equivalent behavior.
  4. User can use baseline-equivalent mobile navigation, scroll-reactive navigation, and back-to-top interaction across landing pages.
**Plans**: 4 (completed 2026-04-20)
**UI hint**: yes

### Phase 5: React Runtime Cutover & Parity QA
**Goal**: Users reach the reconstructed landing through React-owned production output after cutover from transitional runtime assets, with parity proven under shell and direct loads.
**Depends on**: Phase 4
**Requirements**: XPG-03
**Success Criteria** (what must be TRUE):
  1. User opening built `/entry-station` sees the landing generated from the React/Vite source tree rather than `public/entry-station/**` transitional assets.
  2. User sees the same restored landing experience whether it loads directly at `/entry-station` or through the `/` shell iframe.
  3. Release verification confirms transitional wrapper/runtime delivery is retired for public landing traffic on desktop and mobile.
**Plans**: 2 (completed 2026-04-20)
**UI hint**: yes

### Phase 6: CSS Variable Audit & Scope Isolation
**Goal**: Landing CSS variables are confirmed collision-free with academy styles before any new token values are authored, eliminating silent style bleed risk.
**Depends on**: Phase 5
**Requirements**: CSSVAR-04
**Success Criteria** (what must be TRUE):
  1. User visiting the landing sees no visual artifacts caused by academy `index.css` variables leaking into the landing shell — verified by toggling academy imports off and confirming no change in landing appearance.
  2. A documented inventory of all CSS custom properties in `landing.css` and `index.css` confirms zero naming collisions, with any collisions resolved via `.landing-app` scoping or renaming.
  3. Developers can verify scope isolation by reviewing a single authoritative diff showing how landing variables are isolated from the academy scope.
**Plans**: 1 plan
Plans:
- [x] 06-01-PLAN.md — CSS variable collision inventory and body leak isolation verification
**UI hint**: yes

### Phase 7: Font System Replacement
**Goal**: Users see Inter as the body font and Montserrat as the heading font, with Noto Sans SC removed and antialiased rendering enabled, matching baseline typography before any per-pixel measurement is done.
**Depends on**: Phase 6
**Requirements**: TYPO-01, TYPO-02, TYPO-03
**Success Criteria** (what must be TRUE):
  1. User sees body text rendered in Inter (self-hosted via `@fontsource/inter`) and no Noto Sans SC glyphs remain on any landing page.
  2. User sees heading text rendered in Montserrat (self-hosted via `@fontsource/montserrat`), matching the weight and style used in the baseline.
  3. User sees font rendering with antialiased smoothing (`-webkit-font-smoothing: antialiased`), visually matching the baseline's text crispness on macOS and mobile.
**Plans**: TBD
**UI hint**: yes

### Phase 8: Color Token System (Dark-First)
**Goal**: Users see the landing default in dark mode with the correct complete color token system, and theme switching correctly applies the full light-mode override set — gating all subsequent visual effect work on accurate token references.
**Depends on**: Phase 7
**Requirements**: CSSVAR-01, CSSVAR-02, CSSVAR-03, CSSVAR-05
**Success Criteria** (what must be TRUE):
  1. User opening the landing for the first time sees a dark-themed page with no white flash — the synchronous theme script in `index.html` sets the dark default before React hydrates.
  2. User sees the brand green as `#7a9e7a` in dark mode and `#34C759` in light mode, matching baseline exactly.
  3. User switching to light theme via the toggle sees all 15 semantic color tokens correctly overridden by the `[data-theme=light]` rule set, with no unthemed or fallback values visible.
  4. User switching between themes sees consistent, complete color coverage — no token gaps, no inherited incorrect values from the old light-first `:root`.
**Plans**: TBD
**UI hint**: yes

### Phase 9: Utility Classes & Keyframe Animations
**Goal**: Users see all baseline decorative animations and visual effect classes active across the landing — floating orbs, marquee credentials, pulse-glow CTAs, glass panels, gradient text, and glow shadows — with accessibility degradation in place.
**Depends on**: Phase 8
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04, ANIM-05, ANIM-06, ANIM-07
**Success Criteria** (what must be TRUE):
  1. User sees floating light orbs on dark backgrounds animating with the float keyframe variants (5 variants), matching baseline motion timing.
  2. User sees the credentials/qualifications banner scrolling continuously with the marquee animation (30s linear infinite).
  3. User sees CTA buttons and highlighted cards pulsing with the `pulse-glow` breathing glow animation.
  4. User sees navigation bar and card elements with `.glass-effect` frosted glass appearance (`backdrop-filter: blur`), including Safari compatibility via `-webkit-backdrop-filter`.
  5. User sees hero and section headings with `.text-gradient` color gradient applied, and CTA buttons with `.shadow-glow` glow shadow, matching baseline visual output.
  6. User with `prefers-reduced-motion: reduce` system preference sees all keyframe animations disabled or substituted with static equivalents — no motion on reduced-motion devices.
**Plans**: TBD
**UI hint**: yes

### Phase 10: Asset Registry & Spacing Token Audit
**Goal**: Users see all baseline images correctly displayed across landing sections, with spacing and radius tokens aligned to the baseline 4px-grid values eliminating layout drift.
**Depends on**: Phase 6
**Requirements**: ASSET-01, ASSET-02, ASSET-03
**Success Criteria** (what must be TRUE):
  1. User sees all baseline images rendered in their correct landing page sections — no broken image placeholders or missing visual content — verified by comparing each section to the baseline pack.
  2. User sees card corner radii responding correctly to theme: `0.625rem` (10px) in dark mode and `1rem` (16px) in light mode, matching baseline `--radius` token behavior.
  3. User sees section padding, gap, and margin values that align to the baseline 4px-grid — no off-by-4px or off-by-8px spacing discrepancies visible at either desktop or mobile breakpoints.
**Plans**: TBD
**UI hint**: yes

### Phase 11: Visual Regression Test Suite & Per-Page QA
**Goal**: Users' pixel-perfect visual experience is verified and locked — per-page desktop and mobile acceptance is complete, and a Playwright screenshot suite guards against future regression.
**Depends on**: Phase 9, Phase 10
**Requirements**: VQA-01, VQA-02, VQA-03
**Success Criteria** (what must be TRUE):
  1. User opening each of the five landing pages on desktop sees visual output that passes side-by-side comparison against the baseline pack with no perceptible color, font, spacing, or animation discrepancy.
  2. User opening each of the five landing pages on mobile sees visual output that matches the baseline pack at mobile breakpoints, with no layout overflow, font size deviation, or missing interactive element.
  3. The Playwright visual regression suite runs `toHaveScreenshot()` against each page at both breakpoints, with golden screenshots derived from the baseline build — and all assertions pass on a clean run.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10 -> 11
Note: Phase 10 depends only on Phase 6 (independent of animation work) and can be executed in parallel with Phases 7-9 if desired.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Runtime Reset & Shell Revalidation | 3/3 | Complete | 2026-04-16 |
| 2. React Landing Foundation (Post-Reset) | 3/3 | Complete | 2026-04-16 |
| 3. Core Page Reconstruction | 6/6 | Complete | 2026-04-17 |
| 4. News & Interaction Equivalence | 4/4 | Complete | 2026-04-20 |
| 5. React Runtime Cutover & Parity QA | 2/2 | Complete | 2026-04-20 |
| 6. CSS Variable Audit & Scope Isolation | 1/1 | Complete   | 2026-04-23 |
| 7. Font System Replacement | 0/? | Not started | - |
| 8. Color Token System (Dark-First) | 0/? | Not started | - |
| 9. Utility Classes & Keyframe Animations | 0/? | Not started | - |
| 10. Asset Registry & Spacing Token Audit | 0/? | Not started | - |
| 11. Visual Regression Test Suite & Per-Page QA | 0/? | Not started | - |
