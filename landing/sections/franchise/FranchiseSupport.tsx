const supportItems = [
  '流量支持',
  '培训支持',
  '运营支持',
  '售后支持',
];

export default function FranchiseSupport() {
  return (
    <section className="landing-section">
      <p className="landing-kicker">总部陪跑</p>
      <h2 className="landing-section-title">全程扶上马，帮你赚到钱</h2>
      <div className="landing-support-grid">
        {supportItems.map((item) => (
          <article key={item} className="landing-support-card">
            <h3 className="landing-card-title">{item}</h3>
            <p className="landing-card-copy">从开业动作到门店复盘，总部为每个节点提供标准化支持。</p>
          </article>
        ))}
      </div>
    </section>
  );
}
