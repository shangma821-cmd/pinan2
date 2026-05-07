import { landingAssetPaths } from '../../assets';

const cards = [
  {
    src: 'teamPhoto' as const,
    alt: '频安科技专业团队',
    title: '专业服务团队',
    desc: '由健康管理师、运营顾问和技术专家组成的专业团队',
  },
  {
    src: 'equipmentDetail' as const,
    alt: 'AI健康评估设备',
    title: '智能评估设备',
    desc: '围绕健康评估、数据记录与门店服务流程提供技术支撑',
  },
];

export default function AboutTeamEquipment() {
  return (
    <section data-testid="about-team-equipment" className="landing-about-team-section">
      <div className="landing-about-team-bg" />
      <div className="landing-about-team-inner">
        <div className="landing-about-team-header">
          <h2 className="landing-about-team-title">
            专业<span className="landing-about-team-title-accent">团队</span>与
            <span className="landing-about-team-title-accent">设备</span>
          </h2>
          <p className="landing-about-team-lead">汇聚服务、运营与技术力量，支撑标准化健康管理体验</p>
        </div>
        <div className="landing-about-team-grid">
          {cards.map((card) => (
            <article key={card.title} className="landing-about-team-card">
              <img src={landingAssetPaths[card.src]} alt={card.alt} />
              <div className="landing-about-team-card-body">
                <h3 className="landing-about-team-card-title">{card.title}</h3>
                <p className="landing-about-team-card-desc">{card.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
