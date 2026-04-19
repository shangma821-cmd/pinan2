import { landingAssetPaths } from '../../assets';

const proofStats = [
  { value: '5000+', label: '体验用户沉淀' },
  { value: '92%', label: '服务满意度' },
  { value: '45%', label: '转介绍转化率提升' },
  { value: '60%+', label: '单店年增长空间' },
];

const cases = [
  {
    title: '睡眠改善案例',
    image: landingAssetPaths.caseSleep,
    copy: '围绕睡眠质量、恢复效率和日常能量感建立家庭场景服务。',
  },
  {
    title: '疼痛缓解案例',
    image: landingAssetPaths.casePain,
    copy: '用数据追踪方式把“感觉好转”转化成可复盘的健康改善路径。',
  },
];

export default function HomeResults() {
  return (
    <section data-testid="home-results" className="landing-section">
      <p className="landing-kicker">案例与证据</p>
      <h2 className="landing-section-title">成果与声誉</h2>
      <div className="landing-results-split">
        <div className="landing-results-grid">
          <div className="landing-stat-grid">
            {proofStats.map((item) => (
              <article key={item.value} className="landing-stat-card">
                <span className="landing-stat-value">{item.value}</span>
                <span className="landing-stat-label">{item.label}</span>
              </article>
            ))}
          </div>
        </div>
        <div className="landing-results-gallery">
          {cases.map((item) => (
            <article key={item.title} className="landing-case-card">
              <img src={item.image} alt={item.title} />
              <h3 className="landing-card-title">{item.title}</h3>
              <p className="landing-card-copy">{item.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
