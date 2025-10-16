import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

import { Colors } from '@/constants/theme';

type Scheme = 'light' | 'dark';

type ThemeContextValue = {
  scheme: Scheme;
  isDark: boolean;
  colors: typeof Colors.light;
  followSystem: boolean;
  setScheme: (scheme: Scheme) => void;
  toggleScheme: () => void;
  enableSystem: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getNormalizedScheme = (scheme: ColorSchemeName): Scheme => (scheme === 'dark' ? 'dark' : 'light');

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setScheme] = useState<Scheme>(() => getNormalizedScheme(Appearance.getColorScheme()));
  const [followSystem, setFollowSystem] = useState(true);

  useEffect(() => {
    if (!followSystem) {
      return undefined;
    }

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setScheme(getNormalizedScheme(colorScheme));
    });

    return () => subscription.remove();
  }, [followSystem]);

  const applyScheme = (nextScheme: Scheme) => {
    setScheme(nextScheme);
    setFollowSystem(false);
  };

  const toggleScheme = () => {
    applyScheme(scheme === 'light' ? 'dark' : 'light');
  };

  const enableSystem = () => {
    setFollowSystem(true);
    setScheme(getNormalizedScheme(Appearance.getColorScheme()));
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme,
      isDark: scheme === 'dark',
      colors: Colors[scheme],
      followSystem,
      setScheme: applyScheme,
      toggleScheme,
      enableSystem,
    }),
    [followSystem, scheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }

  return context;
}
