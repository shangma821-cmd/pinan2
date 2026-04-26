export default function ProductsHero() {
  return (
    <section data-testid="products-hero" className="landing-products-hero-section">
      <div className="landing-products-hero-bg" />
      <div className="landing-products-hero-inner">
        <div className="landing-products-hero-eyebrow">
          <span>产品服务</span>
        </div>
        <h1 className="landing-products-hero-title">
          看得见的效果，
          <span className="landing-products-hero-title-accent">算得清的收益</span>
        </h1>
        <p className="landing-products-hero-lead">
          智能设备+闭环服务，服务闭环：免费检测→靶向修复→数据追踪→返利留存
        </p>
      </div>
    </section>
  );
}
