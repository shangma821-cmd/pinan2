# Pitfalls Research

**Domain:** Pixel-perfect CSS visual compliance retrofit on existing React/Vite landing app
**Researched:** 2026-04-20
**Confidence:** HIGH — derived from direct inspection of repo source, baseline CSS bundle, and theme context implementation

---

## Critical Pitfalls

### Pitfall 1: Theme Polarity Flip Breaks First-Paint Default

**What goes wrong:**
Switching from light-first to dark-first by changing the default `readTheme()` fallback breaks three things simultaneously: first-paint flashes the wrong background colour before React hydrates, `localStorage` entries written by previous sessions keep showing light mode for returning users, and any Playwright tests that do not explicitly set a theme begin rendering against the wrong baseline.

**Why it happens:**
`LandingThemeContext.tsx` initialises from `localStorage` with `stored === 'dark' ? 'dark' : 'light'` — any value that is not exactly `'dark'` (including absent/null) returns `'light'`. Changing the default to dark requires inverting that guard AND handling the no-stored-value case. The React state hydration also happens after the first render, so there is a one-frame window where the HTML element has no `data-theme` attribute and the CSS falls back to whatever `:root {}` says.

**How to avoid:**
1. Add an inline `<script>` in `index.html` that reads `localStorage` synchronously before React loads and stamps `data-theme` on `<html>` immediately — the classic "flash of incorrect theme" (FOIT) fix.
2. Change `readTheme()` to `return stored === 'light' ? 'light' : 'dark'` so the default is dark without an explicit stored value.
3. Clear or migrate existing `localStorage` keys in the context `useEffect` on first mount so returning users are not stuck on light.

**Warning signs:**
- Visible white flash on page load in dark-default mode.
- Tests that previously passed on light background now fail screenshot comparisons.
- Users who visited the site before the change always see light mode until they manually toggle.

**Phase to address:**
Phase: Colour system and dark-first default (first CSS compliance phase).

---

### Pitfall 2: Font Swap Causes Cascading Layout Shifts

**What goes wrong:**
Removing `Noto Sans SC` and adding `Inter` causes text to reflow everywhere it was sized against CJK character metrics. Noto Sans SC has larger x-height and different em-square ratios than Inter. Any element with a fixed height, clamped text, or pixel-precise card layout will either overflow, clip, or leave unexpected whitespace after the swap.

**Why it happens:**
`landing.css` declares `font-family: 'Noto Sans SC', sans-serif` on `.landing-app` and then repeats explicit `font-family` overrides on `.landing-brand-title`, `.landing-proof-value`, `.landing-price`, and other display elements with stacked fallbacks like `'Montserrat', 'Noto Sans SC', sans-serif`. When Noto is removed, the cascade falls through to Inter (or the system sans-serif), but the em measurements that were baked into fixed heights and `line-height: 1.85` values do not update automatically.

The baseline CSS uses `font-family: Inter, sans-serif` and `font-family: Montserrat, sans-serif` exclusively — no Noto anywhere. The React landing has Noto in at least 12 explicit declarations and in the Google Fonts `@import`.

**How to avoid:**
1. Remove Noto from the `@import` URL at the top of `landing.css` first, before touching any `font-family` declarations, so that fallback rendering becomes visible and measurable during development.
2. Do a global replace of all `'Noto Sans SC'` occurrences — 12+ in `landing.css` — replacing stacked fallbacks with clean `Inter, sans-serif`.
3. Audit every component with fixed-height containers, multi-line text clamp (`-webkit-line-clamp`), or explicit `line-height` after the swap. Adjust spacing tokens if necessary.
4. Test Chinese content strings with Inter — Inter has reasonable CJK fallback coverage in modern OS but some glyphs will fall through to system fallback. If content includes CJK characters that must render at pixel-perfect quality, add a CJK fallback explicitly: `Inter, 'PingFang SC', 'Microsoft YaHei', sans-serif`.

**Warning signs:**
- Nav links wrap to two lines after font swap.
- Card titles overflow their containers.
- Hero headline line-height visually tighter or looser than baseline screenshots.
- Chinese characters render at noticeably different weight or size vs. baseline.

**Phase to address:**
Phase: Font system replacement (second CSS compliance phase).

---

### Pitfall 3: CSS Variable Scope Collision Between Landing and Academy Global Styles

**What goes wrong:**
`landing/landing.css` defines variables on `:root` (e.g. `--landing-bg-primary`, `--landing-line`, `--landing-shadow`). `index.css` also defines variables on `:root` (e.g. `--bg-0`, `--line`, `--card`). Both sheets are imported into the same React app. When both files are loaded, `:root` variable names that collide silently win in source order — whichever is loaded last wins.

The immediate collision is `--line`: `index.css` sets `--line: rgba(110, 185, 255, 0.38)` (academy blue-white) and `landing.css` sets `--landing-line: rgba(77, 142, 90, 0.16)` (landing green). These names do not clash today — but if any variable was shortened or if the academy sheet ever references `--landing-*` values, the conflict will appear silently.

A deeper risk: `index.css` sets `body { font-family: 'Noto Sans SC', ... }` globally. `landing.css` sets `.landing-app { font-family: 'Noto Sans SC' }`. After removing Noto from landing, any landing component rendered without the `.landing-app` wrapper class will fall through to the `body` declaration and still use Noto — making the font swap incomplete.

**How to avoid:**
1. Audit both `index.css` and `landing.css` for any `:root` variable names that are shared or could be confused. Document the namespacing contract: landing variables use `--landing-*` prefix exclusively.
2. Do not put global `body` font declarations in both sheets. The academy's `body { font-family }` in `index.css` must be scoped or the landing font declaration must be specific enough to override it for all landing content.
3. Ensure `body:has(.landing-app)` or `.landing-app` selector specificity consistently wins over bare `body {}` rules for all landing-relevant properties.

**Warning signs:**
- Landing text renders in Noto even after landing.css font swap is complete.
- Academy cards suddenly show green borders after a landing CSS change.
- Dark-mode landing variables not applying because `:root` variable was accidentally overwritten by a higher-specificity academy rule.

**Phase to address:**
Phase: CSS variable audit (should precede font swap and colour system work).

---

### Pitfall 4: `backdrop-filter` on Glass Elements Creates Stacking Context Bugs

**What goes wrong:**
The baseline uses `backdrop-filter: blur(20px) saturate(180%)` on nav and glass cards. `landing.css` already uses `backdrop-filter: blur(18px)` on `.landing-nav`. When adding glass-effect utility classes that mirror the baseline, two bugs appear:
1. Any ancestor element with `will-change`, `transform`, `filter`, or `isolation: isolate` creates a new stacking context that clips the backdrop-filter blur to that ancestor's bounds — making the blur invisible or incorrectly scoped.
2. On Safari, `backdrop-filter` requires `-webkit-backdrop-filter` for full support.

**Why it happens:**
`.landing-shell` already declares `isolation: isolate` to manage z-index layering. This is the correct pattern for z-index control but it is also a stacking context boundary. Any `backdrop-filter` element inside `.landing-shell` that needs to blur content *behind the shell* will be clipped at the shell boundary.

The landing CSS approach of placing grid overlay via `.landing-shell::before` and then using `backdrop-filter` on children inside the same stacking context is correct — but adding new glass-effect cards in page sections that are themselves inside transformed or `will-change` ancestors breaks this.

**How to avoid:**
1. Never add `transform`, `will-change`, `filter`, or `opacity < 1` to an element that is an ancestor of a `backdrop-filter` target, unless the blur is intentionally clipped to that ancestor.
2. When adding glass-effect utilities, test on Safari (WebKit) and Chrome. Add `-webkit-backdrop-filter` alongside `backdrop-filter`.
3. For animated floating elements (the `float` keyframes), use `transform: translateY()` on a child wrapper — not on the same element that holds the glass background — to avoid creating unintended stacking contexts.
4. Verify glass cards on a page with the grid overlay still visible through them: if the grid disappears behind a card, the backdrop scope is wrong.

**Warning signs:**
- Glass blur disappears on Safari but works on Chrome.
- Grid pattern is not visible through glass card backgrounds.
- Nav blur stops working after adding a CSS animation to a section hero.

**Phase to address:**
Phase: Glass effects and animation addition.

---

### Pitfall 5: Animation Additions Cause Mobile Performance Regression

**What goes wrong:**
The baseline defines 15 `@keyframes` (`float`, `float-fast`, `float-medium`, `float-slow`, `float-slow-reverse`, `marquee`, `pulse`, `pulse-glow`, `spin`, plus accordion and enter/exit variants). Adding all of these to `landing.css` without performance guards causes paint thrashing and dropped frames on mobile, especially on the home page where multiple floating elements run simultaneously.

**Why it happens:**
Animations that animate `top`, `left`, `margin`, `width`, or `opacity` (non-compositor properties) force the browser to recalculate layout on every frame. The baseline's `float` keyframes animate `transform: translateY()` which is compositor-friendly, but `pulse-glow` animates `box-shadow` which is not. Stacking six or more animated elements in a single viewport on a mid-range Android device causes visible stuttering.

Additionally, the `marquee` animation typically requires a duplicated content element to achieve seamless looping. If the content is not duplicated correctly, the animation snaps back visibly at the loop point.

**How to avoid:**
1. Only animate `transform` and `opacity` on compositor-eligible elements. For `pulse-glow` (box-shadow animation), consider replacing with an `opacity` animation on a `::after` pseudo-element that holds the shadow — this stays on the compositor thread.
2. Add `will-change: transform` only to elements that actually use continuous transform animations (float elements). Do not apply it globally.
3. Wrap animation-heavy sections in `@media (prefers-reduced-motion: reduce)` overrides that disable or reduce motion.
4. Test with Chrome DevTools "CPU 4x slowdown" throttle to simulate mid-range mobile before approving animation additions.
5. For marquee, duplicate the content element in JSX and verify the `animation-duration` is calculated correctly for the content width.

**Warning signs:**
- Chrome DevTools Performance panel shows more than 10% time in "Recalculate Style" during animation.
- Device feels hot or battery drains quickly while landing page is open.
- Marquee snaps to start position every N seconds.
- 60fps drops to 20-30fps on iOS Safari when scrolling through the home hero.

**Phase to address:**
Phase: Animation and glass effects addition (with mobile performance gate before merge).

---

### Pitfall 6: Vite Asset Cache Invalidation When Replacing Image Files In-Place

**What goes wrong:**
`landing/assets.ts` imports images using Vite's static asset pipeline: `import heroBg from '../public/entry-station/hero-bg.jpg'`. Vite fingerprints assets at build time and caches them in the browser. If a replacement image is dropped into the same path with the same filename, the development server may serve a stale cached version, and the production build's content hash may not change if the file modification timestamp is not updated.

**Why it happens:**
Vite's HMR watches source files, but image files in `public/` (not in `src/`) are served directly and are not fingerprinted by Vite's asset pipeline when accessed via a URL — they are only fingerprinted when imported via `import`. In `assets.ts`, the images are imported, so they will be fingerprinted. However, `public/entry-station/` is a static directory served at the root URL, and any baseline reference images there that are also in the baseline static bundle risk being served stale.

Additionally, the project imports from `../public/entry-station/` rather than from a dedicated `src/assets/` directory. This dual location (public static + import reference) means replacing a file may update the imported version but not flush CDN or browser caches that reference the static URL.

**How to avoid:**
1. When replacing baseline images, always do a hard-delete of the old file and copy the replacement under the same name — do not overwrite in-place — to guarantee the filesystem modification time changes.
2. After image replacements, clear the Vite cache: `rm -rf node_modules/.vite` before running `vite dev` again.
3. Verify the production build actually produces a new content-hash for replaced images: check `dist/entry-station/assets/` hash changes.
4. For the landing, prefer importing all images through `assets.ts` (Vite-managed, fingerprinted) rather than referencing them via static `/path/image.jpg` URLs in CSS `url()` — the latter bypasses Vite's cache busting.

**Warning signs:**
- A replaced image still shows the old version after restarting dev server.
- `dist/entry-station/assets/` contains an image with the same hash as before even though the file was visually changed.
- CSS `background-image: url('/hero-bg.jpg')` shows old image while the `<img src={heroBg}>` using the import shows the new image.

**Phase to address:**
Phase: Image asset completion (during or before visual verification phase).

---

### Pitfall 7: Spacing and Radius Token Mismatch Creates Off-by-4px Failures in Visual QA

**What goes wrong:**
The baseline uses Tailwind-generated spacing tokens (e.g. `gap-6` = 24px, `rounded-3xl` = 24px, `p-8` = 32px) while `landing.css` uses hand-written pixel values and named variables (`--landing-radius-xl: 24px`, `--landing-radius-2xl: 36px`). When baseline spacing and the React implementation are compared side-by-side, discrepancies of 4–8px appear in section padding, card gaps, and corner radii that look correct to the eye but fail pixel-level screenshot diff tests.

**Why it happens:**
Tailwind's spacing scale uses a 4px base unit. Many baseline values like `py-16` (64px), `gap-4` (16px), `rounded-2xl` (16px) do not map cleanly to the `--landing-*` token names already in `landing.css`. Developers eyeball the baseline and use "close" values rather than extracting exact Tailwind equivalents.

**How to avoid:**
1. Before adding spacing, extract the exact Tailwind values from the baseline CSS. Use the compiled `index-DuxCbJQB.css` as a reference — the class names are readable and map to known Tailwind values.
2. Add missing tokens to `landing.css` `:root` as needed (e.g. `--landing-radius-lg: 16px` if that is missing) rather than hardcoding pixel values inline.
3. Use Playwright visual comparison with a pixel-difference threshold of 0 for critical layout elements (hero, nav, section headers) to catch off-by-4px issues before sign-off.

**Warning signs:**
- Side-by-side screenshot comparison shows section padding slightly wider or narrower than baseline.
- Card corners look "more rounded" or "less rounded" than baseline.
- Playwright screenshot diff test fails with small pixel difference on otherwise-correct layout.

**Phase to address:**
Phase: Spacing and token audit (can run in parallel with colour system work).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep `Noto Sans SC` in Google Fonts `@import` for fallback | No CJK glyph gaps | Landing always loads Noto even when not used; contradicts baseline | Never — remove the import entirely once Inter is the declared stack |
| Hardcode pixel values instead of adding `:root` tokens | Faster per-element fix | Token drift, harder to maintain parity with future baseline changes | Never for recurring values (spacing, radius, shadow) |
| Use `!important` to override academy global styles leaking into landing | Quickly fixes a collision | Masks the real scope collision; future updates cause unpredictable overrides | Only as temporary debugging aid, never committed |
| Skip `-webkit-backdrop-filter` prefix | Shorter CSS | Glass effects broken on Safari/WebKit browsers | Never — Safari market share is too high for a consumer landing page |
| Add `will-change: transform` to all animated elements | Slightly smoother perceived motion | GPU memory pressure, increased battery drain, can break stacking contexts | Only on elements with continuous frame-by-frame transform animation |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `LandingThemeContext` + CSS `:root` defaults | Changing JS default without updating CSS `:root` defaults — leaves a one-frame mismatch on hydration | Add inline `<script>` in `index.html` to stamp `data-theme` synchronously before React loads |
| `index.css` (academy) + `landing.css` (landing) | Both loaded in the same React app; bare `body {}` rules from academy leak into landing | Use `.landing-app` as the scoping selector for all landing styles; never rely on bare element selectors |
| Vite static `public/` + Vite imported assets | Images in `public/entry-station/` served at URL root and also imported in `assets.ts` — two serving paths | Import all landing images through `assets.ts` exclusively; remove or do not reference static URL path in CSS |
| Playwright visual tests + theme polarity | Tests that do not set `data-theme` explicitly now render in dark mode after polarity flip | Update all visual comparison tests to set the theme attribute explicitly before screenshotting |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Multiple simultaneous float animations on home hero | Jank on scroll, dropped frames, device heating | Limit concurrent transform animations to 4 per viewport; use `prefers-reduced-motion` | Mid-range Android with 4+ floating elements visible simultaneously |
| `backdrop-filter: blur()` on many overlapping elements | Paint cost spikes; transparent overlay causes repaint on scroll | Use `backdrop-filter` only on persistent overlay elements (nav, modals) not on per-card decoration | More than 3 glass elements in a single scrollable section |
| Large unoptimised JPEGs in `public/entry-station/` | Slow LCP, poor CLS during image load | Compress images to <100KB where possible; use `width`/`height` attributes or `aspect-ratio` CSS to reserve space | Hero image > 500KB on 3G connection |
| CSS `@import url()` for Google Fonts without `font-display: swap` | Invisible text (FOIT) until fonts load | Add `&display=swap` to the Google Fonts URL — already present in `landing.css` — verify it stays after font URL changes | Slow networks where Inter/Montserrat take >3s to load |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Theme toggle flashes opposite theme on first load | Jarring white flash in dark-default mode | Inline synchronous theme script in `index.html` before React initialises |
| Font swap mid-session (if fonts load late) | Text reflows and jumps as Inter loads | Set `font-display: swap` and size containers to fit the expected Inter metrics |
| Animations with no `prefers-reduced-motion` guard | Vestibular disorder users experience dizziness or discomfort | Wrap all keyframe animations in `@media (prefers-reduced-motion: no-preference)` |
| Glass nav blur visible on desktop but missing on mobile | Inconsistent premium feel | Test `backdrop-filter` on actual iOS Safari and Chrome Android, not just desktop Chrome |

---

## "Looks Done But Isn't" Checklist

- [ ] **Dark-first default:** Verify first-paint on a fresh session (no localStorage) shows dark background, not a flash of white then dark.
- [ ] **Font removal:** Verify `Noto Sans SC` is absent from the Google Fonts `@import` URL and from all `font-family` declarations in `landing.css`. Check the Network tab to confirm no Noto request is made.
- [ ] **Glass effects:** Test `.glass-effect` on Safari iOS 15+ and confirm blur is visible. Check that a parent element with `isolation: isolate` does not clip the blur.
- [ ] **Animation completeness:** Compare `@keyframes` in `landing.css` against the 15 names in the baseline CSS bundle. Confirm `float-slow-reverse`, `pulse-glow`, and `marquee` are present and named identically.
- [ ] **Spacing tokens:** Pixel-diff the home hero padding, feature card gaps, and section headers against baseline screenshots. Tolerance: 0px.
- [ ] **CSS variable namespace:** Confirm no `:root` variables in `landing.css` share names with `:root` variables in `index.css` (academy). Run a grep for overlap.
- [ ] **Image cache:** After replacing any image, confirm the production build produces a new content-hash filename and that the old hash is no longer in `dist/entry-station/assets/`.
- [ ] **Playwright theme tests:** Confirm all visual tests explicitly set `data-theme` attribute before screenshot capture.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Theme polarity flash on first load | LOW | Add 3-line inline script to `index.html` to read localStorage synchronously |
| Font swap layout breaks | MEDIUM | Audit all fixed-height containers with Inter, adjust `line-height` and padding tokens |
| CSS variable collision | LOW | Rename colliding variable in `landing.css` to use `--landing-` prefix consistently |
| backdrop-filter clipped by stacking context | MEDIUM | Remove `isolation`, `will-change`, `transform`, `filter` from the offending ancestor; restructure DOM if needed |
| Animation performance regression | MEDIUM | Replace non-compositor properties with `transform`/`opacity` equivalents; reduce concurrent animation count |
| Vite stale image cache | LOW | Delete `node_modules/.vite`, replace image file with hard-delete+copy, rebuild |
| Spacing off-by-4px failures | LOW-MEDIUM | Extract exact Tailwind values from baseline CSS, update `:root` tokens, do not eyeball |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Theme polarity flash (Pitfall 1) | Colour system & dark-first phase | First-paint screenshot on fresh session shows dark background |
| Font swap layout shifts (Pitfall 2) | Font system replacement phase | Side-by-side screenshot comparison before/after, no overflow or clipping |
| CSS variable scope collision (Pitfall 3) | Pre-work audit before any CSS changes | grep `:root` variables across both CSS files, confirm no name collision |
| backdrop-filter stacking context (Pitfall 4) | Glass effects phase | Test on Safari iOS, confirm blur visible on nav and glass cards |
| Animation mobile performance (Pitfall 5) | Animation addition phase | Chrome DevTools CPU throttle test, confirm 60fps on simulated mid-range mobile |
| Vite image cache invalidation (Pitfall 6) | Image asset completion phase | Confirm new content-hash in production build after each image replacement |
| Spacing token mismatch (Pitfall 7) | Spacing/token audit (parallel to colour work) | Playwright pixel-diff test with 0px tolerance on hero, nav, and cards |

---

## Sources

- Direct repo inspection:
  - `landing/landing.css` (1258 lines, current React landing styles)
  - `landing/contexts/LandingThemeContext.tsx` (theme polarity implementation)
  - `index.css` (academy global styles — potential scope conflict)
  - `entry-shell.css` (entry shell isolation)
  - `landing/assets.ts` (image import pattern)
  - `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/assets/index-DuxCbJQB.css` (105KB baseline, Tailwind-compiled)
- Baseline CSS analysis:
  - 15 `@keyframes` names extracted from baseline bundle
  - `backdrop-filter: blur(20px) saturate(180%)` pattern in baseline glass elements
  - Font stack: `Inter, sans-serif` and `Montserrat, sans-serif` — no Noto
- Known patterns documented in prior research:
  - `.planning/research/ARCHITECTURE.md`, `STACK.md`, `FEATURES.md`

---
*Pitfalls research for: v1.1 pixel-perfect CSS visual compliance retrofit*
*Researched: 2026-04-20*
