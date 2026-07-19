import { type JSX, createContext, useInsertionEffect } from 'react';

import { useSystemColorScheme } from '@/ui/theme/hooks/useSystemColorScheme';
import { persistedColorSchemeState } from '@/ui/theme/states/persistedColorSchemeState';
import {
  applyOdelzaThemeToRoot,
  resolveOdelzaTheme,
} from '@/ui/theme/utils/resolveOdelzaTheme';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { type ColorScheme } from 'twenty-ui/input';
import { ThemeProvider } from 'twenty-ui/theme-constants';

type BaseThemeProviderProps = {
  children: JSX.Element | JSX.Element[];
};

export const ThemeSchemeContext = createContext<(theme: ColorScheme) => void>(
  () => {},
);

export const BaseThemeProvider = ({ children }: BaseThemeProviderProps) => {
  const [persistedColorScheme, setPersistedColorScheme] = useAtomState(
    persistedColorSchemeState,
  );
  const systemColorScheme = useSystemColorScheme();
  const theme = resolveOdelzaTheme(persistedColorScheme, systemColorScheme);

  useInsertionEffect(
    () => applyOdelzaThemeToRoot(theme.overrides),
    [theme.overrides],
  );

  return (
    <ThemeSchemeContext.Provider value={setPersistedColorScheme}>
      <ThemeProvider
        colorScheme={theme.colorScheme}
        overrides={theme.overrides}
      >
        {children}
      </ThemeProvider>
    </ThemeSchemeContext.Provider>
  );
};
