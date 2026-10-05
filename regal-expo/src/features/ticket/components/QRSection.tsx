import { BlurView } from 'expo-blur';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SecureView } from 'ticket-kit';

import { Icon } from '@/components/Icon';
import { QRCode, useQRCode } from '@/components/QRCode';
import { colors, radius, spacing, typography } from '@/theme/theme';

export const QR_POINT_SIZE = 240;
const PADDING = spacing.md;
const GENERATION_ERROR = "Couldn't generate your ticket code.";

type Props = {
  payload: string;
  isCaptured: boolean;
};

// SWIFT: TicketViewController.makeQRSection(): white container with qrImageView, qrSpinner and captureShield stacked inside.
// No spinner here: encoding is synchronous TS (~1 ms), so there is no async QRCodeStore/Task.detached step to wait on.
export function QRSection({ payload, isCaptured }: Props) {
  // SWIFT: TicketViewModel.generateQRCode(pointSize:scale:); a thrown QRCodeError sets State.errorMessage.
  const code = useQRCode(payload);
  const hasError = code === null;

  const doorText = hasError
    ? GENERATION_ERROR
    : isCaptured
      ? 'Stop screen recording to show your code'
      : 'Show this at the door';

  return (
    <View style={styles.section}>
      <View
        style={styles.container}
        accessible
        accessibilityRole="image"
        accessibilityLabel={isCaptured ? 'Ticket code hidden while the screen is being recorded' : 'Ticket QR code'}>
        {/* SWIFT: TicketKitCore.SecureContainerView around qrImageView. The QR is blank in screenshots/recordings. */}
        <SecureView style={styles.qr}>
          <QRCode code={code} size={QR_POINT_SIZE} />
        </SecureView>

        {/* SWIFT: captureShield = UIVisualEffectView(UIBlurEffect(.systemChromeMaterialDark)) toggled via UIView.transition(.transitionCrossDissolve, 0.2). */}
        {isCaptured && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={StyleSheet.absoluteFill}>
            <BlurView tint="systemChromeMaterialDark" intensity={100} style={styles.overlay}>
              <Icon name={{ ios: 'eye.slash.fill', android: 'visibility_off' }} size={36} color={colors.textPrimary} weight="semibold" />
            </BlurView>
          </Animated.View>
        )}
      </View>

      {/* SWIFT: doorLabel text/color chosen in TicketViewController.render(_:). */}
      <Text style={[styles.door, { color: hasError || isCaptured ? colors.primary : colors.textSecondary }]}>{doorText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { alignItems: 'center', gap: spacing.lg },
  container: {
    width: QR_POINT_SIZE + PADDING * 2,
    height: QR_POINT_SIZE + PADDING * 2,
    padding: PADDING,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  qr: { width: QR_POINT_SIZE, height: QR_POINT_SIZE },
  overlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  door: { ...typography.subtitle, textAlign: 'center' },
});
