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
          共建标准化<span className="landing-franchise-hero-title-accent">健康服务网络</span>
        </h1>
        <p className="landing-franchise-hero-lead">以统一品牌、统一系统、统一服务流程，帮助合作伙伴落地专业可信的智慧健康服务中心。</p>
      </div>
    </section>
  );
}
