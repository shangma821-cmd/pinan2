import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { landingNewsArticles, landingNewsCategories } from '../content/newsContent';

export default function LandingNewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [query, setQuery] = useState('');

  const activeArticleId = Number(searchParams.get('id') ?? '');
  const activeArticle = landingNewsArticles.find((article) => article.id === activeArticleId) ?? null;
  const normalizedQuery = query.trim().toLowerCase();

  const filteredArticles = landingNewsArticles.filter((article) => {
    const matchesCategory = selectedCategory === '全部' || article.category === selectedCategory;
    const matchesQuery =
      !normalizedQuery ||
      article.title.toLowerCase().includes(normalizedQuery) ||
      article.excerpt.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

  const clearArticle = () => {
    setSearchParams({});
  };

  if (activeArticle) {
    return (
      <section data-testid="landing-page-news" className="landing-page-container">
        <div data-testid="news-detail-view" className="landing-news-detail landing-section">
          <button
            type="button"
            data-testid="news-return-button"
            className="landing-inline-link landing-news-return"
            onClick={clearArticle}
          >
            返回列表
          </button>
          <div className="landing-news-detail-hero">
            <img src={activeArticle.image} alt={activeArticle.title} />
            <span className="landing-pill">{activeArticle.category}</span>
          </div>
          <div className="landing-news-detail-copy">
            <h1 className="landing-page-title">{activeArticle.title}</h1>
            <div className="landing-news-detail-meta">
              <span>{activeArticle.date}</span>
              <span>{activeArticle.author}</span>
              <span>{activeArticle.readTime}</span>
            </div>
            <div className="landing-news-detail-body">
              {activeArticle.content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section data-testid="landing-page-news" className="landing-page-container">
      <div className="landing-page-header landing-news-header">
        <div>
          <p className="landing-kicker">资讯窗口</p>
          <h1 className="landing-page-title">资讯动态</h1>
          <p className="landing-page-intro">
            了解行业动态、科研成果与品牌最新消息，让检测、修复和门店经营趋势保持同频更新。
          </p>
        </div>
      </div>

      <div className="landing-section landing-news-panel">
        <div className="landing-news-toolbar">
          <div className="landing-news-filter">
            {landingNewsCategories.map((category) => (
              <button
                key={category}
                type="button"
                data-testid={`news-filter-${category}`}
                className={
                  category === selectedCategory
                    ? 'landing-news-filter-button is-active'
                    : 'landing-news-filter-button'
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <input
            data-testid="news-search-input"
            className="landing-news-search"
            type="search"
            placeholder="搜索资讯..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {filteredArticles.length ? (
          <div className="landing-news-grid landing-news-grid--full">
            {filteredArticles.map((article) => (
              <Link key={article.id} className="landing-news-card" to={`/news?id=${article.id}`}>
                <img src={article.image} alt={article.title} />
                <div className="landing-card-meta">
                  <span>{article.category}</span>
                  <span>{article.date}</span>
                </div>
                <h2 className="landing-card-title">{article.title}</h2>
                <p className="landing-card-copy">{article.excerpt}</p>
                <div className="landing-news-card-footer">
                  <span>{article.author}</span>
                  <span>{article.readTime}</span>
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
  );
}
