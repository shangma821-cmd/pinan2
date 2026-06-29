import { useEffect, useRef, useState } from 'react';

import { ensurePdfjs, renderPageToCanvas, type PdfDocumentProxy } from '../lib/pdfRuntime';

type ViewerStatus = 'loading' | 'ready' | 'empty' | 'error';

interface ManualPdfViewerProps {
  /** Absolute path to the manual PDF. */
  url: string;
  /** Product name, used for canvas accessibility labels. */
  title: string;
}

interface PdfPageCanvasProps {
  pdf: PdfDocumentProxy;
  pageNumber: number;
  width: number;
  title: string;
}

function PdfPageCanvas({ pdf, pageNumber, width, title }: PdfPageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!width) return;
    let cancelled = false;

    pdf
      .getPage(pageNumber)
      .then((page) => {
        if (cancelled || !canvasRef.current) return undefined;
        return renderPageToCanvas(page, canvasRef.current, width);
      })
      .catch(() => {
        // A single failed page should not blank the whole manual.
      });

    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber, width]);

  return (
    <canvas
      ref={canvasRef}
      className="landing-manual-viewer-page"
      role="img"
      aria-label={`${title} 第 ${pageNumber} 页`}
    />
  );
}

export default function ManualPdfViewer({ url, title }: ManualPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<ViewerStatus>('loading');
  const [pdf, setPdf] = useState<PdfDocumentProxy | null>(null);
  const [width, setWidth] = useState(0);

  // Load the document. pdf.js load failure -> 'error'; a missing/invalid PDF
  // (the file has not been uploaded yet) -> 'empty' ("说明书即将上线").
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setPdf(null);

    (async () => {
      let lib: Awaited<ReturnType<typeof ensurePdfjs>>;
      try {
        lib = await ensurePdfjs();
      } catch {
        if (!cancelled) setStatus('error');
        return;
      }
      try {
        const doc = await lib.getDocument({ url }).promise;
        if (cancelled) return;
        setPdf(doc);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('empty');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  // Track the content width so pages render crisply and responsively.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const next = Math.round(el.clientWidth);
      setWidth((prev) => (prev === next ? prev : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="landing-manual-viewer" data-status={status}>
      {status === 'loading' ? (
        <div className="landing-manual-viewer-state" role="status">
          <span className="landing-manual-spinner" aria-hidden="true" />
          <p>说明书加载中…</p>
        </div>
      ) : null}

      {status === 'empty' ? (
        <div className="landing-manual-viewer-state" data-testid="manual-empty-state">
          <h3 className="landing-manual-viewer-state-title">说明书即将上线</h3>
          <p>该产品的使用说明书正在整理中，敬请期待。</p>
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="landing-manual-viewer-state" data-testid="manual-error-state">
          <h3 className="landing-manual-viewer-state-title">说明书暂时无法加载</h3>
          <p>请检查网络后刷新重试。</p>
        </div>
      ) : null}

      {status === 'ready' && pdf
        ? Array.from({ length: pdf.numPages }, (_, index) => (
            <PdfPageCanvas
              key={index + 1}
              pdf={pdf}
              pageNumber={index + 1}
              width={width}
              title={title}
            />
          ))
        : null}
    </div>
  );
}
