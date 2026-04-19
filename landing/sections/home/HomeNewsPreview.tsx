import { Link } from 'react-router-dom';

import { landingAssetPaths } from '../../assets';

const articles = [
  {
    id: 1,
    title: 'AI 细胞修复如何帮助门店建立高频健康服务',
    image: landingAssetPaths.newsAiHealth,
    copy: '用检测、干预、追踪和返利形成的闭环，正在重塑线下健康门店的增长节奏。',
  },
  {
    id: 2,
    title: '品牌荣誉与体系认证更新',
    image: landingAssetPaths.newsAward,
    copy: '国家认证、设备资质与服务体系升级，为门店复制提供更稳定的信任底盘。',
  },
  {
    id: 3,
    title: '市场窗口期里的亚健康经营机会',
    image: landingAssetPaths.newsMarket,
    copy: '从服务内容到收益结构，体验站模式正在打开新的业绩增长空间。',
  },
];

export default function HomeNewsPreview() {
  return (
    <section data-testid="home-news-preview" className="landing-section">
      <div className="landing-page-header">
        <div>
          <p className="landing-kicker">资讯窗口</p>
          <h2 className="landing-section-title">资讯动态</h2>
        </div>
        <Link className="landing-inline-link" to="/news">
          查看全部资讯
        </Link>
      </div>
      <div className="landing-news-grid">
        {articles.map((article) => (
          <Link key={article.id} className="landing-news-card" to={`/news?id=${article.id}`}>
            <img src={article.image} alt={article.title} />
            <div className="landing-card-meta">
              <span>资讯动态</span>
              <span>{`0${article.id}`}</span>
            </div>
            <h3 className="landing-card-title">{article.title}</h3>
            <p className="landing-card-copy">{article.copy}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
