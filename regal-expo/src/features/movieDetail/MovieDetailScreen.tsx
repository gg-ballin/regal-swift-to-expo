import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { ErrorState } from '@/components/ErrorState';
import { colors, spacing } from '@/theme/theme';

import { DateStrip } from './components/DateStrip';
import { FormatCard } from './components/FormatCard';
import { MovieDetails } from './components/MovieDetails';
import { MovieHero } from './components/MovieHero';
import { SegmentedTabs } from './components/SegmentedTabs';
import { TheatreHeader } from './components/TheatreHeader';
import { MOVIE_DETAIL_TABS, useMovieDetail, type MovieDetailRow } from './useMovieDetail';

const TAB_TITLES = MOVIE_DETAIL_TABS.map((tab) => tab.toUpperCase());

/** Port of `MovieDetailViewController`: one virtualized list whose rows are a discriminated union. */
// SWIFT: UIViewController owning a UICollectionView + UICollectionViewDiffableDataSource; viewDidLoad wires `viewModel.onChange -> render`.
export function MovieDetailScreen() {
  const { rows, hasError, errorMessage, retry, selectTab, selectDate, selectShowtime } = useMovieDetail();

  // SWIFT: renderBackground(for:) sets collectionView.backgroundView to a UIActivityIndicatorView or the error view.
  if (rows.length === 0) {
    return hasError ? (
      <ErrorState message={errorMessage} onRetry={retry} />
    ) : (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // SWIFT: CellRegistration per item type + `DataSource(collectionView:) { switch item { ... } }` cell provider.
  const renderItem: ListRenderItem<MovieDetailRow> = ({ item }) => {
    switch (item.type) {
      // SWIFT: HeroHeaderView, a boundary supplementary item (alignment .top) of the tabs section.
      case 'hero':
        return <MovieHero movie={item.movie} />;
      // SWIFT: TabsCell wrapping SegmentedTabsControl; `.valueChanged` -> viewModel.selectTab(_:).
      case 'tabs':
        return (
          <View style={styles.tabs}>
            <SegmentedTabs
              titles={TAB_TITLES}
              selectedIndex={MOVIE_DETAIL_TABS.indexOf(item.selectedTab)}
              onChange={(index) => selectTab(MOVIE_DETAIL_TABS[index])}
            />
          </View>
        );
      // SWIFT: one DateCell per date in a section with `orthogonalScrollingBehavior = .continuous`.
      case 'dates':
        return <DateStrip dates={item.dates} selectedIndex={item.selectedIndex} onSelect={selectDate} />;
      // SWIFT: TheatreHeaderView, the section header (elementKindSectionHeader) of each `.theatre(id)` section.
      case 'theatreHeader':
        return <TheatreHeader theatre={item.theatre} />;
      // SWIFT: FormatCell; padding = section.contentInsets, gap = interGroupSpacing, isLast = section bottom inset.
      case 'format':
        return (
          <View style={[styles.format, item.isLast && styles.formatLast]}>
            <FormatCard
              format={item.format}
              onSelectShowtime={(showtimeId) => selectShowtime(item.theatreId, item.format.id, showtimeId)}
            />
          </View>
        );
      // SWIFT: DetailsCell in the `.details` section.
      case 'details':
        return <MovieDetails movie={item.movie} />;
    }
  };

  return (
    // SWIFT: collectionView.bottomAnchor pinned to view.safeAreaLayoutGuide.bottomAnchor (stops above the tab bar).
    <SafeAreaView edges={{ bottom: true }} style={styles.list}>
      {/* SWIFT: keyExtractor = Hashable item identity; getItemType = the cell registration; contentInsetAdjustmentBehavior = .never. */}
      <FlashList
        data={rows}
        renderItem={renderItem}
        keyExtractor={(row) => row.key}
        getItemType={(row) => row.type}
        contentInsetAdjustmentBehavior="never"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  tabs: {
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  format: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  formatLast: { paddingBottom: spacing.xl },
});
