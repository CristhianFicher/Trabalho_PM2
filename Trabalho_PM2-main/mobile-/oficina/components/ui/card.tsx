import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';

export type CardProps = ViewProps & {
  tone?: 'default' | 'accent';
};

export function Card({ children, style, tone = 'default', ...rest }: PropsWithChildren<CardProps>) {
  const { colors, isDark } = useAppTheme();

  const backgroundColor = tone === 'accent' ? colors.accentSoft : colors.surface;
  const borderColor = tone === 'accent' ? colors.accent : colors.border;

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor,
          borderColor,
          shadowColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(214,40,40,0.25)',
        },
        tone === 'accent' ? styles.accent : undefined,
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 12,
  },
  accent: {
    elevation: 0,
  },
});
