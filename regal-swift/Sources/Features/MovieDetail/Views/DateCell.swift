import UIKit

/// Date card: small weekday header strip over the day number.
/// Selected = white body with the orange gradient header.
// RN: presentational <DateCard date selected onPress />. init = JSX tree built once; configure = props.
final class DateCell: UICollectionViewCell {
    private let headerView = GradientView(startPoint: CGPoint(x: 0.5, y: 0), endPoint: CGPoint(x: 0.5, y: 1))
    private let headerLabel = UILabel()
    private let dayLabel = UILabel()

    override init(frame: CGRect) {
        super.init(frame: frame)
        contentView.layer.cornerRadius = Theme.Radius.md
        contentView.layer.borderWidth = 1
        contentView.clipsToBounds = true
        isAccessibilityElement = true
        accessibilityTraits = .button

        headerLabel.font = Theme.Font.subtitle
        headerLabel.textAlignment = .center
        dayLabel.font = UIFont.systemFont(ofSize: 30, weight: .bold)
        dayLabel.textAlignment = .center

        [headerView, headerLabel, dayLabel].forEach {
            $0.translatesAutoresizingMaskIntoConstraints = false
            contentView.addSubview($0)
        }

        NSLayoutConstraint.activate([
            headerView.topAnchor.constraint(equalTo: contentView.topAnchor),
            headerView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            headerView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            headerView.heightAnchor.constraint(equalToConstant: 24),
            headerLabel.centerXAnchor.constraint(equalTo: headerView.centerXAnchor),
            headerLabel.centerYAnchor.constraint(equalTo: headerView.centerYAnchor),
            dayLabel.topAnchor.constraint(equalTo: headerView.bottomAnchor),
            dayLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            dayLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            dayLabel.bottomAnchor.constraint(equalTo: contentView.bottomAnchor),
        ])
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    // RN: imperative re-render; in React these assignments are derived from props inside the component body.
    func configure(date: Date, isSelected selected: Bool) {
        headerLabel.text = Formatters.weekdayShort(date)
        dayLabel.text = Formatters.dayOfMonth(date)

        headerView.colors = selected ? Theme.Color.primaryGradient.reversed() : [Theme.Color.background, Theme.Color.background]
        headerLabel.textColor = Theme.Color.textPrimary
        contentView.backgroundColor = selected ? Theme.Color.dateSelectedBackground : Theme.Color.dateBackground
        dayLabel.textColor = selected ? Theme.Color.dateSelectedText : Theme.Color.textPrimary
        contentView.layer.borderColor = (selected ? Theme.Color.primary : Theme.Color.border).cgColor

        accessibilityLabel = Formatters.longDate(date)
        accessibilityTraits = selected ? [.button, .selected] : .button
    }
}
