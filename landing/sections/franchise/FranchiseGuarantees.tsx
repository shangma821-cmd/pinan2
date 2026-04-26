import type { ReactNode } from 'react';

function IconBadge() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

interface Guarantee {
  icon: ReactNode;
  title: string;
  desc: string;
}

const guarantees: Guarantee[] = [
  {
    icon: <IconBadge />,
    title: '押金可退',
    desc: '合作满1年且无违规，设备无损坏，全额退还押金',
  },
  {
    icon: <IconShield />,
    title: '保底保障',
    desc: '月服务次数≥100次，免当月设备使用费',
  },
  {
    icon: <IconLogout />,
    title: '退出机制',
    desc: '合作6个月未盈利，可申请转让或终止合作',
  },
];

export default function FranchiseGuarantees() {
  return (
    <div data-testid="franchise-guarantees" className="landing-franchise-guarantees-block">
      <h3 className="landing-franchise-guarantees-title">3大承诺，零风险加盟</h3>
      <div className="landing-franchise-guarantees-grid">
        {guarantees.map((g) => (
          <article key={g.title} className="landing-franchise-guarantee-card">
            <div className="landing-franchise-guarantee-icon">{g.icon}</div>
            <h4 className="landing-franchise-guarantee-card-title">{g.title}</h4>
            <p className="landing-franchise-guarantee-desc">{g.desc}</p>
          </article>
        ))}
      </div>
      <div className="landing-franchise-offer">
        <strong>限时优惠</strong>
        <span>仅限前50家加盟商</span>
        <span>免首年品牌管理费（正常2000元/年）</span>
      </div>
    </div>
  );
}
