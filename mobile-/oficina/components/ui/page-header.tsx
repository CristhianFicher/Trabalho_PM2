import { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export type PageHeaderProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
}>;

export function PageHeader({ title, subtitle, rightElement, children }: PageHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.textContent}>
        <ThemedText type="title">{title}</ThemedText>
        {subtitle ? (
          <ThemedText type="default" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
        {children}
      </View>
      {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    paddingBottom: 16,
  },
  textContent: {
    flex: 1,
    gap: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.85,
  },
  right: {
    alignItems: 'flex-end',
  },
});
