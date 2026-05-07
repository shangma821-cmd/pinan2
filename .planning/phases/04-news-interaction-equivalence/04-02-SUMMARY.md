---
phase: 04-news-interaction-equivalence
plan: 02
subsystem: shell
tags: [theme, navigation, mobile, scroll]
requires: []
provides:
  - Landing-only theme persistence via `localStorage("theme")` and root `data-theme`
  - Scroll-reactive shared nav with visible day/night affordance
  - Mobile overlay navigation and footer back-to-top interaction
affects: [04-01, 04-03, 04-04, landing-shell]
tech-stack:
  added: []
  patterns: [landing-scoped context provider, root theme attribute, deterministic shell test hooks]
key-files:
  created:
    - landing/contexts/LandingThemeContext.tsx
  modified:
    - landing/LandingApp.tsx
    - landing/components/LandingShell.tsx
    - landing/components/LandingNav.tsx
    - landing/components/LandingFooter.tsx
    - landing/landing.css
key-decisions:
  - "Keep theme state inside landing-only context so academy runtime does not inherit landing presentation logic."
  - "Expose visible day/night copy and sun/moon affordance instead of an icon-only toggle because the Phase 4 context locks that UX contract."
patterns-established:
  - "Shared landing shell now owns cross-page UI behavior through a local provider plus deterministic DOM state hooks."
  - "Scroll-reactive shell state is represented as `data-scrolled` and `landing-nav--scrolled`, making it browser-testable."
requirements-completed: [XPG-01, XPG-02]
duration: session-local
completed: 2026-04-20
---

# Phase 04 Plan 02: Shared Shell Interaction Summary

**The React landing shell now owns the theme, scroll-reactive navigation, mobile overlay menu, and back-to-top behavior that previously remained outside the restored route family.**

## Performance

- **Duration:** session-local
- **Started:** session-local
- **Completed:** 2026-04-20T00:00:00+0800
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Added a landing-scoped theme provider and wired it into `LandingApp`.
- Upgraded the shared nav with scroll state, visible theme affordance, mobile menu toggle, and overlay menu.
- Added a footer-level back-to-top control and fixed landing document scrolling so window-level scroll state is real and testable.

## Task Commits

No git commits were created during this local autonomous execution pass; the work remains uncommitted in the current worktree.

## Files Created/Modified
- `landing/contexts/LandingThemeContext.tsx` - landing-only theme state and persistence contract
- `landing/LandingApp.tsx` - wraps landing routes with the theme provider
- `landing/components/LandingShell.tsx` - simplified shell wrappers around the upgraded nav/footer contracts
- `landing/components/LandingNav.tsx` - theme toggle, mobile overlay navigation, and scroll-reactive state
- `landing/components/LandingFooter.tsx` - footer back-to-top affordance
- `landing/landing.css` - theme tokens, nav/menu states, back-to-top styling, and landing scroll-host fixes

## Decisions Made

- Kept the theme contract on the exact `theme` storage key and `data-theme` root attribute to match the approved baseline behavior.
- Fixed landing scroll at the document host level rather than moving shell behavior to an inner scrolling container, because Phase 4 cross-page interactions are defined around window scrolling.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The first browser pass revealed that the landing content visually extended but `window.scrollY` stayed pinned at `0` because global height constraints kept the document at viewport height. Overriding the landing host height back to auto resolved the real scroll-reactive behavior and made the test contract valid.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

The shared shell is now capable of surviving Phase 5 cutover because cross-page behavior no longer depends on the transitional runtime path.

---
*Phase: 04-news-interaction-equivalence*
*Completed: 2026-04-20*
