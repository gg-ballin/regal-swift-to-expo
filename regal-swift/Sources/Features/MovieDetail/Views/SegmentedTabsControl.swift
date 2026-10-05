import UIKit

/// Regal-style text tabs with an orange underline under the selected item.
// RN: reusable primitive <SegmentedTabs titles selectedIndex onChange />; UIControl .valueChanged = the onChange prop.
final class SegmentedTabsControl: UIControl {
    private(set) var selectedIndex = 0
    private var buttons: [UIButton] = []
    private let stack = UIStackView()
    private let underline = UIView()
    private var underlineLeading: NSLayoutConstraint?
    private var underlineWidth: NSLayoutConstraint?

    init(titles: [String]) {
        super.init(frame: .zero)
        stack.spacing = Theme.Spacing.xl
        stack.alignment = .fill
        stack.translatesAutoresizingMaskIntoConstraints = false
        addSubview(stack)

        underline.backgroundColor = Theme.Color.primary
        underline.translatesAutoresizingMaskIntoConstraints = false
        addSubview(underline)

        buttons = titles.enumerated().map { index, title in
            var configuration = UIButton.Configuration.plain()
            configuration.contentInsets = NSDirectionalEdgeInsets(top: Theme.Spacing.md, leading: 0, bottom: Theme.Spacing.md, trailing: 0)
            configuration.attributedTitle = AttributedString(title, attributes: AttributeContainer([.font: Theme.Font.tab]))
            let button = UIButton(configuration: configuration)
            button.tag = index
            button.addTarget(self, action: #selector(didTap(_:)), for: .touchUpInside)
            button.accessibilityTraits.insert(.button)
            stack.addArrangedSubview(button)
            return button
        }

        NSLayoutConstraint.activate([
            stack.topAnchor.constraint(equalTo: topAnchor),
            stack.leadingAnchor.constraint(equalTo: leadingAnchor),
            stack.trailingAnchor.constraint(lessThanOrEqualTo: trailingAnchor),
            stack.bottomAnchor.constraint(equalTo: bottomAnchor),
            underline.heightAnchor.constraint(equalToConstant: 4),
            underline.bottomAnchor.constraint(equalTo: bottomAnchor),
        ])
        setSelectedIndex(0, animated: false)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    func setSelectedIndex(_ index: Int, animated: Bool) {
        guard buttons.indices.contains(index) else { return }
        selectedIndex = index
        for (buttonIndex, button) in buttons.enumerated() {
            let isSelected = buttonIndex == index
            button.configuration?.baseForegroundColor = isSelected ? Theme.Color.textPrimary : Theme.Color.textSecondary
            if isSelected {
                button.accessibilityTraits.insert(.selected)
            } else {
                button.accessibilityTraits.remove(.selected)
            }
        }

        underlineLeading?.isActive = false
        underlineWidth?.isActive = false
        let target = buttons[index]
        underlineLeading = underline.leadingAnchor.constraint(equalTo: target.leadingAnchor)
        underlineWidth = underline.widthAnchor.constraint(equalTo: target.widthAnchor)
        underlineLeading?.isActive = true
        underlineWidth?.isActive = true

        if animated {
            // RN: Reanimated `withTiming(x, { duration: 250 })` on a shared value (runs on the UI thread).
            UIView.animate(withDuration: 0.25, delay: 0, options: .curveEaseInOut) { self.layoutIfNeeded() }
        }
    }

    @objc private func didTap(_ sender: UIButton) {
        guard sender.tag != selectedIndex else { return }
        setSelectedIndex(sender.tag, animated: true)
        sendActions(for: .valueChanged)
    }
}
