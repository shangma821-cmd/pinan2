---
phase: 01-baseline-lock-shell-contract
plan: 03
subsystem: ui
tags: [shell, smoke, verification, runtime-reset]
requires:
  - phase: 01-baseline-lock-shell-contract
    provides: Runtime reset and corrected planning truth
provides:
  - Fresh build evidence for `dist/entry-station/index.html`
  - Human-approved shell smoke results for `/`, landing -> academy, and academy -> `/`
  - Final checklist record for Phase 1 shell revalidation on restored runtime
affects: [Phase 2, Phase 5]
tech-stack:
  added: []
  patterns: [shell-smoke-evidence, restored-runtime-verification]
key-files:
  created:
    - .planning/phases/01-baseline-lock-shell-contract/01-03-SUMMARY.md
  modified:
    - .planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md
key-decisions:
  - "Phase 1 shell evidence must be recorded only after the restored `public/entry-station/**` runtime is active again."
  - "Manual smoke approval is the gate that closes Runtime Reset & Shell Revalidation."
patterns-established:
  - "Checklist verification lines stay `PENDING` until both automated build checks and human smoke approval are complete."
  - "Shell smoke for this milestone is always performed against `/` with the shell iframe, not by testing isolated landing files only."
requirements-completed: [SHELL-01, SHELL-03]
duration: 15min
completed: 2026-04-14
---

# Phase 1: Runtime Reset & Shell Revalidation Summary

**Restored `/entry-station` runtime verified through fresh build evidence and approved shell smoke**

## Performance

- **Duration:** 15 min
- **Started:** 2026-04-14T15:05:00+08:00
- **Completed:** 2026-04-14T15:19:17+08:00
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- Rebuilt the app after the `/entry-station` runtime was reset back to `public/entry-station/**`.
- Confirmed `dist/entry-station/index.html` exists and again contains the `OPEN_AI_ACADEMY` / `__openAiAcademy` bridge wiring required for shell handoff.
- Started a local preview on `http://127.0.0.1:4273/` and recorded the live listener PID in the shell checklist.
- Recorded human-approved smoke results for `/`, landing -> academy, and academy -> `/`.

## Files Created/Modified

- `.planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md` - Final automated and manual shell verification record
- `.planning/phases/01-baseline-lock-shell-contract/01-03-SUMMARY.md` - Execution summary for restored-runtime shell revalidation

## Decisions Made

- Treated the restored `public/entry-station/**` delivery path as the only valid runtime for Phase 1 smoke verification.
- Closed Phase 1 only after manual smoke approval was explicitly recorded, not just after build/preview automation passed.

## Deviations from Plan

None - plan executed against the corrected runtime-reset sequence.

## Issues Encountered

- The earlier Vite remap path had hidden the academy wrapper bridge; Phase 1 verification was rerun only after that runtime ownership was corrected.

## User Setup Required

None - human review was completed through the local preview URL only.

## Next Phase Readiness

- Phase 1 now has complete shell evidence on the restored runtime, including approved manual smoke results.
- Phase 2 can proceed on top of a verified `/entry-station` contract and corrected source-of-truth documentation.

---
*Phase: 01-baseline-lock-shell-contract*
*Completed: 2026-04-14*
