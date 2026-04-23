import { Link } from 'react-router-dom';

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
        <div className="landing-hero-eyebrow">
          <span className="landing-hero-eyebrow-dot" aria-hidden="true" />
          <span className="landing-hero-eyebrow-text">依托国家&ldquo;黄十字&rdquo;亚健康服务体系</span>
        </div>

        <h1 className="landing-hero-title">
          <span className="landing-hero-title-gradient">AI细胞修复</span>
          <br />
          <span>告别亚健康</span>
        </h1>

        <p className="landing-hero-support">精准筛查 · 靶向干预 · 数据追踪 · 公平返利</p>
        <p className="landing-hero-support landing-hero-support--muted">从细胞开始，重塑您的健康人生</p>

        <div className="landing-hero-actions">
          <Link to="/products" className="landing-button-primary">
            了解产品服务
            <IconArrowRight />
          </Link>
          <Link to="/franchise" className="landing-button-secondary">
            加盟合作
            <IconArrowRight />
          </Link>
        </div>

        <div className="landing-hero-stats">
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
