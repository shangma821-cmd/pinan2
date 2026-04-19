import { landingAssetPaths } from '../../assets';

const cases = [
  {
    title: '睡眠改善案例',
    image: landingAssetPaths.successCase1,
    copy: '以检测与追踪为基础，建立睡眠改善的阶段性复盘。',
  },
  {
    title: '疼痛缓解案例',
    image: landingAssetPaths.lifestyleSmart,
    copy: '围绕疼痛管理场景设计持续服务，提高感知价值和复购黏性。',
  },
  {
    title: '亚健康调理案例',
    image: landingAssetPaths.techSpectrum,
    copy: '把综合调理方案拆成看得见的阶段节点，让门店更容易交付和复盘。',
  },
];

export default function ProductsCases() {
  return (
    <section className="landing-section">
      <p className="landing-kicker">场景案例</p>
      <h2 className="landing-section-title">用户案例</h2>
      <div className="landing-case-grid">
        {cases.map((item) => (
          <article key={item.title} className="landing-case-card">
            <img src={item.image} alt={item.title} />
            <h3 className="landing-card-title">{item.title}</h3>
            <p className="landing-card-copy">{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
