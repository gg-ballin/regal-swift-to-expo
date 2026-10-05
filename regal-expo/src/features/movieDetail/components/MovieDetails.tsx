import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Movie } from '@/data/schemas';
import { colors, spacing, typography } from '@/theme/theme';

const BUILT_WITH_TEXT = 'This app is an exact port of the Swift app into Expo';

/** Port of `DetailsCell`: synopsis, then DIRECTOR / CAST / GENRE, then the built-with footer. */
// SWIFT: UICollectionViewCell with a vertical UIStackView; configure(with:) removes and re-adds the arranged subviews.
export const MovieDetails = memo(function MovieDetails({ movie }: { movie: Movie }) {
  return (
    <View style={styles.container}>
      <Text style={styles.synopsis}>{movie.synopsis}</Text>
      <DetailRow title="DIRECTOR" value={movie.director} />
      <DetailRow title="CAST" value={movie.cast.join(', ')} />
      <DetailRow title="GENRE" value={movie.genres.join(', ')} />
      {/* SWIFT: makeBuiltWithFooter(): horizontal UIStackView(UIImageView(named: "BuiltWith"), UILabel), setCustomSpacing(xxl) above. */}
      <View style={styles.footer} accessible accessibilityLabel={BUILT_WITH_TEXT}>
        <Image source={require('../../../../assets/images/built-with.png')} style={styles.footerIcon} />
        <Text style={styles.footerText}>{BUILT_WITH_TEXT}</Text>
      </View>
    </View>
  );
});

// SWIFT: makeRow(title:value:): vertical UIStackView with isAccessibilityElement = true (one VoiceOver stop).
function DetailRow({ title, value }: { title: string; value: string }) {
  const label = `${title.charAt(0)}${title.slice(1).toLowerCase()}: ${value}`;
  return (
    <View style={styles.row} accessible accessibilityLabel={label}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  synopsis: { ...typography.body, color: colors.textPrimary },
  row: { gap: spacing.xs },
  rowTitle: { ...typography.caption, color: colors.textMuted },
  rowValue: { ...typography.body, color: colors.textSecondary },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xxl - spacing.lg,
  },
  // SWIFT: layer.cornerRadius = 11 + layer.cornerCurve = .continuous.
  footerIcon: { width: 48, height: 48, borderRadius: 11, borderCurve: 'continuous' },
  footerText: { ...typography.caption, color: colors.textMuted, flex: 1 },
});
