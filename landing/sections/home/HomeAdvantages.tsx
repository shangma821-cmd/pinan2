import { useState } from 'react';
import { landingAssetPaths } from '../../assets';

const tiers = [
  {
    icon: 'shield-check',
    title: '资质壁垒：国家背书',
    detail:
      '核心设备获国家二类医疗器械认证，可进医疗机构。国家"黄十字"亚健康服务体系认证，3项发明专利+30项软著',
  },
  {
    icon: 'cpu',
    title: '产品壁垒：智能设备+闭环服务',
    detail:
      'AI细胞检测修复系统+智能无线手环+小分子富氢水机，形成完整服务闭环：免费检测→靶向修复→数据追踪→返利留存',
  },
  {
    icon: 'gift',
    title: '模式壁垒：公平返利，用户自动裂变',
    detail:
      '引流端：免费基础检测+5升富氢水，新客到店率提升300%。留存端：分类公池返利，用户复购率超60%',
  },
  {
    icon: 'trending-up',
    title: '效果承诺：7天指标可见改善',
    detail:
      '效果承诺（7天指标可见改善，未达标免费续做）+阶梯套餐（周卡→月卡→年卡），用户满意度92%，推荐转化率45%',
  },
];

function IconShieldCheck() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

function IconCpu() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20v2"/><path d="M12 2v2"/>
      <path d="M17 20v2"/><path d="M17 2v2"/>
      <path d="M2 12h2"/><path d="M2 17h2"/><path d="M2 7h2"/>
      <path d="M20 12h2"/><path d="M20 17h2"/><path d="M20 7h2"/>
      <path d="M7 20v2"/><path d="M7 2v2"/>
      <rect x="4" y="4" width="16" height="16" rx="2"/>
      <rect x="8" y="8" width="8" height="8" rx="1"/>
    </svg>
  );
}

function IconGift() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="8" width="18" height="4" rx="1"/>
      <path d="M12 8v13"/>
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
    </svg>
  );
}

function IconTrendingUp() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 7h6v6"/>
      <path d="m22 7-8.5 8.5-5-5L2 17"/>
    </svg>
  );
}

function IconCircleCheck() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

function TierIcon({ name }: { name: string }) {
  if (name === 'shield-check') return <IconShieldCheck />;
  if (name === 'cpu') return <IconCpu />;
  if (name === 'gift') return <IconGift />;
  if (name === 'trending-up') return <IconTrendingUp />;
  return null;
}

export default function HomeAdvantages() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section data-testid="home-advantages" className="landing-advantages-section">
      <div className="landing-advantages-bg-base" />
      <div className="landing-advantages-bg-glow" />
      <div className="landing-advantages-inner">
        <div className="landing-advantages-grid">
          {/* Left column */}
          <div className="landing-advantages-copy">
            <div className="landing-advantages-eyebrow"><span>核心优势</span></div>
            <h2 className="landing-advantages-title">
              4大核心壁垒，<span className="landing-gradient-text">同行难复制</span>
            </h2>
            <p className="landing-advantages-lead">
              频安健康依托国家&ldquo;黄十字&rdquo;亚健康服务体系，构建了难以复制的核心竞争力，
              为加盟商提供坚实的竞争壁垒。
            </p>
            <div className="landing-advantages-list">
              {tiers.map((t, i) => (
                <button
                  type="button"
                  key={t.title}
                  data-testid={`home-advantages-item-${i}`}
                  data-active={i === activeIndex ? 'true' : 'false'}
                  className={i === activeIndex ? 'landing-advantages-tier is-active' : 'landing-advantages-tier'}
                  onClick={() => setActiveIndex(i)}
                  aria-expanded={i === activeIndex}
                >
                  <div className="landing-advantages-tier-row">
                    <div className="landing-advantages-tier-icon">
                      <TierIcon name={t.icon} />
                    </div>
                    <div className="landing-advantages-tier-body">
                      <div className="landing-advantages-tier-heading">
                        <h3>{t.title}</h3>
                        {i === activeIndex ? (
                          <span className="landing-advantages-tier-check" aria-hidden="true">
                            <IconCircleCheck />
                          </span>
                        ) : null}
                      </div>
                      <p className="landing-advantages-tier-detail">{t.detail}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="landing-advantages-visual">
            <div className="landing-advantages-visual-frame">
              <img src={landingAssetPaths.whyChoose} alt="频安健康核心竞争力" />
            </div>
            <div className="landing-advantages-stat-row">
              <div className="landing-advantages-stat-card landing-apple-card">
                <div className="landing-advantages-stat-value">二类医疗</div>
                <div className="landing-advantages-stat-label">器械认证</div>
              </div>
              <div className="landing-advantages-stat-card landing-apple-card">
                <div className="landing-advantages-stat-value">300%</div>
                <div className="landing-advantages-stat-label">到店率提升</div>
              </div>
            </div>
            <div className="landing-advantages-visual-ring" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
