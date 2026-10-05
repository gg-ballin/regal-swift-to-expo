import UIKit

// RN: <SeatSummaryBar seatIds total canContinue onContinue />; bottom padding from useSafeAreaInsets().
final class SeatSummaryBar: UIView {
    // RN: callback prop.
    var onContinue: (() -> Void)?

    private let seatsLabel = UILabel()
    private let totalLabel = UILabel()
    private lazy var continueButton: UIButton = {
        var configuration = UIButton.Configuration.filled()
        configuration.baseBackgroundColor = Theme.Color.primary
        configuration.baseForegroundColor = Theme.Color.textOnPrimary
        configuration.cornerStyle = .capsule
        configuration.contentInsets = NSDirectionalEdgeInsets(top: Theme.Spacing.md, leading: Theme.Spacing.xl, bottom: Theme.Spacing.md, trailing: Theme.Spacing.xl)
        configuration.attributedTitle = AttributedString("Continue", attributes: AttributeContainer([.font: Theme.Font.subtitle]))
        let button = UIButton(configuration: configuration, primaryAction: UIAction { [weak self] _ in
            self?.onContinue?()
        })
        // RN: = <Pressable disabled={!canContinue} style={canContinue ? enabled : disabled}>.
        button.configurationUpdateHandler = { button in
            button.configuration?.baseBackgroundColor = button.isEnabled ? Theme.Color.primary : Theme.Color.surfaceElevated
            button.configuration?.baseForegroundColor = button.isEnabled ? Theme.Color.textOnPrimary : Theme.Color.textMuted
        }
        button.setContentHuggingPriority(.required, for: .horizontal)
        button.setContentCompressionResistancePriority(.required, for: .horizontal)
        return button
    }()

    override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = Theme.Color.tabBar

        let topBorder = UIView()
        topBorder.backgroundColor = Theme.Color.border

        seatsLabel.font = Theme.Font.body
        seatsLabel.textColor = Theme.Color.textSecondary
        seatsLabel.numberOfLines = 2

        totalLabel.font = Theme.Font.title
        totalLabel.textColor = Theme.Color.textPrimary

        let textStack = UIStackView(arrangedSubviews: [seatsLabel, totalLabel])
        textStack.axis = .vertical
        textStack.spacing = Theme.Spacing.xs

        let row = UIStackView(arrangedSubviews: [textStack, continueButton])
        row.alignment = .center
        row.spacing = Theme.Spacing.lg

        [topBorder, row].forEach {
            $0.translatesAutoresizingMaskIntoConstraints = false
            addSubview($0)
        }

        NSLayoutConstraint.activate([
            topBorder.topAnchor.constraint(equalTo: topAnchor),
            topBorder.leadingAnchor.constraint(equalTo: leadingAnchor),
            topBorder.trailingAnchor.constraint(equalTo: trailingAnchor),
            topBorder.heightAnchor.constraint(equalToConstant: 1),
            row.topAnchor.constraint(equalTo: topAnchor, constant: Theme.Spacing.lg),
            row.leadingAnchor.constraint(equalTo: leadingAnchor, constant: Theme.Spacing.lg),
            row.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -Theme.Spacing.lg),
            row.bottomAnchor.constraint(equalTo: safeAreaLayoutGuide.bottomAnchor, constant: -Theme.Spacing.md),
        ])
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    func configure(seatIDs: [String], total: String, canContinue: Bool) {
        if seatIDs.isEmpty {
            seatsLabel.text = "Select your seats"
        } else {
            let noun = seatIDs.count == 1 ? "Seat" : "Seats"
            seatsLabel.text = "\(seatIDs.count) \(noun) · \(seatIDs.joined(separator: ", "))"
        }
        totalLabel.text = total
        continueButton.isEnabled = canContinue
        accessibilityElements = [seatsLabel, totalLabel, continueButton]
    }
}
