import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SecureView } from 'ticket-kit';

import { Icon } from '@/components/Icon';
import { QRCode, useQRCode } from '@/components/QRCode';
import type { TicketHistoryRow as Row } from '@/domain/ticket';
import { colors, radius, spacing, typography } from '@/theme/theme';

export const QR_THUMBNAIL_SIZE = 64;
const QR_INSET = 4;

type Props = {
  row: Row;
  onPress: (ticketId: string) => void;
};

/** Port of `TicketHistoryCell`. */
// SWIFT: UICollectionViewListCell: white QR container + vertical UIStackView of labels + .disclosureIndicator accessory.
export function TicketHistoryRow({ row, onPress }: Props) {
  const code = useQRCode(row.qrPayload);

  return (
    <Pressable
      onPress={() => onPress(row.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${row.movieTitle}, ${row.showtime}, ${row.details}, code ${row.shortCode}`}>
      <View style={styles.qr}>
        <SecureView style={styles.qrImage}>
          <QRCode code={code} size={QR_THUMBNAIL_SIZE} />
        </SecureView>
      </View>
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>
          {row.movieTitle}
        </Text>
        <Text style={styles.secondary}>{row.showtime}</Text>
        <Text style={styles.secondary}>{row.details}</Text>
        <Text style={styles.code}>{row.shortCode}</Text>
      </View>
      <Icon name={{ ios: 'chevron.right', android: 'chevron_right' }} size={14} color={colors.textMuted} weight="semibold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  pressed: { backgroundColor: colors.surfaceElevated },
  qr: {
    width: QR_THUMBNAIL_SIZE + QR_INSET * 2,
    height: QR_THUMBNAIL_SIZE + QR_INSET * 2,
    padding: QR_INSET,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  qrImage: { width: QR_THUMBNAIL_SIZE, height: QR_THUMBNAIL_SIZE },
  text: { flex: 1, gap: spacing.xs },
  title: { ...typography.subtitle, color: colors.textPrimary },
  secondary: { ...typography.body, color: colors.textSecondary },
  code: { ...typography.caption, color: colors.primary },
});
