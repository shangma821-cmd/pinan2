---
phase: 2
slug: react-landing-foundation-post-reset
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-16
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `@playwright/test` for route smoke checks plus existing Vite build gate |
| **Config file** | `playwright.config.ts` — Wave 0 creates |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npx playwright test tests/landing-routing.spec.ts` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npx playwright test tests/landing-routing.spec.ts`
- **Before `$gsd-verify-work`:** Full suite must be green and mobile/desktop shell layout must be manually spot-checked
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 0 | SHELL-02 | tooling setup | `test -f playwright.config.ts && test -f tests/landing-routing.spec.ts` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | SHELL-02 | build gate | `npm run build` | ✅ planned | ⬜ pending |
| 02-02-01 | 02 | 1 | SHELL-02 | shell path ownership | `npx playwright test tests/landing-routing.spec.ts --grep "entry-station shell ownership"` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | SHELL-02 | shared shell markers | `rg -n 'data-testid=\"landing-shell\"|data-testid=\"landing-nav\"|data-testid=\"landing-footer\"' landing/ EntryShell.tsx` | ✅ planned | ⬜ pending |
| 02-03-01 | 03 | 2 | SHELL-02 | five route direct-load smoke | `npx playwright test tests/landing-routing.spec.ts --grep "five landing routes"` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | SHELL-02 | static iframe target preserved | `curl -sf http://127.0.0.1:4173/entry-station/index.html | rg '<!doctype html>'` | ✅ preview | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `playwright.config.ts` — minimal browser smoke runner config
- [ ] `tests/landing-routing.spec.ts` — route ownership and direct-load smoke spec for `/entry-station` route family
- [ ] `package.json` includes a stable way to invoke the smoke suite, either via direct `npx playwright test` or a dedicated script
- [ ] Route shell markers exist for shared shell and each scaffold page so route smoke assertions are deterministic

*This phase needs a small Wave 0 because route ownership and refresh semantics are browser-level behaviors.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Shared landing shell looks structurally consistent on desktop and mobile viewport widths | SHELL-02 | Phase 2 only requires structural responsiveness, not full parity styling | Open `/entry-station`, `/entry-station/about`, and `/entry-station/news` in desktop and narrow mobile viewports; confirm shared nav/footer frame remains present and page scaffold identity remains clear |
| `/` still shows the iframe-based transitional runtime rather than the React route shell | SHELL-02 | Public `/` behavior is intentionally preserved and should be visually confirmed after shell arbitration changes | Open `/`, verify the iframe target remains `/entry-station/index.html`, then separately open `/entry-station` and confirm that route-family behavior is React-owned |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all missing route-smoke references
- [x] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
