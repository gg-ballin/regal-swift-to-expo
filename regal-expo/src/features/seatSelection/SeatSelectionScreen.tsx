import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { longDate, money, showtimeDisplay } from '@/domain/formatters';
import { canCheckout, totalCents } from '@/domain/seatSelection';
import { colors, spacing, typography } from '@/theme/theme';

import { ScreenIndicator } from './components/ScreenIndicator';
import { SeatGrid } from './components/SeatGrid';
import { SeatLegend } from './components/SeatLegend';
import { SeatSummaryBar } from './components/SeatSummaryBar';
import { useSeatSelection } from './useSeatSelection';

const GRID_INSET = spacing.sm;

/** Port of `SeatSelectionViewController`: info, screen, grid, legend, summary bar. */
// SWIFT: UIViewController; configureHierarchy() stacks the views with Auto Layout anchors on view.safeAreaLayoutGuide.
export function SeatSelectionScreen() {
  // SWIFT: not needed; the coordinator passes the ShowtimeSelection into SeatSelectionViewModel.init.
  const { showtimeId, date } = useLocalSearchParams<{ showtimeId: string; date?: string }>();
  const { selection, seatMap, selected, isLoading, toggle, checkout } = useSeatSelection(showtimeId, date);
  const { width } = useWindowDimensions();

  const info = selection
    ? [
        selection.theatre.name,
        selection.format.name,
        `${longDate(selection.date)} · ${showtimeDisplay(selection.showtime.time)}`,
      ].join('\n')
    : '';

  return (
    <View style={styles.container}>
      <Text style={styles.info}>{info}</Text>
      <View style={styles.screen}>
        <ScreenIndicator />
      </View>

      {/* SWIFT: UICollectionView (compositional layout, alwaysBounceVertical = false) between the screen indicator and legend. */}
      <View style={styles.gridArea}>
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          {seatMap && <SeatGrid seatMap={seatMap} width={width - GRID_INSET * 2} onToggle={toggle} />}
        </ScrollView>
        {/* SWIFT: UIActivityIndicatorView(style: .large) centered on the collection view, hidesWhenStopped. */}
        {isLoading && (
          <View style={styles.spinner} pointerEvents="none">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </View>

      <View style={styles.legend}>
        <SeatLegend />
      </View>
      {/* SWIFT: summaryBar.configure(seatIDs:total:canContinue:) in render(_:); onContinue closure -> viewModel.checkout(). */}
      <SeatSummaryBar
        seatIds={selected}
        total={money(totalCents(seatMap, selected.length), seatMap?.currency ?? 'USD')}
        canContinue={canCheckout(selected) && Boolean(seatMap)}
        onContinue={checkout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  info: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
  },
  screen: { marginTop: spacing.lg, marginHorizontal: spacing.lg },
  gridArea: { flex: 1, marginTop: spacing.lg, marginHorizontal: GRID_INSET },
  spinner: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  legend: { marginTop: spacing.md, marginBottom: spacing.lg, marginHorizontal: spacing.lg },
});
