import React, { useCallback, useEffect, useState } from 'react';
import App from './App';
import LandingApp from './landing/LandingApp';
import { LANDING_IFRAME_SRC } from './landing/runtimeConfig';
import './entry-shell.css';

type EntryMode = 'home' | 'landing' | 'academy';

declare global {
  interface Window {
    __openAiAcademy?: () => void;
  }
}

const HOME_PATH = '/';
const LANDING_PATH = '/entry-station';
const ACADEMY_PATH = '/academy';

function normalizePath(pathname: string): string {
  if (!pathname) return HOME_PATH;
  const normalized = pathname.replace(/\/+$/, '');
  return normalized || HOME_PATH;
}

function getPathForMode(mode: EntryMode): string {
  if (mode === 'landing') return LANDING_PATH;
  if (mode === 'academy') return ACADEMY_PATH;
  return HOME_PATH;
}

function readEntryModeByPath(): EntryMode {
  if (typeof window === 'undefined') return 'home';

  const pathname = normalizePath(window.location.pathname);

  if (pathname === ACADEMY_PATH) {
    return 'academy';
  }

  if (pathname === LANDING_PATH || pathname.startsWith(`${LANDING_PATH}/`)) {
    return 'landing';
  }

  return 'home';
}

function EntryHome() {
  return (
    <div className="entry-shell entry-shell-home-only">
      <iframe
        data-testid="entry-shell-landing-frame"
        title="频安入口首页"
        src={LANDING_IFRAME_SRC}
        className="entry-shell-frame entry-shell-frame-full"
      />
    </div>
  );
}

export default function EntryShell() {
  const [entryMode, setEntryMode] = useState<EntryMode>(() => readEntryModeByPath());

  const setModeAndPath = useCallback((nextMode: EntryMode, historyMethod: 'push' | 'replace' = 'push') => {
    setEntryMode(nextMode);
    const targetPath = getPathForMode(nextMode);
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

    const currentMode = readEntryModeByPath();
    setEntryMode(currentMode);

    if (currentMode !== 'landing') {
      const targetPath = getPathForMode(currentMode);
      if (normalizePath(window.location.pathname) !== targetPath) {
        setModeAndPath(currentMode, 'replace');
      }
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
  }, [setModeAndPath]);

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

  if (entryMode === 'landing') {
    return <LandingApp />;
  }

  return <EntryHome />;
}
