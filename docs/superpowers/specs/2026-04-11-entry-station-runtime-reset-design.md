# Entry Station Runtime Reset Design

**Goal:** Restore the real `793c287` `/entry-station` runtime semantics before any React reconstruction work, so the landing baseline, academy handoff, and later parity checks all run against the correct pre-`7be7097` behavior.

**Supersedes:** `docs/superpowers/specs/2026-04-09-entry-station-routing-design.md`

## Context

- The current branch still serves `/entry-station/*` from `Kimi_Agent_Deployment_v14/*` through a Vite rewrite and build copy step.
- That runtime is wrong for this milestone because it comes from the post-`7be7097` weak-medicalized package, not from the approved `793c287` baseline semantics.
- The academy handoff bridge does not live inside `Kimi_Agent_Deployment_v14/index.html`; it lives in `public/entry-station/index.html`, which injects the `OPEN_AI_ACADEMY` / `window.__openAiAcademy` bridge behavior and contact modal wiring.
- In commit `793c287`, `/entry-station` was served directly from `public/entry-station/**` with no Vite remap to `Kimi_Agent_Deployment_v14/**`.
- Because the current runtime bypasses `public/entry-station/index.html`, shell verification cannot prove the real user-visible contract. It proves only a temporary, incorrect integration.

## Problem To Solve

We need one stable and reviewable runtime truth before rebuilding the landing as React source.

Without that reset:

1. Shell verification is performed against the wrong landing runtime.
2. The academy entry appears broken even though the missing behavior is actually in a bypassed wrapper.
3. React reconstruction would target a mutated delivery path instead of the approved pre-`7be7097` semantics.

## Approved Approach

1. Restore `793c287` runtime semantics for `/entry-station`.
2. Treat `public/entry-station/**` as the active transitional runtime again until React takes ownership.
3. Treat `Kimi_Agent_Deployment_v14/**` as baseline/reference material for reconstruction, not the active served runtime.
4. Re-sequence milestone phases so runtime reset and shell re-validation happen before React engineering work.
5. Keep the public shell contract unchanged: `EntryShell -> iframe -> /entry-station/index.html`, landing-triggered academy entry reaches `/academy`, and academy return reaches `/`.

## Runtime Architecture

### Transitional runtime after the reset

`/`
-> `EntryShell.tsx`
-> iframe `src="/entry-station/index.html?..."`
-> `public/entry-station/index.html`
-> packaged landing assets under `public/entry-station/assets/*`

The academy handoff continues to be triggered from the wrapper page through same-origin parent integration:

- `window.parent.postMessage({ type: 'OPEN_AI_ACADEMY' }, origin)`
- optional `window.parent.__openAiAcademy()`

This bridge is not the long-term React architecture, but it is part of the correct pre-reconstruction runtime behavior and must remain active until the React landing replaces it with an equivalent integration.

### React target architecture after cutover

`/`
-> `EntryShell.tsx`
-> iframe `src="/entry-station/index.html?..."`
-> React-owned entry-station runtime
-> React-owned academy entry trigger with equivalent parent-shell behavior

The public contract stays the same. Only the internal ownership of the landing runtime changes.

## Source-Of-Truth Rules

### Canonical during runtime reset

- `public/entry-station/**`
  Purpose: active transitional runtime that users actually load through `/entry-station`
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/**`
  Purpose: immutable approved review baseline for original content and UI
- `EntryShell.tsx`
  Purpose: shell owner for `/`, `/academy`, iframe, and return behavior

### Explicitly not canonical during runtime reset

- Mutable working-tree `Kimi_Agent_Deployment_v14/**`
  Purpose: reference material only until React reconstruction consumes and replaces it
- The previous `2026-04-09` Vite rewrite/copy design
  Purpose: historical record only; no longer an approved integration target

## Required Planning Changes

### Phase 1 must change

Old Phase 1 assumed we could freeze shell contract while continuing to serve the landing from `Kimi_Agent_Deployment_v14/**`.

That is no longer valid.

New Phase 1 must:

1. Restore `/entry-station` runtime semantics to match commit `793c287`.
2. Re-validate shell behavior against the restored runtime.
3. Record that the academy entry is currently provided by the transitional wrapper and must be preserved through React cutover.

### Recommended phase sequence

1. **Phase 1: Runtime Reset & Shell Revalidation**
   Restore `public/entry-station` runtime ownership, remove the incorrect Vite remap/copy path, and re-run shell smoke checks on the correct runtime.
2. **Phase 2: React Entry Foundation**
   Stand up the React-owned `/entry-station` entry while preserving the same shell-facing contract.
3. **Phase 3: Original UI Reconstruction**
   Rebuild the original pre-`7be7097` content and page structure from the approved baseline.
4. **Phase 4: Interaction & News Parity**
   Restore the original interactive behaviors and news flows.
5. **Phase 5: React Cutover & Static Retirement**
   Switch the active runtime from `public/entry-station/**` to React-owned source and prove parity under direct and iframe loads.

## Files In Scope For The Runtime Reset

- Modify: `vite.config.ts`
- Modify: `.planning/ROADMAP.md`
- Modify: `.planning/PROJECT.md`
- Modify: `.planning/STATE.md`
- Modify: `.planning/phases/01-baseline-lock-shell-contract/SOURCE-OF-TRUTH-INVENTORY.md`
- Modify: `.planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md`
- Verify: `EntryShell.tsx`
- Verify: `public/entry-station/index.html`
- Reference only: `Kimi_Agent_Deployment_v14/**`
- Reference only: `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/**`

## Non-Goals

- Do not weak-medicalize or rewrite the original page content again.
- Do not immediately rebuild the entire landing as React in the runtime-reset step.
- Do not change the public URL contract away from `/entry-station/index.html`.
- Do not treat `Kimi_Agent_Deployment_v14/**` as the active runtime once the reset begins.

## Validation

The runtime reset is complete only when all of the following are true:

- `vite.config.ts` no longer rewrites `/entry-station/*` to `Kimi_Agent_Deployment_v14/*`.
- Development and production builds both serve `/entry-station/index.html` from the transitional `public/entry-station/**` runtime.
- Visiting `/` still shows the landing through the existing shell iframe.
- The landing again exposes a working academy entry that reaches `/academy` through the shell-compatible bridge.
- The academy return action still goes back to `/`.
- The roadmap and Phase 1 planning artifacts explicitly describe the restored runtime ownership and the updated phase order.

## Why This Approach

This is the smallest correction that restores a trustworthy baseline without discarding the worktree, the approved baseline pack, or the longer-term React target. It fixes the current false premise first, then lets the React migration proceed from the right starting point.
