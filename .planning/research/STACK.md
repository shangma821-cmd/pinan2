# Technology Stack: Kimi Landing Restoration + React Reconstruction

**Project:** 频安AI智能商学院  
**Researched:** 2026-04-09  
**Scope:** Restore the `7be7097^` landing baseline as maintainable React source inside the existing React/Vite app.  
**Confidence:** HIGH for the recommended stack; MEDIUM for optional historical multi-page restoration details inferred from the shipped bundle.

## Recommendation

Do **not** add a new frontend framework or a second styling system. The repo already has the right core stack: `react@^19.2.4`, `react-dom@^19.2.4`, `vite@^6.2.0`, `@vitejs/plugin-react@^5.0.0`, and `typescript@~5.8.2`. The milestone needs a **source-structure and build-entry change**, not a package-stack reset.

The old `7be7097^` artifact was a built React site mounted with `createRoot(...)`, and it included a separate marketing-site shell with route/page code paths (`Home`, `About`, `Products`, `Franchise`, `News`) plus a large utility-CSS output. For this repo, the maintainable path is to rebuild the required landing content in repo-native React components and CSS, then serve it at the existing `/entry-station` URL through Vite’s multi-page HTML entry support.

## Keep As-Is

| Technology | Version | Use Here | Why It Fits This Repo |
|------------|---------|----------|-----------------------|
| React | `^19.2.4` | Landing component tree | Already installed; baseline artifact was React-based; no need for another UI runtime. |
| React DOM | `^19.2.4` | Mount `entry-station` root with `createRoot` | Matches current app entry pattern and React official guidance. |
| Vite | `^6.2.0` | Dev/build for root app + `/entry-station` HTML entry | Officially supports multi-page apps with multiple `.html` entry points. |
| `@vitejs/plugin-react` | `^5.0.0` | JSX/TSX transform + HMR | Already in repo; no extra React build tooling needed. |
| TypeScript | `~5.8.2` | Maintainable landing source | Already in repo; keeps landing code aligned with the rest of the app. |
| `lucide-react` | `^0.574.0` | Optional icon reuse only | Already installed; reuse if needed instead of adding a second icon pack. |

## Required Changes

### 1. Replace copied static output with a real Vite entry

Use a dedicated HTML entry such as `entry-station/index.html` plus `src/entry-station/main.tsx`. Keep `EntryShell.tsx` pointing at `/entry-station/index.html` so the existing iframe contract stays stable.

In `vite.config.ts`, switch from the current `entryStationSourcePlugin()` copy/remap approach to Vite 6 multi-page build config via `build.rollupOptions.input`. This is the key stack change for maintainability.

### 2. Rebuild the landing in repo-native React components

Recommended source shape:

```text
entry-station/index.html
src/entry-station/main.tsx
src/entry-station/App.tsx
src/entry-station/sections/*
src/entry-station/components/*
src/entry-station/styles/*.module.css
src/entry-station/assets/*
```

This keeps the landing isolated from the academy app without creating a second framework or another repo.

### 3. Use CSS Modules or scoped CSS files, not a new styling framework

Use `.module.css` for component-local styles and one small shared tokens file if needed. Vite 6 supports both plain CSS imports and CSS Modules out of the box. This is the lowest-friction way to translate the old visual baseline into maintainable source without importing the old generated utility-CSS stack.

### 4. Re-import images from source instead of treating the old bundle as source-of-truth

Move landing images into `src/entry-station/assets/` and import them from TSX/CSS. Use `public/` only for files that must keep an exact name or root path. This avoids the old artifact’s brittle root-absolute asset references and lets Vite own hashing/HMR.

### 5. Keep interaction state local

The current static landing behavior is simple menu/open/scroll state, and the milestone does not justify Redux, Zustand, or any global store. Use React state/hooks only.

## Additions Explicitly NOT Recommended

| Do Not Add | Why Not |
|------------|---------|
| Tailwind CSS / PostCSS setup | The repo does not use Tailwind today, and the old bundle’s utility CSS is much broader than this milestone needs. It would introduce a second styling system for one landing. |
| shadcn/ui or Radix UI stack | The old bundle appears to come from a broader scaffold; the landing restoration does not need that component/runtime weight. |
| `react-router-dom` for the current milestone | The existing app has no router dependency, and the stable contract is `/entry-station/index.html` inside an iframe. Do not add routing unless scope expands to restoring the historical multi-page marketing site as real navigable routes. |
| Framer Motion / GSAP / AOS | No evidence that the restored baseline needs animation libraries; use CSS transitions first. |
| Zustand / Redux / any global state library | Landing interactions are local and low-complexity. |
| CMS / MDX / content platform | Explicitly out of scope for this milestone. |
| A second build system or separate landing repo | Conflicts with the goal of maintaining the landing inside the existing React/Vite app. |

## Integration Points

| File / Area | Change |
|-------------|--------|
| `EntryShell.tsx` | Keep iframe target at `/entry-station/index.html`; only update cache-busting/versioning if needed. |
| `vite.config.ts` | Replace static folder remap/copy behavior with multi-page `build.rollupOptions.input` and remove the `Kimi_Agent_Deployment_v14` copy step from the long-term path. |
| `Kimi_Agent_Deployment_v14` | Treat as reference material only for restore work; do not keep it as the maintained source-of-truth. |
| `src/entry-station/*` | New maintained React source for the landing. |

## Historical Baseline Findings That Matter

- `7be7097^` shipped a React bundle mounted through `createRoot(document.getElementById("root"))`.
- That artifact included route/page code paths for `Home`, `About`, `Products`, `Franchise`, and `News`.
- Its CSS output is consistent with a large utility-first build, which is exactly what should **not** be reintroduced into this repo unless the milestone expands substantially.

## Bottom Line

**New npm dependencies required now:** none.

**Real stack change required now:** convert `/entry-station` from a copied static artifact into a first-class Vite HTML entry backed by React 19 + TypeScript source, componentized sections, and CSS Modules/plain CSS.

## Sources

- Local repo context:
  - `/Users/jizhongzhou/_workspace/PinanHome/proj/pinan2/package.json`
  - `/Users/jizhongzhou/_workspace/PinanHome/proj/pinan2/vite.config.ts`
  - `/Users/jizhongzhou/_workspace/PinanHome/proj/pinan2/EntryShell.tsx`
  - `git show 7be7097^:Kimi_Agent_Deployment_v14/index.html`
  - `git show 7be7097^:Kimi_Agent_Deployment_v14/assets/index-BqLXAaHJ.js`
  - `git show 7be7097^:Kimi_Agent_Deployment_v14/assets/index-DuxCbJQB.css`
- Official docs:
  - Vite 6 build guide, multi-page app: https://v6.vite.dev/guide/build
  - Vite 6 features guide, CSS and CSS Modules: https://v6.vite.dev/guide/features
  - Vite 6 asset handling/public directory: https://v6.vite.dev/guide/assets
  - React `createRoot`: https://react.dev/reference/react-dom/client/createRoot
  - React “Add React to an Existing Project”: https://react.dev/learn/add-react-to-an-existing-project
