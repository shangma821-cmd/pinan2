import { landingAssetPaths } from '../../assets';

// ─── Inline SVG icons (Lucide 24-viewBox, stroke-width 2) ───────────────────

function IconUsers() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <path d="M16 3.128a4 4 0 0 1 0 7.744"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <circle cx="9" cy="7" r="4"/>
    </svg>
  );
}

function IconThumbsUp() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>
    </svg>
  );
}

function IconShare2() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const stats = [
  {
    icon: <IconUsers />,
    value: '2750+',
    heading: '成功治疗案例',
    desc: '帮助数千患者重获健康',
    testId: 'home-results-stat-users',
  },
  {
    icon: <IconThumbsUp />,
    value: '50%',
    heading: '用户满意度',
    desc: '专业服务赢得信赖',
    testId: 'home-results-stat-satisfaction',
  },
  {
    icon: <IconShare2 />,
    value: '24%',
    heading: '推荐转化率',
    desc: '口碑传播效果显著',
    testId: 'home-results-stat-referral',
  },
  {
    icon: <IconClock />,
    value: '33%+',
    heading: '用户复购率',
    desc: '返利机制驱动留存',
    testId: 'home-results-stat-growth',
  },
];

const cases = [
  {
    id: 'sleep',
    image: landingAssetPaths.caseSleep,
    badge: '睡眠改善',
    title: '睡眠改善案例',
    user: '35岁企业高管',
    problem: '失眠3年',
    desc: '周卡体验7天，睡眠时长从5小时增至7小时→升级年卡',
    outcome: '5小时 → 7小时',
  },
  {
    id: 'pain',
    image: landingAssetPaths.casePain,
    badge: '疼痛缓解',
    title: '疼痛缓解案例',
    user: '45岁宝妈',
    problem: '颈椎疼痛',
    desc: '月卡20次修复，疼痛指数从8分降至3分→推荐2个家庭卡用户',
    outcome: '8分 → 3分',
  },
  {
    id: 'energy',
    image: landingAssetPaths.caseEnergy,
    badge: '精力恢复',
    title: '精力恢复案例',
    user: '50岁企业主',
    problem: '疲劳乏力、免疫力低',
    desc: '年卡调理3个月，精力明显改善，感冒次数减少',
    outcome: '疲劳度 ↓70%',
  },
  {
    id: 'elderly',
    image: landingAssetPaths.caseElderly,
    badge: '指标正常',
    title: '健康管理案例',
    user: '60岁退休老人',
    problem: '多项指标异常',
    desc: '坚持调理半年，各项指标回归正常范围',
    outcome: '健康评分 65→88',
  },
  {
    id: 'neck',
    image: landingAssetPaths.caseNeck,
    badge: '颈椎改善',
    title: '颈椎调理案例',
    user: '28岁程序员',
    problem: '久坐导致颈椎僵硬',
    desc: '月卡调理后，颈椎灵活度明显改善',
    outcome: '灵活度 ↑60%',
  },
  {
    id: 'menopause',
    image: landingAssetPaths.caseMenopause,
    badge: '更年期调理',
    title: '更年期调理案例',
    user: '48岁女性',
    problem: '更年期失眠、情绪波动',
    desc: '3个月调理，睡眠质量提升，情绪稳定',
    outcome: '睡眠 ↑80%',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomeResults() {
  return (
    <section data-testid="home-results" className="landing-results-section">
      <div className="landing-results-bg-base" />
      <div className="landing-results-inner">

        {/* Header */}
        <div className="landing-results-header">
          <div className="landing-results-eyebrow"><span>成果与声誉</span></div>
          <h2 className="landing-results-title">
            数据见证<span className="landing-gradient-text">实力</span>
          </h2>
        </div>

        {/* Top 4-stat grid */}
        <div className="landing-results-stats">
          {stats.map((stat) => (
            <article key={stat.testId} className="landing-results-stat landing-apple-card">
              <div className="landing-results-stat-icon">{stat.icon}</div>
              <div
                data-testid={stat.testId}
                className="landing-results-stat-value"
              >
                {stat.value}
              </div>
              <div className="landing-results-stat-heading">{stat.heading}</div>
              <div className="landing-results-stat-desc">{stat.desc}</div>
            </article>
          ))}
        </div>

        {/* Case-cards section */}
        <h3 className="landing-results-cases-title">
          真实用户<span className="landing-gradient-text">案例</span>
        </h3>
        <div
          className="landing-results-cases-grid"
          data-testid="home-results-gallery"
        >
          {cases.map((c) => (
            <article key={c.id} className="landing-results-case landing-apple-card">
              <div className="landing-results-case-media">
                <img src={c.image} alt={c.title} />
                <div className="landing-results-case-media-overlay" aria-hidden="true" />
                <span className="landing-results-case-badge">{c.badge}</span>
              </div>
              <div className="landing-results-case-body">
                <h4 className="landing-results-case-title">{c.title}</h4>
                <dl className="landing-results-case-meta">
                  <div><dt>用户</dt><dd>{c.user}</dd></div>
                  <div><dt>问题</dt><dd>{c.problem}</dd></div>
                </dl>
                <p className="landing-results-case-desc">{c.desc}</p>
                <div className="landing-results-case-footer">
                  <span className="landing-results-case-footer-label">改善效果</span>
                  <span className="landing-results-case-footer-value">{c.outcome}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
