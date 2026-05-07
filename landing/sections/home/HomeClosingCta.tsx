import { Link } from 'react-router-dom';

import { useReveal } from '../../hooks/useReveal';

function IconArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
    </svg>
  );
}

export default function HomeClosingCta() {
  const content = useReveal<HTMLDivElement>();

  return (
    <section data-testid="home-closing-cta" className="landing-closing-section">
      <div className="landing-closing-bg-base" />
      <div className="landing-closing-bg-glow-wrap">
        <div className="landing-closing-bg-glow" />
      </div>
      <div className="landing-closing-inner">
        <div
          ref={content.ref}
          data-revealed={content.revealed || undefined}
          className="landing-closing-content landing-reveal"
        >
          <div className="landing-closing-eyebrow">
            <span>加盟合作</span>
          </div>
          <h2 className="landing-closing-title">
            准备好开启您的<span className="landing-closing-title-accent">健康事业</span>了吗？
          </h2>
          <p className="landing-closing-lead">
            加入频安科技，共建标准化智慧健康服务网络，总部提供系统、培训、运营与品牌支持。
          </p>
          <div className="landing-closing-actions">
            <Link to="/franchise" className="landing-closing-button-primary">
              了解加盟政策
              <IconArrowRight />
            </Link>
            <a href="tel:400-888-9999" className="landing-closing-button-secondary">
              <IconPhone />
              400-888-9999
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
