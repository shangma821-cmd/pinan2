const principles = [
  '以人为本',
  '细胞为辅',
  '膳食为基',
  '五行为始',
  '频谱共振为桥',
  '中医基因为纲',
  '调理平衡为境',
  '人工智能为核',
];

export default function AboutStrategy() {
  return (
    <section data-testid="about-strategy" className="landing-about-strategy-section">
      <div className="landing-about-strategy-bg" />
      <div className="landing-about-strategy-inner">
        <div className="landing-about-strategy-header">
          <span className="landing-about-strategy-eyebrow">战略方向</span>
          <h2 className="landing-about-strategy-title">
            AI驱动的<span className="landing-about-strategy-title-accent">智慧健康管理</span>
          </h2>
          <p className="landing-about-strategy-lead">
            频安科技秉持八大核心理念，将AI人工智能算法、生物物理技术与中医整体观、能量理论相结合，
            推动健康服务从模糊感受走向数据化表达、个性化方案与连续化管理。
          </p>
        </div>

        <div className="landing-about-strategy-grid">
          <article className="landing-about-strategy-card landing-about-strategy-card--wide">
            <h3>八大核心理念</h3>
            <div className="landing-about-strategy-principles">
              {principles.map((item) => (
                <span key={item} className="landing-about-strategy-principle">{item}</span>
              ))}
            </div>
          </article>

          <article className="landing-about-strategy-card">
            <h3>技术路径</h3>
            <p>
              以AI算法为核心，围绕全身功能状态评估、个性化调理方案生成、频谱节律调理体验与智能穿戴记录，
              形成评估、方案、体验、追踪与服务协同的一体化健康管理系统。
            </p>
          </article>

          <article className="landing-about-strategy-card">
            <h3>融合方向</h3>
            <p>
              将频谱、生物波等生物物理技术，与《黄帝内经》、五行、同频共振等中医整体观和能量理论融合，
              通过数据分析与深度学习，把日常健康感受转化为可记录、可追踪、可复盘的状态参考。
            </p>
          </article>

          <article className="landing-about-strategy-card landing-about-strategy-card--wide">
            <h3>服务愿景</h3>
            <p>
              频安科技响应“健康中国2030”战略方向，以基层健康管理体系数智化转型为核心，
              构建“数智健康提质增效、人工智能服务创收”的双轮驱动模式，打造可持续、可复制的智慧健康服务体系。
              未来，公司将协同基层健康服务场景，推进县、乡、村多级健康管护网络的数字化升级，
              促进公共服务单位、健康服务机构、康养行业、居民与产业伙伴形成共建共享的新生态。
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
