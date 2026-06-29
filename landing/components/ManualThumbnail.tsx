import { useEffect, useRef, useState } from 'react';

import { loadPdfDocument, renderPageToCanvas } from '../lib/pdfRuntime';

type ThumbStatus = 'loading' | 'ready' | 'empty';

interface ManualThumbnailProps {
  /** Absolute path to the manual PDF. */
  url: string;
  /** Product name, used for the accessibility label. */
  title: string;
  /** Target CSS width for the rendered first page. */
  width?: number;
}

/**
 * Renders the first page of a manual PDF as a cover thumbnail. When the PDF is
 * not available yet, shows a neutral placeholder so the hub card still reads.
 */
export default function ManualThumbnail({ url, title, width = 360 }: ManualThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<ThumbStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    (async () => {
      try {
        const pdf = await loadPdfDocument(url);
        const page = await pdf.getPage(1);
        if (cancelled || !canvasRef.current) return;
        await renderPageToCanvas(page, canvasRef.current, width);
        if (!cancelled) setStatus('ready');
      } catch {
        if (!cancelled) setStatus('empty');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, width]);

  return (
    <div className="landing-manual-thumb" data-status={status}>
      {status === 'empty' ? (
        <div className="landing-manual-thumb-placeholder" aria-label={`${title} 说明书封面`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M8 13h8M8 17h6" />
          </svg>
          <span>说明书即将上线</span>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          className="landing-manual-thumb-canvas"
          role="img"
          aria-label={`${title} 说明书封面`}
        />
      )}
    </div>
  );
}
