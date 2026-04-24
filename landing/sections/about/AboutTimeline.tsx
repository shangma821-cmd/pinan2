const milestones = [
  { year: '2018', title: '公司成立', copy: '频安科技在苏州成立，专注频谱技术研发' },
  { year: '2020', title: '技术突破', copy: 'AI细胞检测修复系统研发成功' },
  { year: '2022', title: '资质认证', copy: '获国家二类医疗器械认证，3项发明专利' },
  { year: '2024', title: '黄十字认证', copy: '成为国家黄十字亚健康服务体系认证机构' },
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
                  key={item.year}
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
