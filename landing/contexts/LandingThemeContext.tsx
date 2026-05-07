import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

type LandingTheme = 'light' | 'dark';

type LandingThemeContextValue = {
  theme: LandingTheme;
  toggleTheme: () => void;
};

const LandingThemeContext = createContext<LandingThemeContextValue | null>(null);

function readTheme(): LandingTheme {
  if (typeof window === 'undefined') return 'light';

  const stored = window.localStorage.getItem('theme');
  return stored === 'dark' ? 'dark' : 'light';
}

export function LandingThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<LandingTheme>(() => readTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <LandingThemeContext.Provider
      value={{
        theme,
        toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
      }}
    >
      {children}
    </LandingThemeContext.Provider>
  );
}

export function useLandingTheme() {
  const value = useContext(LandingThemeContext);

  if (!value) {
    throw new Error('useLandingTheme must be used within LandingThemeProvider');
  }

  return value;
}
