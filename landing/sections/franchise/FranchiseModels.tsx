interface Model {
  title: string;
  deposit: string;
  freeStock: string[];
  audience: string;
  revenue: string;
  featured?: boolean;
  badge?: string;
}

const models: Model[] = [
  {
    title: '店中店',
    deposit: '1.98万',
    freeStock: ['检测系统 1套', '富氢水机 1台', '手环 1套', '开业礼包'],
    audience: '现有门店增项（美容院/药店/养生馆）',
    revenue: '47万+',
  },
  {
    title: '标准店',
    deposit: '3.98万',
    freeStock: ['检测系统 3套', '富氢水机 1台', '手环 3套', '设计方案'],
    audience: '创业新手，50-100㎡门店',
    revenue: '177万+',
    featured: true,
    badge: '推荐选择',
  },
  {
    title: '旗舰店',
    deposit: '6.98万',
    freeStock: ['检测系统 6套', '富氢水机 1台', '手环 10套', '3套设计方案'],
    audience: '10公里区域代理，100-200㎡门店',
    revenue: '365万+',
  },
];

export default function FranchiseModels() {
  return (
    <div data-testid="franchise-models" className="landing-franchise-models-block">
      <div className="landing-franchise-models-header">
        <h2 className="landing-franchise-models-title">
          合作<span className="landing-franchise-models-title-accent">方案</span>
        </h2>
        <p className="landing-franchise-models-lead">三种模式，总有一款适合您</p>
      </div>
      <div className="landing-franchise-models-grid">
        {models.map((m) => (
          <article
            key={m.title}
            className={`landing-franchise-model-card${m.featured ? ' is-featured' : ''}`}
          >
            {m.badge ? (
              <span className="landing-franchise-model-badge">{m.badge}</span>
            ) : null}
            <h3 className="landing-franchise-model-title">{m.title}</h3>
            <div className="landing-franchise-model-deposit">
              <span className="landing-franchise-model-deposit-label">合作押金</span>
              <span className="landing-franchise-model-deposit-value">
                <span className="landing-franchise-model-deposit-currency">¥</span>
                {m.deposit}
              </span>
            </div>
            <div className="landing-franchise-model-block">
              <h4 className="landing-franchise-model-block-title">免费铺货</h4>
              <ul className="landing-franchise-model-list">
                {m.freeStock.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="landing-franchise-model-block">
              <h4 className="landing-franchise-model-block-title">适合人群</h4>
              <p className="landing-franchise-model-audience">{m.audience}</p>
            </div>
            <div className="landing-franchise-model-revenue">
              <span className="landing-franchise-model-revenue-label">预计年收益</span>
              <span className="landing-franchise-model-revenue-value">{m.revenue}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
