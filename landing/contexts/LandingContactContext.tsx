import { createContext, useCallback, useContext, useState } from 'react';

interface LandingContactContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const LandingContactContext = createContext<LandingContactContextValue | null>(null);

export function LandingContactProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    // TODO: wire contact modal UI in follow-up task
    console.info('[LandingContact] contact modal opened (placeholder)');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <LandingContactContext.Provider value={{ isOpen, open, close }}>
      {children}
    </LandingContactContext.Provider>
  );
}

export function useLandingContact(): LandingContactContextValue {
  const ctx = useContext(LandingContactContext);
  if (!ctx) {
    throw new Error('useLandingContact must be used within LandingContactProvider');
  }
  return ctx;
}
