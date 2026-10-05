import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  shape?: 'capsule' | 'rounded';
};

/** Orange filled button; disabled = `#2D2C31` background with muted text (`SeatSummaryBar`). */
// SWIFT: UIButton(configuration: .filled(), primaryAction: UIAction); shape = cornerStyle .capsule / cornerRadius.
export function PrimaryButton({ title, onPress, disabled = false, shape = 'capsule' }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      // SWIFT: button.configurationUpdateHandler swapping baseBackgroundColor/baseForegroundColor on isEnabled/isHighlighted.
      style={({ pressed }) => [
        styles.base,
        shape === 'capsule' ? styles.capsule : styles.rounded,
        { backgroundColor: disabled ? colors.surfaceElevated : pressed ? colors.primaryPressed : colors.primary },
      ]}>
      <Text style={[styles.title, { color: disabled ? colors.textMuted : colors.textOnPrimary }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  capsule: { borderRadius: radius.pill, paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  rounded: { borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  title: { ...typography.subtitle },
});
