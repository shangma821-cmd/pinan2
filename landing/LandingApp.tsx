import { BrowserRouter } from 'react-router-dom';

import './landing.css';
import { LandingThemeProvider } from './contexts/LandingThemeContext';
import { LandingRoutes } from './routes';

export default function LandingApp() {
  return (
    <LandingThemeProvider>
      <BrowserRouter basename="/entry-station">
        <LandingRoutes />
      </BrowserRouter>
    </LandingThemeProvider>
  );
}
