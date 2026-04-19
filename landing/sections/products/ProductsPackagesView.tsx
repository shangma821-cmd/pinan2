const packages = [
  {
    title: '周卡',
    price: '199',
    copy: '适合首次体验用户，快速完成基础服务闭环。',
  },
  {
    title: '月卡',
    price: '599',
    copy: '适合需要持续追踪和轻度干预的门店客群。',
  },
  {
    title: '年卡',
    price: '3650',
    copy: '适合门店重点经营的核心客群，形成稳定留存和复购。',
    featured: true,
  },
  {
    title: '家庭卡',
    price: '5980',
    copy: '覆盖多成员健康管理场景，提升家庭级客单和服务深度。',
  },
];

export default function ProductsPackagesView() {
  return (
    <section className="landing-package-grid">
      {packages.map((item) => (
        <article
          key={item.title}
          className={item.featured ? 'landing-package-card is-featured' : 'landing-package-card'}
        >
          {item.featured ? <span className="landing-badge">推荐</span> : null}
          <h3 className="landing-card-title">{item.title}</h3>
          <div className="landing-price">{item.price}</div>
          <div className="landing-price-subtle">会员套餐</div>
          <p className="landing-card-copy">{item.copy}</p>
        </article>
      ))}
    </section>
  );
}
