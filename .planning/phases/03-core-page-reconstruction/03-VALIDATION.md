---
phase: 3
slug: core-page-reconstruction
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-17
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `@playwright/test` for landing browser assertions plus Vite build checks |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npx playwright test tests/landing-routing.spec.ts tests/landing-core-pages.spec.ts` |
| **Estimated runtime** | ~75 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npx playwright test tests/landing-routing.spec.ts tests/landing-core-pages.spec.ts`
- **Before `$gsd-verify-work`:** Full suite must be green and desktop/mobile parity spot-checks must be recorded
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | HOME-01, ABOUT-02, PROD-03, FRAN-02 | build + static contract | `npm run build && rg -n "landing-shell|landing-nav|landing-footer" landing/ && rg -n "landing-page-home|landing-page-about|landing-page-products|landing-page-franchise" landing/pages/*.tsx` | ✅ existing | ✅ green |
| 03-02-01 | 02 | 2 | HOME-01 | browser content parity | `npx playwright test tests/landing-core-pages.spec.ts --grep "home page reconstruction"` | ✅ created | ✅ green |
| 03-02-02 | 02 | 2 | HOME-02 | browser CTA routing | `npx playwright test tests/landing-core-pages.spec.ts --grep "home CTA routes"` | ✅ created | ✅ green |
| 03-03-01 | 03 | 2 | ABOUT-01, ABOUT-02 | browser content parity | `npx playwright test tests/landing-core-pages.spec.ts --grep "about page reconstruction"` | ✅ created | ✅ green |
| 03-04-01 | 04 | 2 | PROD-01, PROD-02, PROD-03 | browser interaction + content parity | `npx playwright test tests/landing-core-pages.spec.ts --grep "products dual view"` | ✅ created | ✅ green |
| 03-05-01 | 05 | 2 | FRAN-01, FRAN-02, FRAN-03 | browser content parity + form UI | `npx playwright test tests/landing-core-pages.spec.ts --grep "franchise page reconstruction"` | ✅ created | ✅ green |
| 03-06-01 | 06 | 3 | HOME-01, HOME-02, ABOUT-01, ABOUT-02, PROD-01, PROD-02, PROD-03, FRAN-01, FRAN-02, FRAN-03 | regression suite | `npm run build && npx playwright test tests/landing-routing.spec.ts tests/landing-core-pages.spec.ts` | ✅ created | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `tests/landing-core-pages.spec.ts` — phase-specific browser assertions for Home/About/Products/Franchise content and interactions
- [x] Stable section/test markers or deterministic visible anchors on reconstructed core pages so browser assertions do not depend on fragile layout selectors
- [x] Route-aware CTA assertions for `/entry-station/products` and `/entry-station/franchise`

*Existing Playwright infrastructure is already installed; this phase only needs the phase-specific spec and stable anchors.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Home hero, photography, and section rhythm feel recognizably baseline-faithful on desktop and mobile | HOME-01 | Visual composition parity is broader than deterministic DOM assertions | Open `/entry-station` in desktop and narrow mobile widths, compare section order and visual emphasis against the approved baseline pack and Phase 1 UI-SPEC |
| About, Products, and Franchise preserve the expected information density and do not collapse into generic marketing cards | ABOUT-02, PROD-03, FRAN-02 | Structural fidelity can regress even when text anchors still exist | Open `/entry-station/about`, `/entry-station/products`, and `/entry-station/franchise`; verify grouped sections, major imagery, and content density remain page-specific |
| Products toggle and Franchise form/contact block feel usable after styling passes | PROD-02, FRAN-03 | Browser assertions can confirm state changes but not experiential clarity | Toggle between `核心产品` and `会员套餐`, then inspect the Franchise form at desktop and mobile widths to confirm labels, spacing, and CTA clarity |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or predeclared phase-spec dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Added phase-specific browser spec covers every Phase 3 requirement ID
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
