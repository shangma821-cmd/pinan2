import { landingAssetPaths } from '../../assets';

export default function AboutIntroHero() {
  return (
    <section className="landing-section landing-hero-grid">
      <div className="landing-hero-copy">
        <p className="landing-kicker">关于我们</p>
        <h2 className="landing-section-title">频安健康</h2>
        <p className="landing-section-copy">
          频安健康围绕亚健康管理、细胞修复体验与门店经营增长，构建了检测、干预、追踪与服务闭环一体化的品牌表达。
        </p>
        <div className="landing-stat-card">
          <span className="landing-stat-value">10亿+</span>
          <span className="landing-stat-label">服务亚健康人群</span>
        </div>
      </div>
      <div className="landing-hero-media">
        <img src={landingAssetPaths.storeFrontNew} alt="频安健康门店" />
      </div>
    </section>
  );
}
