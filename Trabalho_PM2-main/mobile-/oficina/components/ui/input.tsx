import { forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';
import { ThemedText } from '@/components/themed-text';

type TextFieldProps = TextInputProps & {
  label?: string;
  helperText?: string;
  error?: string;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, helperText, error, style, ...rest }, ref) => {
    const { colors } = useAppTheme();
    const borderColor = error ? colors.destructive : colors.border;

    return (
      <View style={styles.wrapper}>
        {label ? (
          <ThemedText type="defaultSemiBold" style={styles.label}>
            {label}
          </ThemedText>
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.muted}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor,
            },
            style,
          ]}
          {...rest}
        />
        {error ? (
          <ThemedText type="caption" style={[styles.helper, { color: colors.destructive }]}>
            {error}
          </ThemedText>
        ) : helperText ? (
          <ThemedText type="caption" style={[styles.helper, { color: colors.muted }]}>
            {helperText}
          </ThemedText>
        ) : null}
      </View>
    );
  }
);

TextField.displayName = 'TextField';

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  helper: {
    marginTop: -2,
  },
});
