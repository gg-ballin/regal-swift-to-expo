import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Movie } from '@/data/schemas';
import { formatRuntime } from '@/domain/formatters';
import { colors, radius, spacing, typography } from '@/theme/theme';

const POSTER_WIDTH = 120;
const SCRIM = ['rgba(0, 0, 0, 0.55)', colors.background] as const;

/** Port of `HeroHeaderView`: dimmed backdrop + scrim, poster, rating badge, runtime, title. */
// SWIFT: UICollectionReusableView (boundary supplementary item); configure(with:) = props.
export const MovieHero = memo(function MovieHero({ movie }: { movie: Movie }) {
  // SWIFT: contentRow.topAnchor pinned to topAnchor + view.safeAreaInsets.top (+ xl) passed from the VC, so the backdrop still bleeds under the status bar.
  const { top } = useSafeAreaInsets();
  const runtime = formatRuntime(movie.runtimeMinutes);
  const source = movie.posterURL ?? undefined;

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="header"
      accessibilityLabel={`${movie.title}, rated ${movie.rating}, ${runtime}`}>
      {/* SWIFT: ImageLoader.shared.image(for:) in a Task + UIView.transition(.transitionCrossDissolve, 0.25); cancelled in prepareForReuse. */}
      <Image source={source} style={[StyleSheet.absoluteFill, styles.backdrop]} contentFit="cover" transition={250} />
      {/* SWIFT: scrimView = GradientView (CAGradientLayer) pinned to all four edges. */}
      <LinearGradient colors={SCRIM} style={StyleSheet.absoluteFill} />

      <View style={[styles.content, { paddingTop: top + spacing.xl }]}>
        <LinearGradient colors={colors.backgroundWarm} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.poster}>
          <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
        </LinearGradient>

        <View style={styles.text}>
          <View style={styles.metaRow}>
            {/* SWIFT: PaddedLabel (UILabel overriding drawText/intrinsicContentSize) with a layer border. */}
            <Text style={styles.rating}>{movie.rating}</Text>
            <Text style={styles.runtime}>{`|  ${runtime}`}</Text>
          </View>
          {/* SWIFT: numberOfLines = 3, adjustsFontSizeToFitWidth = true, minimumScaleFactor = 0.7. */}
          <Text style={styles.title} numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.7}>
            {movie.title}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { overflow: 'hidden', backgroundColor: colors.background },
  backdrop: { opacity: 0.35 },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  poster: {
    width: POSTER_WIDTH,
    height: POSTER_WIDTH * 1.5,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  text: { flex: 1, gap: spacing.sm, alignItems: 'flex-start' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rating: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.tabInactive,
    borderColor: colors.tabInactive,
    borderWidth: 1.5,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  runtime: { ...typography.subtitle, color: colors.textSecondary },
  title: { ...typography.hero, color: colors.textPrimary },
});
