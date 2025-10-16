import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { Platform } from 'react-native';

const lightPrimary = '#d62828';
const darkPrimary = '#ff5b5b';

export const Colors = {
  light: {
    text: '#1f1f23',
    textSecondary: '#5b5d6c',
    background: '#f5f6fa',
    surface: '#ffffff',
    card: '#ffffff',
    muted: '#9ea0af',
    border: '#e5e7ef',
    overlay: 'rgba(13, 16, 24, 0.25)',
    tint: lightPrimary,
    accent: lightPrimary,
    accentSoft: '#ffe1e1',
    icon: '#5b5d6c',
    success: '#2f9d58',
    warning: '#f6a609',
    destructive: '#c1121f',
    tabIconDefault: '#9ea0af',
    tabIconSelected: lightPrimary,
  },
  dark: {
    text: '#f4f5f9',
    textSecondary: '#a1a4b5',
    background: '#090a0f',
    surface: '#14151d',
    card: '#1d1f2b',
    muted: '#787b89',
    border: '#2c2f3b',
    overlay: 'rgba(0, 0, 0, 0.35)',
    tint: darkPrimary,
    accent: darkPrimary,
    accentSoft: '#3c1a1d',
    icon: '#a1a4b5',
    success: '#4cc38a',
    warning: '#f7ce68',
    destructive: '#ff5b5b',
    tabIconDefault: '#787b89',
    tabIconSelected: darkPrimary,
  },
};

export const NavigationThemes = {
  light: {
    ...NavigationDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      primary: lightPrimary,
      background: Colors.light.background,
      card: Colors.light.surface,
      text: Colors.light.text,
      border: Colors.light.border,
      notification: lightPrimary,
    },
  },
  dark: {
    ...NavigationDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      primary: darkPrimary,
      background: Colors.dark.background,
      card: Colors.dark.card,
      text: Colors.dark.text,
      border: Colors.dark.border,
      notification: darkPrimary,
    },
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
