import ExpoModulesCore
import UIKit

/// JS bridge for what no Expo library covers:
/// - screen recording/mirroring detection (`UIScreen.isCaptured`) via `TicketKitCore.CaptureObserver`, shared with regal-swift;
/// - `<SecureView>`, which hides only its children from captures (expo-screen-capture can only hide the whole window).
///
/// Memory and lifecycle:
/// - `SecureContentView` is an `ExpoView` (Fabric); children are re-parented via `mountChildComponentView`/`unmountChildComponentView`.
/// - The observer closure captures `[weak self]`, so the module → observer → closure chain never forms a retain cycle (ARC).
/// - `CaptureObserver.isCaptured` is `@MainActor`; the bridge runs it on `.main` and enters it with `MainActor.assumeIsolated`.
/// - Native observation is tied to JS listeners: `OnStartObserving` on the first `onCaptureChange` subscriber,
///   `OnStopObserving` when the last one is removed (and `CaptureObserver.deinit` as a backstop),
///   so no notification observer outlives its consumers.
public final class TicketKitModule: Module {
  private let captureObserver = CaptureObserver()

  public func definition() -> ModuleDefinition {
    Name("TicketKit")

    Events("onCaptureChange")

    AsyncFunction("isCaptured") { () -> Bool in
      MainActor.assumeIsolated { CaptureObserver.isCaptured }
    }
    .runOnQueue(.main)

    OnStartObserving {
      self.captureObserver.start { [weak self] event in
        // Screenshots reach JS through expo-screen-capture.
        guard case .recordingChanged(let isCaptured) = event else { return }
        self?.sendEvent("onCaptureChange", ["isCaptured": isCaptured])
      }
    }

    OnStopObserving {
      self.captureObserver.stop()
    }

    View(SecureContentView.self) {}
  }
}
