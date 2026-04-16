import { Route, Routes } from 'react-router-dom';

import { landingRouteMetadata, type LandingPageKey, type LandingRouteRecord } from './routeMetadata';

const pageTestIds: Record<LandingPageKey, string> = {
  home: 'landing-page-home',
  about: 'landing-page-about',
  products: 'landing-page-products',
  franchise: 'landing-page-franchise',
  news: 'landing-page-news',
};

function toRoutePath(path: LandingRouteRecord['path']): string {
  return path === '/' ? path : path.slice(1);
}

function LandingRoutePlaceholder({
  pageKey,
  heading,
}: {
  pageKey: LandingPageKey;
  heading: LandingRouteRecord['name'];
}) {
  return (
    <section data-testid={pageTestIds[pageKey]}>
      <h1>{heading}</h1>
      <p>Phase 2 route scaffold placeholder</p>
    </section>
  );
}

export function LandingRoutes() {
  return (
    <div data-testid="landing-router-root">
      <Routes>
        {landingRouteMetadata.map((route) => (
          <Route
            key={route.key}
            path={toRoutePath(route.path)}
            element={<LandingRoutePlaceholder pageKey={route.key} heading={route.name} />}
          />
        ))}
      </Routes>
    </div>
  );
}
