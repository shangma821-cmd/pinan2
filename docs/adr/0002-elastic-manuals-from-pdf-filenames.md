# Product manuals are elastic, derived from PDF filenames at build time

The manual list is not hardcoded. A Vite plugin (`manualsManifestPlugin` in
`vite.config.ts`) scans `public/entry-station/manuals/*.pdf` at build/dev time and
exposes the result as the `virtual:manuals-manifest` module. Each `<slug>.pdf`
becomes one manual whose **id/slug is the filename** (e.g. `p1.pdf` →
`/entry-station/manuals/p1`). Display names are an optional override map in
`landing/content/manualsContent.ts`; otherwise the slug is shown.

## Considered Options

- **Hardcoded array of N products** — rejected: owner wanted the page to adapt to
  however many PDFs exist without editing code for each add/remove.
- **Runtime directory listing (nginx `autoindex json`)** — rejected: would let the
  owner drop a PDF on the live server with no rebuild, but needs an nginx config
  change and is unsupported by `vite dev`/`preview`, forcing two code paths.

## Consequences

- The PDF **filename is now the permanent NFC slug** — pick filenames before
  writing tags, and never rename a PDF that has a printed tag (it would break it).
  This supersedes the earlier "ids decoupled from filename" stance in ADR/CONTEXT.
- Adding/removing a manual requires a **rebuild + redeploy** (build-time scan).
  Dropping a PDF on the live server without rebuilding will not surface it.
- Zero PDFs → the hub shows a「暂无说明书」empty state.
