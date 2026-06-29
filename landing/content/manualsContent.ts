import { manualsManifest } from 'virtual:manuals-manifest';

// Product-manual feature data — ELASTIC.
//
// The list adapts to whatever PDFs exist in public/entry-station/manuals/ at
// build time (see manualsManifestPlugin in vite.config.ts). Each `<slug>.pdf`
// becomes a manual whose id/slug is the filename. That slug is PERMANENT: it is
// the URL encoded on NFC tags (https://pinancs.com/entry-station/manuals/<slug>),
// so pick a filename and keep it — renaming the file breaks the printed tag.
//
// To add/remove a manual: drop/delete the PDF and rebuild. To give a product a
// nicer display name than its filename, add an entry to `displayNames` below.

export interface LandingManual {
  /** Permanent slug = PDF filename without extension. Encoded on NFC tags. */
  id: string;
  /** Display name — defaults to the slug; override via `displayNames`. */
  name: string;
  /** Absolute path to the manual PDF under the /entry-station base. */
  pdfPath: string;
}

/** Optional display-name overrides, keyed by slug (PDF filename without .pdf). */
const displayNames: Record<string, string> = {
  // p1: '产品一',
  // p2: '产品二',
};

export const landingManuals: LandingManual[] = manualsManifest.map((entry) => ({
  id: entry.id,
  name: displayNames[entry.id] ?? entry.id,
  pdfPath: `/entry-station/manuals/${entry.file}`,
}));

export function findManual(id: string | undefined): LandingManual | null {
  if (!id) return null;
  return landingManuals.find((manual) => manual.id === id) ?? null;
}
