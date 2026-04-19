const milestones = [
  {
    year: '2018',
    title: '品牌启航',
    copy: '频安开始聚焦亚健康人群服务，搭建线下体验与门店标准化能力。',
  },
  {
    year: '2020',
    title: '服务体系升级',
    copy: '以检测与修复闭环为核心，形成门店可复制的交付路径。',
  },
  {
    year: '2022',
    title: '智能设备联动',
    copy: '智能无线手环与家庭场景产品接入，补足到店后的持续追踪能力。',
  },
  {
    year: '2024',
    title: 'AI 商学院成型',
    copy: '把品牌、培训、经营和招商能力统一到体验站与商学院体系中。',
  },
];

export default function AboutTimeline() {
  return (
    <section className="landing-section">
      <p className="landing-kicker">成长路径</p>
      <h2 className="landing-section-title">发展历程</h2>
      <div className="landing-grid-4">
        {milestones.map((item) => (
          <article key={item.year} className="landing-card">
            <span className="landing-badge">{item.year}</span>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
