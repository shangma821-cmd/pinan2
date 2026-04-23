---
phase: 04-news-interaction-equivalence
plan: 03
subsystem: ui
tags: [home, counters, interaction-state, animation]
requires:
  - phase: 04-news-interaction-equivalence
    provides: Shared shell interaction parity from 04-02
  - phase: 04-news-interaction-equivalence
    provides: News route parity from 04-01
provides:
  - Animated results counters with in-view trigger
  - Stable active-state hooks for advantages and process interactions
  - Home interaction parity coverage needed by Phase 4 verification
affects: [04-04, landing-home, phase-verification]
tech-stack:
  added: []
  patterns: [intersection-observer trigger, deterministic data attributes, interaction-safe browser assertions]
key-files:
  created: []
  modified:
    - landing/sections/home/HomeAdvantages.tsx
    - landing/sections/home/HomeProcess.tsx
    - landing/sections/home/HomeResults.tsx
key-decisions:
  - "Keep the Phase 3 Home structure untouched and only add the missing interaction fidelity required by `HOME-03`."
  - "Represent active Home interaction state in the DOM so browser verification can assert behavior without brittle visual selectors."
patterns-established:
  - "Home interaction modules now expose `data-active` hooks for deterministic verification."
  - "Results counters are treated as progressive enhancement, triggered when the section enters view."
requirements-completed: [HOME-03]
duration: session-local
completed: 2026-04-20
---

# Phase 04 Plan 03: Home Interaction Summary

**Home now completes its Phase 4 interaction contract with real counter animation and stable interaction-state hooks for the already-restored advantages and process sections.**

## Performance

- **Duration:** session-local
- **Started:** session-local
- **Completed:** 2026-04-20T00:00:00+0800
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added `IntersectionObserver`-driven count-up behavior for the results metrics.
- Added stable `data-testid` and `data-active` hooks to the advantages and process interactions.
- Preserved the existing Home section order and content while closing the last `HOME-03` gap.

## Task Commits

No git commits were created during this local autonomous execution pass; the work remains uncommitted in the current worktree.

## Files Created/Modified
- `landing/sections/home/HomeAdvantages.tsx` - active-state hooks for the expandable advantages list
- `landing/sections/home/HomeProcess.tsx` - active-state hooks for the process carousel steps
- `landing/sections/home/HomeResults.tsx` - in-view animated counters and stable results test IDs

## Decisions Made

- Treated results animation as view-triggered behavior rather than unconditional autoplay so the interaction remains aligned with the approved baseline feel.
- Updated the tests to scroll the results section into view before expecting the final values, reflecting the actual interaction contract instead of flattening it into static text.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None blocking.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Home interaction parity is now strong enough for Phase 4 verification and for direct comparison during Phase 5 cutover checks.

---
*Phase: 04-news-interaction-equivalence*
*Completed: 2026-04-20*
