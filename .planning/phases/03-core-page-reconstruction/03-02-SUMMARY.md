---
phase: 03-core-page-reconstruction
plan: 02
subsystem: ui
tags: [react-router, home-page, interactions, marketing]
requires:
  - phase: 03-core-page-reconstruction
    provides: Shared landing token, asset, and shell foundation from 03-01
provides:
  - Section-composed Home route with locked information architecture
  - CTA wiring from Home hero into Products and Franchise
  - Page-local Home interactions for advantages, process rotation, proof values, and news preview
affects: [03-06, landing-home, phase-verification]
tech-stack:
  added: []
  patterns: [page-local section modules, route-aware CTA links, interval-driven process carousel]
key-files:
  created:
    - landing/sections/home/HomeHero.tsx
    - landing/sections/home/HomeCredentialMarquee.tsx
    - landing/sections/home/HomePainPoints.tsx
    - landing/sections/home/HomeAdvantages.tsx
    - landing/sections/home/HomeProcess.tsx
    - landing/sections/home/HomeResults.tsx
    - landing/sections/home/HomeNewsPreview.tsx
    - landing/sections/home/HomeClosingCta.tsx
  modified:
    - landing/pages/LandingHomePage.tsx
key-decisions:
  - "Keep Home interactions page-local instead of introducing cross-page state while Phase 4 interaction parity is still deferred."
  - "Preserve the baseline section order exactly so browser verification can assert the intended page rhythm."
patterns-established:
  - "Home is now assembled as explicit section modules instead of one oversized page file."
  - "Primary Home CTAs target scoped React routes directly through the landing router."
requirements-completed: [HOME-01, HOME-02]
duration: session-local
completed: 2026-04-17
---

# Phase 03 Plan 02: Home Reconstruction Summary

**Home now restores the baseline hero-to-CTA narrative with routed actions, expandable advantages, rotating process steps, proof metrics, and a news preview inside the React landing shell.**

## Performance

- **Duration:** session-local
- **Started:** session-local
- **Completed:** 2026-04-17T10:54:17+0800
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Replaced the Home placeholder with the eight locked sections from hero through closing CTA.
- Wired the hero buttons to `/products` and `/franchise`, and exposed the three news-preview links under `/news?id=1..3`.
- Implemented deterministic page-local interaction state for advantages expansion and the 5-second service-process rotation.

## Task Commits

No git commits were created during this local autonomous execution pass; the work remains uncommitted in the current worktree.

## Files Created/Modified
- `landing/pages/LandingHomePage.tsx` - orchestrates the full section sequence in locked order
- `landing/sections/home/HomeHero.tsx` - restores hero trust pill, baseline headline, and CTA routes
- `landing/sections/home/HomeCredentialMarquee.tsx` - adds the certification strip and quick trust anchors
- `landing/sections/home/HomePainPoints.tsx` - restores pain-point and policy-opportunity groupings
- `landing/sections/home/HomeAdvantages.tsx` - implements the single-expanded advantage list
- `landing/sections/home/HomeProcess.tsx` - adds the rotating four-step service flow with direct selection
- `landing/sections/home/HomeResults.tsx` - surfaces the required proof values and case cards
- `landing/sections/home/HomeNewsPreview.tsx` - restores news preview cards and the `查看全部资讯` link
- `landing/sections/home/HomeClosingCta.tsx` - closes the page with the phase-required franchise CTA

## Decisions Made

- Used explicit section markers (`home-*`) so the Playwright suite can verify content without brittle selector heuristics.
- Kept the Home news preview in Phase 3 because it is part of the approved Home information architecture even though full News parity is deferred.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Home now exposes stable anchors and route behavior for Phase 3 verification and for the later Phase 4 interaction work.

---
*Phase: 03-core-page-reconstruction*
*Completed: 2026-04-17*
