import { Link } from 'react-router-dom';

export default function HomeClosingCta() {
  return (
    <section data-testid="home-closing-cta" className="landing-section landing-two-column">
      <div>
        <p className="landing-kicker">共创增长</p>
        <h2 className="landing-section-title">把效果型健康服务做成可复制的门店增长引擎</h2>
        <p className="landing-section-copy">
          从单店增项到区域布局，频安把健康服务闭环与可量化收益模型同时交付给合作伙伴。
        </p>
      </div>
      <div className="landing-surface">
        <span className="landing-badge">招商进行中</span>
        <p className="landing-section-copy">
          如果你希望用更高频、更有结果感的服务模型升级现有门店，下一步就是查看完整加盟政策。
        </p>
        <Link className="landing-button-primary" to="/franchise">
          了解加盟政策
        </Link>
      </div>
    </section>
  );
}
