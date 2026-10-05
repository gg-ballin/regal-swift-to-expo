import UIKit

// RN: process entry point. Expo equivalent: "main": "expo-router/entry" in package.json (Expo generates its own AppDelegate on prebuild).
@main
final class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        true
    }

    // RN: picks the SceneDelegate declared in Info.plist (generated from project.yml) = expo-router resolving src/app/_layout.tsx.
    func application(
        _ application: UIApplication,
        configurationForConnecting connectingSceneSession: UISceneSession,
        options: UIScene.ConnectionOptions
    ) -> UISceneConfiguration {
        UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }
}
