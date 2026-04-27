import { Link } from 'react-router-dom';

import { useReveal } from '../../hooks/useReveal';

function IconArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

const heroStats = [
  { value: '10亿+', label: '亚健康人群' },
  { value: '1300亿', label: '市场规模' },
  { value: '92%', label: '用户满意度' },
  { value: '45%', label: '推荐转化率' },
];

export default function HomeHero() {
  const eyebrow = useReveal<HTMLDivElement>();
  const title = useReveal<HTMLHeadingElement>();
  const support1 = useReveal<HTMLParagraphElement>();
  const support2 = useReveal<HTMLParagraphElement>();
  const actions = useReveal<HTMLDivElement>();
  const stats = useReveal<HTMLDivElement>();

  return (
    <section data-testid="home-hero" className="landing-hero-section">
      <div className="landing-hero-bg" aria-hidden="true">
        <div className="landing-hero-bg-image" />
        <div className="landing-hero-bg-wash" />
        <div className="landing-hero-orb landing-hero-orb--tl" />
        <div className="landing-hero-orb landing-hero-orb--mr" />
        <div className="landing-hero-orb landing-hero-orb--bl" />
        <div className="landing-hero-orb landing-hero-orb--center" />
        <div className="landing-hero-bg-grid" />
      </div>

      <div className="landing-hero-content">
        <div
          ref={eyebrow.ref}
          data-revealed={eyebrow.revealed || undefined}
          className="landing-hero-eyebrow landing-reveal"
        >
          <span className="landing-hero-eyebrow-dot" aria-hidden="true" />
          <span className="landing-hero-eyebrow-text">依托国家&ldquo;黄十字&rdquo;亚健康服务体系</span>
        </div>

        <h1
          ref={title.ref}
          data-revealed={title.revealed || undefined}
          data-delay="200"
          className="landing-hero-title landing-reveal"
        >
          <span className="landing-hero-title-gradient">AI细胞修复</span>
          <br />
          <span>告别亚健康</span>
        </h1>

        <p
          ref={support1.ref}
          data-revealed={support1.revealed || undefined}
          data-delay="300"
          className="landing-hero-support landing-reveal"
        >
          精准筛查 · 靶向干预 · 数据追踪 · 公平返利
        </p>
        <p
          ref={support2.ref}
          data-revealed={support2.revealed || undefined}
          data-delay="400"
          className="landing-hero-support landing-hero-support--muted landing-reveal"
        >
          从细胞开始，重塑您的健康人生
        </p>

        <div
          ref={actions.ref}
          data-revealed={actions.revealed || undefined}
          data-delay="500"
          className="landing-hero-actions landing-reveal"
        >
          <Link to="/products" className="landing-button-primary">
            了解产品服务
            <IconArrowRight />
          </Link>
          <Link to="/franchise" className="landing-button-secondary">
            加盟合作
            <IconArrowRight />
          </Link>
        </div>

        <div
          ref={stats.ref}
          data-revealed={stats.revealed || undefined}
          data-delay="700"
          className="landing-hero-stats landing-reveal"
        >
          {heroStats.map((stat) => (
            <div key={stat.label} className="landing-hero-stat-card">
              <span className="landing-hero-stat-value">{stat.value}</span>
              <span className="landing-hero-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="landing-hero-scroll-indicator" aria-hidden="true">
        <span className="landing-hero-scroll-dot" />
      </div>
    </section>
  );
}
