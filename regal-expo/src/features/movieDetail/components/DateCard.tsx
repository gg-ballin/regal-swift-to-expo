import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { dayOfMonth, longDate, weekdayShort } from '@/domain/formatters';
import { colors, radius, typography } from '@/theme/theme';

type Props = {
  date: Date;
  selected: boolean;
  onPress: () => void;
};

const SELECTED_HEADER = [colors.primaryGradient[1], colors.primaryGradient[0]] as const;
const UNSELECTED_HEADER = [colors.background, colors.background] as const;

/** Port of `DateCell`: weekday header strip over the day number. */
// SWIFT: UICollectionViewCell; init builds the views once, configure(date:isSelected:) reassigns colors/text (= props).
export const DateCard = memo(function DateCard({ date, selected, onPress }: Props) {
  return (
    // SWIFT: accessibilityTraits = selected ? [.button, .selected] : .button.
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={longDate(date)}
      accessibilityState={{ selected }}
      style={[
        styles.card,
        {
          backgroundColor: selected ? colors.dateSelectedBackground : colors.dateBackground,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}>
      {/* SWIFT: GradientView (CAGradientLayer) with `primaryGradient.reversed()` when selected. */}
      <LinearGradient colors={selected ? SELECTED_HEADER : UNSELECTED_HEADER} style={styles.header}>
        <Text style={styles.headerLabel}>{weekdayShort(date)}</Text>
      </LinearGradient>
      <Text style={[styles.day, { color: selected ? colors.dateSelectedText : colors.textPrimary }]}>
        {dayOfMonth(date)}
      </Text>
    </Pressable>
  );
});

export const DATE_CARD_WIDTH = 64;

const styles = StyleSheet.create({
  card: {
    width: DATE_CARD_WIDTH,
    height: 72,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: { height: 24, alignItems: 'center', justifyContent: 'center' },
  headerLabel: { ...typography.subtitle, color: colors.textPrimary },
  day: { flex: 1, fontSize: 30, fontWeight: '700', textAlign: 'center', textAlignVertical: 'center', lineHeight: 46 },
});
