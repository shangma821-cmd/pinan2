import { Link } from 'react-router-dom';

import { landingNewsArticles } from '../../content/newsContent';

export default function HomeNewsPreview() {
  const articles = landingNewsArticles.slice(0, 3);

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
              <span>{article.category}</span>
              <span>{`0${article.id}`}</span>
            </div>
            <h3 className="landing-card-title">{article.title}</h3>
            <p className="landing-card-copy">{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
