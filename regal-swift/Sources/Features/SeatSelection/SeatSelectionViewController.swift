import UIKit

private enum SeatGridItem: Hashable, Sendable {
    case rowLabel(row: String, trailing: Bool)
    case seat(String)
    case gap(row: String, column: Int)
}

// RN: screen component src/app/seats/[showtimeId].tsx. Pushed on the root stack, so it covers the tab bar.
final class SeatSelectionViewController: UIViewController {
    private typealias Item = SeatGridItem
    private typealias DataSource = UICollectionViewDiffableDataSource<String, Item>

    private let viewModel: SeatSelectionViewModel
    private let haptics: HapticsEngine

    private let infoLabel = UILabel()
    private let screenIndicator = ScreenIndicatorView()
    private let legend = SeatLegendView()
    private let summaryBar = SeatSummaryBar()
    private let spinner = UIActivityIndicatorView(style: .large)
    private lazy var collectionView = UICollectionView(frame: .zero, collectionViewLayout: makeLayout())
    private var dataSource: DataSource!

    /// seatID -> (seat, row label), rebuilt when the seat map changes.
    private var seatIndex: [String: (seat: Seat, row: String)] = [:]
    private var renderedSeatMap: SeatMap?
    private var renderedSelection: Set<String> = []

    init(viewModel: SeatSelectionViewModel, haptics: HapticsEngine) {
        self.viewModel = viewModel
        self.haptics = haptics
        super.init(nibName: nil, bundle: nil)
        // RN: Stack.Screen options { title: 'Select Seats', headerBackButtonDisplayMode: 'minimal' }.
        title = "Select Seats"
        hidesBottomBarWhenPushed = true
        navigationItem.backButtonDisplayMode = .minimal
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = Theme.Color.background
        configureHierarchy()
        configureDataSource()

        summaryBar.onContinue = { [weak self] in
            self?.viewModel.checkout()
        }
        viewModel.onChange = { [weak self] state in
            self?.render(state)
        }
        render(viewModel.state)
        Task { await viewModel.load() }
    }

    // MARK: - Setup

    private func configureHierarchy() {
        let selection = viewModel.selection
        infoLabel.text = [
            selection.theatre.name,
            selection.format.name,
            "\(Formatters.longDate(selection.date)) · \(selection.showtime.displayTime)",
        ].joined(separator: "\n")
        infoLabel.font = Theme.Font.body
        infoLabel.textColor = Theme.Color.textSecondary
        infoLabel.numberOfLines = 0
        infoLabel.textAlignment = .center

        collectionView.backgroundColor = .clear
        collectionView.delegate = self
        collectionView.alwaysBounceVertical = false

        spinner.color = Theme.Color.primary
        spinner.hidesWhenStopped = true

        [infoLabel, screenIndicator, legend, collectionView, summaryBar, spinner].forEach {
            $0.translatesAutoresizingMaskIntoConstraints = false
            view.addSubview($0)
        }

        let guide = view.safeAreaLayoutGuide
        NSLayoutConstraint.activate([
            infoLabel.topAnchor.constraint(equalTo: guide.topAnchor, constant: Theme.Spacing.md),
            infoLabel.leadingAnchor.constraint(equalTo: guide.leadingAnchor, constant: Theme.Spacing.lg),
            infoLabel.trailingAnchor.constraint(equalTo: guide.trailingAnchor, constant: -Theme.Spacing.lg),

            screenIndicator.topAnchor.constraint(equalTo: infoLabel.bottomAnchor, constant: Theme.Spacing.lg),
            screenIndicator.leadingAnchor.constraint(equalTo: guide.leadingAnchor, constant: Theme.Spacing.lg),
            screenIndicator.trailingAnchor.constraint(equalTo: guide.trailingAnchor, constant: -Theme.Spacing.lg),

            collectionView.topAnchor.constraint(equalTo: screenIndicator.bottomAnchor, constant: Theme.Spacing.lg),
            collectionView.leadingAnchor.constraint(equalTo: guide.leadingAnchor, constant: Theme.Spacing.sm),
            collectionView.trailingAnchor.constraint(equalTo: guide.trailingAnchor, constant: -Theme.Spacing.sm),
            collectionView.bottomAnchor.constraint(equalTo: legend.topAnchor, constant: -Theme.Spacing.md),

            legend.leadingAnchor.constraint(equalTo: guide.leadingAnchor, constant: Theme.Spacing.lg),
            legend.trailingAnchor.constraint(equalTo: guide.trailingAnchor, constant: -Theme.Spacing.lg),
            legend.bottomAnchor.constraint(equalTo: summaryBar.topAnchor, constant: -Theme.Spacing.lg),

            summaryBar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            summaryBar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            summaryBar.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            spinner.centerXAnchor.constraint(equalTo: collectionView.centerXAnchor),
            spinner.centerYAnchor.constraint(equalTo: collectionView.centerYAnchor),
        ])
    }

    // RN: no virtualization for ~160 seats; cell size = useWindowDimensions().width / (columns + 2).
    private func makeLayout() -> UICollectionViewCompositionalLayout {
        UICollectionViewCompositionalLayout { [weak self] _, _ in
            guard let columns = self?.viewModel.state.seatMap?.columns else { return nil }
            // Grid columns plus a row label on each side.
            let fraction = 1 / CGFloat(columns + 2)
            let item = NSCollectionLayoutItem(
                layoutSize: NSCollectionLayoutSize(widthDimension: .fractionalWidth(fraction), heightDimension: .fractionalHeight(1))
            )
            let group = NSCollectionLayoutGroup.horizontal(
                layoutSize: NSCollectionLayoutSize(widthDimension: .fractionalWidth(1), heightDimension: .fractionalWidth(fraction)),
                subitems: [item]
            )
            return NSCollectionLayoutSection(group: group)
        }
    }

    private func configureDataSource() {
        let seatRegistration = UICollectionView.CellRegistration<SeatCell, Item> { [weak self] cell, _, item in
            guard let self, case .seat(let seatID) = item, let entry = self.seatIndex[seatID] else { return }
            cell.configure(seat: entry.seat, rowLabel: entry.row, appearance: self.appearance(for: entry.seat))
        }
        let rowLabelRegistration = UICollectionView.CellRegistration<RowLabelCell, Item> { cell, _, item in
            guard case .rowLabel(let row, _) = item else { return }
            cell.configure(text: row)
        }
        let gapRegistration = UICollectionView.CellRegistration<UICollectionViewCell, Item> { cell, _, _ in
            cell.isAccessibilityElement = false
        }

        dataSource = DataSource(collectionView: collectionView) { collectionView, indexPath, item in
            switch item {
            case .seat:
                collectionView.dequeueConfiguredReusableCell(using: seatRegistration, for: indexPath, item: item)
            case .rowLabel:
                collectionView.dequeueConfiguredReusableCell(using: rowLabelRegistration, for: indexPath, item: item)
            case .gap:
                collectionView.dequeueConfiguredReusableCell(using: gapRegistration, for: indexPath, item: item)
            }
        }
    }

    // MARK: - Rendering

    private func render(_ state: SeatSelectionViewModel.State) {
        if state.isLoading { spinner.startAnimating() } else { spinner.stopAnimating() }

        summaryBar.configure(seatIDs: state.selectedSeatIDs, total: viewModel.formattedTotal, canContinue: state.canCheckout)

        if let message = state.errorMessage {
            presentError(message)
        }

        guard let seatMap = state.seatMap else { return }
        let selection = Set(state.selectedSeatIDs)

        if seatMap != renderedSeatMap {
            renderedSeatMap = seatMap
            renderedSelection = selection
            applyFullSnapshot(for: seatMap)
            return
        }

        let changed = selection.symmetricDifference(renderedSelection)
        renderedSelection = selection
        guard !changed.isEmpty else { return }
        var snapshot = dataSource.snapshot()
        // RN: = per-cell Zustand selector `useBooking(s => s.selected.includes(id))`, so only toggled cells re-render.
        snapshot.reconfigureItems(changed.map(Item.seat))
        dataSource.apply(snapshot, animatingDifferences: false)
    }

    private func applyFullSnapshot(for seatMap: SeatMap) {
        seatIndex = [:]
        var snapshot = NSDiffableDataSourceSnapshot<String, Item>()
        for row in seatMap.rows {
            snapshot.appendSections([row.label])
            let byColumn = Dictionary(row.seats.map { ($0.column, $0) }, uniquingKeysWith: { first, _ in first })
            var items: [Item] = [.rowLabel(row: row.label, trailing: false)]
            for column in 0..<seatMap.columns {
                if let seat = byColumn[column] {
                    seatIndex[seat.id] = (seat, row.label)
                    items.append(.seat(seat.id))
                } else {
                    items.append(.gap(row: row.label, column: column))
                }
            }
            items.append(.rowLabel(row: row.label, trailing: true))
            snapshot.appendItems(items, toSection: row.label)
        }
        collectionView.collectionViewLayout.invalidateLayout()
        dataSource.apply(snapshot, animatingDifferences: false)
    }

    private func appearance(for seat: Seat) -> SeatCell.Appearance {
        if seat.state == .taken { return .taken }
        return viewModel.isSelected(seat.id) ? .selected : .available
    }

    // RN: Alert.alert(title, message, [{ text: 'Retry', onPress: refetch }, { text: 'Cancel', style: 'cancel' }]).
    private func presentError(_ message: String) {
        guard presentedViewController == nil else { return }
        let alert = UIAlertController(title: "Seat map unavailable", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Retry", style: .default) { [weak self] _ in
            guard let self else { return }
            Task { await self.viewModel.load() }
        })
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(alert, animated: true)
    }

    private func announceMaxReached() {
        let message = "You can select up to \(viewModel.maxSeats) seats."
        // RN: AccessibilityInfo.announceForAccessibility(message).
        UIAccessibility.post(notification: .announcement, argument: message)
        let alert = UIAlertController(title: "Seat limit reached", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}

extension SeatSelectionViewController: UICollectionViewDelegate {
    func collectionView(_ collectionView: UICollectionView, shouldSelectItemAt indexPath: IndexPath) -> Bool {
        guard case .seat(let seatID) = dataSource.itemIdentifier(for: indexPath) else { return false }
        return seatIndex[seatID]?.seat.state == .available
    }

    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        collectionView.deselectItem(at: indexPath, animated: false)
        guard case .seat(let seatID) = dataSource.itemIdentifier(for: indexPath) else { return }

        switch viewModel.toggle(seatID: seatID) {
        case .selected, .deselected:
            // RN: Haptics.selectionAsync() from expo-haptics (wraps UISelectionFeedbackGenerator).
            haptics.selection()
        case .rejected(.maxReached):
            haptics.warning()
            announceMaxReached()
        case .rejected(.unavailable):
            break
        }
    }
}
