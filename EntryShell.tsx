import React, { useCallback, useEffect, useMemo, useState } from 'react';
import App from './App';
import './entry-shell.css';

type EntryMode = 'home' | 'academy';

declare global {
  interface Window {
    __openAiAcademy?: () => void;
  }
}

const ACADEMY_PATH = '/academy';

function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  const normalized = pathname.replace(/\/+$/, '');
  return normalized || '/';
}

function readEntryModeByPath(): EntryMode {
  if (typeof window === 'undefined') return 'home';
  return normalizePath(window.location.pathname) === ACADEMY_PATH ? 'academy' : 'home';
}

function EntryHome() {
  return (
    <div className="entry-shell entry-shell-home-only">
      <iframe
        title="频安入口首页"
        src="/entry-station/index.html?v=20260311-3"
        className="entry-shell-frame entry-shell-frame-full"
      />
    </div>
  );
}

export default function EntryShell() {
  const initialMode = useMemo<EntryMode>(() => readEntryModeByPath(), []);
  const [entryMode, setEntryMode] = useState<EntryMode>(initialMode);

  const setModeAndPath = useCallback((nextMode: EntryMode, historyMethod: 'push' | 'replace' = 'push') => {
    setEntryMode(nextMode);
    const targetPath = nextMode === 'academy' ? ACADEMY_PATH : '/';
    if (normalizePath(window.location.pathname) !== targetPath) {
      const fn = historyMethod === 'replace' ? window.history.replaceState : window.history.pushState;
      fn.call(window.history, {}, '', targetPath);
    }
  }, []);

  useEffect(() => {
    const previousHandler = window.__openAiAcademy;
    window.__openAiAcademy = () => setModeAndPath('academy');

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && typeof event.data === 'object' && 'type' in event.data && event.data.type === 'OPEN_AI_ACADEMY') {
        setModeAndPath('academy');
      }
    };

    const onPopState = () => {
      setEntryMode(readEntryModeByPath());
    };

    window.addEventListener('message', onMessage);
    window.addEventListener('popstate', onPopState);

    if (normalizePath(window.location.pathname) !== (initialMode === 'academy' ? ACADEMY_PATH : '/')) {
      setModeAndPath(initialMode, 'replace');
    }

    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('popstate', onPopState);
      if (previousHandler) {
        window.__openAiAcademy = previousHandler;
      } else {
        delete window.__openAiAcademy;
      }
    };
  }, [initialMode, setModeAndPath]);

  if (entryMode === 'academy') {
    return (
      <>
        <button
          type="button"
          className="entry-shell-floating-back"
          onClick={() => setModeAndPath('home')}
        >
          返回入口首页
        </button>
        <App />
      </>
    );
  }

  return <EntryHome />;
}

