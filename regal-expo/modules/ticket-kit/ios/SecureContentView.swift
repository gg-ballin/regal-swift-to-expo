import ExpoModulesCore
import UIKit

/// Native `<SecureView>`: React children render normally on screen but are left out of screenshots,
/// screen recordings and mirroring.
///
/// UIKit has no public API for this. Children are hosted in the canvas view of a secure-entry `UITextField`,
/// which iOS excludes from captures; expo-screen-capture applies the same technique to the whole window
/// (`SecureWindowCanvas`). If a future iOS changes that private hierarchy, children mount in a plain view:
/// still rendered, just not protected.
final class SecureContentView: ExpoView {
  // Owns the canvas view taken from it.
  private let secureField: UITextField
  private let container: UIView

  required init(appContext: AppContext? = nil) {
    let field = UITextField()
    field.isSecureTextEntry = true
    secureField = field
    if let canvas = field.subviews.first {
      canvas.subviews.forEach { $0.removeFromSuperview() }
      container = canvas
    } else {
      container = UIView()
    }
    super.init(appContext: appContext)

    clipsToBounds = true
    container.frame = bounds
    container.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    addSubview(container)
  }

  // Fabric lays children out relative to `self`; `container` fills `self` at the origin, so their frames still apply.
  override func mountChildComponentView(_ childComponentView: UIView, index: Int) {
    container.insertSubview(childComponentView, at: index)
  }

  override func unmountChildComponentView(_ childComponentView: UIView, index: Int) {
    childComponentView.removeFromSuperview()
  }
}
