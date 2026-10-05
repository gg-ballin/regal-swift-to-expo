import UIKit

// RN: shared <Placeholder title symbol /> rendered by src/app/(tabs)/{theatres,rewards,more}.tsx.
final class PlaceholderViewController: UIViewController {
    private let symbol: String

    init(title: String, symbol: String) {
        self.symbol = symbol
        super.init(nibName: nil, bundle: nil)
        self.title = title
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = Theme.Color.background

        let icon = UIImageView(image: UIImage(systemName: symbol))
        icon.tintColor = Theme.Color.tabInactive
        icon.preferredSymbolConfiguration = UIImage.SymbolConfiguration(pointSize: 40, weight: .semibold)

        let label = UILabel()
        label.text = "\(title ?? "") is out of scope for this POC"
        label.font = Theme.Font.body
        label.textColor = Theme.Color.textSecondary
        label.numberOfLines = 0
        label.textAlignment = .center

        let stack = UIStackView(arrangedSubviews: [icon, label])
        stack.axis = .vertical
        stack.alignment = .center
        stack.spacing = Theme.Spacing.md
        stack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stack)

        NSLayoutConstraint.activate([
            stack.centerYAnchor.constraint(equalTo: view.safeAreaLayoutGuide.centerYAnchor),
            stack.leadingAnchor.constraint(equalTo: view.layoutMarginsGuide.leadingAnchor),
            stack.trailingAnchor.constraint(equalTo: view.layoutMarginsGuide.trailingAnchor),
        ])
    }
}
