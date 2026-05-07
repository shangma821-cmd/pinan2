# Phase 3: Core Page Reconstruction - Research

**Researched:** 2026-04-17  
**Domain:** Baseline-faithful React reconstruction of Home/About/Products/Franchise under `/entry-station`  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Phase 3 is high-fidelity React reconstruction, not structural placeholder work.
- **D-02:** Scope is Home/About/Products/Franchise plus Home news preview only; full News parity and cross-page interaction parity stay deferred.
- **D-03:** Content/visual truth for this phase is the approved baseline pack + Phase 1 UI contract.
- **D-04:** Do not embed static HTML/bundle as runtime implementation.
- **D-05:** Home must restore locked section order and key interactions (CTA routing, advantages single-select expand, process switching/auto-advance, results number presentation, news preview links).
- **D-06:** Products must restore dual-view switch (`核心产品` / `会员套餐`); Franchise must restore cooperation model/revenue/support/guarantee/form UI.
- **D-07:** About/Products/Franchise must restore full grouped content, not compressed generic marketing blocks.
- **D-08:** Keep existing Phase 2 shell + `/entry-station` route family ownership.
- **D-09:** Use page-local section components by default; only extract shared components when truly repeated.

### Important Boundary Clarification
- Project-level docs still mark `public/entry-station/**` as active transitional runtime for `/` iframe traffic.
- For **Phase 3 planning**, content parity decisions must still follow the approved baseline pack and Phase 1 UI-SPEC, with transitional runtime treated as reference only.

</user_constraints>

<phase_requirements>
## Phase Requirements Mapping

| ID | What Phase 3 Must Prove | Planning Implication |
|----|--------------------------|----------------------|
| HOME-01 | Home has baseline-equivalent section architecture | Build Home as section-composed page in locked order; do not merge/omit sections |
| HOME-02 | Home CTAs navigate to Products/Franchise | Use router links/buttons with explicit route targets and tests |
| ABOUT-01 | About is independent page | Keep dedicated `/about` page identity and route |
| ABOUT-02 | About restores baseline content groups | Implement intro/certifications/history/team+equipment/service experience/proof groups |
| PROD-01 | Products is independent page | Keep dedicated `/products` route and page-level structure |
| PROD-02 | Products supports dual view toggle | Implement deterministic tab/switch state and active styling |
| PROD-03 | Products shows equivalent product/package/case content | Restore core product blocks + package cards + case grouping |
| FRAN-01 | Franchise is independent page | Keep dedicated `/franchise` route and page identity |
| FRAN-02 | Franchise restores model/revenue/support/guarantee | Implement 3 cooperation models + revenue table + support/guarantee modules |
| FRAN-03 | Franchise restores consultation form UI/contact info | Implement form UI fields/order and contact detail block (UI only) |

</phase_requirements>

## Baseline Evidence You Need For Planning

### Approved source signals
- `.planning/phases/01-baseline-lock-shell-contract/01-UI-SPEC.md` already locks section order, interaction expectations, and visual direction.
- Approved bundle JS includes original `code-path` markers for section/page modules (`src/sections/*`, `src/pages/*`), confirming component-level architecture in baseline implementation.
- Approved CSS confirms typography/colors/theme tokens and key utility classes (`Inter` + `Montserrat`, `--brand-green`, `--brand-accent`, `.glass-effect`, `.apple-card`, `.apple-button`, `focus-visible`, reduced-motion fallback).

### Confirmed interaction behaviors from bundle evidence
- `HowItWorks` auto-advances by interval `5000ms` (`setInterval(..., 5e3)`) after section visibility gate.
- Stats counter animation runs in timed increments (2s total, step-based interval) after in-view trigger.
- Many sections use `IntersectionObserver` reveal gates, so planning should preserve section-triggered animation lifecycle.

### Confirmed content anchors from bundle evidence
- Products hero: `看得见的效果，算得清的收益`.
- Products switch labels: `核心产品` / `会员套餐`.
- Franchise hero: `单店年赚60万起`.
- Franchise form CTA: `提交申请`.
- Franchise contact block includes `招商热线 18948301116` and `franchise@puyuan-health.com`.
- Franchise cooperation models include `店中店`, `标准店` (featured), `旗舰店` with deposit/equipment/income fields.

## Current Code Gap Analysis

### What is already in place (Phase 2 complete)
- Route ownership and shell scaffolding are stable: `EntryShell.tsx`, `landing/LandingApp.tsx`, `landing/routes.tsx`, `landing/routeMetadata.ts`, shared shell components, and routing smoke tests.
- Four target pages exist as route-level placeholders:
  - `landing/pages/LandingHomePage.tsx`
  - `landing/pages/LandingAboutPage.tsx`
  - `landing/pages/LandingProductsPage.tsx`
  - `landing/pages/LandingFranchisePage.tsx`

### What is missing for Phase 3
- Page content is placeholder-only; no baseline-equivalent sections implemented.
- No Phase 3 interaction logic on Home or Products.
- Shared `LandingNav`/`LandingFooter` remain scaffold-level, not baseline-fidelity.
- No dedicated landing style system aligned to baseline theme tokens yet.

## Recommended Implementation Architecture

### 1) Keep shell ownership stable
- Preserve existing `LandingShell` + nested routes.
- Avoid route contract changes and avoid touching `/entry-station/index.html` transitional behavior in this phase.

### 2) Reconstruct pages via section modules
- Suggested structure:
  - `landing/sections/home/*`
  - `landing/sections/about/*`
  - `landing/sections/products/*`
  - `landing/sections/franchise/*`
- Keep each page as orchestrator of its section sequence; do not create a heavy cross-page design system now.

### 3) Introduce a landing-scoped style layer
- Add landing-specific stylesheet(s) and CSS variables mirroring baseline token semantics.
- Avoid relying on academy/global styles for landing fidelity.
- Preserve light+dark parity scaffolding compatible with existing theme behavior.

### 4) Use stable asset strategy
- Do not runtime-reference `.planning/baselines/**`.
- Copy required baseline assets into maintainable project-owned runtime path (`landing/assets` imported by React, or equivalent stable public path), then reference those assets from React source.

## Planning Risks And Mitigations

### Risk 1: Scope bleed into Phase 4/5
- **Risk:** pulling full News implementation, cross-page advanced interactions, or runtime cutover into Phase 3.
- **Mitigation:** enforce strict requirement-ID traceability (only HOME-01/02, ABOUT-01/02, PROD-01/02/03, FRAN-01/02/03).

### Risk 2: Low-fidelity “section placeholders”
- **Risk:** phase passes routing but fails content parity.
- **Mitigation:** require baseline-anchored section checklists per page (headings, grouping, CTA semantics, key imagery anchors).

### Risk 3: Truth-source confusion
- **Risk:** using mutable runtime files as parity authority.
- **Mitigation:** treat approved baseline pack + Phase 1 UI-SPEC as authoritative for copy/layout/interaction expectations.

### Risk 4: Breaking shell/routing invariants
- **Risk:** introducing regressions to `/entry-station` route ownership and shared shell.
- **Mitigation:** keep existing routing smoke tests and extend rather than replace.

### Risk 5: Global style collisions
- **Risk:** landing styles conflict with academy styles.
- **Mitigation:** namespace landing selectors/tokens and keep landing style imports localized to landing app path.

## Validation Architecture

### Keep and extend route smoke
- Continue `tests/landing-routing.spec.ts` to guard shared shell and route ownership.

### Add Phase 3 behavioral assertions (minimum set)
- Home:
  - required section headings/content anchors are present in correct order.
  - CTA routes to `/entry-station/products` and `/entry-station/franchise`.
- Products:
  - `核心产品`/`会员套餐` switch changes visible content state.
- Franchise:
  - form fields appear in locked order (`姓名`,`电话`,`邮箱`,`所在城市`,`留言`).
  - contact block shows expected hotline/email/address text.
- About:
  - required grouped sections present on dedicated page.

### Non-goals in this phase’s verification
- Full News filtering/detail parity.
- Full cross-page interaction parity (theme persistence, mobile nav parity, back-to-top behavior).
- Public runtime cutover parity via `/`.

## Recommended Plan Decomposition (for next step)

1. **Foundation styles + shared shell fidelity**
   - Landing-scoped tokens/styles, nav/footer content fidelity uplift, no route changes.
2. **Home reconstruction**
   - Section-by-section restore + CTA routing + home interactions required in Phase 3 scope.
3. **About reconstruction**
   - Restore all required grouped sections and content anchors.
4. **Products reconstruction**
   - Restore hero + dual-view switch + product/package/case content blocks.
5. **Franchise reconstruction**
   - Restore cooperation/revenue/support/guarantee/form/contact modules.
6. **Verification hardening**
   - Extend Playwright checks for Phase 3 requirements and guard regressions.

## Open Questions

None blocking for planning.  
All required planning inputs are available and consistent enough to proceed.

## Sources

- `.planning/phases/03-core-page-reconstruction/03-CONTEXT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/ROADMAP.md`
- `.planning/PROJECT.md`
- `.planning/phases/01-baseline-lock-shell-contract/01-UI-SPEC.md`
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/index.html`
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/assets/index-BqLXAaHJ.js`
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/assets/index-DuxCbJQB.css`
- `EntryShell.tsx`
- `landing/LandingApp.tsx`
- `landing/routes.tsx`
- `landing/routeMetadata.ts`
- `landing/components/LandingShell.tsx`
- `landing/components/LandingNav.tsx`
- `landing/components/LandingFooter.tsx`
- `landing/pages/LandingHomePage.tsx`
- `landing/pages/LandingAboutPage.tsx`
- `landing/pages/LandingProductsPage.tsx`
- `landing/pages/LandingFranchisePage.tsx`
- `tests/landing-routing.spec.ts`

## RESEARCH COMPLETE

Phase 3 can now be planned directly as a high-fidelity React reconstruction with strict requirement-ID traceability, section-level implementation units, and behavior-focused verification gates.
