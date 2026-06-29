import { Link } from 'react-router-dom';

import { useLandingContact } from '../contexts/LandingContactContext';
import PinanBrandMark from './PinanBrandMark';

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconArrowUp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  );
}

export default function LandingFooter() {
  const { open: openContact } = useLandingContact();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div data-testid="landing-footer" className="landing-footer-block">
      <div className="landing-footer-inner">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <Link to="/" className="landing-footer-brand-logo">
              <PinanBrandMark />
            </Link>
            <p className="landing-footer-brand-desc">
              频安科技以AI人工智能技术算法为核心，聚焦健康评估、个性化调理方案与持续健康管理，
              为用户提供清晰可靠、可持续跟进的数智健康服务。
            </p>
            <ul className="landing-footer-contacts">
              <li className="landing-footer-contact">
                <span className="landing-footer-contact-icon"><IconPhone /></span>
                <span>18948301116</span>
              </li>
              <li className="landing-footer-contact">
                <span className="landing-footer-contact-icon"><IconMail /></span>
                <span>contact@puyuan-health.com</span>
              </li>
              <li className="landing-footer-contact">
                <span className="landing-footer-contact-icon"><IconMapPin /></span>
                <span>江苏省苏州市常熟市东南街道久隆路88号</span>
              </li>
            </ul>
          </div>

          <div className="landing-footer-col">
            <h3 className="landing-footer-col-heading">公司</h3>
            <ul className="landing-footer-col-list">
              <li><Link to="/about">关于我们</Link></li>
              <li><Link to="/products">产品服务</Link></li>
              <li><Link to="/franchise">加盟合作</Link></li>
              <li><Link to="/news">新闻动态</Link></li>
              <li><a href="/academy">频安AI商学院</a></li>
            </ul>
          </div>

          <div className="landing-footer-col">
            <h3 className="landing-footer-col-heading">支持</h3>
            <ul className="landing-footer-col-list">
              <li><Link to="/manuals">产品使用说明</Link></li>
              <li><a href="#">技术支持</a></li>
              <li><a href="#">常见问题</a></li>
              <li>
                <button type="button" className="landing-footer-link-btn" onClick={openContact}>
                  联系我们
                </button>
              </li>
            </ul>
          </div>

          <div className="landing-footer-col">
            <h3 className="landing-footer-col-heading">法律</h3>
            <ul className="landing-footer-col-list">
              <li><a href="#">隐私政策</a></li>
              <li><a href="#">服务条款</a></li>
              <li><a href="#">免责声明</a></li>
            </ul>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <div className="landing-footer-legal">
            <span className="landing-footer-copy">
              © 2026 常熟频安科技有限公司 · 频安科技. 保留所有权利.
            </span>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer"
              className="landing-footer-beian-link"
            >
              苏ICP备2026026637号-2
            </a>
            <a
              href="https://beian.mps.gov.cn/#/query/webSearch?code=32058102002980"
              target="_blank"
              rel="noreferrer"
              className="landing-footer-beian-link landing-footer-beian-link-with-icon"
            >
              <img
                src="/police-badge.png"
                alt=""
                aria-hidden="true"
                width="14"
                height="14"
                className="landing-footer-beian-icon"
              />
              苏公网安备32058102002980号
            </a>
          </div>
          <div className="landing-footer-bottom-right">
            <span className="landing-footer-meta">专注智慧健康管理服务</span>
            <button
              type="button"
              data-testid="landing-back-to-top"
              aria-label="返回顶部"
              className="landing-footer-back-to-top"
              onClick={scrollToTop}
            >
              <IconArrowUp />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
