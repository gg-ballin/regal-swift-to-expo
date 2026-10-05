import UIKit

// RN: <LinearGradient colors start end /> from expo-linear-gradient (also a CAGradientLayer on iOS).
final class GradientView: UIView {
    override class var layerClass: AnyClass { CAGradientLayer.self }

    private var gradientLayer: CAGradientLayer { layer as! CAGradientLayer }

    var colors: [UIColor] = [] {
        didSet { gradientLayer.colors = colors.map(\.cgColor) }
    }

    init(colors: [UIColor] = [], startPoint: CGPoint = CGPoint(x: 0, y: 0.5), endPoint: CGPoint = CGPoint(x: 1, y: 0.5)) {
        super.init(frame: .zero)
        gradientLayer.startPoint = startPoint
        gradientLayer.endPoint = endPoint
        self.colors = colors
        gradientLayer.colors = colors.map(\.cgColor)
        isUserInteractionEnabled = false
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }
}
