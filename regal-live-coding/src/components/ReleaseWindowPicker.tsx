import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  clampWindowStart,
  formatReleaseDate,
  formatReleaseWindow,
  isoToLocalDate,
  localDateToIso,
  rangeFromStart,
  WINDOW_START_MAX,
  WINDOW_START_MIN,
} from '@/domain/releaseWindow';
import { colors, radius, spacing, typography } from '@/theme';

const minimumDate = isoToLocalDate(WINDOW_START_MIN);
const maximumDate = isoToLocalDate(WINDOW_START_MAX);

type Props = {
  /** Inclusive start of the 4-week window (`yyyy-MM-dd`). */
  start: string;
  onChangeStart: (start: string) => void;
};

/**
 * Native start-date control. iOS renders SwiftUI's compact DatePicker inline.
 * Android opens the Material date dialog on press and unmounts it on confirm or dismiss.
 */
export function ReleaseWindowPicker({ start, onChangeStart }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const range = rangeFromStart(clampWindowStart(start));
  const value = isoToLocalDate(range.gte);

  const commit = (date: Date) => {
    setDialogOpen(false);
    onChangeStart(clampWindowStart(localDateToIso(date)));
  };

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.label}>Release window</Text>
        <Text style={styles.range}>{formatReleaseWindow(range)}</Text>
      </View>
      {Platform.OS === 'ios' ? (
        <DateTimePicker
          value={value}
          mode="date"
          display="compact"
          themeVariant="dark"
          accentColor={colors.primary}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onValueChange={(_event, date) => commit(date)}
          style={styles.picker}
          testID="release-window-start"
        />
      ) : null}
      {Platform.OS === 'android' ? (
        <Pressable
          onPress={() => setDialogOpen(true)}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel="Change release window start"
        >
          <Text style={styles.buttonText}>{formatReleaseDate(range.gte)}</Text>
        </Pressable>
      ) : null}
      {Platform.OS === 'android' && dialogOpen ? (
        <DateTimePicker
          value={value}
          mode="date"
          presentation="dialog"
          accentColor={colors.primary}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onValueChange={(_event, date) => commit(date)}
          onDismiss={() => setDialogOpen(false)}
          testID="release-window-start"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  copy: { flex: 1, gap: spacing.xs },
  label: { ...typography.caption, color: colors.textMuted },
  range: { ...typography.body, color: colors.textPrimary },
  button: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonText: { ...typography.body, color: colors.primary },
  /** Compact SwiftUI picker collapses to 0×0 if its host is not given a size. */
  picker: { minWidth: 140, minHeight: 36 },
});
