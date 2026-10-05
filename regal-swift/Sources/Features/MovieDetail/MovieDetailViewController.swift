import UIKit

// RN: Section + Item enums = a discriminated union of FlashList rows; Hashable identity = keyExtractor, case = getItemType.
private enum MovieDetailSection: Hashable, Sendable {
    case tabs
    case dates
    case theatre(String)
    case details
}

private enum MovieDetailItem: Hashable, Sendable {
    case tabs
    case date(Int)
    case format(theatreID: String, formatID: String)
    case details
}

// RN: container/screen component = src/app/(tabs)/movies/index.tsx; everything in Views/ is presentational.
final class MovieDetailViewController: UIViewController {
    private typealias Section = MovieDetailSection
    private typealias Item = MovieDetailItem
    private typealias DataSource = UICollectionViewDiffableDataSource<Section, Item>

    private let viewModel: MovieDetailViewModel
    private lazy var collectionView = UICollectionView(frame: .zero, collectionViewLayout: makeLayout())
    private var dataSource: DataSource!
    private var hasRendered = false

    init(viewModel: MovieDetailViewModel) {
        self.viewModel = viewModel
        super.init(nibName: nil, bundle: nil)
        title = "Movies"
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    // RN: = first render + mount effect. `onChange -> render` is what React does automatically on state change.
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = Theme.Color.background
        configureCollectionView()
        configureDataSource()

        viewModel.onChange = { [weak self] state in
            self?.render(state)
        }
        render(viewModel.state)
        // RN: useQuery fetches on mount; no explicit call.
        Task { await viewModel.load() }
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        // RN: = <Stack.Screen options={{ headerShown: false }} /> (static, no show/hide on focus).
        navigationController?.setNavigationBarHidden(true, animated: animated)
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        navigationController?.setNavigationBarHidden(false, animated: animated)
    }

    // RN: = SafeAreaProvider re-rendering consumers of useSafeAreaInsets(). The movie can load before the view is in a window (inset 0).
    override func viewSafeAreaInsetsDidChange() {
        super.viewSafeAreaInsetsDidChange()
        guard dataSource != nil else { return }
        var snapshot = dataSource.snapshot()
        guard snapshot.sectionIdentifiers.contains(.tabs) else { return }
        snapshot.reloadSections([.tabs])
        dataSource.apply(snapshot, animatingDifferences: false)
    }

    // MARK: - Setup

    // RN: Auto Layout anchors = flexbox styles; pinning to edges = { flex: 1 }.
    private func configureCollectionView() {
        collectionView.backgroundColor = Theme.Color.background
        collectionView.contentInsetAdjustmentBehavior = .never
        collectionView.delegate = self
        collectionView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(collectionView)

        NSLayoutConstraint.activate([
            collectionView.topAnchor.constraint(equalTo: view.topAnchor),
            collectionView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            collectionView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            collectionView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),
        ])
    }

    // RN: compositional layout = per-row styles in renderItem; no layout object in FlashList.
    private func makeLayout() -> UICollectionViewCompositionalLayout {
        UICollectionViewCompositionalLayout { [weak self] sectionIndex, _ in
            guard let self, let section = self.dataSource?.sectionIdentifier(for: sectionIndex) else { return nil }
            switch section {
            case .tabs: return Self.tabsSection()
            case .dates: return Self.datesSection()
            case .theatre: return Self.theatreSection()
            case .details: return Self.detailsSection()
            }
        }
    }

    private static func tabsSection() -> NSCollectionLayoutSection {
        let size = NSCollectionLayoutSize(widthDimension: .fractionalWidth(1), heightDimension: .estimated(48))
        let group = NSCollectionLayoutGroup.vertical(layoutSize: size, subitems: [NSCollectionLayoutItem(layoutSize: size)])
        let section = NSCollectionLayoutSection(group: group)
        let hero = NSCollectionLayoutBoundarySupplementaryItem(
            layoutSize: NSCollectionLayoutSize(widthDimension: .fractionalWidth(1), heightDimension: .estimated(260)),
            elementKind: HeroHeaderView.elementKind,
            alignment: .top
        )
        section.boundarySupplementaryItems = [hero]
        return section
    }

    private static func datesSection() -> NSCollectionLayoutSection {
        let size = NSCollectionLayoutSize(widthDimension: .absolute(64), heightDimension: .absolute(72))
        let group = NSCollectionLayoutGroup.horizontal(layoutSize: size, subitems: [NSCollectionLayoutItem(layoutSize: size)])
        let section = NSCollectionLayoutSection(group: group)
        // RN: orthogonal section = a horizontal FlatList/ScrollView rendered as one row of the vertical list.
        section.orthogonalScrollingBehavior = .continuous
        section.interGroupSpacing = Theme.Spacing.sm
        section.contentInsets = NSDirectionalEdgeInsets(top: Theme.Spacing.xl, leading: Theme.Spacing.lg, bottom: Theme.Spacing.xl, trailing: Theme.Spacing.lg)
        return section
    }

    private static func theatreSection() -> NSCollectionLayoutSection {
        let size = NSCollectionLayoutSize(widthDimension: .fractionalWidth(1), heightDimension: .estimated(220))
        let group = NSCollectionLayoutGroup.vertical(layoutSize: size, subitems: [NSCollectionLayoutItem(layoutSize: size)])
        let section = NSCollectionLayoutSection(group: group)
        section.interGroupSpacing = Theme.Spacing.md
        section.contentInsets = NSDirectionalEdgeInsets(top: Theme.Spacing.md, leading: Theme.Spacing.lg, bottom: Theme.Spacing.xl, trailing: Theme.Spacing.lg)
        let header = NSCollectionLayoutBoundarySupplementaryItem(
            layoutSize: NSCollectionLayoutSize(widthDimension: .fractionalWidth(1), heightDimension: .estimated(88)),
            elementKind: UICollectionView.elementKindSectionHeader,
            alignment: .top
        )
        header.contentInsets = NSDirectionalEdgeInsets(top: 0, leading: -Theme.Spacing.lg, bottom: 0, trailing: -Theme.Spacing.lg)
        section.boundarySupplementaryItems = [header]
        return section
    }

    private static func detailsSection() -> NSCollectionLayoutSection {
        let size = NSCollectionLayoutSize(widthDimension: .fractionalWidth(1), heightDimension: .estimated(300))
        let group = NSCollectionLayoutGroup.vertical(layoutSize: size, subitems: [NSCollectionLayoutItem(layoutSize: size)])
        return NSCollectionLayoutSection(group: group)
    }

    // RN: cell registrations + provider = `renderItem={({ item }) => switch (item.type) ...}`; closures passed in = callback props.
    private func configureDataSource() {
        let tabsRegistration = UICollectionView.CellRegistration<TabsCell, Item> { [weak self] cell, _, _ in
            guard let self else { return }
            cell.configure(selectedIndex: self.viewModel.state.selectedTab.rawValue)
            cell.onSelect = { [weak self] index in
                guard let tab = MovieDetailViewModel.Tab(rawValue: index) else { return }
                self?.viewModel.selectTab(tab)
            }
        }

        let dateRegistration = UICollectionView.CellRegistration<DateCell, Item> { [weak self] cell, _, item in
            guard let self, case .date(let index) = item else { return }
            let state = self.viewModel.state
            cell.configure(date: state.dates[index], isSelected: index == state.selectedDateIndex)
        }

        let formatRegistration = UICollectionView.CellRegistration<FormatCell, Item> { [weak self] cell, _, item in
            guard
                let self,
                case .format(let theatreID, let formatID) = item,
                let format = self.theatre(withID: theatreID)?.formats.first(where: { $0.id == formatID })
            else { return }
            cell.configure(with: format)
            cell.onSelectShowtime = { [weak self] showtimeID in
                self?.viewModel.selectShowtime(theatreID: theatreID, formatID: formatID, showtimeID: showtimeID)
            }
        }

        let detailsRegistration = UICollectionView.CellRegistration<DetailsCell, Item> { [weak self] cell, _, _ in
            guard let movie = self?.viewModel.state.movie else { return }
            cell.configure(with: movie)
        }

        let heroRegistration = UICollectionView.SupplementaryRegistration<HeroHeaderView>(
            elementKind: HeroHeaderView.elementKind
        ) { [weak self] view, _, _ in
            guard let self, let movie = self.viewModel.state.movie else { return }
            view.configure(with: movie, topInset: self.view.safeAreaInsets.top)
        }

        let theatreHeaderRegistration = UICollectionView.SupplementaryRegistration<TheatreHeaderView>(
            elementKind: UICollectionView.elementKindSectionHeader
        ) { [weak self] view, _, indexPath in
            guard
                let self,
                case .theatre(let theatreID) = self.dataSource.sectionIdentifier(for: indexPath.section),
                let theatre = self.theatre(withID: theatreID)
            else { return }
            view.configure(with: theatre)
        }

        dataSource = DataSource(collectionView: collectionView) { collectionView, indexPath, item in
            switch item {
            case .tabs:
                collectionView.dequeueConfiguredReusableCell(using: tabsRegistration, for: indexPath, item: item)
            case .date:
                collectionView.dequeueConfiguredReusableCell(using: dateRegistration, for: indexPath, item: item)
            case .format:
                collectionView.dequeueConfiguredReusableCell(using: formatRegistration, for: indexPath, item: item)
            case .details:
                collectionView.dequeueConfiguredReusableCell(using: detailsRegistration, for: indexPath, item: item)
            }
        }

        dataSource.supplementaryViewProvider = { collectionView, kind, indexPath in
            if kind == HeroHeaderView.elementKind {
                return collectionView.dequeueConfiguredReusableSupplementary(using: heroRegistration, for: indexPath)
            }
            return collectionView.dequeueConfiguredReusableSupplementary(using: theatreHeaderRegistration, for: indexPath)
        }
    }

    // MARK: - Rendering

    // RN: building the snapshot = `const items = useMemo(() => buildRows(state), [state])` passed as FlashList `data`.
    private func render(_ state: MovieDetailViewModel.State) {
        renderBackground(for: state)

        var snapshot = NSDiffableDataSourceSnapshot<Section, Item>()
        if state.movie != nil {
            snapshot.appendSections([.tabs])
            snapshot.appendItems([.tabs], toSection: .tabs)

            switch state.selectedTab {
            case .showtimes:
                snapshot.appendSections([.dates])
                snapshot.appendItems(state.dates.indices.map(Item.date), toSection: .dates)
                for theatre in state.theatres {
                    let section = Section.theatre(theatre.id)
                    snapshot.appendSections([section])
                    snapshot.appendItems(
                        theatre.formats.map { Item.format(theatreID: theatre.id, formatID: $0.id) },
                        toSection: section
                    )
                }
            case .details:
                snapshot.appendSections([.details])
                snapshot.appendItems([.details], toSection: .details)
            }
        }

        // Items whose identity is stable but whose appearance depends on selection state.
        let existing = Set(dataSource.snapshot().itemIdentifiers)
        let stateful = snapshot.itemIdentifiers.filter { item in
            guard existing.contains(item) else { return false }
            switch item {
            case .tabs, .date: return true
            case .format, .details: return false
            }
        }
        // RN: = React.memo rows whose props changed re-render; stable keys keep the rest untouched.
        snapshot.reconfigureItems(stateful)

        dataSource.apply(snapshot, animatingDifferences: hasRendered)
        hasRendered = hasRendered || state.movie != nil
    }

    // RN: = early return `if (isPending) return <ActivityIndicator />; if (error) return <ErrorState onRetry={refetch} />`.
    private func renderBackground(for state: MovieDetailViewModel.State) {
        if state.isLoading && state.movie == nil {
            let spinner = UIActivityIndicatorView(style: .large)
            spinner.color = Theme.Color.primary
            spinner.startAnimating()
            collectionView.backgroundView = spinner
        } else if let message = state.errorMessage, state.movie == nil {
            collectionView.backgroundView = makeErrorView(message: message)
        } else {
            collectionView.backgroundView = nil
        }
    }

    private func makeErrorView(message: String) -> UIView {
        let label = UILabel()
        label.text = message
        label.textColor = Theme.Color.textSecondary
        label.font = Theme.Font.body
        label.numberOfLines = 0
        label.textAlignment = .center

        var configuration = UIButton.Configuration.filled()
        configuration.baseBackgroundColor = Theme.Color.primary
        configuration.title = "Retry"
        let retry = UIButton(configuration: configuration, primaryAction: UIAction { [weak self] _ in
            guard let self else { return }
            Task { await self.viewModel.load() }
        })

        let stack = UIStackView(arrangedSubviews: [label, retry])
        stack.axis = .vertical
        stack.alignment = .center
        stack.spacing = Theme.Spacing.lg
        stack.translatesAutoresizingMaskIntoConstraints = false

        let container = UIView()
        container.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.centerYAnchor.constraint(equalTo: container.centerYAnchor),
            stack.leadingAnchor.constraint(equalTo: container.leadingAnchor, constant: Theme.Spacing.xl),
            stack.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -Theme.Spacing.xl),
        ])
        return container
    }

    private func theatre(withID id: String) -> Theatre? {
        viewModel.state.theatres.first { $0.id == id }
    }
}

// RN: delegate tap callbacks = <Pressable onPress> inside each row component.
extension MovieDetailViewController: UICollectionViewDelegate {
    func collectionView(_ collectionView: UICollectionView, shouldHighlightItemAt indexPath: IndexPath) -> Bool {
        if case .date = dataSource.itemIdentifier(for: indexPath) { return true }
        return false
    }

    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        collectionView.deselectItem(at: indexPath, animated: false)
        guard case .date(let index) = dataSource.itemIdentifier(for: indexPath) else { return }
        viewModel.selectDate(at: index)
    }
}
