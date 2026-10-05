import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/theme/navigation';

// SWIFT: AppCoordinator.makeRoot(for: .tickets) -> UINavigationController owned by TicketHistoryCoordinator.
export default function TicketsLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Tickets' }} />
    </Stack>
  );
}
