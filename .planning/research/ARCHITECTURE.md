# Architecture Research: Kimi Landing Restoration + React Reconstruction

**Context:** Subsequent milestone to restore the original Kimi landing baseline from `7be7097^`, rebuild it as maintainable React source, and keep the existing `/entry-station` iframe contract stable.
**Researched:** 2026-04-09
**Confidence:** HIGH

## Recommendation

Keep the current shell boundary exactly where it is:

- `EntryShell` remains the owner of `/` vs `/academy`
- the landing remains a separate document loaded at `/entry-station/index.html`
- the academy handoff remains message-based from iframe to parent

Replace the current packaged/static dependency with a real second Vite/React entry, not with another copy layer.

That means:

1. Build the landing as its own React app under a dedicated `entry-station/` source area.
2. Serve and build it through Vite as a nested HTML entry at `/entry-station/index.html`.
3. Keep `EntryShell.tsx` mostly unchanged so the existing iframe and `/academy` behavior stay stable.

Do **not** fold the landing into the main SPA tree. The iframe is already the compatibility boundary, and keeping it avoids breaking the existing entry contract.

## Recommended Integration Shape

### Stable Boundary

`index.tsx` -> `EntryShell.tsx`

- `/` renders the iframe shell
- `/academy` renders the existing academy `App`
- iframe `src` stays `/entry-station/index.html`

`/entry-station/index.html` -> new landing React entry

- bootstraps a dedicated landing root
- owns landing-only styles, assets, and content structure
- sends a parent request when the user should enter the academy

### Shared Contract

Add one small shared module for the iframe-to-parent contract, for example:

- `shared/entryContract.ts`

It should export:

- `ACADEMY_PATH = '/academy'`
- `OPEN_AI_ACADEMY = 'OPEN_AI_ACADEMY'`
- a tiny helper used by the landing to request academy open

This removes string drift between the shell and the landing. Right now the same contract is duplicated across `EntryShell.tsx` and legacy static HTML.

## New vs Modified Boundaries

### New

- `entry-station/index.html`
- `entry-station/main.tsx`
- `entry-station/App.tsx`
- `entry-station/components/*`
- `entry-station/sections/*`
- `entry-station/content.ts` or `entry-station/data/*`
- `entry-station/styles.css`
- `entry-station/assets/*`
- `shared/entryContract.ts`

### Modified

- `vite.config.ts`
  - remove the long-term dependency on the custom `/entry-station` rewrite/copy plugin
  - add official multi-entry build input so root `index.html` and `entry-station/index.html` are both built
- `EntryShell.tsx`
  - keep behavior the same
  - optionally import shared contract constants instead of hard-coded message/path strings

### Intentionally Unchanged

- `index.tsx`
- main academy `App.tsx`
- academy services/components

### Retire After Cutover

- `Kimi_Agent_Deployment_v14/*` as a runtime dependency
- `public/entry-station/*` as a second source of truth

Keep those only as migration references until parity is confirmed.

## Resource and Data Flow

1. Browser loads `/`.
2. `EntryShell` renders an iframe to `/entry-station/index.html`.
3. Vite serves the nested landing entry as its own document.
4. The landing React app imports its images/styles/content from source-controlled modules.
5. When the user chooses the academy path, the landing calls the shared bridge helper:
   - first `window.parent.postMessage({ type: OPEN_AI_ACADEMY }, origin)`
   - then optional `window.parent.__openAiAcademy?.()` fallback for compatibility
   - final fallback: `window.location.href = '/academy'` if opened standalone
6. `EntryShell` receives the message and switches to academy mode exactly as it does now.

This keeps cross-document communication minimal and preserves the current `/entry-station` -> `/academy` behavior.

## Migration Seam

Use the landing document boundary as the seam.

During reconstruction:

- keep the current packaged landing serving `/entry-station`
- build the restored React landing in parallel under a temporary preview entry, such as `/entry-station-preview/index.html`
- validate visual/content parity and academy handoff there first

At cutover:

- move the React landing to the real `/entry-station/index.html` entry
- switch Vite build config to emit that entry directly
- then remove the custom static rewrite/copy path

This avoids replacing the stable entry path until the React version is already proven.

## Sensible Build Order

1. Recover baseline structure and assets from `7be7097^` into typed React sections and imported assets.
2. Build the landing React app in isolation with a temporary preview entry.
3. Extract the academy handoff into a shared contract module and make the preview entry use it.
4. Add the real `entry-station/index.html` Vite entry and build both app entries from source.
5. Point runtime `/entry-station` to the new React entry without changing `EntryShell`’s public contract.
6. Remove `Kimi_Agent_Deployment_v14` and `public/entry-station` from runtime use once parity, build output, and iframe handoff are verified.

## Implementation Notes

- Prefer imported assets inside the landing source over `public/` copies. That gives hashed output, dependency tracking, and one source of truth.
- Keep landing content data-driven where possible. The restored page should be decomposed into sections and content objects, not one monolithic JSX file.
- Avoid coupling landing state to the academy app. The only shared concern should be the handoff contract.
- Keep the iframe. Replacing it with an inline route would expand scope and risk by changing document, styling, and integration assumptions all at once.

## Sources

- Repo inspection:
  - `EntryShell.tsx`
  - `vite.config.ts`
  - `index.tsx`
  - `App.tsx`
  - `Kimi_Agent_Deployment_v14/index.html`
  - `public/entry-station/index.html`
- Official docs:
  - Vite build guide: https://vite.dev/guide/build
  - Vite static asset handling: https://vite.dev/guide/assets.html
  - React `createRoot`: https://react.dev/reference/react-dom/client/createRoot
