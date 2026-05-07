---
phase: 02-react-landing-foundation-post-reset
plan: 02
subsystem: ui
tags: [react-router, entry-shell, routing, landing]
requires:
  - phase: 02-react-landing-foundation-post-reset
    provides: Route dependency and Playwright smoke harness from 02-01
provides:
  - Centralized metadata for the five scoped landing destinations
  - A dedicated BrowserRouter bootstrap under `/entry-station`
  - Explicit shell ownership for `/entry-station*` without disturbing `/` or `/academy`
affects: [02-03, entry-shell, landing-router]
tech-stack:
  added: []
  patterns: [tri-mode entry shell, basename-scoped landing router, centralized route metadata]
key-files:
  created:
    - landing/routeMetadata.ts
    - landing/LandingApp.tsx
    - landing/routes.tsx
  modified:
    - EntryShell.tsx
key-decisions:
  - "Scope the landing router with `basename=\"/entry-station\"` instead of adding a new public prefix."
  - "Treat `/entry-station` and `/entry-station/*` as shell-owned landing mode while preserving `/` and `/academy` contracts."
patterns-established:
  - "Landing route labels and paths now live in one metadata table for nav, page identity, and smoke assertions."
  - "EntryShell derives mode from pathname on every popstate so browser navigation stays authoritative."
requirements-completed: [SHELL-02]
duration: 1 min
completed: 2026-04-16
---

# Phase 02 Plan 02: Shell Handoff and Router Bootstrap Summary

**Handed `/entry-station*` to a dedicated React landing router while preserving the iframe home path and academy bridge behavior.**

## Performance

- **Duration:** 1 min
- **Started:** 2026-04-16T17:46:03Z
- **Completed:** 2026-04-16T17:47:31Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Added a single route metadata contract covering the five scoped landing destinations and stable page keys.
- Bootstrapped a dedicated `BrowserRouter` under `basename="/entry-station"` with stable page markers for each destination.
- Promoted `EntryShell` from two modes to explicit `home`, `landing`, and `academy` path ownership without changing the iframe target or academy messaging bridge.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add a centralized landing route contract** - `e2daf6e` (`feat`)
2. **Task 2: Create the dedicated landing app and router bootstrap** - `3d72e40` (`feat`)
3. **Task 3: Promote EntryShell to tri-mode path ownership** - `0088074` (`feat`)

## Files Created/Modified
- `landing/routeMetadata.ts` - defines the five Phase 2 landing destinations and stable page keys
- `landing/LandingApp.tsx` - mounts the landing route tree inside a `BrowserRouter` scoped to `/entry-station`
- `landing/routes.tsx` - renders the placeholder landing route tree and stable page markers for each destination
- `EntryShell.tsx` - routes `/`, `/entry-station*`, and `/academy` into explicit shell modes while preserving existing home and academy behavior

## Decisions Made

- Used a basename-scoped router instead of inventing a second landing prefix, keeping the public route family aligned with the stable `/entry-station` contract.
- Kept path ownership in `EntryShell` rather than pushing shell arbitration into page components, so direct loads and back/forward navigation stay centralized.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Wave 2 can now replace the placeholder route nodes with a shared landing shell, five scaffold pages, and active Playwright assertions on the real `/entry-station` route family.

---
*Phase: 02-react-landing-foundation-post-reset*
*Completed: 2026-04-16*
