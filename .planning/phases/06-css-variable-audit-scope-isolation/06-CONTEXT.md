# Phase 6: CSS Variable Audit & Scope Isolation - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Verify that landing CSS variables don't collide with academy styles, and establish scope isolation guarantees before any new token values are authored in subsequent phases. This phase produces a collision inventory and resolves any leaks — it does NOT change token values or visual appearance.

</domain>

<decisions>
## Implementation Decisions

### Variable Naming Strategy
- **D-01:** Keep `--landing-*` prefix for all landing CSS variables. The baseline uses unprefixed names (`--brand-green`, `--glass-bg`), but since we're matching visual output (not importing Tailwind), the prefix prevents collision with academy `index.css` which uses its own unprefixed vars (`--bg-0`, `--text`, `--green`). Variable names don't affect visual output — only values do.
- **D-02:** When adding new baseline-equivalent tokens in Phase 8, use the `--landing-*` namespace (e.g., `--landing-glass-bg`, `--landing-glow-color`) to maintain isolation.

### Academy Leak Isolation
- **D-03:** The `body { font-family: 'Noto Sans SC' }` declaration in `index.css` leaks into landing elements. Fix by ensuring `.landing-app` explicitly sets `font-family` (already partially done) and verify no landing child elements inherit the academy body font.
- **D-04:** The `body { color: var(--text) }` in `index.css` leaks into landing. This is already overridden by `.landing-app { color: var(--landing-text-primary) }` — verify this holds for all landing children.
- **D-05:** The `body { background: ... }` in `index.css` uses radial gradients that could show through. This is already handled by `body:has(.landing-app) { background: var(--landing-bg-primary) }` — verify this override is complete.

### Audit Scope & Deliverable
- **D-06:** Audit is a grep-based inventory comparing all `:root` / `[data-theme]` custom properties in `index.css` vs `landing.css`. Output is a collision report documented in the plan execution summary.
- **D-07:** Verification is a manual check: toggle academy CSS import off and confirm landing appearance is unchanged. Plus grep confirmation that no `var(--` references in `landing.css` point to academy-owned variables.
- **D-08:** No automated test for this phase — the audit is a one-time gate before Phase 7-8 authoring work. Visual regression tests come in Phase 11.

### Claude's Discretion
- Exact format of collision inventory documentation
- Whether to add CSS comments marking the scope boundary in landing.css
- Order of audit steps (variables first or body rules first)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### CSS Files to Audit
- `index.css` — Academy global CSS with `:root` variables and `body` rules that may leak
- `landing/landing.css` — Landing scoped CSS with `--landing-*` variables, `:root` and `[data-theme='dark']` blocks

### Baseline Reference
- `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/assets/index-DuxCbJQB.css` — Baseline compiled CSS showing target variable names and values

### Research
- `.planning/research/PITFALLS.md` — Pitfall 3 (CSS variable namespace collision) details
- `.planning/research/ARCHITECTURE.md` — CSS architecture recommendation (single-file, 6-layer)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `body:has(.landing-app)` pattern in `landing.css` — already overrides academy body background
- `.landing-app` class — scoping boundary for all landing styles
- `isolation: isolate` on `.landing-shell` — stacking context isolation already in place

### Established Patterns
- `--landing-*` prefix convention — 79 occurrences in `landing.css`, established in Phase 3
- Academy uses unprefixed vars (`--bg-0`, `--text`, `--muted`, `--green`, etc.) — no overlap with `--landing-*`

### Integration Points
- `index.css` `body {}` rules — font-family, color, background leak into landing when `.landing-app` scoping is incomplete
- `:root {}` in both files — separate variable namespaces but shared selector target

</code_context>

<specifics>
## Specific Ideas

- Goal is 100% pixel-perfect replication — all decisions serve this objective
- User defers all implementation choices to Claude — "由你决定，我只要百分百复刻"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-css-variable-audit-scope-isolation*
*Context gathered: 2026-04-20*
