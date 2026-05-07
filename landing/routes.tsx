import { Route, Routes } from 'react-router-dom';

import LandingShell from './components/LandingShell';
import { landingRouteMetadata, type LandingPageKey, type LandingRouteRecord } from './routeMetadata';
import LandingAboutPage from './pages/LandingAboutPage';
import LandingFranchisePage from './pages/LandingFranchisePage';
import LandingHomePage from './pages/LandingHomePage';
import LandingNewsPage from './pages/LandingNewsPage';
import LandingProductsPage from './pages/LandingProductsPage';

function toRoutePath(path: LandingRouteRecord['path']): string {
  return path === '/' ? path : path.slice(1);
}

function renderRouteElement(pageKey: LandingPageKey) {
  if (pageKey === 'home') return <LandingHomePage />;
  if (pageKey === 'about') return <LandingAboutPage />;
  if (pageKey === 'products') return <LandingProductsPage />;
  if (pageKey === 'franchise') return <LandingFranchisePage />;
  return <LandingNewsPage />;
}

export function LandingRoutes() {
  return (
    <div data-testid="landing-router-root">
      <Routes>
        <Route element={<LandingShell />}>
          {landingRouteMetadata.map((route) => {
            const pageElement = renderRouteElement(route.key);

            if (route.path === '/') {
              return <Route key={route.key} index element={pageElement} />;
            }

            return <Route key={route.key} path={toRoutePath(route.path)} element={pageElement} />;
          })}
        </Route>
      </Routes>
    </div>
  );
}
