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
  { icon: <IconShield />, title: '服务流程规范', desc: '门店评估、调理体验与跟进流程统一' },
  { icon: <IconAward />, title: '两项技术专利布局', desc: '技术创新形成知识产权储备' },
  { icon: <IconMicroscope />, title: '30项计算机软著', desc: '软件系统自主研发' },
  { icon: <IconCircleCheck />, title: '门店服务标准', desc: '接待、评估、跟进流程清晰可执行' },
];

const patentImages = [
  {
    title: '大数据能力证书',
    href: '/entry-station/docs/pinan-big-data-certificate.pdf',
    src: '/entry-station/docs/pinan-big-data-certificate.png',
  },
  {
    title: '云健康管理发明专利',
    href: '/entry-station/docs/pinan-cloud-health-patent.pdf',
    src: '/entry-station/docs/pinan-cloud-health-patent.png',
  },
];

export default function AboutQualifications() {
  return (
    <section data-testid="about-qualifications" className="landing-about-quals-section">
      <div className="landing-about-quals-bg" />
      <div className="landing-about-quals-inner">
        <div className="landing-about-quals-header">
          <h2 className="landing-about-quals-title">
            技术<span className="landing-about-quals-title-accent">与规范</span>
          </h2>
          <p className="landing-about-quals-lead">以流程标准、软件能力与知识产权沉淀构建服务基础</p>
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
        <div className="landing-about-patent-docs" data-testid="about-patent-docs">
          <div className="landing-about-patent-docs-header">
            <h3 className="landing-about-patent-docs-title">两项专利证书</h3>
          </div>
          <div className="landing-about-patent-image-grid">
            {patentImages.map((doc) => (
              <a
                key={doc.href}
                className="landing-about-patent-image-link"
                href={doc.href}
                target="_blank"
                rel="noreferrer"
              >
                <img src={doc.src} alt={doc.title} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
