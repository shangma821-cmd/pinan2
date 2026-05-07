---
phase: 01-baseline-lock-shell-contract
plan: 02
subsystem: ui
tags: [shell, contract, inventory, routing]
requires:
  - phase: 01-baseline-lock-shell-contract
    provides: Baseline reference pack and manifest from Plan 01
provides:
  - Shell behavior checklist for `/`, `/academy`, and return flow
  - Source-of-truth inventory mapping baseline, runtime, shell, and legacy glue
affects: [Phase 3, Phase 4, Phase 5]
tech-stack:
  added: []
  patterns: [shell-contract-checklist, source-of-truth-matrix]
key-files:
  created:
    - .planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md
    - .planning/phases/01-baseline-lock-shell-contract/SOURCE-OF-TRUTH-INVENTORY.md
  modified: []
key-decisions:
  - "Freeze only user-visible shell behavior, not bridge globals or wrapper-specific selectors."
  - "Treat `public/entry-station/**` as glue/reference only, never as canonical landing content."
patterns-established:
  - "Shell contract docs must point back to `EntryShell.tsx` and `vite.config.ts`."
  - "Source-of-truth matrices should separate immutable review truth from transitional runtime truth."
requirements-completed: [SHELL-01, SHELL-03]
duration: 10min
completed: 2026-04-10
---

# Phase 1: Baseline Lock & Shell Contract Summary

**Reviewer-readable shell contract and source-of-truth matrix for the restored landing boundary**

## Performance

- **Duration:** 10 min
- **Started:** 2026-04-10T07:34:30Z
- **Completed:** 2026-04-10T07:36:17Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Documented the locked shell behavior for `/`, landing -> academy, and academy -> `/`.
- Recorded which files are canonical truth for baseline review, transitional runtime content, shell behavior, and legacy glue.
- Captured the exact three-file drift between the approved baseline and the mutable runtime landing tree.

## Files Created/Modified

- `.planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md` - Locked external shell contract plus verification placeholders
- `.planning/phases/01-baseline-lock-shell-contract/SOURCE-OF-TRUTH-INVENTORY.md` - Canonical/non-canonical source matrix and drift inventory

## Decisions Made

- Kept `window.__openAiAcademy`, `OPEN_AI_ACADEMY`, and wrapper DOM hooks explicitly out of the public contract.
- Anchored shell behavior to `EntryShell.tsx` and `vite.config.ts`, not to the mutable landing bundle or legacy wrapper.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 1 now has both the immutable baseline pack and the written shell/source-of-truth contract.
- Plan 03 can proceed to build, preview, and human smoke verification against these artifacts.

---
*Phase: 01-baseline-lock-shell-contract*
*Completed: 2026-04-10*
