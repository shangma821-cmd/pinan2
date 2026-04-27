import { useReveal } from '../../hooks/useReveal';

type IconName =
  | 'users'
  | 'trending-up'
  | 'dollar-sign'
  | 'triangle-alert'
  | 'store'
  | 'rotate-ccw';

function Icon({ name }: { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === 'users' && (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <path d="M16 3.128a4 4 0 0 1 0 7.744" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <circle cx="9" cy="7" r="4" />
        </>
      )}
      {name === 'trending-up' && (
        <>
          <path d="M16 7h6v6" />
          <path d="m22 7-8.5 8.5-5-5L2 17" />
        </>
      )}
      {name === 'dollar-sign' && (
        <>
          <line x1="12" x2="12" y1="2" y2="22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </>
      )}
      {name === 'triangle-alert' && (
        <>
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </>
      )}
      {name === 'store' && (
        <>
          <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5" />
          <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" />
          <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05" />
        </>
      )}
      {name === 'rotate-ccw' && (
        <>
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </>
      )}
    </svg>
  );
}

const stats = [
  {
    icon: 'users' as IconName,
    value: '10亿+',
    heading: '亚健康人群',
    desc: '中国亚健康人群超10亿，占总人口70%',
  },
  {
    icon: 'trending-up' as IconName,
    value: '75%',
    heading: '中高端群体',
    desc: '30-55岁中高端群体亚健康发生率超75%',
  },
  {
    icon: 'dollar-sign' as IconName,
    value: '1300亿',
    heading: '市场规模',
    desc: '2025年亚健康管理市场规模达1300亿元',
  },
  {
    icon: 'triangle-alert' as IconName,
    value: '800亿',
    heading: '精准干预',
    desc: '精准干预细分领域占800亿市场',
  },
];

const painPoints = [
  {
    icon: 'store' as IconName,
    title: '痛点1：获客难',
    body: '传统养生馆依赖线下发单，引流成本高，新客转化率不足10%',
  },
  {
    icon: 'rotate-ccw' as IconName,
    title: '痛点2：复购低',
    body: '无数据化效果支撑，用户不信任；纯消费模式，缺乏持续消费动力',
  },
  {
    icon: 'dollar-sign' as IconName,
    title: '痛点3：利润薄',
    body: '租金+人力成本占比超60%，产品同质化严重，价格战压缩利润',
  },
];

export default function HomePainPoints() {
  const header = useReveal<HTMLDivElement>();
  const statsGrid = useReveal<HTMLDivElement>();
  const painCards = useReveal<HTMLDivElement>();
  const policy = useReveal<HTMLDivElement>();

  return (
    <section data-testid="home-pain-points" className="landing-pain-section">
      <div className="landing-pain-bg">
        <div className="landing-pain-bg-base" />
        <div className="landing-pain-bg-glow" />
      </div>
      <div className="landing-pain-inner">
        {/* Header */}
        <div
          ref={header.ref}
          data-revealed={header.revealed || undefined}
          className="landing-pain-header landing-reveal"
        >
          <div className="landing-pain-eyebrow">
            <span>市场分析</span>
          </div>
          <h2 className="landing-pain-title">
            万亿健康需求，<span className="landing-gradient-text">传统模式难破局</span>
          </h2>
        </div>

        {/* 4-stat grid */}
        <div
          ref={statsGrid.ref}
          data-revealed={statsGrid.revealed || undefined}
          className="landing-pain-stats landing-reveal"
        >
          {stats.map((stat) => (
            <article key={stat.heading} className="landing-pain-stat landing-apple-card">
              <div className="landing-pain-stat-icon">
                <Icon name={stat.icon} />
              </div>
              <div className="landing-pain-stat-value">{stat.value}</div>
              <div className="landing-pain-stat-heading">{stat.heading}</div>
              <div className="landing-pain-stat-desc">{stat.desc}</div>
            </article>
          ))}
        </div>

        {/* Pain-point cards */}
        <div
          ref={painCards.ref}
          data-revealed={painCards.revealed || undefined}
          data-delay="300"
          className="landing-pain-points landing-reveal"
        >
          <h3 className="landing-pain-points-heading">
            传统模式<span className="landing-pain-danger-emphasis">3大痛点</span>，合伙人难盈利
          </h3>
          <div className="landing-pain-points-grid">
            {painPoints.map((p) => (
              <article key={p.title} className="landing-pain-point landing-apple-card">
                <div className="landing-pain-point-icon">
                  <Icon name={p.icon} />
                </div>
                <h4 className="landing-pain-point-title">{p.title}</h4>
                <p className="landing-pain-point-body">{p.body}</p>
              </article>
            ))}
          </div>
        </div>

        {/* 政策红利 banner */}
        <div
          ref={policy.ref}
          data-revealed={policy.revealed || undefined}
          data-delay="500"
          className="landing-pain-policy landing-apple-card landing-reveal"
        >
          <div className="landing-pain-policy-copy">
            <h4 className="landing-pain-policy-title">政策红利</h4>
            <p className="landing-pain-policy-desc">
              国家医改重心从"治病"转向"预防"，鼓励社会力量参与亚健康标准化服务。
              黄十字体系为亚健康领域唯一权威标识。
            </p>
          </div>
          <div className="landing-pain-policy-badge">
            <span>填补行业资质空白</span>
          </div>
        </div>
      </div>
    </section>
  );
}
