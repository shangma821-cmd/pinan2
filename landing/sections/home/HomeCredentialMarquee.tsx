type CredentialItem = { label: string; icon: 'award' | 'heart-pulse' | 'shield' | 'sparkles' | 'zap' | 'leaf' };

const items: CredentialItem[] = [
  { label: '国家黄十字亚健康服务体系', icon: 'award' },
  { label: '二类医疗器械认证', icon: 'heart-pulse' },
  { label: '3项国家发明专利', icon: 'shield' },
  { label: '30项计算机软著', icon: 'sparkles' },
  { label: 'AI细胞修复技术', icon: 'zap' },
  { label: '频谱技术研发中心', icon: 'leaf' },
];

function Icon({ name }: { name: CredentialItem['icon'] }) {
  const shared = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  if (name === 'award') {
    return (
      <svg {...shared}>
        <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
        <circle cx="12" cy="8" r="6" />
      </svg>
    );
  }
  if (name === 'heart-pulse') {
    return (
      <svg {...shared}>
        <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
        <path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
      </svg>
    );
  }
  if (name === 'shield') {
    return (
      <svg {...shared}>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      </svg>
    );
  }
  if (name === 'sparkles') {
    return (
      <svg {...shared}>
        <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
        <path d="M20 2v4" />
        <path d="M22 4h-4" />
        <circle cx="4" cy="20" r="2" />
      </svg>
    );
  }
  if (name === 'zap') {
    return (
      <svg {...shared}>
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
      </svg>
    );
  }
  // leaf
  return (
    <svg {...shared}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

export default function HomeCredentialMarquee() {
  return (
    <section data-testid="home-credentials" className="landing-credential-section">
      <div className="landing-credential-header">
        <p className="landing-credential-eyebrow">国家认证 · 技术领先 · 值得信赖</p>
      </div>
      <div className="landing-credential-marquee">
        <div className="landing-credential-fade landing-credential-fade--left" aria-hidden="true" />
        <div className="landing-credential-fade landing-credential-fade--right" aria-hidden="true" />
        <div className="landing-credential-track">
          {[...items, ...items].map((item, i) => (
            <div key={`${item.label}-${i}`} className="landing-credential-pill">
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
