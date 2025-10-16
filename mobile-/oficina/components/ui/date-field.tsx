import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/providers/theme-provider';

export type DateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mode?: 'date' | 'time';
  minimumDate?: Date;
};

function formatValue(value: string, mode: 'date' | 'time') {
  if (!value) {
    return mode === 'date' ? 'Selecione uma data' : 'Selecione um horário';
  }

  if (mode === 'time') {
    const [hours, minutes] = value.split(':');
    if (hours && minutes) {
      return `${hours}:${minutes}`;
    }
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return mode === 'date' ? 'Selecione uma data' : value;
  }

  if (mode === 'date') {
    return date.toLocaleDateString('pt-BR');
  }

  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DateField({ label, value, onChange, mode = 'date', minimumDate }: DateFieldProps) {
  const { colors } = useAppTheme();
  const [isVisible, setIsVisible] = useState(false);

  const initialDate = value && mode === 'date' ? new Date(value) : new Date();

  const handleChange = (_event: any, selected?: Date) => {
    if (Platform.OS === 'android') {
      setIsVisible(false);
    }

    if (!selected) {
      return;
    }

    const nextValue =
      mode === 'time'
        ? selected.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })
        : selected.toISOString();

    onChange(nextValue);
  };

  return (
    <View style={styles.wrapper}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>
      <Pressable
        onPress={() => setIsVisible(true)}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}>
        <ThemedText>{formatValue(value, mode)}</ThemedText>
      </Pressable>
      {isVisible ? (
        <DateTimePicker
          mode={mode}
          value={mode === 'date' && !Number.isNaN(initialDate.getTime()) ? initialDate : new Date()}
          minimumDate={minimumDate}
          onChange={handleChange}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  button: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
