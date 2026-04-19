import { landingAssetPaths } from '../../assets';

export default function FranchiseHero() {
  return (
    <section className="landing-section landing-hero-grid">
      <div className="landing-hero-copy">
        <p className="landing-kicker">加盟合作</p>
        <h2 className="landing-section-title">单店年赚60万起</h2>
        <p className="landing-section-copy">
          从轻量增项到区域布局，频安用明确的合作梯度、收益样板和总部支持，帮助合作方更快落地。
        </p>
      </div>
      <div className="landing-hero-media">
        <img src={landingAssetPaths.franchiseHero} alt="加盟合作体验站" />
      </div>
    </section>
  );
}
