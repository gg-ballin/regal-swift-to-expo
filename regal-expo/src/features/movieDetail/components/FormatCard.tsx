import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ShowFormat, Showtime } from '@/data/schemas';
import { showtimeDisplay } from '@/domain/formatters';
import { colors, radius, spacing, typography } from '@/theme/theme';

const CHIPS_PER_ROW = 3;

// SWIFT: `stride(from: 0, to: times.count, by: chipsPerRow)` in FormatCell.rebuildChips(for:).
function chunk<T>(items: readonly T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

type Props = {
  format: ShowFormat;
  onSelectShowtime: (showtimeId: string) => void;
};

/** Port of `FormatCell`: name + DETAILS pill, seating, attributes, 3-per-row equal-width showtime chips. */
// SWIFT: UICollectionViewCell; contentView with cornerRadius + a vertical UIStackView (setCustomSpacing after attributes).
export const FormatCard = memo(function FormatCard({ format, onSelectShowtime }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{format.name}</Text>
        {/* SWIFT: UIButton(configuration: .filled(), cornerStyle .capsule) with isUserInteractionEnabled = false. */}
        <View style={styles.pill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={styles.pillText}>DETAILS</Text>
        </View>
      </View>
      <Text style={styles.seating}>{format.seating}</Text>
      <Text style={styles.attributes}>{format.attributes.join('  •  ')}</Text>

      {/* SWIFT: vertical chipsStack of horizontal UIStackViews with `distribution = .fillEqually`; empty UIView() pads the last row. */}
      <View style={styles.chips}>
        {chunk(format.times, CHIPS_PER_ROW).map((row) => (
          <View key={row[0].id} style={styles.chipRow}>
            {row.map((showtime) => (
              <ShowtimeChip key={showtime.id} showtime={showtime} onPress={onSelectShowtime} />
            ))}
            {Array.from({ length: CHIPS_PER_ROW - row.length }, (_, i) => (
              <View key={`spacer-${i}`} style={styles.spacer} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
});

// SWIFT: UIButton(configuration: .bordered(), primaryAction: UIAction { onSelectShowtime?(showtimeID) }).
function ShowtimeChip({ showtime, onPress }: { showtime: Showtime; onPress: (id: string) => void }) {
  const label = showtimeDisplay(showtime.time);
  return (
    <Pressable
      onPress={() => onPress(showtime.id)}
      accessibilityRole="button"
      accessibilityLabel={`Showtime ${label}`}
      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  name: { ...typography.title, color: colors.textPrimary, flex: 1 },
  pill: {
    backgroundColor: colors.pill,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  pillText: { ...typography.caption, color: colors.textSecondary },
  seating: { fontSize: 17, fontWeight: '400', color: colors.textPrimary },
  attributes: { ...typography.caption, color: colors.textMuted },
  chips: { gap: spacing.sm, marginTop: spacing.lg - spacing.sm },
  chipRow: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  chipPressed: { opacity: 0.7 },
  chipText: { ...typography.subtitle, color: colors.textPrimary },
  spacer: { flex: 1 },
});
