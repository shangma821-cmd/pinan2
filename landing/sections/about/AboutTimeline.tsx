const milestones = [
  { year: '2025', title: '公司成立', copy: '常熟频安科技有限公司成立，聚焦AI健康评估与智慧健康管理服务' },
  { year: '2025', title: '产品成型', copy: '围绕全身功能状态评估、频谱节律调理体验与智能穿戴完成服务体系搭建' },
  { year: '2025', title: '门店落地', copy: '推进体验店服务流程、会员管理与合作支持模型验证' },
  { year: '2026', title: '持续发展', copy: '围绕产品服务、AI商学院与加盟支持持续升级' },
];

export default function AboutTimeline() {
  return (
    <section data-testid="about-timeline" className="landing-about-timeline-section">
      <div className="landing-about-timeline-bg" />
      <div className="landing-about-timeline-inner">
        <div className="landing-about-timeline-header">
          <h2 className="landing-about-timeline-title">
            发展<span className="landing-about-timeline-title-accent">历程</span>
          </h2>
          <p className="landing-about-timeline-lead">一路走来，不忘初心</p>
        </div>
        <div className="landing-about-timeline-rail-wrap">
          <div className="landing-about-timeline-rail" />
          <ol className="landing-about-timeline-list">
            {milestones.map((item, idx) => {
              const right = idx % 2 === 1;
              return (
                <li
                  key={`${item.year}-${item.title}`}
                  className={`landing-about-timeline-item${right ? ' is-right' : ''}`}
                >
                  <div className="landing-about-timeline-card">
                    <div className="landing-about-timeline-year">{item.year}</div>
                    <h3 className="landing-about-timeline-heading">{item.title}</h3>
                    <p className="landing-about-timeline-copy">{item.copy}</p>
                  </div>
                  <div className="landing-about-timeline-dot" />
                  <div className="landing-about-timeline-spacer" />
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
