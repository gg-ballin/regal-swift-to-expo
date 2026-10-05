import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { seatSummary } from '@/domain/seatSelection';
import { colors, spacing, typography } from '@/theme/theme';

type Props = {
  seatIds: readonly string[];
  total: string;
  canContinue: boolean;
  onContinue: () => void;
};

/** Port of `SeatSummaryBar`. */
// SWIFT: UIView with a 1pt top-border UIView and a horizontal UIStackView(text stack, Continue UIButton).
export function SeatSummaryBar({ seatIds, total, canContinue, onContinue }: Props) {
  // SWIFT: row.bottomAnchor pinned to safeAreaLayoutGuide.bottomAnchor (- md); the bar background still reaches the screen edge.
  const { bottom } = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: bottom + spacing.md }]}>
      <View style={styles.text}>
        <Text style={styles.seats} numberOfLines={2}>
          {seatSummary(seatIds)}
        </Text>
        <Text style={styles.total}>{total}</Text>
      </View>
      {/* SWIFT: continueButton.isEnabled = canContinue; configurationUpdateHandler swaps to the disabled colors. */}
      <PrimaryButton title="Continue" onPress={onContinue} disabled={!canContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  text: { flex: 1, gap: spacing.xs },
  seats: { ...typography.body, color: colors.textSecondary },
  total: { ...typography.title, color: colors.textPrimary },
});
