import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { ticketHistory, ticketHistoryRow } from '@/domain/ticket';
import { useBooking } from '@/store/booking';

/** Port of `TicketHistoryViewModel`: purchases from the persisted store, newest first. */
export function useTicketHistory() {
  const router = useRouter();
  // SWIFT: history.all() in reload() on viewWillAppear; here the selector re-renders whenever a purchase is added.
  const tickets = useBooking((s) => s.tickets);
  const rows = useMemo(() => ticketHistory(tickets).map(ticketHistoryRow), [tickets]);

  // SWIFT: viewModel.select(rowID:) -> onSelect -> TicketHistoryCoordinator.showTicket(_:).
  const open = useCallback(
    (ticketId: string) => router.push({ pathname: '/ticket/[ticketId]', params: { ticketId } }),
    [router],
  );

  return { rows, open };
}
