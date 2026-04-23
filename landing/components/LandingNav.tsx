import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { useLandingTheme } from '../contexts/LandingThemeContext';
import { landingRouteMetadata } from '../routeMetadata';

export default function LandingNav() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useLandingTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const themeLabel = theme === 'light' ? '切换到夜间模式' : '切换到日间模式';
  const themeIcon = theme === 'light' ? '☀' : '☾';

  const openAcademy = () => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'OPEN_AI_ACADEMY' }, window.location.origin);
        if (typeof window.parent.__openAiAcademy === 'function') {
          window.parent.__openAiAcademy();
          return;
        }
        window.parent.location.href = '/academy';
        return;
      }
    } catch {
      // Fall through to same-window navigation.
    }

    if (typeof window.__openAiAcademy === 'function') {
      window.__openAiAcademy();
      return;
    }

    window.location.href = '/academy';
  };

  return (
    <nav
      data-testid="landing-nav"
      data-scrolled={isScrolled ? 'true' : 'false'}
      aria-label="Landing navigation"
      className={isScrolled ? 'landing-nav landing-nav--scrolled' : 'landing-nav'}
    >
      <div className="landing-brand">
        <div className="landing-brand-mark" aria-hidden="true">
          FA
        </div>
        <div className="landing-brand-copy">
          <strong className="landing-brand-title">频安健康</strong>
          <span className="landing-brand-subtitle">AI细胞修复体验站</span>
        </div>
      </div>

      <ul className="landing-nav-links landing-nav-links--desktop">
        {landingRouteMetadata.map((route) => (
          <li key={route.key}>
            <NavLink
              to={route.path}
              end={route.path === '/'}
              className={({ isActive }) => (isActive ? 'landing-nav-link is-active' : 'landing-nav-link')}
            >
              {route.name}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="landing-nav-actions">
        <button
          type="button"
          className="landing-button-secondary landing-academy-button landing-academy-button--desktop"
          onClick={openAcademy}
        >
          频安AI商学院
        </button>

        <button
          type="button"
          data-testid="landing-theme-toggle"
          aria-label="切换主题"
          className="landing-theme-toggle"
          onClick={toggleTheme}
        >
          <span aria-hidden="true" className="landing-theme-toggle-icon">{themeIcon}</span>
          <span>{themeLabel}</span>
        </button>

        <NavLink to="/franchise" className="landing-button-primary landing-nav-cta landing-nav-cta--desktop">
          了解加盟政策
        </NavLink>

        <button
          type="button"
          data-testid="landing-mobile-menu-toggle"
          aria-label="打开导航菜单"
          className="landing-mobile-menu-toggle"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span aria-hidden="true">{isMenuOpen ? '关闭' : '菜单'}</span>
        </button>
      </div>

      {isMenuOpen ? (
        <div className="landing-mobile-overlay">
          <div data-testid="landing-mobile-menu" className="landing-mobile-menu">
            <ul className="landing-mobile-menu-links">
              {landingRouteMetadata.map((route) => (
                <li key={route.key}>
                  <NavLink
                    to={route.path}
                    end={route.path === '/'}
                    className={({ isActive }) =>
                      isActive ? 'landing-nav-link landing-nav-link--mobile is-active' : 'landing-nav-link landing-nav-link--mobile'
                    }
                  >
                    {route.name}
                  </NavLink>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="landing-button-secondary landing-academy-button landing-academy-button--mobile"
              onClick={openAcademy}
            >
              频安AI商学院
            </button>
            <NavLink to="/franchise" className="landing-button-primary landing-nav-cta landing-nav-cta--mobile">
              了解加盟政策
            </NavLink>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
