import React, { useEffect, useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';

interface StorageResult {
  [key: string]: 'light' | 'dark';
}

type Theme = 'light' | 'dark';

// Avoid augmenting global `Window` to prevent type conflicts with other chrome typings.

const STORAGE_KEY = 'theme';

const readStoredTheme = async (): Promise<Theme | null> => {
  const chromeAny = (window as any).chrome;
  if (typeof chromeAny !== 'undefined' && chromeAny.storage && chromeAny.storage.sync) {
    return new Promise((resolve) => {
      chromeAny.storage.sync.get([STORAGE_KEY], (result: StorageResult) => {
        resolve(result[STORAGE_KEY] || null);
      });
    });
  }

  const v = localStorage.getItem(STORAGE_KEY);
  return (v as Theme) || null;
};

const writeStoredTheme = async (theme: Theme) => {
  try {
    const chromeAny = (window as any).chrome;
    if (typeof chromeAny !== 'undefined' && chromeAny.storage && chromeAny.storage.sync) {
      chromeAny.storage.sync.set({ [STORAGE_KEY]: theme });
    }
  } catch (e) {
    // ignore
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {
    // ignore
  }
};

const applyThemeClass = (theme: Theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
  }
};

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    (async () => {
      const stored = await readStoredTheme();
      const initial = stored || 'light';
      setTheme(initial);
      applyThemeClass(initial);
    })();
  }, []);

  const toggle = async () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    applyThemeClass(next);
    await writeStoredTheme(next);
  };

  return (
    <button
      onClick={toggle}
      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      title="Toggle theme"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
};

export default ThemeToggle;
