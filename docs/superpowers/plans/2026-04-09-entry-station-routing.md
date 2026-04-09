# Entry Station Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep `/entry-station` as the stable entry URL while sourcing its content from `Kimi_Agent_Deployment_v14` in both dev and build output.

**Architecture:** Add a small Vite plugin in `vite.config.ts` that serves `Kimi_Agent_Deployment_v14` files when `/entry-station/*` is requested in dev, and copies that same directory into `dist/entry-station` during build. This keeps the shell entry unchanged and avoids duplicating page content.

**Tech Stack:** Vite 6, Node fs/path utilities, existing React/Vite shell

---

### Task 1: Add a failing regression check for build output

**Files:**
- Modify: `vite.config.ts`
- Verify: `EntryShell.tsx`

- [ ] **Step 1: Confirm the current entry still points at `/entry-station/index.html`**

Run: `sed -n '26,34p' EntryShell.tsx`
Expected: iframe `src` is `/entry-station/index.html?...`

- [ ] **Step 2: Reproduce the current mismatch**

Run: `npm run build && test -f dist/entry-station/index.html && cmp -s Kimi_Agent_Deployment_v14/index.html dist/entry-station/index.html`
Expected: command fails because `dist/entry-station/index.html` does not match the compliance-safe source yet

### Task 2: Add the minimal Vite integration

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Add a small plugin that serves `/entry-station/*` from `Kimi_Agent_Deployment_v14/*` in dev**

- [ ] **Step 2: Add build-time copy logic that writes `Kimi_Agent_Deployment_v14/*` to `dist/entry-station/*`**

- [ ] **Step 3: Keep existing Vite behavior unchanged for all other routes**

### Task 3: Verify dev and build behavior

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Run the focused regression check**

Run: `npm run build && test -f dist/entry-station/index.html && cmp -s Kimi_Agent_Deployment_v14/index.html dist/entry-station/index.html`
Expected: command succeeds

- [ ] **Step 2: Verify built asset files are also copied**

Run: `cmp -s Kimi_Agent_Deployment_v14/assets/index-BqLXAaHJ.js dist/entry-station/assets/index-BqLXAaHJ.js && cmp -s Kimi_Agent_Deployment_v14/assets/index-DuxCbJQB.css dist/entry-station/assets/index-DuxCbJQB.css`
Expected: command succeeds

- [ ] **Step 3: Verify dev serving path**

Run: `pnpm dev`
Expected: `/entry-station/index.html` resolves to the compliance-safe page while `/` keeps using the same iframe entry path
