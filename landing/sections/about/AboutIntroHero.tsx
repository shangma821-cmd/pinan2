import { landingAssetPaths } from '../../assets';

export default function AboutIntroHero() {
  return (
    <section data-testid="about-intro-hero" className="landing-about-hero-section">
      <div className="landing-about-hero-bg" />
      <div className="landing-about-hero-inner">
        <div className="landing-about-hero-grid">
          <div className="landing-about-hero-copy">
            <div className="landing-about-hero-eyebrow">
              <span>关于我们</span>
            </div>
            <h1 className="landing-about-hero-title">
              频安<span className="landing-about-hero-title-accent">健康</span>
            </h1>
            <p className="landing-about-hero-lead">
              频安健康依托苏州市频安科技有限公司，是国家“黄十字”亚健康服务体系认证机构，
              致力于通过AI细胞修复技术改变亚健康管理领域。
            </p>
            <p className="landing-about-hero-sub">
              我们融合传统中医智慧与现代频谱科技，开发出创新的细胞修复解决方案。
              服务闭环：免费检测→靶向修复→数据追踪→返利留存，无断点服务体验。
            </p>
          </div>
          <div className="landing-about-hero-media-wrap">
            <div className="landing-about-hero-media">
              <img src={landingAssetPaths.storeFrontNew} alt="频安健康体验店" />
            </div>
            <div className="landing-about-hero-stat">
              <div className="landing-about-hero-stat-value">10亿+</div>
              <div className="landing-about-hero-stat-label">服务亚健康人群</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
