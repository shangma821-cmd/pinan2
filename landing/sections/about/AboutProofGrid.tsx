function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <path d="M16 3.128a4 4 0 0 1 0 7.744" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  );
}

function IconTrendingUp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M16 7h6v6" />
      <path d="m22 7-8.5 8.5-5-5L2 17" />
    </svg>
  );
}

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

const proofItems = [
  { icon: <IconUsers />, value: '5000+', label: '服务用户档案' },
  { icon: <IconTrendingUp />, value: '92%', label: '服务满意反馈' },
  { icon: <IconShield />, value: '规范化', label: '服务流程' },
  { icon: <IconAward />, value: '2+30', label: '专利+软著' },
];

export default function AboutProofGrid() {
  return (
    <section data-testid="about-proof-grid" className="landing-about-proof-section">
      <div className="landing-about-proof-bg" />
      <div className="landing-about-proof-inner">
        <div className="landing-about-proof-grid">
          {proofItems.map((item) => (
            <article key={item.value} className="landing-about-proof-card">
              <div className="landing-about-proof-icon">{item.icon}</div>
              <div className="landing-about-proof-value">{item.value}</div>
              <div className="landing-about-proof-label">{item.label}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
