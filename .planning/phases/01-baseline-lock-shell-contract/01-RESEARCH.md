# Phase 1: Baseline Lock & Shell Contract - Research

**Researched:** 2026-04-10
**Domain:** Git-pinned landing baseline governance, React/Vite shell boundary, and single-source-of-truth control
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Baseline Reference Pack
- **D-01:** Phase 1 will materialize a non-runtime baseline reference pack extracted from `7be7097^:Kimi_Agent_Deployment_v14/**`.
- **D-02:** The reference pack exists only for parity review and implementation guidance; it must not become a second public delivery path.

### Shell Contract Boundary
- **D-03:** Phase 1 locks only user-visible shell behavior: `/` continues to load the landing through the existing iframe path, the landing can still open `/academy`, and academy can still return to the entry shell.
- **D-04:** The internal academy bridge mechanism is not part of the contract. Existing bridge details such as `OPEN_AI_ACADEMY`, `window.__openAiAcademy`, or any temporary wrapper logic may change as long as the external behavior stays equivalent.

### Source Of Truth
- **D-05:** From Phase 1 onward, landing content truth is limited to the approved baseline reference pack plus `Kimi_Agent_Deployment_v14`.
- **D-06:** `public/entry-station` may remain only as transitional glue or legacy wrapper during cutover; it must not continue as an independent landing content source.

### Phase 1 Evidence
- **D-07:** Phase 1 evidence stays lightweight: baseline reference pack, shell contract checklist, file/source inventory, and minimal smoke-verification steps.
- **D-08:** Full screenshot-by-screenshot parity proof is deferred to later reconstruction/parity phases rather than required in Phase 1.

### Claude's Discretion
- Exact folder naming and file layout for the baseline reference pack.
- Exact checklist and inventory document format used to record the shell contract and source provenance.
- Exact smoke-verification command set, provided it proves the locked shell behavior without expanding scope.

### Deferred Ideas (OUT OF SCOPE)
- Full-page screenshot parity matrix and exhaustive visual evidence: defer to later reconstruction/parity phases.
- React source reconstruction of the landing runtime: defer to Phases 2-5.
- Retirement of any remaining legacy `public/entry-station` wrapper behavior: defer until the React-owned landing has reached cutover parity.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SHELL-01 | 用户在访问 `/` 时可以通过现有首页壳稳定进入 `/entry-station` 的落地页体验 | Preserve `EntryShell.tsx` as the `/` host boundary, keep iframe URL stable, and document the current Vite remap/copy path that serves `/entry-station` from `Kimi_Agent_Deployment_v14/**`. |
| SHELL-03 | 用户在 landing 内触发商学院入口时，现有 academy 打开链路仍然可用且与当前壳层行为兼容 | Separate the academy handoff contract from the baseline pack, treat bridge details as replaceable internals, and require a shell checklist plus smoke steps that prove landing -> academy -> landing parity. |
</phase_requirements>

## Summary

Phase 1 is a boundary-freezing phase, not a reconstruction phase. The core work is to create one immutable, reviewable baseline pack from `7be7097^`, define the host shell behavior that later phases must preserve, and remove ambiguity about which files count as landing truth during transition. The repo already gives enough evidence to do this cleanly: `index.tsx` mounts `EntryShell`, `EntryShell.tsx` owns the `/` vs `/academy` switch and the iframe URL, and `vite.config.ts` already remaps `/entry-station/*` to `Kimi_Agent_Deployment_v14/*` in dev and copies that tree to `dist/entry-station/*` in build.

The baseline pack and the shell contract must stay separate. The approved `7be7097^` landing tree is a 38-file static bundle. Compared with the current `Kimi_Agent_Deployment_v14/**`, only three files drift today: `index.html`, `assets/index-BqLXAaHJ.js`, and `assets/index-DuxCbJQB.css`. That means 35 binary assets already match the approved baseline, but the bundle itself does not encode today's academy bridge behavior. The bridge behavior instead lives in the host shell and in the legacy `public/entry-station/index.html` wrapper logic, which is useful as transition reference only.

The biggest planning risk is not technical difficulty, it is truth ambiguity. `public/entry-station/index.html` still exists and contains academy-tab/contact-modal logic, but the live dev/build delivery path now bypasses it in favor of the Vite `entry-station-source` plugin. Phase 1 should therefore freeze three things explicitly: the git-extracted baseline pack, a shell contract checklist for `/`, `/academy`, and return flow, and a source-inventory matrix that marks `Kimi_Agent_Deployment_v14/**` as the only transitional runtime content source while excluding `public/entry-station/**` from content truth.

**Primary recommendation:** Create a non-runtime baseline pack under `.planning/baselines/`, keep the existing React/Vite shell as the only host boundary, and publish a short truth matrix that says: baseline review comes from `7be7097^`, transitional runtime content comes from `Kimi_Agent_Deployment_v14/**`, and any academy bridge is glue, not baseline content.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Git CLI | 2.50.1 | Extract the approved baseline directly from commit objects and generate a manifest from the tree | This is the only authoritative source for `7be7097^:Kimi_Agent_Deployment_v14/**`; screenshots or working-tree copies are not trustworthy enough. |
| React | 19.2.4 installed (`^19.2.4` in `package.json`) | Own the host shell boundary for `/` and `/academy` | The milestone explicitly stays on the existing React app shell instead of introducing a second runtime. |
| React DOM | 19.2.4 installed (`^19.2.4`) | Mount the single shell entry from `index.tsx` | Existing project entrypoint already uses it; no Phase 1 change needs a new app bootstrap. |
| Vite | 6.4.1 installed (`^6.2.0`) | Serve `/entry-station/*` from the current landing tree in dev and copy it to `dist/entry-station/*` in build | This is the approved routing integration for keeping the public iframe URL stable while avoiding duplicate landing sources. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@vitejs/plugin-react` | 5.2.0 installed (`^5.0.0`) | React transform support for the existing shell app | Keep as-is; Phase 1 should not change shell compilation strategy. |
| TypeScript | 5.8.3 installed (`~5.8.2`) | Typed shell/config/docs helper scripts | Use for any small inventory or checklist helper script, but Phase 1 can stay mostly doc + shell-adjacent. |
| Node.js | 24.14.1 | Run `npm` scripts and any small manifest-generation utilities | Required for build smoke verification and repo-local tooling. |
| npm / pnpm | 11.11.0 / 10.33.0 | Run existing build/dev commands | `npm run build` already works; `pnpm` is available if the planner prefers it for installs. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Git-extracted baseline pack | Manual folder copy or screenshot archive | Loses commit provenance and makes future parity arguments subjective. |
| Existing React/Vite shell boundary | A second standalone landing host | Violates the milestone constraint to stay inside the current React + Vite stack and creates a second delivery path. |
| Existing `entry-station-source` Vite remap/copy flow | Treat `public/entry-station/**` as canonical content again | Reintroduces the exact dual-source problem the milestone is trying to eliminate. |

**Installation:**
```bash
pnpm install
```

No new packages are required for Phase 1.

**Version verification:** Verified on 2026-04-10.
- Installed in this workspace via `npm ls`: React 19.2.4, React DOM 19.2.4, Vite 6.4.1, `@vitejs/plugin-react` 5.2.0, TypeScript 5.8.3.
- Registry latest via `npm view`: React 19.2.5 and React DOM 19.2.5 (published 2026-04-08), Vite 8.0.8 (2026-04-09), `@vitejs/plugin-react` 6.0.1 (2026-03-13), TypeScript 6.0.2 (2026-03-23).
- Phase 1 should not upgrade dependencies. This phase is about freezing content and contracts, and the project constraint is to stay on the existing React 19 + Vite 6 + TypeScript stack line.

## Architecture Patterns

### Recommended Project Structure
```text
.planning/
├── baselines/
│   └── kimi-landing-7be7097-parent/
│       ├── README.md                      # source commit, extraction command, non-runtime warning
│       ├── TREE-SHA1.txt                  # `git ls-tree -r 7be7097^ -- Kimi_Agent_Deployment_v14`
│       └── Kimi_Agent_Deployment_v14/     # frozen 38-file reference tree
└── phases/01-baseline-lock-shell-contract/
    ├── 01-CONTEXT.md
    ├── 01-RESEARCH.md
    ├── SHELL-CONTRACT-CHECKLIST.md
    └── SOURCE-OF-TRUTH-INVENTORY.md
```

### Pattern 1: Git-Pinned Baseline Pack
**What:** Materialize the approved baseline from `7be7097^` into a planning-only location, accompanied by a tree manifest.
**When to use:** Immediately in Phase 1, before any later reconstruction work starts.
**Example:**
```bash
# Source: local git history (`7be7097^`) and `git ls-tree`
mkdir -p .planning/baselines/kimi-landing-7be7097-parent
git archive --format=tar 7be7097^ Kimi_Agent_Deployment_v14 \
  | tar -xf - -C .planning/baselines/kimi-landing-7be7097-parent
git ls-tree -r 7be7097^ -- Kimi_Agent_Deployment_v14 \
  > .planning/baselines/kimi-landing-7be7097-parent/TREE-SHA1.txt
```

### Pattern 2: Host-Owned Shell Contract
**What:** Treat `/` and `/academy` as host-shell states owned by `EntryShell.tsx`, not by the landing bundle.
**When to use:** For all Phase 1 parity criteria and for every later phase that rebuilds landing internals.
**Example:**
```tsx
// Source: EntryShell.tsx
const ACADEMY_PATH = '/academy';

function readEntryModeByPath(): EntryMode {
  return normalizePath(window.location.pathname) === ACADEMY_PATH ? 'academy' : 'home';
}

window.__openAiAcademy = () => setModeAndPath('academy');

const onMessage = (event: MessageEvent) => {
  if (event.origin !== window.location.origin) return;
  if (event.data?.type === 'OPEN_AI_ACADEMY') {
    setModeAndPath('academy');
  }
};
```

### Pattern 3: Transitional Glue Is Not Content Truth
**What:** Keep any academy bridge or wrapper logic separate from baseline content. The content truth during transition is `baseline pack + Kimi_Agent_Deployment_v14`, while glue files are delivery adapters only.
**When to use:** When documenting the source-of-truth inventory and when deciding what later phases are allowed to edit.
**Example:**
```ts
// Source: vite.config.ts
const remapEntryStationPath = (pathname: string): string | null => {
  if (pathname === '/entry-station' || pathname === '/entry-station/') {
    return '/Kimi_Agent_Deployment_v14/index.html';
  }
  if (pathname.startsWith('/entry-station/')) {
    return pathname.replace('/entry-station', '/Kimi_Agent_Deployment_v14');
  }
  return null;
};

const copyEntryStationToDist = (outDir: string) => {
  const targetDir = path.resolve(outDir, 'entry-station');
  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.cpSync(entryStationSourceDir, targetDir, { recursive: true });
};
```

### Pattern 4: Explicit Truth Matrix
**What:** Document source ownership by responsibility, not just by folder existence.
**When to use:** In the `SOURCE-OF-TRUTH-INVENTORY.md` artifact.

| Concern | Canonical Source | Explicitly Not Canonical |
|---------|------------------|--------------------------|
| Baseline parity review | `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/**` | Screenshots, memory, current working tree |
| Transitional landing content | `Kimi_Agent_Deployment_v14/**` | `public/entry-station/**` |
| Host shell behavior | `EntryShell.tsx` checklist backed by smoke steps | Specific bridge globals/event names |
| Legacy bridge reference | `public/entry-station/index.html` | Baseline content truth |

### Anti-Patterns to Avoid
- **Using `public/entry-station/**` as a content baseline:** Vite `publicDir` serves/copies those files as-is, but the project's own plugin now rewrites and overwrites `/entry-station` from `Kimi_Agent_Deployment_v14/**`. Planning against the wrong tree will drift immediately.
- **Mixing bridge code into the baseline pack:** The baseline pack stops being a trustworthy reference the moment it contains Phase 1 glue logic.
- **Locking `OPEN_AI_ACADEMY` or `window.__openAiAcademy` as public API:** The context explicitly says these are implementation details, not contract.
- **Creating a second runtime delivery path for review:** The baseline pack must never be web-served as another public path.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Baseline capture | Manual copy, screenshot archive, or "best effort" recreation | `git archive` + `git ls-tree` from `7be7097^` | The baseline must be provable and replayable from git history. |
| Transitional landing serving | A second custom static host or copy script outside Vite | Existing `entry-station-source` Vite plugin | The repo already has one dev/build delivery path for `/entry-station`; adding another path creates truth ambiguity. |
| Phase 1 parity proof | Screenshot matrix or visual review package | Shell contract checklist + minimal smoke steps | Locked decision D-07 keeps evidence lightweight in this phase. |
| Shell API definition | Freeze current global names, DOM injection selectors, or wrapper structure | Freeze only user-visible outcomes: `/`, `/academy`, and back-to-shell behavior | Later phases need freedom to replace bridge mechanics without "breaking the contract." |
| Asset provenance | Hand-maintained manifest | `git ls-tree` output committed verbatim | Tree/blob IDs are already the precise inventory format. |

**Key insight:** The hard problem here is governance, not rendering. Phase 1 succeeds when later phases cannot argue about "which landing is the real one" or "which bridge detail was supposed to stay fixed."

## Common Pitfalls

### Pitfall 1: Assuming `public/entry-station/index.html` Is Still the Live Landing Source
**What goes wrong:** Planning and edits target the wrapper file, but dev/build output still comes from `Kimi_Agent_Deployment_v14/**`.
**Why it happens:** The wrapper file still exists, contains academy logic, and looks like the old integration path.
**How to avoid:** Mark it as transition reference only in the truth inventory and validate any serving claim against `vite.config.ts`.
**Warning signs:** `npm run build` emits `dist/entry-station/*` from `Kimi_Agent_Deployment_v14/**`, not from `public/entry-station/**`.

### Pitfall 2: Treating the Baseline Pack as the Runtime Bundle
**What goes wrong:** Review evidence and shipped behavior become coupled, so later transitional edits contaminate the baseline.
**Why it happens:** The baseline pack and the runtime tree have the same folder shape and mostly the same assets.
**How to avoid:** Put the baseline pack under `.planning/baselines/` and add a README that says it is non-runtime by design.
**Warning signs:** Someone proposes serving the baseline pack directly or editing files inside it for shell compatibility.

### Pitfall 3: Over-Specifying the Academy Bridge Internals
**What goes wrong:** Later React reconstruction is blocked by an accidental requirement to preserve globals, DOM mutation timing, or wrapper injection details.
**Why it happens:** The legacy wrapper currently uses `postMessage`, `window.parent.__openAiAcademy`, fallback navigation, mutation observers, and tab injection all in one file.
**How to avoid:** Checklist only the visible result: landing action opens academy inside the existing shell, and academy can return to the landing shell.
**Warning signs:** Requirement language starts naming `OPEN_AI_ACADEMY`, `data-ai-academy-tab`, or exact wrapper DOM structure.

### Pitfall 4: Letting Source-Of-Truth Boundaries Stay Implicit
**What goes wrong:** Later phases use the wrong artifact for parity, especially because the current runtime differs from the approved baseline in only three files.
**Why it happens:** The trees look similar enough that people assume they are interchangeable.
**How to avoid:** Publish a file/source inventory that says exactly which files are baseline truth, transitional runtime truth, shell truth, and reference-only glue.
**Warning signs:** Review comments compare new React pages against current `Kimi_Agent_Deployment_v14/**` without mentioning the baseline pack.

### Pitfall 5: Adding Test Harness Scope to Phase 1 by Accident
**What goes wrong:** The phase balloons into infrastructure work and loses its "lightweight evidence" boundary.
**Why it happens:** There is no automated browser test harness today, so it's tempting to build one immediately.
**How to avoid:** Keep Phase 1 verification to `npm run build` plus explicit manual smoke steps unless the planner intentionally creates a tiny smoke harness as Wave 0.
**Warning signs:** The plan starts spending more steps on Playwright wiring than on baseline freeze and contract docs.

## Code Examples

Verified patterns from repo state and official Vite docs:

### Freeze the approved baseline from git
```bash
# Source: local git history (`7be7097^`)
mkdir -p .planning/baselines/kimi-landing-7be7097-parent
git archive --format=tar 7be7097^ Kimi_Agent_Deployment_v14 \
  | tar -xf - -C .planning/baselines/kimi-landing-7be7097-parent
git ls-tree -r 7be7097^ -- Kimi_Agent_Deployment_v14 \
  > .planning/baselines/kimi-landing-7be7097-parent/TREE-SHA1.txt
```

### Keep `/entry-station` on one delivery path during transition
```ts
// Source: vite.config.ts + https://main.vite.dev/config/shared-options.html#publicdir
const entryStationSourcePlugin = () => ({
  name: 'entry-station-source',
  configureServer(server: any) {
    server.middlewares.use((req: any, _res: any, next: () => void) => {
      const url = new URL(req.url, 'http://localhost');
      const rewrittenPath = remapEntryStationPath(url.pathname);
      if (rewrittenPath) {
        req.url = `${rewrittenPath}${url.search}`;
      }
      next();
    });
  },
  writeBundle(outputOptions: any) {
    const outDir = typeof outputOptions.dir === 'string'
      ? outputOptions.dir
      : path.resolve(__dirname, 'dist');
    copyEntryStationToDist(outDir);
  },
});
```

### Lock the shell on user-visible behavior only
```tsx
// Source: EntryShell.tsx
if (entryMode === 'academy') {
  return (
    <>
      <button
        type="button"
        className="entry-shell-floating-back"
        onClick={() => setModeAndPath('home')}
      >
        返回入口首页
      </button>
      <App />
    </>
  );
}

return (
  <iframe
    title="频安入口首页"
    src="/entry-station/index.html?v=20260311-3"
    className="entry-shell-frame entry-shell-frame-full"
  />
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Duplicate or edit landing content under `public/entry-station/**` | Serve `/entry-station/*` from `Kimi_Agent_Deployment_v14/**` through a Vite plugin and copy that tree to `dist/entry-station/*` | Approved in the 2026-04-09 routing design | The wrapper file is no longer authoritative landing content, even though it still exists. |
| Judge parity against "whatever is currently served" | Judge parity against a git-pinned `7be7097^` reference pack | Milestone decisions on 2026-04-09 and Phase 1 context on 2026-04-10 | Reviewers get one immutable baseline instead of comparing against a drifting working tree. |
| Treat shell + landing + bridge as one inseparable artifact | Separate host shell contract from landing baseline and from transitional bridge internals | Required by locked decisions D-03 through D-06 | Later phases can replace implementation details without reopening Phase 1 decisions. |

**Deprecated/outdated:**
- Treating the compliance-safe `7be7097` landing copy as the review baseline.
- Treating `public/entry-station/**` as independent landing content truth.
- Requiring full visual parity evidence in Phase 1.

## Open Questions

1. **Where should the transitional academy bridge live after Phase 1 documents the contract?**
   - What we know: The approved baseline pack does not encode academy handoff behavior, and the legacy wrapper contains the last visible bridge logic. The current served `/entry-station` path comes from `Kimi_Agent_Deployment_v14/**`.
   - What's unclear: Whether Phase 1 implementation should keep a tiny served wrapper, a shell-side injector, or another minimal adapter to preserve the current user-visible academy entry during transition.
   - Recommendation: Plan one small transitional glue task if runtime behavior needs restoration, but keep that glue outside the baseline pack and outside the content truth matrix.

2. **How much automation should Phase 1 verification add?**
   - What we know: `npm run build` succeeds now and there is no browser test harness in the repo.
   - What's unclear: Whether this phase should stay strictly manual-smoke for shell behavior, or spend a small Wave 0 on a single smoke spec.
   - Recommendation: Default to build + manual smoke to respect D-07. Only add a tiny smoke harness if the planner decides the contract needs machine-checked enforcement immediately.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Git CLI | Baseline extraction and tree manifest generation | ✓ | 2.50.1 | — |
| Node.js | Build smoke and any small helper script | ✓ | v24.14.1 | — |
| npm | `npm run build` verification | ✓ | 11.11.0 | Use `pnpm exec` equivalents if needed |
| pnpm | Workspace bootstrap / optional local workflow | ✓ | 10.33.0 | Use npm |

**Missing dependencies with no fallback:**
- None.

**Missing dependencies with fallback:**
- None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — build/manual smoke only |
| Config file | none — see Wave 0 |
| Quick run command | `npm run build` |
| Full suite command | `npm run build` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SHELL-01 | `/` keeps loading the landing through the existing shell and `/entry-station` path | manual smoke + build gate | `npm run build` | ❌ Wave 0 |
| SHELL-03 | landing-triggered academy entry still reaches `/academy` and academy can return to landing shell | manual smoke | `npm run build` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build`
- **Per wave merge:** `npm run build`
- **Phase gate:** Build green plus manual browser smoke for `/`, landing -> academy, and academy -> home

### Wave 0 Gaps
- [ ] `playwright.config.ts` — browser smoke harness if the planner wants automation for shell contract checks
- [ ] `tests/shell-contract.spec.ts` — covers SHELL-01 and SHELL-03
- [ ] `package.json` test script — one-command shell smoke run
- [ ] Manual smoke checklist artifact — if no browser harness is added, this must be written explicitly

## Sources

### Primary (HIGH confidence)
- Local repo: `index.tsx` — shell mounts through `EntryShell`
- Local repo: `EntryShell.tsx` — `/`, `/academy`, iframe, message handler, and back-to-home behavior
- Local repo: `vite.config.ts` — `entry-station-source` rewrite/copy integration
- Local repo: `public/entry-station/index.html` — legacy bridge/tab/contact logic for transition reference only
- Local repo: `Kimi_Agent_Deployment_v14/index.html` — current transitional runtime landing shell
- Local git refs: `git show 7be7097^:Kimi_Agent_Deployment_v14/index.html`, `git ls-tree -r 7be7097^ -- Kimi_Agent_Deployment_v14`, `git diff --name-only 7be7097^ -- Kimi_Agent_Deployment_v14`
- Official Vite docs: https://main.vite.dev/config/shared-options.html#publicdir — verified that `public` assets are served at `/` in dev and copied as-is to `outDir` during build
- Official Vite docs: https://main.vite.dev/guide/api-plugin.html — verified that Vite plugins can use `configureServer` during dev and build hooks during production
- Registry metadata: `npm ls` and `npm view` run on 2026-04-10 for installed and latest package versions

### Secondary (MEDIUM confidence)
- `docs/superpowers/specs/2026-04-09-entry-station-routing-design.md` — approved `/entry-station` routing intent and non-goals
- `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/phases/01-baseline-lock-shell-contract/01-CONTEXT.md` — milestone constraints and locked Phase 1 decisions

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified from local package state, registry metadata, and the project's own milestone constraints.
- Architecture: HIGH - Derived directly from inspected repo code, git history, build output, and the locked Phase 1 decisions.
- Pitfalls: HIGH - All major pitfalls are evidenced by current repo state, especially the wrapper-vs-plugin delivery ambiguity.

**Research date:** 2026-04-10
**Valid until:** 2026-05-10
