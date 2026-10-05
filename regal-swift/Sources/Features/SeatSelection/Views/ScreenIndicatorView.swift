import UIKit

/// Curved "SCREEN" marker drawn above the seat grid.
// RN: react-native-svg <Path d="M x y Q cx cy x2 y2" />; CAShapeLayer shadow = an SVG blur filter or a wider translucent stroke.
final class ScreenIndicatorView: UIView {
    private let arcLayer = CAShapeLayer()
    private let label = UILabel()

    override init(frame: CGRect) {
        super.init(frame: frame)
        isAccessibilityElement = true
        accessibilityLabel = "Screen"

        arcLayer.fillColor = UIColor.clear.cgColor
        arcLayer.strokeColor = Theme.Color.primary.cgColor
        arcLayer.lineWidth = 3
        arcLayer.lineCap = .round
        arcLayer.shadowColor = Theme.Color.primary.cgColor
        arcLayer.shadowOpacity = 0.8
        arcLayer.shadowRadius = 8
        arcLayer.shadowOffset = CGSize(width: 0, height: 4)
        layer.addSublayer(arcLayer)

        label.text = "SCREEN"
        label.font = Theme.Font.caption
        label.textColor = Theme.Color.textMuted
        label.translatesAutoresizingMaskIntoConstraints = false
        addSubview(label)

        NSLayoutConstraint.activate([
            heightAnchor.constraint(equalToConstant: 44),
            label.centerXAnchor.constraint(equalTo: centerXAnchor),
            label.bottomAnchor.constraint(equalTo: bottomAnchor),
        ])
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    // RN: = onLayout giving the width used to build the path.
    override func layoutSubviews() {
        super.layoutSubviews()
        let inset: CGFloat = 24
        let path = UIBezierPath()
        path.move(to: CGPoint(x: inset, y: 20))
        path.addQuadCurve(to: CGPoint(x: bounds.width - inset, y: 20), controlPoint: CGPoint(x: bounds.midX, y: 0))
        arcLayer.path = path.cgPath
    }
}
