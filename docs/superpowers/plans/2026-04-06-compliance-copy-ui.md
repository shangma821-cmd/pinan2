# Compliance Copy UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the packaged `Kimi_Agent_Deployment_v14` landing site with a visually strong but compliance-safer single-page experience that removes medical/audit-sensitive claims from the deployed entry files.

**Architecture:** Keep scheme 1 intentionally narrow: do not reconstruct the original React source app. Instead, overwrite the packaged site entrypoint and packaged assets with a new static landing page, backed by a keyword smoke-check script so we can verify the deployed files no longer contain the banned copy set.

**Tech Stack:** Static HTML, CSS, vanilla JS, Node.js verification script, existing image assets

---

### Task 1: Add a compliance smoke check first

**Files:**
- Create: `scripts/check-kimi-compliance.mjs`

- [ ] **Step 1: Write the failing compliance check**

Create a Node script that scans these deployed files:
- `Kimi_Agent_Deployment_v14/index.html`
- `Kimi_Agent_Deployment_v14/assets/index-BqLXAaHJ.js`
- `Kimi_Agent_Deployment_v14/assets/index-DuxCbJQB.css`

The script must fail when it finds any of these strings:
- `二类医疗器械`
- `黄十字`
- `国家背书`
- `专利`
- `软著`
- `医生`
- `医护`
- `治疗`
- `医疗器械`
- `数智中医`

- [ ] **Step 2: Run the check to verify RED**

Run: `node scripts/check-kimi-compliance.mjs`
Expected: FAIL because the current packaged site still contains banned wording.

### Task 2: Replace the packaged site with compliant entry files

**Files:**
- Modify: `Kimi_Agent_Deployment_v14/index.html`
- Replace: `Kimi_Agent_Deployment_v14/assets/index-BqLXAaHJ.js`
- Replace: `Kimi_Agent_Deployment_v14/assets/index-DuxCbJQB.css`

- [ ] **Step 1: Rewrite the packaged HTML entry**

Build a single-page landing site with:
- Hero
- Brand introduction
- Service journey
- Scene cards
- Capability / product cards using neutral wording
- Store cooperation / franchise section
- Contact block

Copy rules:
- Remove medical, certification, national endorsement, patent, and software copyright claims
- Replace any genuine staff-role references carefully; use `调理师` or `服务顾问` only where role wording is needed
- Keep copy complete, readable, and premium rather than sparse

- [ ] **Step 2: Replace the packaged JS with minimal safe behavior**

Use lightweight vanilla JS only for:
- mobile nav toggle if needed
- smooth section activation / year rendering if needed

Do not ship old SPA route/content data.

- [ ] **Step 3: Replace the packaged CSS with the new design system**

Use a calm, premium, light-theme visual system:
- soft blue primary
- warm orange CTA
- layered cards
- responsive sections
- visible focus states
- reduced-motion-safe animations

### Task 3: Verify green and no-regression basics

**Files:**
- Test: `scripts/check-kimi-compliance.mjs`

- [ ] **Step 1: Run the compliance check to verify GREEN**

Run: `node scripts/check-kimi-compliance.mjs`
Expected: PASS with no banned strings found in deployed entry files.

- [ ] **Step 2: Run the existing project build**

Run: `npm run build`
Expected: PASS so the main workspace app is not broken by the new plan-1 changes.

- [ ] **Step 3: Review final diff**

Run: `git status --short`
Expected: only the packaged site files, the check script, and this plan doc are changed.
