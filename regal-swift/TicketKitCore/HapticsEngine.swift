import UIKit

// RN: not bridged; expo-haptics `selectionAsync()` / `notificationAsync(Success | Warning)`.
@MainActor
public final class HapticsEngine {
    private let selectionGenerator = UISelectionFeedbackGenerator()
    private let notificationGenerator = UINotificationFeedbackGenerator()

    public init() {
        selectionGenerator.prepare()
        notificationGenerator.prepare()
    }

    public func selection() {
        selectionGenerator.selectionChanged()
        selectionGenerator.prepare()
    }

    public func success() {
        notificationGenerator.notificationOccurred(.success)
        notificationGenerator.prepare()
    }

    public func warning() {
        notificationGenerator.notificationOccurred(.warning)
        notificationGenerator.prepare()
    }
}
