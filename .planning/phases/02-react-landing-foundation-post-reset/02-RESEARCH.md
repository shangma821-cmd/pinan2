# Phase 2: React Landing Foundation (Post-Reset) - Research

**Researched:** 2026-04-16
**Domain:** React landing route foundation under `/entry-station` while preserving transitional iframe runtime at `/entry-station/index.html`
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Route Foundation
- **D-01:** Phase 2 must introduce a formal React routing layer for landing.
- **D-02:** React-owned scoped routes must exist for `/entry-station`, `/entry-station/about`, `/entry-station/products`, `/entry-station/franchise`, and `/entry-station/news`.
- **D-03:** The route solution must support a shared outer shell plus direct-load/refresh from day one.

### Transitional Runtime Coexistence
- **D-04:** Public `/` continues to render the existing iframe target `/entry-station/index.html` during this phase.
- **D-05:** React landing foundation coexists with the transitional runtime; it does not replace public traffic yet.
- **D-06:** Do not introduce a second public prefix or alternate landing URL family.

### Scaffold Depth
- **D-07:** All five destinations need independent React page scaffolds.
- **D-08:** Each scaffold should expose page identity and future section placeholders for later baseline restoration.
- **D-09:** Do not pull full baseline content restoration into Phase 2.

### Shared Shell Scope
- **D-10:** Shared landing shell structure is in scope now: navigation frame, route switching, active state, footer, and baseline responsive layout.
- **D-11:** Theme persistence, scroll-reactive nav, back-to-top, and richer mobile interactions remain deferred.
- **D-12:** Preparatory stubs are acceptable only when clearly not presented as finished parity behavior.

### the agent's Discretion
- Exact route library choice and route config style.
- Concrete scaffold placeholder treatment.
- Whether future shell controls are omitted entirely or shown as structural stubs.

### Deferred Ideas (OUT OF SCOPE)
- Core marketing content restoration for Home/About/Products/Franchise belongs to Phase 3.
- News parity and homepage rich interactions belong to Phase 4.
- Final runtime cutover and public parity proof belong to Phase 5.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SHELL-02 | 用户可以在 landing 内访问与原版基线等价的五个目的地状态：首页、关于我们、产品服务、加盟合作、新闻动态 | Phase 2 should stand up a React route family plus shared shell markers for all five destinations, with direct-load/refresh verified locally in dev and preview, while preserving the legacy iframe file target. |
</phase_requirements>

## Summary

Phase 2 is best treated as a route-ownership phase, not a content-restoration phase. The current repo already exposes the split needed to make this work cleanly: Vite serves `public/entry-station/index.html` as a plain static asset at `/entry-station/index.html`, while the SPA dev/preview servers return the root React app `index.html` for `/entry-station` and `/entry-station/about`. Local probes on 2026-04-16 confirmed exactly that behavior in both `vite` dev and `vite preview`.

That means the safest coexistence model is:

1. Keep `/entry-station/index.html` as the transitional iframe file target used by `EntryShell.tsx` on `/`.
2. Let React own the public route family without the file suffix: `/entry-station` plus its subroutes.
3. Extend `EntryShell.tsx` from a 2-mode shell (`home` / `academy`) into a 3-mode shell (`home` / `landing` / `academy`) so direct visits to `/entry-station*` render the React landing shell instead of the iframe wrapper.

This approach matches the phase boundary and avoids the worst ambiguity. The current code does **not** contain the `entry-station-source` Vite rewrite/copy plugin described in Phase 1 docs; `vite.config.ts` currently only configures proxies plus `react()`. Because of that mismatch, Phase 2 planning should treat the actual repo behavior as authoritative for implementation sequencing and include explicit verification for both dev and preview route ownership.

For routing, the simplest good fit is `react-router-dom` 7 in declarative mode with `basename="/entry-station"`. This phase only needs stable navigation, nested shared shell layout, active-state navigation, and direct-load/refresh. It does not yet need loaders/actions or framework/data-router features. Using declarative mode keeps the initial route scaffold light while preserving an easy migration path to route-object/data-router patterns later if Phase 4 or Phase 5 needs them.

The largest implementation risk is not JSX layout work; it is shell arbitration. `EntryShell.tsx` currently treats every non-`/academy` path as “home iframe mode”, so direct-loading `/entry-station/about` would still render the iframe today even though Vite serves the SPA HTML shell for that URL. Phase 2 therefore needs shell-level path ownership before any page scaffold work becomes meaningful.

## Repo Reality Check

### Verified current behavior (local probe, 2026-04-16)

| Path | Dev (`vite`) | Preview (`vite preview`) | Meaning |
|------|--------------|--------------------------|---------|
| `/entry-station` | Returns root SPA `index.html` | Returns built root SPA `index.html` | React can own the route family without changing the iframe file target |
| `/entry-station/about` | Returns root SPA `index.html` | Returns built root SPA `index.html` | Direct-load/refresh is already feasible at the server layer |
| `/entry-station/index.html` | Returns static file from `public/entry-station/index.html` | Returns static file from `dist/entry-station/index.html` | Transitional runtime file target remains independently addressable |

### Verified code facts

- `EntryShell.tsx` only distinguishes `"/academy"` from everything else, so `/entry-station*` currently falls into iframe-home mode.
- `EntryShell.tsx` hardcodes the iframe target as `src="/entry-station/index.html?v=20260311-3"`.
- `vite.config.ts` has no custom routing plugin for `/entry-station`; it only configures API proxies and `react()`.
- `public/entry-station/**` is still copied into `dist/entry-station/**` during build through Vite public asset handling.
- No route library is currently installed in `package.json`.

## Standard Stack

### Core

| Library / Tool | Version | Purpose | Recommendation |
|----------------|---------|---------|----------------|
| `react-router-dom` | npm `latest`: `7.14.1` (queried 2026-04-16) | Formal client-side routing for the landing route family | Recommended new dependency for Phase 2 |
| React | installed `19.2.4` | Shared app shell and route rendering | Keep existing version line |
| Vite | installed `6.4.1` | Dev/build/preview delivery of SPA shell and static public assets | Keep existing version line |
| `@vitejs/plugin-react` | installed `5.2.0` | React transform support | Keep existing setup |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-router-dom` declarative mode | Handwritten `pathname` switch in React | Lower dependency count, but re-implements active state, nested route matching, and future maintainability poorly |
| `react-router-dom` declarative mode | `createBrowserRouter` / data router | More extensible for loaders/actions, but heavier than this phase needs and not necessary for static scaffold work |
| React route family at `/entry-station*` | New preview-only prefix | Avoids shell arbitration short term, but violates the user decision to build directly around the stable public route family |

### Version verification

- `react-router`: `7.14.1`
- `react-router-dom`: `7.14.1`
- `@tanstack/react-router`: `1.168.22`
- `@playwright/test`: `1.59.1`

Version lookup performed locally with `npm view` on 2026-04-16.

## Recommended Architecture

### Pattern 1: Tri-Mode Entry Shell

Promote `EntryShell.tsx` from:
- `home` -> iframe landing
- `academy` -> React academy app

to:
- `home` -> iframe landing on `/`
- `landing` -> React landing shell on `/entry-station*`
- `academy` -> React academy app on `/academy`

This keeps shell ownership explicit and prevents landing routing from leaking into academy mode or iframe mode.

### Pattern 2: Basename-Scoped Landing Router

Create a landing router rooted at `basename="/entry-station"` with five routes:
- `/` -> Home scaffold
- `/about`
- `/products`
- `/franchise`
- `/news`

Recommended route behavior:
- shared layout route provides top nav + footer
- child pages provide only page-specific scaffold structure
- nav uses router-aware active state rather than custom DOM mutation

### Pattern 3: Separate “React route family” from “iframe file target”

Treat these as deliberately distinct:

| URL | Owner in Phase 2 | Purpose |
|-----|------------------|---------|
| `/` | `EntryShell.tsx` | Public shell entry |
| `/entry-station/index.html` | `public/entry-station/**` | Transitional iframe runtime file target |
| `/entry-station` and subroutes | React landing router | Phase 2 foundation for later restoration |
| `/academy` | `EntryShell.tsx` + `App.tsx` | Existing academy experience |

This distinction is the core enabler for coexistence in Phase 2.

### Pattern 4: Landing Code Lives Outside `App.tsx`

Do not add landing foundation code to the large academy `App.tsx`. Instead, create a dedicated landing slice such as:

```text
landing/
├── LandingApp.tsx
├── LandingShell.tsx
├── routes.tsx
├── pages/
│   ├── LandingHomePage.tsx
│   ├── LandingAboutPage.tsx
│   ├── LandingProductsPage.tsx
│   ├── LandingFranchisePage.tsx
│   └── LandingNewsPage.tsx
└── components/
    ├── LandingNav.tsx
    └── LandingFooter.tsx
```

This keeps later Phase 3/4 reconstruction work isolated from the academy app and from shell arbitration logic.

## Validation Architecture

Phase 2 needs browser-path verification more than unit-only verification because the success criteria are route ownership, direct-load/refresh behavior, and shared shell visibility.

### Recommended verification split

- **Wave 0:** add a minimal Playwright test runner setup using `@playwright/test` because `playwright-core` alone is installed but does not provide a configured test workflow.
- **Quick verification:** `npm run build`
- **Route smoke verification:** preview the build and assert that `/entry-station`, `/entry-station/about`, `/entry-station/products`, `/entry-station/franchise`, and `/entry-station/news` render React landing shell markers, while `/entry-station/index.html` still serves the transitional static runtime.
- **Manual fallback checks:** verify navigation cluster, active state, and footer presence across all five destinations on desktop and mobile viewport sizes.

### Why Playwright is the best fit here

- Route behavior depends on real browser history APIs.
- The shared shell and active nav are inherently page-level UI behaviors.
- Phase 2 acceptance is dominated by direct-load and refresh semantics, which are brittle to verify with pure DOM-unit tests.

### Wave 0 scope should stay tight

Do not build a full regression suite in this phase. A single routing smoke spec is enough if it covers:
- React shell appears on all five route destinations
- direct-load/refresh works for nested routes
- `index.html` transitional runtime remains independently reachable

## Architecture Patterns

### Pattern A: Route-shell-first scaffolding

Build shared shell first, then attach page stubs beneath it. This keeps Phase 2 aligned with roadmap success criterion 3.

### Pattern B: Stable nav contract via route metadata

Drive navigation labels and paths from one route metadata table, then use that same metadata to render nav items, page headings, and acceptance markers. This reduces drift when Phase 3 replaces placeholders with restored sections.

### Pattern C: Explicit shell markers for verification

Give the shared landing shell and each scaffold page stable testable markers such as:
- `data-testid="landing-shell"`
- `data-testid="landing-nav"`
- `data-testid="landing-page-home"`
- `data-testid="landing-page-about"`

That lets the later plan create grep/test-verifiable acceptance criteria instead of subjective visual language.

## Common Pitfalls

### Pitfall 1: Letting `/entry-station*` continue to fall into iframe-home mode

If `EntryShell.tsx` is not updated first, the React router work will exist but never become reachable under the phase route family.

### Pitfall 2: Trying to replace `/entry-station/index.html` in Phase 2

That collapses the carefully chosen coexistence model and drags Phase 5 cutover work into this phase.

### Pitfall 3: Using a single generic placeholder page for all destinations

That technically creates routes, but it weakens later restoration work because page identity and section skeletons are not laid out per destination.

### Pitfall 4: Planning against Phase 1 docs without checking current repo state

The documented Vite `entry-station-source` plugin is not present in the actual `vite.config.ts`. Plans should target current code reality, not historical assumptions.

### Pitfall 5: Putting landing scaffolding into `App.tsx`

That couples landing reconstruction to the academy app and makes later cutover harder to reason about.

## Recommended Plan Shape

The eventual phase plan should likely break into three executable tracks:

1. **Shell arbitration and dependency setup**
   - add route dependency
   - teach `EntryShell.tsx` to recognize `/entry-station*`
   - keep `/` and `/academy` behavior intact

2. **Shared landing shell and route table**
   - create landing shell layout
   - create centralized route metadata
   - implement nav/footer + active state

3. **Five page scaffolds and verification**
   - create independent page stubs
   - ensure each route direct-loads in dev/preview
   - add minimal smoke verification

## Sources

### Official docs
- React Router `BrowserRouter` API — `basename` support and declarative mode: https://api.reactrouter.com/v7/functions/react-router.BrowserRouter.html
- React Router `createBrowserRouter` API — data-router alternative and `basename` support: https://api.reactrouter.com/v7/functions/react-router.createBrowserRouter.html
- Vite config `publicDir` behavior — public assets are served at `/` in dev and copied as-is during build: https://main.vite.dev/config/
- Vite plugin API — `configureServer` and `configurePreviewServer` hooks for dev/preview routing customization if needed later: https://v3.vite.dev/guide/api-plugin
- Vite static deploy guide — `vite preview` serves the built `dist` output locally: https://vite.dev/guide/static-deploy

### Local repo evidence
- `EntryShell.tsx`
- `vite.config.ts`
- `package.json`
- `public/entry-station/index.html`
- Local HTTP probes against `vite` dev on `http://127.0.0.1:3100`
- Local HTTP probes against `vite preview` on `http://127.0.0.1:4173`

## RESEARCH COMPLETE

Phase 2 can safely plan around React ownership of `/entry-station` plus nested routes while preserving `/entry-station/index.html` as the transitional iframe target. The plan should prioritize shell path arbitration first, then shared shell scaffolding, then five destination stubs plus smoke verification.
