# Source Of Truth Inventory

| Concern | Canonical Source | Role | Explicitly Not Canonical |
|---------|------------------|------|---------------------------|
| Baseline parity review | `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/**` | Immutable review truth for the approved pre-`7be7097^` landing baseline | Mutable working-tree `Kimi_Agent_Deployment_v14/**`, screenshots, memory |
| Transitional landing runtime (active) | `public/entry-station/**` | Active transitional runtime again until React cutover; source used for current public `/entry-station` outcome | Mutable working-tree `Kimi_Agent_Deployment_v14/**` |
| Host shell behavior | `EntryShell.tsx` and `vite.config.ts` | Own `/`, `/academy`, iframe handoff, and `/entry-station` dev/build delivery contract | Landing bundle internals and wrapper-specific bridge details |
| Mutable deployment tree reference | `Kimi_Agent_Deployment_v14/**` | Working reference material only for comparison and reconstruction hints | Active runtime truth, baseline review truth |
| Transitional wrapper bridge reference | `public/entry-station/index.html` | Transitional glue/wrapper internals; may host academy trigger wiring but not public contract truth by itself | Approved landing content truth |

## Canonical Notes

- `public/entry-station/**` is canonical for active transitional runtime behavior (until React cutover), not for immutable baseline review.
- `Kimi_Agent_Deployment_v14/**` in the mutable working tree is reference-only and non-canonical for runtime ownership.
- Reviewers must compare reconstruction work against the immutable baseline pack first, then use `public/entry-station/**` to understand current transitional runtime behavior.

## Current Drift From Approved Baseline

- `index.html`
- `assets/index-BqLXAaHJ.js`
- `assets/index-DuxCbJQB.css`
