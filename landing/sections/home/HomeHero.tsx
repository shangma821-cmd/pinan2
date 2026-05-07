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
  { value: '12项', label: '生理系统评估' },
  { value: '7天', label: '服务跟进周期' },
  { value: '30项', label: '计算机软著' },
  { value: '2项', label: '技术专利布局' },
];

const policyItems = [
  { label: '第一条', text: '鼓励非药物治疗疾病' },
  { label: '第二条', text: '养生保健行业要以预防为主' },
  { label: '第三条', text: '国家大力扶持非药物治疗疾病方法的推广' },
  { label: '第四条', text: '全面取消以药养医，从治疗为主回到预防为主' },
];

export default function HomeHero() {
  const eyebrow = useReveal<HTMLDivElement>();
  const title = useReveal<HTMLHeadingElement>();
  const support1 = useReveal<HTMLParagraphElement>();
  const support2 = useReveal<HTMLParagraphElement>();
  const actions = useReveal<HTMLDivElement>();
  const policyCard = useReveal<HTMLDivElement>();
  const stats = useReveal<HTMLDivElement>();

  return (
    <section data-testid="home-hero" className="landing-hero-section">
      <div className="landing-hero-bg" aria-hidden="true">
        <div className="landing-hero-bg-image" />
        <video
          className="landing-hero-bg-video"
          src="/entry-station/hero-frequency-field.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="landing-hero-bg-wash" />
        <div className="landing-hero-bg-grid" />
      </div>

      <div className="landing-hero-content">
        <div className="landing-hero-main">
          <div className="landing-hero-copy-block">
            <div
              ref={eyebrow.ref}
              data-revealed={eyebrow.revealed || undefined}
              className="landing-hero-eyebrow landing-reveal"
            >
              <span className="landing-hero-eyebrow-dot" aria-hidden="true" />
              <span className="landing-hero-eyebrow-text">AI健康评估 · 频谱节律调理系统</span>
            </div>

            <h1
              ref={title.ref}
              data-revealed={title.revealed || undefined}
              data-delay="200"
              className="landing-hero-title landing-reveal"
            >
              <span className="landing-hero-title-gradient">频安科技</span>
              <br />
              <span>守护生命节律</span>
            </h1>

            <p
              ref={support1.ref}
              data-revealed={support1.revealed || undefined}
              data-delay="300"
              className="landing-hero-support landing-reveal"
            >
              以AI人工智能技术算法为核心，聚焦健康评估、个性化调理方案与持续状态跟进，构建可记录、可复盘、可长期陪伴的数智健康体验。
            </p>
            <p
              ref={support2.ref}
              data-revealed={support2.revealed || undefined}
              data-delay="400"
              className="landing-hero-support landing-hero-support--muted landing-reveal"
            >
              <span>让健康状态可评估、</span>
              <span>可记录、可持续管理</span>
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
          </div>

        </div>

        <div className="landing-hero-bottom-row">
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

          <aside
            ref={policyCard.ref}
            data-revealed={policyCard.revealed || undefined}
            data-delay="800"
            className="landing-hero-policy-card landing-reveal"
            aria-label="健康法重点概述"
          >
            <div className="landing-hero-policy-card-kicker">政策方向</div>
            <h2 className="landing-hero-policy-card-title">
              中国第一部《健康法》重点概述
            </h2>
            <ol className="landing-hero-policy-list">
              {policyItems.map((item) => (
                <li key={item.label}>
                  <span className="landing-hero-policy-index">{item.label}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>

      <div className="landing-hero-scroll-indicator" aria-hidden="true">
        <span className="landing-hero-scroll-dot" />
      </div>
    </section>
  );
}
