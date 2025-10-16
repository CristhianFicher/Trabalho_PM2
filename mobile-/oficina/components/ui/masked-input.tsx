import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaskedTextInput, Mask } from 'react-native-mask-text';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/providers/theme-provider';

export type MaskedTextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  mask: Mask;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export const MaskedTextField = forwardRef<MaskedTextInput, MaskedTextFieldProps>(
  ({ label, value, onChangeText, placeholder, helperText, error, mask, keyboardType, autoCapitalize }, ref) => {
    const { colors } = useAppTheme();

    return (
      <View style={styles.wrapper}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          {label}
        </ThemedText>
        <MaskedTextInput
          ref={ref}
          value={value}
          onChangeText={(text) => onChangeText(text)}
          mask={mask}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: error ? colors.destructive : colors.border,
            },
          ]}
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

MaskedTextField.displayName = 'MaskedTextField';

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
