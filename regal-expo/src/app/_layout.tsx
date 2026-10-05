import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { stackScreenOptions } from '@/theme/navigation';
import { colors } from '@/theme/theme';

export const unstable_settings = {
  // Deep links into seats/ticket still get the tabs underneath as the back destination.
  // SWIFT: TicketsCoordinator always pushes onto the Movies UINavigationController, so MovieDetail is the stack root.
  anchor: '(tabs)',
};

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.textPrimary,
    border: colors.border,
  },
};

// SWIFT: SceneDelegate.scene(_:willConnectTo:) + AppCoordinator.start(): builds the UIWindow root once.
export default function RootLayout() {
  return (
    // SWIFT: window.overrideUserInterfaceStyle = .dark + window.tintColor = Theme.Color.primary.
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="light" />
      <Stack screenOptions={stackScreenOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
