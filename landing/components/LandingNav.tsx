import { NavLink } from 'react-router-dom';

import { landingRouteMetadata } from '../routeMetadata';

export default function LandingNav() {
  return (
    <nav aria-label="Landing navigation">
      <ul>
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
    </nav>
  );
}
