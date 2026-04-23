import { useEffect, useRef, useState } from 'react';

import { landingAssetPaths } from '../../assets';

const proofStats = [
  { finalValue: 5000, suffix: '+', label: '体验用户沉淀', testId: 'home-results-stat-users' },
  { finalValue: 92, suffix: '%', label: '服务满意度', testId: 'home-results-stat-satisfaction' },
  { finalValue: 45, suffix: '%', label: '转介绍转化率提升', testId: 'home-results-stat-referral' },
  { finalValue: 60, suffix: '%+', label: '单店年增长空间', testId: 'home-results-stat-growth' },
];

const cases = [
  {
    title: '睡眠改善案例',
    image: landingAssetPaths.caseSleep,
    copy: '围绕睡眠质量、恢复效率和日常能量感建立家庭场景服务。',
  },
  {
    title: '疼痛缓解案例',
    image: landingAssetPaths.casePain,
    copy: '用数据追踪方式把“感觉好转”转化成可复盘的健康改善路径。',
  },
];

export default function HomeResults() {
  const [values, setValues] = useState(() => proofStats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || hasAnimated) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setHasAnimated(true);
        observer.disconnect();
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px',
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return undefined;

    let frame = 0;
    const totalFrames = 36;
    const timer = window.setInterval(() => {
      frame += 1;
      setValues(
        proofStats.map((item) => {
          if (frame >= totalFrames) return item.finalValue;
          return Math.round((item.finalValue * frame) / totalFrames);
        }),
      );

      if (frame >= totalFrames) {
        window.clearInterval(timer);
      }
    }, 55);

    return () => window.clearInterval(timer);
  }, [hasAnimated]);

  return (
    <section ref={sectionRef} data-testid="home-results" className="landing-section">
      <p className="landing-kicker">案例与证据</p>
      <h2 className="landing-section-title">成果与声誉</h2>
      <div className="landing-results-split">
        <div className="landing-results-grid">
          <div className="landing-stat-grid">
            {proofStats.map((item, index) => (
              <article key={item.label} className="landing-stat-card">
                <span data-testid={item.testId} className="landing-stat-value">
                  {`${values[index]}${item.suffix}`}
                </span>
                <span className="landing-stat-label">{item.label}</span>
              </article>
            ))}
          </div>
        </div>
        <div className="landing-results-gallery">
          {cases.map((item) => (
            <article key={item.title} className="landing-case-card">
              <img src={item.image} alt={item.title} />
              <h3 className="landing-card-title">{item.title}</h3>
              <p className="landing-card-copy">{item.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
