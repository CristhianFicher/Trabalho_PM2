import { ReactNode } from 'react';
import { Pressable, PressableStateCallbackType, StyleSheet, Text, ViewStyle } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: ReactNode;
  style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', icon, style }: ButtonProps) {
  const { colors, isDark } = useAppTheme();

  const getStyles = ({ pressed }: PressableStateCallbackType) => {
    const baseBackground =
      variant === 'primary'
        ? colors.accent
        : variant === 'secondary'
        ? colors.surface
        : 'transparent';

    const backgroundColor = pressed
      ? variant === 'primary'
        ? shade(colors.accent, isDark ? 0.1 : 0.15)
        : variant === 'secondary'
        ? colors.accentSoft
        : colors.overlay
      : baseBackground;

    const borderColor = variant === 'secondary' ? colors.accent : 'transparent';

    return [
      styles.base,
      {
        backgroundColor,
        borderColor,
      },
      variant === 'ghost' ? styles.ghost : undefined,
      style,
    ];
  };

  const textColor =
    variant === 'primary' ? '#ffffff' : variant === 'secondary' ? colors.accent : colors.text;

  return (
    <Pressable 
      onPress={() => {
        console.log('🔘 Button onPress chamado para:', title);
        onPress();
      }} 
      style={getStyles}
    >
      <Text style={[styles.text, { color: textColor }]}>
        {icon}
        {icon ? ' ' : ''}
        {title}
      </Text>
    </Pressable>
  );
}

function shade(hexColor: string, intensity: number) {
  const normalized = hexColor.replace('#', '');
  const num = parseInt(normalized, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) * (1 - intensity)));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) * (1 - intensity)));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) * (1 - intensity)));

  return `#${[r, g, b]
    .map((value) => {
      const hex = Math.round(value).toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join('')}`;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  ghost: {
    borderWidth: 0,
  },
});
