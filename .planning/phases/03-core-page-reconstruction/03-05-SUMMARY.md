---
phase: 03-core-page-reconstruction
plan: 05
subsystem: ui
tags: [react, franchise-page, form-ui, revenue]
requires:
  - phase: 03-core-page-reconstruction
    provides: Shared landing foundation and asset registry from 03-01
provides:
  - Franchise route with cooperation models, revenue table, support, guarantees, and application UI
  - Exact hotline, email, and address anchors for deterministic verification
  - Baseline-style business storytelling without backend form coupling
affects: [03-06, landing-franchise, phase-verification]
tech-stack:
  added: []
  patterns: [section-composed franchise page, UI-only application form, contact-info sidebar]
key-files:
  created:
    - landing/sections/franchise/FranchiseHero.tsx
    - landing/sections/franchise/FranchiseModels.tsx
    - landing/sections/franchise/FranchiseRevenueTable.tsx
    - landing/sections/franchise/FranchiseSupport.tsx
    - landing/sections/franchise/FranchiseGuarantees.tsx
    - landing/sections/franchise/FranchiseApplication.tsx
  modified:
    - landing/pages/LandingFranchisePage.tsx
key-decisions:
  - "Keep the franchise form UI local and non-submitting in Phase 3 to avoid scope bleed into backend integration."
  - "Surface contact details both in the shared footer and on the page itself, while scoping browser assertions to the page-owned block."
patterns-established:
  - "Franchise uses business-content sections before the form so the application CTA sits on a fully contextualized page."
  - "Exact monetary anchors and labels are preserved as visible text for later parity verification."
requirements-completed: [FRAN-01, FRAN-02, FRAN-03]
duration: session-local
completed: 2026-04-17
---

# Phase 03 Plan 05: Franchise Reconstruction Summary

**Franchise now restores the core cooperation narrative with model tiers, sample revenue, support and guarantee blocks, plus the exact consultation form and contact anchors.**

## Performance

- **Duration:** session-local
- **Started:** session-local
- **Completed:** 2026-04-17T10:54:17+0800
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Replaced the Franchise placeholder with hero, cooperation models, revenue table, support, guarantee, and application sections.
- Restored the exact cooperation names, price anchors, revenue values, limited-offer copy, and contact details required by the plan.
- Added the full form-field order and placeholders while keeping the phase safely scoped to UI-only form behavior.

## Task Commits

No git commits were created during this local autonomous execution pass; the work remains uncommitted in the current worktree.

## Files Created/Modified
- `landing/pages/LandingFranchisePage.tsx` - composes the full Franchise route in business-first order
- `landing/sections/franchise/FranchiseHero.tsx` - restores the hero value proposition and imagery
- `landing/sections/franchise/FranchiseModels.tsx` - reintroduces `店中店`, `标准店`, and `旗舰店`
- `landing/sections/franchise/FranchiseRevenueTable.tsx` - restores the sample revenue breakdown and exact amounts
- `landing/sections/franchise/FranchiseSupport.tsx` - adds the four required support anchors
- `landing/sections/franchise/FranchiseGuarantees.tsx` - restores the risk-control and limited-offer sections
- `landing/sections/franchise/FranchiseApplication.tsx` - renders the exact field order, placeholders, and contact block

## Decisions Made

- Separated business proof modules from the application form so the CTA lands after the user has context on models, revenue, and guarantees.
- Scoped the contact assertion surface to the page-owned block because the shared footer also intentionally repeats the same contact anchors.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Franchise now has stable visible anchors for browser verification and a clean UI boundary for any later form integration work.

---
*Phase: 03-core-page-reconstruction*
*Completed: 2026-04-17*
