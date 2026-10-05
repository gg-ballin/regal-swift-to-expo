import UIKit

// RN: = src/app/(tabs)/_layout.tsx (NativeTabs is the same UITabBarController under the hood).
@MainActor
final class AppCoordinator {
    // RN: one <NativeTabs.Trigger name="..."> per case; `symbol` = <NativeTabs.Trigger.Icon sf="..." />.
    private enum Tab: Int, CaseIterable {
        case theatres, movies, rewards, tickets, more

        var title: String {
            switch self {
            case .theatres: "Theatres"
            case .movies: "Movies"
            case .rewards: "Rewards"
            case .tickets: "Tickets"
            case .more: "More"
            }
        }

        var symbol: String {
            switch self {
            case .theatres: "mappin.and.ellipse"
            case .movies: "ticket.fill"
            case .rewards: "r.circle"
            case .tickets: "qrcode"
            case .more: "ellipsis"
            }
        }
    }

    private let window: UIWindow
    private let repository: any MovieRepository
    private let history: any TicketHistory
    private var ticketsCoordinator: TicketsCoordinator?
    private var ticketHistoryCoordinator: TicketHistoryCoordinator?

    init(window: UIWindow, repository: any MovieRepository, history: any TicketHistory) {
        self.window = window
        self.repository = repository
        self.history = history
    }

    func start() {
        Self.applyGlobalAppearance()

        let tabBarController = UITabBarController()
        tabBarController.viewControllers = Tab.allCases.map(makeRoot(for:))
        // RN: default tab = `unstable_settings = { initialRouteName: 'movies' }` exported from the tabs layout.
        tabBarController.selectedIndex = Tab.movies.rawValue

        window.rootViewController = tabBarController
        // RN: = "userInterfaceStyle": "dark" in app.json.
        window.overrideUserInterfaceStyle = .dark
        window.tintColor = Theme.Color.primary
        window.makeKeyAndVisible()
    }

    private func makeRoot(for tab: Tab) -> UIViewController {
        let root: UIViewController
        switch tab {
        case .movies:
            // RN: a stack inside a tab = src/app/(tabs)/movies/_layout.tsx exporting <Stack />.
            let navigationController = UINavigationController()
            let coordinator = TicketsCoordinator(navigationController: navigationController, repository: repository, history: history)
            coordinator.start()
            ticketsCoordinator = coordinator
            root = navigationController
        case .tickets:
            // RN: src/app/(tabs)/tickets/_layout.tsx exporting <Stack /> (header title "Tickets").
            let navigationController = UINavigationController()
            let coordinator = TicketHistoryCoordinator(navigationController: navigationController, history: history)
            coordinator.start()
            ticketHistoryCoordinator = coordinator
            root = navigationController
        case .theatres, .rewards, .more:
            root = UINavigationController(rootViewController: PlaceholderViewController(title: tab.title, symbol: tab.symbol))
        }
        root.tabBarItem = UITabBarItem(
            title: tab.title.uppercased(),
            image: UIImage(systemName: tab.symbol),
            tag: tab.rawValue
        )
        return root
    }

    // RN: NativeTabs props (backgroundColor, iconColor, labelStyle) + Stack `screenOptions` (headerStyle, headerTintColor).
    private static func applyGlobalAppearance() {
        let tabAppearance = UITabBarAppearance()
        tabAppearance.configureWithOpaqueBackground()
        tabAppearance.backgroundColor = Theme.Color.tabBar
        tabAppearance.shadowColor = Theme.Color.border
        for itemAppearance in [
            tabAppearance.stackedLayoutAppearance,
            tabAppearance.inlineLayoutAppearance,
            tabAppearance.compactInlineLayoutAppearance,
        ] {
            itemAppearance.normal.iconColor = Theme.Color.tabInactive
            itemAppearance.normal.titleTextAttributes = [
                .foregroundColor: Theme.Color.tabInactive,
                .font: Theme.Font.caption,
            ]
            itemAppearance.selected.iconColor = Theme.Color.tabActive
            itemAppearance.selected.titleTextAttributes = [
                .foregroundColor: Theme.Color.textPrimary,
                .font: Theme.Font.caption,
            ]
        }
        UITabBar.appearance().standardAppearance = tabAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabAppearance

        let navAppearance = UINavigationBarAppearance()
        navAppearance.configureWithOpaqueBackground()
        navAppearance.backgroundColor = Theme.Color.background
        navAppearance.shadowColor = .clear
        navAppearance.titleTextAttributes = [
            .foregroundColor: Theme.Color.textPrimary,
            .font: Theme.Font.subtitle,
        ]
        UINavigationBar.appearance().standardAppearance = navAppearance
        UINavigationBar.appearance().scrollEdgeAppearance = navAppearance
        UINavigationBar.appearance().compactAppearance = navAppearance
        UINavigationBar.appearance().tintColor = Theme.Color.textPrimary
    }
}
