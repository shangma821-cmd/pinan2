import { Link, Navigate, useParams } from 'react-router-dom';

import ManualPdfViewer from '../components/ManualPdfViewer';
import { findManual } from '../content/manualsContent';

function IconArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function IconExternal() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

export default function LandingManualDetailPage() {
  const { manualId } = useParams<{ manualId: string }>();
  const manual = findManual(manualId);

  // Unknown id (e.g. a mistyped/old NFC URL) returns to the hub.
  if (!manual) {
    return <Navigate to="/manuals" replace />;
  }

  return (
    <div data-testid="landing-page-manual-detail" className="landing-page-container">
      <section className="landing-manual-detail-section">
        <div className="landing-manual-detail-bg" />
        <div className="landing-manual-detail-inner">
          <Link to="/manuals" className="landing-manual-detail-back" data-testid="manual-back">
            <IconArrowLeft />
            全部说明书
          </Link>

          <div className="landing-manual-detail-head">
            <h1 className="landing-manual-detail-title">{manual.name}</h1>
            <a
              className="landing-manual-detail-action"
              href={manual.pdfPath}
              target="_blank"
              rel="noreferrer"
              data-testid="manual-open-pdf"
            >
              <IconExternal />
              全屏查看 / 下载
            </a>
          </div>

          <ManualPdfViewer url={manual.pdfPath} title={manual.name} />
        </div>
      </section>
    </div>
  );
}
