import UIKit

// RN: screen component src/app/(tabs)/tickets/index.tsx -> TicketsScreen (FlatList of TicketHistoryRow).
final class TicketHistoryViewController: UIViewController {
    private typealias DataSource = UICollectionViewDiffableDataSource<Int, String>

    private let viewModel: TicketHistoryViewModel
    private lazy var collectionView = UICollectionView(frame: .zero, collectionViewLayout: Self.makeLayout())
    private var dataSource: DataSource!
    private var rowsByID: [String: TicketHistoryViewModel.Row] = [:]
    private let emptyState = UIStackView()

    init(viewModel: TicketHistoryViewModel) {
        self.viewModel = viewModel
        super.init(nibName: nil, bundle: nil)
        title = "Tickets"
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = Theme.Color.background
        configureHierarchy()
        configureDataSource()

        viewModel.onChange = { [weak self] rows in
            self?.render(rows)
        }
    }

    // RN: not needed; the list subscribes to the store. Reload covers purchases made from the Movies tab.
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        viewModel.reload()
    }

    private func render(_ rows: [TicketHistoryViewModel.Row]) {
        rowsByID = Dictionary(rows.map { ($0.id, $0) }, uniquingKeysWith: { first, _ in first })
        var snapshot = NSDiffableDataSourceSnapshot<Int, String>()
        snapshot.appendSections([0])
        snapshot.appendItems(rows.map(\.id))
        dataSource.apply(snapshot, animatingDifferences: view.window != nil)
        emptyState.isHidden = !rows.isEmpty
    }

    private static func makeLayout() -> UICollectionViewLayout {
        var configuration = UICollectionLayoutListConfiguration(appearance: .plain)
        configuration.backgroundColor = .clear
        configuration.separatorConfiguration.color = Theme.Color.border
        return UICollectionViewCompositionalLayout.list(using: configuration)
    }

    private func configureDataSource() {
        let registration = UICollectionView.CellRegistration<TicketHistoryCell, String> { [weak self] cell, _, id in
            guard let row = self?.rowsByID[id] else { return }
            cell.configure(with: row, scale: max(cell.traitCollection.displayScale, 1))
        }
        dataSource = DataSource(collectionView: collectionView) { collectionView, indexPath, id in
            collectionView.dequeueConfiguredReusableCell(using: registration, for: indexPath, item: id)
        }
    }

    private func configureHierarchy() {
        collectionView.backgroundColor = .clear
        collectionView.delegate = self
        collectionView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(collectionView)

        let icon = UIImageView(image: UIImage(systemName: "qrcode"))
        icon.tintColor = Theme.Color.tabInactive
        icon.preferredSymbolConfiguration = UIImage.SymbolConfiguration(pointSize: 40, weight: .semibold)
        let label = UILabel()
        label.text = "Tickets you buy will appear here"
        label.font = Theme.Font.body
        label.textColor = Theme.Color.textSecondary
        label.numberOfLines = 0
        label.textAlignment = .center
        [icon, label].forEach(emptyState.addArrangedSubview)
        emptyState.axis = .vertical
        emptyState.alignment = .center
        emptyState.spacing = Theme.Spacing.md
        emptyState.isHidden = true
        emptyState.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(emptyState)

        NSLayoutConstraint.activate([
            collectionView.topAnchor.constraint(equalTo: view.topAnchor),
            collectionView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            collectionView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            collectionView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            emptyState.centerYAnchor.constraint(equalTo: view.safeAreaLayoutGuide.centerYAnchor),
            emptyState.leadingAnchor.constraint(equalTo: view.layoutMarginsGuide.leadingAnchor),
            emptyState.trailingAnchor.constraint(equalTo: view.layoutMarginsGuide.trailingAnchor),
        ])
    }
}

extension TicketHistoryViewController: UICollectionViewDelegate {
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        collectionView.deselectItem(at: indexPath, animated: true)
        guard let id = dataSource.itemIdentifier(for: indexPath) else { return }
        viewModel.select(rowID: id)
    }
}
