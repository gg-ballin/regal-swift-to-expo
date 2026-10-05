import type { TextStyle } from 'react-native';

/** Mirrors regal-swift/Sources/Theme/Theme.swift 1:1. */
// SWIFT: no palette layer; Theme.Color uses `UIColor(hex: 0xRRGGBB)` (UIColor+Hex.swift) directly.
const palette = {
  orange300: '#FF8B3C',
  orange400: '#FF7825',
  orange500: '#F36404',
  orange600: '#D54B0A',
  orange700: '#DC4F00',
  black: '#000000',
  gray950: '#0A0A0C',
  gray900: '#181818',
  gray875: '#19191B',
  gray850: '#1A191E',
  gray800: '#2D2C31',
  gray700: '#404040',
  gray500: '#717078',
  gray400: '#97969E',
  gray300: '#A8A8A8',
  white: '#FFFFFF',
  brown900: '#3C2213',
  brown700: '#593B2B',
} as const;

// SWIFT: `enum Theme { enum Color { static let primary = UIColor(hex: 0xF36404) ... } }` (caseless enums as namespaces).
export const colors = {
  primary: palette.orange500,
  primaryPressed: palette.orange600,
  primaryGradient: [palette.orange700, palette.orange400] as const,
  orangeHighlight: palette.orange300,

  background: palette.black,
  backgroundDeep: palette.gray950,
  backgroundWarm: [palette.brown700, palette.brown900] as const,
  surface: palette.gray875,
  surfaceElevated: palette.gray800,
  pill: palette.gray850,
  border: palette.gray700,
  overlay: 'rgba(10, 10, 12, 0.92)',

  textPrimary: palette.white,
  textSecondary: palette.gray300,
  textMuted: palette.gray500,
  textOnPrimary: palette.white,

  tabBar: palette.gray900,
  tabActive: palette.orange500,
  tabInactive: palette.gray400,

  dateSelectedBackground: palette.white,
  dateSelectedText: palette.black,
  dateBackground: palette.gray875,

  seatAvailable: palette.gray700,
  seatTaken: palette.gray850,
  seatSelected: palette.orange500,
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

// SWIFT: Theme.Radius has no `pill`; capsules use UIButton.Configuration `cornerStyle = .capsule`.
export const radius = { sm: 6, md: 8, lg: 12, pill: 999 } as const;

// SWIFT: Theme.Font = `UIFont.systemFont(ofSize:weight:)`; '800' = .heavy, '700' = .bold, '600' = .semibold, '400' = .regular.
export const typography = {
  hero: { fontSize: 32, fontWeight: '800' },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '600' },
  tab: { fontSize: 15, fontWeight: '700' },
} as const satisfies Record<string, TextStyle>;

export const theme = { colors, spacing, radius, typography } as const;
export type Theme = typeof theme;
