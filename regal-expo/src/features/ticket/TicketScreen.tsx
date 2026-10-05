import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme/theme';

import { TicketCard } from './components/TicketCard';
import { useTicket } from './useTicket';
import { useTicketScreenProtection } from './useTicketScreenProtection';

/** Port of `TicketViewController`. */
// SWIFT: UIViewController; TicketViewModel(ticket:) is injected by TicketsCoordinator.showTicket(_:) instead of read from a route param.
export function TicketScreen() {
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const router = useRouter();
  const ticket = useTicket(ticketId);
  const isAlertVisible = useRef(false);

  // RN Alert has no "is presenting" query, so the screen tracks its own (= `presentedViewController == nil`).
  // SWIFT: presentScreenshotWarning(): UIAlertController(.alert) with a single "OK" action.
  const warnScreenshot = useCallback(() => {
    if (isAlertVisible.current) return;
    isAlertVisible.current = true;
    const dismiss = () => {
      isAlertVisible.current = false;
    };
    Alert.alert(
      'Screenshot detected',
      'Screenshots of your ticket may not be accepted at the door. Please show this screen instead.',
      [{ text: 'OK', onPress: dismiss }],
      { onDismiss: dismiss },
    );
  }, []);

  const { isCaptured } = useTicketScreenProtection(warnScreenshot);

  return (
    <>
      {/* SWIFT: navigationItem.rightBarButtonItem = UIBarButtonItem(systemItem: .done) -> onDone -> popToRootViewController.
          dismissAll() pops to (tabs), keeping whichever tab opened the ticket (Movies after checkout, Tickets from history). */}
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          variant="done"
          icon="checkmark"
          tintColor={colors.primary}
          accessibilityLabel="Done"
          onPress={() => router.dismissAll()}
        />
      </Stack.Toolbar>

      {ticket ? (
        // SWIFT: UIScrollView (alwaysBounceVertical) with the card pinned to contentLayoutGuide / frameLayoutGuide.
        <ScrollView style={styles.container} contentContainerStyle={styles.content} alwaysBounceVertical>
          <TicketCard ticket={ticket} isCaptured={isCaptured} />
        </ScrollView>
      ) : (
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { alignItems: 'center', justifyContent: 'center' },
  content: { paddingTop: spacing.lg, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
});
