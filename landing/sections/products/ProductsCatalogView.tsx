import type { ReactNode } from 'react';

import { landingAssetPaths } from '../../assets';

function IconScan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    </svg>
  );
}

function IconWatch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="6" />
      <polyline points="12 10 12 12 13 13" />
      <path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05" />
      <path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05" />
    </svg>
  );
}

function IconDroplets() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
      <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
    </svg>
  );
}

interface ProductSpec {
  eyebrow: string;
  eyebrowIcon: ReactNode;
  title: string;
  image: keyof typeof landingAssetPaths;
  alt: string;
  copy: string;
  tags: string[];
  paramHeading: string;
  params: string[];
  reverse?: boolean;
}

const products: ProductSpec[] = [
  {
    eyebrow: '核心设备',
    eyebrowIcon: <IconScan />,
    title: 'AI健康评估调理系统',
    image: 'productDetection',
    alt: 'AI健康评估调理系统',
    copy: '围绕多项生理状态数据进行采集与分析，生成健康管理参考报告，辅助门店开展标准化评估与调理服务。',
    tags: ['多维状态评估', '健康管理报告', '服务流程记录', 'AI智能分析'],
    paramHeading: '技术参数',
    params: ['评估时间：约15-20分钟', '数据维度：多系统状态参考', '服务用途：门店健康管理'],
  },
  {
    eyebrow: '居家监测',
    eyebrowIcon: <IconWatch />,
    title: '智能无线手环',
    image: 'productBand',
    alt: '智能无线手环',
    copy: '居家记录+门店服务联动，帮助用户持续关注日常状态变化。相关数据仅作为健康管理服务参考。',
    tags: ['居家记录', '服务联动', '趋势提醒', '数据云端同步'],
    paramHeading: '技术参数',
    params: ['续航时间：7天', '防水等级：IP68', '数据同步：实时'],
    reverse: true,
  },
  {
    eyebrow: '增值服务',
    eyebrowIcon: <IconDroplets />,
    title: '小分子富氢水机',
    image: 'productWater',
    alt: '小分子富氢水机',
    copy: '面向门店饮水服务场景设计，支持刷卡出水与会员管理，作为健康生活方式服务的一部分。',
    tags: ['门店饮水服务', '5L/80秒快速出水', '会员场景配套', '刷卡智能出水'],
    paramHeading: '技术参数',
    params: ['出水速度：5L/80秒', '氢浓度：超饱和', '支付方式：刷卡'],
  },
];

export default function ProductsCatalogView() {
  return (
    <div data-testid="products-catalog" className="landing-products-catalog">
      {products.map((p) => (
        <div
          key={p.title}
          className={`landing-products-row${p.reverse ? ' is-reverse' : ''}`}
        >
          <div className="landing-products-row-media">
            <img src={landingAssetPaths[p.image]} alt={p.alt} />
          </div>
          <div className="landing-products-row-copy">
            <div className="landing-products-row-eyebrow">
              {p.eyebrowIcon}
              <span>{p.eyebrow}</span>
            </div>
            <h2 className="landing-products-row-title">{p.title}</h2>
            <p className="landing-products-row-summary">{p.copy}</p>
            <div className="landing-products-row-tags">
              {p.tags.map((tag) => (
                <span key={tag} className="landing-products-row-tag">{tag}</span>
              ))}
            </div>
            <div className="landing-products-row-params">
              <h4 className="landing-products-row-params-title">{p.paramHeading}</h4>
              <ul className="landing-products-row-params-list">
                {p.params.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
