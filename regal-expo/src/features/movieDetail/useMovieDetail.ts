import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { useMovieQuery, useShowtimesQuery } from '@/data/queries';
import type { Movie, ShowFormat, Theatre } from '@/data/schemas';
import { isoDay, makeDateStrip } from '@/domain/formatters';
import { useBooking } from '@/store/booking';

// SWIFT: `enum Tab: Int, CaseIterable { case showtimes, details }` nested in MovieDetailViewModel.
export type MovieDetailTab = 'showtimes' | 'details';
export const MOVIE_DETAIL_TABS: readonly MovieDetailTab[] = ['showtimes', 'details'];

/** Mirrors the Swift `MovieDetailSection`/`MovieDetailItem` enums; `key` = diffable identity. */
export type MovieDetailRow =
  | { type: 'hero'; key: 'hero'; movie: Movie }
  | { type: 'tabs'; key: 'tabs'; selectedTab: MovieDetailTab }
  | { type: 'dates'; key: 'dates'; dates: readonly Date[]; selectedIndex: number }
  | { type: 'theatreHeader'; key: string; theatre: Theatre }
  | { type: 'format'; key: string; theatreId: string; format: ShowFormat; isLast: boolean }
  | { type: 'details'; key: 'details'; movie: Movie };

// SWIFT: MovieDetailViewController.render(_:) building an NSDiffableDataSourceSnapshot (appendSections / appendItems).
export function buildRows(params: {
  movie: Movie | undefined;
  theatres: readonly Theatre[];
  selectedTab: MovieDetailTab;
  dates: readonly Date[];
  selectedDateIndex: number;
}): MovieDetailRow[] {
  const { movie, theatres, selectedTab, dates, selectedDateIndex } = params;
  if (!movie) return [];

  const rows: MovieDetailRow[] = [
    { type: 'hero', key: 'hero', movie },
    { type: 'tabs', key: 'tabs', selectedTab },
  ];
  if (selectedTab === 'details') {
    rows.push({ type: 'details', key: 'details', movie });
    return rows;
  }
  rows.push({ type: 'dates', key: 'dates', dates, selectedIndex: selectedDateIndex });
  for (const theatre of theatres) {
    rows.push({ type: 'theatreHeader', key: `theatre-${theatre.id}`, theatre });
    theatre.formats.forEach((format, index) => {
      rows.push({
        type: 'format',
        key: `format-${theatre.id}-${format.id}`,
        theatreId: theatre.id,
        format,
        isLast: index === theatre.formats.length - 1,
      });
    });
  }
  return rows;
}

/** Port of `MovieDetailViewModel`: data via TanStack Query, UI state via useState, navigation intent via the router. */
export function useMovieDetail() {
  const router = useRouter();
  const setSelection = useBooking((s) => s.setSelection);
  // SWIFT: MovieDetailViewModel.load(): `async let movie` + `async let showtimes`, then `try await (movie, showtimes)`.
  const movieQuery = useMovieQuery();
  const showtimesQuery = useShowtimesQuery();

  // SWIFT: `struct State { dates, selectedDateIndex, selectedTab }` mutated by selectDate(at:) / selectTab(_:).
  const [dates] = useState(() => makeDateStrip(new Date()));
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState<MovieDetailTab>('showtimes');

  const movie = movieQuery.data;
  const theatres = useMemo(() => showtimesQuery.data?.theatres ?? [], [showtimesQuery.data]);
  const isFetching = movieQuery.isFetching || showtimesQuery.isFetching;
  // A retry clears the error state visually, like the Swift VM resetting `errorMessage` on load.
  const hasError = !isFetching && Boolean(movieQuery.error ?? showtimesQuery.error);

  // SWIFT: `dataSource.apply(snapshot, animatingDifferences:)` on every state change.
  const rows = useMemo(
    () => buildRows({ movie, theatres, selectedTab, dates, selectedDateIndex }),
    [movie, theatres, selectedTab, dates, selectedDateIndex],
  );

  // SWIFT: Retry button -> `Task { await viewModel.load() }`.
  const retry = useCallback(() => {
    void movieQuery.refetch();
    void showtimesQuery.refetch();
  }, [movieQuery, showtimesQuery]);

  const selectShowtime = useCallback(
    (theatreId: string, formatId: string, showtimeId: string) => {
      const theatre = theatres.find((t) => t.id === theatreId);
      const format = theatre?.formats.find((f) => f.id === formatId);
      const showtime = format?.times.find((t) => t.id === showtimeId);
      const date = dates[selectedDateIndex];
      if (!movie || !theatre || !format || !showtime || !date) return;

      // SWIFT: `onShowtimeSelected?(ShowtimeSelection(...))` -> TicketsCoordinator.showSeats(for:) -> pushViewController.
      setSelection({ movie, theatre, format, showtime, date });
      router.push({ pathname: '/seats/[showtimeId]', params: { showtimeId, date: isoDay(date) } });
    },
    [movie, theatres, dates, selectedDateIndex, setSelection, router],
  );

  return {
    rows,
    hasError,
    errorMessage: "Couldn't load showtimes. Please try again.",
    retry,
    selectTab: setSelectedTab,
    selectDate: setSelectedDateIndex,
    selectShowtime,
  };
}
