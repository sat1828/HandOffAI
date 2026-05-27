import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('handoffai-theme') : null;

  return {
    theme: (stored as Theme) || 'light',
    toggleTheme: () =>
      set((state) => {
        const next = state.theme === 'light' ? 'dark' : 'light';
        if (typeof window !== 'undefined') localStorage.setItem('handoffai-theme', next);
        return { theme: next };
      }),
    setTheme: (theme: Theme) => {
      if (typeof window !== 'undefined') localStorage.setItem('handoffai-theme', theme);
      set({ theme });
    },
  };
});
