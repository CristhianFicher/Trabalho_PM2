import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/providers/theme-provider';

export function ThemeToggle() {
  const { scheme, toggleScheme, colors, followSystem } = useAppTheme();
  const iconName = scheme === 'dark' ? 'light-mode' : 'dark-mode';

  return (
    <Pressable onPress={toggleScheme} style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}>
      <View style={[styles.iconBadge, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}>
        <MaterialIcons name={iconName as never} size={18} color={colors.accent} />
      </View>
      <ThemedText type="caption" style={styles.caption}>
        {followSystem ? 'Auto' : scheme === 'dark' ? 'Escuro' : 'Claro'}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  iconBadge: {
    borderRadius: 999,
    padding: 10,
    borderWidth: 1,
  },
  caption: {
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
