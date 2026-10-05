import UIKit

/// One format block inside a theatre card: name + DETAILS pill, seating, attributes, showtime chips.
// RN: presentational <FormatCard format onSelectShowtime />.
final class FormatCell: UICollectionViewCell {
    // RN: callback prop.
    var onSelectShowtime: ((String) -> Void)?

    private static let chipsPerRow = 3

    private let nameLabel = UILabel()
    private let seatingLabel = UILabel()
    private let attributesLabel = UILabel()
    private let chipsStack = UIStackView()

    override init(frame: CGRect) {
        super.init(frame: frame)
        contentView.backgroundColor = Theme.Color.surfaceElevated
        contentView.layer.cornerRadius = Theme.Radius.lg
        contentView.clipsToBounds = true

        nameLabel.font = Theme.Font.title
        nameLabel.textColor = Theme.Color.textPrimary

        var pillConfiguration = UIButton.Configuration.filled()
        pillConfiguration.baseBackgroundColor = Theme.Color.pill
        pillConfiguration.baseForegroundColor = Theme.Color.textSecondary
        pillConfiguration.cornerStyle = .capsule
        pillConfiguration.attributedTitle = AttributedString("DETAILS", attributes: AttributeContainer([.font: Theme.Font.caption]))
        let detailsPill = UIButton(configuration: pillConfiguration)
        detailsPill.isUserInteractionEnabled = false
        detailsPill.setContentHuggingPriority(.required, for: .horizontal)

        let headerRow = UIStackView(arrangedSubviews: [nameLabel, detailsPill])
        headerRow.alignment = .center

        seatingLabel.font = UIFont.systemFont(ofSize: 17, weight: .regular)
        seatingLabel.textColor = Theme.Color.textPrimary

        attributesLabel.font = Theme.Font.caption
        attributesLabel.textColor = Theme.Color.textMuted
        attributesLabel.numberOfLines = 0

        chipsStack.axis = .vertical
        chipsStack.spacing = Theme.Spacing.sm

        let stack = UIStackView(arrangedSubviews: [headerRow, seatingLabel, attributesLabel, chipsStack])
        stack.axis = .vertical
        stack.spacing = Theme.Spacing.sm
        stack.setCustomSpacing(Theme.Spacing.lg, after: attributesLabel)
        stack.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(stack)

        NSLayoutConstraint.activate([
            stack.topAnchor.constraint(equalTo: contentView.topAnchor, constant: Theme.Spacing.lg),
            stack.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: Theme.Spacing.lg),
            stack.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -Theme.Spacing.lg),
            stack.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -Theme.Spacing.lg),
        ])
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    func configure(with format: ShowFormat) {
        nameLabel.text = format.name
        seatingLabel.text = format.seating
        attributesLabel.text = format.attributes.joined(separator: "  •  ")
        rebuildChips(for: format.times)
    }

    // RN: chunk(times, 3).map(row => <View style={{ flexDirection: 'row' }}>); `.fillEqually` = `flex: 1` per chip.
    private func rebuildChips(for times: [Showtime]) {
        chipsStack.arrangedSubviews.forEach { $0.removeFromSuperview() }

        for rowStart in stride(from: 0, to: times.count, by: Self.chipsPerRow) {
            let row = UIStackView()
            row.distribution = .fillEqually
            row.spacing = Theme.Spacing.sm
            let rowTimes = times[rowStart..<min(rowStart + Self.chipsPerRow, times.count)]
            rowTimes.forEach { row.addArrangedSubview(makeChip(for: $0)) }
            // Keep chip widths consistent on a partially filled last row.
            for _ in rowTimes.count..<Self.chipsPerRow {
                row.addArrangedSubview(UIView())
            }
            chipsStack.addArrangedSubview(row)
        }
    }

    private func makeChip(for showtime: Showtime) -> UIButton {
        var configuration = UIButton.Configuration.bordered()
        configuration.baseBackgroundColor = Theme.Color.surface
        configuration.baseForegroundColor = Theme.Color.textPrimary
        configuration.background.strokeColor = Theme.Color.border
        configuration.background.strokeWidth = 1
        configuration.background.cornerRadius = Theme.Radius.sm
        configuration.contentInsets = NSDirectionalEdgeInsets(top: Theme.Spacing.md, leading: Theme.Spacing.sm, bottom: Theme.Spacing.md, trailing: Theme.Spacing.sm)
        configuration.attributedTitle = AttributedString(showtime.displayTime, attributes: AttributeContainer([.font: Theme.Font.subtitle]))

        let showtimeID = showtime.id
        let chip = UIButton(configuration: configuration, primaryAction: UIAction { [weak self] _ in
            self?.onSelectShowtime?(showtimeID)
        })
        chip.accessibilityLabel = "Showtime \(showtime.displayTime)"
        return chip
    }
}
