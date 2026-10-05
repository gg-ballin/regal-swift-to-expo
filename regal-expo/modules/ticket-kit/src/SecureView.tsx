import { requireNativeView } from 'expo';
import type { ComponentType } from 'react';
import { Platform, View, type ViewProps } from 'react-native';

// SWIFT: `View(SecureContentView.self)`, an ExpoView hosting its children in a secure-entry UITextField canvas.
const NativeSecureView: ComponentType<ViewProps> | null =
  Platform.OS === 'ios' ? requireNativeView<ViewProps>('TicketKit') : null;

/**
 * Children stay visible on screen but are left out of screenshots, recordings and mirroring (iOS).
 * Android/web: a plain `View`; Android is covered by FLAG_SECURE from `addCaptureChangeListener` (whole window).
 */
export function SecureView(props: ViewProps) {
  return NativeSecureView ? <NativeSecureView {...props} /> : <View {...props} />;
}
