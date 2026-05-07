import { Link } from 'react-router-dom';

import { landingNewsArticles } from '../../content/newsContent';
import { useReveal } from '../../hooks/useReveal';

function IconArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

export default function HomeNewsPreview() {
  const articles = landingNewsArticles.slice(0, 3);
  const header = useReveal<HTMLDivElement>();
  const grid = useReveal<HTMLDivElement>();

  return (
    <section data-testid="home-news-preview" className="landing-news-preview-section">
      <div className="landing-news-preview-overlay" />
      <div className="landing-news-preview-inner">
        <div
          ref={header.ref}
          data-revealed={header.revealed || undefined}
          className="landing-news-preview-header landing-reveal"
        >
          <div className="landing-news-preview-header-copy">
            <div className="landing-news-preview-eyebrow"><span>资讯动态</span></div>
            <h2 className="landing-news-preview-title">
              洞察与<span className="landing-news-preview-title-accent">动态</span>
            </h2>
            <p className="landing-news-preview-lead">了解频谱健康管理领域的最新资讯和应用观察</p>
          </div>
          <Link to="/news" className="landing-news-preview-cta">
            查看全部资讯
            <IconArrowRight />
          </Link>
        </div>

        <div
          ref={grid.ref}
          data-revealed={grid.revealed || undefined}
          data-delay="500"
          className="landing-news-preview-grid landing-reveal landing-reveal--up-lg"
        >
          {articles.map((article) => (
            <Link key={article.id} to={`/news?id=${article.id}`} className="landing-news-preview-card">
              <div className="landing-news-preview-card-media">
                <img src={article.image} alt={article.title} />
                <span className="landing-news-preview-card-badge">{article.category}</span>
              </div>
              <div className="landing-news-preview-card-body">
                <div className="landing-news-preview-card-meta">
                  <IconCalendar />
                  <span>{article.date}</span>
                </div>
                <h3 className="landing-news-preview-card-title">{article.title}</h3>
                <p className="landing-news-preview-card-excerpt">{article.excerpt}</p>
                <div className="landing-news-preview-card-more">
                  <span>阅读更多</span>
                  <IconArrowRight />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
