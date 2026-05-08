# Shell Contract Checklist

## Public Entry

- Host shell owner: `EntryShell.tsx`
- Runtime delivery owner: `vite.config.ts`
- Public entry contract: visiting `/` must continue to render the landing through the existing shell iframe.
- Stable landing target: the iframe target remains `/entry-station/index.html` as the public landing path, even though the current implementation appends a version query.

## Academy Handoff

- Landing-triggered academy entry must reach `/academy`.
- `EntryShell.tsx` currently supports both `window.__openAiAcademy` and same-origin `OPEN_AI_ACADEMY` postMessage handling, but those names are implementation details rather than public contract.

## Return To Entry

- The academy shell must provide a return action that brings the user back to `/`.
- The current shell implementation does this through the floating `返回入口首页` action in `EntryShell.tsx`; later phases may change the internal mechanism but not the user-visible outcome.

## Non-Contract Internals

- `OPEN_AI_ACADEMY`
- `window.__openAiAcademy`
- DOM injection timing and wrapper-specific selectors
- `data-ai-academy-tab`
- `public/entry-station/index.html` modal/tab wiring

## Smoke Steps

1. Run `npm run build`.
2. Verify `dist/entry-station/index.html` exists.
3. Start preview and open `/`.
4. Confirm the landing still loads through the shell iframe.
5. Trigger the landing academy entry and confirm the shell reaches `/academy`.
6. Use the academy return action and confirm the shell returns to `/`.

## Verification Record

- Build command: PASS (npm run build)
- Build artifact: PASS (dist/entry-station/index.html)
- Preview URL: http://127.0.0.1:4273
- Preview PID: 78378
- Manual pass: /: PENDING
- Manual pass: landing -> academy: PENDING
- Manual pass: academy -> /: PENDING
