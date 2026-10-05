import type { EventSubscription } from 'expo';
import * as ScreenCapture from 'expo-screen-capture';
import { Platform } from 'react-native';

/** Android/web stand-in with the same contract as the native module. */
// SOLID (L) Liskov substitution: interchangeable with the native module; callers can't tell which one they got.

const noopSubscription: EventSubscription = { remove: () => {} };
let secureWindowCount = 0;

/**
 * Android can't observe recordings without native code, so it prevents them instead: FLAG_SECURE for the
 * subscription's lifetime blacks out recordings and screenshots. No change event is ever sent, so the shield never shows.
 */
// SWIFT: CaptureObserver posts `.recordingChanged(isCaptured:)` from UIScreen.capturedDidChangeNotification instead.
export function addCaptureChangeListener(): EventSubscription {
  if (Platform.OS !== 'android') return noopSubscription;

  const key = `ticket-kit-secure-${++secureWindowCount}`;
  const prevented = ScreenCapture.preventScreenCaptureAsync(key).catch(() => {});
  return {
    // Keyed so overlapping subscriptions only clear FLAG_SECURE once all of them are removed.
    remove: () => void prevented.then(() => ScreenCapture.allowScreenCaptureAsync(key)).catch(() => {}),
  };
}
