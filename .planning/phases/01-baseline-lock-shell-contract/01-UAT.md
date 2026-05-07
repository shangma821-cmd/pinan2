---
status: testing
phase: 01-baseline-lock-shell-contract
source:
  - .planning/phases/01-baseline-lock-shell-contract/01-01-SUMMARY.md
  - .planning/phases/01-baseline-lock-shell-contract/01-02-SUMMARY.md
  - .planning/phases/01-baseline-lock-shell-contract/01-03-SUMMARY.md
started: 2026-04-14T07:45:55Z
updated: 2026-04-14T08:02:02Z
---

## Current Test

number: 2
name: Landing to Academy
expected: |
  Triggering the academy entry from the landing should switch the shell to `/academy` using the existing same-origin handoff behavior.
awaiting: user response

## Tests

### 1. Shell Entry Landing
expected: Visiting `/` should still render the landing through the existing shell iframe. The landing should appear normally without requiring a public URL change.
result: pass

### 2. Landing to Academy
expected: Triggering the academy entry from the landing should switch the shell to `/academy` using the existing same-origin handoff behavior.
result: [pending]

### 3. Academy Return
expected: Using the academy return action should bring the user back to `/` and restore the landing entry experience.
result: [pending]

## Summary

total: 3
passed: 1
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps

[]
