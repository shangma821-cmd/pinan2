import { Link } from 'react-router-dom';

import { landingAssetPaths } from '../../assets';

export default function HomeHero() {
  return (
    <section data-testid="home-hero" className="landing-section landing-hero-grid">
      <div className="landing-hero-copy">
        <span className="landing-pill">依托国家"黄十字"亚健康服务体系</span>
        <p className="landing-kicker">细胞修复体验站</p>
        <h2 className="landing-display">
          <span className="landing-emphasis">AI细胞修复</span>
          告别亚健康
        </h2>
        <p className="landing-support-line">精准筛查 · 靶向干预 · 数据追踪 · 公平返利</p>
        <p className="landing-section-copy">从细胞开始，重塑您的健康人生</p>
        <div className="landing-hero-actions">
          <Link className="landing-button-primary" to="/products">
            了解产品服务
          </Link>
          <Link className="landing-button-secondary" to="/franchise">
            加盟合作
          </Link>
        </div>
      </div>
      <div className="landing-hero-media">
        <img src={landingAssetPaths.heroBg} alt="频安健康体验站" />
      </div>
    </section>
  );
}
