import UIKit

// RN: thin wrapper so SegmentedTabsControl can live in the list; in RN the tabs row renders <SegmentedTabs> directly.
final class TabsCell: UICollectionViewCell {
    var onSelect: ((Int) -> Void)?

    private let control = SegmentedTabsControl(titles: MovieDetailViewModel.Tab.allCases.map(\.title))

    override init(frame: CGRect) {
        super.init(frame: frame)
        contentView.backgroundColor = Theme.Color.background
        control.translatesAutoresizingMaskIntoConstraints = false
        control.addTarget(self, action: #selector(valueChanged), for: .valueChanged)
        contentView.addSubview(control)

        let divider = UIView()
        divider.backgroundColor = Theme.Color.border
        divider.translatesAutoresizingMaskIntoConstraints = false
        contentView.insertSubview(divider, belowSubview: control)

        NSLayoutConstraint.activate([
            control.topAnchor.constraint(equalTo: contentView.topAnchor),
            control.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: Theme.Spacing.lg),
            control.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -Theme.Spacing.lg),
            control.bottomAnchor.constraint(equalTo: contentView.bottomAnchor),
            divider.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            divider.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            divider.bottomAnchor.constraint(equalTo: contentView.bottomAnchor),
            divider.heightAnchor.constraint(equalToConstant: 1),
        ])
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    func configure(selectedIndex: Int) {
        if control.selectedIndex != selectedIndex {
            control.setSelectedIndex(selectedIndex, animated: false)
        }
    }

    @objc private func valueChanged() {
        onSelect?(control.selectedIndex)
    }
}
