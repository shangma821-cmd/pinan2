# Domain Pitfalls

**Domain:** Kimi landing restoration from pre-change static bundle into the existing Vite/React app
**Researched:** 2026-04-09
**Confidence:** HIGH for repo-specific integration risks, MEDIUM for recovered original source structure

## Critical Pitfalls

### Pitfall 1: Baseline contamination
**What goes wrong:** The team reconstructs from the wrong artifact and silently bakes in compliance-era edits, wrapper hacks, or corrupted text instead of the required pre-`7be7097` baseline.
**Why it happens:** This repo currently has three different landing variants:
- `7be7097^:Kimi_Agent_Deployment_v14/**` = milestone content baseline
- current `Kimi_Agent_Deployment_v14/**` = later compliance-safe rewrite
- `public/entry-station/**` = older wrapped copy with extra script behavior and mojibake title text
**Consequences:** The React rebuild is “clean” but wrong, and every later review becomes a baseline argument instead of an implementation review.
**Prevention:** Freeze a one-time reference pack before coding: exact file snapshot from `7be7097^`, section inventory, desktop/mobile screenshots, and a short list of known non-baseline integration hacks that must not be treated as content truth.
**Detection:** Chinese copy does not match the old bundle, the landing title matches the mojibake `public/entry-station` copy, or compliance-safe wording leaks back in.
**Validation checkpoint:** Before reconstruction starts, diff the chosen source against `git show 7be7097^:Kimi_Agent_Deployment_v14/index.html` and the old bundle assets. No source work should begin until the baseline artifact is explicitly pinned.
**Plan must handle in:** `Baseline capture and approval`

### Pitfall 2: Duplicate source trees hide the active source of truth
**What goes wrong:** The restored React landing appears to work, but the app is still serving stale files from `public/`, `public/entry-station/`, or the current Vite copy plugin path.
**Why it happens:** This repo already duplicates the landing assets across `Kimi_Agent_Deployment_v14/`, `public/entry-station/`, and root `public/*.jpg`. Vite serves `public` files from `/` and copies them to build output as-is.
**Consequences:** Local verification passes for the wrong reason, asset bugs are masked, and cutover leaves multiple live delivery paths.
**Prevention:** Decide the end-state early: one live React source path, one build path, and an explicit cleanup plan for obsolete static copies. Prefer imported assets from source over root-level `public` copies.
**Detection:** The same image exists in multiple folders, network requests still hit `/news-ai-health.jpg` or other root assets, or `dist/entry-station` is still produced by file copy rather than the new React entry.
**Validation checkpoint:** Run a duplicate audit before cutover and again after cutover. The landing should still render correctly after obsolete static copies are removed or disabled.
**Plan must handle in:** `Asset normalization`, `Cutover cleanup`

### Pitfall 3: Losing the iframe-shell contract during React reconstruction
**What goes wrong:** The landing looks correct standalone, but from `/` it no longer opens the academy correctly, loses the injected academy tab, or drops the contact modal behavior.
**Why it happens:** The current shell contract is split across:
- `EntryShell.tsx` using an iframe at `/entry-station/index.html`
- `public/entry-station/index.html` injecting `频安AI商学院`, posting `OPEN_AI_ACADEMY`, calling `window.parent.__openAiAcademy`, and patching the contact modal

The pre-`7be7097` bundle itself does not contain that integration layer.
**Consequences:** The milestone restores visuals but breaks the only user journey that currently matters.
**Prevention:** Inventory the shell contract first, then re-implement it as explicit React behavior. Do not keep the existing `querySelector` patch script as the long-term architecture.
**Detection:** Clicking the academy CTA navigates the iframe instead of the outer app, the academy tab is missing, contact behavior disappears, or back-navigation stops matching the current shell behavior.
**Validation checkpoint:** Test both entry modes:
- load `/` and open academy from inside the landing
- load `/entry-station` directly and verify fallback navigation still works
- return from academy to home and confirm the landing is still the expected page
**Plan must handle in:** `Integration contract inventory`, `Host-shell integration`

### Pitfall 4: Root-path routing and asset leakage from the recovered bundle
**What goes wrong:** The React rebuild faithfully recreates the original SPA’s root routes and absolute asset paths, which escape `/entry-station` and collide with the host app.
**Why it happens:** The recovered pre-`7be7097` bundle clearly contains root-style routes like `/about`, `/products`, `/franchise`, `/news` and root asset URLs like `/news-ai-health.jpg`. The host shell only distinguishes `/academy` from everything else, and Vite’s default `base` is `/`.
**Consequences:** Navigation inside the iframe can load the wrong app, deep links refresh incorrectly, and assets only work because root `public/` duplicates are still present.
**Prevention:** Do not blindly reproduce the original bundled routing model. For this repo, choose one of these intentionally before implementation:
- flatten the recovered microsite into a single landing under `/entry-station`
- or scope any landing router and asset strategy explicitly under `/entry-station`

Do not leave this implicit.
**Detection:** Clicking landing navigation changes the iframe URL to `/about` or `/news`, or the rebuilt landing still depends on root `/foo.jpg` assets.
**Validation checkpoint:** During dev and build verification, confirm all landing navigation and asset requests stay within the intended landing path strategy. No root-path requests should exist by accident.
**Plan must handle in:** `URL model decision`, `Asset-path migration`

### Pitfall 5: Treating the production bundle as if it were recoverable source code
**What goes wrong:** The team performs a literal decompilation into giant components and guessed modules instead of rebuilding maintainable source.
**Why it happens:** The old bundle exposes useful breadcrumbs like `src/pages/Franchise.tsx` and `src/App.tsx`, but there are no source maps and no trustworthy original module boundaries. Those code-path strings are hints, not a source repository.
**Consequences:** The new codebase becomes a hard-to-edit pseudo-generated blob, and the “React migration” fails its maintainability goal.
**Prevention:** Recover only the parts that matter:
- information architecture
- content/data structure
- section order
- interaction behavior
- visual system

Then recompose them into current-project React components, data files, and styles.
**Detection:** One huge reconstructed component, copied minified constants, direct DOM patches everywhere, or comments claiming guessed file paths are authoritative.
**Validation checkpoint:** Review component boundaries before final integration. A maintainer should be able to point to where layout, content, assets, and shell-contract behavior live without reading a decompiled blob.
**Plan must handle in:** `Reconstruction architecture review`

### Pitfall 6: Skipping equivalence QA until the end
**What goes wrong:** The rebuild drifts in section order, spacing, typography, responsive behavior, or interaction details, and the mismatch is only discovered after integration work is done.
**Why it happens:** Reconstructing from a bundle invites interpretation. This repo also has later compliance copy and wrapper behavior that can bleed in if the team does not keep a golden reference.
**Consequences:** Late-stage churn, repeated restyling, and accidental re-baselining.
**Prevention:** Capture a golden reference before coding and use it throughout:
- desktop and mobile screenshots
- section-by-section checklist
- interaction checklist for menu, contact, academy entry, and back flow
**Detection:** Unplanned text rewrites, missing sections, different CTA hierarchy, or “close enough” approvals without side-by-side comparison.
**Validation checkpoint:** Run a structured equivalence pass before deleting the old static path.
**Plan must handle in:** `Reference capture`, `Final parity QA`

## Moderate Pitfalls

### Pitfall 1: Leaving DOM surgery as the long-term integration strategy
**What goes wrong:** The rebuilt landing still relies on `querySelector`-driven menu injection and post-render DOM mutation against React-owned nodes.
**Prevention:** Move that behavior into React state/components. Use refs only for narrow imperative needs.

### Pitfall 2: Forgetting to retire the current Vite static-copy behavior
**What goes wrong:** `vite.config.ts` continues copying `Kimi_Agent_Deployment_v14` into `dist/entry-station`, so the old static site keeps winning after the React version is built.
**Prevention:** Include an explicit cutover step that removes or disables the copy-based path once the React landing owns `/entry-station`.

### Pitfall 3: Encoding drift during copy/paste recovery
**What goes wrong:** Corrupted text from `public/entry-station/index.html` or browser-copied HTML leaks into the reconstructed source.
**Prevention:** Recover text from git objects and UTF-8 source artifacts, not from rendered-page copy/paste.

### Pitfall 4: Cache-busting confusion during verification
**What goes wrong:** `EntryShell.tsx` still points at `/entry-station/index.html?v=20260311-3`, and testing accidentally reuses a stale cached entry.
**Prevention:** Make cache versioning part of cutover, not an afterthought.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Baseline capture | Wrong artifact chosen as source truth | Pin `7be7097^:Kimi_Agent_Deployment_v14/**` and freeze a reference pack |
| URL/architecture design | Rebuilding the old root-routed microsite inside the host app | Decide upfront whether landing is single-page or explicitly scoped under `/entry-station` |
| React reconstruction | Literal bundle-to-JSX translation | Recompose into maintainable sections/components instead of decompiled blobs |
| Asset migration | Hidden dependency on root `public/` assets | Replace root-absolute references with intentional source-managed assets |
| Host integration | Losing `OPEN_AI_ACADEMY` and iframe behavior | Turn the current shell contract into tested React code |
| Cutover | Old static copy path still active | Remove or gate the `Kimi_Agent_Deployment_v14` copy pipeline |
| Final verification | Visual parity judged informally | Use a checklist plus screenshot comparison before deleting static fallback |

## Milestone Plan Must Explicitly Include

1. `Baseline capture and approval`
   Freeze the exact pre-`7be7097` artifact and reference screenshots before any reconstruction.
2. `URL model and asset model decision`
   Decide whether landing routing is flattened or scoped under `/entry-station`; do not infer this mid-implementation.
3. `Shell contract extraction`
   List every behavior currently split between `EntryShell.tsx` and `public/entry-station/index.html`, then reimplement it in React.
4. `Reconstruction architecture review`
   Review component/data/style boundaries before the integration commit.
5. `Static-path cutover and cleanup`
   Remove duplicate serving paths and prove the new landing does not depend on root `public/` duplicates.
6. `Parity QA`
   Verify visual parity, academy entry flow, direct `/entry-station` behavior, and build output ownership.

## Sources

- Repo evidence:
  - `git show 7be7097^:Kimi_Agent_Deployment_v14/index.html`
  - `git show 7be7097^:Kimi_Agent_Deployment_v14/assets/index-BqLXAaHJ.js`
  - `EntryShell.tsx`
  - `vite.config.ts`
  - `public/entry-station/index.html`
  - `docs/superpowers/specs/2026-04-09-entry-station-routing-design.md`
- Vite official docs:
  - https://vite.dev/guide/assets.html
  - https://vite.dev/config/shared-options
- React official docs:
  - https://react.dev/learn/manipulating-the-dom-with-refs
  - https://react.dev/learn/keeping-components-pure
