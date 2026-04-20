# Phase 6: CSS Variable Audit & Scope Isolation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 06-css-variable-audit-scope-isolation
**Areas discussed:** Variable naming strategy, Academy leak isolation, Audit scope & deliverable

---

## Variable Naming Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Keep --landing-* prefix | Maintains collision-free namespace with academy | ✓ |
| Switch to baseline unprefixed names | Matches baseline exactly but risks collision with index.css | |

**User's choice:** "由你决定 我只要百分百复刻" — Claude selected: Keep prefix (collision safety, no visual impact)
**Notes:** Variable names don't affect visual output — only values do. Prefix prevents academy collision.

---

## Academy Leak Isolation

| Option | Description | Selected |
|--------|-------------|----------|
| Verify existing .landing-app scoping | Check body rule leaks are already handled | ✓ |
| Add explicit CSS layer isolation | Use @layer to separate academy/landing | |

**User's choice:** Deferred to Claude — existing scoping verified and strengthened where needed
**Notes:** body{font-family}, body{color}, body{background} leaks are already partially handled by existing scoping patterns

---

## Audit Scope & Deliverable

| Option | Description | Selected |
|--------|-------------|----------|
| Grep-based inventory + manual toggle | One-time audit gate before Phase 7-8 | ✓ |
| Automated regression test | Ongoing test for scope isolation | |

**User's choice:** Deferred to Claude — one-time audit sufficient for this phase
**Notes:** Visual regression tests come in Phase 11

## Claude's Discretion

- Inventory documentation format
- CSS comment annotations
- Audit step ordering

## Deferred Ideas

None
