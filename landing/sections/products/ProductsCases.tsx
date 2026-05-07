import { landingAssetPaths } from '../../assets';

interface CaseSpec {
  title: string;
  image: keyof typeof landingAssetPaths;
  alt: string;
  user: string;
  problem: string;
  effect: string;
  result: string;
}

const cases: CaseSpec[] = [
  {
    title: '作息管理反馈',
    image: 'successCase1',
    alt: '作息管理反馈',
    user: '35岁企业高管',
    problem: '作息不规律',
    effect: '周卡体验后建立作息记录与服务档案',
    result: '继续长期管理',
  },
  {
    title: '肩颈管理反馈',
    image: 'lifestyleSmart',
    alt: '肩颈管理反馈',
    user: '45岁宝妈',
    problem: '肩颈紧张、日常劳累',
    effect: '月卡服务中结合频谱节律体验与习惯建议',
    result: '家庭共同体验',
  },
  {
    title: '日常健康管理反馈',
    image: 'techSpectrum',
    alt: '日常健康管理反馈',
    user: '50岁退休教师',
    problem: '日常健康管理需求',
    effect: '家庭卡服务中持续记录状态、饮水与穿戴数据',
    result: '续费家庭卡',
  },
];

export default function ProductsCases() {
  return (
    <section data-testid="products-cases" className="landing-products-cases-section">
      <div className="landing-products-cases-bg" />
      <div className="landing-products-cases-inner">
        <div className="landing-products-cases-header">
          <h2 className="landing-products-cases-title">
            用户<span className="landing-products-cases-title-accent">案例</span>
          </h2>
          <p className="landing-products-cases-lead">真实用户，真实服务反馈</p>
        </div>
        <div className="landing-products-cases-grid">
          {cases.map((c) => (
            <article key={c.title} className="landing-products-cases-card">
              <div className="landing-products-cases-card-media">
                <img src={landingAssetPaths[c.image]} alt={c.alt} />
              </div>
              <div className="landing-products-cases-card-body">
                <h3 className="landing-products-cases-card-title">{c.title}</h3>
                <dl className="landing-products-cases-card-rows">
                  <div>
                    <dt>用户</dt>
                    <dd>{c.user}</dd>
                  </div>
                  <div>
                    <dt>需求</dt>
                    <dd>{c.problem}</dd>
                  </div>
                  <div>
                    <dt>服务记录</dt>
                    <dd className="is-effect">{c.effect}</dd>
                  </div>
                </dl>
                <div className="landing-products-cases-card-footer">
                  <span className="landing-products-cases-card-footer-label">结果</span>
                  <span className="landing-products-cases-card-footer-value">{c.result}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
