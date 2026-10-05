import UIKit

// RN: mirrored 1:1 in regal-expo/src/theme/theme.ts (colors, spacing, radius, typography).
enum Theme {
    enum Color {
        static let primary = UIColor(hex: 0xF36404)
        static let primaryPressed = UIColor(hex: 0xD54B0A)
        static let primaryGradient = [UIColor(hex: 0xDC4F00), UIColor(hex: 0xFF7825)]
        static let orangeHighlight = UIColor(hex: 0xFF8B3C)

        static let background = UIColor(hex: 0x000000)
        static let backgroundDeep = UIColor(hex: 0x0A0A0C)
        static let backgroundWarm = [UIColor(hex: 0x593B2B), UIColor(hex: 0x3C2213)]
        static let surface = UIColor(hex: 0x19191B)
        static let surfaceElevated = UIColor(hex: 0x2D2C31)
        static let pill = UIColor(hex: 0x1A191E)
        static let border = UIColor(hex: 0x404040)
        static let overlay = UIColor(hex: 0x0A0A0C, alpha: 0.92)

        static let textPrimary = UIColor.white
        static let textSecondary = UIColor(hex: 0xA8A8A8)
        static let textMuted = UIColor(hex: 0x717078)
        static let textOnPrimary = UIColor.white

        static let tabBar = UIColor(hex: 0x181818)
        static let tabActive = primary
        static let tabInactive = UIColor(hex: 0x97969E)

        static let dateSelectedBackground = UIColor.white
        static let dateSelectedText = UIColor.black
        static let dateBackground = UIColor(hex: 0x19191B)

        static let seatAvailable = UIColor(hex: 0x404040)
        static let seatTaken = UIColor(hex: 0x1A191E)
        static let seatSelected = primary
    }

    enum Spacing {
        static let xs: CGFloat = 4, sm: CGFloat = 8, md: CGFloat = 12, lg: CGFloat = 16, xl: CGFloat = 24, xxl: CGFloat = 32
    }

    enum Radius {
        static let sm: CGFloat = 6, md: CGFloat = 8, lg: CGFloat = 12
    }

    enum Font {
        static let hero = UIFont.systemFont(ofSize: 32, weight: .heavy)
        static let title = UIFont.systemFont(ofSize: 22, weight: .bold)
        static let subtitle = UIFont.systemFont(ofSize: 17, weight: .semibold)
        static let body = UIFont.systemFont(ofSize: 15, weight: .regular)
        static let caption = UIFont.systemFont(ofSize: 12, weight: .semibold)
        static let tab = UIFont.systemFont(ofSize: 15, weight: .bold)
    }
}
