import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import { colors, radius, spacing, typography } from '@/theme';
import { useMovieDetailViewModel } from '@/viewmodels/useMovieDetailViewModel';

const POSTER_ASPECT = 2 / 3;
const HERO_HEIGHT = 200;

/** Remount via `key={movieId}` resets uri when navigating between movies. */
function HeroImage({
  backdropUrl,
  posterUrl,
}: {
  backdropUrl: string;
  posterUrl: string;
}) {
  const [uri, setUri] = useState(backdropUrl || posterUrl);
  if (!uri) return <View style={[styles.hero, styles.heroPlaceholder]} />;
  return (
    <Image
      source={{ uri }}
      style={styles.hero}
      accessibilityIgnoresInvertColors
      onError={() => {
        if (uri !== posterUrl) setUri(posterUrl);
      }}
    />
  );
}

function DetailSection({ title, body }: { title: string; body: string }) {
  if (!body.trim()) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

/**
 * View (Swift: ViewController + render(state)). Pure function of ViewModel state.
 * Route passes ONLY the id; the ViewModel rehydrates (deep-link safe).
 */
export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, actions } = useMovieDetailViewModel(id);
  const { width } = useWindowDimensions();

  if (state.isLoading) return <LoadingState label="Loading movie…" />;
  if (state.errorMessage) return <ErrorState message={state.errorMessage} onRetry={actions.retry} />;
  if (state.isNotFound || !state.content) return <EmptyState title="Movie not found" />;

  const content = state.content;
  const posterWidth = Math.min(width * 0.34, 140);
  const posterHeight = posterWidth / POSTER_ASPECT;

  const metaParts = [content.rating, content.runtimeLabel, content.releaseDateLabel].filter(Boolean);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <HeroImage
        key={id}
        backdropUrl={content.backdropUrl}
        posterUrl={content.posterUrl}
      />

      <View style={styles.headerRow}>
        <Image
          source={{ uri: content.posterUrl }}
          style={[styles.poster, { width: posterWidth, height: posterHeight }]}
          accessibilityIgnoresInvertColors
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>{content.title}</Text>
          {content.tagline.trim() ? <Text style={styles.tagline}>{content.tagline}</Text> : null}
          {metaParts.length > 0 ? (
            <Text style={styles.meta}>{metaParts.join(' · ')}</Text>
          ) : null}
          <Text style={styles.vote}>{content.voteLabel}</Text>
        </View>
      </View>

      {content.genres.length > 0 ? (
        <View style={styles.chips}>
          {content.genres.map((genre) => (
            <View key={genre} style={styles.chip}>
              <Text style={styles.chipText}>{genre}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <DetailSection title="Overview" body={content.overview} />
      <DetailSection title="Plot Summary" body={content.plotSummary} />
      {content.director.trim() ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Director</Text>
          <Text style={styles.body}>{content.director}</Text>
        </View>
      ) : null}
      {content.cast.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cast</Text>
          <Text style={styles.body}>{content.cast.join(', ')}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  hero: { width: '100%', height: HERO_HEIGHT, backgroundColor: colors.surface },
  heroPlaceholder: { backgroundColor: colors.surfaceElevated },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    gap: spacing.md,
  },
  poster: {
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  headerText: { flex: 1, justifyContent: 'flex-end', gap: spacing.xs, paddingBottom: spacing.xs },
  title: { ...typography.title, color: colors.textPrimary },
  tagline: { ...typography.body, color: colors.textSecondary, fontStyle: 'italic' },
  meta: { ...typography.caption, color: colors.textMuted, fontWeight: '400' },
  vote: { ...typography.subtitle, color: colors.orangeHighlight, marginTop: spacing.xs },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  chip: {
    backgroundColor: colors.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chipText: { ...typography.caption, color: colors.textSecondary, fontWeight: '500' },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl, gap: spacing.sm },
  sectionTitle: { ...typography.subtitle, color: colors.textPrimary },
  body: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
});
