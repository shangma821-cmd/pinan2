import { BrowserRouter } from 'react-router-dom';

import './landing.css';
import { LandingContactProvider } from './contexts/LandingContactContext';
import { LandingThemeProvider } from './contexts/LandingThemeContext';
import { LandingRoutes } from './routes';

export default function LandingApp() {
  return (
    <LandingThemeProvider>
      <LandingContactProvider>
        <BrowserRouter basename="/entry-station">
          <LandingRoutes />
        </BrowserRouter>
      </LandingContactProvider>
    </LandingThemeProvider>
  );
}
