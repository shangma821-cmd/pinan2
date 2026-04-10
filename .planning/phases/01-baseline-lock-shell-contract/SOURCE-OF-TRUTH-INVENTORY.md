# Source Of Truth Inventory

| Concern | Canonical Source | Role | Explicitly Not Canonical |
|---------|------------------|------|---------------------------|
| Baseline parity review | `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/**` | Immutable review truth for the approved pre-`7be7097^` landing baseline | Mutable working-tree `Kimi_Agent_Deployment_v14/**`, screenshots, memory |
| Transitional landing content | `Kimi_Agent_Deployment_v14/**` | Current runtime landing content tree served through the Vite integration | `public/entry-station/**` |
| Host shell behavior | `EntryShell.tsx` and `vite.config.ts` | Own `/`, `/academy`, iframe handoff, and `/entry-station` dev/build delivery contract | Landing bundle internals and wrapper-specific bridge details |
| Legacy bridge reference | `public/entry-station/index.html` | Glue/reference only for previous bridge behavior and wrapper selectors | Approved landing content truth |

## Canonical Notes

- `public/entry-station/**` is non-canonical landing content.
- `public/entry-station/index.html` is glue/reference only.
- Reviewers must compare restoration work against the baseline pack first, then use the runtime `Kimi_Agent_Deployment_v14/**` only as transitional delivery context.

## Current Drift From Approved Baseline

- `index.html`
- `assets/index-BqLXAaHJ.js`
- `assets/index-DuxCbJQB.css`
