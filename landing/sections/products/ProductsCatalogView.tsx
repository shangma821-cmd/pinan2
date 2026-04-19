import { landingAssetPaths } from '../../assets';

const products = [
  {
    title: 'AI细胞检测修复系统',
    subtitle: '核心设备',
    image: landingAssetPaths.productDetection,
    specs: ['门店检测入口', '可视化指标反馈', '用于精准筛查和靶向服务规划'],
  },
  {
    title: '智能无线手环',
    subtitle: '居家监测',
    image: landingAssetPaths.productBand,
    specs: ['连续追踪日常状态', '连接用户家庭场景', '支撑数据追踪与复盘'],
  },
  {
    title: '小分子富氢水机',
    subtitle: '增值服务',
    image: landingAssetPaths.productWater,
    specs: ['形成家庭健康补充场景', '提高客单和复购频次', '扩展长期服务价值'],
  },
];

export default function ProductsCatalogView() {
  return (
    <section className="landing-product-grid">
      {products.map((item) => (
        <article key={item.title} className="landing-product-card">
          <img src={item.image} alt={item.title} />
          <div className="landing-card-meta">
            <span>{item.subtitle}</span>
            <span>核心产品</span>
          </div>
          <h3 className="landing-card-title">{item.title}</h3>
          <ul className="landing-product-specs">
            {item.specs.map((spec) => (
              <li key={spec}>{spec}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
