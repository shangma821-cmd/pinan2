---
phase: 01-baseline-lock-shell-contract
plan: 01
subsystem: ui
tags: [baseline, git, parity, landing]
requires: []
provides:
  - Git-pinned baseline pack extracted from `7be7097^`
  - Tree manifest for the approved `Kimi_Agent_Deployment_v14/**` baseline
  - Provenance README marking the pack as non-runtime review material
affects: [Phase 2, Phase 3, Phase 4, Phase 5]
tech-stack:
  added: []
  patterns: [git-pinned-baseline-pack]
key-files:
  created:
    - .planning/baselines/kimi-landing-7be7097-parent/README.md
    - .planning/baselines/kimi-landing-7be7097-parent/TREE-SHA1.txt
    - .planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/index.html
  modified: []
key-decisions:
  - "Freeze the approved landing baseline from `7be7097^` via `git archive`, not by copying the mutable working tree."
  - "Treat the extracted baseline pack as review-only evidence, never as a served `/entry-station` runtime."
patterns-established:
  - "Baseline parity is proven with fresh `git archive` diff plus `git ls-tree` manifest comparison."
  - "Phase summaries can point later reconstruction work at immutable review assets under `.planning/baselines/`."
requirements-completed: [SHELL-01, SHELL-03]
duration: 15min
completed: 2026-04-10
---

# Phase 1: Baseline Lock & Shell Contract Summary

**Git-extracted `7be7097^` landing baseline with provenance and exact tree parity proof**

## Performance

- **Duration:** 15 min
- **Started:** 2026-04-10T07:19:00Z
- **Completed:** 2026-04-10T07:34:06Z
- **Tasks:** 2
- **Files modified:** 3 top-level baseline artifacts plus the extracted 38-file pack

## Accomplishments

- Extracted the approved `7be7097^:Kimi_Agent_Deployment_v14/**` tree into `.planning/baselines/kimi-landing-7be7097-parent/`.
- Recorded the authoritative `git ls-tree` manifest in `TREE-SHA1.txt`.
- Wrote a provenance README that pins the source ref, source commit, extraction commands, and current three-file drift from the mutable runtime tree.

## Files Created/Modified

- `.planning/baselines/kimi-landing-7be7097-parent/README.md` - Provenance, non-runtime guardrails, and drift inventory
- `.planning/baselines/kimi-landing-7be7097-parent/TREE-SHA1.txt` - Git tree manifest for the approved baseline
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/**` - Frozen 38-file landing reference pack

## Decisions Made

- Used git object extraction (`git archive`) instead of current working-tree files to prevent baseline drift.
- Kept the baseline pack under `.planning/baselines/` so later phases can reference it without confusing it for runtime output.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The immutable baseline pack is now available for shell-contract and parity documentation.
- Phase 1 Plan 02 can reference the pack directly when writing the shell checklist and source-of-truth inventory.

---
*Phase: 01-baseline-lock-shell-contract*
*Completed: 2026-04-10*
