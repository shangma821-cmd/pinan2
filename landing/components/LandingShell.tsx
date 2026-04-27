import { Outlet } from 'react-router-dom';

import LandingContactModal from './LandingContactModal';
import LandingFooter from './LandingFooter';
import LandingNav from './LandingNav';

export default function LandingShell() {
  return (
    <div data-testid="landing-shell" className="landing-app landing-shell">
      <header className="landing-shell-header">
        <LandingNav />
      </header>
      <main className="landing-shell-main">
        <Outlet />
      </main>
      <footer className="landing-shell-footer">
        <LandingFooter />
      </footer>
      <LandingContactModal />
    </div>
  );
}
