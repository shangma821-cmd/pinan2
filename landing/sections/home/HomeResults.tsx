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
    heading: '服务用户档案',
    desc: '沉淀多场景健康管理经验',
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
    desc: '口碑传播持续沉淀',
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
    badge: '作息管理',
    title: '作息管理反馈',
    user: '35岁企业高管',
    problem: '长期熬夜、作息不稳',
    desc: '周卡体验后建立作息记录与服务档案，继续选择年卡做长期健康管理',
    outcome: '持续跟进',
  },
  {
    id: 'pain',
    image: landingAssetPaths.casePain,
    badge: '肩颈管理',
    title: '肩颈管理反馈',
    user: '45岁宝妈',
    problem: '久坐劳累、肩颈紧张',
    desc: '月卡服务中结合频谱节律调理与日常习惯建议，后续推荐家人共同体验',
    outcome: '家庭体验',
  },
  {
    id: 'energy',
    image: landingAssetPaths.caseEnergy,
    badge: '精力管理',
    title: '精力管理反馈',
    user: '50岁企业主',
    problem: '工作压力大、日常状态波动',
    desc: '年卡服务中持续记录作息、饮水与穿戴数据，用阶段复盘辅助健康管理',
    outcome: '阶段复盘',
  },
  {
    id: 'elderly',
    image: landingAssetPaths.caseElderly,
    badge: '长辈关怀',
    title: '长辈健康管理反馈',
    user: '60岁退休老人',
    problem: '日常健康管理需求',
    desc: '通过门店服务、家庭提醒与数据追踪，帮助家属更清楚了解长辈日常状态',
    outcome: '家庭共管',
  },
  {
    id: 'neck',
    image: landingAssetPaths.caseNeck,
    badge: '久坐管理',
    title: '久坐人群管理反馈',
    user: '28岁程序员',
    problem: '久坐办公、活动不足',
    desc: '月卡服务中加入频谱体验、拉伸提醒与作息建议，提升自我管理意识',
    outcome: '习惯提醒',
  },
  {
    id: 'menopause',
    image: landingAssetPaths.caseMenopause,
    badge: '女性关怀',
    title: '女性健康管理反馈',
    user: '48岁女性',
    problem: '生活节律与情绪压力管理',
    desc: '通过周期性服务记录、健康顾问沟通与家庭场景建议，提升长期管理便利性',
    outcome: '顾问陪伴',
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
            数据沉淀<span className="landing-gradient-text">服务价值</span>
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
                  <div><dt>需求</dt><dd>{c.problem}</dd></div>
                </dl>
                <p className="landing-results-case-desc">{c.desc}</p>
                <div className="landing-results-case-footer">
                  <span className="landing-results-case-footer-label">服务反馈</span>
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
