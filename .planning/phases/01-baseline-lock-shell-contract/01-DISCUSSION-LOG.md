# Phase 1: Baseline Lock & Shell Contract - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-10
**Phase:** 01-Baseline Lock & Shell Contract
**Areas discussed:** Baseline freeze format, shell contract strictness, source of truth during transition, Phase 1 evidence depth

---

## Baseline Freeze Format

| Option | Description | Selected |
|--------|-------------|----------|
| Reference pack | Restore the pre-`7be7097^` landing as a review-only baseline pack that later phases can compare against directly. | ✓ |
| Manifest-only | Record commit/file inventory/checksums without materializing the original files in the branch. | |
| Dual lock | Store both a review pack and a parallel manifest/checksum lock. | |

**User's choice:** Reference pack
**Notes:** The baseline should be easy to inspect and compare against later, but it must remain a non-runtime reference artifact.

---

## Shell Contract Strictness

| Option | Description | Selected |
|--------|-------------|----------|
| Lock external behavior only | Keep `/` -> iframe -> `/entry-station/index.html`, preserve landing -> academy entry and return behavior, but leave bridge internals flexible. | ✓ |
| Lock external behavior and bridge shape | Preserve both user-visible behavior and today's `OPEN_AI_ACADEMY` / `__openAiAcademy` bridge contract. | |
| Lock the full transition wrapper | Treat the current wrapper layer itself as part of the Phase 1 contract. | |

**User's choice:** Lock external behavior only
**Notes:** The academy handoff must keep working, but the implementation detail of the bridge should stay replaceable during reconstruction.

---

## Source Of Truth During Transition

| Option | Description | Selected |
|--------|-------------|----------|
| Kimi single source of truth | Baseline pack plus `Kimi_Agent_Deployment_v14` define landing content; `public/entry-station` may only host temporary glue. | ✓ |
| Dual-source transition | Allow both `Kimi_Agent_Deployment_v14` and `public/entry-station` to carry landing content temporarily. | |
| Freeze old public layer too | Treat `public/entry-station` as an equal frozen content source until final cutover. | |

**User's choice:** Kimi single source of truth
**Notes:** Phase 1 should actively prevent future content drift between duplicated landing trees.

---

## Phase 1 Evidence Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Lightweight evidence | Baseline pack, shell contract checklist, source inventory, and smoke verification only. | ✓ |
| Medium evidence | Lightweight evidence plus key screenshot-level spot checks. | |
| Heavy evidence | Full screenshot matrix and exhaustive page-level parity proof in Phase 1. | |

**User's choice:** Lightweight evidence
**Notes:** Heavy visual parity evidence belongs to later parity-focused phases rather than this phase's setup work.

---

## the agent's Discretion

- Baseline reference pack naming and exact on-disk organization.
- Checklist and provenance inventory formatting.
- Minimal smoke verification steps that best demonstrate the locked shell behavior.

## Deferred Ideas

- Full screenshot-by-screenshot parity dossier.
- Final removal of legacy wrapper behavior after React cutover.
