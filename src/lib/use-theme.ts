import { useEffect } from 'react';
import type { ThemePreference } from './types';

export function useThemeEffect(preference: ThemePreference) {
  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(isDark: boolean) {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    if (preference === 'light') {
      applyTheme(false);
      return;
    }

    if (preference === 'dark') {
      applyTheme(true);
      return;
    }

    // System preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    applyTheme(mediaQuery.matches);

    function handleChange(e: MediaQueryListEvent) {
      applyTheme(e.matches);
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preference]);
}
