function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function IconAward() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
      <circle cx="12" cy="8" r="6" />
    </svg>
  );
}

function IconMicroscope() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M6 18h8" />
      <path d="M3 22h18" />
      <path d="M14 22a7 7 0 1 0 0-14h-1" />
      <path d="M9 14h2" />
      <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
      <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
    </svg>
  );
}

function IconCircleCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

const qualifications = [
  { icon: <IconShield />, title: '二类医疗器械认证', desc: '核心设备可进医疗机构' },
  { icon: <IconAward />, title: '3项国家发明专利', desc: '技术创新获得法律保护' },
  { icon: <IconMicroscope />, title: '30项计算机软著', desc: '软件系统自主研发' },
  { icon: <IconCircleCheck />, title: '黄十字体系认证', desc: '亚健康领域权威标识' },
];

export default function AboutQualifications() {
  return (
    <section data-testid="about-qualifications" className="landing-about-quals-section">
      <div className="landing-about-quals-bg" />
      <div className="landing-about-quals-inner">
        <div className="landing-about-quals-header">
          <h2 className="landing-about-quals-title">
            权威<span className="landing-about-quals-title-accent">资质认证</span>
          </h2>
          <p className="landing-about-quals-lead">国家背书，填补行业资质空白</p>
        </div>
        <div className="landing-about-quals-grid">
          {qualifications.map((item) => (
            <article key={item.title} className="landing-about-quals-card">
              <div className="landing-about-quals-card-icon">{item.icon}</div>
              <h3 className="landing-about-quals-card-title">{item.title}</h3>
              <p className="landing-about-quals-card-desc">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
