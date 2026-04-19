const proofItems = [
  { value: '10亿+', label: '服务亚健康人群' },
  { value: '92%', label: '用户满意度' },
  { value: '3项', label: '国家发明专利' },
  { value: '30项', label: '计算机软著' },
];

export default function AboutProofGrid() {
  return (
    <section className="landing-section">
      <p className="landing-kicker">品牌证明</p>
      <h2 className="landing-section-title">可信结果</h2>
      <div className="landing-proof-grid">
        {proofItems.map((item) => (
          <article key={item.value} className="landing-proof-card">
            <div className="landing-proof-value">{item.value}</div>
            <div className="landing-proof-label">{item.label}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
