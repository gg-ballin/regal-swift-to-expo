import * as ScreenCapture from 'expo-screen-capture';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { addCaptureChangeListener, isCaptured as readIsCaptured } from 'ticket-kit';

import { boostBrightness, restoreBrightness } from './brightness';

/**
 * Port of the `TicketViewController` lifecycle. Focus, not mount: a pushed screen stays mounted underneath.
 * - focus: boost brightness, subscribe to screenshot + recording events, read the initial `isCaptured`
 * - blur: restore brightness, unsubscribe
 * - AppState: restore when leaving `active` (brightness is system-wide); re-boost on return if still focused
 */
// SOLID (S) Single responsibility: screen-protection side effects only; ticket data is `useTicket`, rendering is `TicketScreen`.
export function useTicketScreenProtection(onScreenshot: () => void) {
  // SWIFT: TicketViewModel.State.isCaptured, updated by handle(.recordingChanged(isCaptured:)).
  const [isCaptured, setIsCaptured] = useState(false);
  // SWIFT: `private var isOnScreen` on TicketViewController.
  const isFocused = useRef(false);
  const onScreenshotRef = useRef(onScreenshot);

  useEffect(() => {
    onScreenshotRef.current = onScreenshot;
  }, [onScreenshot]);

  const refreshCaptured = useCallback(() => {
    void readIsCaptured().then(setIsCaptured);
  }, []);

  // SWIFT: viewWillAppear -> brightness.boost() + startCaptureObservation(); cleanup = viewWillDisappear -> restore() + captureObserver.stop().
  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      void boostBrightness();
      refreshCaptured();
      // SWIFT: CaptureObserver's userDidTakeScreenshotNotification -> .screenshot.
      const screenshot = ScreenCapture.addScreenshotListener(() => onScreenshotRef.current());
      const capture = addCaptureChangeListener((event) => setIsCaptured(event.isCaptured));

      return () => {
        isFocused.current = false;
        void restoreBrightness();
        screenshot.remove();
        capture.remove();
      };
    }, [refreshCaptured]),
  );

  // SWIFT: NotificationCenter observers for UIApplication.willResignActiveNotification / didBecomeActiveNotification.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        void restoreBrightness();
      } else if (isFocused.current) {
        void boostBrightness();
        refreshCaptured();
      }
    });
    return () => subscription.remove();
  }, [refreshCaptured]);

  return { isCaptured };
}
