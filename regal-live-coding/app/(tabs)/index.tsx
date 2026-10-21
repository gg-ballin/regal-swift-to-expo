import { useQuery } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MovieCarousel } from '@/components/MovieCarousel';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import { useMoviesCarousel } from '@/context/MoviesCarouselContext';
import { DEFAULT_WINDOW_START, formatReleaseDate, rangeFromStart } from '@/domain/releaseWindow';
import { movieRepository } from '@/repositories/movieRepository';
import { colors, spacing, typography } from '@/theme';

export default function MoviesScreen() {
  const { activeMovie, activeIndex, setActiveMovie } = useMoviesCarousel();
  const range = rangeFromStart(DEFAULT_WINDOW_START);
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['movies', range],
    queryFn: () => movieRepository.movies(range),
  });

  useEffect(() => {
    if (data?.length) setActiveMovie(data[0], 0);
  }, [data, setActiveMovie]);

  let results: ReactNode;
  if (isPending) {
    results = <LoadingState label="Loading movies…" />;
  } else if (isError) {
    results = <ErrorState message={error.message} onRetry={() => void refetch()} />;
  } else if (data.length === 0) {
    results = <EmptyState title="No movies" subtitle="Nothing released in this window." />;
  } else {
    const display = activeMovie ?? data[0];
    const position = activeMovie ? activeIndex + 1 : 1;
    results = (
      <>
        <MovieCarousel movies={data} />
        <View style={styles.activeBlock}>
          <Text style={styles.movieTitle}>{display.title}</Text>
          <Text style={styles.meta}>
            {formatReleaseDate(display.primary_release_date)} · {position} / {data.length}
          </Text>
        </View>
      </>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Coming Soon</Text>
      {results}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingBottom: spacing.xl, gap: spacing.sm },
  title: { ...typography.title, color: colors.textPrimary, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  activeBlock: { paddingHorizontal: spacing.lg, gap: spacing.xs, marginTop: spacing.sm },
  movieTitle: { ...typography.subtitle, color: colors.textPrimary },
  meta: { ...typography.caption, color: colors.textMuted, fontWeight: '400' },
});
