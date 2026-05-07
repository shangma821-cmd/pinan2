---
phase: 05-react-runtime-cutover-parity-qa
plan: 02
subsystem: testing
tags: [playwright, cutover, parity]
requires:
  - phase: 05-react-runtime-cutover-parity-qa
    provides: Runtime cutover from 05-01
provides:
  - Browser proof for direct + iframe cutover parity
  - Combined landing regression suite after cutover
affects: [phase-verification, milestone-completion]
tech-stack:
  added: []
  patterns: [iframe parity assertions, bundled-asset assertions]
key-files:
  created:
    - tests/landing-cutover.spec.ts
  modified: []
requirements-completed: [XPG-03]
duration: session-local
completed: 2026-04-20
---

# Phase 05 Plan 02: Cutover Verification Summary

**Phase 5 now has focused browser proof that both direct `/entry-station` and the `/` shell iframe are serving the same React-owned landing runtime, and that academy handoff still survives the cutover in both paths.**

Manual interaction spot-check: pending visual follow-up
