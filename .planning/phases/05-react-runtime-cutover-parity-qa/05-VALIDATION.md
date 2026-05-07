---
phase: 5
slug: react-runtime-cutover-parity-qa
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-20
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `@playwright/test` for shell/direct parity plus Vite build checks |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npx playwright test tests/landing-routing.spec.ts tests/landing-core-pages.spec.ts tests/landing-news-interactions.spec.ts tests/landing-cutover.spec.ts` |
| **Estimated runtime** | ~95 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run the full suite command above
- **Before final verification:** Full suite must be green
- **Max feedback latency:** 100 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | XPG-03 | build + static contract | `npm run build && rg -n \"src=\\\"/entry-station\\\"|data-testid=\\\"entry-shell-landing-frame\\\"\" EntryShell.tsx && rg -n \"from '../public/entry-station/|from \\\"../public/entry-station/\" landing/assets.ts` | ✅ planned | ⬜ pending |
| 05-02-01 | 02 | 2 | XPG-03 | browser cutover parity | `npm run build && npx playwright test tests/landing-cutover.spec.ts` | ✅ planned | ⬜ pending |
| 05-02-02 | 02 | 2 | XPG-03 + regression safety | full browser regression | `npm run build && npx playwright test tests/landing-routing.spec.ts tests/landing-core-pages.spec.ts tests/landing-news-interactions.spec.ts tests/landing-cutover.spec.ts` | ✅ existing | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Existing preview-backed Playwright harness is already present
- [x] Existing landing regression suite already covers pre-cutover behavior and can detect regressions
- [x] Phase 5 only needs one incremental cutover spec rather than new infrastructure

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/` shell iframe and direct `/entry-station` feel visually equivalent after cutover | XPG-03 | Automation can prove route/runtime ownership, but not full visual sameness | Open `/` and `/entry-station` on desktop and mobile widths and confirm the framed landing and direct landing feel equivalent |

---

## Validation Sign-Off

- [x] All tasks have automated verification
- [x] Sampling continuity preserved across waves
- [x] Existing Wave 0/browser harness is sufficient
- [x] No watch-mode flags
- [x] Feedback latency < 100s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
