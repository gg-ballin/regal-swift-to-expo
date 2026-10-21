import { useQuery } from '@tanstack/react-query';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '@/api/client';
import { ErrorState, LoadingState } from '@/components/states';
import { API_BASE_URL } from '@/config/api';
import { colors, radius, spacing, typography } from '@/theme';

/** Interview debugging tab: prove the starter API on :3001 is reachable from THIS target. */
export default function ApiStatusScreen() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['health'],
    queryFn: () => api<{ status: string }>('/health'),
    retry: false,
  });

  if (isPending) return <LoadingState label="Pinging API…" />;
  if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Status</Text>
      <View style={styles.card}>
        <Row label="Status" value={data.status === 'ok' ? '● Connected' : data.status} valueColor={colors.success} />
        <Row label="Base URL" value={API_BASE_URL} />
        <Row label="Platform" value={Platform.OS} />
      </View>
      <Pressable style={styles.button} onPress={() => void refetch()} accessibilityRole="button">
        <Text style={styles.buttonText}>Re-check</Text>
      </Pressable>
      <Text style={styles.hint}>
        If this fails on device: starter server not running, port 3001 busy, or wrong host (see src/config/api.ts).
      </Text>
    </View>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md },
  title: { ...typography.title, color: colors.textPrimary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  label: { ...typography.caption, color: colors.textMuted },
  value: { ...typography.caption, color: colors.textPrimary, flexShrink: 1, textAlign: 'right' },
  button: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  buttonText: { ...typography.tab, color: colors.textOnPrimary },
  hint: { ...typography.caption, color: colors.textMuted, fontWeight: '400', lineHeight: 17 },
});
