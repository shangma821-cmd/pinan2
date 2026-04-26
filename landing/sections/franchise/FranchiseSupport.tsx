import type { ReactNode } from 'react';

function IconMegaphone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

function IconBookOpen() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </svg>
  );
}

function IconHandshake() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
      <path d="m21 3 1 11h-2" />
      <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
      <path d="M3 4h8" />
    </svg>
  );
}

function IconHeadset() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3v-7a9 9 0 0 1 18 0v7h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

interface SupportItem {
  icon: ReactNode;
  title: string;
  desc: string;
}

const items: SupportItem[] = [
  { icon: <IconMegaphone />, title: '流量支持', desc: '抖音/视频号/小红书总部统一投放' },
  { icon: <IconBookOpen />, title: '培训支持', desc: '开业前2天线下培训+驻店指导' },
  { icon: <IconHandshake />, title: '运营支持', desc: '1对1运营顾问全程跟进' },
  { icon: <IconHeadset />, title: '售后支持', desc: '核心设备1年质保，48小时上门' },
];

export default function FranchiseSupport() {
  return (
    <div data-testid="franchise-support" className="landing-franchise-support-block">
      <h3 className="landing-franchise-support-title">全程扶上马，帮你赚到钱</h3>
      <div className="landing-franchise-support-grid">
        {items.map((item) => (
          <article key={item.title} className="landing-franchise-support-card">
            <div className="landing-franchise-support-icon">{item.icon}</div>
            <h4 className="landing-franchise-support-card-title">{item.title}</h4>
            <p className="landing-franchise-support-desc">{item.desc}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
