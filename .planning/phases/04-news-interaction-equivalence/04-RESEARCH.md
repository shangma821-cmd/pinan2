# Phase 4: News & Interaction Equivalence - Research

**Researched:** 2026-04-20  
**Domain:** Baseline-faithful React reconstruction of News experience and cross-page interaction parity under `/entry-station`  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Phase 4 continues the approved baseline restoration path; it is not a redesign or modernization pass.
- **D-02:** Scope is limited to `HOME-03`, `NEWS-01`, `NEWS-02`, `NEWS-03`, `XPG-01`, and `XPG-02`.
- **D-03:** News route contract stays `/entry-station/news` with detail state driven by `?id=`.
- **D-04:** News remains powered by project-local static content in this phase; no CMS, API, or real sharing integration.
- **D-05:** Theme persistence must use `localStorage("theme")` plus root `data-theme`, with light as the default.
- **D-06:** Shared shell parity includes desktop scroll-reactive nav, mobile overlay nav, active route state, footer presence, and a back-to-top affordance.
- **D-07:** Home interaction work is additive only: preserve the Phase 3 page structure and restore missing interaction fidelity rather than reshaping content architecture.
- **D-08:** Runtime cutover, public `/` iframe replacement, and shell-to-academy contract changes remain out of scope until Phase 5.

### Important Boundary Clarification
- The phase has frontend-heavy scope, but the canonical interaction/visual contract already exists in `.planning/phases/01-baseline-lock-shell-contract/01-UI-SPEC.md`.
- Because that Phase 1 UI-SPEC is explicitly referenced in `04-CONTEXT.md` and already locks News/theme/nav/footer behavior, planning can proceed without generating a second per-phase UI-SPEC as long as the plans treat Phase 1 UI-SPEC as the design authority.

</user_constraints>

<phase_requirements>
## Phase Requirements Mapping

| ID | What Phase 4 Must Prove | Planning Implication |
|----|--------------------------|----------------------|
| HOME-03 | Home restores baseline-equivalent key interactions | Keep existing Home section composition and add deterministic behavior for counters and any remaining fidelity gaps |
| NEWS-01 | User can open a full News list page | Replace placeholder `LandingNewsPage.tsx` with a substantive list experience anchored to baseline copy and structure |
| NEWS-02 | User can search, filter, and browse News client-side | Add local news dataset, category controls, search input, and empty-state handling |
| NEWS-03 | User can open News detail via `?id=` and return to the list | Keep same-route detail state driven by search params and provide explicit list-return affordance |
| XPG-01 | Theme choice persists across landing visits | Add shell-level theme state, persist to localStorage, and apply `data-theme` consistently across all landing routes |
| XPG-02 | Mobile nav, scroll-reactive nav, and back-to-top match baseline behavior | Extend shared shell/nav/footer rather than introducing a second navigation system |

</phase_requirements>

## Baseline Evidence You Need For Planning

### Approved source signals
- `.planning/phases/01-baseline-lock-shell-contract/01-UI-SPEC.md` already locks the News route contract, theme persistence, desktop/mobile nav shape, scroll-reactive behavior, and footer/back-to-top responsibilities.
- Approved bundle JS confirms the original implementation pattern for this phase:
  - Theme contract: `localStorage.getItem("theme")`, `localStorage.setItem("theme", theme)`, `document.documentElement.setAttribute("data-theme", theme)`.
  - Navigation contract: nav becomes scroll-reactive when `window.scrollY > 50`.
  - Footer contract: back-to-top uses `window.scrollTo({ top: 0, behavior: "smooth" })`.
  - News contract: list/detail lives on one route, detail reads `id` from search params, and categories are `全部`, `行业动态`, `科研成果`, `公司新闻`.
- Approved bundle CSS confirms light/dark token pairing, blurred nav treatments, focus-visible handling, and reduced-motion fallback that Phase 4 should preserve.

### Confirmed content and behavior anchors from bundle evidence
- The approved News dataset contains 6 local articles.
- News list uses client-side text search across title/excerpt plus category filtering.
- News detail shows hero image, category pill, title, date, author, read time, long-form content, and share-style buttons.
- Home result counters and process pacing are animation-oriented baseline behaviors; they should not remain as inert static copy.
- The baseline theme defaults to light, not dark.

## Current Code Gap Analysis

### What is already in place
- `landing/routes.tsx` and `landing/components/LandingShell.tsx` already own the five-route landing family.
- `landing/sections/home/HomeNewsPreview.tsx` already deep-links to `/news?id=1`, `/news?id=2`, and `/news?id=3`, so the route contract is already partially established.
- `landing/sections/home/HomeAdvantages.tsx` and `landing/sections/home/HomeProcess.tsx` already restored core interaction scaffolding during Phase 3.
- Playwright infrastructure already exists via `playwright.config.ts`, `tests/landing-routing.spec.ts`, and `tests/landing-core-pages.spec.ts`.

### What is still missing
- `landing/pages/LandingNewsPage.tsx` is still a placeholder and does not satisfy any News requirement.
- `landing/components/LandingShell.tsx` does not currently own theme state, scroll listeners, or shared interaction controls.
- `landing/components/LandingNav.tsx` does not implement theme toggle, mobile overlay navigation, or scroll-reactive styling.
- `landing/components/LandingFooter.tsx` does not yet expose a back-to-top affordance.
- `landing/sections/home/HomeResults.tsx` still renders static numbers instead of animated count-up behavior.
- Current tests only prove route ownership and Phase 3 core-page content; they do not yet cover News flows or cross-page interaction parity.

## Recommended Implementation Architecture

### 1) Introduce a landing-level interaction layer in the shared shell
- Keep `LandingShell` as the single owner of cross-page state such as theme, scroll listeners, and shared overlay/back-to-top controls.
- Avoid a global app-wide store; page-local state plus shell-local state is sufficient for this scope.
- Prefer a small internal theme hook/provider colocated under `landing/` rather than pushing landing-specific behavior into academy runtime code.

### 2) Build News around local typed content data
- Create a dedicated News content module under `landing/` so list preview cards, filters, and detail state all read from the same source of truth.
- Keep list and detail rendering in the same routed page component, using query-string parsing for `id`.
- Preserve current Home preview deep links rather than inventing `/news/:id`.

### 3) Reuse the existing shell and route metadata
- Extend `LandingNav` and `LandingFooter` in place; do not add separate page-specific nav/footer variants.
- Keep route labels from `landing/routeMetadata.ts` as the navigation source of truth.
- Add accessible labels and deterministic test hooks for theme toggle, mobile menu, list filters, detail return, and back-to-top.

### 4) Treat animation as progressive enhancement, not structural dependency
- Use `IntersectionObserver` or equivalent visibility gating for counters and any scroll-triggered effects.
- Preserve reduced-motion-safe behavior by ensuring interactions still work when animations are minimized.
- Keep logic deterministic enough for Playwright assertions by exposing stable DOM states, text, or attributes.

## Planning Risks And Mitigations

### Risk 1: Shell behavior leaks into runtime-cutover work
- **Risk:** cross-page interaction work accidentally drifts into `/` iframe or Phase 5 cutover behavior.
- **Mitigation:** confine Phase 4 changes to `landing/**` and landing-specific tests; do not modify `public/entry-station/**` or shell ownership contracts beyond React landing internals.

### Risk 2: News parity becomes a vague “pretty list”
- **Risk:** News page looks fuller but misses search/filter/detail semantics.
- **Mitigation:** plans should require exact category values, same-route `?id=` detail handling, and explicit empty-state / return-list behaviors.

### Risk 3: Theme/nav behavior becomes brittle or untestable
- **Risk:** scroll state and overlays are implemented visually but without stable assertions.
- **Mitigation:** require deterministic classes, `data-*` state, or test IDs for theme mode, mobile menu visibility, nav scrolled state, and back-to-top control.

### Risk 4: Home interaction fidelity gets over-expanded
- **Risk:** Phase 4 reworks Home sections already accepted in Phase 3.
- **Mitigation:** limit Home work to the remaining behavioral gaps, especially results animation and any baseline interaction polish that maps directly to `HOME-03`.

### Risk 5: CSS churn causes cross-page regressions
- **Risk:** nav/footer/theme changes destabilize already-restored pages.
- **Mitigation:** keep landing CSS changes namespaced, extend existing selectors rather than replacing them wholesale, and rely on browser regression coverage.

## Validation Architecture

### Keep the existing preview-backed browser model
- Continue using `playwright.config.ts` with the preview-backed server path because Phase 4 behaviors are routing and browser interaction heavy.
- Keep `npm run build` as the quick gate after each task because shell/theme/CSS changes can fail at compile time before browser checks.

### Add phase-specific browser verification
- Extend or add Playwright coverage for:
  - News list rendering, category filters, text search, and empty-state behavior.
  - `?id=` News detail rendering and explicit return-to-list flow.
  - Theme persistence across reload/navigation.
  - Mobile nav overlay behavior and route navigation through that overlay.
  - Scroll-reactive nav state and back-to-top interaction.
  - Home results counter behavior or at least its visible parity hooks.

### Manual checks should remain narrow
- Visual spot-check only where automation is weak: mobile overlay feel, blurred nav transition quality, and cross-page light/dark appearance.
- Do not rely on manual testing for requirement coverage that can be expressed as DOM or browser-state assertions.

## Recommended Plan Decomposition (for next step)

1. **News data + page parity**
   - Introduce local News content/types and replace the placeholder page with list/search/filter/detail behavior.
2. **Shared shell interaction parity**
   - Add theme persistence, scroll-reactive nav, mobile overlay navigation, and footer back-to-top behavior.
3. **Home residual interaction parity**
   - Restore result-counter behavior and any remaining locked `HOME-03` interaction gaps without reshaping page structure.
4. **Verification hardening**
   - Add targeted Playwright coverage for News and cross-page interactions, plus regression updates where shared shell behavior changed.

## Open Questions

None blocking for planning.

The phase inputs are complete enough to plan immediately using:
- `04-CONTEXT.md` for locked decisions and canonical references
- `01-UI-SPEC.md` for interaction/visual truth
- approved baseline bundle assets for exact News/theme/nav/footer contracts

## Sources

- `.planning/phases/04-news-interaction-equivalence/04-CONTEXT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/ROADMAP.md`
- `.planning/PROJECT.md`
- `.planning/phases/01-baseline-lock-shell-contract/01-UI-SPEC.md`
- `.planning/phases/03-core-page-reconstruction/03-CONTEXT.md`
- `.planning/phases/03-core-page-reconstruction/03-VERIFICATION.md`
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/assets/index-BqLXAaHJ.js`
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/assets/index-DuxCbJQB.css`
- `landing/pages/LandingNewsPage.tsx`
- `landing/components/LandingShell.tsx`
- `landing/components/LandingNav.tsx`
- `landing/components/LandingFooter.tsx`
- `landing/sections/home/HomeResults.tsx`
- `landing/sections/home/HomeNewsPreview.tsx`
- `tests/landing-routing.spec.ts`
- `tests/landing-core-pages.spec.ts`
- `playwright.config.ts`
- `package.json`

## RESEARCH COMPLETE

Phase 4 can now be planned as a focused React parity pass centered on News, shared landing interactions, and Phase 3 Home interaction gaps, with concrete browser-verifiable acceptance criteria.
