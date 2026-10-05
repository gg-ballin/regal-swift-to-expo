import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { SeatMap } from '@/data/schemas';

import { RowLabelCell, SeatCell } from './SeatCell';

type Props = {
  seatMap: SeatMap;
  width: number;
  onToggle: (seatId: string) => void;
};

/** ~160 seats: plain Views, no virtualization. Grid columns plus a row label on each side. */
// SWIFT: UICollectionView + diffable data source; one section per row, items = .rowLabel / .seat / .gap (applyFullSnapshot(for:)).
export const SeatGrid = memo(function SeatGrid({ seatMap, width, onToggle }: Props) {
  // SWIFT: compositional layout item width `.fractionalWidth(1 / (columns + 2))`, group height = same fraction (square cells).
  const size = width / (seatMap.columns + 2);

  return (
    <View>
      {seatMap.rows.map((row) => {
        const byColumn = new Map(row.seats.map((seat) => [seat.column, seat]));
        return (
          <View key={row.label} style={styles.row}>
            <RowLabelCell label={row.label} size={size} />
            {Array.from({ length: seatMap.columns }, (_, column) => {
              const seat = byColumn.get(column);
              return seat ? (
                <SeatCell key={seat.id} seat={seat} rowLabel={row.label} size={size} onToggle={onToggle} />
              ) : (
                // SWIFT: `.gap(row:column:)` item = an empty UICollectionViewCell with isAccessibilityElement = false.
                <View key={`gap-${column}`} style={{ width: size, height: size }} />
              );
            })}
            <RowLabelCell label={row.label} size={size} />
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
});
