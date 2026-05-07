---
phase: 1
slug: baseline-lock-shell-contract
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-10
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | other — no dedicated test harness yet; build gate plus browser smoke |
| **Config file** | none — existing `npm run build` and `npm run preview` scripts cover the phase |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build`
- **Before `$gsd-verify-work`:** Build must be green and shell smoke must be rechecked manually
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | SHELL-01, SHELL-03 | baseline archive parity | `git archive ... && diff -qr ... && cmp -s ...` | ✅ planned | ⬜ pending |
| 01-01-02 | 01 | 1 | SHELL-01, SHELL-03 | provenance/doc audit | `rg -n "Source ref: 7be7097^" .planning/baselines/.../README.md && ...` | ✅ planned | ⬜ pending |
| 01-02-01 | 02 | 2 | SHELL-01, SHELL-03 | checklist doc audit | `rg -n "EntryShell.tsx" SHELL-CONTRACT-CHECKLIST.md && ...` | ✅ planned | ⬜ pending |
| 01-02-02 | 02 | 2 | SHELL-01, SHELL-03 | source-truth inventory audit | `rg -n "EntryShell.tsx" SOURCE-OF-TRUTH-INVENTORY.md && ...` | ✅ planned | ⬜ pending |
| 01-03-01 | 03 | 3 | SHELL-01 | build + guarded preview gate | `npm run build && test -f dist/entry-station/index.html && kill -0 "$PREVIEW_PID" && lsof -ti tcp:4273 | grep -qx "$PREVIEW_PID" && curl -sfI http://127.0.0.1:4273/entry-station/index.html` | ✅ planned | ⬜ pending |
| 01-03-CHK | 03 | 3 | SHELL-01, SHELL-03 | human smoke checkpoint linked to guarded preview | `test -f dist/entry-station/index.html && kill -0 "$PREVIEW_PID" && lsof -ti tcp:4273 | grep -qx "$PREVIEW_PID"` | ✅ planned | ⬜ pending |
| 01-03-02 | 03 | 3 | SHELL-03 | manual approval record audit | `rg -n "Manual pass: /: PASS (approved)" SHELL-CONTRACT-CHECKLIST.md && ...` | ✅ planned | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Existing `npm run build` and `npm run preview` scripts cover the automation needs for this phase
- [x] Every planned task now carries an explicit `<automated>` command or consumes a build-gated dependency
- [x] `.planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md` and `SOURCE-OF-TRUTH-INVENTORY.md` are planned execution artifacts in Plan 02, not separate Wave 0 infrastructure
- [ ] Optional: `playwright.config.ts` — deferred, not required for Phase 1
- [ ] Optional: `tests/shell-contract.spec.ts` — deferred, not required for Phase 1

*No standalone Wave 0 plan is required for Phase 1.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/` still loads the landing through the existing shell iframe | SHELL-01 | No browser test harness exists yet | After Plan 03 starts preview at `http://127.0.0.1:4273` and confirms the recorded PID owns port `4273`, open `/`, confirm the iframe loads `/entry-station/index.html` content without public URL drift, then approve the checkpoint |
| Landing action can still reach academy inside the existing shell | SHELL-03 | Bridge internals are intentionally not locked and current flow is UI-driven | From the landing in the guarded preview flow, trigger the academy entry path, confirm the shell lands on `/academy`, then approve the checkpoint |
| Academy can return to the entry shell home state | SHELL-03 | Return behavior is a shell UX path, not currently covered by automation | From `/academy`, use the shell return action and confirm the app returns to the landing shell at `/`, then approve the checkpoint |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-10
