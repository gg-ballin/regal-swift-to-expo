import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import type { Seat } from '@/data/schemas';
import { useBooking } from '@/store/booking';
import { colors, typography } from '@/theme/theme';

// SWIFT: `enum Appearance { case available, taken, selected }` nested in SeatCell.
type Appearance = 'available' | 'taken' | 'selected';

const APPEARANCE = {
  available: { backgroundColor: colors.seatAvailable, borderColor: colors.seatAvailable, tint: colors.textPrimary },
  taken: { backgroundColor: colors.seatTaken, borderColor: colors.border, tint: colors.textMuted },
  selected: { backgroundColor: colors.seatSelected, borderColor: colors.orangeHighlight, tint: colors.textOnPrimary },
} as const;

// SWIFT: `switch (appearance, isWheelchair)` tuple pattern returning an SF Symbol name or nil.
function symbolFor(appearance: Appearance, isWheelchair: boolean) {
  if (isWheelchair) return { ios: 'figure.roll', android: 'accessible' } as const;
  if (appearance === 'taken') return { ios: 'xmark', android: 'close' } as const;
  if (appearance === 'selected') return { ios: 'checkmark', android: 'check' } as const;
  return null;
}

type Props = {
  seat: Seat;
  rowLabel: string;
  size: number;
  onToggle: (seatId: string) => void;
};

/** Port of `SeatCell`. Subscribes to its own selection, so a toggle re-renders only that cell (= `reconfigureItems`). */
// SOLID (I) Interface segregation: narrow props (seat, size, onToggle) plus a single-seat selector; no seat map or store API.
// SWIFT: UICollectionViewCell; taps arrive through UICollectionViewDelegate (shouldSelectItemAt / didSelectItemAt), not the cell.
export const SeatCell = memo(function SeatCell({ seat, rowLabel, size, onToggle }: Props) {
  // SWIFT: `snapshot.reconfigureItems(changed.map(Item.seat))` re-runs configure only for seats whose selection flipped.
  const isSelected = useBooking((s) => s.selected.includes(seat.id));
  const appearance: Appearance = seat.state === 'taken' ? 'taken' : isSelected ? 'selected' : 'available';
  const style = APPEARANCE[appearance];
  const isWheelchair = seat.type === 'wheelchair';
  const symbol = symbolFor(appearance, isWheelchair);
  const seatSize = size - 4;

  return (
    // SWIFT: accessibilityLabel / accessibilityValue = status / accessibilityTraits [.button, .selected | .notEnabled].
    <Pressable
      style={[styles.cell, { width: size, height: size }]}
      // SWIFT: collectionView(_:shouldSelectItemAt:) returns false for taken seats.
      disabled={appearance === 'taken'}
      onPress={() => onToggle(seat.id)}
      accessibilityRole="button"
      accessibilityLabel={`Row ${rowLabel}, seat ${seat.number}${isWheelchair ? ', wheelchair accessible' : ''}`}
      accessibilityValue={{ text: appearance }}
      accessibilityState={{ selected: appearance === 'selected', disabled: appearance === 'taken' }}>
      <View
        style={[
          styles.seat,
          { width: seatSize, height: seatSize, backgroundColor: style.backgroundColor, borderColor: style.borderColor },
        ]}>
        {symbol && <Icon name={symbol} size={seatSize * 0.6} color={style.tint} weight="bold" />}
      </View>
    </Pressable>
  );
});

// SWIFT: RowLabelCell, a UICollectionViewCell with a centered UILabel and isAccessibilityElement = false.
export function RowLabelCell({ label, size }: { label: string; size: number }) {
  return (
    <View style={[styles.cell, { width: size, height: size }]} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: { alignItems: 'center', justifyContent: 'center' },
  seat: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    // SWIFT: layer.cornerRadius = 5 + layer.maskedCorners = [.layerMinXMinYCorner, .layerMaxXMinYCorner].
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  rowLabel: { ...typography.caption, color: colors.textMuted },
});
