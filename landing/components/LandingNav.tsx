import { NavLink } from 'react-router-dom';

import { landingRouteMetadata } from '../routeMetadata';

export default function LandingNav() {
  return (
    <nav aria-label="Landing navigation" className="landing-nav">
      <div className="landing-brand">
        <div className="landing-brand-mark" aria-hidden="true">
          FA
        </div>
        <div className="landing-brand-copy">
          <strong className="landing-brand-title">频安AI智能商学院</strong>
          <span className="landing-brand-subtitle">AI细胞修复体验站</span>
        </div>
      </div>
      <ul className="landing-nav-links">
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
      <NavLink to="/franchise" className="landing-button-primary landing-nav-cta">
        了解加盟政策
      </NavLink>
    </nav>
  );
}
