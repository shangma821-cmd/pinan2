import { useEffect, useState } from 'react';

type StepIconName = 'scan' | 'heart-pulse' | 'chart-column' | 'gift';

function StepIcon({ name }: { name: StepIconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === 'scan' && (
        <>
          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        </>
      )}
      {name === 'heart-pulse' && (
        <>
          <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
          <path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
        </>
      )}
      {name === 'chart-column' && (
        <>
          <path d="M3 3v16a2 2 0 0 0 2 2h16" />
          <path d="M18 17V9" />
          <path d="M13 17V5" />
          <path d="M8 17v-3" />
        </>
      )}
      {name === 'gift' && (
        <>
          <rect x="3" y="8" width="18" height="4" rx="1" />
          <path d="M12 8v13" />
          <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
          <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
        </>
      )}
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

interface Step {
  id: string;
  icon: StepIconName;
  label: string;
  title: string;
  body: string;
  highlight: string;
}

const steps: Step[] = [
  {
    id: 'scan',
    icon: 'scan',
    label: '精准筛查',
    title: '免费检测',
    body: '15-20分钟全身扫描，覆盖12大生理系统，AI智能分析健康状况',
    highlight: '提前1-5年预警健康风险',
  },
  {
    id: 'heal',
    icon: 'heart-pulse',
    label: '靶向干预',
    title: '靶向修复',
    body: '根据检测结果，制定个性化频谱修复方案，精准干预亚健康问题',
    highlight: '7天指标可见改善',
  },
  {
    id: 'track',
    icon: 'chart-column',
    label: '持续监测',
    title: '数据追踪',
    body: '智能手环实时监测健康数据，云端记录修复进度',
    highlight: '随时查看身体改善情况',
  },
  {
    id: 'reward',
    icon: 'gift',
    label: '公平返利',
    title: '返利留存',
    body: '分类公池返利机制，日营业额5%拆分，年卡/家庭卡享积分加速',
    highlight: '复购率超60%',
  },
];

export default function HomeProcess() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveIndex((i) => (i + 1) % 4), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section data-testid="home-process" className="landing-process-section">
      <div className="landing-process-bg-base" />
      <div className="landing-process-top-line" />
      <div className="landing-process-bottom-line" />

      <div className="landing-process-inner">
        {/* Header */}
        <div className="landing-process-header">
          <div className="landing-process-eyebrow">
            <span>服务流程</span>
          </div>
          <h2 className="landing-process-title">
            服务<span className="landing-gradient-text">闭环</span>，无断点体验
          </h2>
          <p className="landing-process-subtitle">从亚健康到健康，四大环节形成完整服务链条</p>
        </div>

        {/* Steps */}
        <div className="landing-process-steps-wrap">
          {/* Progress rail (desktop only) */}
          <div className="landing-process-timeline" aria-hidden="true">
            <div className="landing-process-timeline-rail">
              <div
                className="landing-process-timeline-fill"
                style={{ width: `${((activeIndex + 1) / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Grid */}
          <div className="landing-process-grid">
            {steps.map((step, i) => {
              const isActive = i === activeIndex;
              return (
                <div key={step.id} className="landing-process-col">
                  {/* Desktop step number circle */}
                  <div
                    className={
                      isActive
                        ? 'landing-process-number is-active'
                        : 'landing-process-number'
                    }
                    aria-hidden="true"
                  >
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {isActive ? (
                      <div className="landing-process-number-glow" aria-hidden="true" />
                    ) : null}
                  </div>

                  {/* Card */}
                  <button
                    type="button"
                    data-testid={`home-process-step-${i}`}
                    data-active={isActive ? 'true' : 'false'}
                    className={
                      isActive
                        ? 'landing-process-card landing-apple-card is-active'
                        : 'landing-process-card landing-apple-card'
                    }
                    onClick={() => setActiveIndex(i)}
                  >
                    {/* Mobile compact header */}
                    <div className="landing-process-card-mobile-head">
                      <div
                        className="landing-process-number landing-process-number--mobile is-active"
                        aria-hidden="true"
                      >
                        <span>{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <span className="landing-process-card-label">{step.label}</span>
                    </div>

                    {/* Desktop label */}
                    <div className="landing-process-card-label-desktop">
                      <span className="landing-process-card-label">{step.label}</span>
                    </div>

                    {/* Icon */}
                    <div
                      className={
                        isActive
                          ? 'landing-process-icon is-active'
                          : 'landing-process-icon'
                      }
                      aria-hidden="true"
                    >
                      <StepIcon name={step.icon} />
                    </div>

                    <h3 className="landing-process-card-title">{step.title}</h3>
                    <p className="landing-process-card-body">{step.body}</p>
                    <div
                      className={
                        isActive
                          ? 'landing-process-card-highlight is-active'
                          : 'landing-process-card-highlight'
                      }
                    >
                      <IconChevronRight />
                      <span>{step.highlight}</span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom stat pill */}
        <div className="landing-process-stat-pill-wrap">
          <div className="landing-process-stat-pill landing-apple-card">
            <div className="landing-process-stat">
              <div className="landing-process-stat-value">15-20分钟</div>
              <div className="landing-process-stat-label">快速检测</div>
            </div>
            <div className="landing-process-stat-divider" />
            <div className="landing-process-stat">
              <div className="landing-process-stat-value">7天</div>
              <div className="landing-process-stat-label">见效周期</div>
            </div>
            <div className="landing-process-stat-divider" />
            <div className="landing-process-stat">
              <div className="landing-process-stat-value">60%+</div>
              <div className="landing-process-stat-label">复购率</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
