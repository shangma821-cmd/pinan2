# Entry Station Routing Design

**Goal:** Keep the existing `/entry-station` URL stable while making both `pnpm dev` and `npm run build` serve the compliance-safe page from `Kimi_Agent_Deployment_v14`.

**Context**

- The home shell still loads `/entry-station/index.html` via iframe.
- The compliance-safe page already exists under `Kimi_Agent_Deployment_v14`.
- Duplicating that page into `public/entry-station` creates large content diffs and two sources of truth.

**Approved approach**

1. Keep the iframe URL unchanged.
2. Add a small Vite integration layer so `/entry-station/*` resolves to `Kimi_Agent_Deployment_v14/*` during development.
3. Copy `Kimi_Agent_Deployment_v14/*` into `dist/entry-station/*` during production build.
4. Leave the page content files themselves untouched.

**Files in scope**

- Modify: `vite.config.ts`
- Verify only: `EntryShell.tsx`
- Verify only: `Kimi_Agent_Deployment_v14/**`

**Non-goals**

- No edits to `Kimi_Agent_Deployment_v14` page content.
- No bulk replacement of `public/entry-station` assets.
- No route or iframe URL changes.

**Validation**

- `pnpm dev` serves the compliance-safe page at `/entry-station/index.html`
- `/` shows that page through the existing iframe
- `npm run build` writes the same page to `dist/entry-station`
