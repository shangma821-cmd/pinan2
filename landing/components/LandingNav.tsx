import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { useLandingContact } from '../contexts/LandingContactContext';
import { useLandingTheme } from '../contexts/LandingThemeContext';
import { landingRouteMetadata } from '../routeMetadata';

function IconMoon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h16" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function LandingNav() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useLandingTheme();
  const { open: openContactModal } = useLandingContact();
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

  const openAcademy = () => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'OPEN_AI_ACADEMY' }, window.location.origin);
        if (typeof (window.parent as unknown as Record<string, unknown>).__openAiAcademy === 'function') {
          (window.parent as unknown as Record<string, () => void>).__openAiAcademy();
          return;
        }
        window.parent.location.href = '/academy';
        return;
      }
    } catch {
      // Fall through to same-window navigation.
    }

    if (typeof (window as unknown as Record<string, unknown>).__openAiAcademy === 'function') {
      (window as unknown as Record<string, () => void>).__openAiAcademy();
      return;
    }

    window.location.href = '/academy';
  };

  return (
    <nav
      className={isScrolled ? 'landing-nav landing-nav--scrolled' : 'landing-nav'}
      data-testid="landing-nav"
      data-scrolled={isScrolled ? 'true' : 'false'}
      aria-label="Landing navigation"
    >
      <div className="landing-nav-inner">
        <NavLink to="/" className="landing-brand" aria-label="频安健康首页">
          <span className="landing-brand-mark" aria-hidden="true">频</span>
          <span className="landing-brand-copy">
            <span className="landing-brand-title">频安科技</span>
            <span className="landing-brand-subtitle">频安健康</span>
          </span>
        </NavLink>

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
          <li>
            <button
              type="button"
              className="landing-nav-link landing-nav-link--button"
              onClick={openAcademy}
            >
              频安AI商学院
            </button>
          </li>
        </ul>

        <div className="landing-nav-actions landing-nav-actions--desktop">
          <button
            type="button"
            data-testid="landing-theme-toggle"
            className="landing-icon-button landing-theme-toggle"
            aria-label={theme === 'light' ? '切换到夜间模式' : '切换到日间模式'}
            onClick={toggleTheme}
          >
            {theme === 'light' ? <IconMoon /> : <IconSun />}
          </button>
          <button
            type="button"
            className="landing-contact-cta"
            onClick={openContactModal}
          >
            <IconPhone />
            联系我们
          </button>
        </div>

        <div className="landing-nav-actions landing-nav-actions--mobile">
          <button
            type="button"
            className="landing-icon-button landing-theme-toggle"
            aria-label={theme === 'light' ? '切换到夜间模式' : '切换到日间模式'}
            onClick={toggleTheme}
          >
            {theme === 'light' ? <IconMoon /> : <IconSun />}
          </button>
          <button
            type="button"
            className="landing-icon-button landing-mobile-menu-toggle"
            aria-label={isMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
            data-testid="landing-mobile-menu-toggle"
            onClick={() => setIsMenuOpen((o) => !o)}
          >
            {isMenuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="landing-mobile-overlay" onClick={() => setIsMenuOpen(false)}>
          <div
            className="landing-mobile-menu"
            data-testid="landing-mobile-menu"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="landing-mobile-menu-links">
              {landingRouteMetadata.map((route) => (
                <li key={route.key}>
                  <NavLink
                    to={route.path}
                    end={route.path === '/'}
                    className={({ isActive }) =>
                      isActive
                        ? 'landing-nav-link landing-nav-link--mobile is-active'
                        : 'landing-nav-link landing-nav-link--mobile'
                    }
                  >
                    {route.name}
                  </NavLink>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className="landing-nav-link landing-nav-link--mobile landing-nav-link--button"
                  onClick={openAcademy}
                >
                  频安AI商学院
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="landing-contact-cta landing-contact-cta--mobile"
                  onClick={openContactModal}
                >
                  <IconPhone />
                  联系我们
                </button>
              </li>
            </ul>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
