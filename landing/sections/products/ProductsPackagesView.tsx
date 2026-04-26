interface PackageSpec {
  title: string;
  price: string;
  unit: string;
  audience: string;
  perks: string[];
  featured?: boolean;
}

const packages: PackageSpec[] = [
  {
    title: '周卡',
    price: '199',
    unit: '元/周',
    audience: '首次体验用户',
    perks: ['1次AI细胞检测', '3次靶向修复', '基础健康报告'],
  },
  {
    title: '月卡',
    price: '599',
    unit: '元/月',
    audience: '需持续追踪客群',
    perks: ['4次AI细胞检测', '20次靶向修复', '专属健康顾问'],
  },
  {
    title: '年卡',
    price: '3650',
    unit: '元/年',
    audience: '门店核心客群',
    perks: ['12次AI细胞检测', '不限次靶向修复', '智能手环免费用'],
    featured: true,
  },
  {
    title: '家庭卡',
    price: '5980',
    unit: '元/年',
    audience: '多成员健康管理',
    perks: ['全家3人共用', '不限次AI细胞检测', '富氢水机会员折扣'],
  },
];

export default function ProductsPackagesView() {
  return (
    <div data-testid="products-packages" className="landing-products-packages-grid">
      {packages.map((p) => (
        <article
          key={p.title}
          className={`landing-products-package-card${p.featured ? ' is-featured' : ''}`}
        >
          {p.featured ? <span className="landing-products-package-badge">推荐</span> : null}
          <h3 className="landing-products-package-title">{p.title}</h3>
          <div className="landing-products-package-price">
            <span className="landing-products-package-price-value">{p.price}</span>
            <span className="landing-products-package-price-unit">{p.unit}</span>
          </div>
          <p className="landing-products-package-audience">{p.audience}</p>
          <ul className="landing-products-package-perks">
            {p.perks.map((perk) => (
              <li key={perk}>{perk}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
