import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import type { Theatre } from '@/data/schemas';
import { formattedAddress } from '@/domain/formatters';
import { colors, spacing, typography } from '@/theme/theme';

/** Port of `TheatreHeaderView` (full-width section header). */
// SWIFT: UICollectionReusableView registered as elementKindSectionHeader; full width via negative header.contentInsets.
export const TheatreHeader = memo(function TheatreHeader({ theatre }: { theatre: Theatre }) {
  const address = formattedAddress(theatre);
  return (
    <View style={styles.container} accessible accessibilityRole="header" accessibilityLabel={`${theatre.name}, ${address}`}>
      <Text style={styles.name}>{theatre.name}</Text>
      <View style={styles.addressRow}>
        <Icon name={{ ios: 'mappin.and.ellipse', android: 'location_on' }} color={colors.primary} />
        <Text style={styles.address}>{address}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundDeep,
    gap: spacing.sm,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  name: { ...typography.title, color: colors.textPrimary },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  address: { flex: 1, fontSize: 17, fontWeight: '400', color: colors.textSecondary },
});
