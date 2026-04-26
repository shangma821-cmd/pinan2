import { landingAssetPaths } from '../../assets';

export default function FranchiseHero() {
  return (
    <section data-testid="franchise-hero" className="landing-franchise-hero-section">
      <div className="landing-franchise-hero-bg">
        <img src={landingAssetPaths.franchiseHero} alt="加盟合作" />
        <div className="landing-franchise-hero-overlay" />
      </div>
      <div className="landing-franchise-hero-inner">
        <div className="landing-franchise-hero-eyebrow">
          <span>加盟合作</span>
        </div>
        <h1 className="landing-franchise-hero-title">
          单店年赚<span className="landing-franchise-hero-title-accent">60万起</span>
        </h1>
        <p className="landing-franchise-hero-lead">低风险高回报，现在加盟享限时优惠</p>
      </div>
    </section>
  );
}
