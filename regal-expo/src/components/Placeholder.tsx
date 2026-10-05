import type { SymbolViewProps } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme/theme';

import { Icon } from './Icon';

type Props = {
  title: string;
  symbol: SymbolViewProps['name'];
};

/** Port of `PlaceholderViewController` for the out-of-scope tabs. */
export function Placeholder({ title, symbol }: Props) {
  return (
    // SWIFT: vertical UIStackView(SF Symbol UIImageView, UILabel) centered on view.safeAreaLayoutGuide.centerYAnchor.
    <View style={styles.container}>
      <Icon name={symbol} size={40} color={colors.tabInactive} weight="semibold" />
      <Text style={styles.label}>{`${title} is out of scope for this POC`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  label: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
