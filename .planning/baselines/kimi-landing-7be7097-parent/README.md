# Kimi Landing Baseline Pack

Source ref: 7be7097^
Source commit: 793c287dbeb20e7e7ed33cccf9334c8eaafada3b
Non-runtime reference only

This directory freezes the approved pre-`7be7097` landing baseline for Phase 1 parity review.
It exists to anchor SHELL-01 and SHELL-03 restoration decisions without becoming another served `/entry-station` runtime.
Later phases must judge parity against this pack rather than the mutable working-tree `Kimi_Agent_Deployment_v14/**`.

## Extraction Commands

```bash
git archive --format=tar 7be7097^ Kimi_Agent_Deployment_v14 | tar -xf - -C .planning/baselines/kimi-landing-7be7097-parent
git ls-tree -r 7be7097^ -- Kimi_Agent_Deployment_v14 > .planning/baselines/kimi-landing-7be7097-parent/TREE-SHA1.txt
```

## Current Drift From Approved Baseline

- `index.html`
- `assets/index-BqLXAaHJ.js`
- `assets/index-DuxCbJQB.css`

## Usage Rules

- Review truth lives in `.planning/baselines/kimi-landing-7be7097-parent/Kimi_Agent_Deployment_v14/**`.
- Transitional runtime truth stays in the working-tree `Kimi_Agent_Deployment_v14/**`.
- Do not edit or serve this extracted pack as a public delivery path.
