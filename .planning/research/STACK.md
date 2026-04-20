# Stack Research

**Domain:** Pixel-perfect CSS visual compliance for React landing app
**Researched:** 2026-04-20
**Milestone:** v1.1 — additive to v1.0 validated stack (React 19 + Vite 6 + TypeScript)
**Confidence:** HIGH — findings grounded in direct baseline CSS inspection and existing installed tooling

## Context

The v1.0 stack research established that no new framework or styling system is needed. This research answers the narrower v1.1 question: what tooling additions (if any) enable pixel-perfect CSS compliance against the `7be7097^` baseline.

**Baseline fingerprint (from direct CSS inspection of `index-DuxCbJQB.css`, 105KB):**
- Fonts: Inter (9 weights) + Montserrat (9 weights) via Google Fonts CDN
- Dark-first default: `:root` block defines dark values (`--bg-primary: #050a05`, `--text-primary: #ffffff`)
- CSS variable naming: unprefixed (`--brand-green`, `--bg-primary`, `--glass-bg`, `--glow-color`)
- Utility classes: `.glass-effect`, `.text-gradient`, `.shadow-glow`
- Keyframes: `float`, `float-slow`, `float-medium`, `float-fast`, `float-slow-reverse`, `marquee`, `pulse-glow` (two definitions — see pitfalls), `pulse`, `bounce`, `spin`, `enter`, `exit`, `accordion-down`, `accordion-up`, `caret-blink`
- No `.dark` class toggle, no `prefers-color-scheme` media query found — dark is the default `:root` state

---

## Recommended Stack Additions

### npm Dependencies to Add

| Package | Version | Purpose | Why This Solves the Problem |
|---------|---------|---------|----------------------------|
| `@fontsource/inter` | `^5.2.5` | Self-hosted Inter font | Eliminates Google Fonts CDN variability: CDN serves different font binaries by user-agent, causing subtle metric differences that break pixel compliance. Self-hosting pins the exact binary. |
| `@fontsource/montserrat` | `^5.2.5` | Self-hosted Montserrat font | Same rationale as Inter. Baseline uses weights 100–900 for both families. Self-hosting ensures rendering identity across environments. |

### Dev Dependencies to Add

| Package | Version | Purpose | Why This Solves the Problem |
|---------|---------|---------|----------------------------|
| None | — | Playwright 1.59.1 already installed | `toHaveScreenshot()` is built into `@playwright/test` — no additional visual regression package needed. |

**Net result: 2 new npm dependencies (`@fontsource/inter`, `@fontsource/montserrat`). Everything else is CSS authoring work.**

---

## Installation

```bash
# Self-hosted fonts (required for stable pixel compliance)
npm install @fontsource/inter @fontsource/montserrat
```

---

## Visual Regression Testing: Use Playwright Built-in

`@playwright/test` 1.59.1 (already installed) includes `toHaveScreenshot()` for screenshot comparison. No additional tool needed.

**Recommended configuration approach:**

```typescript
// playwright.config.ts — add visual comparison config
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:4173',
  },
  // Snapshot tolerance for anti-aliasing differences across OS/renderer
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,  // 1% pixel difference tolerance
      threshold: 0.2,            // per-pixel color channel threshold
    },
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
  },
});
```

**Golden screenshot workflow:**
1. Serve the immutable baseline (`Kimi_Agent_Deployment_v14`) as a static HTTP server on a separate port
2. Capture baseline screenshots with `toHaveScreenshot()` — these become the goldens stored in `tests/__snapshots__/`
3. Compare React output against those goldens in CI
4. Use `--update-snapshots` flag only when intentionally approving visual changes

**Why not exact pixel match:** Anti-aliasing and sub-pixel rendering differ between macOS/Linux and across Chrome versions. `maxDiffPixelRatio: 0.01` catches real regressions while ignoring renderer noise.

---

## Font Loading Strategy

### Replace Google Fonts CDN with self-hosted @fontsource

**Current landing.css (problematic):**
```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Noto+Sans+SC:wght@400;500;700;900&display=swap');
```

**Target (pixel-stable):**
```css
/* landing.css */
@import '@fontsource/inter/100.css';
@import '@fontsource/inter/200.css';
@import '@fontsource/inter/300.css';
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/inter/700.css';
@import '@fontsource/inter/800.css';
@import '@fontsource/inter/900.css';
@import '@fontsource/montserrat/400.css';
@import '@fontsource/montserrat/500.css';
@import '@fontsource/montserrat/600.css';
@import '@fontsource/montserrat/700.css';
@import '@fontsource/montserrat/800.css';
@import '@fontsource/montserrat/900.css';
```

Vite handles `@fontsource` CSS imports and font file resolution natively — no config change needed.

**Remove:** `Noto Sans SC` — not present in baseline, is a compliance deviation.

---

## CSS Variable System

### Alignment with Baseline

The current `landing.css` uses `--landing-` prefixed variables. The baseline uses unprefixed names. The recommended approach is to **drop the `--landing-` prefix** to match baseline exactly, since this milestone targets pixel compliance against that baseline.

**Baseline `:root` (dark-first defaults, direct inspection):**
```css
:root {
  --background: hsl(120 30% 5%);
  --foreground: hsl(0 0% 98%);
  --brand-green: #7a9e7a;
  --brand-dark: #0d2610;
  --brand-light: #d1e0d1;
  --brand-accent: #4a7c4e;
  --bg-primary: #050a05;
  --bg-secondary: #0a150a;
  --bg-card: rgba(0, 0, 0, 0.3);
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --text-muted: #6b7280;
  --border-color: rgba(122, 158, 122, 0.2);
  --glow-color: rgba(122, 158, 122, 0.3);
  --glass-bg: rgba(0, 0, 0, 0.3);
  --radius: 0.625rem;
}
```

**Note:** Baseline `:root` defines dark values as defaults. Light mode, if present, requires investigation of the baseline JS to determine how it is triggered (class toggle or not).

---

## Animation Strategy: Pure CSS, No Library

All 15 baseline keyframes are pure CSS transforms/opacity. No animation library is needed.

**Keyframes to transcribe into `landing.css`:**

```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes float-slow {
  0%, 100% { transform: translate(0) scale(1); }
  25% { transform: translate(30px, -20px) scale(1.05); }
  50% { transform: translate(-10px, 30px) scale(0.95); }
  75% { transform: translate(-20px, -10px) scale(1.02); }
}

@keyframes float-medium {
  0%, 100% { transform: translate(0) scale(1); }
  33% { transform: translate(-25px, 20px) scale(1.08); }
  66% { transform: translate(15px, -25px) scale(0.92); }
}

@keyframes float-fast {
  0%, 100% { transform: translate(0) scale(1); }
  50% { transform: translate(20px, -30px) scale(1.1); }
}

@keyframes float-slow-reverse {
  0%, 100% { transform: translate(0) scale(1); }
  25% { transform: translate(-30px, 20px) scale(1.05); }
  50% { transform: translate(10px, -30px) scale(0.95); }
  75% { transform: translate(20px, 10px) scale(1.02); }
}

@keyframes marquee {
  0% { transform: translate(0); }
  100% { transform: translate(-50%); }
}

/* pulse-glow: use the box-shadow variant (second definition wins in baseline cascade) */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(122, 158, 122, 0.3); }
  50% { box-shadow: 0 0 40px rgba(122, 158, 122, 0.6); }
}
```

---

## Utility Classes to Add

```css
.glass-effect {
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
}

.text-gradient {
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  background-image: linear-gradient(135deg, var(--brand-green) 0%, var(--brand-accent) 50%, var(--brand-green) 100%);
  background-size: 200% 200%;
}

.shadow-glow {
  box-shadow: 0 0 20px var(--glow-color);
}
```

---

## What NOT to Add

| Avoid | Why | What to Use Instead |
|-------|-----|---------------------|
| Tailwind CSS | Explicit project constraint; would introduce a second styling system for one landing | Hand-written CSS variables matching baseline |
| Framer Motion / GSAP / AOS | All 15 baseline animations are pure CSS keyframes — a JS animation library adds runtime weight with zero compliance benefit | CSS `@keyframes` + `animation` property |
| BackstopJS / Percy / Chromatic | Commercial or complex setups for visual regression; Playwright 1.59.1 already provides `toHaveScreenshot()` | `expect(page).toHaveScreenshot()` |
| CSS-in-JS (styled-components, emotion) | Incompatible direction with current hand-written CSS approach; adds runtime overhead | Plain CSS in `landing.css` |
| CSS Modules migration | Out of scope for v1.1; current flat CSS works; migration would change component authoring without compliance benefit | Keep current `landing.css` import pattern |
| Storybook | Overkill for static landing visual verification when Playwright E2E screenshots suffice | Playwright screenshot comparison |
| Google Fonts CDN import | CDN serves different font binaries by user-agent — causes subtle metric variations that break pixel compliance across environments | `@fontsource/inter` + `@fontsource/montserrat` (self-hosted) |
| Noto Sans SC | Not in baseline; currently imported in `landing.css` — a visual deviation, not an addition | Remove entirely |

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| `@fontsource` self-hosted | Google Fonts CDN | CDN is environment-variable (network, user-agent affects served binary); `@fontsource` pins the exact font file for reproducible rendering |
| Playwright `toHaveScreenshot()` | BackstopJS | BackstopJS requires separate config, puppeteer setup, Docker for CI consistency; Playwright is already in the project and integrates with existing test suite |
| Playwright `toHaveScreenshot()` | Percy / Chromatic | Commercial SaaS with per-screenshot pricing; overkill for a project with a static reference baseline that can run locally |
| Pure CSS keyframes | Framer Motion | The compliance target IS the keyframe CSS — transcribing to a JS animation abstraction moves away from the source truth, not toward it |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `@fontsource/inter@^5.2.5` | Vite 6, React 19 | CSS imports handled natively by Vite; no config required |
| `@fontsource/montserrat@^5.2.5` | Vite 6, React 19 | Same as Inter |
| `@playwright/test@1.59.1` (existing) | `toHaveScreenshot()` | Built in since Playwright 1.23; threshold config available in `expect.toHaveScreenshot` block |

---

## Sources

- Direct baseline CSS inspection: `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/assets/index-DuxCbJQB.css`
  - Keyframes extracted: `float`, `float-slow`, `float-medium`, `float-fast`, `float-slow-reverse`, `marquee`, `pulse-glow` (×2), `pulse`, `bounce`, `spin`, `enter`, `exit`, `accordion-down`, `accordion-up`, `caret-blink`
  - Font import confirmed: `Inter` + `Montserrat` (weights 100–900), Google Fonts CDN
  - `:root` block confirmed dark-first variable values
  - Utility classes confirmed: `.glass-effect`, `.text-gradient`, `.shadow-glow`
- Playwright visual comparisons: https://playwright.dev/docs/screenshots — HIGH confidence (official docs)
- `@fontsource` project: https://fontsource.org — MEDIUM confidence (official docs; packages maintained by community with strong adoption)
- Existing project `package.json` and `playwright.config.ts` — HIGH confidence (direct inspection)

---

*Stack research for: v1.1 pixel-perfect CSS visual compliance*
*Researched: 2026-04-20*
