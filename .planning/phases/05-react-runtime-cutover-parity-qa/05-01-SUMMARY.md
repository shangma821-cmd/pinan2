---
phase: 05-react-runtime-cutover-parity-qa
plan: 01
subsystem: runtime
tags: [cutover, iframe, assets, vite]
requires: []
provides:
  - Shell iframe now targets React-owned `/entry-station`
  - Landing media now resolves through the Vite asset pipeline
affects: [05-02, shell-runtime, release-build]
tech-stack:
  added: []
  patterns: [bundler-owned media imports, same-route iframe cutover]
key-files:
  created: []
  modified:
    - EntryShell.tsx
    - landing/assets.ts
requirements-completed: [XPG-03]
duration: session-local
completed: 2026-04-20
---

# Phase 05 Plan 01: Runtime Cutover Summary

**The public shell and direct landing route now resolve to the same React-owned runtime, landing media is bundled through Vite instead of public-path string references, and the React shell itself now preserves the academy bridge that used to live in the static wrapper.**
