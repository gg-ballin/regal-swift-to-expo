import { randomUUID } from 'expo-crypto';
import { useMemo, useState } from 'react';

import { useMovieQuery, useSeatMapQuery, useShowtimesQuery } from '@/data/queries';
import type { Ticket } from '@/domain/booking';
import { buildTicket } from '@/domain/seatSelection';
import { useBooking } from '@/store/booking';

export const DEMO_TICKET_ID = 'demo';
const DEMO_SEATS = ['F6', 'F7'];

/** Issued tickets come from the store; `ticket/demo` (dev only) mirrors the Swift `-demoRoute ticket`. */
// SWIFT: not needed; `let ticket: Ticket` is a stored property set in TicketViewModel.init(ticket:).
export function useTicket(ticketId: string): Ticket | null {
  const stored = useBooking((s) => s.tickets[ticketId]);
  const demo = useDemoTicket(__DEV__ && !stored && ticketId === DEMO_TICKET_ID);
  return stored ?? demo;
}

// SWIFT: TicketsCoordinator.openDemoRouteIfRequested() building `Ticket(id: UUID().uuidString, seatIDs: ["F6", "F7"], ...)` under #if DEBUG.
function useDemoTicket(enabled: boolean): Ticket | null {
  const [id] = useState(randomUUID);
  const [date] = useState(() => new Date());
  const movie = useMovieQuery().data;
  const theatre = useShowtimesQuery().data?.theatres[0];
  const format = theatre?.formats[0];
  const showtime = format?.times[0];
  const seatMap = useSeatMapQuery(enabled ? showtime?.id : undefined).data;

  return useMemo(() => {
    if (!enabled || !movie || !theatre || !format || !showtime || !seatMap) return null;
    return buildTicket({
      id,
      selection: { movie, theatre, format, showtime, date },
      seatMap,
      seatIds: DEMO_SEATS,
      purchasedAt: date,
    });
  }, [enabled, id, date, movie, theatre, format, showtime, seatMap]);
}
