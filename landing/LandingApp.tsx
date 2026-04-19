import { BrowserRouter } from 'react-router-dom';

import './landing.css';
import { LandingRoutes } from './routes';

export default function LandingApp() {
  return (
    <BrowserRouter basename="/entry-station">
      <LandingRoutes />
    </BrowserRouter>
  );
}
