import { Theme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { NavigationThemes } from '@/constants/theme';
import { AppThemeProvider, useAppTheme } from '@/providers/theme-provider';
import { DataProvider } from '@/providers/data-provider';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { scheme, colors } = useAppTheme();
  const navigationTheme = NavigationThemes[scheme] as Theme;

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} backgroundColor={colors.background} translucent={false} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <DataProvider>
        <RootNavigator />
      </DataProvider>
    </AppThemeProvider>
  );
}



