const guarantees = [
  '押金可退',
  '保底保障',
  '退出机制',
];

export default function FranchiseGuarantees() {
  return (
    <section className="landing-section">
      <p className="landing-kicker">风险控制</p>
      <h2 className="landing-section-title">3大承诺，零风险加盟</h2>
      <div className="landing-guarantee-grid">
        {guarantees.map((item) => (
          <article key={item} className="landing-card">
            <h3>{item}</h3>
            <p>让合作关系从签约开始就有明确边界和可执行保障。</p>
          </article>
        ))}
      </div>
      <div className="landing-offer-banner">
        <span>限时优惠</span>
        <span>仅限前50家加盟商</span>
        <span>免首年品牌管理费（正常2000元/年）</span>
      </div>
    </section>
  );
}
