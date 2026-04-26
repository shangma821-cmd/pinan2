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
    title: '睡眠改善案例',
    image: 'successCase1',
    alt: '睡眠改善案例',
    user: '35岁企业高管',
    problem: '失眠3年',
    effect: '周卡体验7天，睡眠时长从5小时增至7小时',
    result: '升级年卡',
  },
  {
    title: '疼痛缓解案例',
    image: 'lifestyleSmart',
    alt: '疼痛缓解案例',
    user: '45岁宝妈',
    problem: '颈椎疼痛',
    effect: '月卡20次修复，疼痛指数从8分降至3分',
    result: '推荐2个家庭卡用户',
  },
  {
    title: '亚健康调理案例',
    image: 'techSpectrum',
    alt: '亚健康调理案例',
    user: '50岁退休教师',
    problem: '亚健康综合症状',
    effect: '半年家庭卡调理，整体精力与代谢明显改善',
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
          <p className="landing-products-cases-lead">真实用户，真实效果</p>
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
                    <dt>问题</dt>
                    <dd>{c.problem}</dd>
                  </div>
                  <div>
                    <dt>效果</dt>
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
