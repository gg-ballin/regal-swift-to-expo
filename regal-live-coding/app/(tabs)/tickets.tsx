import { StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '@/components/states';
import { colors, spacing, typography } from '@/theme';

/**
 * Placeholder tab. In the exercise, purchased tickets land here:
 * POST /bookings via useMutation -> invalidateQueries(['tickets']) -> render this list.
 */
export default function TicketsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Tickets</Text>
      <EmptyState title="No tickets yet" subtitle="Tickets you purchase will appear here." />
      <Text style={styles.hint}>Crown Club members earn 100 credits per ticket.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.lg },
  title: { ...typography.title, color: colors.textPrimary, paddingHorizontal: spacing.lg },
  hint: { ...typography.caption, textAlign: 'center', color: colors.orangeHighlight, paddingBottom: spacing.xl },
});
