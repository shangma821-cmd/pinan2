import { useState } from 'react';

const advantages = [
  {
    title: '资质壁垒：国家背书',
    body: '以国家黄十字亚健康服务体系为信任底盘，让健康管理服务从第一天就具备清晰的专业身份。',
  },
  {
    title: '产品壁垒：智能设备+闭环服务',
    body: '检测设备、手环追踪和家庭水机组合，让门店服务覆盖到店体验与居家延续两个场景。',
  },
  {
    title: '模式壁垒：公平返利，用户自动裂变',
    body: '返利逻辑绑定服务持续使用，帮助门店把结果价值转化为稳定复购和转介绍。',
  },
  {
    title: '效果承诺：7天指标可见改善',
    body: '聚焦可追踪指标变化与阶段性复盘，让用户能够看见改善，不再停留在模糊感受层面。',
  },
];

export default function HomeAdvantages() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section data-testid="home-advantages" className="landing-section">
      <p className="landing-kicker">竞争优势</p>
      <h2 className="landing-section-title">4大核心壁垒，同行难复制</h2>
      <p className="landing-section-copy">
        每一个优势都对应门店增长的关键节点，确保从信任建立、产品交付到盈利模式都有清晰抓手。
      </p>
      <div className="landing-expandable">
        {advantages.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <article
              key={item.title}
              data-testid={`home-advantages-item-${index}`}
              data-active={isActive ? 'true' : 'false'}
              className={isActive ? 'landing-expandable-item is-active' : 'landing-expandable-item'}
            >
              <button
                type="button"
                className="landing-expandable-trigger"
                onClick={() => setActiveIndex(index)}
                aria-expanded={isActive}
              >
                <span>{item.title}</span>
                <span className="landing-badge">{isActive ? '当前重点' : '展开详情'}</span>
              </button>
              {isActive ? <div className="landing-expandable-body">{item.body}</div> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
