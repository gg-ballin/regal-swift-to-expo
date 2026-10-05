import { colors, typography } from './theme';

/** Shared by the root stack and the stacks nested in tabs. */
// SWIFT: UINavigationBarAppearance (opaque background, shadowColor .clear, title font) via UINavigationBar.appearance().
export const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  headerTintColor: colors.textPrimary,
  headerTitleStyle: { ...typography.subtitle, color: colors.textPrimary },
  contentStyle: { backgroundColor: colors.background },
};
