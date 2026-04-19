const painPoints = [
  {
    title: '获客贵，复购弱',
    body: '传统亚健康服务更依赖高频促销，客群沉淀慢，难形成持续复购。',
  },
  {
    title: '效果不透明',
    body: '用户看不到检测、修复与复盘闭环，价值感和信任度都容易流失。',
  },
  {
    title: '经营缺抓手',
    body: '缺少标准化服务流程和公平返利机制，门店扩张复制成本高。',
  },
];

const opportunities = [
  '亚健康管理与主动预防需求持续增长',
  'AI 检测与家庭场景结合带来高频使用',
  '服务闭环与返利机制提升转介绍效率',
];

export default function HomePainPoints() {
  return (
    <section data-testid="home-pain-points" className="landing-section landing-two-column">
      <div>
        <p className="landing-kicker">市场洞察</p>
        <h2 className="landing-section-title">传统模式3大痛点</h2>
        <div className="landing-card-grid">
          {painPoints.map((item) => (
            <article key={item.title} className="landing-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="landing-surface">
        <p className="landing-kicker">行业窗口</p>
        <h2 className="landing-section-title">政策红利</h2>
        <p className="landing-section-copy">
          从亚健康管理规范化到智慧健康设备普及，频安把政策导向落到可复制的服务模型和门店收益结构里。
        </p>
        <ul className="landing-list">
          {opportunities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
