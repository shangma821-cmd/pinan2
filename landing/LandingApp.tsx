import { BrowserRouter } from 'react-router-dom';

import { LandingRoutes } from './routes';

export default function LandingApp() {
  return (
    <BrowserRouter basename="/entry-station">
      <LandingRoutes />
    </BrowserRouter>
  );
}
