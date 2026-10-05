import UIKit

/// Screen brightness is a system-wide setting that outlives the app, so every `boost()`
/// must be paired with `restore()` on screen exit and when the app resigns active.
// RN: not bridged; expo-brightness behind `boostBrightness()` / `restoreBrightness()` (src/features/ticket/brightness.ts).
@MainActor
public final class BrightnessController {
    private var originalBrightness: CGFloat?

    public init() {}

    public var isBoosted: Bool { originalBrightness != nil }

    public func boost() {
        guard let screen = Self.activeScreen else { return }
        if originalBrightness == nil {
            originalBrightness = screen.brightness
        }
        screen.brightness = 1.0
    }

    public func restore() {
        guard let original = originalBrightness else { return }
        originalBrightness = nil
        Self.activeScreen?.brightness = original
    }

    private static var activeScreen: UIScreen? {
        let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        let scene = scenes.first { $0.activationState == .foregroundActive } ?? scenes.first
        return scene?.screen
    }
}
