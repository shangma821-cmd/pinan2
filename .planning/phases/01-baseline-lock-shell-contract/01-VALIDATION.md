---
phase: 1
slug: baseline-lock-shell-contract
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-10
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | other — no dedicated test harness yet; build gate plus browser smoke |
| **Config file** | none — Wave 0 adds smoke harness only if planner chooses automation |
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
| 01-W0-01 | TBD | 0 | SHELL-01 | build + artifact check | `npm run build` | ❌ W0 | ⬜ pending |
| 01-W0-02 | TBD | 0 | SHELL-03 | manual smoke checklist | `npm run build` | ❌ W0 | ⬜ pending |
| 01-W0-03 | TBD | 0 | SHELL-01, SHELL-03 | provenance/doc audit | `npm run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `.planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md` — explicit manual smoke checklist for `/`, landing -> academy, and academy -> home
- [ ] `.planning/phases/01-baseline-lock-shell-contract/SOURCE-OF-TRUTH-INVENTORY.md` — canonical source matrix proving which files are truth vs glue
- [ ] Optional: `playwright.config.ts` — only if planner chooses to add a minimal browser smoke harness
- [ ] Optional: `tests/shell-contract.spec.ts` — only if planner chooses to automate the shell smoke path

*If no optional harness is added, the checklist artifact above is mandatory.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/` still loads the landing through the existing shell iframe | SHELL-01 | No browser test harness exists yet | Run `npm run build`, start the approved preview/dev flow, open `/`, confirm the iframe loads `/entry-station/index.html` content without public URL drift |
| Landing action can still reach academy inside the existing shell | SHELL-03 | Bridge internals are intentionally not locked and current flow is UI-driven | From the landing, trigger the academy entry path, confirm the shell lands on `/academy` and the academy app renders |
| Academy can return to the entry shell home state | SHELL-03 | Return behavior is a shell UX path, not currently covered by automation | From `/academy`, use the shell return action and confirm the app returns to the landing shell at `/` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
