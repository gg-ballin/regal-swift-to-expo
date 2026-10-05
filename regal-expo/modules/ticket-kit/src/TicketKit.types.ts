// SWIFT: `CaptureEvent.recordingChanged(isCaptured:)`; `.screenshot` is not forwarded (expo-screen-capture covers it).
export type CaptureChangeEvent = { isCaptured: boolean };

export type TicketKitEvents = {
  onCaptureChange: (event: CaptureChangeEvent) => void;
};
