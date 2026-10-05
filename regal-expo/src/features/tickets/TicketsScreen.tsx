import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { colors, spacing, typography } from '@/theme/theme';

import { TicketHistoryRow } from './components/TicketHistoryRow';
import { useTicketHistory } from './useTicketHistory';

/** Port of `TicketHistoryViewController`: purchases newest first, tap reopens the ticket. */
// SWIFT: UICollectionView (list layout, .plain, border separators) + centered empty-state UIStackView.
export function TicketsScreen() {
  const { rows, open } = useTicketHistory();

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={rows.length === 0 && styles.emptyContainer}
      contentInsetAdjustmentBehavior="automatic"
      data={rows}
      keyExtractor={(row) => row.id}
      renderItem={({ item }) => <TicketHistoryRow row={item} onPress={open} />}
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={EmptyState}
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Icon name={{ ios: 'qrcode', android: 'qr_code' }} size={40} color={colors.tabInactive} weight="semibold" />
      <Text style={styles.emptyText}>Tickets you buy will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  emptyContainer: { flexGrow: 1 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: spacing.lg },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
