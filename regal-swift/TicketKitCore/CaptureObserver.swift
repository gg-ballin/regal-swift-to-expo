import UIKit
import os

/// Detects screenshots and screen recording/mirroring. iOS cannot block either;
/// callers react by obscuring sensitive content.
///
/// `start`/`stop` may be called from any thread; `onEvent` is always delivered on the main thread.
// RN: the only core type bridged by ticket-kit: Events("onCaptureChange"), start/stop driven by OnStartObserving/OnStopObserving.
// No Expo library exposes `UIScreen.isCaptured`; screenshots go through expo-screen-capture instead.
public final class CaptureObserver: @unchecked Sendable {
    // Observer tokens are not Sendable; all access goes through the lock.
    private let tokens = OSAllocatedUnfairLock<[NSObjectProtocol]>(uncheckedState: [])

    public init() {}

    deinit {
        stop()
    }

    @MainActor
    public static var isCaptured: Bool {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .contains { $0.screen.isCaptured }
    }

    public func start(onEvent: @escaping @Sendable (CaptureEvent) -> Void) {
        stop()

        let center = NotificationCenter.default
        let screenshot = center.addObserver(
            forName: UIApplication.userDidTakeScreenshotNotification,
            object: nil,
            queue: .main
        ) { _ in
            onEvent(.screenshot)
        }
        let capture = center.addObserver(
            forName: UIScreen.capturedDidChangeNotification,
            object: nil,
            queue: .main
        ) { _ in
            let isCaptured = MainActor.assumeIsolated { CaptureObserver.isCaptured }
            onEvent(.recordingChanged(isCaptured: isCaptured))
        }

        tokens.withLockUnchecked { $0 = [screenshot, capture] }
    }

    public func stop() {
        let removed = tokens.withLockUnchecked { current in
            defer { current = [] }
            return current
        }
        removed.forEach(NotificationCenter.default.removeObserver)
    }
}
