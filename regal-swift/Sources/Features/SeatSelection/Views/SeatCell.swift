import UIKit

// RN: memoized <SeatCell seat rowLabel size /> wrapping a <Pressable>; Appearance = a 'available' | 'taken' | 'selected' union.
final class SeatCell: UICollectionViewCell {
    enum Appearance: Equatable {
        case available
        case taken
        case selected
    }

    private let seatView = UIView()
    private let iconView = UIImageView()

    override init(frame: CGRect) {
        super.init(frame: frame)
        isAccessibilityElement = true

        seatView.layer.cornerRadius = 5
        seatView.layer.maskedCorners = [.layerMinXMinYCorner, .layerMaxXMinYCorner]
        seatView.layer.borderWidth = 1
        seatView.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(seatView)

        iconView.contentMode = .scaleAspectFit
        iconView.translatesAutoresizingMaskIntoConstraints = false
        seatView.addSubview(iconView)

        NSLayoutConstraint.activate([
            seatView.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 2),
            seatView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 2),
            seatView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -2),
            seatView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -2),
            iconView.centerXAnchor.constraint(equalTo: seatView.centerXAnchor),
            iconView.centerYAnchor.constraint(equalTo: seatView.centerYAnchor),
            iconView.widthAnchor.constraint(equalTo: seatView.widthAnchor, multiplier: 0.6),
            iconView.heightAnchor.constraint(equalTo: iconView.widthAnchor),
        ])
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    func configure(seat: Seat, rowLabel: String, appearance: Appearance) {
        let isWheelchair = seat.type == .wheelchair

        switch appearance {
        case .available:
            seatView.backgroundColor = Theme.Color.seatAvailable
            seatView.layer.borderColor = Theme.Color.seatAvailable.cgColor
            iconView.tintColor = Theme.Color.textPrimary
        case .taken:
            seatView.backgroundColor = Theme.Color.seatTaken
            seatView.layer.borderColor = Theme.Color.border.cgColor
            iconView.tintColor = Theme.Color.textMuted
        case .selected:
            seatView.backgroundColor = Theme.Color.seatSelected
            seatView.layer.borderColor = Theme.Color.orangeHighlight.cgColor
            iconView.tintColor = Theme.Color.textOnPrimary
        }

        let symbol: String? = switch (appearance, isWheelchair) {
        case (_, true): "figure.roll"
        case (.taken, false): "xmark"
        case (.selected, false): "checkmark"
        case (.available, false): nil
        }
        iconView.image = symbol.flatMap { UIImage(systemName: $0, withConfiguration: UIImage.SymbolConfiguration(weight: .bold)) }

        let status = switch appearance {
        case .available: "available"
        case .taken: "taken"
        case .selected: "selected"
        }
        // RN: accessibilityLabel / accessibilityValue={{ text }} / accessibilityState={{ selected, disabled }}.
        accessibilityLabel = "Row \(rowLabel), seat \(seat.number)\(isWheelchair ? ", wheelchair accessible" : "")"
        accessibilityValue = status
        accessibilityTraits = appearance == .taken ? [.button, .notEnabled] : (appearance == .selected ? [.button, .selected] : .button)
    }
}

final class RowLabelCell: UICollectionViewCell {
    private let label = UILabel()

    override init(frame: CGRect) {
        super.init(frame: frame)
        label.font = Theme.Font.caption
        label.textColor = Theme.Color.textMuted
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(label)
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: contentView.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
        ])
        isAccessibilityElement = false
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    func configure(text: String) {
        label.text = text
    }
}
