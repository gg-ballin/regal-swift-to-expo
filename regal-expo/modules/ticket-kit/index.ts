import type { EventSubscription } from 'expo';

import * as fallback from './src/fallback';
import type { CaptureChangeEvent } from './src/TicketKit.types';
import TicketKit from './src/TicketKitModule';

export { SecureView } from './src/SecureView';
export type { CaptureChangeEvent } from './src/TicketKit.types';

// Only what no Expo library covers: observing iOS screen recording/mirroring, and hiding a single view (not the
// whole window) from captures. Brightness (expo-brightness), haptics (expo-haptics), screenshot detection
// (expo-screen-capture) and the QR (TS + react-native-svg) live in the app.
// SOLID (O) Open/closed: consumers import this facade only; the implementation (native module, Expo fallback, or a future
// Nitro/Turbo module) can change without touching screens or tests.

// SWIFT: static `CaptureObserver.isCaptured`: any connected UIWindowScene whose `screen.isCaptured` is true.
export const isCaptured = (): Promise<boolean> => TicketKit?.isCaptured() ?? Promise.resolve(false);

// SWIFT: `captureObserver.start { event in ... }` observing UIScreen.capturedDidChangeNotification.
export function addCaptureChangeListener(listener: (event: CaptureChangeEvent) => void): EventSubscription {
  return TicketKit?.addListener('onCaptureChange', listener) ?? fallback.addCaptureChangeListener();
}
