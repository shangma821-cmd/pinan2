// Thin accessor for the globally-loaded pdf.js (see index.html / ADR-0001).
// The manual viewer reuses this single global instead of bundling react-pdf.
//
// `window.pdfjsLib` is declared as `any` by services/pdfService.ts; we do NOT
// re-declare the global here (that would conflict). Instead we read it through
// a locally-typed cast so this module stays strongly typed in isolation.

export interface PdfjsLib {
  getDocument: (src: { url: string }) => { promise: Promise<PdfDocumentProxy> };
  GlobalWorkerOptions?: { workerSrc?: string };
}

function getGlobalPdfjs(): PdfjsLib | undefined {
  return (window as unknown as { pdfjsLib?: PdfjsLib }).pdfjsLib;
}

export interface PdfPageViewport {
  width: number;
  height: number;
}

export interface PdfPageProxy {
  getViewport: (params: { scale: number }) => PdfPageViewport;
  render: (params: { canvasContext: CanvasRenderingContext2D; viewport: PdfPageViewport }) => {
    promise: Promise<void>;
  };
}

export interface PdfDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPageProxy>;
}

/**
 * Resolve the global `pdfjsLib`. The script is a synchronous tag in <head>, so
 * it is normally present at mount; we still poll briefly to stay robust against
 * load ordering. Rejects if it never appears within the timeout.
 */
export function ensurePdfjs(timeoutMs = 10000): Promise<PdfjsLib> {
  const existing = getGlobalPdfjs();
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve, reject) => {
    const startedAt = performance.now();
    const tick = () => {
      const lib = getGlobalPdfjs();
      if (lib) {
        resolve(lib);
        return;
      }
      if (performance.now() - startedAt >= timeoutMs) {
        reject(new Error('pdf.js 未能加载'));
        return;
      }
      window.setTimeout(tick, 60);
    };
    tick();
  });
}

/** Load a PDF document by URL using the global pdf.js. */
export async function loadPdfDocument(url: string): Promise<PdfDocumentProxy> {
  const pdfjsLib = await ensurePdfjs();
  return pdfjsLib.getDocument({ url }).promise;
}

/**
 * Render one page into a canvas, scaled to a target CSS width and sharpened for
 * the device pixel ratio. Returns the rendered CSS height for layout.
 */
export async function renderPageToCanvas(
  page: PdfPageProxy,
  canvas: HTMLCanvasElement,
  cssWidth: number,
): Promise<number> {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('无法获取 canvas 上下文');

  const dpr = window.devicePixelRatio || 1;
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = (cssWidth * dpr) / baseViewport.width;
  const viewport = page.getViewport({ scale });

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const cssHeight = viewport.height / dpr;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  await page.render({ canvasContext: context, viewport }).promise;
  return cssHeight;
}
