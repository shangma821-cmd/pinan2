const models = [
  {
    title: '店中店',
    price: '1.98万',
    audience: '现有门店增项（美容院/药店/养生馆）',
    revenue: '47万+',
  },
  {
    title: '标准店',
    price: '3.98万',
    audience: '创业新手，50-100㎡门店',
    revenue: '177万+',
    featured: true,
  },
  {
    title: '旗舰店',
    price: '6.98万',
    audience: '10公里区域代理，100-200㎡门店',
    revenue: '365万+',
  },
];

export default function FranchiseModels() {
  return (
    <section className="landing-section">
      <p className="landing-kicker">合作方案</p>
      <h2 className="landing-section-title">合作方案</h2>
      <div className="landing-model-grid">
        {models.map((item) => (
          <article
            key={item.title}
            className={item.featured ? 'landing-model-card is-featured' : 'landing-model-card'}
          >
            {item.featured ? <span className="landing-badge">推荐</span> : null}
            <h3 className="landing-card-title">{item.title}</h3>
            <div className="landing-price">{item.price}</div>
            <p className="landing-card-copy">{item.audience}</p>
            <div className="landing-highlight-line">{item.revenue}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
