export default function ProductsHero() {
  return (
    <section data-testid="products-hero" className="landing-products-hero-section">
      <div className="landing-products-hero-bg" />
      <div className="landing-products-hero-inner">
        <div className="landing-products-hero-eyebrow">
          <span>产品服务</span>
        </div>
        <h1 className="landing-products-hero-title">
          AI健康评估，
          <span className="landing-products-hero-title-accent">频谱节律调理</span>
        </h1>
        <p className="landing-products-hero-lead">
          以评估设备、频谱节律系统、智能穿戴与健康服务流程组成闭环，让健康状态可评估、可记录、可持续管理。
        </p>
      </div>
    </section>
  );
}
