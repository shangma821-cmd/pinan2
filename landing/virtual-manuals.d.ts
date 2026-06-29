declare module 'virtual:manuals-manifest' {
  /**
   * Manuals discovered at build/dev time by the manualsManifestPlugin
   * (see vite.config.ts). `id` is the PDF filename without extension and
   * doubles as the permanent NFC slug; `file` is the filename to serve.
   */
  export const manualsManifest: Array<{ id: string; file: string }>;
}
