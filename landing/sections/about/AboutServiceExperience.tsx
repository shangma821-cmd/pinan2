import { landingAssetPaths } from '../../assets';

const checklist = ['免费检测', '靶向修复', '数据追踪', '返利留存'];

export default function AboutServiceExperience() {
  return (
    <section className="landing-section landing-two-column">
      <div className="landing-surface">
        <p className="landing-kicker">服务体验</p>
        <h2 className="landing-section-title">贴心服务体验</h2>
        <p className="landing-section-copy">
          用户从入店体验到家庭追踪都有统一服务路径，减少理解成本，也让门店更容易复制交付标准。
        </p>
        <ul className="landing-list">
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <article className="landing-photo-card">
        <img src={landingAssetPaths.serviceScene} alt="贴心服务体验服务场景" />
      </article>
    </section>
  );
}
