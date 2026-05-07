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
              频安<span className="landing-about-hero-title-accent">科技</span>
            </h1>
            <p className="landing-about-hero-lead">
              <span>频安科技秉持“以人为本，细胞为辅，膳食为基；五行为始；频谱共振为桥，</span>
              <span>中医基因为纲；调理平衡为境；人工智能为核”的八大核心理念。</span>
            </p>
            <p className="landing-about-hero-sub">
              用AI人工智能技术算法做全身功能状态评估、智能生成个性化调理方案、物理/生物手段干预的一体化健康管理系统。
              生物物理技术（频谱、生物波、基因）与古老的中医整体观和能量理论（黄帝内经、五行、同频共振）深度融合，
              它的核心价值在于，通过数据分析和深度学习，将传统模糊的健康感受转化为精准的数据指标，并提供科学、个性化的干预方案。
              旨在能够从最微观的细胞层面到最宏观的整体系统层面，全面理解和实施健康调理的专业技术，构建全民健康数智共同体，引领基层卫生健康服务转型。
            </p>
          </div>
          <div className="landing-about-hero-media-wrap">
            <div className="landing-about-hero-media">
              <img src={landingAssetPaths.storeFrontNew} alt="频安科技体验店" />
            </div>
            <div className="landing-about-hero-stat">
              <div className="landing-about-hero-stat-value">10亿+</div>
              <div className="landing-about-hero-stat-label">健康管理需求人群</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
