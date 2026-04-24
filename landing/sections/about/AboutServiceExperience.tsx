import { landingAssetPaths } from '../../assets';

function IconCircleCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

const features = [
  '无创检测，安全舒适',
  '15-20分钟快速完成',
  '专业医师一对一解读',
  '个性化健康方案定制',
];

export default function AboutServiceExperience() {
  return (
    <section
      data-testid="about-service-experience"
      className="landing-about-service-section"
    >
      <div className="landing-about-service-bg" />
      <div className="landing-about-service-inner">
        <div className="landing-about-service-grid">
          <div className="landing-about-service-media">
            <img src={landingAssetPaths.serviceScene} alt="健康检测服务" />
          </div>
          <div className="landing-about-service-copy">
            <h2 className="landing-about-service-title">
              贴心<span className="landing-about-service-title-accent">服务</span>体验
            </h2>
            <p className="landing-about-service-lead">
              我们提供舒适、专业的健康检测环境，让每一位客户都能在放松的状态下完成全面检测。
            </p>
            <ul className="landing-about-service-list">
              {features.map((item) => (
                <li key={item} className="landing-about-service-item">
                  <span className="landing-about-service-item-icon">
                    <IconCircleCheck />
                  </span>
                  <span className="landing-about-service-item-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
