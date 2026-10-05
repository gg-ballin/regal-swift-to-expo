import { memo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { spacing } from '@/theme/theme';

import { DateCard } from './DateCard';

type Props = {
  dates: readonly Date[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

/** The Swift orthogonal-scrolling section: a horizontal row inside the vertical list. 7 items, no virtualization needed. */
// SWIFT: datesSection(): 64x72 items, `orthogonalScrollingBehavior = .continuous`, interGroupSpacing = sm, contentInsets = xl/lg.
export const DateStrip = memo(function DateStrip({ dates, selectedIndex, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
      {dates.map((date, index) => (
        <DateCard
          key={date.getTime()}
          date={date}
          selected={index === selectedIndex}
          // SWIFT: collectionView(_:didSelectItemAt:) -> viewModel.selectDate(at:).
          onPress={() => onSelect(index)}
        />
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  content: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
});
