import { Outlet } from 'react-router-dom';

import LandingFooter from './LandingFooter';
import LandingNav from './LandingNav';

export default function LandingShell() {
  return (
    <div data-testid="landing-shell">
      <header data-testid="landing-nav">
        <LandingNav />
      </header>
      <main>
        <Outlet />
      </main>
      <footer data-testid="landing-footer">
        <LandingFooter />
      </footer>
    </div>
  );
}
