import { Link } from 'react-router-dom';

import ManualThumbnail from '../components/ManualThumbnail';
import { landingManuals } from '../content/manualsContent';

export default function LandingManualsPage() {
  return (
    <div data-testid="landing-page-manuals" className="landing-page-container">
      <section className="landing-manuals-hero-section">
        <div className="landing-manuals-hero-bg" />
        <div className="landing-manuals-hero-inner">
          <div className="landing-manuals-hero-eyebrow">
            <span>使用说明</span>
          </div>
          <h1 className="landing-manuals-hero-title">
            产品<span className="landing-manuals-hero-title-accent">使用说明</span>
          </h1>
          <p className="landing-manuals-hero-lead">
            选择产品查看对应的使用说明书，也可用手机碰一碰产品上的标签直接打开。
          </p>
        </div>
      </section>

      <section className="landing-manuals-list-section">
        <div className="landing-manuals-list-bg" />
        <div className="landing-manuals-list-inner">
          {landingManuals.length === 0 ? (
            <div className="landing-manuals-empty" data-testid="manuals-empty">
              <h2 className="landing-manuals-empty-title">暂无说明书</h2>
              <p>说明书正在整理中，敬请期待。</p>
            </div>
          ) : (
          <div className="landing-manuals-grid" data-testid="manuals-grid">
            {landingManuals.map((manual) => (
              <Link
                key={manual.id}
                to={`/manuals/${manual.id}`}
                className="landing-manuals-card"
                data-testid={`manual-card-${manual.id}`}
              >
                <div className="landing-manuals-card-media">
                  <ManualThumbnail url={manual.pdfPath} title={manual.name} />
                </div>
                <div className="landing-manuals-card-body">
                  <h2 className="landing-manuals-card-title">{manual.name}</h2>
                  <span className="landing-manuals-card-more">查看说明书 →</span>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>
      </section>
    </div>
  );
}
