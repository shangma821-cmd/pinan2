---
phase: 04-news-interaction-equivalence
plan: 01
subsystem: content
tags: [news, content-model, query-string, routing]
requires:
  - phase: 04-news-interaction-equivalence
    provides: Shared shell interaction layer from 04-02
provides:
  - Shared local News content source used by both Home preview and full News page
  - `/entry-station/news` list experience with client-side search and category filters
  - Same-route `?id=` detail flow with explicit return-to-list behavior
affects: [04-04, landing-news, phase-verification]
tech-stack:
  added: []
  patterns: [query-string detail state, local content module, route-level list/detail split]
key-files:
  created:
    - landing/content/newsContent.ts
  modified:
    - landing/assets.ts
    - landing/pages/LandingNewsPage.tsx
    - landing/sections/home/HomeNewsPreview.tsx
    - landing/landing.css
key-decisions:
  - "Keep News data fully local for Phase 4 so parity can be completed without introducing CMS or API uncertainty."
  - "Use one shared content module to prevent Home preview and News detail from drifting."
patterns-established:
  - "News detail state now lives on `/news?id=` instead of a separate detail route."
  - "Landing content modules can drive both route pages and section previews."
requirements-completed: [NEWS-01, NEWS-02, NEWS-03]
duration: session-local
completed: 2026-04-20
---

# Phase 04 Plan 01: News Parity Summary

**Landing News is now a real route experience instead of a placeholder, with shared local content, list filtering, search, detail rendering, and a deterministic return-to-list flow.**

## Performance

- **Duration:** session-local
- **Started:** session-local
- **Completed:** 2026-04-20T00:00:00+0800
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Added `landing/content/newsContent.ts` as the authoritative six-article News source with the locked category taxonomy.
- Replaced the News placeholder page with list, filter, search, empty-state, and `?id=` detail behavior.
- Rewired Home news preview to reuse the shared News dataset instead of keeping a second hardcoded article list.

## Task Commits

No git commits were created during this local autonomous execution pass; the work remains uncommitted in the current worktree.

## Files Created/Modified
- `landing/content/newsContent.ts` - shared local article dataset and category list for Phase 4 News parity
- `landing/assets.ts` - expanded news image registry for the six-article dataset
- `landing/pages/LandingNewsPage.tsx` - route-level News list/detail implementation with search params
- `landing/sections/home/HomeNewsPreview.tsx` - Home preview now reads from the shared News content module
- `landing/landing.css` - News toolbar, grid, detail, and empty-state styling

## Decisions Made

- Preserved `/entry-station/news` plus `?id=` as the only News contract rather than introducing `/news/:id`.
- Kept the search model intentionally client-side because Phase 4 scope is parity, not operations or content infrastructure.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None blocking. The shared content module made the preview/detail parity path cleaner than the original placeholder structure.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

The News route now exposes stable hooks and user-visible behavior for Phase 4 verification and for later runtime cutover parity checks.

---
*Phase: 04-news-interaction-equivalence*
*Completed: 2026-04-20*
