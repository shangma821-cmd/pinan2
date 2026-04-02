---
status: awaiting_human_verify
trigger: "Voice Q&A button on /academy fails with WebSocket error - Volc realtime dialog WebSocket connection fails before opening when using proxy mode"
created: 2026-03-11T00:00:00Z
updated: 2026-03-11T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED - No .env file exists. volcDialogAppId and volcDialogAccessToken are empty strings. The proxyReqWs handler skips injecting X-Api-App-ID and X-Api-Access-Key headers. Volc upstream rejects the unauthenticated WebSocket handshake before opening.
test: Confirmed by reading vite.config.ts (lines 13-14, 106-107), checking all .env* files (none found except .env.deploy.example)
expecting: Creating .env with VITE_VOLC_DIALOG_APP_ID and VITE_VOLC_DIALOG_ACCESS_TOKEN will fix the upstream auth rejection
next_action: Create .env file with dialog credentials

## Symptoms

expected: Clicking the voice Q&A button should establish a WebSocket connection to the Volc realtime dialog service and start a real-time conversation.
actual: WebSocket fails before opening. Error thrown at geminiService.ts:2243.
errors: |
  Failed to start realtime Q&A Error: Volc realtime websocket error. WebSocket failed before opening.
  Endpoint mode=proxy (/api/volc-dialog -> ws://localhost:5173/api/volc-dialog).
  Ensure your local server has a WS proxy route to /api/volc-dialog and injects
  X-Api-App-ID/X-Api-Access-Key/X-Api-Resource-Id/X-Api-App-Key.
  Likely upstream handshake rejection (resource_id=volc.speech.dialog).
  Verify VITE_VOLC_DIALOG_APP_ID / VITE_VOLC_DIALOG_ACCESS_TOKEN / VITE_VOLC_DIALOG_RESOURCE_ID
  are from the same app and the realtime dialog resource is granted in Volc console.
  at ws.onerror (geminiService.ts:2243:21)
reproduction: Click the voice Q&A button on the /academy page.
started: Unknown - investigating current state of proxy configuration.

## Eliminated

- hypothesis: Vite proxy missing ws:true flag
  evidence: vite.config.ts line 96 has `ws: true` for /api/volc-dialog
  timestamp: 2026-03-11

- hypothesis: Wrong path rewrite
  evidence: vite.config.ts line 99 has `rewrite: () => '/api/v3/realtime/dialogue'` which is correct
  timestamp: 2026-03-11

- hypothesis: proxyReqWs event not used
  evidence: vite.config.ts line 101 correctly uses proxy.on('proxyReqWs', ...)
  timestamp: 2026-03-11

## Evidence

- timestamp: 2026-03-11
  checked: vite.config.ts lines 13-16
  found: volcDialogAppId = env.VITE_VOLC_DIALOG_APP_ID || env.VITE_VOLC_TTS_APP_ID || env.VITE_VOLC_APP_ID || ''; volcDialogAccessToken and volcDialogResourceId follow same pattern
  implication: If no .env exists, all these resolve to empty string or default

- timestamp: 2026-03-11
  checked: vite.config.ts lines 106-110 (proxyReqWs handler)
  found: Headers are injected conditionally: `if (volcDialogAppId) proxyReq.setHeader(...)`. With empty appId and accessToken, these are skipped entirely.
  implication: No auth headers are sent to the upstream Volc WebSocket endpoint

- timestamp: 2026-03-11
  checked: All .env* files in project root
  found: Only .env.deploy.example exists. No .env, .env.local, .env.development, or .env.development.local
  implication: VITE_VOLC_DIALOG_APP_ID and VITE_VOLC_DIALOG_ACCESS_TOKEN are never set. Proxy sends WebSocket upgrade to wss://openspeech.bytedance.com without credentials.

- timestamp: 2026-03-11
  checked: geminiService.ts buildRealtimeWsUrl() at line 1167-1179
  found: When endpoint is /api/volc-dialog (relative path), it builds ws://localhost:{port}/api/volc-dialog using window.location.host. Port 5173 in error message confirms Vite default port was used (3000 was busy).
  implication: The WebSocket URL construction is correct - ws://localhost:5173/api/volc-dialog routes to Vite proxy, then to Volc. The problem is missing credentials, not routing.

## Resolution

root_cause: No .env file in the project. vite.config.ts reads VITE_VOLC_DIALOG_APP_ID and VITE_VOLC_DIALOG_ACCESS_TOKEN to inject auth headers into the WebSocket proxy's proxyReqWs handler. Without these env vars, the conditional `if (volcDialogAppId)` and `if (volcDialogAccessToken)` at lines 106-107 are both false, so X-Api-App-ID and X-Api-Access-Key headers are never sent. The Volc upstream at wss://openspeech.bytedance.com/api/v3/realtime/dialogue rejects the unauthenticated WebSocket handshake before the connection opens.
fix: Create .env file with valid VITE_VOLC_DIALOG_APP_ID and VITE_VOLC_DIALOG_ACCESS_TOKEN from the Volc console (realtime dialog resource must be granted). After creating the .env, restart the Vite dev server so it reloads the env vars.
verification: After restart, clicking voice Q&A button should open the WebSocket (ws.onopen fires) and complete the handshake.
files_changed:
  - .env (new file - must be created with valid credentials)
