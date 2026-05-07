# Phase 5: React Runtime Cutover & Parity QA - Research

**Researched:** 2026-04-20  
**Domain:** React-owned landing runtime cutover and parity proof under shell + direct load  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Keep `/entry-station` as the stable public landing route.
- **D-02:** `/` shell should stop treating `/entry-station/index.html` as the current public landing runtime.
- **D-03:** Landing image/runtime ownership should move into React/Vite output rather than public-path transitional files.
- **D-04:** Verification must prove direct and iframe paths are aligned after cutover.

</user_constraints>

<phase_requirements>
## Phase Requirements Mapping

| ID | What Phase 5 Must Prove | Planning Implication |
|----|--------------------------|----------------------|
| XPG-03 | Built `/entry-station` is React-owned landing rather than static copy | Update shell iframe target and asset ownership, then verify both direct and iframe paths against built output |

</phase_requirements>

## Current Gap Analysis

- `EntryShell.tsx` still points `/` home iframe to `/entry-station/index.html?v=20260311-3`, so shell traffic is still coupled to the transitional static runtime.
- `landing/assets.ts` still used public route strings like `/entry-station/hero-bg.jpg`, so even direct React landing loads still depended on public-path static files rather than bundled assets.
- Existing Playwright coverage was strong for landing behavior, but it did not yet prove that `/` now loads the same React-owned runtime or that direct landing images come from the built asset bundle.

## Recommended Cutover Approach

### 1) Shell cutover by changing iframe target only
- Keep the iframe-based public shell structure, but point it to `/entry-station` instead of `/entry-station/index.html`.
- This preserves the public `/` contract while switching the runtime owner behind it.

### 2) Bundle landing media through source imports
- Move landing image references from hardcoded `/entry-station/*.jpg` strings to import-based URLs resolved by Vite during build.
- This produces hashed assets in `dist/assets/*` and proves the landing runtime is now source-owned.

### 3) Verify cutover with browser-level parity checks
- Add one direct-load assertion confirming landing media comes from `/assets/`.
- Add one shell iframe assertion confirming `/` now frames `/entry-station` and that the iframe renders the same React landing shell.
- Add academy-bridge assertions so cutover does not regress the inherited Phase 1 landing -> `/academy` contract.
- Keep the existing Phase 4 suites to guard against cutover regressions.

## Validation Architecture

- Quick gate: `npm run build`
- Full gate: `npm run build && npx playwright test tests/landing-routing.spec.ts tests/landing-core-pages.spec.ts tests/landing-news-interactions.spec.ts tests/landing-cutover.spec.ts`
- Key evidence:
  - bundled asset URLs under `/assets/`
  - iframe src no longer points to `index.html`
  - iframe-rendered landing shell visible through `/`

## Recommended Plan Decomposition

1. **Cutover runtime ownership**
   - Update `EntryShell.tsx` and `landing/assets.ts` so shell and direct landing both use React-owned output.
2. **Parity QA**
   - Add a focused cutover browser spec and run the combined landing suite.

## Sources

- `.planning/phases/05-react-runtime-cutover-parity-qa/05-CONTEXT.md`
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `EntryShell.tsx`
- `landing/assets.ts`
- `tests/landing-routing.spec.ts`
- `tests/landing-core-pages.spec.ts`
- `tests/landing-news-interactions.spec.ts`

## RESEARCH COMPLETE

Phase 5 can be completed with a narrow shell target change, a bundled asset ownership change, and one focused cutover spec layered on top of the existing landing regression suite.
