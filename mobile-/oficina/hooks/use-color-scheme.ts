import { useAppTheme } from '@/providers/theme-provider';

export function useColorScheme() {
  const { scheme } = useAppTheme();
  return scheme;
}
