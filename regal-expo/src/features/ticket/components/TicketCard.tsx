import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import type { Ticket } from '@/domain/booking';
import { ticketPayloadJson, ticketPresentation } from '@/domain/ticket';
import { colors, radius, spacing, typography } from '@/theme/theme';

import { QRSection } from './QRSection';

type Props = {
  ticket: Ticket;
  isCaptured: boolean;
};

/** Port of `TicketViewController.makeTicketCard()`. */
// SWIFT: UIView (cornerRadius, borderWidth, clipsToBounds) holding a header + vertical UIStackView body with setCustomSpacing.
export function TicketCard({ ticket, isCaptured }: Props) {
  const p = ticketPresentation(ticket);

  return (
    <View style={styles.card}>
      {/* SWIFT: makeHeader(): GradientView(colors: primaryGradient) + UIStackView(brand, UIView() spacer, admit). */}
      <LinearGradient colors={colors.primaryGradient} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.header}>
        <Text style={styles.brand}>REGAL</Text>
        <Text style={styles.admit}>{p.admitCount}</Text>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.title} accessibilityRole="header">
          {p.movieTitle}
        </Text>
        <Text style={styles.meta}>{p.movieMeta}</Text>

        <View style={styles.qr}>
          <QRSection payload={ticketPayloadJson(ticket)} isCaptured={isCaptured} />
        </View>

        <DashedSeparator />

        <View style={styles.details}>
          <InfoRow entries={[['THEATRE', p.theatre]]} />
          <InfoRow entries={[['FORMAT', p.format]]} />
          <InfoRow entries={[['DATE', p.date], ['TIME', p.time]]} />
          <InfoRow entries={[['AUDITORIUM', p.auditorium], ['SEATS', p.seats]]} />
          <InfoRow entries={[['TOTAL', p.total], ['CODE', p.shortCode]]} />
        </View>
      </View>
    </View>
  );
}

// SWIFT: makeInfoRow(_:): horizontal UIStackView (.fillEqually, .top) of vertical title/value stacks, each one accessibility element.
function InfoRow({ entries }: { entries: [title: string, value: string][] }) {
  return (
    <View style={styles.infoRow}>
      {entries.map(([title, value]) => (
        <View
          key={title}
          style={styles.infoColumn}
          accessible
          accessibilityLabel={`${title.charAt(0)}${title.slice(1).toLowerCase()}: ${value}`}>
          <Text style={styles.infoTitle}>{title}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

// SWIFT: DashedSeparatorView: CAShapeLayer with lineDashPattern = [6, 4], path rebuilt in layoutSubviews().
function DashedSeparator() {
  const [width, setWidth] = useState(0);
  return (
    <View style={styles.separator} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} importantForAccessibility="no">
      {width > 0 && (
        <Svg width={width} height={1}>
          <Line x1={0} y1={0.5} x2={width} y2={0.5} stroke={colors.border} strokeWidth={1} strokeDasharray="6,4" />
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  brand: { fontSize: 20, fontWeight: '900', color: colors.textOnPrimary },
  admit: { ...typography.tab, color: colors.textOnPrimary },
  body: { padding: spacing.xl },
  title: { ...typography.hero, color: colors.textPrimary },
  meta: { ...typography.subtitle, color: colors.textSecondary, marginTop: spacing.sm },
  qr: { marginVertical: spacing.xl },
  separator: { height: 1, marginBottom: spacing.xl },
  details: { gap: spacing.lg },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  infoColumn: { flex: 1, gap: spacing.xs },
  infoTitle: { ...typography.caption, color: colors.textMuted },
  infoValue: { ...typography.subtitle, color: colors.textPrimary },
});
