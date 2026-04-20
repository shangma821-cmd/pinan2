# Architecture Research

**Domain:** CSS visual compliance — pixel-perfect React landing match against minified Tailwind baseline
**Researched:** 2026-04-20
**Confidence:** HIGH (derived directly from baseline source inspection and existing codebase audit)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      LandingApp.tsx                             │
│  import './landing.css'  <-- single CSS entry point             │
│  <LandingThemeProvider>  <-- sets data-theme on <html>          │
│    <BrowserRouter>                                              │
│      <LandingRoutes> -> <LandingShell> -> pages/sections        │
│    </BrowserRouter>                                             │
│  </LandingThemeProvider>                                        │
└────────────────────────┬────────────────────────────────────────┘
                         |
┌────────────────────────v────────────────────────────────────────┐
│                    landing/landing.css                          │
│                                                                 │
│  Layer 0: @import (font face declarations)                      │
│  Layer 1: :root { }         dark-first token defaults           │
│  Layer 2: [data-theme='light'] { }  light overrides             │
│  Layer 3: Utility classes   .glass-effect, .text-gradient,     │
│                             .shadow-glow, .apple-card           │
│           + [data-theme='light'] utility overrides              │
│  Layer 4: @keyframes        float, float-slow, float-medium,   │
│                             float-fast, float-slow-reverse,     │
│                             marquee, pulse-glow, pulse          │
│  Layer 5: .landing-* BEM-style component classes                │
│  Layer 6: @media queries    breakpoints at 1080px, 800px        │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | CSS Responsibility | Notes |
|-----------|-------------------|-------|
| `landing/landing.css` | Single CSS entry; all landing styles live here | Do NOT split into multiple files — see Anti-Patterns below |
| `LandingThemeContext.tsx` | Applies `data-theme` attribute to `document.documentElement` | Needs default changed from `'light'` to `'dark'` |
| `LandingShell.tsx` | Renders `.landing-app.landing-shell` root element | `data-theme` target is `<html>`, not this element — no structural change needed |
| Section/page components | Consume `.landing-*` BEM classes and utility classes | No inline styles; all visual state via CSS class names |
| `landing/assets.ts` | Centralized asset registry for image URLs | Missing images identified here, not in CSS |

## Recommended Project Structure

```
landing/
├── landing.css             # THE ONLY CSS FILE -- all landing styles
│                           # (layered internally per Layer 0-6 above)
├── assets.ts               # Image registry -- add missing baseline assets here
├── contexts/
│   └── LandingThemeContext.tsx  # Change default from 'light' to 'dark'
├── components/
│   ├── LandingShell.tsx    # No structural CSS changes needed
│   ├── LandingNav.tsx      # Class additions for .glass-effect; token alignment
│   └── LandingFooter.tsx   # Minor class adjustments for token alignment
├── sections/
│   └── home/               # Sections consume updated classes from landing.css
└── pages/                  # Pages consume updated classes from landing.css
```

### Structure Rationale

- **Single CSS file:** `landing.css` is 1258 lines and imports cleanly via a single `import './landing.css'` in `LandingApp.tsx`. Splitting into multiple files would require either multiple imports or a CSS bundler cascade, introducing load-order risk. The layered internal organization (Layer 0-6) provides the separation of concerns without the file-count overhead.
- **No Tailwind in React source:** The project constraint explicitly forbids importing Tailwind for the landing. All Tailwind visual output from the baseline must be hand-translated into the `landing.css` custom property system.
- **Theme in context, not CSS:** The `LandingThemeContext.tsx` owns the `data-theme` attribute write. CSS is pure selectors — no JS-in-CSS patterns needed.

## Architectural Patterns

### Pattern 1: Dark-First Token Default (Critical Correction)

**What:** The baseline CSS puts dark-mode values in `:root {}` (unconditional default) and light-mode values in `[data-theme=light] {}`. The React landing currently does the reverse: `:root {}` contains light values and `[data-theme='dark'] {}` overrides to dark. This is the root cause of the dark-first visual mismatch.

**When to use:** Always for this project — it is the baseline architecture.

**Trade-offs:** Requires inverting the current variable structure. Pages with no explicit `data-theme` set render dark by default, which is correct for baseline parity.

**Implementation:**
```css
/* Layer 1: dark defaults in :root (baseline architecture) */
:root {
  --landing-bg-primary: #050a05;
  --landing-bg-secondary: #0a150a;
  --landing-surface: rgba(0, 0, 0, 0.3);
  --landing-text-primary: #ffffff;
  --landing-text-secondary: #a0a0a0;
  --landing-text-muted: #6b7280;
  --landing-brand-green: #7a9e7a;
  --landing-brand-accent: #4a7c4e;
  --landing-border-color: rgba(122, 158, 122, 0.2);
  --landing-glow-color: rgba(122, 158, 122, 0.3);
  --landing-glass-bg: rgba(0, 0, 0, 0.3);
  --landing-radius: 0.625rem;
  /* keep --landing-radius-xl / --landing-radius-2xl for component classes */
}

/* Layer 2: light overrides (only applied when JS sets data-theme='light') */
[data-theme='light'] {
  --landing-bg-primary: #F5F7FA;
  --landing-bg-secondary: #FFFFFF;
  --landing-surface: rgba(255, 255, 255, 0.72);
  --landing-text-primary: #1D1D1F;
  --landing-text-secondary: #86868B;
  --landing-text-muted: #A1A1A6;
  --landing-brand-green: #34C759;
  --landing-brand-accent: #30B350;
  --landing-border-color: rgba(0, 0, 0, 0.08);
  --landing-glow-color: rgba(52, 199, 89, 0.15);
  --landing-glass-bg: rgba(255, 255, 255, 0.72);
  --landing-radius: 1rem;
}
```

**Context default change (one-line fix):**
```typescript
// LandingThemeContext.tsx
function readTheme(): LandingTheme {
  if (typeof window === 'undefined') return 'dark'; // was 'light'
  const stored = window.localStorage.getItem('theme');
  return stored === 'light' ? 'light' : 'dark';    // was inverse ternary
}
```

### Pattern 2: Utility Class Layer (Glass Effect, Text Gradient, Shadow Glow)

**What:** Baseline defines standalone utility classes `.glass-effect`, `.text-gradient`, `.shadow-glow`, `.apple-card` — not scoped to `.landing-*`. Theme-specific overrides for these utilities live in `[data-theme='light'] .glass-effect {}` blocks in Layer 2/3.

**When to use:** When a visual treatment repeats across multiple components or sections without structural variation.

**Trade-offs:** These are intentionally global (no `.landing-` prefix), matching baseline selector specificity. Keep them unprefixed.

**Example (Layer 3 in landing.css):**
```css
.glass-effect {
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  background: var(--landing-glass-bg);
  border: 1px solid var(--landing-border-color);
}

.text-gradient {
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  background-image: linear-gradient(
    135deg,
    var(--landing-brand-green) 0%,
    var(--landing-brand-accent) 50%,
    var(--landing-brand-green) 100%
  );
  background-size: 200% 200%;
}

.shadow-glow {
  box-shadow: 0 0 20px var(--landing-glow-color);
}

/* Light-mode utility overrides (still in Layer 2/3, after token block) */
[data-theme='light'] .text-gradient {
  background-image: linear-gradient(135deg, #34c759, #30b350, #248a3d);
}
[data-theme='light'] .glass-effect {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 24px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02),
              inset 0 0 0 1px rgba(255,255,255,0.5);
}
[data-theme='light'] .shadow-glow {
  box-shadow: 0 8px 32px rgba(52, 199, 89, 0.12), 0 2px 8px rgba(52, 199, 89, 0.08);
}
```

### Pattern 3: Keyframe Animation Block (Layer 4)

**What:** All `@keyframes` definitions belong in a dedicated Layer 4 block, after tokens/utilities and before component classes. This ensures animations are defined before any `animation:` property reference.

**When to use:** For all CSS animations — floating elements, marquee scrolling, glow pulses.

**Trade-offs:** Grouping all keyframes together makes them auditable as a unit. No functional coupling between animation name and component class.

**Required keyframes from baseline (reconstructed from minified source — verify exact easing against baseline output):**
```css
/* Layer 4: @keyframes */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}
@keyframes float-slow {
  0%, 100% { transform: translate(0) scale(1); }
  50%      { transform: translate(-8px, -12px) scale(1.02); }
}
@keyframes float-medium {
  0%, 100% { transform: translate(0) scale(1); }
  50%      { transform: translate(6px, -10px) scale(1.01); }
}
@keyframes float-fast {
  0%, 100% { transform: translate(0) scale(1); }
  50%      { transform: translate(-4px, -8px) scale(1.03); }
}
@keyframes float-slow-reverse {
  0%, 100% { transform: translate(0) scale(1); }
  50%      { transform: translate(10px, -8px) scale(0.98); }
}
@keyframes marquee {
  0%   { transform: translate(0); }
  100% { transform: translate(-50%); }
}
@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50%      { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}
```

Note: Keyframe bodies above are reconstructed from truncated minified output. The midpoint values and easing curves must be confirmed against visual comparison with the baseline during implementation. The baseline file is at `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/assets/index-DuxCbJQB.css`.

## Data Flow

### Theme Data Flow

```
User clicks theme toggle button
    |
useLandingTheme().toggleTheme()
    |
LandingThemeContext: setTheme('light' | 'dark')
    |
useEffect:
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
    |
CSS cascade:
  'dark' (default) -> :root {} applies, no override selector active
  'light'          -> [data-theme='light'] {} overrides :root values
    |
All .landing-* components re-paint via inherited CSS variable values
```

### CSS Layer Resolution Order (within landing.css)

```
Layer 0: @import fonts (Inter:wght@100-900, Montserrat:wght@100-900)
    |
Layer 1: :root {} tokens   (dark-first defaults)
    |
Layer 2: [data-theme='light'] {} token overrides
    |
Layer 3: Utility classes (.glass-effect, .text-gradient, .shadow-glow)
         + [data-theme='light'] .glass-effect / .text-gradient overrides
    |
Layer 4: @keyframes definitions
    |
Layer 5: .landing-* component classes (consume var(--landing-*) tokens)
    |
Layer 6: @media queries (max-width: 1080px, max-width: 800px)
```

### Key Data Flows

1. **Token-to-component flow:** All visual values in `.landing-*` rules reference `var(--landing-*)` tokens — never hardcoded colors. Changing the theme swaps token values at the `:root` / `[data-theme]` level; component rules do not change.
2. **Image flow:** `landing/assets.ts` exports image URLs. Sections reference these via `src={assetName}`. Missing images are an asset registry problem, not a CSS cascade problem.

## Integration Points

### New vs Modified Files

| File | Action | What Changes |
|------|--------|--------------|
| `landing/landing.css` | **Modify** — primary work surface | Invert dark/light defaults (Layers 1-2); add utility classes (Layer 3); add keyframes (Layer 4); update all `--landing-*` token values; update font import (Layer 0) |
| `landing/contexts/LandingThemeContext.tsx` | **Modify** — one-line change | Change `readTheme()` default from `'light'` to `'dark'`; invert the ternary guard |
| `landing/assets.ts` | **Modify** — add missing images | No CSS impact; pure asset URL registry addition |
| `landing/components/LandingNav.tsx` | **Modify** — class additions only | Apply `.glass-effect`; scroll-reactive state may need token-aligned colors |
| `landing/components/LandingShell.tsx` | **Modify** — background gradient | Update to reference new dark-first token vars |
| `landing/components/LandingFooter.tsx` | **Modify** — minor class alignment | Ensure token usage aligns with updated variable names |
| `landing/sections/home/*.tsx` | **Modify** — class additions | Add `animate-*` class names; apply `.glass-effect`, `.text-gradient`, `.shadow-glow` where baseline uses them |
| Any new `.css` file | **Do not create** | Single-file architecture is correct for this project |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `LandingThemeContext` <-> `landing.css` | `data-theme` HTML attribute on `<html>` | Context writes; CSS reads via `[data-theme='light']` selector |
| Component JSX <-> `landing.css` | `className` string props | Components reference `.landing-*` and utility class names; CSS defines them |
| `assets.ts` <-> section components | ES module import | No CSS coupling; pure image URL injection |

## Build Order for Visual Compliance Changes

Order matters because each layer creates measurement conditions for the next.

**Recommended sequence:**

1. **Font system first** — Change `@import` in `landing.css` Layer 0: remove Noto Sans SC, add `Inter + Montserrat`. Change `font-family` on `.landing-app` to `Inter, sans-serif`. Font changes cause the most layout reflow; do this before any per-pixel measurement.

2. **Token system second** — Invert dark/light structure in Layers 1-2. Update all `--landing-*` variable values to match baseline values. Simultaneously update `LandingThemeContext.tsx` default. After this step, the page renders dark by default with the correct color palette.

3. **Utility classes and keyframes third** — Add `.glass-effect`, `.text-gradient`, `.shadow-glow`, `.apple-card`, and all `@keyframes` definitions to Layers 3-4. These are consumed by per-section component work in step 5.

4. **Spacing and radius tokens fourth** — Update `--landing-radius-xl`, `--landing-radius-2xl`, and spacing values. Font changes affect intrinsic sizing, so spacing adjustments are more stable after fonts are confirmed.

5. **Per-section component fixes last** — Apply updated class names in JSX, add missing utility classes to components, fix per-section visual issues. Do Home first (most complex), then About, Products, Franchise, News. Each section can be verified independently.

**Rationale for this order:** Font changes cause global layout reflow — measuring per-section spacing before fonts land means remeasuring after. Token inversion is global and must precede per-section visual work. Utilities and keyframes must exist before sections reference them.

## Anti-Patterns

### Anti-Pattern 1: Splitting into Multiple CSS Files

**What people do:** Extract `landing-tokens.css`, `landing-animations.css`, `landing-utilities.css` to keep `landing.css` under 800 lines.

**Why it's wrong:** Requires multiple `@import` statements or bundler-managed cascades, introducing load-order risk. Breaks the single-entry guarantee of `import './landing.css'` in `LandingApp.tsx`. Adds maintenance surface for a file that has one consumer and one purpose.

**Do this instead:** Keep the single file, use Layer 0-6 comment headers for internal organization. At 1258 lines `landing.css` is already within tolerable range given its single-entry nature.

### Anti-Pattern 2: Keeping `[data-theme='dark']` as the Override Selector

**What people do:** Keep `:root {}` as the light-mode default and add `[data-theme='dark'] {}` as an override. This is the current React landing architecture.

**Why it's wrong:** Does not match the baseline. The baseline puts dark values in `:root {}` (no selector) and uses `[data-theme=light] {}` for the light override. If `data-theme` is never set (before JS hydrates, or if localStorage is empty), the baseline shows dark; the current React implementation shows light. This is the exact discrepancy v1.1 must fix.

**Do this instead:** Dark in `:root {}`, light in `[data-theme='light'] {}`. Simultaneously change `LandingThemeContext.tsx` so the absence of a stored preference defaults to `'dark'`.

### Anti-Pattern 3: Scoping Utility Classes Under `.landing-`

**What people do:** Define `.landing-glass-effect`, `.landing-text-gradient` to maintain BEM namespace consistency with other landing classes.

**Why it's wrong:** Baseline uses unprefixed `.glass-effect`, `.text-gradient`, `.shadow-glow`. JSX in sections will use unprefixed class names to match baseline output. Scoped names won't match and specificity diverges from baseline.

**Do this instead:** Keep utility classes unprefixed exactly as baseline defines them. Reserve the `.landing-` prefix for structural layout and component classes only.

### Anti-Pattern 4: Hardcoding Color Values in Component Classes

**What people do:** Write `.landing-hero { background: #050a05; }` directly in the component rule.

**Why it's wrong:** Breaks the theme flip. Colors hardcoded in component rules do not respond to `[data-theme='light']` overrides.

**Do this instead:** All colors in `.landing-*` component rules must be `var(--landing-*)` references. Only the token layer (`:root {}` and `[data-theme='light'] {}`) contains literal color values.

## Sources

- Baseline CSS direct inspection: `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/assets/index-DuxCbJQB.css` — extracted `:root` token block, `[data-theme=light]` override block, keyframe names, utility class definitions, font import URL (HIGH confidence — primary source)
- Baseline JS inspection: `.../assets/index-BqLXAaHJ.js` — confirmed `data-theme` attribute mechanism and `localStorage` behavior (HIGH confidence)
- Current React source: `landing/landing.css`, `landing/contexts/LandingThemeContext.tsx`, `landing/components/LandingShell.tsx` (HIGH confidence — direct read)
- Project constraints: `.planning/PROJECT.md` — no Tailwind import, maintain React 19 + Vite 6 stack, single CSS file approach (HIGH confidence)

---
*Architecture research for: v1.1 CSS visual compliance — React landing pixel-perfect match*
*Researched: 2026-04-20*
