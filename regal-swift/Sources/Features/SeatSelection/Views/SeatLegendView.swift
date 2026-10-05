import UIKit

// RN: <SeatLegend />, a row with justifyContent: 'space-between' (= .equalSpacing).
final class SeatLegendView: UIStackView {
    init() {
        super.init(frame: .zero)
        distribution = .equalSpacing
        alignment = .center
        addArrangedSubview(Self.makeEntry(color: Theme.Color.seatAvailable, symbol: nil, title: "Available"))
        addArrangedSubview(Self.makeEntry(color: Theme.Color.seatSelected, symbol: "checkmark", title: "Selected"))
        addArrangedSubview(Self.makeEntry(color: Theme.Color.seatTaken, symbol: "xmark", title: "Taken"))
        addArrangedSubview(Self.makeEntry(color: Theme.Color.seatAvailable, symbol: "figure.roll", title: "Wheelchair"))
    }

    @available(*, unavailable)
    required init(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    private static func makeEntry(color: UIColor, symbol: String?, title: String) -> UIView {
        let swatch = UIView()
        swatch.backgroundColor = color
        swatch.layer.cornerRadius = 3
        swatch.layer.borderWidth = 1
        swatch.layer.borderColor = Theme.Color.border.cgColor
        swatch.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            swatch.widthAnchor.constraint(equalToConstant: 14),
            swatch.heightAnchor.constraint(equalToConstant: 14),
        ])

        if let symbol {
            let icon = UIImageView(image: UIImage(systemName: symbol, withConfiguration: UIImage.SymbolConfiguration(pointSize: 8, weight: .bold)))
            icon.tintColor = Theme.Color.textPrimary
            icon.translatesAutoresizingMaskIntoConstraints = false
            swatch.addSubview(icon)
            NSLayoutConstraint.activate([
                icon.centerXAnchor.constraint(equalTo: swatch.centerXAnchor),
                icon.centerYAnchor.constraint(equalTo: swatch.centerYAnchor),
            ])
        }

        let label = UILabel()
        label.text = title
        label.font = Theme.Font.caption
        label.textColor = Theme.Color.textSecondary

        let entry = UIStackView(arrangedSubviews: [swatch, label])
        entry.spacing = Theme.Spacing.xs
        entry.alignment = .center
        return entry
    }
}
