import { useEffect, useState } from 'react';

const steps = [
  {
    title: '免费检测',
    summary: '进店先完成细胞与亚健康状态基础检测，快速建立用户信任。',
  },
  {
    title: '靶向修复',
    summary: '根据检测结果匹配设备、服务与家庭场景组合，给出干预路径。',
  },
  {
    title: '数据追踪',
    summary: '用手环和服务复盘追踪指标变化，让健康改善过程可视化。',
  },
  {
    title: '返利留存',
    summary: '结合会员体系和公平返利，形成复购与转介绍的经营闭环。',
  },
];

export default function HomeProcess() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % steps.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const activeStep = steps[activeIndex];

  return (
    <section data-testid="home-process" className="landing-section">
      <p className="landing-kicker">服务流程</p>
      <h2 className="landing-section-title">服务闭环，无断点体验</h2>
      <div className="landing-process-layout">
        <div className="landing-process-steps">
          {steps.map((step, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                key={step.title}
                type="button"
                className={isActive ? 'landing-process-step is-active' : 'landing-process-step'}
                onClick={() => setActiveIndex(index)}
              >
                <span className="landing-process-step-number">{index + 1}</span>
                <strong>{step.title}</strong>
                <p>{step.summary}</p>
              </button>
            );
          })}
        </div>
        <div className="landing-surface landing-process-detail">
          <span className="landing-highlight-line">免费检测→靶向修复→数据追踪→返利留存</span>
          <h3 className="landing-section-title">{activeStep.title}</h3>
          <p className="landing-section-copy">{activeStep.summary}</p>
          <p className="landing-section-copy">
            通过门店服务与家庭产品协同，用户无需在多个场景之间反复切换，经营者也能持续掌握服务进度。
          </p>
        </div>
      </div>
    </section>
  );
}
