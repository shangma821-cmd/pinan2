# Entry Station Runtime Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore `/entry-station` to the real `793c287` runtime semantics, correct the milestone planning truth, and re-run shell verification before any React reconstruction work continues.

**Architecture:** Remove the temporary Vite remap/copy path that serves `Kimi_Agent_Deployment_v14/**` as the active landing runtime, letting Vite fall back to the original `public/entry-station/**` delivery path in both dev and build output. Then update the milestone planning artifacts so they describe the corrected runtime ownership, and finally re-run shell smoke verification against the restored wrapper-based academy bridge.

**Tech Stack:** Vite 6, React 19 shell, static `public/entry-station` assets, Markdown planning docs, shell smoke verification

---

## File Map

- `vite.config.ts`
  Responsibility: remove the incorrect `/entry-station -> Kimi_Agent_Deployment_v14` remap/copy behavior and return to Vite’s default `public/` handling.
- `.planning/ROADMAP.md`
  Responsibility: rename and resequence Phase 1 so runtime reset and shell revalidation happen before React reconstruction.
- `.planning/PROJECT.md`
  Responsibility: correct milestone context and current runtime ownership.
- `.planning/STATE.md`
  Responsibility: update current focus and stop-point text so future sessions resume from the corrected phase intent.
- `.planning/phases/01-baseline-lock-shell-contract/SOURCE-OF-TRUTH-INVENTORY.md`
  Responsibility: declare `public/entry-station/**` as the active transitional runtime and demote mutable `Kimi_Agent_Deployment_v14/**` to reference-only status.
- `.planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md`
  Responsibility: keep verification state honest, then record fresh automated/manual shell evidence once the restored runtime passes.

## Task 1: Capture the current failure against the desired runtime

**Files:**
- Verify: `vite.config.ts`
- Verify: `public/entry-station/index.html`
- Verify: `Kimi_Agent_Deployment_v14/index.html`

- [ ] **Step 1: Confirm the academy bridge lives in the public wrapper, not the Kimi package**

Run: `rg -n "OPEN_AI_ACADEMY|__openAiAcademy" public/entry-station/index.html Kimi_Agent_Deployment_v14/index.html`
Expected: matches appear only in `public/entry-station/index.html`

- [ ] **Step 2: Confirm the current Vite config still rewrites `/entry-station`**

Run: `rg -n "remapEntryStationPath|copyEntryStationToDist|entryStationSourcePlugin|Kimi_Agent_Deployment_v14" vite.config.ts`
Expected: matches found for the temporary remap/copy integration

- [ ] **Step 3: Reproduce the build mismatch that proves the wrong runtime is active**

Run: `npm run build && cmp -s public/entry-station/index.html dist/entry-station/index.html`
Expected: FAIL because the current build output does not yet match the `public/entry-station` runtime

## Task 2: Restore `/entry-station` runtime ownership to `public/entry-station`

**Files:**
- Modify: `vite.config.ts`
- Verify: `EntryShell.tsx`

- [ ] **Step 1: Remove the `fs` dependency and the custom entry-station remap/copy helpers from `vite.config.ts`**

Delete:
- `import fs from 'fs'`
- `entryStationRoute`
- `entryStationSourceDir`
- `remapEntryStationPath(...)`
- `copyEntryStationToDist(...)`
- `entryStationSourcePlugin(...)`

- [ ] **Step 2: Keep all non-landing Vite behavior unchanged**

Preserve:
- existing React plugin
- server host/port
- Volc proxies
- `define` values
- path alias resolution

- [ ] **Step 3: Verify the restored build output now comes from `public/entry-station/**`**

Run: `npm run build && cmp -s public/entry-station/index.html dist/entry-station/index.html && cmp -s public/entry-station/assets/index-BqLXAaHJ.js dist/entry-station/assets/index-BqLXAaHJ.js && cmp -s public/entry-station/assets/index-DuxCbJQB.css dist/entry-station/assets/index-DuxCbJQB.css`
Expected: PASS

- [ ] **Step 4: Verify the old Kimi runtime copy path is no longer active in build output**

Run: `test ! -e dist/Kimi_Agent_Deployment_v14/index.html`
Expected: PASS

- [ ] **Step 5: Commit the runtime reset**

Run:
```bash
git add vite.config.ts
git commit -m "fix: restore entry-station public runtime"
```

## Task 3: Correct the planning truth to match the restored runtime

**Files:**
- Modify: `.planning/ROADMAP.md`
- Modify: `.planning/PROJECT.md`
- Modify: `.planning/STATE.md`
- Modify: `.planning/phases/01-baseline-lock-shell-contract/SOURCE-OF-TRUTH-INVENTORY.md`
- Modify: `.planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md`

- [ ] **Step 1: Rename Phase 1 in `.planning/ROADMAP.md` to reflect runtime reset and shell revalidation**

Update:
- Phase 1 title
- Phase 1 goal
- Phase 1 success criteria
- downstream phase names/descriptions where they currently assume the incorrect Vite-served Kimi runtime

- [ ] **Step 2: Update `.planning/PROJECT.md` so milestone context reflects the corrected transitional runtime**

Add or revise:
- current context mentioning the previous Vite remap was incorrect for this milestone
- current transitional owner is `public/entry-station/**`
- `Kimi_Agent_Deployment_v14/**` remains baseline/reference material only

- [ ] **Step 3: Update `.planning/STATE.md` so the active focus points at runtime reset first**

Change:
- current focus
- stopped-at text
- recent activity text if needed so resume context matches the new phase intent

- [ ] **Step 4: Update `SOURCE-OF-TRUTH-INVENTORY.md` so it no longer treats mutable `Kimi_Agent_Deployment_v14/**` as runtime truth**

Required outcome:
- `public/entry-station/**` becomes the active transitional runtime
- mutable `Kimi_Agent_Deployment_v14/**` becomes non-canonical working reference
- the wrapper-provided academy bridge is documented as currently active runtime behavior, not discardable glue

- [ ] **Step 5: Keep `SHELL-CONTRACT-CHECKLIST.md` in honest pre-verification state**

Ensure:
- automated verification lines remain `PENDING` until Task 4 runs
- the academy handoff section acknowledges the current trigger comes from the transitional wrapper but the public outcome remains `/academy`

- [ ] **Step 6: Verify the planning docs contain the corrected truth**

Run: `rg -n "public/entry-station/\\*\\*|Runtime Reset|Kimi_Agent_Deployment_v14/\\*\\*|wrapper|academy" .planning/ROADMAP.md .planning/PROJECT.md .planning/STATE.md .planning/phases/01-baseline-lock-shell-contract/SOURCE-OF-TRUTH-INVENTORY.md .planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md`
Expected: matches show the corrected runtime ownership and updated phase framing

- [ ] **Step 7: Commit the planning correction**

Run:
```bash
git add .planning/ROADMAP.md .planning/PROJECT.md .planning/STATE.md .planning/phases/01-baseline-lock-shell-contract/SOURCE-OF-TRUTH-INVENTORY.md .planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md
git commit -m "docs: reset runtime planning truth"
```

## Task 4: Re-run shell smoke against the restored runtime

**Files:**
- Modify: `.planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md`

- [ ] **Step 1: Clear stale preview artifacts and confirm the smoke port is free**

Run: `rm -f /tmp/phase01-shell-preview.pid /tmp/phase01-shell-preview.log && ! lsof -ti tcp:4273 >/dev/null`
Expected: PASS

- [ ] **Step 2: Rebuild and confirm the restored runtime still carries the academy bridge**

Run: `npm run build && test -f dist/entry-station/index.html && rg -n "OPEN_AI_ACADEMY|__openAiAcademy" dist/entry-station/index.html`
Expected: PASS with bridge strings found in `dist/entry-station/index.html`

- [ ] **Step 3: Start preview and capture the real listener PID**

Run:
```bash
npm run preview -- --host 127.0.0.1 --port 4273 > /tmp/phase01-shell-preview.log 2>&1 &
for i in {1..30}; do
  curl -sfI http://127.0.0.1:4273/entry-station/index.html >/dev/null && break
  sleep 1
done
PREVIEW_PID=$(lsof -ti tcp:4273 | head -n1)
printf '%s' "$PREVIEW_PID" > /tmp/phase01-shell-preview.pid
[ -n "$PREVIEW_PID" ] && kill -0 "$PREVIEW_PID" && lsof -ti tcp:4273 | grep -qx "$PREVIEW_PID"
```
Expected: PASS with a non-empty preview PID

- [ ] **Step 4: Update the automated verification lines in `SHELL-CONTRACT-CHECKLIST.md`**

Set these exact lines:
- `Build command: PASS (npm run build)`
- `Build artifact: PASS (dist/entry-station/index.html)`
- `Preview URL: http://127.0.0.1:4273`
- `Preview PID: <actual pid>`

- [ ] **Step 5: Pause for human smoke verification**

Ask the user to verify only:
- `/` still shows the landing through the shell iframe
- landing academy entry reaches `/academy`
- academy return goes back to `/`

Resume only after the user replies `approved`.

- [ ] **Step 6: Persist manual approval and stop preview**

After approval:
- set `Manual pass: /: PASS (approved)`
- set `Manual pass: landing -> academy: PASS (approved)`
- set `Manual pass: academy -> /: PASS (approved)`
- stop the preview with `kill "$(cat /tmp/phase01-shell-preview.pid)"`
- remove `/tmp/phase01-shell-preview.pid`
- confirm `! lsof -ti tcp:4273 >/dev/null`

- [ ] **Step 7: Run final verification**

Run:
```bash
rg -n "Build command: PASS \\(npm run build\\)" .planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md && \
rg -n "Build artifact: PASS \\(dist/entry-station/index.html\\)" .planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md && \
rg -n "Preview URL: http://127.0.0.1:4273" .planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md && \
rg -n "Manual pass: /: PASS \\(approved\\)" .planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md && \
rg -n "Manual pass: landing -> academy: PASS \\(approved\\)" .planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md && \
rg -n "Manual pass: academy -> /: PASS \\(approved\\)" .planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md && \
[ ! -f /tmp/phase01-shell-preview.pid ] && ! lsof -ti tcp:4273 >/dev/null
```
Expected: PASS

- [ ] **Step 8: Commit the revalidated shell checklist**

Run:
```bash
git add .planning/phases/01-baseline-lock-shell-contract/SHELL-CONTRACT-CHECKLIST.md
git commit -m "test: revalidate shell on restored runtime"
```
