import * as ScreenCapture from 'expo-screen-capture';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { boostBrightness, restoreBrightness } from './brightness';

/**
 * Port of the `TicketViewController` lifecycle. Focus, not mount: a pushed screen stays mounted underneath.
 * - focus: boost brightness, subscribe to screenshot events
 * - blur: restore brightness, unsubscribe
 * - AppState: restore when leaving `active` (brightness is system-wide); re-boost on return if still focused
 */
// SOLID (S) Single responsibility: screen-protection side effects only; ticket data is `useTicket`, rendering is `TicketScreen`.
export function useTicketScreenProtection(onScreenshot: () => void) {
  // SWIFT: `private var isOnScreen` on TicketViewController.
  const isFocused = useRef(false);
  const onScreenshotRef = useRef(onScreenshot);

  useEffect(() => {
    onScreenshotRef.current = onScreenshot;
  }, [onScreenshot]);

  // SWIFT: viewWillAppear -> brightness.boost(); cleanup = viewWillDisappear -> restore().
  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      void boostBrightness();
      // SWIFT: CaptureObserver's userDidTakeScreenshotNotification -> .screenshot.
      const screenshot = ScreenCapture.addScreenshotListener(() => onScreenshotRef.current());

      return () => {
        isFocused.current = false;
        void restoreBrightness();
        screenshot.remove();
      };
    }, []),
  );

  // SWIFT: NotificationCenter observers for UIApplication.willResignActiveNotification / didBecomeActiveNotification.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        void restoreBrightness();
      } else if (isFocused.current) {
        void boostBrightness();
      }
    });
    return () => subscription.remove();
  }, []);

  // iOS recording detection has no Expo API; it needs the ticket-kit native module.
  return { isCaptured: false };
}
