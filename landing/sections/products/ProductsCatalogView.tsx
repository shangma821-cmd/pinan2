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
    title: 'AI细胞检测修复系统',
    image: 'productDetection',
    alt: 'AI细胞检测修复系统',
    copy: '15-20分钟全身扫描，覆盖12大生理系统，提前1-5年预警健康风险。获国家二类医疗器械认证，可进医疗机构。',
    tags: ['12大系统扫描', '1-5年风险预警', '二类医疗器械认证', 'AI智能分析'],
    paramHeading: '技术参数',
    params: ['扫描时间：15-20分钟', '系统覆盖：12大生理系统', '预警周期：1-5年'],
  },
  {
    eyebrow: '居家监测',
    eyebrowIcon: <IconWatch />,
    title: '智能无线手环',
    image: 'productBand',
    alt: '智能无线手环',
    copy: '居家监测+远程修复，年卡用户免费使用，锁定长期消费。实时追踪健康数据，智能预警异常指标。',
    tags: ['居家监测', '远程修复', '实时预警', '数据云端同步'],
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
    copy: '超饱和氢浓度，刷卡出5L/80秒，满足门店高频需求。富氢水具有抗氧化、改善代谢等多重健康功效。',
    tags: ['超饱和氢浓度', '5L/80秒快速出水', '抗氧化改善代谢', '刷卡智能出水'],
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
