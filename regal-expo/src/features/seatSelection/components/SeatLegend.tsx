import type { SymbolViewProps } from 'expo-symbols';
import { StyleSheet, Text, View, type ColorValue } from 'react-native';

import { Icon } from '@/components/Icon';
import { colors, spacing, typography } from '@/theme/theme';

const ENTRIES: { color: ColorValue; symbol: SymbolViewProps['name'] | null; title: string }[] = [
  { color: colors.seatAvailable, symbol: null, title: 'Available' },
  { color: colors.seatSelected, symbol: { ios: 'checkmark', android: 'check' }, title: 'Selected' },
  { color: colors.seatTaken, symbol: { ios: 'xmark', android: 'close' }, title: 'Taken' },
  { color: colors.seatAvailable, symbol: { ios: 'figure.roll', android: 'accessible' }, title: 'Wheelchair' },
];

/** Port of `SeatLegendView` (`.equalSpacing` = space-between). */
// SWIFT: SeatLegendView is a UIStackView subclass (distribution = .equalSpacing) of icon + label entries.
export function SeatLegend() {
  return (
    <View style={styles.row}>
      {ENTRIES.map(({ color, symbol, title }) => (
        <View key={title} style={styles.entry}>
          <View style={[styles.swatch, { backgroundColor: color }]}>
            {symbol && <Icon name={symbol} size={8} color={colors.textPrimary} weight="bold" />}
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entry: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.caption, color: colors.textSecondary },
});
