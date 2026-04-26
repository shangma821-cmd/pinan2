import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { landingNewsArticles, landingNewsCategories } from '../content/newsContent';

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.34-4.34" />
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

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function IconTag() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

export default function LandingNewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<typeof landingNewsCategories[number]>('全部');
  const [query, setQuery] = useState('');

  const activeArticleId = Number(searchParams.get('id') ?? '');
  const activeArticle = landingNewsArticles.find((a) => a.id === activeArticleId) ?? null;
  const normalizedQuery = query.trim().toLowerCase();

  const filteredArticles = landingNewsArticles.filter((article) => {
    const matchesCategory = selectedCategory === '全部' || article.category === selectedCategory;
    const matchesQuery =
      !normalizedQuery ||
      article.title.toLowerCase().includes(normalizedQuery) ||
      article.excerpt.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  const clearArticle = () => setSearchParams({});

  if (activeArticle) {
    return (
      <div data-testid="landing-page-news" className="landing-page-container">
        <section className="landing-news-detail-section">
          <div className="landing-news-detail-bg" />
          <div className="landing-news-detail-inner">
            <button
              type="button"
              data-testid="news-return-button"
              className="landing-news-detail-back"
              onClick={clearArticle}
            >
              <IconArrowLeft />
              返回列表
            </button>
            <div className="landing-news-detail-hero">
              <img src={activeArticle.image} alt={activeArticle.title} />
              <span className="landing-news-detail-badge">
                <IconTag />
                {activeArticle.category}
              </span>
            </div>
            <div className="landing-news-detail-meta">
              <span><IconCalendar /> {activeArticle.date}</span>
              <span><IconClock /> {activeArticle.readTime}</span>
              <span>{activeArticle.author}</span>
            </div>
            <h1 className="landing-news-detail-title">{activeArticle.title}</h1>
            <div className="landing-news-detail-body">
              {activeArticle.content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div data-testid="landing-page-news" className="landing-page-container">
      <section className="landing-news-hero-section">
        <div className="landing-news-hero-bg" />
        <div className="landing-news-hero-inner">
          <div className="landing-news-hero-eyebrow">
            <span>资讯动态</span>
          </div>
          <h1 className="landing-news-hero-title">
            洞察与<span className="landing-news-hero-title-accent">动态</span>
          </h1>
          <p className="landing-news-hero-lead">了解频谱治疗领域的最新资讯和研究成果</p>
        </div>
      </section>

      <section className="landing-news-list-section">
        <div className="landing-news-list-bg" />
        <div className="landing-news-list-inner">
          <div className="landing-news-toolbar">
            <div className="landing-news-filter">
              {landingNewsCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  data-testid={`news-filter-${category}`}
                  className={`landing-news-filter-btn${
                    category === selectedCategory ? ' is-active' : ''
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="landing-news-search-wrap">
              <span className="landing-news-search-icon"><IconSearch /></span>
              <input
                data-testid="news-search-input"
                className="landing-news-search-input"
                type="search"
                placeholder="搜索资讯..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>

          {filteredArticles.length ? (
            <div className="landing-news-grid">
              {filteredArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/news?id=${article.id}`}
                  className="landing-news-list-card"
                >
                  <div className="landing-news-list-card-media">
                    <img src={article.image} alt={article.title} />
                    <div className="landing-news-list-card-media-overlay" />
                    <span className="landing-news-list-card-badge">
                      <IconTag />
                      {article.category}
                    </span>
                  </div>
                  <div className="landing-news-list-card-body">
                    <div className="landing-news-list-card-meta">
                      <span><IconCalendar /> {article.date}</span>
                      <span><IconClock /> {article.readTime}</span>
                    </div>
                    <h3 className="landing-news-list-card-title">{article.title}</h3>
                    <p className="landing-news-list-card-excerpt">{article.excerpt}</p>
                    <div className="landing-news-list-card-footer">
                      <span className="landing-news-list-card-author">{article.author}</span>
                      <span className="landing-news-list-card-more">阅读更多 →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="landing-news-empty">
              <h2>没有找到相关资讯</h2>
              <p>请更换关键词或分类后重试。</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
