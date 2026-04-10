# Phase 1: Baseline Lock & Shell Contract - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Freeze one approved pre-`7be7097^` landing baseline and define the host-to-landing shell contract that must remain stable while later phases rebuild the landing as maintainable React source. This phase does not yet reconstruct pages or replace the runtime.

</domain>

<decisions>
## Implementation Decisions

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

### the agent's Discretion
- Exact folder naming and file layout for the baseline reference pack.
- Exact checklist and inventory document format used to record the shell contract and source provenance.
- Exact smoke-verification command set, provided it proves the locked shell behavior without expanding scope.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone Scope
- `.planning/PROJECT.md` — milestone goal, non-negotiable baseline choice, and maintainability constraints.
- `.planning/REQUIREMENTS.md` — Phase 1 requirements coverage for `SHELL-01` and `SHELL-03`, plus source-of-truth constraints for the milestone.
- `.planning/ROADMAP.md` — Phase 1 boundary, dependencies, and success criteria.

### Existing Entry Routing Decision
- `docs/superpowers/specs/2026-04-09-entry-station-routing-design.md` — current approved `/entry-station` routing behavior and the constraint that the public iframe URL does not change.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `EntryShell.tsx`: current home/academy shell, iframe entry, and path-switch behavior that define the user-visible contract.
- `vite.config.ts`: current `/entry-station/*` development rewrite and build-copy integration point.
- `public/entry-station/index.html`: legacy wrapper that currently injects academy bridge behavior; useful as transition reference, not as long-term content source.
- `Kimi_Agent_Deployment_v14/**`: current landing asset tree that Phase 1 must compare against the restored pre-`7be7097^` baseline.

### Established Patterns
- The root app mounts through `index.tsx` into `EntryShell`, so the landing is currently behind a shell boundary instead of being a first-class React entry.
- `/entry-station` is currently served through a Vite plugin remap/copy flow rather than React-owned route output.
- The shell separates landing and academy experiences by path and iframe, which later phases must preserve while replacing internals.

### Integration Points
- `index.tsx` -> `EntryShell.tsx` for the public entry shell.
- `EntryShell.tsx` iframe `src="/entry-station/index.html?...` for the locked public landing entry.
- `vite.config.ts` `entry-station-source` plugin for development/build delivery of landing assets.

</code_context>

<specifics>
## Specific Ideas

- "没弱化之前" means exactly the state before commit `7be7097`, i.e. `7be7097^`.
- Keep baseline freezing and shell-contract locking separate, because the original baseline pack itself does not carry today's academy bridge behavior.
- Do not redesign or rephrase landing content in this phase; the goal is to lock the original baseline and the public shell behavior before reconstruction.

</specifics>

<deferred>
## Deferred Ideas

- Full-page screenshot parity matrix and exhaustive visual evidence: defer to later reconstruction/parity phases.
- React source reconstruction of the landing runtime: defer to Phases 2-5.
- Retirement of any remaining legacy `public/entry-station` wrapper behavior: defer until the React-owned landing has reached cutover parity.

</deferred>

---

*Phase: 01-baseline-lock-shell-contract*
*Context gathered: 2026-04-10*
