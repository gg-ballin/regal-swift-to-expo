import UIKit

// RN: = src/app/_layout.tsx, the first UI code that runs; it mounts the root navigator once.
final class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?
    private var appCoordinator: AppCoordinator?

    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        guard let windowScene = scene as? UIWindowScene else { return }

        let window = UIWindow(windowScene: windowScene)
        // RN: dependency injection at the root = providers in _layout.tsx (QueryClientProvider + repository).
        // MMKVTicketHistory = the module-level MMKV instance behind the persisted Zustand store.
        let coordinator = AppCoordinator(
            window: window,
            repository: BundleMovieRepository(),
            history: MMKVTicketHistory()
        )
        coordinator.start()

        self.window = window
        appCoordinator = coordinator
    }
}
