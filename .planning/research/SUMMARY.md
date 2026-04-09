# Project Research Summary

**Project:** 频安AI智能商学院
**Domain:** Kimi landing restoration and React/Vite reconstruction
**Researched:** 2026-04-09
**Confidence:** MEDIUM

## Executive Summary

This milestone is a restoration project, not a redesign. The research is consistent that the target is the pre-`7be7097` Kimi landing baseline, rebuilt as maintainable source inside the existing React/Vite app. The right product shape is a second React document served at `/entry-station/index.html`, still embedded by `EntryShell`, with the academy app left on `/academy`.

The recommended implementation is conservative on stack and aggressive on cleanup: keep React 19, TypeScript, and Vite; replace the current static copy/rewrite path with a real Vite multi-entry setup; rebuild the landing into source-owned components, content modules, and imported assets; and preserve the historical five-destination information architecture (`/`, `/about`, `/products`, `/franchise`, `/news`) as landing states scoped under `/entry-station`. Do not add a new frontend framework, global state layer, CMS, or router dependency unless milestone scope expands.

The main delivery risk is not visual implementation difficulty. It is rebuilding from the wrong artifact, keeping duplicate static delivery paths alive, or breaking the iframe-to-academy handoff while chasing parity. The milestone should therefore start with baseline pinning, URL/asset model decisions, and shell-contract extraction, and end only after duplicate-path cleanup and explicit parity QA across both `/` iframe usage and direct `/entry-station` loads.

## Key Findings

### Recommended Stack

The current repo already has the right runtime and build tools. Research in [STACK.md](./STACK.md) recommends no new npm dependencies for this milestone. The required shift is structural: make `/entry-station` a first-class Vite HTML entry backed by React source instead of a copied static artifact.

**Core technologies:**
- React `^19.2.4`: landing component tree and local interaction state, matching both the repo and the historical artifact.
- React DOM `^19.2.4`: mount the dedicated landing root with `createRoot`.
- Vite `^6.2.0`: build both `index.html` and `entry-station/index.html` through official multi-entry support.
- `@vitejs/plugin-react` `^5.0.0`: existing JSX/TSX transform and HMR path.
- TypeScript `~5.8.2`: keep the landing maintainable and aligned with the rest of the app.
- CSS Modules or scoped CSS: lowest-friction way to replace generated utility CSS without importing another styling system.

**Critical version/usage requirement:**
- `vite.config.ts` should move from copy/remap behavior to `build.rollupOptions.input` multi-entry build ownership for `/entry-station`.

### Expected Features

Research in [FEATURES.md](./FEATURES.md) is clear that the historical baseline is not the current compliance-safe one-page landing. The milestone needs route-level equivalence and preserved user-visible behavior, not content redesign.

**Must have (table stakes):**
- Shared landing shell with top nav, footer, mobile menu, active-route state, theme toggle, and academy/contact CTAs.
- Five distinct landing destinations: home, about, products, franchise, and news.
- Home page section stack with hero, credential marquee, market pain points, value props, process loop, proof/cases, news preview, and final CTA.
- Dedicated about, products, franchise, and news pages with their original content groupings.
- News list/detail behavior, including client-side filters/search and deep-linkable `?id=` article detail.
- Cross-page equivalence for theme persistence, scroll-reactive navigation, back-to-top, and academy handoff.

**Should have (differentiators worth preserving):**
- Theme persistence via `localStorage`.
- Scroll-reactive nav and mobile overlay menu.
- Expandable “Why Choose Us” cards.
- Auto-advancing home process stepper with manual focus behavior.
- Count-up stats and scroll-triggered reveal effects where they materially affect UX.

**Defer (v2+ or separate requirement):**
- Backend lead submission flow for the franchise/contact form.
- Real share integrations on news detail.
- Motion-perfect parity and micro-animation tuning.
- Compliance rewrite, copy normalization, CMS tooling, or new operating flows not evidenced in the baseline.

### Architecture Approach

Research in [ARCHITECTURE.md](./ARCHITECTURE.md) recommends keeping the current shell boundary intact. `EntryShell` should continue to own `/` and `/academy`, while `/entry-station/index.html` becomes a dedicated landing React entry. The landing should live in its own source area, keep assets imported from source, and share only one small host contract module with the shell for academy handoff behavior.

**Major components:**
1. `EntryShell` and host app boundary: continue to render the landing iframe at `/` and the academy app at `/academy`.
2. Landing React entry at `/entry-station/index.html`: own the landing shell, internal page states, assets, and behaviors.
3. Shared entry contract module: centralize `OPEN_AI_ACADEMY`, academy path constants, and handoff helpers so shell and landing do not drift.
4. Landing content/section modules: keep page content decomposed into sections and data files instead of a decompiled blob.
5. Vite multi-entry build configuration: make both the host and landing official build inputs and retire static-copy runtime dependencies.

### Critical Pitfalls

Research in [PITFALLS.md](./PITFALLS.md) identifies the following as the highest-risk failure modes:

1. **Baseline contamination**: building from the wrong landing variant or from corrupted copied HTML. Avoid this by freezing the `7be7097^` reference pack and validating it before reconstruction starts.
2. **Duplicate source trees**: leaving `public/`, `public/entry-station/`, or copied bundle output active after React reconstruction. Avoid this by choosing one runtime source of truth early and planning explicit cutover cleanup.
3. **Losing the iframe-shell contract**: restoring visuals but breaking academy entry, fallback navigation, or current shell behavior. Avoid this by inventorying the contract first and reimplementing it as tested React behavior, not DOM patch scripts.
4. **Root-path route and asset leakage**: accidentally recreating `/about` or root asset URLs that escape `/entry-station`. Avoid this by scoping the landing URL and asset model deliberately before page reconstruction.
5. **Pseudo-source reconstruction**: translating the production bundle into giant guessed components. Avoid this by rebuilding maintainable sections, data modules, and styles from behavior/content evidence rather than decompiling literally.

## Implications for Roadmap

Based on the combined research, the milestone should be planned as five phases:

### Phase 1: Baseline Lock And Contract Inventory
**Rationale:** Wrong-source reconstruction and missing shell behaviors will invalidate every later phase. These decisions must be explicit before UI work starts.
**Delivers:** Pinned `7be7097^` reference pack, screenshot/checklist set, shell-contract inventory, URL model decision, and asset-path decision.
**Addresses:** `REQ-1 Shell and routing equivalence`, `REQ-7 Cross-page behavior equivalence`.
**Avoids:** Baseline contamination, shell-contract regressions, root-path routing leaks.

### Phase 2: Multi-Entry Foundation
**Rationale:** The landing needs a stable source-owned runtime and build path before page restoration begins.
**Delivers:** `entry-station/index.html`, landing React bootstrap, shared `entryContract`, and Vite multi-entry build config with `/entry-station` owned by source instead of copy steps.
**Uses:** Existing React 19, TypeScript, Vite 6, CSS Modules/plain CSS.
**Implements:** Host-shell boundary and landing-entry architecture from [ARCHITECTURE.md](./ARCHITECTURE.md).

### Phase 3: Shared Shell And Core Page Reconstruction
**Rationale:** Nav/footer/theme/page scaffolding are shared dependencies for almost every user-visible feature.
**Delivers:** Shared landing shell plus restored Home, About, Products, and Franchise page structures with componentized sections, imported assets, tabs, CTA wiring, and form UI presence.
**Addresses:** `REQ-2`, `REQ-3`, `REQ-4`, `REQ-5`.
**Avoids:** Bundle-to-JSX blob reconstruction and content drift by enforcing section/data boundaries.

### Phase 4: News And Interaction Equivalence
**Rationale:** News detail state and cross-page interactions depend on the shell and page structure already existing.
**Delivers:** News list/detail restoration with `?id=` behavior, theme persistence, mobile overlay nav, process stepper, count-up stats, reveal behaviors, back-to-top, and academy handoff/fallback behavior.
**Addresses:** `REQ-6`, remaining `REQ-7`.
**Avoids:** Late discovery of broken deep links, missing interactions, or academy entry regressions.

### Phase 5: Cutover, Cleanup, And Parity QA
**Rationale:** The milestone is not complete until the new landing is the only live source and parity has been proven under the real shell.
**Delivers:** Static-copy path retirement, duplicate-asset cleanup, cache/version update if needed, build-output ownership verification, and desktop/mobile parity QA for both `/` iframe and direct `/entry-station`.
**Addresses:** Release readiness across all requirements.
**Avoids:** Duplicate delivery paths, stale cached entries, and “looks right locally” false positives.

### Phase Ordering Rationale

- Baseline and contract work comes first because it prevents rebuilding the wrong product and breaking the only critical user journey.
- Build ownership comes before page restoration because copied static output would otherwise mask errors and duplicate sources.
- Shared shell and page reconstruction are grouped before interaction parity because most behaviors depend on those page boundaries already existing.
- Cleanup and QA are isolated into the final phase so stale assets, cache issues, and parity drift cannot hide behind unfinished implementation.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** exact URL model inside `/entry-station` still needs an explicit choice so five destinations remain distinct without leaking into host root routes.
- **Phase 4:** if the planner wants richer deep-linking than simple scoped state or query/hash handling, the landing navigation model should be validated before implementation.
- **Phase 5:** if compliance/content revision is pulled into this milestone, that becomes a separate research problem because current research intentionally targets baseline preservation.

Phases with standard patterns (skip research-phase):
- **Phase 2:** Vite multi-entry setup, React entry bootstrapping, CSS Modules, and shared constants are established patterns.
- **Phase 3:** componentized section rebuilds, asset imports, and local-state UI reconstruction are straightforward once the baseline and URL model are fixed.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Based on current repo state plus official React/Vite documentation; recommendation is conservative and low-risk. |
| Features | MEDIUM | IA and major behaviors are well supported by the recovered bundle, but exact content fidelity still depends on freezing the correct baseline artifacts. |
| Architecture | HIGH | Repo boundaries are clear and the iframe/multi-entry approach fits the existing app with minimal churn. |
| Pitfalls | HIGH | Risks are strongly evidenced by the repo’s duplicate paths, legacy copy pipeline, and shell integration behavior. |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Landing URL model:** planning must decide how the five historical destinations are represented inside `/entry-station` without recreating host-level root routes.
- **Baseline reference pack:** implementation should not begin until screenshots, section inventory, and exact source files from `7be7097^` are frozen and approved.
- **Integration scope:** franchise form submission and news share buttons should remain UI-only unless a separate requirement explicitly adds backend work.
- **Cutover validation:** planning should include a duplicate-asset audit and cache/versioning check so the React landing is proven to own runtime delivery.

## Sources

### Primary (HIGH confidence)
- [STACK.md](./STACK.md) — recommended stack, build strategy, and dependency guidance
- [FEATURES.md](./FEATURES.md) — baseline feature inventory, route model, and equivalence scope
- [ARCHITECTURE.md](./ARCHITECTURE.md) — integration boundaries, component ownership, and migration seam
- [PITFALLS.md](./PITFALLS.md) — repo-specific failure modes, warnings, and validation checkpoints
- Vite build and assets docs — multi-entry and asset ownership guidance
- React `createRoot` docs — dedicated landing entry mounting approach

### Secondary (MEDIUM confidence)
- `git show 7be7097^:Kimi_Agent_Deployment_v14/index.html` — historical landing baseline artifact
- `git show 7be7097^:Kimi_Agent_Deployment_v14/assets/index-BqLXAaHJ.js` — recovered route/behavior evidence
- `EntryShell.tsx`, `vite.config.ts`, `public/entry-station/index.html` — current host integration and legacy runtime path evidence

---
*Research completed: 2026-04-09*
*Ready for roadmap: yes*
