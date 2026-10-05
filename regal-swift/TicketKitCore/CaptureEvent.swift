// RN: `.recordingChanged` = ticket-kit 'onCaptureChange' ({ isCaptured }); `.screenshot` = expo-screen-capture addScreenshotListener.
public enum CaptureEvent: Sendable, Equatable {
    case screenshot
    case recordingChanged(isCaptured: Bool)
}
