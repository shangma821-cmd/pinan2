---
phase: 02-react-landing-foundation-post-reset
plan: 01
subsystem: testing
tags: [react-router, playwright, vite, routing]
requires:
  - phase: 01-baseline-lock-shell-contract
    provides: Locked `/`, `/academy`, and `/entry-station/index.html` shell contract for Phase 2 routing work
provides:
  - Formal routing and browser-smoke dependencies for the landing route family
  - Preview-backed Playwright harness reserved for shell-ownership and five-route verification
affects: [02-02, 02-03, landing-routing, verification]
tech-stack:
  added: [react-router-dom, "@playwright/test"]
  patterns: [preview-backed route smoke harness, route-family verification skeleton]
key-files:
  created:
    - playwright.config.ts
    - tests/landing-routing.spec.ts
  modified:
    - package.json
    - package-lock.json
    - pnpm-lock.yaml
key-decisions:
  - "Use react-router-dom 7 as the formal landing route library for `/entry-station`."
  - "Back route smoke verification with `vite preview` at `127.0.0.1:4173` so later plans validate built behavior."
patterns-established:
  - "Reserve the exact Playwright test titles before shell/page work lands so later plans extend the same spec."
  - "Keep static `/entry-station/index.html` verification separate from React route-family verification."
requirements-completed: [SHELL-02]
duration: 3 min
completed: 2026-04-16
---

# Phase 02 Plan 01: Route Foundation Dependencies and Smoke Harness Summary

**Installed the formal landing router dependency and a preview-backed Playwright smoke scaffold for `/entry-station` route ownership verification.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-16T17:37:27Z
- **Completed:** 2026-04-16T17:40:43Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Added `react-router-dom` and `@playwright/test` plus a reusable `test:landing-routing` script.
- Synchronized both `package-lock.json` and `pnpm-lock.yaml` with the new routing and smoke-test dependency graph.
- Created a preview-backed Playwright config and reserved the exact Phase 2 smoke-test titles for later activation.

## Task Commits

Each task was committed atomically:

1. **Task 1: Install the routing and route-smoke dependencies** - `1b64fcd` (`chore`)
2. **Task 2: Create the preview-backed Playwright route smoke harness** - `689ee0c` (`test`)

## Files Created/Modified
- `package.json` - added the landing router dependency, Playwright test dependency, and the `test:landing-routing` script
- `package-lock.json` - recorded the npm dependency graph for the new routing and smoke-test packages
- `pnpm-lock.yaml` - synchronized the pnpm lockfile with the same dependency additions
- `playwright.config.ts` - configured preview-backed browser smoke execution at `127.0.0.1:4173`
- `tests/landing-routing.spec.ts` - reserved the exact Phase 2 route smoke cases with `test.fixme` placeholders

## Decisions Made

- Used `react-router-dom` declarative routing as the Phase 2 route foundation dependency so later plans can wire `basename="/entry-station"` directly.
- Pointed Playwright at `vite preview` instead of dev-only behavior so later route assertions validate built output and static/React coexistence.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The first executor handoff committed Task 1 but did not return a completion signal. Workspace spot-checks confirmed the dependency changes landed cleanly, so Task 2 was completed and verified locally without widening scope.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

The route-library dependency and browser-smoke scaffold are in place for `02-02` to hand `/entry-station*` to a dedicated React router without inventing new verification plumbing.

---
*Phase: 02-react-landing-foundation-post-reset*
*Completed: 2026-04-16*
