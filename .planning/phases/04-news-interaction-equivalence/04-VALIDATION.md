---
phase: 4
slug: news-interaction-equivalence
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-20
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `@playwright/test` for landing browser assertions plus Vite build checks |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npx playwright test tests/landing-routing.spec.ts tests/landing-core-pages.spec.ts tests/landing-news-interactions.spec.ts` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npx playwright test tests/landing-routing.spec.ts tests/landing-core-pages.spec.ts tests/landing-news-interactions.spec.ts`
- **Before `$gsd-verify-work`:** Full suite must be green and mobile/desktop visual spot-checks for nav/theme/news detail must be recorded
- **Max feedback latency:** 100 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-02-01 | 02 | 1 | XPG-01 | build + static contract | `npm run build && rg -n "localStorage.getItem\\('theme'\\)|localStorage.setItem\\('theme'\\)|setAttribute\\('data-theme'|日间模式|夜间模式|☀|☾" landing/contexts/LandingThemeContext.tsx landing/components/LandingNav.tsx` | ✅ existing | ⬜ pending |
| 04-02-02 | 02 | 1 | XPG-02 | build + static contract | `npm run build && rg -n "window.scrollY > 50|data-scrolled|landing-nav--scrolled|landing-mobile-menu|landing-back-to-top" landing/components/LandingNav.tsx landing/components/LandingFooter.tsx landing/landing.css` | ✅ existing | ⬜ pending |
| 04-01-01 | 01 | 2 | NEWS-01, NEWS-02 | build + static contract | `npm run build && rg -n "landingNewsArticles|landingNewsCategories|细胞修复技术突破性研究|没有找到相关资讯" landing/content/newsContent.ts landing/pages/LandingNewsPage.tsx` | ✅ planned | ⬜ pending |
| 04-01-02 | 01 | 2 | NEWS-03 | build + static contract | `npm run build && rg -n "useSearchParams|news-detail-view|news-return-button|/news\\?id=" landing/pages/LandingNewsPage.tsx landing/sections/home/HomeNewsPreview.tsx` | ✅ planned | ⬜ pending |
| 04-03-01 | 03 | 3 | HOME-03 | build + static contract | `npm run build && rg -n "IntersectionObserver|home-results-stat-users|data-testid=\\\"home-process-step-|data-testid=\\\"home-advantages-item-" landing/sections/home/HomeResults.tsx landing/sections/home/HomeProcess.tsx landing/sections/home/HomeAdvantages.tsx` | ✅ planned | ⬜ pending |
| 04-04-01 | 04 | 4 | HOME-03, NEWS-01, NEWS-02, NEWS-03, XPG-01, XPG-02 | full regression suite | `npm run build && npx playwright test tests/landing-routing.spec.ts tests/landing-core-pages.spec.ts tests/landing-news-interactions.spec.ts` | ❌ W4 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Existing `playwright.config.ts` already provides the preview-backed browser harness
- [x] Existing `tests/landing-routing.spec.ts` and `tests/landing-core-pages.spec.ts` provide the baseline landing smoke framework before Phase 4-specific assertions land
- [x] Early-wave tasks rely on build + static-contract verification; the dedicated Phase 4 browser spec is intentionally introduced in Plan 04

*No additional Wave 0 file creation is required because the browser harness already exists and earlier waves have deterministic build/static checks.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Desktop and mobile nav feel baseline-faithful during transparent-to-blur transition | XPG-02 | Blur strength, spacing, and overlay feel are difficult to encode fully in deterministic assertions | Open `/entry-station` and `/entry-station/news` at desktop and narrow mobile widths; confirm nav starts transparent, becomes elevated after scrolling, and mobile overlay appears as a floating rounded panel rather than a generic drawer |
| Light/dark theme surfaces remain coherent across Home and News list/detail states | XPG-01, NEWS-01, NEWS-03 | Automation can verify persistence but not full aesthetic consistency | Toggle theme on Home, navigate to News list and detail, reload, and visually confirm tokens, contrast, and imagery overlays remain legible in both themes |
| Home results counters feel like progressive enhancement rather than layout-breaking animation | HOME-03 | Browser assertions can verify end state more easily than the qualitative feel of motion | Visit Home in normal and reduced-motion environments, confirm counters remain readable, do not jump layout unexpectedly, and still land on the expected values |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or existing infrastructure dependencies
- [x] Sampling continuity: every plan wave has automated verification before proceeding
- [x] Wave 0 requirements are satisfied by the existing browser harness
- [x] No watch-mode flags
- [x] Feedback latency < 100s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
