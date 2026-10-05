import UIKit

/// Subviews of `contentView` render normally on screen but are left out of screenshots, screen recordings and mirroring.
///
/// UIKit has no public API for this. `contentView` is the canvas view of a secure-entry `UITextField`,
/// which iOS excludes from captures. If a future iOS changes that private hierarchy, `contentView` is a plain view:
/// content still renders, just not protected.
// RN: <SecureView> from ticket-kit; its native SecureContentView (ExpoView) applies the same technique.
public final class SecureContainerView: UIView {
    public let contentView: UIView
    public let isSecure: Bool
    // Owns the canvas view taken from it.
    private let secureField: UITextField

    override public init(frame: CGRect) {
        let field = UITextField()
        field.isSecureTextEntry = true
        secureField = field
        if let canvas = field.subviews.first {
            canvas.subviews.forEach { $0.removeFromSuperview() }
            contentView = canvas
            isSecure = true
        } else {
            contentView = UIView()
            isSecure = false
        }
        super.init(frame: frame)

        clipsToBounds = true
        contentView.frame = bounds
        contentView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        addSubview(contentView)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }
}
