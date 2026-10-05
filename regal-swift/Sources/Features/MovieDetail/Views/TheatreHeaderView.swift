import UIKit

// RN: presentational <TheatreHeader theatre /> rendered as a full-width FlashList row (section header).
final class TheatreHeaderView: UICollectionReusableView {
    private let nameLabel = UILabel()
    private let addressLabel = UILabel()

    override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = Theme.Color.backgroundDeep
        isAccessibilityElement = true
        accessibilityTraits = .header

        nameLabel.font = Theme.Font.title
        nameLabel.textColor = Theme.Color.textPrimary
        nameLabel.numberOfLines = 0

        addressLabel.font = UIFont.systemFont(ofSize: 17, weight: .regular)
        addressLabel.textColor = Theme.Color.textSecondary
        addressLabel.numberOfLines = 0

        let pin = UIImageView(image: UIImage(systemName: "mappin.and.ellipse"))
        pin.tintColor = Theme.Color.primary
        pin.setContentHuggingPriority(.required, for: .horizontal)

        let addressRow = UIStackView(arrangedSubviews: [pin, addressLabel])
        addressRow.spacing = Theme.Spacing.sm
        addressRow.alignment = .center

        let stack = UIStackView(arrangedSubviews: [nameLabel, addressRow])
        stack.axis = .vertical
        stack.spacing = Theme.Spacing.sm
        stack.translatesAutoresizingMaskIntoConstraints = false
        addSubview(stack)

        NSLayoutConstraint.activate([
            stack.topAnchor.constraint(equalTo: topAnchor, constant: Theme.Spacing.xl),
            stack.leadingAnchor.constraint(equalTo: leadingAnchor, constant: Theme.Spacing.lg),
            stack.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -Theme.Spacing.lg),
            stack.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -Theme.Spacing.lg),
        ])
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    func configure(with theatre: Theatre) {
        nameLabel.text = theatre.name
        addressLabel.text = theatre.formattedAddress
        accessibilityLabel = "\(theatre.name), \(theatre.formattedAddress)"
    }
}
