# Render product manuals inline with the existing global pdf.js (not an iframe or react-pdf)

The product-manual pages must render a PDF inline inside a branded mobile page,
reached primarily by customers tapping an NFC tag on their phone. We render the PDF
to `<canvas>` using the **already-loaded global `window.pdfjsLib`** (pdf.js 3.11.174,
loaded in `index.html`), mirroring the existing `services/pdfService.ts` pattern.

## Considered Options

- **Plain `<iframe src="x.pdf">`** — rejected: renders on desktop but is blank/non-scrollable
  on iOS Safari and many Android browsers, which is exactly the primary (mobile/NFC) case.
- **Hosted viewer (Google Docs / Mozilla)** — rejected: the site serves mainland-China users
  on `pinancs.com`, where Google is blocked, so the viewer would not load.
- **Add `react-pdf` npm dependency** — rejected: would bundle a second copy of pdf.js
  alongside the one already in `index.html`, and diverge from `pdfService.ts`.

## Consequences

- No new dependency; consistent with existing PDF handling.
- pdf.js is currently loaded from a CDN (cdnjs) in `index.html`. Self-hosting that script
  to improve mainland-China load reliability is a separate, still-open decision.
