import { landingAssetPaths } from '../../assets';

const cards = [
  {
    src: 'teamPhoto' as const,
    alt: '频安健康专业团队',
    title: '专业医护团队',
    desc: '由资深医生、健康管理师和技术专家组成的专业团队',
  },
  {
    src: 'equipmentDetail' as const,
    alt: 'AI细胞检测设备',
    title: '先进检测设备',
    desc: '采用国家二类医疗器械认证的AI细胞检测修复系统',
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
          <p className="landing-about-team-lead">汇聚行业精英，配备先进设备</p>
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
